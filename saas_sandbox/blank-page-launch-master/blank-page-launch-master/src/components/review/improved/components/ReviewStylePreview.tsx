import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  RefreshCw, 
  Star, 
  User, 
  Calendar,
  MessageSquare,
  Sparkles,
  Wand2
} from "lucide-react";

interface ReviewPreview {
  id: string;
  content: string;
  rating: number;
  style: 'professional' | 'casual' | 'detailed' | 'enthusiastic';
  author: string;
  date: string;
}

interface ReviewStylePreviewProps {
  selectedKeywords?: string[];
  customFeelings?: string[];
  storeName?: string;
  keywords?: string[];
  selectedStyle?: string;
  onStyleChange?: (style: string) => void;
  onRegeneratePreview?: () => void;
}

export const ReviewStylePreview = ({ 
  selectedKeywords = [],
  customFeelings = [],
  keywords = [], 
  selectedStyle = 'professional',
  onStyleChange,
  onRegeneratePreview 
}: ReviewStylePreviewProps) => {
  const [previews, setPreviews] = useState<ReviewPreview[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 合併所有關鍵字
  const allKeywords = [...(selectedKeywords || []), ...(customFeelings || []), ...(keywords || [])];

  const styles = [
    {
      id: 'professional',
      name: '專業正式',
      description: '客觀理性，用詞準確',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'casual',
      name: '輕鬆親切',
      description: '自然友善，易於親近',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'detailed',
      name: '詳細描述',
      description: '深入分析，內容豐富',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'enthusiastic',
      name: '熱情推薦',
      description: '充滿熱忱，積極推薦',
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const generatePreviews = () => {
    const keywordText = allKeywords.length > 0 ? allKeywords.join('、') : '優質服務、快速配送';
    
    const mockPreviews: ReviewPreview[] = [
      {
        id: 'professional',
        content: `經過仔細評估，認為此次購物體驗表現優異。${keywordText}等方面均符合預期標準。產品品質穩定，服務流程規範，整體滿意度良好。建議有相同需求的消費者可以考慮選購。`,
        rating: 5,
        style: 'professional',
        author: '李先生',
        date: '2024-01-15'
      },
      {
        id: 'casual',
        content: `真的很不錯耶！${keywordText}都讓我印象深刻，比預期的還要好。朋友推薦果然沒錯，用起來很順手，也很實用。下次有需要還會再來買，也會推薦給其他朋友！`,
        rating: 5,
        style: 'casual',
        author: '小美',
        date: '2024-01-15'
      },
      {
        id: 'detailed',
        content: `從下單到收貨的整個過程都很順利。特別要提到的是${keywordText}這些特點，確實如商品描述所言。包裝設計用心，保護措施到位，商品完好無損。客服人員回應及時且專業，解答了我的所有疑問。整體而言，這是一次令人滿意的購物體驗，品質、服務、物流各方面都達到了我的期望。`,
        rating: 4,
        style: 'detailed',
        author: '王女士',
        date: '2024-01-15'
      },
      {
        id: 'enthusiastic',
        content: `太棒了！！！完全超乎想像的好！${keywordText}真的沒話說，太滿意了！🌟 一定要大力推薦給大家，這麼好的產品不分享對不起自己的良心！已經介紹給好幾個朋友了，大家都說讚！強烈推薦！！！`,
        rating: 5,
        style: 'enthusiastic',
        author: '阿強',
        date: '2024-01-15'
      }
    ];

    setPreviews(mockPreviews);
  };

  useEffect(() => {
    generatePreviews();
  }, [keywords]);

  const handleRegeneratePreview = async () => {
    setLoading(true);
    // 模擬API調用延遲
    await new Promise(resolve => setTimeout(resolve, 1500));
    generatePreviews();
    setLoading(false);
    onRegeneratePreview?.();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const selectedStyleInfo = styles.find(s => s.id === selectedStyle);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            評論風格預覽
          </CardTitle>
          <CardDescription>
            查看不同風格的評論效果，選擇最符合需求的表達方式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">當前風格：</span>
              {selectedStyleInfo && (
                <Badge className={selectedStyleInfo.color}>
                  {selectedStyleInfo.name}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegeneratePreview}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? '生成中...' : '重新生成預覽'}
            </Button>
          </div>

          {allKeywords.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">包含的關鍵字：</div>
              <div className="flex flex-wrap gap-2">
                {allKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={selectedStyle} onValueChange={onStyleChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {styles.map((style) => (
            <TabsTrigger key={style.id} value={style.id} className="text-xs">
              {style.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {styles.map((style) => {
          const preview = previews.find(p => p.style === style.id);
          
          return (
            <TabsContent key={style.id} value={style.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        {style.name}風格
                      </CardTitle>
                      <CardDescription>{style.description}</CardDescription>
                    </div>
                    <Badge className={style.color}>
                      {style.name}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ) : preview ? (
                    <div className="space-y-4">
                      {/* 評論內容 */}
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">預覽內容</span>
                        </div>
                        <p className="text-gray-800 leading-relaxed">
                          {preview.content}
                        </p>
                      </div>

                      {/* 評論資訊 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {renderStars(preview.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {preview.rating}/5
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {preview.author}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {preview.date}
                          </span>
                        </div>
                      </div>

                      {/* 風格特點 */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Wand2 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            {style.name}風格特點
                          </span>
                        </div>
                        <div className="text-sm text-blue-800">
                          {style.description}
                        </div>
                      </div>

                      {/* 字數統計 */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>字數: {preview.content.length} 字</span>
                        <span>預估閱讀時間: {Math.ceil(preview.content.length / 400)} 分鐘</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>預覽內容生成中...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* 使用提示 */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                如何選擇合適的風格？
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• <strong>專業正式</strong>：適合商務產品、高價值商品</li>
                <li>• <strong>輕鬆親切</strong>：適合日常用品、親民品牌</li>
                <li>• <strong>詳細描述</strong>：適合功能複雜的產品</li>
                <li>• <strong>熱情推薦</strong>：適合創新產品、推廣活動</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};