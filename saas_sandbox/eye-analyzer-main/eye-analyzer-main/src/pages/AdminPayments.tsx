import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, Search, RefreshCw, CreditCard, CheckCircle2, 
  Clock, ArrowUpDown, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { formatPlanType, calculateNewPaidUntil } from '@/lib/subscriptionUtils';

interface PaymentWithUser {
  id: string;
  user_id: string;
  amount: number;
  plan_type: string;
  payment_provider: string;
  status: string;
  note: string | null;
  admin_note: string | null;
  paid_at: string | null;
  created_at: string;
  confirmed_at: string | null;
  provider_trade_no: string | null;
  optometrist_name?: string;
  clinic_email?: string;
}

type StatusFilter = 'all' | 'pending' | 'paid';
type SortOrder = 'newest' | 'oldest';

export default function AdminPayments() {
  const { hasPaymentAccess, isLoading } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentWithUser[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [loading, setLoading] = useState(true);
  const [confirmingPayment, setConfirmingPayment] = useState<PaymentWithUser | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasPaymentAccess) {
      toast({
        title: '存取被拒',
        description: '此頁面僅限系統擁有者與會計角色存取',
        variant: 'destructive',
      });
      navigate('/analyzer');
    }
  }, [hasPaymentAccess, isLoading, navigate]);

  useEffect(() => {
    if (hasPaymentAccess) {
      loadPayments();
    }
  }, [hasPaymentAccess]);

  useEffect(() => {
    filterAndSortPayments();
  }, [searchTerm, statusFilter, sortOrder, payments]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Load payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Load profiles for user info
      const userIds = [...new Set(paymentsData?.map(p => p.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('optometrist_profiles')
        .select('user_id, optometrist_name, clinic_email')
        .in('user_id', userIds);

      // Merge data
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      const mergedData = paymentsData?.map(p => ({
        ...p,
        optometrist_name: profilesMap.get(p.user_id)?.optometrist_name || '未知',
        clinic_email: profilesMap.get(p.user_id)?.clinic_email || '',
      })) || [];

      setPayments(mergedData);
    } catch (err) {
      console.error('Error loading payments:', err);
      toast({
        title: '載入失敗',
        description: '無法載入付款紀錄',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPayments = () => {
    let filtered = [...payments];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.optometrist_name?.toLowerCase().includes(term) ||
        p.clinic_email?.toLowerCase().includes(term) ||
        p.provider_trade_no?.includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.paid_at || a.created_at).getTime();
      const dateB = new Date(b.paid_at || b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredPayments(filtered);
  };

  const handleConfirmPayment = async () => {
    if (!confirmingPayment) return;
    
    setIsConfirming(true);
    try {
      // 1. Get user's current paid_until
      const { data: profile, error: profileError } = await supabase
        .from('optometrist_profiles')
        .select('paid_until')
        .eq('user_id', confirmingPayment.user_id)
        .single();

      if (profileError) throw profileError;

      // 2. Calculate new paid_until based on plan type (monthly = 30 days, yearly = 365 days)
      const planType = confirmingPayment.plan_type as 'monthly' | 'yearly';
      const newPaidUntil = calculateNewPaidUntil(profile.paid_until, planType);

      // 3. Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          confirmed_at: new Date().toISOString(),
          admin_note: adminNote || null,
        })
        .eq('id', confirmingPayment.id);

      if (updateError) throw updateError;

      // 4. Update user's paid_until and plan_type
      const { error: profileUpdateError } = await supabase
        .from('optometrist_profiles')
        .update({
          paid_until: newPaidUntil.toISOString(),
          plan_type: planType,
        })
        .eq('user_id', confirmingPayment.user_id);

      if (profileUpdateError) throw profileUpdateError;

      // 5. Send confirmation email via edge function
      try {
        await supabase.functions.invoke('send-payment-confirmed', {
          body: {
            paymentId: confirmingPayment.id,
            userId: confirmingPayment.user_id,
          },
        });
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: '已確認付款',
        description: `已將 ${confirmingPayment.optometrist_name} 的付款標記為已確認，訂閱效期已延長至 ${format(newPaidUntil, 'yyyy-MM-dd')}`,
      });

      // Refresh data
      loadPayments();
      setConfirmingPayment(null);
      setAdminNote('');
    } catch (err) {
      console.error('Error confirming payment:', err);
      toast({
        title: '確認失敗',
        description: '無法更新付款狀態，請稍後再試',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 border-green-200">已確認</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">待確認</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const confirmedCount = payments.filter(p => p.status === 'paid').length;

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!hasPaymentAccess) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/analyzer')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">付款管理</h1>
            <p className="text-slate-500 text-sm">查看與確認使用者的匯款紀錄</p>
          </div>
          <Badge className="bg-sky-100 text-sky-700">管理員</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">總筆數</p>
                  <p className="text-xl font-bold text-slate-800">{payments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm text-slate-500">待確認</p>
                  <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-slate-500">已確認</p>
                  <p className="text-xl font-bold text-green-600">{confirmedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜尋名稱、Email 或帳號後五碼..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="pending">待確認</SelectItem>
                  <SelectItem value="paid">已確認</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="排序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">新到舊</SelectItem>
                  <SelectItem value="oldest">舊到新</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={loadPayments} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                重新整理
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              付款紀錄
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-800">{payment.optometrist_name}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                    <p className="text-sm text-slate-500">{payment.clinic_email || '無 Email'}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                      <span>方案：{formatPlanType(payment.plan_type as any)}</span>
                      <span>金額：NT$ {payment.amount.toLocaleString()}</span>
                      <span>後五碼：{payment.provider_trade_no || '-'}</span>
                      <span>匯款日：{payment.paid_at ? format(new Date(payment.paid_at), 'yyyy-MM-dd') : '-'}</span>
                    </div>
                    {payment.note && (
                      <p className="text-xs text-slate-400 mt-1">備註：{payment.note}</p>
                    )}
                    {payment.admin_note && (
                      <p className="text-xs text-amber-600 mt-1">管理員註記：{payment.admin_note}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {payment.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => setConfirmingPayment(payment)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        標記為已確認
                      </Button>
                    )}
                    {payment.status === 'paid' && payment.confirmed_at && (
                      <span className="text-xs text-green-600">
                        確認於 {format(new Date(payment.confirmed_at), 'yyyy-MM-dd HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {filteredPayments.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  沒有找到符合條件的付款紀錄
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Payment Dialog */}
      <Dialog open={!!confirmingPayment} onOpenChange={(open) => !open && setConfirmingPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認付款</DialogTitle>
            <DialogDescription>
              確認將此筆付款標記為已確認？系統會自動發送確認 Email 給使用者。
            </DialogDescription>
          </DialogHeader>
          {confirmingPayment && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <p><strong>使用者：</strong>{confirmingPayment.optometrist_name}</p>
                <p><strong>方案：</strong>{formatPlanType(confirmingPayment.plan_type as any)}</p>
                <p><strong>金額：</strong>NT$ {confirmingPayment.amount.toLocaleString()}</p>
                <p><strong>帳號後五碼：</strong>{confirmingPayment.provider_trade_no || '-'}</p>
                <p><strong>匯款日期：</strong>{confirmingPayment.paid_at ? format(new Date(confirmingPayment.paid_at), 'yyyy-MM-dd') : '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  管理員註記（選填）
                </label>
                <Textarea
                  placeholder="例如：金額不符、需再確認..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingPayment(null)}>
              取消
            </Button>
            <Button 
              onClick={handleConfirmPayment} 
              disabled={isConfirming}
              className="bg-green-600 hover:bg-green-700"
            >
              {isConfirming ? '處理中...' : '確認付款'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
