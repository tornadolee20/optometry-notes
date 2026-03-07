
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_NAMES } from "@/utils/subscription-limits";

interface SubscriptionInfoProps {
  plan_type: string;
  expires_at: string;
  auto_renew: boolean;
  daysUntilExpiry: number;
  isExpired: boolean;
  payment_source?: string;
}

export const SubscriptionInfo = ({
  plan_type,
  expires_at,
  auto_renew,
  daysUntilExpiry,
  isExpired,
  payment_source
}: SubscriptionInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">當前方案</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-medium">{PLAN_NAMES[plan_type as keyof typeof PLAN_NAMES] || plan_type}</p>
            {payment_source && (
              <Badge variant={payment_source === 'paid' ? 'default' : 'secondary'}>
                {payment_source === 'paid' ? '💳 付費' : 
                 payment_source === 'admin_granted' ? '👤 管理員開啟' : '🎁 試用'}
              </Badge>
            )}
          </div>
        </div>
        <Badge variant={isExpired ? "destructive" : "default"}>
          {isExpired ? "已到期" : "使用中"}
        </Badge>
      </div>

      <div>
        <p className="text-sm text-gray-500">到期日期</p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-medium">
            {new Date(expires_at).toLocaleDateString('zh-TW')}
          </p>
          <p className={`text-sm ${isExpired ? 'text-red-500' : 
            daysUntilExpiry <= 7 ? 'text-yellow-500' : 'text-green-500'}`}>
            {isExpired ? "已過期" : 
              daysUntilExpiry === 0 ? "今日到期" : 
              `剩餘 ${daysUntilExpiry} 天`}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-500">自動續訂</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {auto_renew ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
            <p className="text-lg font-medium">
              {auto_renew ? '已開啟' : '已關閉'}
            </p>
          </div>
          <Button variant="outline" size="sm">
            管理訂閱
          </Button>
        </div>
      </div>
    </div>
  );
};
