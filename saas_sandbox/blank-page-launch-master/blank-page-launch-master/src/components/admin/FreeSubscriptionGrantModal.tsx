import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Gift, AlertCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface FreeSubscriptionGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
  onSuccess?: () => void;
}

interface GrantForm {
  duration: string;
  reason: string;
  notes: string;
  autoRenew: boolean;
}

interface CurrentSubscription {
  expires_at: string | null;
  trial_ends_at: string | null;
  plan_type: string | null;
  status: string | null;
}

export const FreeSubscriptionGrantModal = ({
  isOpen,
  onClose,
  storeId,
  storeName,
  onSuccess
}: FreeSubscriptionGrantModalProps) => {
  const [form, setForm] = useState<GrantForm>({
    duration: '',
    reason: '',
    notes: '',
    autoRenew: false
  });
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const { toast } = useToast();

  const durations = [
    { value: '7', label: '一周', days: 7 },
    { value: '30', label: '一個月', days: 30 },
    { value: '90', label: '一季', days: 90 },
    { value: '365', label: '一年', days: 365 }
  ];

  const reasons = [
    { value: 'trial', label: '試用體驗' },
    { value: 'partnership', label: '合作夥伴' },
    { value: 'compensation', label: '補償方案' },
    { value: 'promotion', label: '推廣活動' },
    { value: 'special_case', label: '特殊情況' },
    { value: 'other', label: '其他原因' }
  ];

  // 載入目前的訂閱狀態
  useEffect(() => {
    if (isOpen && storeId) {
      fetchCurrentSubscription();
    }
  }, [isOpen, storeId]);

  const fetchCurrentSubscription = async () => {
    setLoadingSubscription(true);
    try {
      const { data, error } = await supabase
        .from('store_subscriptions')
        .select('expires_at, trial_ends_at, plan_type, status')
        .eq('store_id', storeId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching current subscription:', error);
        return;
      }

      setCurrentSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  // 計算延期後的到期日期
  const calculateNewExpiryDate = (): Date | null => {
    if (!form.duration) return null;

    const durationDays = parseInt(form.duration);
    const now = new Date();
    
    // 找出基準時間（現有到期日、試用結束日或現在的最大值）
    let baseDate = now;
    
    if (currentSubscription?.expires_at) {
      const expiresAt = new Date(currentSubscription.expires_at);
      if (expiresAt > baseDate) baseDate = expiresAt;
    }
    
    if (currentSubscription?.trial_ends_at) {
      const trialEndsAt = new Date(currentSubscription.trial_ends_at);
      if (trialEndsAt > baseDate) baseDate = trialEndsAt;
    }

    // 加上延期天數
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + durationDays);
    return newDate;
  };

  const handleSubmit = async () => {
    if (!form.duration || !form.reason) {
      toast({
        title: "錯誤",
        description: "請填寫所有必填欄位",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const durationDays = parseInt(form.duration);

      // 呼叫 RPC 函數來處理免費訂閱授予
      const { error } = await supabase.rpc('admin_grant_free_subscription', {
        _store_id: storeId,
        _duration_days: durationDays,
        _reason: form.reason,
        _notes: form.notes,
        _auto_renew: form.autoRenew
      });

      if (error) throw error;

      const newExpiryDate = calculateNewExpiryDate();
      
      toast({
        title: "成功",
        description: `已為 ${storeName} 授予免費訂閱${newExpiryDate ? `，新到期日：${newExpiryDate.toLocaleDateString('zh-TW')}` : ''}`,
      });

      onSuccess?.();
      onClose();
      
      // 重置表單
      setForm({
        duration: '',
        reason: '',
        notes: '',
        autoRenew: false
      });

    } catch (error) {
      console.error('Error granting free subscription:', error);
      toast({
        title: "錯誤",
        description: error instanceof Error ? error.message : "授予免費訂閱失敗，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const newExpiryDate = calculateNewExpiryDate();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-500" />
            授予免費訂閱
          </DialogTitle>
          <DialogDescription>
            為 <strong>{storeName}</strong> 授予免費訂閱方案
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 目前訂閱狀態 */}
          {loadingSubscription ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="animate-pulse">載入目前訂閱狀態...</div>
            </div>
          ) : currentSubscription ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">目前訂閱狀態：</p>
                  <ul className="mt-1 text-xs space-y-1">
                    <li>• 方案：{currentSubscription.plan_type || '無'}</li>
                    <li>• 狀態：{currentSubscription.status || '無'}</li>
                    {currentSubscription.expires_at && (
                      <li>• 到期日：{new Date(currentSubscription.expires_at).toLocaleDateString('zh-TW')}</li>
                    )}
                    {currentSubscription.trial_ends_at && (
                      <li>• 試用結束：{new Date(currentSubscription.trial_ends_at).toLocaleDateString('zh-TW')}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              此店家目前沒有訂閱記錄
            </div>
          )}

          {/* 期間選擇 */}
          <div className="space-y-2">
            <Label htmlFor="duration">免費期間 *</Label>
            <Select value={form.duration} onValueChange={(value) => setForm(prev => ({ ...prev, duration: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="選擇免費期間" />
              </SelectTrigger>
              <SelectContent>
                {durations.map(duration => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {newExpiryDate && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                <Calendar className="w-3 h-3" />
                延期後到期日期: {newExpiryDate.toLocaleDateString('zh-TW')}
              </div>
            )}
          </div>

          {/* 授予原因 */}
          <div className="space-y-2">
            <Label htmlFor="reason">授予原因 *</Label>
            <Select value={form.reason} onValueChange={(value) => setForm(prev => ({ ...prev, reason: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="選擇授予原因" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map(reason => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 備註 */}
          <div className="space-y-2">
            <Label htmlFor="notes">備註說明</Label>
            <Textarea
              id="notes"
              placeholder="選填：額外的說明或備註..."
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* 警告提示 */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">重要說明：</p>
              <ul className="mt-1 text-xs space-y-1">
                <li>• 免費訂閱將從現有到期日延期（不是從今天開始）</li>
                <li>• 此操作將被記錄在管理員日誌中</li>
                <li>• 店家狀態將自動設為「活躍」</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !form.duration || !form.reason}>
            {loading ? "處理中..." : "確認授予"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
