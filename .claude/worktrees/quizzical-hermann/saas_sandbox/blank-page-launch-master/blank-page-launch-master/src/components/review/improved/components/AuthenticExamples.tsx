import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  Copy,
  RefreshCw,
  Sparkles,
  Eye
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AuthenticExample {
  id: string;
  text: string;
  rating: number;
  category: string;
  style: 'professional' | 'casual' | 'detailed' | 'concise';
  length: 'short' | 'medium' | 'long';
  sentiment: 'positive' | 'neutral' | 'mixed';
}

interface AuthenticExamplesProps {
  keywords?: string[];
  onExampleSelect?: (example: AuthenticExample) => void;
}

export const AuthenticExamples = ({ keywords = [], onExampleSelect }: AuthenticExamplesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const { toast } = useToast();

  const examples: AuthenticExample[] = [
    {
      id: '1',
      text: '這次購物體驗真的很棒！商品品質超出預期，包裝也很用心。客服人員回應速度很快，解決問題的態度也很專業。物流配送準時到達，整體來說非常滿意，會推薦給朋友！',
      rating: 5,
      category: 'product',
      style: 'casual',
      length: 'medium',
      sentiment: 'positive'
    },
    {
      id: '2',
      text: '產品品質優良，設計精美實用。服務團隊專業且樂於協助，配送過程順暢無誤。整體購物體驗令人滿意，值得信賴的品牌。',
      rating: 5,
      category: 'service',
      style: 'professional',
      length: 'short',
      sentiment: 'positive'
    },
    {
      id: '3',
      text: '收到商品後立刻試用，功能完全符合需求。之前在網路上看到很多好評才決定購買，實際使用後確實沒有失望。包裝完整，商品沒有任何損壞。客服在購買前的諮詢也很耐心詳細，讓我對這個品牌更有信心。配送速度比預期快，整個購物流程都很順利。',
      rating: 4,
      category: 'delivery',
      style: 'detailed',
      length: 'long',
      sentiment: 'positive'
    },
    {
      id: '4',
      text: '整體不錯，商品符合預期。配送準時，包裝完好。有小問題聯繫客服也得到快速解決。會考慮再次購買。',
      rating: 4,
      category: 'overall',
      style: 'concise',
      length: 'short',
      sentiment: 'mixed'
    },
    {
      id: '5',
      text: '朋友推薦才知道這個品牌，試用後發現品質真的很好。設計簡約但功能齊全，正是我需要的。客服態度親切，解答問題很專業。配送包裝用心，商品完好無損。價格合理，性價比很高。',
      rating: 5,
      category: 'product',
      style: 'casual',
      length: 'medium',
      sentiment: 'positive'
    },
    {
      id: '6',
      text: '專業的服務品質，從購買諮詢到售後支援都表現優異。產品功能完善，使用體驗良好。物流安排妥當，準時送達。整體而言，這是一次成功的購物體驗，推薦給有相同需求的消費者。',
      rating: 5,
      category: 'service',
      style: 'professional',
      length: 'medium',
      sentiment: 'positive'
    }
  ];

  const categories = [
    { id: 'all', name: '全部類別' },
    { id: 'product', name: '產品評價' },
    { id: 'service', name: '服務體驗' },
    { id: 'delivery', name: '配送物流' },
    { id: 'overall', name: '整體評價' }
  ];

  const styles = [
    { id: 'all', name: '全部風格' },
    { id: 'professional', name: '專業正式' },
    { id: 'casual', name: '輕鬆親切' },
    { id: 'detailed', name: '詳細描述' },
    { id: 'concise', name: '簡潔明瞭' }
  ];

  const filteredExamples = examples.filter(example => {
    const categoryMatch = selectedCategory === 'all' || example.category === selectedCategory;
    const styleMatch = selectedStyle === 'all' || example.style === selectedStyle;
    return categoryMatch && styleMatch;
  });

  const handleCopyExample = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "已複製",
        description: "評論範例已複製到剪貼簿",
      });
    } catch (error) {
      toast({
        title: "複製失敗",
        description: "無法複製到剪貼簿",
        variant: "destructive",
      });
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'casual': return 'bg-green-100 text-green-800';
      case 'detailed': return 'bg-purple-100 text-purple-800';
      case 'concise': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLengthColor = (length: string) => {
    switch (length) {
      case 'short': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'long': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            真實評論範例
          </CardTitle>
          <CardDescription>
            參考這些真實感的評論範例，找到最適合的表達方式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex flex-wrap gap-1">
              {styles.map((style) => (
                <Button
                  key={style.id}
                  variant={selectedStyle === style.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStyle(style.id)}
                >
                  {style.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            找到 {filteredExamples.length} 個符合條件的範例
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {filteredExamples.map((example) => (
            <Card key={example.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {renderStars(example.rating)}
                    <span className="text-sm text-gray-600">
                      {example.rating}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStyleColor(example.style)}>
                      {styles.find(s => s.id === example.style)?.name}
                    </Badge>
                    <Badge className={getLengthColor(example.length)}>
                      {example.length === 'short' ? '簡短' : 
                       example.length === 'medium' ? '中等' : '詳細'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {example.text}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {categories.find(c => c.id === example.category)?.name}
                      </span>
                      <span>{example.text.length} 字</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyExample(example.text)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        複製
                      </Button>
                      {onExampleSelect && (
                        <Button
                          size="sm"
                          onClick={() => onExampleSelect(example)}
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          使用此範例
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredExamples.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  沒有找到符合條件的範例
                </h3>
                <p className="text-gray-500 mb-4">
                  請嘗試調整篩選條件或選擇其他類別
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedStyle('all');
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重置篩選
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {(keywords?.length || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基於您選擇的關鍵字</CardTitle>
            <CardDescription>
              這些範例特別適合包含您所選關鍵字的評論
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};