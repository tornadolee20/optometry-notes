import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Star,
  MessageSquare,
  Target,
  Award,
  Sparkles,
  RefreshCw,
  Download,
  Eye,
  Heart,
  Zap
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsData {
  storeId: string;
  storeName: string;
  totalReviews: number;
  averageRating: number;
  monthlyGrowth: number;
  responseRate: number;
  keywordUsage: Array<{
    keyword: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  reviewTrends: Array<{
    date: string;
    reviews: number;
    rating: number;
  }>;
  industryComparison: {
    position: number;
    totalCompetitors: number;
    percentile: number;
  };
}

const Analytics = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange] = useState('30d');

  // 模擬數據 - 在實際應用中這些會來自API
  const mockAnalyticsData: AnalyticsData = {
    storeId: storeId || '1',
    storeName: '王家小館',
    totalReviews: 148,
    averageRating: 4.7,
    monthlyGrowth: 23,
    responseRate: 89,
    keywordUsage: [
      { keyword: '美味', count: 45, trend: 'up' },
      { keyword: '服務親切', count: 38, trend: 'up' },
      { keyword: '環境舒適', count: 32, trend: 'stable' },
      { keyword: '價格合理', count: 28, trend: 'up' },
      { keyword: '份量足夠', count: 25, trend: 'down' },
    ],
    reviewTrends: [
      { date: '1月', reviews: 12, rating: 4.2 },
      { date: '2月', reviews: 18, rating: 4.3 },
      { date: '3月', reviews: 25, rating: 4.4 },
      { date: '4月', reviews: 32, rating: 4.5 },
      { date: '5月', reviews: 28, rating: 4.6 },
      { date: '6月', reviews: 33, rating: 4.7 },
    ],
    industryComparison: {
      position: 8,
      totalCompetitors: 156,
      percentile: 95
    }
  };

  const performanceMetrics = [
    {
      title: '評論總數',
      value: mockAnalyticsData.totalReviews,
      change: '+12%',
      trend: 'up',
      icon: MessageSquare,
      color: 'from-brand-sage to-brand-sage-dark'
    },
    {
      title: '平均評分',
      value: mockAnalyticsData.averageRating,
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'from-brand-gold to-yellow-500'
    },
    {
      title: '回應率',
      value: `${mockAnalyticsData.responseRate}%`,
      change: '+5%',
      trend: 'up',
      icon: Heart,
      color: 'from-brand-coral to-red-500'
    },
    {
      title: '行業排名',
      value: `第${mockAnalyticsData.industryComparison.position}名`,
      change: '+3名',
      trend: 'up',
      icon: Award,
      color: 'from-brand-indigo to-purple-600'
    }
  ];

  const ratingDistribution = [
    { name: '5星', value: 78, color: '#10B981' },
    { name: '4星', value: 45, color: '#3B82F6' },
    { name: '3星', value: 18, color: '#F59E0B' },
    { name: '2星', value: 5, color: '#EF4444' },
    { name: '1星', value: 2, color: '#6B7280' },
  ];

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      // 模擬API請求延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockAnalyticsData);
      setIsLoading(false);
    };

    loadAnalyticsData();
  }, [storeId, selectedTimeRange]);

  const handleExportData = () => {
    toast({
      title: "數據導出",
      description: "分析報告已開始生成，稍後將發送至您的信箱。",
    });
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "數據已更新",
        description: "獲取到最新的分析數據。",
      });
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-sage-light/10 via-white to-brand-sage/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-sage/30 border-t-brand-sage rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-sage-dark font-medium">正在分析數據...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-sage-light/10 via-white to-brand-sage/5">
      {/* 導航欄 */}
      <div className="bg-white/90 backdrop-blur-md border-b border-brand-sage/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/store/${storeId}`)}
                className="text-brand-sage-dark hover:bg-brand-sage/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回儀表板
              </Button>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-brand-sage" />
                <h1 className="text-xl font-bold text-brand-sage-dark">數據分析中心</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefreshData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                導出
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 店家概覽 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-r from-brand-sage via-brand-sage-dark to-brand-sage text-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{analyticsData.storeName} 數據分析</h2>
                    <p className="text-brand-sage-light/90 mb-4">店家編號：{storeId?.padStart(5, '0')}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>分析期間：過去30天</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        <span>數據實時更新</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{analyticsData.industryComparison.percentile}%</div>
                    <div className="text-sm text-brand-sage-light/90">行業領先度</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 核心指標卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-12 w-12 bg-gradient-to-r ${metric.color} rounded-full flex items-center justify-center`}>
                      <metric.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        metric.trend === 'up' ? 'text-green-600 bg-green-50' : 
                        metric.trend === 'down' ? 'text-red-600 bg-red-50' : 
                        'text-gray-600 bg-gray-50'
                      }`}
                    >
                      {metric.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
                       metric.trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
                      {metric.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* 圖表區域 */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 評論趨勢圖 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-brand-sage-dark">
                    <TrendingUp className="w-5 h-5" />
                    評論增長趨勢
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.reviewTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="reviews" 
                        stroke="#6B8E6B" 
                        fill="url(#colorReviews)"
                      />
                      <defs>
                        <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6B8E6B" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6B8E6B" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* 評分分佈 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-brand-sage-dark">
                    <Star className="w-5 h-5" />
                    評分分佈
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ratingDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {ratingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {ratingDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 關鍵字分析 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-brand-sage-dark">
                  <Target className="w-5 h-5" />
                  熱門關鍵字分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.keywordUsage.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-brand-sage-dark">#{index + 1}</div>
                        <div>
                          <p className="font-medium text-gray-900">{keyword.keyword}</p>
                          <p className="text-sm text-gray-500">使用次數: {keyword.count}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary"
                          className={`${
                            keyword.trend === 'up' ? 'text-green-600 bg-green-50' :
                            keyword.trend === 'down' ? 'text-red-600 bg-red-50' :
                            'text-gray-600 bg-gray-50'
                          }`}
                        >
                          {keyword.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> :
                           keyword.trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
                          {keyword.trend === 'up' ? '上升' : keyword.trend === 'down' ? '下降' : '穩定'}
                        </Badge>
                        <Progress value={(keyword.count / 50) * 100} className="w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 行業比較 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-brand-sage-dark">
                  <Award className="w-5 h-5" />
                  行業競爭力分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-brand-sage-dark mb-2">
                      #{analyticsData.industryComparison.position}
                    </div>
                    <p className="text-gray-600">行業排名</p>
                    <p className="text-xs text-gray-500 mt-1">共 {analyticsData.industryComparison.totalCompetitors} 間競爭者</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-brand-gold mb-2">
                      {analyticsData.industryComparison.percentile}%
                    </div>
                    <p className="text-gray-600">超越同業</p>
                    <p className="text-xs text-gray-500 mt-1">處於頂尖5%</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-brand-coral mb-2">A+</div>
                    <p className="text-gray-600">綜合評級</p>
                    <p className="text-xs text-gray-500 mt-1">優秀表現</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">AI 分析建議</h4>
                  </div>
                  <p className="text-green-700 text-sm">
                    您的店家在同業中表現優異！建議繼續保持「美味」和「服務親切」這兩個核心優勢，
                    同時關注「環境舒適」的改善，這將有助於進一步提升客戶滿意度。
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;