// Rate limiting utility using atomic Postgres function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Rate limiting configuration
const RATE_LIMITS: Record<string, { maxRequests: number; windowMinutes: number; blockDurationMinutes: number }> = {
  'generate-review': {
    maxRequests: 20,
    windowMinutes: 15,
    blockDurationMinutes: 60
  }
};

const getSupabaseServiceClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration for rate limiting');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetTime?: Date;
  error?: string;
}

export async function checkRateLimit(
  functionName: string,
  origin?: string,
  ipAddress?: string
): Promise<RateLimitResult> {
  try {
    const config = RATE_LIMITS[functionName];
    if (!config) {
      return { allowed: true };
    }

    if (!origin && !ipAddress) {
      return { allowed: true };
    }

    const supabase = getSupabaseServiceClient();

    // Single atomic RPC call — no TOCTOU race
    const { data, error } = await supabase.rpc('check_and_increment_rate_limit', {
      _function_name: functionName,
      _origin: origin || null,
      _ip_address: ipAddress || null,
      _max_requests: config.maxRequests,
      _window_minutes: config.windowMinutes,
      _block_duration_minutes: config.blockDurationMinutes,
    });

    if (error) {
      console.error('Rate limit RPC error:', error.message);
      return { allowed: true }; // fail-open
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return { allowed: true };
    }

    return {
      allowed: row.allowed,
      remaining: row.remaining ?? 0,
      resetTime: row.reset_time ? new Date(row.reset_time) : undefined,
      error: row.error_message || undefined,
    };
  } catch (err) {
    console.error('Rate limiting error:', err);
    return { allowed: true }; // fail-open
  }
}

// Extract IP address from request headers
export function getClientIP(request: Request): string | undefined {
  const preferredHeaders = [
    'cf-connecting-ip',
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];

  for (const header of preferredHeaders) {
    const value = request.headers.get(header);
    if (value) {
      const ip = value.split(',')[0].trim();
      if (ip && ip !== 'unknown' && isValidIP(ip)) {
        return ip;
      }
    }
  }

  return undefined;
}

function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}
