import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, User, Calendar, CreditCard, Gift, Ban, 
  CheckCircle2, AlertCircle, XCircle, Plus, History
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  formatPlanType, 
  formatSubscriptionStatus,
  calculateNewPaidUntil,
  PRICING,
  type SubscriptionStatus 
} from '@/lib/subscriptionUtils';

interface Payment {
  id: string;
  amount: number;
  plan_type: string;
  payment_provider: string;
  status: string;
  note: string | null;
  paid_at: string | null;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  optometrist_name: string;
  clinic_name: string;
  clinic_email: string | null;
  plan_type: string;
  paid_until: string;
  is_active: boolean;
  payment_method: string;
  created_at: string;
}

export default function AdminSubscriptionDetail() {
  const { userId } = useParams<{ userId: string }>();
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [giftTrialOpen, setGiftTrialOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  
  // Form states
  const [paymentPlanType, setPaymentPlanType] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentAmount, setPaymentAmount] = useState(PRICING.monthly.toString());
  const [paymentNote, setPaymentNote] = useState('');
  const [giftDuration, setGiftDuration] = useState<'monthly' | 'yearly'>('monthly');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/analyzer');
    }
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin && userId) {
      loadData();
    }
  }, [isAdmin, userId]);

  const loadData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('optometrist_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      toast({
        title: '載入失敗',
        description: '無法載入使用者資料',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (): SubscriptionStatus => {
    if (!profile) return 'not_found';
    if (!profile.is_active) return 'blocked';
    const paidUntil = new Date(profile.paid_until);
    return paidUntil >= new Date() ? 'active' : 'expired';
  };

  const handleAddPayment = async () => {
    if (!profile) return;
    
    setSubmitting(true);
    try {
      const newPaidUntil = calculateNewPaidUntil(profile.paid_until, paymentPlanType);
      
      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: profile.user_id,
          amount: parseFloat(paymentAmount),
          currency: 'TWD',
          plan_type: paymentPlanType,
          payment_provider: 'bank_transfer',
          status: 'paid',
          note: paymentNote || null,
          paid_at: new Date().toISOString(),
        });

      if (paymentError) throw paymentError;

      // Update profile
      const { error: profileError } = await supabase
        .from('optometrist_profiles')
        .update({
          plan_type: paymentPlanType,
          paid_until: newPaidUntil.toISOString(),
          is_active: true,
        })
        .eq('user_id', profile.user_id);

      if (profileError) throw profileError;

      toast({
        title: '付款已記錄',
        description: `新的到期日：${format(newPaidUntil, 'yyyy-MM-dd')}`,
      });

      setAddPaymentOpen(false);
      setPaymentNote('');
      loadData();
    } catch (err) {
      console.error('Error adding payment:', err);
      toast({
        title: '操作失敗',
        description: '無法新增付款紀錄',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGiftTrial = async () => {
    if (!profile) return;
    
    setSubmitting(true);
    try {
      const newPaidUntil = calculateNewPaidUntil(profile.paid_until, giftDuration);
      const durationText = giftDuration === 'monthly' ? '1 個月' : '1 年';
      
      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: profile.user_id,
          amount: 0,
          currency: 'TWD',
          plan_type: giftDuration,
          payment_provider: 'admin_free',
          status: 'paid',
          note: `管理員贈送免費試用 ${durationText}`,
          paid_at: new Date().toISOString(),
        });

      if (paymentError) throw paymentError;

      // Update profile
      const { error: profileError } = await supabase
        .from('optometrist_profiles')
        .update({
          plan_type: giftDuration,
          paid_until: newPaidUntil.toISOString(),
          is_active: true,
        })
        .eq('user_id', profile.user_id);

      if (profileError) throw profileError;

      toast({
        title: '贈送成功',
        description: `已成功贈送 ${durationText} 免費試用，新的到期日為：${format(newPaidUntil, 'yyyy-MM-dd')}`,
      });

      setGiftTrialOpen(false);
      loadData();
    } catch (err) {
      console.error('Error gifting trial:', err);
      toast({
        title: '操作失敗',
        description: '無法贈送試用',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!profile) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('optometrist_profiles')
        .update({ is_active: false })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: '帳號已停用',
        description: '該使用者的帳號已被停用',
      });

      setDeactivateOpen(false);
      loadData();
    } catch (err) {
      console.error('Error deactivating:', err);
      toast({
        title: '操作失敗',
        description: '無法停用帳號',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async () => {
    if (!profile) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('optometrist_profiles')
        .update({ is_active: true })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: '帳號已啟用',
        description: '該使用者的帳號已被啟用',
      });

      loadData();
    } catch (err) {
      console.error('Error activating:', err);
      toast({
        title: '操作失敗',
        description: '無法啟用帳號',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'blocked':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!isAdmin || !profile) return null;

  const status = getStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/subscriptions')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">訂閱詳細</h1>
            <p className="text-slate-500 text-sm">{profile.optometrist_name} - {profile.clinic_name}</p>
          </div>
          <Badge className="bg-sky-100 text-sky-700">管理員</Badge>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                基本資訊
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">姓名</p>
                  <p className="font-medium text-slate-800">{profile.optometrist_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">診所</p>
                  <p className="font-medium text-slate-800">{profile.clinic_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium text-slate-800">{profile.clinic_email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">註冊日期</p>
                  <p className="font-medium text-slate-800">
                    {format(new Date(profile.created_at), 'yyyy-MM-dd')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                訂閱狀態
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">目前方案</p>
                  <Badge variant="outline" className="text-base">
                    {formatPlanType(profile.plan_type as any)}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">使用權到期日</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {format(new Date(profile.paid_until), 'yyyy-MM-dd')}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">帳號狀態</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="font-semibold">{formatSubscriptionStatus(status)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {/* Add Payment Dialog */}
                <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      新增匯款紀錄
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>新增匯款紀錄</DialogTitle>
                      <DialogDescription>
                        為 {profile.optometrist_name} 新增銀行轉帳付款紀錄
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>方案類型</Label>
                        <Select value={paymentPlanType} onValueChange={(v) => {
                          setPaymentPlanType(v as 'monthly' | 'yearly');
                          setPaymentAmount(v === 'monthly' ? PRICING.monthly.toString() : PRICING.yearly.toString());
                        }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">月繳 (NT$ {PRICING.monthly})</SelectItem>
                            <SelectItem value="yearly">年繳 (NT$ {PRICING.yearly})</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>金額 (TWD)</Label>
                        <Input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>備註（匯款日期時間、帳號後五碼等）</Label>
                        <Textarea
                          value={paymentNote}
                          onChange={(e) => setPaymentNote(e.target.value)}
                          placeholder="例：2024-01-15 14:30 匯款，帳號後五碼 12345"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddPaymentOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddPayment} disabled={submitting}>
                        {submitting ? '處理中...' : '確認新增'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Gift Trial Dialog */}
                <Dialog open={giftTrialOpen} onOpenChange={setGiftTrialOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Gift className="w-4 h-4" />
                      贈送免費試用
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>贈送免費試用</DialogTitle>
                      <DialogDescription>
                        為 {profile.optometrist_name} 贈送免費試用期
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>試用期長度</Label>
                        <Select value={giftDuration} onValueChange={(v) => setGiftDuration(v as 'monthly' | 'yearly')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">1 個月</SelectItem>
                            <SelectItem value="yearly">1 年</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                        新的到期日將為：{format(calculateNewPaidUntil(profile.paid_until, giftDuration), 'yyyy-MM-dd')}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setGiftTrialOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleGiftTrial} disabled={submitting}>
                        {submitting ? '處理中...' : '確認贈送'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Deactivate/Activate Button */}
                {profile.is_active ? (
                  <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Ban className="w-4 h-4" />
                        停用帳號
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>停用帳號</DialogTitle>
                        <DialogDescription>
                          確定要停用 {profile.optometrist_name} 的帳號嗎？停用後該使用者將無法登入系統。
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeactivateOpen(false)}>
                          取消
                        </Button>
                        <Button variant="destructive" onClick={handleDeactivate} disabled={submitting}>
                          {submitting ? '處理中...' : '確認停用'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button variant="outline" onClick={handleActivate} disabled={submitting} className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {submitting ? '處理中...' : '啟用帳號'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                付款紀錄
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
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
                        {payment.note && (
                          <p className="text-xs text-slate-400 mt-1">{payment.note}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">
                          NT$ {payment.amount.toLocaleString()}
                        </p>
                        <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                          {payment.status === 'paid' ? '已付款' : payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  暫無付款紀錄
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
