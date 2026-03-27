import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionGuard } from '@/hooks/useSubscriptionGuard';
import { SubscriptionGuard } from '@/components/store/SubscriptionGuard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionStatus } from '@/components/store/SubscriptionStatus';
import { Link } from 'react-router-dom';
import { ExternalLink, QrCode, MessageSquareText, Settings } from 'lucide-react';
import type { Store } from '@/types/store';
import { mapDbStoreToStore, mapDbSubscriptionToStoreSubscription, type StoreSubscription } from '@/utils/normalizers';

export const StoreManagement: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscriptionStatus } = useSubscriptionGuard(storeId);
  
  const [store, setStore] = useState<Store | null>(null);
  const [subscription, setSubscription] = useState<StoreSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeId || !user) return;

      try {
        console.log('🔍 Fetching store data for:', storeId);

        // 取得店家資料
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('id', storeId)
          .maybeSingle();

        if (storeError || !storeData) {
          console.error('❌ Store fetch error:', storeError);
          toast({
            title: "錯誤",
            description: "無法載入店家資料",
            variant: "destructive",
          });
          return;
        }

        setStore(mapDbStoreToStore(storeData));

        // 取得訂閱資料
        const { data: subData, error: subError } = await supabase
          .from('store_subscriptions')
          .select('*')
          .eq('store_id', storeId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subError) {
          console.error('❌ Subscription fetch error:', subError);
        } else if (subData) {
          setSubscription(mapDbSubscriptionToStoreSubscription(subData));
        }

        console.log('✅ Store data loaded:', { store: storeData, subscription: subData });

      } catch (error) {
        console.error('💥 Failed to fetch store data:', error);
        toast({
          title: "載入失敗",
          description: "無法載入店家資訊",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId, user, toast]);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">找不到店家</h2>
            <p className="text-gray-500">無法載入店家資訊，請檢查連結是否正確。</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generateReviewUrl = `/generate-review/${store.store_number}`;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* 店家標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{store.store_name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline">#{store.store_number}</Badge>
            <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
              {store.status === 'active' ? '營運中' : store.status}
            </Badge>
            {subscriptionStatus.isActive && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                訂閱有效
              </Badge>
            )}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to={`/store/${store.id}/settings`}>
            <Settings className="w-4 h-4 mr-2" />
            店家設定
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要內容區 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 快速操作 */}
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button asChild className="h-auto p-4" variant="outline">
                  <Link to={generateReviewUrl} className="flex flex-col items-center gap-2">
                    <MessageSquareText className="w-6 h-6" />
                    <span>生成評論</span>
                  </Link>
                </Button>
                
                <SubscriptionGuard 
                  storeId={store.id} 
                  feature="QR Code 下載"
                  fallback={
                    <div className="h-auto p-4 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center gap-2 opacity-50">
                      <QrCode className="w-6 h-6" />
                      <span>QR Code</span>
                      <Badge variant="secondary" className="text-xs">需訂閱</Badge>
                    </div>
                  }
                >
                  <Button asChild className="h-auto p-4" variant="outline">
                    <Link to={`/qr-code/${store.store_number}`} className="flex flex-col items-center gap-2">
                      <QrCode className="w-6 h-6" />
                      <span>QR Code</span>
                    </Link>
                  </Button>
                </SubscriptionGuard>

                {store.google_review_url && (
                  <Button asChild className="h-auto p-4" variant="outline">
                    <a 
                      href={store.google_review_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2"
                    >
                      <ExternalLink className="w-6 h-6" />
                      <span>Google 評論</span>
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 店家資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>店家資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">聯絡信箱</p>
                  <p className="font-medium">{store.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">聯絡電話</p>
                  <p className="font-medium">{store.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">行業類別</p>
                  <p className="font-medium">{store.industry || '未設定'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">建立時間</p>
                  <p className="font-medium">
                    {new Date(store.created_at).toLocaleDateString('zh-TW')}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">店家地址</p>
                <p className="font-medium">{store.address}</p>
              </div>

              {store.description && (
                <div>
                  <p className="text-sm text-gray-600">店家描述</p>
                  <p className="font-medium">{store.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 側邊欄 - 訂閱狀態 */}
        <div>
          {subscription && (
            <SubscriptionStatus
              plan_type={subscription.plan_type}
              expires_at={subscription.expires_at}
              auto_renew={subscription.auto_renew}
              payment_source={subscription.payment_source}
              store_id={store.id}
            />
          )}
        </div>
      </div>
    </div>
  );
};
