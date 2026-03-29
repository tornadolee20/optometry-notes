import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminStatsCard, AdminStatsGrid } from "@/components/admin/AdminStatsCard";
import { AdminCard, AdminCardHeader, AdminCardContent } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { cn } from "@/lib/utils";
import { StatColorKey } from "@/styles/admin-theme";

import { 
  Store, Users, TrendingUp,
  AlertTriangle, CheckCircle, Activity,
  Zap, RefreshCw, ArrowUpRight, Clock, CalendarDays
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
  trialSubscriptions: number;
  expiringSoon: number;
  recentlyExpired: number;
  newStoresThisMonth: number;
  newRegistrationsToday: number;
  churnRate: number;
  planDistribution: Array<{ name: string; value: number; color: string }>;
  recentStores: Array<{ month: string; count: number }>;
  alerts: Array<{ id: number; type: 'critical' | 'warning' | 'info'; title: string; message: string }>;
};

const PLAN_COLORS: Record<string, string> = {
  standard: '#0ea5e9',
  monthly: '#10b981',
  quarterly: '#f59e0b',
  yearly: '#1a5c3a',
  trial: '#94a3b8',
};

const PLAN_NAMES: Record<string, string> = {
  standard: '標準版', monthly: '月付', quarterly: '季付',
  yearly: '年付', trial: '試用', '無訂閱': '無訂閱',
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '早安';
  if (hour < 18) return '午安';
  return '晚安';
};

const EnterpriseAdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [storesRes, subsRes, todayUsersRes] = await Promise.all([
        supabase.from('stores').select('id, status, created_at'),
        supabase.from('store_subscriptions').select('id, status, plan_type, expires_at'),
        supabase.from('users').select('id', { count: 'exact', head: true })
          .gte('created_at', startOfToday.toISOString()),
      ]);

      const stores = storesRes.data || [];
      const subs = subsRes.data || [];
      const totalStores = stores.length;
      const activeStores = stores.filter(s => s.status === 'active').length;
      const activeSubs = subs.filter(s => s.status === 'active');
      const trialSubs = subs.filter(s => s.status === 'trial');
      const totalSubs = subs.length;
      const activeSubsCount = activeSubs.length;
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const expiringSoon = subs.filter(s =>
        (s.status === 'active' || s.status === 'trial') &&
        s.expires_at && new Date(s.expires_at) <= in30Days && new Date(s.expires_at) > now
      ).length;
      const recentlyExpired = subs.filter(s =>
        s.status === 'expired' &&
        s.expires_at && new Date(s.expires_at) >= fourteenDaysAgo
      ).length;
      const churnRate = totalSubs > 0 ? Math.round(((totalSubs - activeSubsCount) / totalSubs) * 100) : 0;

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const newStoresThisMonth = stores.filter(s => new Date(s.created_at) > oneMonthAgo).length;

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

      const planMap = activeSubs.reduce((acc, sub) => {
        const plan = sub.plan_type || 'standard';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const planDistribution = Object.entries(planMap).map(([name, value]) => ({
        name, value, color: PLAN_COLORS[name] || '#0ea5e9'
      }));

      const alerts: DashboardData['alerts'] = [];
      if (totalStores === 0) {
        alerts.push({ id: 1, type: 'warning', title: '尚無註冊店家', message: '系統目前沒有註冊的店家' });
      }
      if (churnRate > 20) {
        alerts.push({ id: 2, type: 'critical', title: '流失率過高', message: `當前流失率 ${churnRate}%，需要關注` });
      }
      alerts.push({ id: 3, type: 'info', title: '系統正常運作', message: `${totalStores} 家店鋪，${activeSubsCount} 個活躍訂閱` });

      setData({
        totalStores, activeStores, totalSubscriptions: totalSubs,
        activeSubscriptions: activeSubsCount,
        trialSubscriptions: trialSubs.length,
        expiringSoon,
        recentlyExpired,
        newStoresThisMonth,
        newRegistrationsToday: todayUsersRes.count ?? todayUsersRes.data?.length ?? 0,
        churnRate,
        planDistribution: planDistribution.length > 0 ? planDistribution : [{ name: '無訂閱', value: 0, color: '#94a3b8' }],
        recentStores, alerts,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Dashboard load failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !data) {
    return <AdminLoadingState fullPage message="正在載入儀表板" description="獲取最新數據中..." size="lg" />;
  }

  const activePct = data?.totalStores ? Math.round((data.activeStores / data.totalStores) * 100) : 0;

  return (
    <AdminPageWrapper>
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-0.5">
            <CalendarDays className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
            {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {getGreeting()}，管理員
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lastUpdated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <AdminButton variant="outline" size="sm" onClick={loadData} icon={RefreshCw}>刷新</AdminButton>
        </div>
      </div>

      {/* KPI */}
      <AdminStatsGrid columns={4}>
        {([
          { title: "總店家數", value: data?.totalStores || 0, icon: Store, color: 'primary' as StatColorKey, trend: data?.newStoresThisMonth, trendLabel: "本月新增" },
          { title: "活躍店家", value: data?.activeStores || 0, icon: Users, color: 'success' as StatColorKey, description: `佔比 ${activePct}%` },
          { title: "活躍訂閱", value: data?.activeSubscriptions || 0, icon: TrendingUp, color: 'info' as StatColorKey, description: `試用 ${data?.trialSubscriptions || 0} / 共 ${data?.totalSubscriptions || 0}` },
          { title: "流失率", value: `${data?.churnRate || 0}%`, icon: Activity, color: (data?.churnRate && data.churnRate > 15 ? "danger" : "success") as StatColorKey, description: `即將到期 ${data?.expiringSoon || 0} / 近期過期 ${data?.recentlyExpired || 0}` },
        ]).map((stat, i) => (
          <div key={stat.title} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
            <AdminStatsCard {...stat} />
          </div>
        ))}
      </AdminStatsGrid>

      {/* Main Grid: Alerts + Today */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AdminCard variant="elevated">
            <AdminCardHeader title="系統狀態" icon={<Activity className="w-4 h-4 text-primary" />} />
            <AdminCardContent>
              <div className="space-y-2">
                {data?.alerts.map((alert) => (
                  <div key={alert.id} className={cn(
                    'flex items-start gap-3 p-3.5 rounded-lg transition-colors',
                    alert.type === 'critical' ? 'bg-destructive/5 border border-destructive/10' :
                    alert.type === 'warning' ? 'bg-amber-50 border border-amber-200/50 dark:bg-amber-500/5 dark:border-amber-500/10' :
                    'bg-muted/30 border border-transparent'
                  )}>
                    {alert.type === 'critical' ? <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" /> :
                     alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" /> :
                     <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                    </div>
                    {alert.type !== 'info' && (
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </AdminCardContent>
          </AdminCard>
        </div>

        <AdminCard variant="elevated">
          <AdminCardHeader title="今日快報" icon={<Zap className="w-4 h-4 text-primary" />} />
          <AdminCardContent>
            <div className="space-y-4">
              <div className="text-center p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10">
                <div className="text-5xl font-black text-primary tracking-tighter leading-none">
                  +{data?.newRegistrationsToday || 0}
                </div>
                <p className="text-xs font-semibold text-primary/60 mt-2 uppercase tracking-wider">今日新註冊</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/40 border border-border/40">
                  <div className="text-lg font-bold text-foreground">{data?.newStoresThisMonth || 0}</div>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">本月新增</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/40 border border-border/40">
                  <div className="text-lg font-bold text-foreground">{data?.totalSubscriptions || 0}</div>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">總訂閱數</p>
                </div>
              </div>
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <AdminCard variant="elevated">
          <AdminCardHeader title="新增店家趨勢" description="最近 6 個月" icon={<TrendingUp className="w-4 h-4 text-primary" />} />
          <AdminCardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data?.recentStores} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis className="text-muted-foreground" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '8px', 
                    fontSize: '12px',
                    boxShadow: '0 8px 30px -8px rgba(0,0,0,0.08)'
                  }} 
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#areaGrad)" strokeWidth={2} name="新增店家" dot={{ r: 3, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))', strokeWidth: 2 }} activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--card))' }} />
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </AdminCardContent>
        </AdminCard>

        <AdminCard variant="elevated">
          <AdminCardHeader title="訂閱方案分佈" icon={<Store className="w-4 h-4 text-primary" />} />
          <AdminCardContent>
            <div className="flex items-center gap-8">
              <div className="relative flex-shrink-0">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={data?.planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {data?.planDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-foreground leading-none">{data?.activeSubscriptions || 0}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">活躍</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {data?.planDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-foreground font-medium">{PLAN_NAMES[item.name] || item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>
    </AdminPageWrapper>
  );
};

export default EnterpriseAdminDashboard;
