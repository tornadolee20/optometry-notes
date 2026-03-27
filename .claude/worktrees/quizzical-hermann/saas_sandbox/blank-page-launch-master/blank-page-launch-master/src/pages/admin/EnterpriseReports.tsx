import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Store,
  Target,
  Award,
  Download,
  RefreshCw,
  Calendar,
  Activity,
  Eye,
  Globe,
  Hash,
  Clock,
  UserPlus
} from "lucide-react";
import { 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { toast } from "@/hooks/use-toast";
import { 
  realAnalyticsService,
  type RealBusinessMetrics, 
  type IndustryBreakdown,
  type CustomerAcquisitionData 
} from '@/services/realAnalyticsService';

const EnterpriseReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [businessMetrics, setBusinessMetrics] = useState<RealBusinessMetrics | null>(null);
  const [industryData, setIndustryData] = useState<IndustryBreakdown[]>([]);
  const [acquisitionData, setAcquisitionData] = useState<CustomerAcquisitionData[]>([]);
  const [keywordStats, setKeywordStats] = useState<any>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadRealData();
  }, [selectedTimeRange]);

  const loadRealData = async () => {
    setIsLoading(true);
    try {
      // 並行載入所有數據
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

      toast({
        title: "數據已更新",
        description: "所有報表數據已成功載入最新數據"
      });

    } catch (error) {
      console.error('Error loading real data:', error);
      toast({
        variant: "destructive",
        title: "數據載入失敗",
        description: "無法載入報表數據，請稍後再試"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 更新每日指標
  const updateDailyMetrics = async () => {
    try {
      await realAnalyticsService.updateDailyMetrics();
      loadRealData();
      toast({
        title: "指標已更新",
        description: "每日業務指標已重新計算"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失敗",
        description: "無法更新每日指標"
      });
    }
  };

  // 實時指標卡片
  const MetricCard = ({ 
    title, 
    value, 
    change, 
    trend, 
    icon: Icon, 
    color, 
    format = 'number',
    subtitle 
  }: {
    title: string;
    value: number;
    change?: string;
    trend?: 'up' | 'down' | 'stable';
    icon: React.ComponentType<any>;
    color: string;
    format?: string;
    subtitle?: string;
  }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {change && (
            <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}>
              {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
              {change}
            </Badge>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">
            {format === 'currency' ? `¥${value.toLocaleString()}` :
             format === 'percentage' ? `${value}%` :
             format === 'decimal' ? value.toFixed(2) :
             typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">正在載入真實數據...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* 報表控制台 */}
      <div className="bg-background/90 backdrop-blur-xl border-b sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-xl">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">真實數據企業報表</h1>
                <p className="text-sm text-muted-foreground">
                  基於實際業務數據的深度分析 • 最後更新: {lastUpdated.toLocaleTimeString('zh-TW')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7天</SelectItem>
                  <SelectItem value="30">30天</SelectItem>
                  <SelectItem value="90">90天</SelectItem>
                  <SelectItem value="180">180天</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={updateDailyMetrics}>
                <Activity className="w-4 h-4 mr-2" />
                更新指標
              </Button>
              
              <Button variant="outline" size="sm" onClick={loadRealData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新數據
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                導出報表
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* 核心業務指標 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <MetricCard
            title="總店家數"
            value={businessMetrics?.totalStores || 0}
            change={businessMetrics?.newStoresThisMonth ? `+${businessMetrics.newStoresThisMonth} 本月` : undefined}
            trend="up"
            icon={Store}
            color="from-blue-500 to-blue-600"
            subtitle={`${businessMetrics?.activeStores || 0} 家活躍`}
          />
          
          <MetricCard
            title="新客戶 (本週)"
            value={businessMetrics?.newStoresThisWeek || 0}
            change={businessMetrics?.newStoresThisMonth ? `${businessMetrics.newStoresThisMonth} 本月` : undefined}
            trend="up"
            icon={UserPlus}
            color="from-emerald-500 to-emerald-600"
            subtitle="新註冊店家"
          />
          
          <MetricCard
            title="訂閱轉換率"
            value={businessMetrics?.totalStores && businessMetrics.totalSubscriptions ? 
              Math.round((businessMetrics.totalSubscriptions / businessMetrics.totalStores) * 100) : 0}
            change="轉換統計"
            trend="up"
            icon={Target}
            color="from-orange-500 to-orange-600"
            format="percentage"
            subtitle={`${businessMetrics?.activeSubscriptions || 0} 活躍訂閱`}
          />
          
          <MetricCard
            title="今日關鍵字使用"
            value={businessMetrics?.keywordUsageToday || 0}
            change={businessMetrics?.avgKeywordsPerSession ? 
              `平均 ${businessMetrics.avgKeywordsPerSession} 個/次` : undefined}
            trend="up"
            icon={Hash}
            color="from-purple-500 to-purple-600"
            subtitle={`${businessMetrics?.reviewGenerationsToday || 0} 次評論生成`}
          />
        </motion.div>

        {/* 詳細報表選項卡 */}
        <Tabs value={selectedReport} onValueChange={setSelectedReport} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-background shadow-lg rounded-xl p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              總覽
            </TabsTrigger>
            <TabsTrigger value="acquisition" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              新客戶獲取
            </TabsTrigger>
            <TabsTrigger value="industries" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              行業分析
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              關鍵字分析
            </TabsTrigger>
          </TabsList>

          {/* 總覽報表 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* 新客戶獲取趨勢 */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    新客戶獲取趨勢 ({selectedTimeRange}天)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={acquisitionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="newStores" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                        name="新店家"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="newSubscriptions" 
                        stroke="hsl(var(--emerald-500))" 
                        fill="hsl(var(--emerald-500))"
                        fillOpacity={0.6}
                        name="新訂閱"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 行業分佈 */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    行業分佈統計
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {industryData.slice(0, 6).map((industry, index) => (
                      <div key={industry.industry} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ 
                              backgroundColor: [
                                'hsl(var(--primary))',
                                'hsl(var(--emerald-500))',
                                'hsl(var(--orange-500))',
                                'hsl(var(--purple-500))',
                                'hsl(var(--red-500))',
                                'hsl(var(--blue-500))'
                              ][index % 6]
                            }}
                          />
                          <span className="font-medium">{industry.industry}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{industry.count}</div>
                          <div className="text-sm text-muted-foreground">
                            {industry.percentage}% • {industry.activeCount} 活躍
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 新客戶獲取分析 */}
          <TabsContent value="acquisition" className="space-y-6">
            <div className="grid gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    新客戶獲取詳細分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={acquisitionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="newStores" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        name="新註冊店家"
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="newSubscriptions" 
                        stroke="hsl(var(--emerald-500))" 
                        strokeWidth={3}
                        name="新付費用戶"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="conversionRate" 
                        stroke="hsl(var(--orange-500))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="轉換率 (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 關鍵指標摘要 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="text-center">
                    <UserPlus className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {businessMetrics?.newStoresThisMonth || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">本月新客戶</div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5">
                  <div className="text-center">
                    <Target className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {businessMetrics?.totalStores && businessMetrics.totalSubscriptions ? 
                        Math.round((businessMetrics.totalSubscriptions / businessMetrics.totalStores) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">整體轉換率</div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-orange-500/5">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {businessMetrics?.newStoresThisWeek || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">本週新客戶</div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 行業分析 */}
          <TabsContent value="industries" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    行業分佈圓餅圖
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={industryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {industryData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={[
                            'hsl(var(--primary))',
                            'hsl(var(--emerald-500))',
                            'hsl(var(--orange-500))',
                            'hsl(var(--purple-500))',
                            'hsl(var(--red-500))',
                            'hsl(var(--blue-500))'
                          ][index % 6]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    行業活躍度分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {industryData.map((industry) => (
                      <div key={industry.industry} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{industry.industry}</span>
                          <Badge variant="outline">
                            {industry.count} 店家
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>活躍度: {industry.activeCount}/{industry.count}</span>
                            <span>{Math.round((industry.activeCount / industry.count) * 100)}%</span>
                          </div>
                        </div>
                        <Progress 
                          value={(industry.activeCount / industry.count) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 關鍵字分析 */}
          <TabsContent value="keywords" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-primary" />
                    關鍵字使用統計
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {keywordStats?.totalSessions || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">總使用次數</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">
                        {keywordStats?.avgKeywordsPerSession || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">平均關鍵字/次</div>
                    </div>
                  </div>
                  
                  {keywordStats?.dailyUsage && (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={keywordStats.dailyUsage}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    熱門關鍵字排行
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {keywordStats?.topKeywords?.slice(0, 8).map((item: any, index: number) => (
                      <div key={item.keyword} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            index < 3 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-medium">{item.keyword}</span>
                        </div>
                        <Badge variant="outline">
                          {item.count} 次
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnterpriseReports;