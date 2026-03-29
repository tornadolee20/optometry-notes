import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { AdminCard, AdminCardHeader, AdminCardContent } from '@/components/admin/AdminCard';
import { AdminButton } from '@/components/admin/AdminButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Save, Send, MessageCircle, Gauge } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface TelegramSettings {
  enabled: boolean;
  chat_id: string;
  error_ratio_threshold: number;
  min_requests_for_alert: number;
  alert_cooldown_minutes: number;
  notify_on_critical_only: boolean;
}

const DEFAULT_SETTINGS: TelegramSettings = {
  enabled: true,
  chat_id: '8005743631',
  error_ratio_threshold: 30,
  min_requests_for_alert: 5,
  alert_cooldown_minutes: 15,
  notify_on_critical_only: false,
};

const TelegramAlertSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<TelegramSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'telegram_alert_config')
        .maybeSingle();

      if (error) throw error;
      if (data?.setting_value) {
        const val = data.setting_value as Record<string, unknown>;
        setSettings({
          enabled: val.enabled !== false,
          chat_id: String(val.chat_id || DEFAULT_SETTINGS.chat_id),
          error_ratio_threshold: Number(val.error_ratio_threshold ?? DEFAULT_SETTINGS.error_ratio_threshold),
          min_requests_for_alert: Number(val.min_requests_for_alert ?? DEFAULT_SETTINGS.min_requests_for_alert),
          alert_cooldown_minutes: Number(val.alert_cooldown_minutes ?? DEFAULT_SETTINGS.alert_cooldown_minutes),
          notify_on_critical_only: Boolean(val.notify_on_critical_only),
        });
      }
    } catch (error) {
      console.error('Error loading telegram settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings.chat_id.trim()) {
      toast({ variant: 'destructive', title: '錯誤', description: 'Chat ID 為必填欄位' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        setting_key: 'telegram_alert_config',
        setting_type: 'telegram',
        setting_value: settings as unknown as Json,
        description: 'Telegram Bot alert configuration',
      };
      const { error } = await supabase.from('system_settings').upsert(
        [payload],
        { onConflict: 'setting_key' }
      );

      if (error) throw error;
      toast({ title: '已儲存', description: 'Telegram 告警設定已更新' });
    } catch (error) {
      console.error('Save error:', error);
      toast({ variant: 'destructive', title: '儲存失敗', description: '無法儲存設定' });
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestAlert = async () => {
    if (!settings.chat_id.trim()) {
      toast({ variant: 'destructive', title: '錯誤', description: '請先填寫 Chat ID' });
      return;
    }

    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-send-alert', {
        body: {
          chat_id: settings.chat_id,
          test: true,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({ title: '✅ 測試成功', description: '請檢查 Telegram 是否收到訊息' });
      } else {
        toast({ variant: 'destructive', title: '發送失敗', description: data?.error || '未知錯誤' });
      }
    } catch (error) {
      console.error('Test alert error:', error);
      toast({ variant: 'destructive', title: '測試失敗', description: '無法發送測試訊息' });
    } finally {
      setIsTesting(false);
    }
  };

  const SettingRow = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-border/50 last:border-0">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
        settings.enabled
          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
          : 'bg-muted/50 border-border/50 text-muted-foreground'
      }`}>
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm font-medium">
          {settings.enabled ? 'Telegram 告警已啟用' : 'Telegram 告警已停用'}
        </span>
        <Badge variant={settings.enabled ? 'default' : 'secondary'} className="text-[10px] ml-auto">
          {settings.enabled ? 'ACTIVE' : 'INACTIVE'}
        </Badge>
      </div>

      {/* Connection settings */}
      <AdminCard variant="elevated">
        <AdminCardHeader title="連線設定" icon={<MessageCircle className="w-4 h-4 text-primary" />} />
        <AdminCardContent>
          <div className="max-w-lg space-y-1">
            <SettingRow label="啟用 Telegram 告警" description="關閉後將不再透過 Telegram 發送告警">
              <Switch
                checked={settings.enabled}
                onCheckedChange={(v) => setSettings(p => ({ ...p, enabled: v }))}
              />
            </SettingRow>
            <SettingRow label="Chat ID" description="接收告警的 Telegram 聊天室 ID（個人或群組）">
              <Input
                value={settings.chat_id}
                onChange={(e) => setSettings(p => ({ ...p, chat_id: e.target.value }))}
                className="w-48 h-8 text-sm font-mono"
                placeholder="例：8005743631"
              />
            </SettingRow>
          </div>
        </AdminCardContent>
      </AdminCard>

      {/* Threshold settings */}
      <AdminCard variant="elevated">
        <AdminCardHeader title="告警閾值" icon={<Gauge className="w-4 h-4 text-primary" />} />
        <AdminCardContent>
          <div className="max-w-lg space-y-1">
            <SettingRow
              label={`錯誤率閾值：${settings.error_ratio_threshold}%`}
              description="5 分鐘內錯誤率超過此值時觸發告警"
            >
              <div className="w-48">
                <Slider
                  value={[settings.error_ratio_threshold]}
                  onValueChange={([v]) => setSettings(p => ({ ...p, error_ratio_threshold: v }))}
                  min={10}
                  max={80}
                  step={5}
                  className="w-full"
                />
              </div>
            </SettingRow>
            <SettingRow
              label={`最低請求數：${settings.min_requests_for_alert}`}
              description="視窗內至少需有此數量的請求才會評估錯誤率"
            >
              <div className="w-48">
                <Slider
                  value={[settings.min_requests_for_alert]}
                  onValueChange={([v]) => setSettings(p => ({ ...p, min_requests_for_alert: v }))}
                  min={3}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </SettingRow>
            <SettingRow
              label={`冷卻時間：${settings.alert_cooldown_minutes} 分鐘`}
              description="告警觸發後，在此期間內不會重複發送"
            >
              <div className="w-48">
                <Slider
                  value={[settings.alert_cooldown_minutes]}
                  onValueChange={([v]) => setSettings(p => ({ ...p, alert_cooldown_minutes: v }))}
                  min={5}
                  max={60}
                  step={5}
                  className="w-full"
                />
              </div>
            </SettingRow>
            <SettingRow label="僅 Critical 才推播" description="開啟後只有嚴重等級（>60%）才發 Telegram">
              <Switch
                checked={settings.notify_on_critical_only}
                onCheckedChange={(v) => setSettings(p => ({ ...p, notify_on_critical_only: v }))}
              />
            </SettingRow>
          </div>
        </AdminCardContent>
      </AdminCard>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <AdminButton onClick={saveSettings} loading={isSaving} loadingText="儲存中..." icon={Save}>
          儲存設定
        </AdminButton>
        <AdminButton
          variant="outline"
          onClick={sendTestAlert}
          loading={isTesting}
          loadingText="發送中..."
          icon={Send}
        >
          發送測試訊息
        </AdminButton>
      </div>
    </div>
  );
};

export { TelegramAlertSettingsTab };
