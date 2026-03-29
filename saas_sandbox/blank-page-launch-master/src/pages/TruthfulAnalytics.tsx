import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  AlertTriangle,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Info,
  Target,
  BarChart3,
  Zap,
  Globe,
  RefreshCw
} from "lucide-react";
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import HybridAnalyticsService, { HybridAnalyticsData } from '@/services/hybridAnalyticsService';

// 🎯 真實數據分析界面 - 偏差校正專家設計
const TruthfulAnalytics = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<HybridAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trustScore, setTrustScore] = useState(0);

  useEffect(() => {
    const loadTruthfulData = async () => {
      try {
        setIsLoading(true);
        const data = await HybridAnalyticsService.getHybridAnalytics(storeId!);
        const trust = HybridAnalyticsService.calculateTrustScore(data);
        
        setAnalyticsData(data);
        setTrustScore(trust);
      } catch (error) {
        console.error('載入真實分析數據失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (storeId) {
      loadTruthfulData();
    }
  }, [storeId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground font-medium">正在分析數據真實性...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  // 🎨 數據可信度顏色系統 (status colors - semantic by nature)
  const getTrustColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getBiasRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  // 📊 比較數據
  const comparisonData = [
    {
      name: '原始評分',
      generated: analyticsData.review_analysis.generated_reviews.average_rating,
      google: analyticsData.review_analysis.google_reviews?.average_rating || 0,
      adjusted: analyticsData.review_analysis.hybrid_score.adjusted_score
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-primary/5">
      {/* 導航欄 */}
      <div className="bg-background/90 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/store/${storeId}`)}
                className="text-foreground hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回儀表板
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-xl">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">真實性分析中心</h1>
                  <p className="text-sm text-muted-foreground">偏差校正 • 數據可信度評估</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={`font-semibold ${getTrustColor(trustScore)}`}>
                <Shield className="w-3 h-3 mr-1" />
                可信度: {trustScore.toFixed(0)}%
              </Badge>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                重新分析
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* 🚨 數據警告區域 (status colors kept for severity) */}
          {analyticsData.data_warnings.length > 0 && (
            <div className="space-y-4">
              {analyticsData.data_warnings.map((warning, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Alert className={`border-l-4 ${
                    warning.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                    warning.severity === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-primary bg-primary/5'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${
                      warning.severity === 'critical' ? 'text-red-500' :
                      warning.severity === 'warning' ? 'text-yellow-500' :
                      'text-primary'
                    }`} />
                    <AlertDescription className="ml-2">
                      <div className="space-y-2">
                        <p className="font-semibold">{warning.message}</p>
                        <p className="text-sm opacity-80">影響: {warning.impact}</p>
                        <p className="text-sm opacity-80">建議: {warning.recommendation}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              ))}
            </div>
          )}

          {/* 📊 數據品質總覽 */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">整體可靠性</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(analyticsData.data_quality.overall_reliability * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <Progress value={analyticsData.data_quality.overall_reliability * 100} className="h-3" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">偏差風險</p>
                    <Badge className={`${getBiasRiskColor(analyticsData.data_quality.bias_risk)} font-semibold`}>
                      {analyticsData.data_quality.bias_risk === 'low' ? '低風險' :
                       analyticsData.data_quality.bias_risk === 'medium' ? '中風險' : '高風險'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">數據完整性</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(analyticsData.data_quality.data_completeness * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <Progress value={analyticsData.data_quality.data_completeness * 100} className="h-3" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    <Target className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">統計顯著性</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(analyticsData.review_analysis.hybrid_score.statistical_significance * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <Progress value={analyticsData.review_analysis.hybrid_score.statistical_significance * 100} className="h-3" />
              </CardContent>
            </Card>
          </div>

          {/* 📈 偏差校正比較 */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  評分偏差校正分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="generated" fill="#fbbf24" name="生成評論 (原始)" />
                    <Bar dataKey="google" fill="hsl(var(--primary))" name="Google 評論" />
                    <Bar dataKey="adjusted" fill="#10b981" name="偏差校正後" />
                    <ReferenceLine y={4.0} stroke="#ef4444" strokeDasharray="5 5" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>校正說明:</strong> {analyticsData.review_analysis.hybrid_score.bias_explanation}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-amber-400 rounded"></div>
                      原始: {analyticsData.review_analysis.generated_reviews.average_rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                      校正: {analyticsData.review_analysis.hybrid_score.adjusted_score.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      差異: {(analyticsData.review_analysis.generated_reviews.average_rating - 
                              analyticsData.review_analysis.hybrid_score.adjusted_score).toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-500" />
                  數據來源組成
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.review_analysis.hybrid_score.data_sources.map((source, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {source.type === 'generated' ? (
                            <Zap className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <Globe className="w-4 h-4 text-primary" />
                          )}
                          <span className="font-medium">
                            {source.type === 'generated' ? '生成評論' : 'Google 評論'}
                          </span>
                        </div>
                        <Badge className={`text-xs ${
                          source.reliability > 0.7 ? 'bg-green-100 text-green-800' :
                          source.reliability > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          可靠度: {(source.reliability * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">樣本數量:</span>
                          <span className="ml-2 font-medium">{source.sample_size}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">偏差係數:</span>
                          <span className="ml-2 font-medium">{source.bias_factor.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <Progress value={source.reliability * 100} className="mt-3 h-2" />
                    </div>
                  ))}
                </div>

                {!analyticsData.review_analysis.google_reviews && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                      <XCircle className="w-4 h-4" />
                      <span className="font-semibold">缺少外部數據源</span>
                    </div>
                    <p className="text-sm text-red-600">
                      建議立即整合 Google Reviews API 以提高分析準確性
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 🎯 專家建議 */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-secondary" />
                數據科學專家建議
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg border border-secondary/30">
                  <h4 className="font-semibold text-secondary-foreground mb-2">📊 當前狀態評估</h4>
                  <p className="text-sm text-muted-foreground">
                    {analyticsData.data_quality.recommendation}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      立即可行動項
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 設定 Google Places API 金鑰</li>
                      <li>• 驗證店家 Google 商家檔案</li>
                      <li>• 啟用自動數據同步</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-primary mb-2 flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      長期優化策略
                    </h4>
                    <ul className="text-sm text-primary/80 space-y-1">
                      <li>• 建立多源數據驗證機制</li>
                      <li>• 實施實時偏差監控</li>
                      <li>• 增加社交媒體數據源</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TruthfulAnalytics;
