
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscriptionGuard } from '@/hooks/useSubscriptionGuard';

interface SubscriptionGuardProps {
  storeId: string;
  children: React.ReactNode;
  feature?: string;
  fallback?: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  storeId,
  children,
  feature = '此功能',
  fallback
}) => {
  const { subscriptionStatus } = useSubscriptionGuard(storeId);

  if (subscriptionStatus.loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionStatus.isActive) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Lock className="w-5 h-5" />
            功能已鎖定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {subscriptionStatus.isExpired ? '訂閱已過期' : '需要訂閱方案'}
            </AlertTitle>
            <AlertDescription>
              {subscriptionStatus.isExpired 
                ? `您的${subscriptionStatus.planType}方案已於 ${new Date(subscriptionStatus.expiresAt).toLocaleDateString('zh-TW')} 過期。`
                : '需要有效的訂閱方案才能使用此功能。'}
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-gray-600">
              {feature}需要有效的訂閱方案才能使用。
            </p>
            <Button asChild>
              <Link to="/pricing" className="inline-flex items-center gap-2">
                <Crown className="w-4 h-4" />
                {subscriptionStatus.isExpired ? '立即續訂' : '選擇方案'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 顯示即將到期警告
  if (subscriptionStatus.daysRemaining <= 3) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>訂閱即將到期</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>您的訂閱將在 {subscriptionStatus.daysRemaining} 天後到期</span>
            <Button asChild variant="outline" size="sm">
              <Link to="/pricing">立即續訂</Link>
            </Button>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};
