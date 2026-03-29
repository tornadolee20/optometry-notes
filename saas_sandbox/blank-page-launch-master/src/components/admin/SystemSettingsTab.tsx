import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { AdminCard, AdminCardHeader, AdminCardContent } from '@/components/admin/AdminCard';
import { AdminButton } from '@/components/admin/AdminButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Settings, Info, Database, Save } from 'lucide-react';

interface SystemSettings {
  general: { site_name: string; contact_email: string; maintenance_mode: boolean };
  notifications: { new_store_alert: boolean; subscription_alert: boolean; error_alert: boolean };
  features: { allow_registration: boolean; auto_approve_stores: boolean };
}

const DEFAULT_SETTINGS: SystemSettings = {
  general: { site_name: 'Myownreviews', contact_email: '', maintenance_mode: false },
  notifications: { new_store_alert: true, subscription_alert: true, error_alert: true },
  features: { allow_registration: true, auto_approve_stores: false },
};

const SettingRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    {children}
  </div>
);

export const SystemSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({ ...DEFAULT_SETTINGS });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from('system_settings').select('*');
      if (error) throw error;
      if (data) {
        const loaded = { ...DEFAULT_SETTINGS };
        data.forEach(s => {
          const val = s.setting_value as Record<string, unknown>;
          if (s.setting_key === 'general_config' && val) loaded.general = { ...loaded.general, ...val } as SystemSettings['general'];
          if (s.setting_key === 'notifications_config' && val) loaded.notifications = { ...loaded.notifications, ...val } as SystemSettings['notifications'];
          if (s.setting_key === 'features_config' && val) loaded.features = { ...loaded.features, ...val } as SystemSettings['features'];
        });
        setSettings(loaded);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const updates: Array<{ setting_key: string; setting_value: Json; setting_type: string }> = [
        { setting_key: 'general_config', setting_value: settings.general as unknown as Json, setting_type: 'general' },
        { setting_key: 'notifications_config', setting_value: settings.notifications as unknown as Json, setting_type: 'notifications' },
        { setting_key: 'features_config', setting_value: settings.features as unknown as Json, setting_type: 'features' },
      ];
      for (const u of updates) {
        const { error } = await supabase.from('system_settings').upsert(u, { onConflict: 'setting_key' });
        if (error) throw error;
      }
      toast({ title: '成功', description: '系統設定已儲存' });
    } catch (error) {
      toast({ variant: 'destructive', title: '錯誤', description: '儲存設定時發生錯誤' });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-4">
      <AdminCard variant="elevated">
        <AdminCardHeader title="一般設定" icon={<Settings className="w-4 h-4 text-primary" />} />
        <AdminCardContent>
          <div className="max-w-lg space-y-1">
            <SettingRow label="站台名稱">
              <Input value={settings.general.site_name} onChange={(e) => setSettings(p => ({ ...p, general: { ...p.general, site_name: e.target.value } }))} className="w-48 h-8 text-sm" />
            </SettingRow>
            <SettingRow label="聯絡信箱">
              <Input value={settings.general.contact_email} onChange={(e) => setSettings(p => ({ ...p, general: { ...p.general, contact_email: e.target.value } }))} className="w-48 h-8 text-sm" placeholder="admin@example.com" />
            </SettingRow>
            <SettingRow label="維護模式">
              <Switch checked={settings.general.maintenance_mode} onCheckedChange={(v) => setSettings(p => ({ ...p, general: { ...p.general, maintenance_mode: v } }))} />
            </SettingRow>
          </div>
        </AdminCardContent>
      </AdminCard>

      <AdminCard variant="elevated">
        <AdminCardHeader title="通知設定" icon={<Info className="w-4 h-4 text-primary" />} />
        <AdminCardContent>
          <div className="max-w-lg space-y-1">
            {([
              { key: 'new_store_alert' as const, label: '新店家通知' },
              { key: 'subscription_alert' as const, label: '訂閱變更通知' },
              { key: 'error_alert' as const, label: '錯誤警報通知' },
            ]).map(item => (
              <SettingRow key={item.key} label={item.label}>
                <Switch checked={settings.notifications[item.key]} onCheckedChange={(v) => setSettings(p => ({ ...p, notifications: { ...p.notifications, [item.key]: v } }))} />
              </SettingRow>
            ))}
          </div>
        </AdminCardContent>
      </AdminCard>

      <AdminCard variant="elevated">
        <AdminCardHeader title="功能設定" icon={<Database className="w-4 h-4 text-primary" />} />
        <AdminCardContent>
          <div className="max-w-lg space-y-1">
            <SettingRow label="允許註冊">
              <Switch checked={settings.features.allow_registration} onCheckedChange={(v) => setSettings(p => ({ ...p, features: { ...p.features, allow_registration: v } }))} />
            </SettingRow>
            <SettingRow label="自動核准新店家">
              <Switch checked={settings.features.auto_approve_stores} onCheckedChange={(v) => setSettings(p => ({ ...p, features: { ...p.features, auto_approve_stores: v } }))} />
            </SettingRow>
          </div>
        </AdminCardContent>
      </AdminCard>

      <AdminButton onClick={saveSettings} loading={isLoading} loadingText="儲存中..." icon={Save}>
        儲存設定
      </AdminButton>
    </div>
  );
};
