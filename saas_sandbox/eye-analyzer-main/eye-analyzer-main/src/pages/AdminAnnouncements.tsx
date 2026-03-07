import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { LanguageToggle } from '@/components/LanguageToggle';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, Bell, Plus, Loader2, AlertTriangle, 
  Edit, Trash2, Shield, Megaphone
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_active: boolean;
  published_at: string;
  expires_at: string | null;
  created_at: string;
}

const priorityColors = {
  low: 'bg-gray-500',
  normal: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const AdminAnnouncements = () => {
  const { language } = useLanguage();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    is_active: true,
    expires_at: '',
  });

  const t = (zhTW: string, zhCN: string) => language === 'zh-TW' ? zhTW : zhCN;

  const priorityLabels = {
    low: t('低', '低'),
    normal: t('一般', '一般'),
    high: t('高', '高'),
    urgent: t('緊急', '紧急'),
  };

  const loadAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setAnnouncements((data || []) as Announcement[]);
    } catch (err) {
      console.error('Error loading announcements:', err);
      toast({
        title: language === 'zh-TW' ? '載入失敗' : '加载失败',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    if (isAdmin) {
      loadAnnouncements();
    }
  }, [isAdmin, loadAnnouncements]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      is_active: true,
      expires_at: '',
    });
    setEditingAnnouncement(null);
  };

  const handleOpenDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        is_active: announcement.is_active,
        expires_at: announcement.expires_at?.split('T')[0] || '',
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: t('請填寫必填欄位', '请填写必填栏位'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        priority: formData.priority,
        is_active: formData.is_active,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        created_by: user?.id,
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
        toast({ title: t('公告已更新', '公告已更新') });
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert(payload);

        if (error) throw error;
        toast({ title: t('公告已發布', '公告已发布') });
      }

      setShowDialog(false);
      resetForm();
      loadAnnouncements();
    } catch (err: any) {
      console.error('Error saving announcement:', err);
      toast({
        title: t('操作失敗', '操作失败'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('確定要刪除此公告嗎？', '确定要删除此公告吗？'))) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: t('公告已刪除', '公告已删除') });
      loadAnnouncements();
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
      toast({
        title: t('刪除失敗', '删除失败'),
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      loadAnnouncements();
    } catch (err) {
      console.error('Error toggling announcement:', err);
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
            <Megaphone className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-lg">{t('系統公告管理', '系统公告管理')}</h1>
          </div>
        </div>
        <LanguageToggle />
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-4">
        {/* Admin Badge */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-primary">{t('管理員功能', '管理员功能')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('管理系統公告，所有驗光師皆可看到', '管理系统公告，所有验光师皆可看到')}
                </p>
              </div>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              {t('新增公告', '新增公告')}
            </Button>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('公告列表', '公告列表')}
            </CardTitle>
            <CardDescription>
              {t(`共 ${announcements.length} 則公告`, `共 ${announcements.length} 条公告`)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t('尚無公告', '暂无公告')}
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <Card key={ann.id} className={!ann.is_active ? 'opacity-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={priorityColors[ann.priority]}>
                              {priorityLabels[ann.priority]}
                            </Badge>
                            {!ann.is_active && (
                              <Badge variant="secondary">{t('已停用', '已停用')}</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold">{ann.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {ann.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {t('發布於', '发布于')} {new Date(ann.published_at).toLocaleDateString()}
                            {ann.expires_at && ` · ${t('到期', '到期')} ${new Date(ann.expires_at).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={ann.is_active}
                            onCheckedChange={(checked) => handleToggleActive(ann.id, checked)}
                          />
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(ann)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDelete(ann.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? t('編輯公告', '编辑公告') : t('新增公告', '新增公告')}
            </DialogTitle>
            <DialogDescription>
              {t('公告將顯示給所有登入的驗光師', '公告将显示给所有登录的验光师')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('標題', '标题')} *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('公告標題', '公告标题')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('內容', '内容')} *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder={t('公告內容', '公告内容')}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('優先級', '优先级')}</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v: any) => setFormData(prev => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    <SelectItem value="low">{t('低', '低')}</SelectItem>
                    <SelectItem value="normal">{t('一般', '一般')}</SelectItem>
                    <SelectItem value="high">{t('高', '高')}</SelectItem>
                    <SelectItem value="urgent">{t('緊急', '紧急')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('到期日期', '到期日期')}（{t('選填', '选填')}）</Label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>{t('立即發布', '立即发布')}</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t('取消', '取消')}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingAnnouncement ? t('更新', '更新') : t('發布', '发布')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAnnouncements;