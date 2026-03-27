import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { SubscriptionHeader } from "./subscription/SubscriptionHeader";
import { SubscriptionInfo } from "./subscription/SubscriptionInfo";
import { PaymentSection } from "./subscription/PaymentSection";
import { StatusAlerts } from "./subscription/StatusAlerts";
import { BankTransferService } from "@/services/bankTransferService";

interface SubscriptionProps {
  plan_type: string;
  expires_at: string;
  auto_renew: boolean;
  payment_status?: 'pending' | 'confirmed' | 'failed';
  payment_method?: 'atm' | 'credit_card';
  payment_source?: string;
  // New: store id for transfer submission; optional to keep backward compatibility
  store_id?: string;
}

export const SubscriptionStatus = ({ 
  plan_type, 
  expires_at, 
  auto_renew, 
  payment_status = 'pending',
  payment_source,
  store_id
}: SubscriptionProps) => {
  const { toast } = useToast();
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [transferCode, setTransferCode] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const calculateDaysLeft = () => {
      const expiryDate = new Date(expires_at);
      // 使用「本地日期的午夜」來避免時區與時間造成的誤差
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(expiryDate);
      expiry.setHours(0, 0, 0, 0);

      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysUntilExpiry(diffDays);
      // 只有「已超過到期日」才視為過期；到期當天不算過期
      setIsExpired(diffDays < 0);
    };

    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [expires_at]);

  useEffect(() => {
    if (daysUntilExpiry <= 7 && !auto_renew && !isExpired) {
      toast({
        title: "訂閱即將到期",
        description: `您的${plan_type}方案將在 ${daysUntilExpiry} 天後到期，建議開啟自動續費以確保服務不中斷。`,
        variant: "destructive",
      });
    }
  }, [daysUntilExpiry, auto_renew, plan_type, toast]);

  const handleTransferCodeSubmit = async () => {
    if (transferCode.length !== 5) {
      toast({
        title: "格式錯誤",
        description: "請輸入 5 碼轉帳末碼",
        variant: "destructive",
      });
      return;
    }

    if (!store_id) {
      toast({
        title: "無法提交",
        description: "找不到店家 ID，請稍後再試或聯繫客服。",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    console.log("Submitting transfer code...", { store_id, transferCode });

    try {
      await BankTransferService.submitTransferCode(store_id, transferCode);
      toast({
        title: "提交成功",
        description: "轉帳代碼已提交成功！我們將在1-2個工作天內審核並啟用您的訂閱服務。",
      });
      setTransferCode('');
    } catch (err: any) {
      console.error("提交轉帳代碼失敗:", err);
      if (err.message?.includes('duplicate') || err.message?.includes('unique')) {
        toast({
          title: "重複提交",
          description: "此轉帳代碼已被使用，請檢查是否重複提交",
          variant: "destructive",
        });
      } else {
        toast({
          title: "提交失敗",
          description: err?.message || "系統發生錯誤，請稍後再試",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <SubscriptionHeader />
      <CardContent className="space-y-6">
        <SubscriptionInfo
          plan_type={plan_type}
          expires_at={expires_at}
          auto_renew={auto_renew}
          daysUntilExpiry={daysUntilExpiry}
          isExpired={isExpired}
          payment_source={payment_source}
        />

        <PaymentSection
          transferCode={transferCode}
          onTransferCodeChange={setTransferCode}
          onTransferCodeSubmit={handleTransferCodeSubmit}
        />

        <StatusAlerts
          payment_status={payment_status}
          daysUntilExpiry={daysUntilExpiry}
          auto_renew={auto_renew}
          isExpired={isExpired}
        />

        {submitting && (
          <div className="text-xs text-muted-foreground">
            傳送中，請稍候...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
