import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Search, RefreshCw, Users, ChevronRight, 
  CheckCircle2, AlertCircle, XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { formatPlanType, type SubscriptionStatus } from '@/lib/subscriptionUtils';

interface UserWithSubscription {
  user_id: string;
  optometrist_name: string;
  clinic_name: string;
  plan_type: string;
  paid_until: string;
  is_active: boolean;
  email?: string;
}

export default function AdminSubscriptions() {
  const { hasSubscriptionAccess, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithSubscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // support role can only view, not manage
  const isReadOnly = userRole === 'support';

  useEffect(() => {
    // support can also view subscriptions (read-only)
    const canAccess = hasSubscriptionAccess || userRole === 'support';
    if (!isLoading && !canAccess) {
      toast({
        title: '存取被拒',
        description: '您沒有權限存取此頁面',
        variant: 'destructive',
      });
      navigate('/analyzer');
    }
  }, [hasSubscriptionAccess, userRole, isLoading, navigate]);

  useEffect(() => {
    const canAccess = hasSubscriptionAccess || userRole === 'support';
    if (canAccess) {
      loadUsers();
    }
  }, [hasSubscriptionAccess, userRole]);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.optometrist_name.toLowerCase().includes(term) ||
        u.clinic_name.toLowerCase().includes(term) ||
        (u.email && u.email.toLowerCase().includes(term))
      ));
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('optometrist_profiles')
        .select('user_id, optometrist_name, clinic_name, plan_type, paid_until, is_active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      toast({
        title: '載入失敗',
        description: '無法載入使用者列表',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (user: UserWithSubscription): SubscriptionStatus => {
    if (!user.is_active) return 'blocked';
    const paidUntil = new Date(user.paid_until);
    return paidUntil >= new Date() ? 'active' : 'expired';
  };

  const getStatusIcon = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'blocked':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-200">使用中</Badge>;
      case 'expired':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">已到期</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-700 border-red-200">已停用</Badge>;
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

  const canAccess = hasSubscriptionAccess || userRole === 'support';
  if (!canAccess) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/analyzer')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">訂閱管理</h1>
            <p className="text-slate-500 text-sm">管理使用者訂閱與匯款對帳</p>
          </div>
          <Badge className="bg-sky-100 text-sky-700">管理員</Badge>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜尋名稱、診所或 Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={loadUsers} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                重新整理
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">總用戶</p>
                  <p className="text-xl font-bold text-slate-800">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-slate-500">使用中</p>
                  <p className="text-xl font-bold text-green-600">
                    {users.filter(u => getStatus(u) === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm text-slate-500">已到期</p>
                  <p className="text-xl font-bold text-amber-600">
                    {users.filter(u => getStatus(u) === 'expired').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-slate-500">已停用</p>
                  <p className="text-xl font-bold text-red-600">
                    {users.filter(u => getStatus(u) === 'blocked').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              驗光師列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const status = getStatus(user);
                return (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between py-4 hover:bg-slate-50 -mx-4 px-4 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/subscriptions/${user.user_id}`)}
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(status)}
                      <div>
                        <p className="font-medium text-slate-800">{user.optometrist_name}</p>
                        <p className="text-sm text-slate-500">{user.clinic_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <Badge variant="outline" className="mb-1">
                          {formatPlanType(user.plan_type as any)}
                        </Badge>
                        <p className="text-xs text-slate-400">
                          到期: {format(new Date(user.paid_until), 'yyyy-MM-dd')}
                        </p>
                      </div>
                      {getStatusBadge(status)}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  沒有找到符合條件的使用者
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
