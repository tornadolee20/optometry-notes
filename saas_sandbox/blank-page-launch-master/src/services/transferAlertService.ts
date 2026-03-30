import { supabase } from '@/integrations/supabase/client';

/**
 * Send a Telegram notification for ownership transfer events.
 * Reads chat_id from system_settings; silently fails if not configured.
 */
export const sendTransferAlert = async (params: {
  type: 'initiated' | 'accepted';
  storeName: string;
  fromEmail: string;
  toEmail: string;
}) => {
  try {
    // Read Telegram chat_id from system settings
    const { data: settings } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'telegram_alerts')
      .single();

    const chatId = (settings?.setting_value as any)?.chat_id;
    if (!chatId) return; // Telegram not configured, skip silently

    const icon = params.type === 'initiated' ? '📤' : '✅';
    const action = params.type === 'initiated' ? '已發起管理權轉移' : '已接受管理權轉移';

    const message =
      `${icon} <b>店家管理權轉移</b>\n\n` +
      `<b>動作：</b>${action}\n` +
      `<b>店家：</b>${params.storeName}\n` +
      `<b>原老闆：</b>${params.fromEmail}\n` +
      `<b>新老闆：</b>${params.toEmail}\n\n` +
      `<i>${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</i>`;

    await supabase.functions.invoke('telegram-send-alert', {
      body: {
        chat_id: chatId,
        title: '店家管理權轉移',
        message,
        severity: 'warning',
      },
    });
  } catch (err) {
    // Non-critical: don't block the main flow
    console.warn('Transfer Telegram alert failed (non-critical):', err);
  }
};
