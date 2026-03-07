import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// 設計系統組件
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminStatsCard, AdminStatsGrid } from "@/components/admin/AdminStatsCard";
import { AdminCard, AdminCardHeader, AdminCardContent } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { adminTheme } from "@/styles/admin-theme";
import { cn } from "@/lib/utils";

import { 
  Store, Users, BarChart3, TrendingUp,
  AlertTriangle, CheckCircle, Activity,
  Zap, RefreshCw, Bell
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';

type DashboardData = {
  totalStores: number;
  activeStores: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  newStoresThisMonth: number;
  newRegistrationsToday: number;
  churnRate: number;
  planDistribution: Array<{ name: string; value: number; color: string }>;
  recentStores: Array<{ month: string; count: number }>;
  alerts: Array<{ id: number; type: 'critical' | 'warning' | 'info'; title: string; message: string; actionRequired?: boolean }>;
};

const PLAN_COLORS: Record<string, string> = {
  standard: '#3b82f6',
  monthly: '#10b981',
  quarterly: '#f59e0b',
  yearly: '#8b5cf6',
  trial: '#6b7280',
};

const EnterpriseAdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [storesRes, subsRes, todayUsersRes] = await Promise.all([
        supabase.from('stores').select('id, status, created_at'),
        supabase.from('store_subscriptions').select('id, status, plan_type'),
        supabase.from('users').select('id', { count: 'exact' })
          .gte('created_at', startOfToday.toISOString()),
      ]);

      const stores = storesRes.data || [];
      const subs = subsRes.data || [];
      const totalStores = stores.length;
      const activeStores = stores.filter(s => s.status === 'active').length;
      
      const activeSubs = subs.filter(s => s.status === 'active');
      const totalSubs = subs.length;
      const activeSubsCount = activeSubs.length;
      const churnRate = totalSubs > 0 ? Math.round(((totalSubs - activeSubsCount) / totalSubs) * 100) : 0;

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const newStoresThisMonth = stores.filter(s => new Date(s.created_at) > oneMonthAgo).length;

      // 計算最近 6 個月新增店家（真實數據）
      const recentStores: Array<{ month: string; count: number }> = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        const count = stores.filter(s => {
          const created = new Date(s.created_at);
          return created >= monthStart && created <= monthEnd;
        }).length;
        recentStores.push({ month: `${d.getMonth() + 1}月`, count });
      }

      // 訂閱方案分佈（真實數據）
      const planMap = activeSubs.reduce((acc, sub) => {
        const plan = sub.plan_type || 'standard';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const planDistribution = Object.entries(planMap).map(([name, value]) => ({
        name, value, color: PLAN_COLORS[name] || '#3b82f6'
      }));

      // 動態警報
      const alerts: DashboardData['alerts'] = [];
      if (totalStores === 0) {
        alerts.push({ id: 1, type: 'warning', title: '尚無註冊店家', message: '系統目前沒有註冊的店家', actionRequired: true });
      }
      if (churnRate > 20) {
        alerts.push({ id: 2, type: 'critical', title: '流失率過高', message: `當前流失率 ${churnRate}%，需要關注`, actionRequired: true });
      }
      alerts.push({ id: 3, type: 'info', title: '系統正常', message: `${totalStores} 家店鋪，${activeSubsCount} 個活躍訂閱` });

      setData({
        totalStores,
        activeStores,
        totalSubscriptions: totalSubs,
        activeSubscriptions: activeSubsCount,
        newStoresThisMonth,
        newRegistrationsToday: (todayUsersRes as any)?.count ?? todayUsersRes.data?.length ?? 0,
        churnRate,
        planDistribution: planDistribution.length > 0 ? planDistribution : [{ name: '無訂閱', value: 0, color: '#6b7280' }],
        recentStores,
        alerts,
      });
    } catch (error) {
      console.error('Dashboard load failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !data) {
    return <AdminLoadingState fullPage message="正在載入儀表板" description="獲取最新數據中..." size="lg" />;
  }

  return (
    <AdminPageWrapper>
      {/* 頁面頂部 */}
      <div className={cn('bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 -mt-2', adminTheme.shadows.md)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 bg-gradient-to-r from-primary to-primary/80 rounded-xl', adminTheme.shadows.md)}>
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className={adminTheme.typography.pageTitle}>營運總覽</h1>
              <p className={adminTheme.typography.pageDescription}>即時數據 • 所有數字來自資料庫</p>
            </div>
          </div>
          <AdminButton variant="outline" size="sm" onClick={loadData} icon={RefreshCw}>刷新</AdminButton>
        </div>
      </div>

      {/* KPI 統計 */}
      <AdminStatsGrid columns={4}>
        <AdminStatsCard title="總店家數" value={data?.totalStores || 0} icon={Store} color="info" trend={data?.newStoresThisMonth} trendLabel="本月新增" />
        <AdminStatsCard title="活躍店家" value={data?.activeStores || 0} icon={Users} color="success" />
        <AdminStatsCard title="活躍訂閱" value={data?.activeSubscriptions || 0} icon={TrendingUp} color="purple" />
        <AdminStatsCard title="流失率" value={`${data?.churnRate || 0}%`} icon={Activity} color={data?.churnRate && data.churnRate > 15 ? "danger" : "success"} />
      </AdminStatsGrid>

      {/* 警報與今日數據 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdminCard variant="elevated">
            <AdminCardHeader title="系統狀態" icon={<Bell className="w-5 h-5 text-destructive" />} />
            <AdminCardContent>
              <div className="space-y-3">
                {data?.alerts.map((alert) => (
                  <div key={alert.id} className={cn(
                    'p-3 rounded-lg border-l-4',
                    alert.type === 'critical' ? 'bg-destructive/5 border-l-destructive' :
                    alert.type === 'warning' ? 'bg-accent border-l-primary' :
                    'bg-accent/50 border-l-muted-foreground'
                  )}>
                    <div className="flex items-start gap-2">
                      {alert.type === 'critical' ? <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" /> :
                       alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-primary mt-0.5" /> :
                       <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5" />}
                      <div>
                        <p className="font-medium text-sm text-foreground">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCardContent>
          </AdminCard>
        </div>

        <AdminCard variant="elevated">
          <AdminCardHeader title="今日數據" icon={<Zap className="w-5 h-5 text-primary" />} />
          <AdminCardContent>
            <div className="space-y-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">+{data?.newRegistrationsToday || 0}</div>
                <p className={adminTheme.typography.cardDescription}>今日新註冊</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">{data?.newStoresThisMonth || 0}</div>
                <p className={adminTheme.typography.cardDescription}>本月新增店家</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">{data?.totalSubscriptions || 0}</div>
                <p className={adminTheme.typography.cardDescription}>總訂閱數</p>
              </div>
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>

      {/* 圖表 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AdminCard variant="elevated">
          <AdminCardHeader title="最近 6 個月新增店家" icon={<TrendingUp className="w-5 h-5 text-primary" />} />
          <AdminCardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.recentStores}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#colorCount)" name="新增店家" />
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </AdminCardContent>
        </AdminCard>

        <AdminCard variant="elevated">
          <AdminCardHeader title="訂閱方案分佈" icon={<Store className="w-5 h-5 text-primary" />} />
          <AdminCardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data?.planDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {data?.planDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {data?.planDistribution.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>
    </AdminPageWrapper>
  );
};

export default EnterpriseAdminDashboard;
