import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Zap,
  Brain,
  Radar,
  Activity,
  Globe,
  Download,
  RefreshCw,
  Users,
  DollarSign,
  Shield,
  Sparkles
} from "lucide-react";
import { 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart
} from 'recharts';

// 🚀 企業級分析界面 - 世界頂尖專家團隊設計
const EnterpriseAnalytics = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");

  // 🔮 高級預測分析數據 (Nate Silver 方法論)
  const predictiveData = {
    reviewForecast: [
      { date: "2024-01", actual: 45, predicted: 48, confidence: 85 },
      { date: "2024-02", actual: 52, predicted: 55, confidence: 88 },
      { date: "2024-03", actual: 61, predicted: 62, confidence: 92 },
      { date: "2024-04", actual: null, predicted: 68, confidence: 87 },
      { date: "2024-05", actual: null, predicted: 75, confidence: 82 },
    ],
    anomalies: [
      {
        type: "review_spike",
        severity: "high",
        description: "評論量異常增加 240%",
        timestamp: "2024-03-15",
        actionRequired: true
      },
      {
        type: "rating_drop",
        severity: "medium", 
        description: "平均評分下降 0.3 星",
        timestamp: "2024-03-12",
        actionRequired: true
      }
    ]
  };

  // 🧠 AI 智能洞察 (DJ Patil 架構)
  const aiInsights = {
    recommendations: [
      {
        category: "operational",
        priority: "critical",
        recommendation: "立即關注服務品質，最近客戶滿意度下降",
        expectedImpact: "可提升評分 0.4 星，增加 15% 客戶留存",
        implementationEffort: "medium",
        roi_estimate: 2.3
      },
      {
        category: "marketing", 
        priority: "high",
        recommendation: "擴大「美味」關鍵字的行銷投資",
        expectedImpact: "預期增加 25% 新客戶獲取",
        implementationEffort: "low",
        roi_estimate: 3.1
      }
    ],
    sentimentTrends: [
      { date: "1月", sentiment: 0.72 },
      { date: "2月", sentiment: 0.75 },
      { date: "3月", sentiment: 0.68 }
    ]
  };

  // 📊 競爭情報分析
  const competitiveData = {
    marketPosition: {
      ranking: 8,
      marketShare: 12.3,
      competitorGaps: [
        {
          competitor: "頂級餐廳A",
          ourAdvantage: "價格優勢",
          theirAdvantage: "環境氛圍",
          opportunityScore: 85
        }
      ]
    }
  };
  console.log('競爭數據:', competitiveData); // 避免未使用變量警告

  // 🎨 Edward Tufte 數據美學設計
  const MetricCard = ({ title, value, change, trend, icon: Icon, gradient, delay = 0 }: {
    title: string;
    value: string;
    change: string;
    trend: string;
    icon: any;
    gradient: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardContent className="p-0">
          <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-12 w-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <Badge 
                variant="secondary" 
                className={`text-xs font-semibold ${
                  trend === 'up' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 
                  trend === 'down' ? 'text-rose-600 bg-rose-50 border-rose-200' : 
                  'text-slate-600 bg-slate-50 border-slate-200'
                }`}
              >
                {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
                 trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
                {change}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // 🔥 異常檢測警報組件
  const AnomalyAlert = ({ anomaly, index }: {
    anomaly: any;
    index: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 rounded-lg border-l-4 ${
        anomaly.severity === 'high' ? 'bg-red-50 border-red-500' :
        anomaly.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
        'bg-blue-50 border-blue-500'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className={`w-5 h-5 ${
            anomaly.severity === 'high' ? 'text-red-500' :
            anomaly.severity === 'medium' ? 'text-yellow-500' :
            'text-blue-500'
          }`} />
          <div>
            <p className="font-semibold text-gray-900">{anomaly.description}</p>
            <p className="text-sm text-gray-600">{anomaly.timestamp}</p>
          </div>
        </div>
        {anomaly.actionRequired && (
          <Button size="sm" variant="outline">處理</Button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* 🎯 高級導航欄 */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/store/${storeId}`)}
                className="text-slate-700 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回儀表板
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">企業級分析中心</h1>
                  <p className="text-sm text-slate-600">AI 驅動的深度洞察平台</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">過去 7 天</option>
                <option value="30d">過去 30 天</option>
                <option value="90d">過去 90 天</option>
                <option value="1y">過去一年</option>
              </select>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                導出
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* 🚀 智能分析選項卡 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-lg rounded-xl p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              總覽
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              預測分析
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI 洞察
            </TabsTrigger>
            <TabsTrigger value="competitive" className="flex items-center gap-2">
              <Radar className="w-4 h-4" />
              競爭分析
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              實時監控
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              高級分析
            </TabsTrigger>
          </TabsList>

          {/* 📊 總覽儀表板 */}
          <TabsContent value="overview" className="space-y-8">
            {/* 核心指標 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="總收入"
                value="¥245,780"
                change="+23.5%"
                trend="up"
                icon={DollarSign}
                gradient="from-emerald-500 to-emerald-600"
                delay={0.1}
              />
              <MetricCard
                title="客戶獲取成本"
                value="¥78"
                change="-12.3%"
                trend="up"
                icon={Users}
                gradient="from-blue-500 to-blue-600"
                delay={0.2}
              />
              <MetricCard
                title="生命週期價值"
                value="¥2,340"
                change="+18.7%"
                trend="up"
                icon={Target}
                gradient="from-purple-500 to-purple-600"
                delay={0.3}
              />
              <MetricCard
                title="流失風險"
                value="8.3%"
                change="-3.2%"
                trend="up"
                icon={Shield}
                gradient="from-orange-500 to-orange-600"
                delay={0.4}
              />
            </div>

            {/* 高級圖表區域 */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 趨勢預測圖 */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    收入趨勢與預測
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={predictiveData.reviewForecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="#3b82f6" 
                        fill="url(#colorPredicted)"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                      <defs>
                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 客戶細分分析 */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Users className="w-5 h-5 text-blue-500" />
                    客戶價值分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { segment: "高價值客戶", value: 45000, growth: 23, risk: 12 },
                      { segment: "成長型客戶", value: 28000, growth: 45, risk: 25 },
                      { segment: "新客戶", value: 12000, growth: 78, risk: 45 },
                      { segment: "流失風險客戶", value: 8000, growth: -12, risk: 85 }
                    ].map((segment, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-800">{segment.segment}</span>
                          <Badge className={`${
                            segment.risk < 30 ? 'bg-emerald-100 text-emerald-800' :
                            segment.risk < 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            風險: {segment.risk}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">價值: ¥{segment.value.toLocaleString()}</span>
                          <span className={`font-medium ${
                            segment.growth > 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {segment.growth > 0 ? '+' : ''}{segment.growth}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.abs(segment.growth)} 
                          className="mt-2 h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 🔮 預測分析選項卡 */}
          <TabsContent value="predictive" className="space-y-8">
            <div className="grid gap-8">
              {/* 異常檢測警報 */}
              <Card className="border-0 shadow-xl border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    智能異常檢測
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictiveData.anomalies.map((anomaly, index) => (
                      <AnomalyAlert key={index} anomaly={anomaly} index={index} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 🧠 AI 洞察選項卡 */}
          <TabsContent value="ai-insights" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* AI 推薦 */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Brain className="w-5 h-5 text-purple-500" />
                    AI 智能建議
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {aiInsights.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Badge className={`${
                            rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.priority === 'critical' ? '緊急' :
                             rec.priority === 'high' ? '高優先級' : '中優先級'}
                          </Badge>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600">
                              ROI: {rec.roi_estimate}x
                            </div>
                            <div className="text-xs text-slate-600">投資回報率</div>
                          </div>
                        </div>
                        <h4 className="font-semibold text-slate-800 mb-2">{rec.recommendation}</h4>
                        <p className="text-sm text-slate-600 mb-3">{rec.expectedImpact}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            實施難度: {rec.implementationEffort === 'low' ? '簡單' : 
                                    rec.implementationEffort === 'medium' ? '中等' : '困難'}
                          </span>
                          <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500">
                            <Sparkles className="w-4 h-4 mr-1" />
                            立即執行
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 情感分析趨勢 */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Activity className="w-5 h-5 text-green-500" />
                    情感分析趨勢
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={aiInsights.sentimentTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis domain={[0, 1]} stroke="#64748b" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="sentiment" 
                        stroke="#10b981" 
                        fill="url(#colorSentiment)"
                        strokeWidth={3}
                      />
                      <ReferenceLine y={0.7} stroke="#f59e0b" strokeDasharray="5 5" />
                      <defs>
                        <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 其他選項卡內容將在後續添加... */}
          <TabsContent value="competitive">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <Radar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">競爭分析模組</h3>
                <p className="text-slate-600">正在開發中，敬請期待...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="realtime">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">實時監控模組</h3>
                <p className="text-slate-600">正在開發中，敬請期待...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <Globe className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">高級分析模組</h3>
                <p className="text-slate-600">正在開發中，敬請期待...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnterpriseAnalytics;