import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

import { StoreInfoForm } from "@/components/store/StoreInfoForm";
import { SubscriptionStatusNew } from "@/components/subscription/SubscriptionStatusNew";
import { StoreQRCode } from "@/components/store/StoreQRCode";
import { KeywordManagerCompact } from "@/components/store/improved/KeywordManagerCompact";
import { OversizedKeywordsPanel } from "@/components/admin/OversizedKeywordsPanel";
import { ReviewSystemUrl } from "@/components/store/ReviewSystemUrl";
import { storeNumberToCode } from "@/utils/referral-code";
import { toast } from "@/hooks/use-toast";
import { PopularCustomFeelings } from "@/components/admin/PopularCustomFeelings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquarePlus, 
  ArrowLeft, 
  AlertCircle, 
  Star,
  TrendingUp,
  Settings,
  QrCode,
  Clock,
  CheckCircle,
  Eye,
  BookOpen,
  ArrowRightLeft
} from "lucide-react";
import { FloatingActionButton } from "@/components/store/improved/ResponsiveButton";
import { StoreProfileSkeleton } from "@/components/ui/loading-skeleton";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RealtimeSyncDebugger } from "@/components/debug/RealtimeSyncDebugger";
import { useAuth } from "@/hooks/useAuth";
import { useAuthReady } from "@/hooks/useAuthReady";

import { Store } from "@/types/store";
import { mapDbStoreToStore, mapDbSubscriptionToStoreSubscription, type StoreSubscription } from "@/utils/normalizers";
import { useSandboxMode } from "@/hooks/useSandboxMode";
import { OnboardingWizard } from "@/components/store/OnboardingWizard";
import { StoreTransferModal } from "@/pages/admin/store-list/StoreTransferModal";

const StoreProfile = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const showDebug = new URLSearchParams(location.search).get('debug') === '1';
  const { handleError } = useErrorHandler();
  const { user } = useAuth();
  const { isAuthReady } = useAuthReady();
  const { isSandbox } = useSandboxMode();
  const [store, setStore] = useState<Store | null>(null);
  const [subscription, setSubscription] = useState<StoreSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  // 真實數據統計 - 關鍵字和系統使用統計
  const [realStats, setRealStats] = useState({
    keywordCount: 0,
    mostUsedKeyword: "",
    todayGenerations: 0,
    weeklyGenerations: 0,
    monthlyGenerations: 0,
    totalGenerations: 0
  });

  const isValidUuid = (id?: string) => !!id && /^[0-9a-fA-F-]{36}$/.test(id);

  const fetchStoreData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId || '')
        .single();

      if (storeError) {
        console.error("StoreProfile - 獲取店家資料錯誤:", storeError);
        throw storeError;
      }

        
        
        const mappedStore = mapDbStoreToStore(storeData);
        setStore(mappedStore);
      
      // Check ownership
      const userIsOwner = user?.id === storeData.user_id;
      setIsOwner(userIsOwner);
      
      // Check if new store needs onboarding (not sandbox, no industry set, onboarding not completed)
      if (userIsOwner && !storeData.onboarding_completed && !storeData.industry) {
        setShowOnboarding(true);
      }

      // Only fetch subscription if auth is ready to avoid RLS issues
      if (isAuthReady) {
        try {
          
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('store_subscriptions')
            .select('*')
            .eq('store_id', storeId || '')
            .order('expires_at', { ascending: false })
            .order('payment_source', { ascending: true }) // 優先顯示付費訂閱
            .maybeSingle();

          if (subscriptionError) {
            console.warn("StoreProfile - 獲取訂閱狀態錯誤:", subscriptionError);
          } else {
            if (subscriptionData) {
              setSubscription(mapDbSubscriptionToStoreSubscription(subscriptionData));
            } else {
              setSubscription(null);
            }
          }
        } catch (subError) {
          console.warn("StoreProfile - 訂閱資料載入失敗:", subError);
          setSubscription(null);
        }
      } else {
        setSubscription(null);
      }

    } catch (error) {
      const errorMessage = handleError(error, {
        operation: '載入店家資訊',
        retry: () => {
          setRetryCount(prev => prev + 1);
          fetchStoreData();
        }
      });
      setError(errorMessage.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 獲取真實統計數據
  const fetchRealStats = async () => {
    try {
      // 獲取關鍵字統計
      const { data: keywords } = await supabase
        .from('store_keywords')
        .select('keyword, usage_count')
        .eq('store_id', storeId || '');

      // 獲取評論生成統計
      const { data: generations } = await supabase
        .from('customer_keyword_logs')
        .select('created_at')
        .eq('store_id', storeId || '');

      if (keywords) {
        const keywordCount = keywords.length;
        const mostUsed = keywords.reduce((prev, current) => 
          (prev.usage_count || 0) > (current.usage_count || 0) ? prev : current, 
          { keyword: "尚無", usage_count: 0 }
        );

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const todayCount = generations?.filter(g => new Date(g.created_at) >= today).length || 0;
        const weeklyCount = generations?.filter(g => new Date(g.created_at) >= weekAgo).length || 0;
        const monthlyCount = generations?.filter(g => new Date(g.created_at) >= monthStart).length || 0;
        const totalCount = generations?.length || 0;

        setRealStats({
          keywordCount,
          mostUsedKeyword: mostUsed.keyword,
          todayGenerations: todayCount,
          weeklyGenerations: weeklyCount,
          monthlyGenerations: monthlyCount,
          totalGenerations: totalCount
        });
      }
    } catch (error) {
      console.error('獲取統計數據錯誤:', error);
    }
  };

  useEffect(() => {
    if (!storeId) return;
    if (!isValidUuid(storeId)) {
      setError('無效的店家ID');
      setIsLoading(false);
      return;
    }
    // 等待 auth session 還原完成再查詢，避免 auth.uid() 為 null 導致 RLS 拒絕
    if (!isAuthReady) return;
    fetchStoreData();
  }, [storeId, retryCount, isAuthReady]);

  useEffect(() => {
    if (storeId) {
      fetchRealStats();
    }
  }, [storeId]);

  const getFullReviewUrl = (storeNumber: number) => {
    const formattedStoreNumber = String(storeNumber).padStart(5, '0');
    return formattedStoreNumber;
  };

  const handleGoToReviewSystem = () => {
    if (store) {
      const formattedStoreNumber = String(store.store_number).padStart(5, '0');
      navigate(`/${formattedStoreNumber}/generate-review`);
    }
  };

  if (isLoading) {
    return <StoreProfileSkeleton />;
  }

  // Show onboarding wizard for new stores (not sandbox users)
  if (showOnboarding && store && !isSandbox) {
    return (
      <OnboardingWizard
        storeId={store.id}
        onComplete={() => {
          setShowOnboarding(false);
          fetchStoreData(); // Reload store data with new industry
        }}
      />
    );
  }

  if (error && !store) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mb-4">
              {error}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            {isValidUuid(storeId) && (
              <Button onClick={() => fetchStoreData()} variant="outline">
                重新載入
              </Button>
            )}
            <Button onClick={() => navigate('/')} variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">找不到店家資訊</h2>
          <p className="text-muted-foreground mb-4">請檢查網址是否正確，或聯繫管理員協助。</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首頁
          </Button>
        </div>
      </div>
    );
  }

  const reviewUrl = getFullReviewUrl(store.store_number);
  const formattedStoreNumber = String(store.store_number).padStart(5, '0');

  const quickActions = [
    {
      icon: MessageSquarePlus,
      title: "生成評論",
      description: "創建AI評論",
      color: "from-brand-sage to-brand-sage-dark",
      onClick: handleGoToReviewSystem
    },
    {
      icon: QrCode,
      title: "QR碼分享",
      description: "快速分享",
      color: "from-brand-gold to-yellow-500",
      onClick: () => document.getElementById('qr-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      icon: Settings,
      title: "店家設定",
      description: "編輯資訊",
      color: "from-brand-indigo to-purple-600",
      onClick: () => document.getElementById('store-info')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      icon: BookOpen,
      title: "操作手冊",
      description: "使用教學",
      color: "from-brand-coral to-pink-500",
      onClick: () => navigate(`/store/${store.id}/manual`)
    }
  ];

  // 店家擁有者專屬：轉移管理權
  if (isOwner) {
    quickActions.push({
      icon: ArrowRightLeft,
      title: "轉移管理權",
      description: "移交店家",
      color: "from-slate-500 to-slate-700",
      onClick: () => setShowTransferModal(true)
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-sage-light/10 via-background to-brand-sage/5">
      {/* 現代化導航欄 */}
      <div className="bg-background/90 backdrop-blur-md border-b border-brand-sage/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-brand-sage-dark hover:bg-brand-sage/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <div className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/40b8add3-b8f5-4e78-8a90-9987bc19b773.png" 
                  alt="Myownreviews" 
                  className="w-6 h-6"
                />
                <h1 className="text-xl font-bold text-brand-sage-dark">店家儀表板</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isSandbox && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  🧪 管理員沙盒（不計入正式統計）
                </Badge>
              )}
              <Badge className="bg-brand-sage/10 text-brand-sage-dark border-brand-sage/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                已驗證
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 錯誤提示 */}
          {error && store && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                部分功能可能無法正常使用：{error}
              </AlertDescription>
            </Alert>
          )}

          {/* 模板已套用提示 (status: success - keep green) */}
          {store.industry && realStats.keywordCount > 0 && !isSandbox && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                我們已經根據你選擇的產業，幫你準備好一組推薦關鍵字，你可以直接開始邀請顧客留下評論。
              </AlertDescription>
            </Alert>
          )}

          {/* 歡迎區塊 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-r from-brand-sage via-brand-sage-dark to-brand-sage text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">歡迎回來，{store.store_name}！</h2>
                    <p className="text-primary-foreground/80 mb-4">店家編號：{formattedStoreNumber}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>最後更新：剛剛</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>本月生成：{realStats.monthlyGenerations}次</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{realStats.keywordCount}</div>
                    <div className="text-sm text-primary-foreground/80">設定關鍵字</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 數據統計卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">設定關鍵字</p>
                    <p className="text-2xl font-bold text-brand-sage-dark">{realStats.keywordCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-brand-sage/10 rounded-full flex items-center justify-center">
                    <Settings className="h-6 w-6 text-brand-sage" />
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs text-primary bg-primary/10">
                    最常用：{realStats.mostUsedKeyword}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">今日生成</p>
                    <p className="text-2xl font-bold text-brand-gold">{realStats.todayGenerations}</p>
                  </div>
                  <div className="h-12 w-12 bg-brand-gold/10 rounded-full flex items-center justify-center">
                    <MessageSquarePlus className="h-6 w-6 text-brand-gold" />
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs text-green-600 bg-green-50">
                    本周：{realStats.weeklyGenerations}次
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">本月生成</p>
                    <p className="text-2xl font-bold text-brand-coral">{realStats.monthlyGenerations}</p>
                  </div>
                  <div className="h-12 w-12 bg-brand-coral/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-brand-coral" />
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs text-secondary bg-secondary/10">
                    累計：{realStats.totalGenerations}次
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">系統使用</p>
                    <p className="text-2xl font-bold text-brand-indigo">{realStats.totalGenerations}</p>
                  </div>
                  <div className="h-12 w-12 bg-brand-indigo/10 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-brand-indigo" />
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs text-green-600 bg-green-50">
                    活躍使用
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 快速操作區 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-brand-sage-dark">
                  <img 
                    src="/lovable-uploads/40b8add3-b8f5-4e78-8a90-9987bc19b773.png" 
                    alt="Myownreviews" 
                    className="w-5 h-5"
                  />
                  快速操作
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg bg-gradient-to-r ${action.color} text-primary-foreground cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300`}
                      onClick={action.onClick}
                    >
                      <action.icon className="w-8 h-8 mb-2" />
                      <h3 className="font-semibold text-sm">{action.title}</h3>
                      <p className="text-xs opacity-90">{action.description}</p>
                    </motion.div>
                  ))}
                  
                  {/* 🚀 企業級分析按鈕 */}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 訂閱狀況 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <SubscriptionStatusNew 
              storeId={store.id} 
              subscriptionData={subscription} 
              isOwner={isOwner}
              compact={false}
            />
            
            {/* 🔧 開發調試工具 - 實時同步調試器（僅在 ?debug=1 時顯示） */}
            {showDebug && (
              <RealtimeSyncDebugger storeId={store.id} />
            )}
          </motion.div>

          {/* 詳細功能區域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div id="store-info">
              <StoreInfoForm 
                store={{
                  id: store.id,
                  store_name: store.store_name,
                  address: store.address,
                  description: store.description || '',
                  google_review_url: store.google_review_url || '',
                  phone: store.phone || '',
                  email: store.email || '',
                  store_number: store.store_number,
                  industry: store.industry || undefined,
                }} 
                onUpdate={(updatedStoreInfo) => {
                  setStore(prev => prev ? {
                    ...prev,
                    store_name: updatedStoreInfo.store_name,
                    address: updatedStoreInfo.address,
                    description: updatedStoreInfo.description,
                    google_review_url: updatedStoreInfo.google_review_url,
                    phone: updatedStoreInfo.phone,
                    email: updatedStoreInfo.email,
                    store_number: updatedStoreInfo.store_number,
                    industry: updatedStoreInfo.industry || null,
                  } : null);
                }}
              />
            </div>

            {/* 使用說明區塊 */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 mb-8 space-y-6">
              
              {/* 理念 */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  ✨ 為什麼要設定「關鍵的真實感受」？
                </h3>
                <p className="text-foreground/80 leading-relaxed max-w-2xl mx-auto">
                  顧客或許會忘記細節，但永遠記得感受。  
                  這些「關鍵的真實感受」，就是喚起記憶的橋樑，  
                  讓評論不只是星星，而是一段能打動人心的故事。
                </p>
              </div>

              {/* 操作指引 */}
              <div className="bg-background border border-primary/10 rounded-lg p-5 text-sm text-muted-foreground leading-relaxed space-y-2 shadow-sm">
                <p className="font-medium text-foreground">💡 使用說明</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>顧客評論時，這些「關鍵的真實感受」會自動出現，幫助他們快速點選。</li>
                  <li>你可以自由 <b>新增、刪除、編輯</b>（上限 48 個）。</li>
                  <li>建議每個感受保持 <b>3～7 字</b>，簡短有力。</li>
                  <li>感受依 <b>分類顯示</b>，讓顧客更容易找到符合的描述。</li>
                  <li>常用的感受，會幫助系統更準確生成評論內容。</li>
                </ul>
              </div>

              {/* 收尾金句 */}
              <p className="text-primary font-semibold text-center text-base">
                💡 幫助顧客回想起當下的真實感受，  
                這，就是最有力量的評論。
              </p>
            </div>

            <KeywordManagerCompact key={store.industry || 'no-industry'} storeId={store.id} storeEmail={store.email} storeIndustry={store.industry || undefined} />

            {isSandbox && <OversizedKeywordsPanel />}

            <PopularCustomFeelings storeId={store.id} />

            <ReviewSystemUrl
              storeId={store.id}
              reviewUrl={reviewUrl}
              storeNumber={formattedStoreNumber}
            />

            {/* 推薦碼 */}
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  推薦碼
                  <span className="text-xs font-normal text-muted-foreground">介紹新店家加入，成交後獲得回饋</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted rounded-lg px-4 py-2 text-base font-mono font-semibold tracking-widest text-center">
                    {storeNumberToCode(store.store_number)}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(storeNumberToCode(store.store_number));
                      toast({ title: "推薦碼已複製" });
                    }}
                  >
                    複製
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">把推薦碼告訴朋友，讓他們在註冊時填入，成交後我們會主動聯繫確認回饋方式。</p>
              </CardContent>
            </Card>

            <div id="qr-section">
              <StoreQRCode 
                storeId={store.id} 
                reviewUrl={reviewUrl}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 增強的浮動操作按鈕 */}
      <FloatingActionButton
        onClick={handleGoToReviewSystem}
        icon={<MessageSquarePlus className="w-5 h-5" />}
      >
        立即生成評論
      </FloatingActionButton>
      {/* 轉移管理權 Modal */}
      {store && (
        <StoreTransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          storeId={store.id}
          storeName={store.store_name}
          currentOwnerEmail={store.email}
        />
      )}
    </div>
  );
};

export default StoreProfile;
