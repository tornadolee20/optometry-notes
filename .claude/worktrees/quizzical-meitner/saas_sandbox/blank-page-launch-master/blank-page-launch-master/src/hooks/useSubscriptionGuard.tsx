
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SubscriptionStatus {
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
  planType: string;
  status: string;
  expiresAt: string;
  loading: boolean;
  error?: string;
}

export const useSubscriptionGuard = (storeId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isExpired: false,
    daysRemaining: 0,
    planType: '',
    status: '',
    expiresAt: '',
    loading: true
  });

  useEffect(() => {
    const checkSubscription = async () => {
      if (!storeId || !user) {
        setSubscriptionStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        console.log('🔍 Checking subscription for store:', storeId);

        // 檢查店家是否屬於當前用戶
        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select('id, user_id, status')
          .eq('id', storeId)
          .maybeSingle();

        if (storeError || !store) {
          console.error('❌ Store not found or access denied:', storeError);
          setSubscriptionStatus(prev => ({ 
            ...prev, 
            loading: false, 
            error: '找不到店家或無權限存取' 
          }));
          return;
        }

        if (store.user_id !== user.id) {
          console.error('❌ User does not own this store');
          setSubscriptionStatus(prev => ({ 
            ...prev, 
            loading: false, 
            error: '您無權限存取此店家' 
          }));
          return;
        }

        // 檢查訂閱狀態
        const { data: subscription, error: subError } = await supabase
          .from('store_subscriptions')
          .select('*')
          .eq('store_id', storeId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subError) {
          console.error('❌ Error fetching subscription:', subError);
          setSubscriptionStatus(prev => ({ 
            ...prev, 
            loading: false, 
            error: '無法檢查訂閱狀態' 
          }));
          return;
        }

        if (!subscription) {
          console.log('⚠️ No subscription found for store');
          setSubscriptionStatus({
            isActive: false,
            isExpired: true,
            daysRemaining: 0,
            planType: 'none',
            status: 'none',
            expiresAt: '',
            loading: false,
            error: '尚未有訂閱方案'
          });
          return;
        }

        // 計算到期狀態
        const now = new Date();
        const expiresAt = new Date(subscription.expires_at);
        const diffTime = expiresAt.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isExpired = daysRemaining < 0;
        const isActive = !isExpired && ['active', 'trial'].includes(subscription.status ?? 'trial');

        console.log('✅ Subscription status:', {
          isActive,
          isExpired,
          daysRemaining,
          status: subscription.status,
          planType: subscription.plan_type
        });

        setSubscriptionStatus({
          isActive,
          isExpired,
          daysRemaining: Math.max(daysRemaining, 0),
          planType: subscription.plan_type ?? 'trial',
          status: subscription.status ?? 'trial',
          expiresAt: subscription.expires_at ?? '',
          loading: false
        });

      } catch (error) {
        console.error('💥 Subscription check failed:', error);
        setSubscriptionStatus(prev => ({ 
          ...prev, 
          loading: false, 
          error: '系統錯誤' 
        }));
      }
    };

    checkSubscription();
  }, [storeId, user]);

  const requireActiveSubscription = (action: string = '此操作') => {
    if (subscriptionStatus.loading) {
      toast({
        title: "檢查中",
        description: "正在檢查訂閱狀態...",
      });
      return false;
    }

    if (!subscriptionStatus.isActive) {
      const message = subscriptionStatus.isExpired 
        ? `您的訂閱已過期，無法執行${action}。請續訂以繼續使用。`
        : `需要有效的訂閱方案才能執行${action}。`;

      toast({
        title: "需要訂閱",
        description: message,
        variant: "destructive",
      });

      // 導向定價頁面
      setTimeout(() => navigate('/pricing'), 1500);
      return false;
    }

    return true;
  };

  const showExpirationWarning = () => {
    if (subscriptionStatus.isActive && subscriptionStatus.daysRemaining <= 3) {
      toast({
        title: "訂閱即將到期",
        description: `您的訂閱將在 ${subscriptionStatus.daysRemaining} 天後到期`,
        variant: "destructive",
      });
    }
  };

  return {
    subscriptionStatus,
    requireActiveSubscription,
    showExpirationWarning,
    refetch: () => {
      setSubscriptionStatus(prev => ({ ...prev, loading: true }));
      // 觸發 useEffect 重新執行
    }
  };
};
