import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Calendar, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Gift
} from "lucide-react";

interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  start_date: string;
  end_date: string;
  is_free_grant?: boolean;
  grant_reason?: string;
  usage_limit: number;
  current_usage: number;
  auto_renew: boolean;
  payment_source?: 'paid' | 'admin_granted' | 'trial';
}

interface SubscriptionStatusNewProps {
  storeId: string;
  subscriptionData: {
    id?: string;
    plan_type: string;
    expires_at: string;
    auto_renew: boolean;
    payment_source?: string;
    status?: string;
    created_at?: string;
  } | null;
  isOwner: boolean;
  compact: boolean;
}

export const SubscriptionStatusNew = ({ subscriptionData, isOwner, compact }: SubscriptionStatusNewProps) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading] = useState(false);

  const handleSubscriptionData = (subData: {
    id?: string; plan_type?: string; status?: string;
    created_at?: string; expires_at?: string;
    payment_source?: string; auto_renew?: boolean;
  } | null) => {
    if (subData) {
      const subscription: Subscription = {
        id: subData.id || 'parent-data',
        plan: subData.plan_type || 'standard',
        status: subData.status === 'active' ? 'active' : 
                subData.status === 'trial' ? 'trial' : 'active',
        start_date: subData.created_at || new Date().toISOString(),
        end_date: subData.expires_at || new Date().toISOString(),
        is_free_grant: subData.payment_source === 'admin_granted',
        grant_reason: undefined,
        usage_limit: 500,
        current_usage: 250,
        auto_renew: subData.auto_renew || false,
        payment_source: (subData.payment_source as 'paid' | 'admin_granted' | 'trial') || 'paid'
      };
      setSubscription(subscription);
    } else {
      setSubscription(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (subscriptionData) {
      handleSubscriptionData(subscriptionData);
    } else {
      setSubscription(null);
    }
    setLoading(false);
  }, [subscriptionData]);

  const handleUpgrade = () => {
    try {
      const newWindow = window.open('/pricing', '_blank');
      if (!newWindow) {
        window.location.href = '/pricing';
      }
    } catch (error) {
      console.error('SubscriptionStatusNew - 開啟定價頁面失敗:', error);
      window.location.href = '/pricing';
    }
  };

  const getPlanInfo = (plan: string) => {
    const plans = {
      trial: { name: '7天免費試用', color: 'bg-muted text-muted-foreground', icon: Gift },
      monthly: { name: '月訂閱', color: 'bg-primary/10 text-primary', icon: Zap },
      quarterly: { name: '季訂閱', color: 'bg-purple-100 text-purple-800', icon: Crown },
      yearly: { name: '年訂閱', color: 'bg-yellow-100 text-yellow-800', icon: TrendingUp }
    };
    return plans[plan as keyof typeof plans] || plans.monthly;
  };

  const getStatusInfo = (status: string) => {
    // Status → semantic token mapping: active=success, trial=info, expired=error, cancelled=muted
    const statuses = {
      active: { name: '使用中', color: 'bg-status-success-bg text-status-success-fg', icon: CheckCircle },
      trial: { name: '試用中', color: 'bg-status-info-bg text-status-info-fg', icon: Clock },
      expired: { name: '已過期', color: 'bg-status-error-bg text-status-error-fg', icon: AlertTriangle },
      cancelled: { name: '已取消', color: 'bg-muted text-muted-foreground', icon: AlertTriangle }
    };
    return statuses[status as keyof typeof statuses] || statuses.expired;
  };

  const getDaysRemaining = () => {
    if (!subscription) return 0;
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  if (loading) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardHeader className={compact ? "p-0 pb-4" : ""}>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardHeader>
        {!compact && (
          <CardContent>
            <div className="animate-pulse space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  if (!subscription && !isOwner) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardHeader className={compact ? "p-0 pb-4" : ""}>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            查看訂閱狀態
          </CardTitle>
          <CardDescription>
            請登入以查看此店家的訂閱方案詳細資訊
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!subscription && isOwner) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardHeader className={compact ? "p-0 pb-4" : ""}>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            無訂閱方案
          </CardTitle>
          <CardDescription>
            尚未訂閱任何方案
          </CardDescription>
        </CardHeader>
        {!compact && (
          <CardContent>
            <Button onClick={handleUpgrade} className="w-full">
              <Crown className="w-4 h-4 mr-2" />
              選擇方案
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  if (!subscription) return null;

  const planInfo = getPlanInfo(subscription.plan);
  const statusInfo = getStatusInfo(subscription.status);
  const daysRemaining = getDaysRemaining();
  const PlanIcon = planInfo.icon;
  const StatusIcon = statusInfo.icon;

  if (compact) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlanIcon className="w-4 h-4" />
              <span className="font-medium text-sm">{planInfo.name}</span>
            </div>
            <Badge className={statusInfo.color}>
              {statusInfo.name}
            </Badge>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>剩餘 {daysRemaining} 天</span>
            {subscription.auto_renew && <span>自動續訂</span>}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlanIcon className="w-6 h-6" />
            <div>
              <CardTitle className="text-xl">訂閱方案</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <StatusIcon className="w-4 h-4" />
                {statusInfo.name}
              </CardDescription>
              {subscription.payment_source && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={subscription.payment_source === 'paid' ? 'default' : 'outline'} className="text-xs">
                    {subscription.payment_source === 'paid' ? '💳' : 
                     subscription.payment_source === 'admin_granted' ? '👤' : '🎁'}
                    {subscription.payment_source === 'paid' ? ' 付費訂閱' : 
                     subscription.payment_source === 'admin_granted' ? ' 管理員開啟' : ' 試用'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <Badge className={statusInfo.color}>
            {statusInfo.name}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              開始日期
            </div>
            <div className="text-sm font-medium">
              {new Date(subscription.start_date).toLocaleDateString('zh-TW')}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              到期日期
            </div>
            <div className="text-sm font-medium">
              {new Date(subscription.end_date).toLocaleDateString('zh-TW')}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">自動續訂</span>
          </div>
          <Badge variant={subscription.auto_renew ? "default" : "secondary"}>
            {subscription.auto_renew ? "已開啟" : "已關閉"}
          </Badge>
        </div>

        {subscription.is_free_grant && subscription.grant_reason && (
          <div className="p-3 bg-status-success-bg border border-status-success-border rounded-lg">
            <div className="flex items-center gap-2 text-status-success-fg text-sm font-medium mb-1">
              <Gift className="w-4 h-4" />
              免費授予原因
            </div>
            <div className="text-sm text-status-success-fg">
              {subscription.grant_reason}
            </div>
          </div>
        )}

        {daysRemaining <= 7 && subscription.status === 'active' && (
          <div className="p-3 bg-status-warning-bg border border-status-warning-border rounded-lg">
            <div className="flex items-center gap-2 text-status-warning-fg text-sm font-medium mb-1">
              <AlertTriangle className="w-4 h-4" />
              即將到期
            </div>
            <div className="text-sm text-status-warning-fg">
              您的訂閱將在 {daysRemaining} 天後到期，請及時續訂以免影響服務。
            </div>
          </div>
        )}

        <div className="space-y-2">
          {subscription.status === 'expired' && (
            <Button onClick={handleUpgrade} disabled={upgrading} className="w-full">
              <Crown className="w-4 h-4 mr-2" />
              {upgrading ? "處理中..." : "立即續訂"}
            </Button>
          )}
          
          {subscription.status === 'active' && subscription.plan !== 'yearly' && (
            <Button onClick={handleUpgrade} disabled={upgrading} variant="outline" className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              {upgrading ? "處理中..." : "升級方案"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
