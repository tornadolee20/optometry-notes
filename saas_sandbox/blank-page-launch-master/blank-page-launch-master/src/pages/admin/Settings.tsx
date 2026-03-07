import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  RefreshCw, 
  Settings as SettingsIcon,
  Users,
  Mail,
  Shield,
  Bell,
  Palette,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Check,
  X
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SystemSettings {
  general: {
    site_name: string;
    site_description: string;
    contact_email: string;
    timezone: string;
    language: string;
    maintenance_mode: boolean;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    from_email: string;
    from_name: string;
  };
  security: {
    password_min_length: number;
    session_timeout: number;
    max_login_attempts: number;
    require_2fa: boolean;
    ip_whitelist: string[];
  };
  notifications: {
    email_notifications: boolean;
    new_store_alert: boolean;
    subscription_alert: boolean;
    error_alert: boolean;
    daily_report: boolean;
    industry_performance_reports: boolean;
  };
  features: {
    allow_registration: boolean;
    auto_approve_stores: boolean;
    keyword_limit_basic: number;
    keyword_limit_premium: number;
    keyword_limit_enterprise: number;
    enable_industry_awareness: boolean;
  };
}

interface AdminUser {
  id: string;
  email: string;
  created_at: string | null;
  last_login: string | null;
  is_super_admin: boolean;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      site_name: 'Review System',
      site_description: '店家評論管理系統',
      contact_email: 'admin@example.com',
      timezone: 'Asia/Taipei',
      language: 'zh-TW',
      maintenance_mode: false,
    },
    email: {
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      from_email: '',
      from_name: '',
    },
    security: {
      password_min_length: 8,
      session_timeout: 24,
      max_login_attempts: 5,
      require_2fa: false,
      ip_whitelist: [],
    },
    notifications: {
      email_notifications: true,
      new_store_alert: true,
      subscription_alert: true,
      error_alert: true,
      daily_report: false,
      industry_performance_reports: true,
    },
    features: {
      allow_registration: true,
      auto_approve_stores: false,
      keyword_limit_basic: 25,
      keyword_limit_premium: 100,
      keyword_limit_enterprise: 500,
      enable_industry_awareness: true,
    },
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [ipToAdd, setIpToAdd] = useState('');
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editingRole, setEditingRole] = useState<string>('');

  useEffect(() => {
    loadSettings();
    loadAdminUsers();
  }, []);

  const loadSettings = async () => {
    try {
      // 從資料庫載入系統設定
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        // 合併所有設定到一個物件
        const loadedSettings = { ...settings };
        
        data.forEach(setting => {
          const value = setting.setting_value as any;
          switch(setting.setting_key) {
            case 'general_config':
              if (value && typeof value === 'object') {
                loadedSettings.general = { ...loadedSettings.general, ...value };
              }
              break;
            case 'email_config':
              if (value && typeof value === 'object') {
                loadedSettings.email = { ...loadedSettings.email, ...value };
              }
              break;
            case 'security_config':
              if (value && typeof value === 'object') {
                loadedSettings.security = { ...loadedSettings.security, ...value };
              }
              break;
            case 'notifications_config':
              if (value && typeof value === 'object') {
                loadedSettings.notifications = { ...loadedSettings.notifications, ...value };
              }
              break;
            case 'features_config':
              if (value && typeof value === 'object') {
                loadedSettings.features = { ...loadedSettings.features, ...value };
              }
              break;
          }
        });
        
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: '無法載入系統設定'
      });
    }
  };

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role, created_at, last_login_at')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 轉換為AdminUser格式
      const adminUsers: AdminUser[] = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_login: user.last_login_at,
        is_super_admin: user.role === 'super_admin'
      }));

      setAdminUsers(adminUsers);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: '無法載入管理員列表'
      });
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // 儲存各個設定到資料庫
      const updates = [
        {
          setting_key: 'general_config',
          setting_value: settings.general,
          setting_type: 'general'
        },
        {
          setting_key: 'email_config',
          setting_value: settings.email,
          setting_type: 'email'
        },
        {
          setting_key: 'security_config',
          setting_value: settings.security,
          setting_type: 'security'
        },
        {
          setting_key: 'notifications_config',
          setting_value: settings.notifications,
          setting_type: 'notifications'
        },
        {
          setting_key: 'features_config',
          setting_value: settings.features,
          setting_type: 'features'
        }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(update, { 
            onConflict: 'setting_key',
            ignoreDuplicates: false 
          });

        if (error) throw error;
      }

      toast({
        title: '成功',
        description: '系統設定已儲存'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: '儲存設定時發生錯誤'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail) return;

    try {
      // 先檢查用戶是否存在
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', newAdminEmail)
        .single();

      if (existingUser) {
        // 更新現有用戶角色為admin
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', existingUser.id);

        if (updateError) throw updateError;
      } else {
        // 創建新的管理員用戶記錄
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ 
            email: newAdminEmail, 
            role: 'admin',
            name: newAdminEmail.split('@')[0] 
          }]);

        if (insertError) throw insertError;
      }

      toast({
        title: '成功',
        description: '管理員已新增'
      });

      setNewAdminEmail('');
      loadAdminUsers();
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: error.message || '新增管理員時發生錯誤'
      });
    }
  };

  const editAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditingRole(admin.is_super_admin ? 'super_admin' : 'admin');
  };

  const saveAdminEdit = async () => {
    if (!editingAdmin) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: editingRole })
        .eq('id', editingAdmin.id);

      if (error) throw error;

      toast({
        title: '成功',
        description: '管理員權限已更新'
      });

      setEditingAdmin(null);
      setEditingRole('');
      loadAdminUsers();
    } catch (error: any) {
      console.error('Error updating admin role:', error);
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: '更新管理員權限時發生錯誤'
      });
    }
  };

  const cancelEdit = () => {
    setEditingAdmin(null);
    setEditingRole('');
  };

  const removeAdmin = async (adminId: string) => {
    if (!confirm('確定要移除此管理員嗎？')) return;

    try {
      // 將用戶角色改為一般用戶，而不是刪除帳號
      const { error } = await supabase
        .from('users')
        .update({ role: 'user' })
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: '成功',
        description: '管理員權限已移除'
      });

      loadAdminUsers();
    } catch (error: any) {
      console.error('Error removing admin:', error);
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: '移除管理員時發生錯誤'
      });
    }
  };

  const addIpToWhitelist = () => {
    if (!ipToAdd || settings.security.ip_whitelist.includes(ipToAdd)) return;

    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        ip_whitelist: [...prev.security.ip_whitelist, ipToAdd]
      }
    }));
    setIpToAdd('');
  };

  const removeIpFromWhitelist = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        ip_whitelist: prev.security.ip_whitelist.filter(item => item !== ip)
      }
    }));
  };

  const updateGeneralSetting = (key: keyof SystemSettings['general'], value: any) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, [key]: value }
    }));
  };

  const updateEmailSetting = (key: keyof SystemSettings['email'], value: any) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }));
  };

  const updateSecuritySetting = (key: keyof SystemSettings['security'], value: any) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [key]: value }
    }));
  };

  const updateNotificationSetting = (key: keyof SystemSettings['notifications'], value: any) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const updateFeatureSetting = (key: keyof SystemSettings['features'], value: any) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, [key]: value }
    }));
  };

  return (
    <div className="p-8 space-y-6">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系統設定</h1>
          <p className="text-gray-600">管理系統的各項設定和配置</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重新載入
          </Button>
          <Button onClick={saveSettings} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? '儲存中...' : '儲存設定'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            一般設定
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            郵件設定
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            安全設定
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            通知設定
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            功能設定
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            管理員
          </TabsTrigger>
        </TabsList>

        {/* 一般設定 */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>一般設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">網站名稱</Label>
                  <Input
                    id="siteName"
                    value={settings.general.site_name}
                    onChange={(e) => updateGeneralSetting('site_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">聯絡信箱</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.general.contact_email}
                    onChange={(e) => updateGeneralSetting('contact_email', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">網站描述</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.site_description}
                  onChange={(e) => updateGeneralSetting('site_description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">時區</Label>
                  <Select value={settings.general.timezone} onValueChange={(value) => updateGeneralSetting('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Taipei">Asia/Taipei</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">語言</Label>
                  <Select value={settings.general.language} onValueChange={(value) => updateGeneralSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-TW">繁體中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.general.maintenance_mode}
                  onCheckedChange={(checked) => updateGeneralSetting('maintenance_mode', checked)}
                />
                <Label htmlFor="maintenanceMode">維護模式</Label>
                {settings.general.maintenance_mode && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    維護中
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 郵件設定 */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>郵件設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP 主機</Label>
                  <Input
                    id="smtpHost"
                    value={settings.email.smtp_host}
                    onChange={(e) => updateEmailSetting('smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP 埠號</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.email.smtp_port}
                    onChange={(e) => updateEmailSetting('smtp_port', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP 使用者名稱</Label>
                  <Input
                    id="smtpUsername"
                    value={settings.email.smtp_username}
                    onChange={(e) => updateEmailSetting('smtp_username', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP 密碼</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.email.smtp_password}
                    onChange={(e) => updateEmailSetting('smtp_password', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">寄件者信箱</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.email.from_email}
                    onChange={(e) => updateEmailSetting('from_email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">寄件者名稱</Label>
                  <Input
                    id="fromName"
                    value={settings.email.from_name}
                    onChange={(e) => updateEmailSetting('from_name', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全設定 */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>安全設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">最短密碼長度</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.password_min_length}
                    onChange={(e) => updateSecuritySetting('password_min_length', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">會話逾時 (小時)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.session_timeout}
                    onChange={(e) => updateSecuritySetting('session_timeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">最大登入嘗試次數</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.max_login_attempts}
                    onChange={(e) => updateSecuritySetting('max_login_attempts', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="require2FA"
                  checked={settings.security.require_2fa}
                  onCheckedChange={(checked) => updateSecuritySetting('require_2fa', checked)}
                />
                <Label htmlFor="require2FA">強制雙重驗證</Label>
              </div>

              <div className="space-y-4">
                <Label>IP 白名單</Label>
                <div className="flex gap-2">
                  <Input
                    value={ipToAdd}
                    onChange={(e) => setIpToAdd(e.target.value)}
                    placeholder="輸入 IP 地址"
                  />
                  <Button onClick={addIpToWhitelist}>
                    <Plus className="h-4 w-4 mr-2" />
                    新增
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.security.ip_whitelist.map((ip, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {ip}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => removeIpFromWhitelist(ip)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知設定 */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => {
                  const labels = {
                    email_notifications: '啟用郵件通知',
                    new_store_alert: '新店家註冊通知',
                    subscription_alert: '訂閱狀態變更通知',
                    error_alert: '系統錯誤通知',
                    daily_report: '每日報告',
                    industry_performance_reports: '行業績效報告'
                  };

                  return (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => updateNotificationSetting(key as keyof SystemSettings['notifications'], checked)}
                      />
                      <Label htmlFor={key}>{labels[key as keyof typeof labels]}</Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 功能設定 */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>功能設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowRegistration"
                    checked={settings.features.allow_registration}
                    onCheckedChange={(checked) => updateFeatureSetting('allow_registration', checked)}
                  />
                  <Label htmlFor="allowRegistration">允許新用戶註冊</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoApproveStores"
                    checked={settings.features.auto_approve_stores}
                    onCheckedChange={(checked) => updateFeatureSetting('auto_approve_stores', checked)}
                  />
                  <Label htmlFor="autoApproveStores">自動審核新店家註冊</Label>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">🎯 行業感知功能</h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <Switch
                      id="enableIndustryAwareness"
                      checked={settings.features.enable_industry_awareness}
                      onCheckedChange={(checked) => updateFeatureSetting('enable_industry_awareness', checked)}
                    />
                    <Label htmlFor="enableIndustryAwareness">啟用行業感知評論生成</Label>
                  </div>
                  <p className="text-sm text-blue-700">
                    自動根據店家行業類型生成符合該行業特色的評論內容，提高評論的真實度和相關性。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 管理員管理 */}
        <TabsContent value="admins">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>新增管理員</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="輸入管理員信箱"
                    type="email"
                  />
                  <Button onClick={addAdmin}>
                    <Plus className="h-4 w-4 mr-2" />
                    新增管理員
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>管理員列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminUsers.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{admin.email}</h4>
                          {editingAdmin?.id === admin.id ? (
                            <Select value={editingRole} onValueChange={setEditingRole}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">管理員</SelectItem>
                                <SelectItem value="super_admin">超級管理員</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            admin.is_super_admin && (
                              <Badge variant="outline">超級管理員</Badge>
                            )
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          建立時間: {admin.created_at ? new Date(admin.created_at).toLocaleDateString('zh-TW') : '未知'}
                          {admin.last_login && (
                            <span> • 最後登入: {new Date(admin.last_login).toLocaleDateString('zh-TW')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {editingAdmin?.id === admin.id ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={saveAdminEdit}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              保存
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4 mr-2" />
                              取消
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => editAdmin(admin)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              編輯
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeAdmin(admin.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              移除
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;