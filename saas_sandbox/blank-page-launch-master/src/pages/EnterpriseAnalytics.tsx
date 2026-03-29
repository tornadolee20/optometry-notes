import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BarChart3, TrendingUp, Hash, Activity, Clock,
  RefreshCw, Store
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { AdminCard, AdminCardHeader, AdminCardContent } from "@/components/admin/AdminCard";
import { AdminStatsCard, AdminStatsGrid } from "@/components/admin/AdminStatsCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { toast } from "@/hooks/use-toast";

// ========== Types ==========
interface StoreOverview {
  storeName: string;
  industry: string | null;
  status: string | null;
  createdAt: string;
}

interface SubscriptionInfo {
  planType: string;
  status: string | null;
  expiresAt: string;
}

interface KeywordStat {
  date: string;
  count: number;
}

interface TopKeyword {
  keyword: string;
  count: number;
}

interface ActivityLogEntry {
  id: string;
  activityType: string;
  description: string | null;
  createdAt: string;
}

interface StoreAnalyticsData {
  store: StoreOverview;
  subscription: SubscriptionInfo | null;
  keywordCount: number;
  recentKeywordSessions: number;
  keywordDailyUsage: KeywordStat[];
  topKeywords: TopKeyword[];
  recentActivity: ActivityLogEntry[];
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '10px',
  fontSize: '12px',
  boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)',
};

const PLAN_COLORS: Record<string, string> = {
  trial: '#94a3b8',
  monthly: '#10b981',
  quarterly: '#f59e0b',
  yearly: '#1a5c3a',
  standard: '#0ea5e9',
};

const PLAN_NAMES: Record<string, string> = {
  trial: '試用', monthly: '月付', quarterly: '季付', yearly: '年付', standard: '標準',
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active: { label: '活躍', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  trial: { label: '試用中', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  expired: { label: '已過期', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  canceled: { label: '已取消', className: 'bg-muted text-muted-foreground' },
};

const EnterpriseAnalytics = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<StoreAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { if (storeId) loadData(); }, [storeId]);

  const loadData = async () => {
    if (!storeId) return;
    setIsLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [storeRes, subRes, keywordsRes, sessionsRes, activityRes] = await Promise.all([
        supabase.from('stores').select('store_name, industry, status, created_at').eq('id', storeId).single(),
        supabase.from('store_subscriptions').select('plan_type, status, expires_at').eq('store_id', storeId).limit(1).maybeSingle(),
        supabase.from('store_keywords').select('keyword, usage_count').eq('store_id', storeId),
        supabase.from('customer_keyword_logs').select('created_at, selected_keywords').eq('store_id', storeId).gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('activity_logs').select('id, activity_type, description, created_at').eq('entity_id', storeId).eq('entity_type', 'store').order('created_at', { ascending: false }).limit(20),
      ]);

      if (storeRes.error) throw storeRes.error;

      // Build keyword daily usage
      const dailyMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyMap.set(d.toISOString().split('T')[0], 0);
      }
      const sessions = sessionsRes.data || [];
      sessions.forEach(s => {
        const dateStr = new Date(s.created_at).toISOString().split('T')[0];
        if (dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
        }
      });

      // Top keywords from keyword logs
      const kwFreq = new Map<string, number>();
      sessions.forEach(s => {
        (s.selected_keywords || []).forEach((kw: string) => {
          kwFreq.set(kw, (kwFreq.get(kw) || 0) + 1);
        });
      });
      const topKeywords = Array.from(kwFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));

      setData({
        store: {
          storeName: storeRes.data.store_name,
          industry: storeRes.data.industry,
          status: storeRes.data.status,
          createdAt: storeRes.data.created_at,
        },
        subscription: subRes.data ? {
          planType: subRes.data.plan_type,
          status: subRes.data.status,
          expiresAt: subRes.data.expires_at,
        } : null,
        keywordCount: keywordsRes.data?.length || 0,
        recentKeywordSessions: sessions.length,
        keywordDailyUsage: Array.from(dailyMap.entries()).map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
          count,
        })),
        topKeywords,
        recentActivity: (activityRes.data || []).map(a => ({
          id: a.id,
          activityType: a.activity_type,
          description: a.description,
          createdAt: a.created_at || new Date().toISOString(),
        })),
      });
    } catch (error) {
      console.error('Error loading store analytics:', error);
      toast({ variant: "destructive", title: "載入失敗", description: "無法載入店家分析數據" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <AdminLoadingState fullPage message="載入分析數據" description="正在查詢店家資料..." size="lg" />;
  }

  if (!data) {
    return (
      <AdminPageWrapper>
        <div className="text-center py-16">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground">找不到店家</h2>
          <p className="text-sm text-muted-foreground mt-1">無法載入此店家的分析數據</p>
          <AdminButton variant="outline" className="mt-4" onClick={() => navigate(-1)}>返回</AdminButton>
        </div>
      </AdminPageWrapper>
    );
  }

  const subStatus = data.subscription?.status || 'none';
  const subInfo = STATUS_MAP[subStatus] || { label: '無訂閱', className: 'bg-muted text-muted-foreground' };
  const daysUntilExpiry = data.subscription?.expiresAt
    ? Math.ceil((new Date(data.subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const planData = data.subscription ? [
    { name: PLAN_NAMES[data.subscription.planType] || data.subscription.planType, value: 1, color: PLAN_COLORS[data.subscription.planType] || '#0ea5e9' }
  ] : [];

  return (
    <AdminPageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <AdminButton variant="ghost" size="sm" onClick={() => navigate(-1)} icon={ArrowLeft}>返回</AdminButton>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{data.store.storeName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data.store.industry || '未分類'} · 建立於 {new Date(data.store.createdAt).toLocaleDateString('zh-TW')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={subInfo.className}>{subInfo.label}</Badge>
          <AdminButton variant="outline" size="sm" onClick={loadData} icon={RefreshCw}>刷新</AdminButton>
        </div>
      </div>

      {/* KPI */}
      <AdminStatsGrid columns={4}>
        <AdminStatsCard title="關鍵字數量" value={data.keywordCount} icon={Hash} color="primary" />
        <AdminStatsCard title="近 7 日評論請求" value={data.recentKeywordSessions} icon={Activity} color="info" />
        <AdminStatsCard
          title="訂閱方案"
          value={data.subscription ? (PLAN_NAMES[data.subscription.planType] || data.subscription.planType) : '無'}
          icon={Store}
          color="success"
          description={daysUntilExpiry !== null ? `${daysUntilExpiry > 0 ? `剩餘 ${daysUntilExpiry} 天` : '已到期'}` : undefined}
        />
        <AdminStatsCard title="活動記錄" value={data.recentActivity.length} icon={Clock} color="warning" description="最近 20 筆" />
      </AdminStatsGrid>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="bg-muted/50 p-1 h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs px-4 py-2"><BarChart3 className="w-3.5 h-3.5" />總覽</TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-1.5 text-xs px-4 py-2"><Hash className="w-3.5 h-3.5" />關鍵字</TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1.5 text-xs px-4 py-2"><Activity className="w-3.5 h-3.5" />活動記錄</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <AdminCard variant="elevated">
              <AdminCardHeader title="近 7 日評論請求趨勢" icon={<TrendingUp className="w-4 h-4 text-primary" />} />
              <AdminCardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data.keywordDailyUsage} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#storeAreaGrad)" strokeWidth={2} name="請求數" />
                    <defs>
                      <linearGradient id="storeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </AdminCardContent>
            </AdminCard>

            <AdminCard variant="elevated">
              <AdminCardHeader title="訂閱資訊" icon={<Store className="w-4 h-4 text-primary" />} />
              <AdminCardContent>
                {data.subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <ResponsiveContainer width={100} height={100}>
                          <PieChart>
                            <Pie data={planData} cx="50%" cy="50%" innerRadius={32} outerRadius={45} dataKey="value" strokeWidth={0}>
                              {planData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">方案</span>
                          <span className="text-sm font-bold text-foreground">{PLAN_NAMES[data.subscription.planType] || data.subscription.planType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">狀態</span>
                          <Badge className={subInfo.className}>{subInfo.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">到期日</span>
                          <span className="text-sm text-foreground">{new Date(data.subscription.expiresAt).toLocaleDateString('zh-TW')}</span>
                        </div>
                        {daysUntilExpiry !== null && (
                          <div>
                            <Progress value={Math.max(0, Math.min(100, daysUntilExpiry > 0 ? (daysUntilExpiry / 30) * 100 : 0))} className="h-1.5 mt-1" />
                            <span className="text-[10px] text-muted-foreground">{daysUntilExpiry > 0 ? `剩餘 ${daysUntilExpiry} 天` : '已到期'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Store className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">尚無訂閱</p>
                  </div>
                )}
              </AdminCardContent>
            </AdminCard>
          </div>
        </TabsContent>

        {/* Keywords */}
        <TabsContent value="keywords" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <AdminCard variant="elevated">
              <AdminCardHeader title="每日關鍵字使用" icon={<Hash className="w-4 h-4 text-primary" />} />
              <AdminCardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.keywordDailyUsage} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="使用次數" />
                  </BarChart>
                </ResponsiveContainer>
              </AdminCardContent>
            </AdminCard>

            <AdminCard variant="elevated">
              <AdminCardHeader title="熱門選用關鍵字" description="近 7 天" icon={<TrendingUp className="w-4 h-4 text-primary" />} />
              <AdminCardContent>
                <div className="space-y-2">
                  {data.topKeywords.length > 0 ? data.topKeywords.map((kw, i) => (
                    <div key={kw.keyword} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                          i < 3 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-muted text-muted-foreground'
                        }`}>{i + 1}</div>
                        <span className="text-sm font-medium text-foreground">{kw.keyword}</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{kw.count}次</span>
                    </div>
                  )) : (
                    <p className="text-center text-sm text-muted-foreground py-8">近 7 天無關鍵字選用記錄</p>
                  )}
                </div>
              </AdminCardContent>
            </AdminCard>
          </div>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity" className="space-y-4">
          <AdminCard variant="elevated">
            <AdminCardHeader title="近期活動記錄" icon={<Activity className="w-4 h-4 text-primary" />} />
            <AdminCardContent>
              {data.recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {data.recentActivity.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                      <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{log.activityType}</p>
                        {log.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.description}</p>}
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {new Date(log.createdAt).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">尚無活動記錄</p>
              )}
            </AdminCardContent>
          </AdminCard>
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  );
};

export default EnterpriseAnalytics;
