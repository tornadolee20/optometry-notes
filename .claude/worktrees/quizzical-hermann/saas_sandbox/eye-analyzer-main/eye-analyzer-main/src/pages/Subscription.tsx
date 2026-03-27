import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Calendar, CheckCircle2, AlertCircle, XCircle, MessageCircle } from 'lucide-react';
import { BankTransferInfo } from '@/components/BankTransferInfo';
import { PaymentReportForm } from '@/components/PaymentReportForm';
import { 
  getSubscriptionStatus, 
  formatPlanType, 
  formatSubscriptionStatus,
  PRICING,
  type SubscriptionStatus 
} from '@/lib/subscriptionUtils';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLandingTranslation } from '@/lib/translations/landingTranslations';

interface Payment {
  id: string;
  amount: number;
  plan_type: string;
  payment_provider: string;
  status: string;
  note: string | null;
  paid_at: string | null;
  created_at: string;
  provider_trade_no: string | null;
}

export default function Subscription() {
  const { user, profile, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = getLandingTranslation(language);
  const navigate = useNavigate();
  const [subscriptionData, setSubscriptionData] = useState<{
    plan_type: string;
    paid_until: string;
    is_active: boolean;
    payment_method: string;
  } | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;
    
    try {
      // Load subscription info from profile
      const { data: profileData, error: profileError } = await supabase
        .from('optometrist_profiles')
        .select('plan_type, paid_until, is_active, payment_method')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading subscription:', profileError);
      } else {
        setSubscriptionData(profileData);
      }

      // Load payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error loading payments:', paymentsError);
      } else {
        setPayments(paymentsData || []);
      }
    } finally {
      setLoadingData(false);
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const status = subscriptionData ? getSubscriptionStatus({
    planType: subscriptionData.plan_type as any,
    paidUntil: new Date(subscriptionData.paid_until),
    isActive: subscriptionData.is_active,
    paymentMethod: subscriptionData.payment_method
  }) : 'not_found';

  const getStatusIcon = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'blocked':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadgeVariant = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'expired':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusPaymentLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return '已確認';
      case 'pending':
        return '待確認';
      case 'failed':
        return '失敗';
      case 'refunded':
        return '已退款';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/analyzer')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">訂閱與付款</h1>
            <p className="text-slate-500 text-sm">管理您的訂閱方案與付款紀錄</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-600" />
                目前方案狀態
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">目前方案</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {subscriptionData ? formatPlanType(subscriptionData.plan_type as any) : '-'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">使用權到期日</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {subscriptionData ? format(new Date(subscriptionData.paid_until), 'yyyy-MM-dd') : '-'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">帳號狀態</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <Badge variant={getStatusBadgeVariant(status)}>
                      {formatSubscriptionStatus(status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          <Card>
            <CardHeader>
              <CardTitle>方案與收費說明</CardTitle>
              <CardDescription>選擇適合您的訂閱方案</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-4 hover:border-sky-300 transition-colors">
                  <h3 className="font-semibold text-slate-800 mb-2">月繳方案</h3>
                  <p className="text-2xl font-bold text-sky-600 mb-2">
                    NT$ {PRICING.monthly.toLocaleString()} <span className="text-sm font-normal text-slate-500">/月</span>
                  </p>
                  <p className="text-sm text-slate-500">
                    適合先小量使用、想先體驗系統的驗光師。
                  </p>
                </div>
                <div className="border-2 border-sky-500 rounded-lg p-4 relative">
                  <Badge className="absolute -top-3 left-4 bg-sky-500">推薦</Badge>
                  <h3 className="font-semibold text-slate-800 mb-2">年繳方案</h3>
                  <p className="text-2xl font-bold text-sky-600 mb-1">
                    NT$ {PRICING.yearly.toLocaleString()} <span className="text-sm font-normal text-slate-500">/年</span>
                  </p>
                  <p className="text-sm text-green-600 mb-2">平均每月 NT$ 300，省 40%</p>
                  <p className="text-sm text-slate-500">
                    適合長期使用、希望穩定省成本的驗光師。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfer Info */}
          <BankTransferInfo showInstructions={true} />

          {/* Payment Report Form */}
          <PaymentReportForm onSuccess={loadSubscriptionData} />

          {/* LINE Contact Section */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <MessageCircle className="w-5 h-5" />
                {t.lineContactTitle}
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-500">
                {t.lineContactDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://line.me/R/ti/p/@mywonvision"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full sm:w-auto"
              >
                <Button 
                  className="w-full sm:w-auto bg-[#06C755] hover:bg-[#05B34D] text-white gap-2 font-medium"
                  size="lg"
                >
                  <svg 
                    className="w-5 h-5" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  {t.lineContactBtn}
                </Button>
              </a>
            </CardContent>
          </Card>
          {payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  付款紀錄
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-slate-800">
                          {payment.payment_provider === 'admin_free' ? '管理員贈送' : '銀行轉帳'}
                          {' - '}
                          {formatPlanType(payment.plan_type as any)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {format(new Date(payment.paid_at || payment.created_at), 'yyyy-MM-dd HH:mm')}
                        </p>
                        {payment.provider_trade_no && (
                          <p className="text-xs text-slate-400">帳號後五碼：{payment.provider_trade_no}</p>
                        )}
                        {payment.note && (
                          <p className="text-xs text-slate-400 mt-1">{payment.note}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">
                          NT$ {payment.amount.toLocaleString()}
                        </p>
                        <Badge 
                          variant={payment.status === 'paid' ? 'default' : payment.status === 'pending' ? 'secondary' : 'outline'} 
                          className="text-xs"
                        >
                          {getStatusPaymentLabel(payment.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
