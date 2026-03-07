import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, OptometristProfile } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Building2 } from 'lucide-react';

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileEditDialog = ({ open, onOpenChange }: ProfileEditDialogProps) => {
  const { language } = useLanguage();
  const { profile, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    clinicLineId: '',
    clinicWechatId: '',
    clinicEmail: '',
  });

  const t = (zhTW: string, zhCN: string) => language === 'zh-TW' ? zhTW : zhCN;

  // Initialize form data when profile changes or dialog opens
  useEffect(() => {
    if (profile && open) {
      setFormData({
        clinicName: profile.clinic_name || '',
        clinicAddress: profile.clinic_address || '',
        clinicPhone: profile.clinic_phone || '',
        clinicLineId: profile.clinic_line_id || '',
        clinicWechatId: profile.clinic_wechat_id || '',
        clinicEmail: profile.clinic_email || '',
      });
    }
  }, [profile, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    if (!formData.clinicName.trim() || !formData.clinicAddress.trim() || !formData.clinicPhone.trim()) {
      toast({
        title: t('請填寫必填欄位', '请填写必填栏位'),
        description: t('店名、地址、電話為必填', '店名、地址、电话为必填'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('optometrist_profiles')
        .update({
          clinic_name: formData.clinicName.trim(),
          clinic_address: formData.clinicAddress.trim(),
          clinic_phone: formData.clinicPhone.trim(),
          clinic_line_id: formData.clinicLineId.trim() || null,
          clinic_wechat_id: formData.clinicWechatId.trim() || null,
          clinic_email: formData.clinicEmail.trim() || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: t('更新成功', '更新成功'),
        description: t('驗光所資訊已更新', '验光所信息已更新'),
      });

      onOpenChange(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({
        title: t('更新失敗', '更新失败'),
        description: err.message || t('請稍後再試', '请稍后再试'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('編輯驗光所資訊', '编辑验光所信息')}
          </DialogTitle>
          <DialogDescription>
            {t('更新您的驗光所或眼鏡行資訊', '更新您的验光所或眼镜店信息')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinicName">
              {t('店名', '店名')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clinicName"
              value={formData.clinicName}
              onChange={(e) => setFormData(prev => ({ ...prev, clinicName: e.target.value }))}
              placeholder={t('例如：自己的眼鏡', '例如：XX眼镜店')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clinicAddress">
              {t('地址', '地址')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clinicAddress"
              value={formData.clinicAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, clinicAddress: e.target.value }))}
              placeholder={t('新北市板橋區文化路一段123號', '广东省广州市天河区XX路XX号')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clinicPhone">
              {t('連絡電話', '联系电话')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clinicPhone"
              value={formData.clinicPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, clinicPhone: e.target.value }))}
              placeholder={t('02-1234-5678', '020-1234-5678')}
            />
          </div>
          
          {language === 'zh-TW' ? (
            <div className="space-y-2">
              <Label htmlFor="clinicLineId">LINE ID（{t('選填', '选填')}）</Label>
              <Input
                id="clinicLineId"
                value={formData.clinicLineId}
                onChange={(e) => setFormData(prev => ({ ...prev, clinicLineId: e.target.value }))}
                placeholder="@youreyes"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="clinicWechatId">微信（{t('選填', '选填')}）</Label>
              <Input
                id="clinicWechatId"
                value={formData.clinicWechatId}
                onChange={(e) => setFormData(prev => ({ ...prev, clinicWechatId: e.target.value }))}
                placeholder="微信号"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="clinicEmail">
              {t('電子郵件', '电子邮件')}（{t('選填', '选填')}）
            </Label>
            <Input
              id="clinicEmail"
              type="email"
              value={formData.clinicEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, clinicEmail: e.target.value }))}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('取消', '取消')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('儲存', '保存')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};