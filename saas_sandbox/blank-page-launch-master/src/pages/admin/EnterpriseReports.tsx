import { useState, useEffect } from "react";
import { 
  TrendingUp, Store, Target, Award, Download, 
  RefreshCw, Calendar, Activity, Eye, Globe, Hash, Clock, UserPlus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ResponsiveContainer, LineChart, Line, Area, AreaChart, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { toast } from "@/hooks/use-toast";
import { 
  realAnalyticsService,
  type RealBusinessMetrics, 
  type IndustryBreakdown,
  type CustomerAcquisitionData 
} from '@/services/realAnalyticsService';

import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { AdminCard, AdminCardHeader, AdminCardContent } from "@/components/admin/AdminCard";
import { AdminStatsCard, AdminStatsGrid } from "@/components/admin/AdminStatsCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { cn } from "@/lib/utils";

const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '10px',
  fontSize: '12px',
  boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)',
};

const CHART_COLORS = [
  'hsl(var(--primary))',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#3b82f6',
];

const EnterpriseReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [businessMetrics, setBusinessMetrics] = useState<RealBusinessMetrics | null>(null);
  const [industryData, setIndustryData] = useState<IndustryBreakdown[]>([]);
  const [acquisitionData, setAcquisitionData] = useState<CustomerAcquisitionData[]>([]);
  const [keywordStats, setKeywordStats] = useState<{
    totalSessions: number;
    avgKeywordsPerSession: number;
    dailyUsage: { date: string; count: number }[];
    topKeywords: { keyword: string; count: number }[];
  } | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => { loadRealData(); }, [selectedTimeRange]);

  const loadRealData = async () => {
    setIsLoading(true);
    try {
      const [metrics, industries, acquisitions, keywords] = await Promise.all([
        realAnalyticsService.getBusinessMetrics(),
        realAnalyticsService.getIndustryBreakdown(),
        realAnalyticsService.getCustomerAcquisitionTimeSeries(parseInt(selectedTimeRange)),
        realAnalyticsService.getKeywordUsageStats(7)
      ]);
      setBusinessMetrics(metrics);
      setIndustryData(industries);
      setAcquisitionData(acquisitions);
      setKeywordStats(keywords);
      setLastUpdated(new Date());
      toast({ title: "數據已更新", description: "報表數據已載入最新數據" });
    } catch (error) {
      console.error('Error loading real data:', error);
      toast({ variant: "destructive", title: "數據載入失敗", description: "無法載入報表數據" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateDailyMetrics = async () => {
    try {
      await realAnalyticsService.updateDailyMetrics();
      loadRealData();
      toast({ title: "指標已更新", description: "每日業務指標已重新計算" });
    } catch (error) {
      toast({ variant: "destructive", title: "更新失敗" });
    }
  };

  if (isLoading) {
    return <AdminLoadingState fullPage message="正在載入真實數據" description="分析報表生成中..." size="lg" />;
  }

  const conversionRate = businessMetrics?.totalStores && businessMetrics.totalSubscriptions
    ? Math.round((businessMetrics.totalSubscriptions / businessMetrics.totalStores) * 100) : 0;

  return (
    <AdminPageWrapper>
      {/* Clean page header - aligned with Dashboard style */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">數據報表</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            基於實際業務數據的深度分析
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <Clock className="h-3 w-3" />
            <span>{lastUpdated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 天</SelectItem>
              <SelectItem value="30">30 天</SelectItem>
              <SelectItem value="90">90 天</SelectItem>
              <SelectItem value="180">180 天</SelectItem>
            </SelectContent>
          </Select>
          <AdminButton variant="outline" size="sm" onClick={updateDailyMetrics} icon={Activity}>更新</AdminButton>
          <AdminButton variant="outline" size="sm" onClick={loadRealData} icon={RefreshCw}>刷新</AdminButton>
          <AdminButton variant="outline" size="sm" icon={Download}>導出</AdminButton>
        </div>
      </div>

      {/* KPI Stats with stagger */}
      <AdminStatsGrid columns={4}>
        <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
          <AdminStatsCard title="總店家數" value={businessMetrics?.totalStores || 0} icon={Store} color="info" trend={businessMetrics?.newStoresThisMonth} trendLabel="本月新增" description={`${businessMetrics?.activeStores || 0} 家活躍`} />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
          <AdminStatsCard title="新客戶 (本週)" value={businessMetrics?.newStoresThisWeek || 0} icon={UserPlus} color="success" description="新註冊店家" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '160ms', animationFillMode: 'both' }}>
          <AdminStatsCard title="訂閱轉換率" value={`${conversionRate}%`} icon={Target} color="warning" description={`${businessMetrics?.activeSubscriptions || 0} 活躍訂閱`} />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '240ms', animationFillMode: 'both' }}>
          <AdminStatsCard title="今日關鍵字" value={businessMetrics?.keywordUsageToday || 0} icon={Hash} color="purple" description={`${businessMetrics?.reviewGenerationsToday || 0} 次評論`} />
        </div>
      </AdminStatsGrid>

      {/* Tabs */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport} className="space-y-5">
        <TabsList className="bg-muted/50 p-1 h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs data-[state=active]:shadow-sm px-4 py-2"><Eye className="w-3.5 h-3.5" />總覽</TabsTrigger>
          <TabsTrigger value="acquisition" className="flex items-center gap-1.5 text-xs data-[state=active]:shadow-sm px-4 py-2"><UserPlus className="w-3.5 h-3.5" />客戶獲取</TabsTrigger>
          <TabsTrigger value="industries" className="flex items-center gap-1.5 text-xs data-[state=active]:shadow-sm px-4 py-2"><Globe className="w-3.5 h-3.5" />行業分析</TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-1.5 text-xs data-[state=active]:shadow-sm px-4 py-2"><Hash className="w-3.5 h-3.5" />關鍵字</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <AdminCard variant="elevated">
              <AdminCardHeader title={`客戶獲取趨勢`} description={`過去 ${selectedTimeRange} 天`} icon={<TrendingUp className="w-4 h-4 text-primary" />} />
              <AdminCardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={acquisitionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="period" className="text-muted-foreground" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis className="text-muted-foreground" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="newStores" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} name="新店家" />
                    <Area type="monotone" dataKey="newSubscriptions" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} name="新訂閱" />
                  </AreaChart>
                </ResponsiveContainer>
              </AdminCardContent>
            </AdminCard>

            <AdminCard variant="elevated">
              <AdminCardHeader title="行業分佈" icon={<Globe className="w-4 h-4 text-primary" />} />
              <AdminCardContent>
                <div className="space-y-3">
                  {industryData.slice(0, 6).map((industry, index) => (
                    <div key={industry.industry} className="flex items-center gap-3 group">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: CHART_COLORS[index % 6] }} />
                      <span className="text-sm font-medium text-foreground flex-1 truncate">{industry.industry}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{industry.percentage}%</span>
                        <span className="text-sm font-bold text-foreground w-6 text-right">{industry.count}</span>
                      </div>
                    </div>
                  ))}
                  {industryData.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">尚無行業數據</p>
                  )}
                </div>
              </AdminCardContent>
            </AdminCard>
          </div>
        </TabsContent>

        {/* Acquisition */}
        <TabsContent value="acquisition" className="space-y-4">
          <AdminCard variant="elevated">
            <AdminCardHeader title="客戶獲取詳細分析" icon={<UserPlus className="w-4 h-4 text-primary" />} />
            <AdminCardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={acquisitionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="period" className="text-muted-foreground" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" className="text-muted-foreground" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" className="text-muted-foreground" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="newStores" stroke="hsl(var(--primary))" strokeWidth={2.5} name="新註冊店家" dot={{ r: 3 }} />
                  <Line yAxisId="left" type="monotone" dataKey="newSubscriptions" stroke="#10b981" strokeWidth={2.5} name="新付費用戶" dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" name="轉換率 (%)" />
                </LineChart>
              </ResponsiveContainer>
            </AdminCardContent>
          </AdminCard>

          <AdminStatsGrid columns={3}>
            <AdminStatsCard title="本月新客戶" value={businessMetrics?.newStoresThisMonth || 0} icon={UserPlus} color="primary" />
            <AdminStatsCard title="整體轉換率" value={`${conversionRate}%`} icon={Target} color="success" />
            <AdminStatsCard title="本週新客戶" value={businessMetrics?.newStoresThisWeek || 0} icon={Clock} color="warning" />
          </AdminStatsGrid>
        </TabsContent>

        {/* Industries */}
        <TabsContent value="industries" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <AdminCard variant="elevated">
              <AdminCardHeader title="行業分佈" icon={<Globe className="w-4 h-4 text-primary" />} />
              <AdminCardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={industryData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="count" strokeWidth={0}>
                      {industryData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </AdminCardContent>
            </AdminCard>

            <AdminCard variant="elevated">
              <AdminCardHeader title="行業活躍度" icon={<Activity className="w-4 h-4 text-primary" />} />
              <AdminCardContent>
                <div className="space-y-3">
                  {industryData.map((industry) => {
                    const pct = industry.count > 0 ? Math.round((industry.activeCount / industry.count) * 100) : 0;
                    return (
                      <div key={industry.industry} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-foreground">{industry.industry}</span>
                          <Badge variant="outline" className="text-[10px] h-5">{industry.count} 店家</Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                          <span>{industry.activeCount}/{industry.count} 活躍</span>
                          <span className="font-medium">{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </AdminCardContent>
            </AdminCard>
          </div>
        </TabsContent>

        {/* Keywords */}
        <TabsContent value="keywords" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <AdminCard variant="elevated">
              <AdminCardHeader title="關鍵字使用統計" icon={<Hash className="w-4 h-4 text-primary" />} />
              <AdminCardContent>
                <AdminStatsGrid columns={2} className="mb-5">
                  <AdminStatsCard title="總使用次數" value={keywordStats?.totalSessions || 0} icon={Hash} color="primary" compact />
                  <AdminStatsCard title="平均/次" value={keywordStats?.avgKeywordsPerSession || 0} icon={Activity} color="success" compact />
                </AdminStatsGrid>
                {keywordStats?.dailyUsage && (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={keywordStats.dailyUsage} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis dataKey="date" className="text-muted-foreground" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis className="text-muted-foreground" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </AdminCardContent>
            </AdminCard>

            <AdminCard variant="elevated">
              <AdminCardHeader title="熱門關鍵字" icon={<Award className="w-4 h-4 text-primary" />} />
              <AdminCardContent>
                <div className="space-y-2">
                  {keywordStats?.topKeywords?.slice(0, 8).map((item, index) => (
                    <div key={item.keyword} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold',
                          index < 3 
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' 
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-foreground">{item.keyword}</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{item.count}次</span>
                    </div>
                  ))}
                  {(!keywordStats?.topKeywords || keywordStats.topKeywords.length === 0) && (
                    <div className="text-center py-8">
                      <Hash className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground">尚無關鍵字數據</p>
                    </div>
                  )}
                </div>
              </AdminCardContent>
            </AdminCard>
          </div>
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  );
};

export default EnterpriseReports;
