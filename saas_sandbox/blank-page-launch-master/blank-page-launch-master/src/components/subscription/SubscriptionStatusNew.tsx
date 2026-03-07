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

export const SubscriptionStatusNew = ({ storeId, subscriptionData, isOwner, compact }: SubscriptionStatusNewProps) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading] = useState(false);

  console.log('SubscriptionStatusNew - 組件初始化，props:', { 
    storeId, 
    subscriptionData: subscriptionData ? 'provided' : 'null',
    isOwner, 
    compact 
  });

  const handleSubscriptionData = (subscriptionData: any) => {
    console.log('SubscriptionStatusNew - 处理父组件数据:', subscriptionData);
    
    if (subscriptionData) {
      const subscription: Subscription = {
        id: subscriptionData.id || 'parent-data',
        plan: subscriptionData.plan_type,
        status: subscriptionData.status === 'active' ? 'active' : 
                subscriptionData.status === 'trial' ? 'trial' : 'active', // 默认为active
        start_date: subscriptionData.created_at || new Date().toISOString(),
        end_date: subscriptionData.expires_at,
        is_free_grant: subscriptionData.payment_source === 'admin_granted',
        grant_reason: undefined,
        usage_limit: 500,
        current_usage: 250,
        auto_renew: subscriptionData.auto_renew || false,
        payment_source: (subscriptionData.payment_source as 'paid' | 'admin_granted' | 'trial') || 'paid'
      };
      console.log('SubscriptionStatusNew - 转换后的subscription:', subscription);
      setSubscription(subscription);
    } else {
      console.log('SubscriptionStatusNew - 无订阅数据，设为null');
      setSubscription(null);
    }
    setLoading(false);
  };

  // Handle subscription data from props or show appropriate message
  useEffect(() => {
    console.log('SubscriptionStatusNew - useEffect 觸發，處理props數據');
    if (subscriptionData) {
      console.log('SubscriptionStatusNew - 使用父組件提供的訂閱數據:', subscriptionData);
      handleSubscriptionData(subscriptionData);
    } else {
      console.log('SubscriptionStatusNew - 無訂閱數據');
      setSubscription(null);
    }
    setLoading(false);
  }, [subscriptionData]);

  const handleUpgrade = () => {
    console.log('SubscriptionStatusNew - 升級按鈕被點擊');
    try {
      // 導向定價/續訂頁面（新分頁開啟，避免中斷目前流程）
      const newWindow = window.open('/pricing', '_blank');
      if (!newWindow) {
        // 如果彈出視窗被阻擋，直接導航
        window.location.href = '/pricing';
      }
      console.log('SubscriptionStatusNew - 成功開啟定價頁面');
    } catch (error) {
      console.error('SubscriptionStatusNew - 開啟定價頁面失敗:', error);
      // 備用方案：直接導航
      window.location.href = '/pricing';
    }
  };

  const getPlanInfo = (plan: string) => {
    const plans = {
      trial: { name: '7天免費試用', color: 'bg-gray-100 text-gray-800', icon: Gift },
      monthly: { name: '月訂閱', color: 'bg-blue-100 text-blue-800', icon: Zap },
      quarterly: { name: '季訂閱', color: 'bg-purple-100 text-purple-800', icon: Crown },
      yearly: { name: '年訂閱', color: 'bg-yellow-100 text-yellow-800', icon: TrendingUp }
    };
    return plans[plan as keyof typeof plans] || plans.monthly;
  };

  const getStatusInfo = (status: string) => {
    const statuses = {
      active: { name: '使用中', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      trial: { name: '試用中', color: 'bg-blue-100 text-blue-800', icon: Clock },
      expired: { name: '已過期', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      cancelled: { name: '已取消', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
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

  console.log('SubscriptionStatusNew - 渲染開始，loading:', loading, 'subscription:', subscription);

  if (loading) {
    console.log('SubscriptionStatusNew - 正在載入中，顯示骨架屏');
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardHeader className={compact ? "p-0 pb-4" : ""}>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        {!compact && (
          <CardContent>
            <div className="animate-pulse space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  console.log('SubscriptionStatusNew - 最终检查 subscription:', subscription, 'isOwner:', isOwner);
  
  // If no subscription and user is not the owner (e.g., in Lovable preview)
  if (!subscription && !isOwner) {
    console.log('SubscriptionStatusNew - 非所有者且無訂閱，顯示登入提示');
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardHeader className={compact ? "p-0 pb-4" : ""}>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-500" />
            查看訂閱狀態
          </CardTitle>
          <CardDescription>
            請登入以查看此店家的訂閱方案詳細資訊
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // If no subscription and user is the owner
  if (!subscription && isOwner) {
    console.log('SubscriptionStatusNew - 店主無訂閱，顯示選擇方案');
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardHeader className={compact ? "p-0 pb-4" : ""}>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
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

  // At this point subscription is guaranteed to exist
  if (!subscription) return null; // This should never happen but satisfies TypeScript

  console.log('SubscriptionStatusNew - 有訂閱，準備渲染訂閱資訊:', subscription);

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
          
          <div className="flex justify-between text-xs text-gray-500">
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
        {/* 訂閱詳情 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              開始日期
            </div>
            <div className="text-sm font-medium">
              {new Date(subscription.start_date).toLocaleDateString('zh-TW')}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              到期日期
            </div>
            <div className="text-sm font-medium">
              {new Date(subscription.end_date).toLocaleDateString('zh-TW')}
            </div>
          </div>
        </div>

        {/* 續訂狀態 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-600" />
            <span className="text-sm">自動續訂</span>
          </div>
          <Badge variant={subscription.auto_renew ? "default" : "secondary"}>
            {subscription.auto_renew ? "已開啟" : "已關閉"}
          </Badge>
        </div>

        {/* 免費授予資訊 */}
        {subscription.is_free_grant && subscription.grant_reason && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 text-sm font-medium mb-1">
              <Gift className="w-4 h-4" />
              免費授予原因
            </div>
            <div className="text-sm text-green-700">
              {subscription.grant_reason}
            </div>
          </div>
        )}

        {/* 警告提示 */}
        {daysRemaining <= 7 && subscription.status === 'active' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium mb-1">
              <AlertTriangle className="w-4 h-4" />
              即將到期
            </div>
            <div className="text-sm text-yellow-700">
              您的訂閱將在 {daysRemaining} 天後到期，請及時續訂以免影響服務。
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
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