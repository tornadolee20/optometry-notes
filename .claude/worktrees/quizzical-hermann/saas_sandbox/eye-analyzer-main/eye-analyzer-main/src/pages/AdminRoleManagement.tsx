import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LanguageToggle } from '@/components/LanguageToggle';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, Shield, Users, Loader2, AlertTriangle, 
  Search, RefreshCw, Edit, GraduationCap, FileCheck, CheckCircle,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  optometrist_name?: string;
  clinic_name?: string;
  clinic_region?: string;
  optometrist_license_number?: string | null;
  // Combined license number for display
  displayLicenseNumber?: string | null;
  training_completed?: boolean;
  research_consent_signed?: boolean;
  research_qualified?: boolean;
  role: 'owner' | 'admin' | 'accountant' | 'support' | 'user';
  role_id?: string;
  // Contribution stats
  totalExams: number;
  thisYearExams: number;
  thisMonthExams: number;
}

type SortField = 'totalExams' | 'thisYearExams' | 'thisMonthExams' | 'optometrist_name';
type SortOrder = 'asc' | 'desc';

const ROLE_OPTIONS: { value: 'admin' | 'accountant' | 'support' | 'user'; labelZhTW: string; labelZhCN: string }[] = [
  { value: 'user', labelZhTW: '一般使用者', labelZhCN: '普通用户' },
  { value: 'support', labelZhTW: '客服', labelZhCN: '客服' },
  { value: 'accountant', labelZhTW: '會計', labelZhCN: '会计' },
  { value: 'admin', labelZhTW: '管理員', labelZhCN: '管理员' },
];

const AdminRoleManagement = () => {
  const { language } = useLanguage();
  const { isAdmin, isOwner } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('totalExams');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [editForm, setEditForm] = useState({
    optometrist_license_number: '',
    training_completed: false,
    research_consent_signed: false,
    research_qualified: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const t = (zhTW: string, zhCN: string) => language === 'zh-TW' ? zhTW : zhCN;

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('optometrist_profiles')
        .select('user_id, optometrist_name, clinic_name, clinic_region, created_at, optometrist_license_number, training_completed, research_consent_signed, research_qualified');

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, role');

      if (rolesError) throw rolesError;

      // Fetch all exam records for counting
      const { data: examRecords, error: examError } = await supabase
        .from('exam_records')
        .select('user_id, exam_date');

      if (examError) throw examError;

      // Calculate contribution stats per user
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM

      const examStats = new Map<string, { total: number; thisYear: number; thisMonth: number }>();
      examRecords?.forEach(record => {
        const userId = record.user_id;
        const examDate = record.exam_date;
        const examYear = parseInt(examDate.substring(0, 4));
        const examMonth = examDate.substring(0, 7);

        if (!examStats.has(userId)) {
          examStats.set(userId, { total: 0, thisYear: 0, thisMonth: 0 });
        }
        const stats = examStats.get(userId)!;
        stats.total++;
        if (examYear === currentYear) stats.thisYear++;
        if (examMonth === currentMonth) stats.thisMonth++;
      });

      // Map roles to users
      const roleMap = new Map<string, { role: 'owner' | 'admin' | 'accountant' | 'support' | 'user'; role_id: string }>();
      roles?.forEach(r => {
        roleMap.set(r.user_id, { role: r.role as 'owner' | 'admin' | 'accountant' | 'support' | 'user', role_id: r.id });
      });

      // Combine data
      const usersData: UserWithRole[] = profiles?.map(p => {
        const stats = examStats.get(p.user_id) || { total: 0, thisYear: 0, thisMonth: 0 };
        return {
          id: p.user_id,
          email: '',
          created_at: p.created_at,
          optometrist_name: p.optometrist_name,
          clinic_name: p.clinic_name,
          clinic_region: p.clinic_region,
          optometrist_license_number: p.optometrist_license_number,
          displayLicenseNumber: p.optometrist_license_number || null,
          training_completed: p.training_completed ?? false,
          research_consent_signed: p.research_consent_signed ?? false,
          research_qualified: p.research_qualified ?? false,
          role: roleMap.get(p.user_id)?.role || 'user',
          role_id: roleMap.get(p.user_id)?.role_id,
          totalExams: stats.total,
          thisYearExams: stats.thisYear,
          thisMonthExams: stats.thisMonth,
        };
      }) || [];

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
      toast({
        title: language === 'zh-TW' ? '載入失敗' : '加载失败',
        description: language === 'zh-TW' ? '無法載入使用者資料' : '无法加载用户数据',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, loadUsers]);

  // Filter and sort users
  useEffect(() => {
    let result = [...users];
    
    // Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.optometrist_name?.toLowerCase().includes(term) ||
        u.clinic_name?.toLowerCase().includes(term) ||
        u.clinic_region?.toLowerCase().includes(term) ||
        u.displayLicenseNumber?.toLowerCase().includes(term)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'totalExams':
          aVal = a.totalExams;
          bVal = b.totalExams;
          break;
        case 'thisYearExams':
          aVal = a.thisYearExams;
          bVal = b.thisYearExams;
          break;
        case 'thisMonthExams':
          aVal = a.thisMonthExams;
          bVal = b.thisMonthExams;
          break;
        case 'optometrist_name':
          aVal = a.optometrist_name || '';
          bVal = b.optometrist_name || '';
          break;
      }
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredUsers(result);
  }, [searchTerm, users, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'accountant' | 'support' | 'user', currentRoleId?: string) => {
    if (!isOwner) {
      toast({
        title: t('權限不足', '权限不足'),
        description: t('只有系統擁有者可以修改角色', '只有系统拥有者可以修改角色'),
        variant: 'destructive',
      });
      return;
    }
    
    setUpdatingUserId(userId);
    try {
      if (newRole === 'user') {
        // Remove all role entries for this user (make them a regular user)
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // First, delete any existing roles for this user
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        
        // Then insert the new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      const roleLabels: Record<string, { zhTW: string; zhCN: string }> = {
        admin: { zhTW: '管理員', zhCN: '管理员' },
        accountant: { zhTW: '會計', zhCN: '会计' },
        support: { zhTW: '客服', zhCN: '客服' },
        user: { zhTW: '一般使用者', zhCN: '普通用户' },
      };

      toast({
        title: t('角色更新成功', '角色更新成功'),
        description: t(`已將使用者角色更改為${roleLabels[newRole].zhTW}`, 
                       `已将用户角色更改为${roleLabels[newRole].zhCN}`),
      });

      // Reload users
      loadUsers();
    } catch (err: any) {
      console.error('Error updating role:', err);
      toast({
        title: t('更新失敗', '更新失败'),
        description: err.message || t('請稍後再試', '请稍后再试'),
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Open edit dialog
  const handleEditClick = (user: UserWithRole) => {
    setEditingUser(user);
    setEditForm({
      optometrist_license_number: user.optometrist_license_number || '',
      training_completed: user.training_completed ?? false,
      research_consent_signed: user.research_consent_signed ?? false,
      research_qualified: user.research_qualified ?? false,
    });
    setEditDialogOpen(true);
  };

  // Save whitelist fields
  const handleSaveWhitelist = async () => {
    if (!editingUser) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('optometrist_profiles')
        .update({
          optometrist_license_number: editForm.optometrist_license_number || null,
          training_completed: editForm.training_completed,
          research_consent_signed: editForm.research_consent_signed,
          research_qualified: editForm.research_qualified,
        })
        .eq('user_id', editingUser.id);

      if (error) throw error;

      toast({
        title: t('儲存成功', '保存成功'),
        description: t('研究白名單資料已更新', '研究白名单数据已更新'),
      });

      setEditDialogOpen(false);
      loadUsers();
    } catch (err: any) {
      console.error('Error saving whitelist:', err);
      toast({
        title: t('儲存失敗', '保存失败'),
        description: err.message || t('請稍後再試', '请稍后再试'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t('權限不足', '权限不足')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('此功能僅限系統管理員使用', '此功能仅限系统管理员使用')}
            </p>
            <Button onClick={() => navigate('/analyzer')}>
              {t('返回首頁', '返回首页')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-card border-b border-border sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/analyzer')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-lg">{t('角色管理', '角色管理')}</h1>
          </div>
        </div>
        <LanguageToggle />
      </header>

      <main className="p-4 max-w-6xl mx-auto space-y-4">
        {/* Role info card */}
        <Card className={isOwner ? "bg-primary/5 border-primary/20" : "bg-amber-500/5 border-amber-500/20"}>
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className={`h-5 w-5 flex-shrink-0 ${isOwner ? 'text-primary' : 'text-amber-500'}`} />
            <div>
              <p className={`font-medium ${isOwner ? 'text-primary' : 'text-amber-600'}`}>
                {isOwner ? t('系統擁有者', '系统拥有者') : t('管理員功能', '管理员功能')}
              </p>
              <p className="text-sm text-muted-foreground">
                {isOwner 
                  ? t('您可以管理所有使用者的角色權限', '您可以管理所有用户的角色权限')
                  : t('此頁面僅限系統擁有者調整角色權限，您目前僅能檢視', '此页面仅限系统拥有者调整角色权限，您目前仅能查看')
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('搜尋驗光師、店名...', '搜索验光师、店名...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm" onClick={loadUsers} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t('重新整理', '刷新')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('使用者列表', '用户列表')}
            </CardTitle>
            <CardDescription>
              {t(`共 ${users.length} 位使用者`, `共 ${users.length} 位用户`)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t('沒有符合條件的使用者', '没有符合条件的用户')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button 
                          className="flex items-center hover:text-primary transition-colors"
                          onClick={() => handleSort('optometrist_name')}
                        >
                          {t('驗光師', '验光师')}
                          <SortIcon field="optometrist_name" />
                        </button>
                      </TableHead>
                      <TableHead>{t('店名', '店名')}</TableHead>
                      <TableHead>{t('地區', '地区')}</TableHead>
                      <TableHead className="text-center">
                        <button 
                          className="flex items-center justify-center hover:text-primary transition-colors w-full"
                          onClick={() => handleSort('totalExams')}
                        >
                          {t('累積', '累积')}
                          <SortIcon field="totalExams" />
                        </button>
                      </TableHead>
                      <TableHead className="text-center">
                        <button 
                          className="flex items-center justify-center hover:text-primary transition-colors w-full"
                          onClick={() => handleSort('thisYearExams')}
                        >
                          {t('今年', '今年')}
                          <SortIcon field="thisYearExams" />
                        </button>
                      </TableHead>
                      <TableHead className="text-center">
                        <button 
                          className="flex items-center justify-center hover:text-primary transition-colors w-full"
                          onClick={() => handleSort('thisMonthExams')}
                        >
                          {t('本月', '本月')}
                          <SortIcon field="thisMonthExams" />
                        </button>
                      </TableHead>
                      <TableHead className="text-center">{t('白名單', '白名单')}</TableHead>
                      <TableHead>{t('角色', '角色')}</TableHead>
                      <TableHead className="text-right">{t('操作', '操作')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className={user.research_qualified ? 'bg-green-500/5' : ''}>
                        <TableCell className="font-medium">
                          <div>
                            {user.optometrist_name || '-'}
                            {user.displayLicenseNumber && (
                              <div className="text-[10px] text-muted-foreground">
                                {user.displayLicenseNumber}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{user.clinic_name || '-'}</TableCell>
                        <TableCell className="text-sm">{user.clinic_region || '-'}</TableCell>
                        <TableCell className="text-center font-medium">
                          {user.totalExams}
                        </TableCell>
                        <TableCell className="text-center">
                          {user.thisYearExams}
                        </TableCell>
                        <TableCell className="text-center">
                          {user.thisMonthExams}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {user.training_completed && (
                              <span title={t('已完成訓練', '已完成训练')}>
                                <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                              </span>
                            )}
                            {user.research_consent_signed && (
                              <span title={t('已簽合作', '已签合作')}>
                                <FileCheck className="h-3.5 w-3.5 text-orange-500" />
                              </span>
                            )}
                            {user.research_qualified ? (
                              <span title={t('研究白名單', '研究白名单')}>
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const roleLabels: Record<string, { zhTW: string; zhCN: string; variant: 'default' | 'secondary' | 'outline' }> = {
                              owner: { zhTW: '擁有者', zhCN: '拥有者', variant: 'default' },
                              admin: { zhTW: '管理員', zhCN: '管理员', variant: 'default' },
                              accountant: { zhTW: '會計', zhCN: '会计', variant: 'outline' },
                              support: { zhTW: '客服', zhCN: '客服', variant: 'outline' },
                              user: { zhTW: '使用者', zhCN: '用户', variant: 'secondary' },
                            };
                            const label = roleLabels[user.role] || roleLabels.user;
                            return (
                              <Badge variant={label.variant} className="text-xs">
                                {t(label.zhTW, label.zhCN)}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isOwner && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(user)}
                                title={t('編輯白名單資料', '编辑白名单数据')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {/* Only owner can edit roles, and cannot edit owner role */}
                            {isOwner && user.role !== 'owner' ? (
                              <Select
                                value={user.role}
                                onValueChange={(value: 'admin' | 'accountant' | 'support' | 'user') => 
                                  handleRoleChange(user.id, value, user.role_id)
                                }
                                disabled={updatingUserId === user.id}
                              >
                                <SelectTrigger className="w-28">
                                  {updatingUserId === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <SelectValue />
                                  )}
                                </SelectTrigger>
                                <SelectContent className="bg-background border">
                                  {ROLE_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {t(opt.labelZhTW, opt.labelZhCN)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-xs text-muted-foreground w-28 text-center">
                                {user.role === 'owner' ? t('擁有者', '拥有者') : t('僅供檢視', '仅供查看')}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Whitelist Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('編輯研究白名單資料', '编辑研究白名单数据')}</DialogTitle>
            <DialogDescription>
              {editingUser?.optometrist_name} - {editingUser?.clinic_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="license">{t('驗光師證號', '验光师证号')}</Label>
              <Input
                id="license"
                value={editForm.optometrist_license_number}
                onChange={(e) => setEditForm(prev => ({ ...prev, optometrist_license_number: e.target.value }))}
                placeholder={t('輸入驗光師證號', '输入验光师证号')}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="training"
                checked={editForm.training_completed}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, training_completed: !!checked }))}
              />
              <Label htmlFor="training" className="flex items-center gap-2 cursor-pointer">
                <GraduationCap className="h-4 w-4" />
                {t('已完成指定訓練', '已完成指定训练')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                checked={editForm.research_consent_signed}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, research_consent_signed: !!checked }))}
              />
              <Label htmlFor="consent" className="flex items-center gap-2 cursor-pointer">
                <FileCheck className="h-4 w-4" />
                {t('已簽署研究合作同意書', '已签署研究合作同意书')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="qualified"
                checked={editForm.research_qualified}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, research_qualified: !!checked }))}
              />
              <Label htmlFor="qualified" className="flex items-center gap-2 cursor-pointer">
                <CheckCircle className="h-4 w-4" />
                {t('研究合作白名單驗光師', '研究合作白名单验光师')}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t('取消', '取消')}
            </Button>
            <Button onClick={handleSaveWhitelist} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t('儲存', '保存')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRoleManagement;