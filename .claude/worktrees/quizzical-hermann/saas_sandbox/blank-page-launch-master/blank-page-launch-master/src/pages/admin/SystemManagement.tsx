import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPageWrapper, AdminPageHeader } from '@/components/admin/AdminPageWrapper';
import { AdminCard, AdminCardHeader, AdminCardContent } from '@/components/admin/AdminCard';
import { AdminButton } from '@/components/admin/AdminButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  FileText, Shield, Settings, Search, RotateCcw, Download, 
  CheckCircle, AlertTriangle, XCircle, Info, Database,
  Save, Users
} from 'lucide-react';

// ========== Activity Logs Tab ==========
const ActivityLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({ variant: 'destructive', title: '錯誤', description: '無法載入活動日誌' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    !searchTerm || 
    log.activity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportLogs = () => {
    const csvContent = [
      ['時間', '類型', '描述', '實體類型', '實體ID'],
      ...filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString('zh-TW'),
        log.activity_type,
        log.description || '',
        log.entity_type,
        log.entity_id
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getSeverityIcon = (type: string) => {
    if (type.includes('delete') || type.includes('error')) return <XCircle className="h-4 w-4 text-destructive" />;
    if (type.includes('warning') || type.includes('suspend')) return <AlertTriangle className="h-4 w-4 text-warning" />;
    if (type.includes('create') || type.includes('success')) return <CheckCircle className="h-4 w-4 text-primary" />;
    return <Info className="h-4 w-4 text-muted-foreground" />;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜尋日誌..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <AdminButton variant="outline" size="sm" onClick={fetchLogs} icon={RotateCcw}>刷新</AdminButton>
        <AdminButton variant="outline" size="sm" onClick={exportLogs} icon={Download}>匯出</AdminButton>
      </div>

      <div className="text-sm text-muted-foreground">共 {filteredLogs.length} 筆記錄</div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>尚無活動日誌記錄</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors">
              <div className="mt-0.5">{getSeverityIcon(log.activity_type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground">{log.activity_type}</span>
                  <Badge variant="outline" className="text-xs">{log.entity_type}</Badge>
                </div>
                {log.description && <p className="text-sm text-muted-foreground">{log.description}</p>}
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {new Date(log.created_at).toLocaleString('zh-TW')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ========== Settings Tab ==========
const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    general: { site_name: 'Review Quickly', contact_email: '', maintenance_mode: false },
    notifications: { new_store_alert: true, subscription_alert: true, error_alert: true },
    features: { allow_registration: true, auto_approve_stores: false },
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from('system_settings').select('*');
      if (error) throw error;
      if (data) {
        const loaded = { ...settings };
        data.forEach(s => {
          const val = s.setting_value as any;
          if (s.setting_key === 'general_config' && val) loaded.general = { ...loaded.general, ...val };
          if (s.setting_key === 'notifications_config' && val) loaded.notifications = { ...loaded.notifications, ...val };
          if (s.setting_key === 'features_config' && val) loaded.features = { ...loaded.features, ...val };
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
      const updates = [
        { setting_key: 'general_config', setting_value: settings.general, setting_type: 'general' },
        { setting_key: 'notifications_config', setting_value: settings.notifications, setting_type: 'notifications' },
        { setting_key: 'features_config', setting_value: settings.features, setting_type: 'features' },
      ];
      for (const u of updates) {
        const { error } = await supabase.from('system_settings').upsert(u, { onConflict: 'setting_key' });
        if (error) throw error;
      }
      toast({ title: '成功', description: '系統設定已儲存' });
    } catch (error) {
      toast({ variant: 'destructive', title: '錯誤', description: '儲存設定時發生錯誤' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminCard>
        <AdminCardHeader title="一般設定" icon={<Settings className="w-5 h-5 text-muted-foreground" />} />
        <AdminCardContent>
          <div className="grid gap-4 max-w-lg">
            <div>
              <Label>站台名稱</Label>
              <Input value={settings.general.site_name} onChange={(e) => setSettings(p => ({ ...p, general: { ...p.general, site_name: e.target.value } }))} />
            </div>
            <div>
              <Label>聯絡信箱</Label>
              <Input value={settings.general.contact_email} onChange={(e) => setSettings(p => ({ ...p, general: { ...p.general, contact_email: e.target.value } }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>維護模式</Label>
              <Switch checked={settings.general.maintenance_mode} onCheckedChange={(v) => setSettings(p => ({ ...p, general: { ...p.general, maintenance_mode: v } }))} />
            </div>
          </div>
        </AdminCardContent>
      </AdminCard>

      <AdminCard>
        <AdminCardHeader title="通知設定" icon={<Info className="w-5 h-5 text-muted-foreground" />} />
        <AdminCardContent>
          <div className="space-y-3 max-w-lg">
            {[
              { key: 'new_store_alert' as const, label: '新店家通知' },
              { key: 'subscription_alert' as const, label: '訂閱變更通知' },
              { key: 'error_alert' as const, label: '錯誤警報通知' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <Label>{item.label}</Label>
                <Switch checked={settings.notifications[item.key]} onCheckedChange={(v) => setSettings(p => ({ ...p, notifications: { ...p.notifications, [item.key]: v } }))} />
              </div>
            ))}
          </div>
        </AdminCardContent>
      </AdminCard>

      <AdminCard>
        <AdminCardHeader title="功能設定" icon={<Database className="w-5 h-5 text-muted-foreground" />} />
        <AdminCardContent>
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center justify-between">
              <Label>允許註冊</Label>
              <Switch checked={settings.features.allow_registration} onCheckedChange={(v) => setSettings(p => ({ ...p, features: { ...p.features, allow_registration: v } }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>自動核准新店家</Label>
              <Switch checked={settings.features.auto_approve_stores} onCheckedChange={(v) => setSettings(p => ({ ...p, features: { ...p.features, auto_approve_stores: v } }))} />
            </div>
          </div>
        </AdminCardContent>
      </AdminCard>

      <AdminButton onClick={saveSettings} disabled={isLoading} icon={Save}>
        {isLoading ? '儲存中...' : '儲存設定'}
      </AdminButton>
    </div>
  );
};

// ========== Permissions Tab ==========
const PermissionsTab: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role, is_active, last_login_at, created_at')
        .in('role', ['admin', 'super_admin', 'manager'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      toast({ title: '權限已更新' });
      loadUsers();
    } catch (error) {
      toast({ variant: 'destructive', title: '更新失敗' });
    }
  };

  const filteredUsers = users.filter(u =>
    !searchTerm || u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors: Record<string, string> = { super_admin: 'destructive', admin: 'default', manager: 'secondary' };
  const roleNames: Record<string, string> = { super_admin: '超級管理員', admin: '管理員', manager: '經理' };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="搜尋用戶..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
      </div>

      <div className="text-sm text-muted-foreground">共 {filteredUsers.length} 位管理人員</div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {(user.name?.[0] || user.email[0]).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{user.name || '未設置'}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={roleColors[user.role] as any || 'secondary'}>{roleNames[user.role] || user.role}</Badge>
              <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, v)}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">超級管理員</SelectItem>
                  <SelectItem value="admin">管理員</SelectItem>
                  <SelectItem value="manager">經理</SelectItem>
                  <SelectItem value="user">一般用戶</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>沒有找到符合條件的用戶</p>
        </div>
      )}
    </div>
  );
};

// ========== Main Component ==========
const SystemManagement: React.FC = () => {
  return (
    <AdminPageWrapper>
      <AdminPageHeader title="系統管理" description="活動日誌、系統設定與權限管理" />

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            活動日誌
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            系統設定
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            權限管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <ActivityLogsTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsTab />
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  );
};

export default SystemManagement;
