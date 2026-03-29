// Proactive error-rate monitor for generate-review Edge Function
// Tracks 401/429/5xx responses in a 5-minute sliding window.
// When error ratio exceeds threshold, writes to monitoring_alerts
// and calls an optional notification hook (Email / LINE ready).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Default configuration (overridden by system_settings) ────
const WINDOW_MS = 5 * 60 * 1000;        // 5-minute sliding window
let ERROR_RATIO_THRESHOLD = 0.3;         // alert when >30% of requests are errors
let MIN_REQUESTS_FOR_ALERT = 5;          // need at least 5 requests to evaluate
let ALERT_COOLDOWN_MS = 15 * 60 * 1000;  // suppress duplicate alerts for 15 min
let configLoaded = false;

async function loadAlertThresholds() {
  if (configLoaded) return;
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) return;

    const supabase = createClient(url, serviceKey);
    const { data } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'telegram_alert_config')
      .maybeSingle();

    if (data?.setting_value) {
      const val = data.setting_value as Record<string, unknown>;
      if (val.error_ratio_threshold) ERROR_RATIO_THRESHOLD = Number(val.error_ratio_threshold) / 100;
      if (val.min_requests_for_alert) MIN_REQUESTS_FOR_ALERT = Number(val.min_requests_for_alert);
      if (val.alert_cooldown_minutes) ALERT_COOLDOWN_MS = Number(val.alert_cooldown_minutes) * 60 * 1000;
    }
    configLoaded = true;
  } catch {
    // Use defaults on failure
  }
}

// ── In-memory sliding window (per isolate) ───────────────────
interface RequestRecord {
  timestamp: number;
  status: number;
}

const requestLog: RequestRecord[] = [];
let lastAlertAt = 0;

function pruneOldEntries(now: number) {
  const cutoff = now - WINDOW_MS;
  while (requestLog.length > 0 && requestLog[0].timestamp < cutoff) {
    requestLog.shift();
  }
}

// ── Public API ───────────────────────────────────────────────

/** Record a response status code into the sliding window. */
export function recordResponse(status: number) {
  const now = Date.now();
  requestLog.push({ timestamp: now, status });
  pruneOldEntries(now);
}

/** Check error ratio and fire alert if threshold exceeded. */
export async function evaluateAndAlert(functionName: string) {
  await loadAlertThresholds();
  const now = Date.now();
  pruneOldEntries(now);

  if (requestLog.length < MIN_REQUESTS_FOR_ALERT) return;

  const errorCount = requestLog.filter(
    (r) => r.status === 401 || r.status === 429 || r.status >= 500
  ).length;
  const errorRatio = errorCount / requestLog.length;

  if (errorRatio <= ERROR_RATIO_THRESHOLD) return;

  // Cooldown check — avoid spamming alerts
  if (now - lastAlertAt < ALERT_COOLDOWN_MS) return;
  lastAlertAt = now;

  // Build alert details
  const statusBreakdown: Record<string, number> = {};
  for (const r of requestLog) {
    const key = String(r.status);
    statusBreakdown[key] = (statusBreakdown[key] || 0) + 1;
  }

  const alertPayload = {
    id: `err-rate-${functionName}-${now}`,
    type: 'error_rate_spike',
    severity: errorRatio > 0.6 ? 'critical' : 'warning',
    source: functionName,
    title: `${functionName} error rate spike: ${(errorRatio * 100).toFixed(1)}%`,
    message: `In the last 5 minutes, ${errorCount}/${requestLog.length} requests returned error status codes. Breakdown: ${JSON.stringify(statusBreakdown)}`,
    is_active: true,
    metadata: {
      error_ratio: errorRatio,
      total_requests: requestLog.length,
      error_count: errorCount,
      status_breakdown: statusBreakdown,
      window_start: new Date(now - WINDOW_MS).toISOString(),
      window_end: new Date(now).toISOString(),
    },
  };

  try {
    await writeAlert(alertPayload);
    console.warn(`[AlertMonitor] Alert fired: ${alertPayload.title}`);

    // Notification hook — extend here for Email / LINE / Slack
    await notifyHook(alertPayload);
  } catch (err) {
    // Fire-and-forget: never let monitoring break the main flow
    console.error('[AlertMonitor] Failed to write alert:', err);
  }
}

// ── Internal: write to monitoring_alerts via service role ─────
async function writeAlert(payload: Record<string, unknown>) {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return;

  const supabase = createClient(url, serviceKey);
  const { error } = await supabase.from('monitoring_alerts').upsert(payload, {
    onConflict: 'id',
  });
  if (error) {
    console.error('[AlertMonitor] DB write error:', error.message);
  }
}

// ── Notification hook: Telegram Bot ──────────────────────────
// Reads config from system_settings, sends alert via connector gateway.
const TELEGRAM_GATEWAY = 'https://connector-gateway.lovable.dev/telegram';

async function loadTelegramConfig(): Promise<{
  enabled: boolean;
  chatId: string;
  notifyCriticalOnly: boolean;
} | null> {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return null;

  const supabase = createClient(url, serviceKey);
  const { data, error } = await supabase
    .from('system_settings')
    .select('setting_value')
    .eq('setting_key', 'telegram_alert_config')
    .maybeSingle();

  if (error || !data?.setting_value) {
    // Fallback to hardcoded defaults
    return { enabled: true, chatId: '8005743631', notifyCriticalOnly: false };
  }

  const val = data.setting_value as Record<string, unknown>;
  return {
    enabled: val.enabled !== false,
    chatId: String(val.chat_id || '8005743631'),
    notifyCriticalOnly: Boolean(val.notify_on_critical_only),
  };
}

async function notifyHook(alert: Record<string, unknown>) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');

  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
    console.warn('[AlertMonitor] Telegram keys not configured, skipping notification');
    return;
  }

  const config = await loadTelegramConfig();
  if (!config || !config.enabled) return;

  // Check critical-only filter
  if (config.notifyCriticalOnly && alert.severity !== 'critical') return;

  const severity = alert.severity === 'critical' ? '\uD83D\uDD34' : '\uD83D\uDFE1';
  const meta = alert.metadata as Record<string, unknown> | undefined;
  const breakdown = meta?.status_breakdown
    ? JSON.stringify(meta.status_breakdown)
    : 'N/A';

  const text =
    `${severity} <b>System Alert</b>\n\n` +
    `<b>${alert.title}</b>\n\n` +
    `Error rate: ${meta?.error_ratio ? ((meta.error_ratio as number) * 100).toFixed(1) + '%' : 'N/A'}\n` +
    `Errors: ${meta?.error_count ?? '?'} / ${meta?.total_requests ?? '?'}\n` +
    `Status breakdown: ${breakdown}\n` +
    `Window: ${meta?.window_start ?? ''} ~ ${meta?.window_end ?? ''}\n` +
    `Severity: ${String(alert.severity).toUpperCase()}`;

  try {
    const res = await fetch(`${TELEGRAM_GATEWAY}/sendMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TELEGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[AlertMonitor] Telegram send failed [${res.status}]: ${errBody}`);
    } else {
      console.log('[AlertMonitor] Telegram alert sent successfully');
    }
  } catch (err) {
    console.error('[AlertMonitor] Telegram notification error:', err);
  }
}
