import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminButton } from '@/components/admin/AdminButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRightLeft } from 'lucide-react';
import { sendTransferAlert } from '@/services/transferAlertService';

interface StoreTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
  currentOwnerEmail: string;
}

export const StoreTransferModal: React.FC<StoreTransferModalProps> = ({
  isOpen, onClose, storeId, storeName, currentOwnerEmail
}) => {
  const [toEmail, setToEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!toEmail.trim() || !toEmail.includes('@')) {
      toast.error('請輸入有效的 Email');
      return;
    }
    if (toEmail.trim().toLowerCase() === currentOwnerEmail.toLowerCase()) {
      toast.error('新老闆 Email 不能與現任相同');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('store_transfer_requests')
        .insert({
          store_id: storeId,
          from_owner_email: currentOwnerEmail,
          to_owner_email: toEmail.trim().toLowerCase(),
        })
        .select('transfer_token')
        .single();

      if (error) throw error;

      const transferUrl = `${window.location.origin}/accept-transfer?token=${data.transfer_token}`;

      // 先用 console.log 代替實際寄信
      console.log('========================================');
      console.log('📧 店家管理權轉移邀請連結：');
      console.log(transferUrl);
      console.log('========================================');

      toast.success('轉移邀請已建立，請將連結傳送給新老闆', { duration: 6000 });

      // Send Telegram notification (non-blocking)
      sendTransferAlert({
        type: 'initiated',
        storeName,
        fromEmail: currentOwnerEmail,
        toEmail: toEmail.trim().toLowerCase(),
      });

      // 複製到剪貼簿
      try {
        await navigator.clipboard.writeText(transferUrl);
        toast.info('邀請連結已複製到剪貼簿');
      } catch {
        // clipboard API 可能不可用
      }

      setToEmail('');
      onClose();
    } catch (err: any) {
      toast.error(err.message || '建立轉移請求失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            轉移管理權
          </DialogTitle>
          <DialogDescription>
            將「{storeName}」的管理權轉移給新老闆。對方需透過邀請連結接受轉移。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">現任老闆</Label>
            <Input value={currentOwnerEmail} disabled className="text-sm bg-muted/50" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to-email">新老闆 Email</Label>
            <Input
              id="to-email"
              type="email"
              placeholder="new-owner@example.com"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <p className="text-[11px] text-muted-foreground">
              邀請連結有效期 7 天，新老闆需先註冊帳號才能接受轉移
            </p>
          </div>
        </div>

        <DialogFooter>
          <AdminButton variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            取消
          </AdminButton>
          <AdminButton size="sm" onClick={handleSubmit} disabled={isSubmitting || !toEmail.trim()}>
            {isSubmitting ? '處理中...' : '送出邀請'}
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
