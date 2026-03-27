import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
   
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Star,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalUsers: number;
    totalOrders: number;
    averageRating: number;
    trends: {
      revenue: number;
      users: number;
      orders: number;
      rating: number;
    };
  };
  charts: {
    revenueOverTime: Array<{ date: string; revenue: number; orders: number }>;
    userAcquisition: Array<{ date: string; newUsers: number; totalUsers: number }>;
    planDistribution: Array<{ name: string; value: number; color: string }>;
    industryBreakdown: Array<{ industry: string; stores: number; revenue: number }>;
    performanceMetrics: Array<{ 
      date: string; 
      avgResponseTime: number; 
      errorRate: number; 
      uptime: number 
    }>;
  };
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

type TimeRange = '7d' | '30d' | '90d' | 'custom';
type MetricType = 'revenue' | 'users' | 'performance' | 'satisfaction';

export const AdvancedAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [metricType, setMetricType] = useState<MetricType>('revenue');
  
  const [isLoading, setIsLoading] = useState(true);

  // 模擬分析數據生成
  const generateMockData = (range: TimeRange): AnalyticsData => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 30;
    
    // 生成時間序列數據
    const generateTimeSeriesData = (days: number) => {
      return Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return date.toISOString().split('T')[0];
      });
    };

    const dates = generateTimeSeriesData(days);

    return {
      overview: {
        totalRevenue: Math.floor(Math.random() * 100000 + 50000),
        totalUsers: Math.floor(Math.random() * 5000 + 1000),
        totalOrders: Math.floor(Math.random() * 10000 + 5000),
        averageRating: Math.random() * 1 + 4,
        trends: {
          revenue: Math.random() * 20 - 10,
          users: Math.random() * 15 - 5,
          orders: Math.random() * 25 - 10,
          rating: Math.random() * 0.5 - 0.25,
        }
      },
      charts: {
        revenueOverTime: dates.map(date => ({
          date,
          revenue: Math.floor(Math.random() * 5000 + 1000),
          orders: Math.floor(Math.random() * 200 + 50)
        })),
        userAcquisition: dates.map((date, i) => ({
          date,
          newUsers: Math.floor(Math.random() * 100 + 20),
          totalUsers: 1000 + i * Math.floor(Math.random() * 50 + 10)
        })),
        planDistribution: [
          { name: '基礎版', value: 45, color: '#8884d8' },
          { name: '專業版', value: 35, color: '#82ca9d' },
          { name: '企業版', value: 20, color: '#ffc658' }
        ],
        industryBreakdown: [
          { industry: '餐飲業', stores: 150, revenue: 45000 },
          { industry: '零售業', stores: 120, revenue: 38000 },
          { industry: '服務業', stores: 90, revenue: 28000 },
          { industry: '醫療業', stores: 60, revenue: 22000 },
          { industry: '教育業', stores: 40, revenue: 15000 }
        ],
        performanceMetrics: dates.slice(-30).map(date => ({
          date,
          avgResponseTime: Math.random() * 200 + 100,
          errorRate: Math.random() * 5,
          uptime: Math.random() * 2 + 98
        }))
      },
      insights: [
        {
          type: 'positive',
          title: '營收成長強勁',
          description: '本月營收相比上月成長 23%，主要來自企業版訂閱增加',
          impact: 'high'
        },
        {
          type: 'negative',
          title: 'API 錯誤率上升',
          description: '過去一週 API 錯誤率增加至 3.2%，需要檢查服務穩定性',
          impact: 'medium'
        },
        {
          type: 'neutral',
          title: '用戶留存率穩定',
          description: '月活躍用戶留存率維持在 85%，符合行業平均水準',
          impact: 'low'
        },
        {
          type: 'positive',
          title: '客戶滿意度提升',
          description: '平均評分提升至 4.6 分，客戶滿意度達到新高',
          impact: 'high'
        }
      ]
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(generateMockData(timeRange));
      setIsLoading(false);
    };

    loadData();
  }, [timeRange]);

  const formatTrend = (value: number) => {
    const isPositive = value > 0;
    const icon = isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span className="text-xs font-medium">
          {Math.abs(value).toFixed(1)}%
        </span>
      </div>
    );
  };

  const getInsightIcon = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'neutral':
        return <Download className="h-4 w-4 text-blue-600" />;
    }
  };

  const getInsightColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'negative':
        return 'border-red-200 bg-red-50';
      case 'neutral':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const exportData = () => {
    if (!data) return;
    
    // 生成 CSV 數據
    const csvData = data.charts.revenueOverTime.map(item => 
      `${item.date},${item.revenue},${item.orders}`
    ).join('\n');
    
    const csv = 'Date,Revenue,Orders\n' + csvData;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `analytics_${timeRange}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-xl font-bold">進階分析報表</CardTitle>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">過去 7 天</SelectItem>
                  <SelectItem value="30d">過去 30 天</SelectItem>
                  <SelectItem value="90d">過去 90 天</SelectItem>
                  <SelectItem value="custom">自訂範圍</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={metricType} onValueChange={(value: MetricType) => setMetricType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">營收</SelectItem>
                  <SelectItem value="users">用戶</SelectItem>
                  <SelectItem value="performance">效能</SelectItem>
                  <SelectItem value="satisfaction">滿意度</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                匯出
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 關鍵指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總營收</p>
                  <p className="text-2xl font-bold">
                    NT$ {data.overview.totalRevenue.toLocaleString()}
                  </p>
                  {formatTrend(data.overview.trends.revenue)}
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總用戶數</p>
                  <p className="text-2xl font-bold">
                    {data.overview.totalUsers.toLocaleString()}
                  </p>
                  {formatTrend(data.overview.trends.users)}
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總訂單數</p>
                  <p className="text-2xl font-bold">
                    {data.overview.totalOrders.toLocaleString()}
                  </p>
                  {formatTrend(data.overview.trends.orders)}
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均評分</p>
                  <p className="text-2xl font-bold">
                    {data.overview.averageRating.toFixed(1)}
                  </p>
                  {formatTrend(data.overview.trends.rating)}
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 營收趨勢 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">營收趨勢</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.charts.revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 用戶增長 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">用戶增長</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.charts.userAcquisition}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="totalUsers" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 方案分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">訂閱方案分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.charts.planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.charts.planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 行業分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">行業分析</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.charts.industryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="industry" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stores" fill="#8884d8" />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 洞察分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">智能洞察</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={insight.impact === 'high' ? 'destructive' : 
                                   insight.impact === 'medium' ? 'default' : 'secondary'}>
                        {insight.impact === 'high' ? '高' : 
                         insight.impact === 'medium' ? '中' : '低'} 影響
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};