import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  Users, 
  Zap,
  Plus,
  Minus
} from "lucide-react";


interface CategorizedKeywordSectionProps {
  onKeywordToggle: (keywordId: string) => void;
  selectedKeywords: string[];
  maxKeywords?: number;
}

export const CategorizedKeywordSection = ({ 
  onKeywordToggle, 
  selectedKeywords,
  maxKeywords = 10 
}: CategorizedKeywordSectionProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['product', 'service']);

  const keywordCategories = [
    {
      id: 'product',
      name: '產品特色',
      icon: <ShoppingBag className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-800',
      keywords: [
        { id: 'quality-1', text: '品質優良', popularity: 95 },
        { id: 'value-1', text: '物超所值', popularity: 88 },
        { id: 'design-1', text: '設計精美', popularity: 82 },
        { id: 'durable-1', text: '耐用持久', popularity: 79 },
        { id: 'innovative-1', text: '創新實用', popularity: 76 }
      ]
    },
    {
      id: 'service',
      name: '服務體驗',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-green-100 text-green-800',
      keywords: [
        { id: 'service-1', text: '服務親切', popularity: 92 },
        { id: 'fast-1', text: '快速回應', popularity: 89 },
        { id: 'professional-1', text: '專業細心', popularity: 85 },
        { id: 'patient-1', text: '耐心解答', popularity: 81 },
        { id: 'helpful-1', text: '樂於助人', popularity: 78 }
      ]
    },
    {
      id: 'delivery',
      name: '配送物流',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-800',
      keywords: [
        { id: 'fast-delivery-1', text: '快速配送', popularity: 90 },
        { id: 'safe-packaging-1', text: '包裝完整', popularity: 86 },
        { id: 'on-time-1', text: '準時到達', popularity: 83 },
        { id: 'careful-1', text: '小心處理', popularity: 80 },
        { id: 'tracking-1', text: '物流透明', popularity: 77 }
      ]
    },
    {
      id: 'emotion',
      name: '情感表達',
      icon: <Heart className="w-4 h-4" />,
      color: 'bg-pink-100 text-pink-800',
      keywords: [
        { id: 'satisfied-1', text: '非常滿意', popularity: 93 },
        { id: 'recommend-1', text: '大力推薦', popularity: 87 },
        { id: 'trustworthy-1', text: '值得信賴', popularity: 84 },
        { id: 'pleasant-1', text: '愉快體驗', popularity: 81 },
        { id: 'surprised-1', text: '超出期待', popularity: 78 }
      ]
    },
    {
      id: 'overall',
      name: '整體評價',
      icon: <Star className="w-4 h-4" />,
      color: 'bg-yellow-100 text-yellow-800',
      keywords: [
        { id: 'excellent-1', text: '表現優異', popularity: 91 },
        { id: 'reliable-1', text: '可靠穩定', popularity: 88 },
        { id: 'consistent-1', text: '品質穩定', popularity: 85 },
        { id: 'improving-1', text: '持續進步', popularity: 82 },
        { id: 'competitive-1', text: '具競爭力', popularity: 79 }
      ]
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleKeywordClick = (keywordId: string) => {
    if (selectedKeywords.includes(keywordId)) {
      onKeywordToggle(keywordId);
    } else if (selectedKeywords.length < maxKeywords) {
      onKeywordToggle(keywordId);
    }
  };

  const getKeywordUsageColor = (popularity: number) => {
    if (popularity >= 90) return 'border-green-400 bg-green-50';
    if (popularity >= 80) return 'border-blue-400 bg-blue-50';
    if (popularity >= 70) return 'border-yellow-400 bg-yellow-50';
    return 'border-gray-400 bg-gray-50';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">分類關鍵字</h3>
        <div className="text-sm text-gray-500">
          已選擇 {selectedKeywords.length} / {maxKeywords} 個關鍵字
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {keywordCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.keywords.length} 個關鍵字可選
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {expandedCategories.includes(category.id) ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedCategories.includes(category.id) && (
              <>
                <Separator />
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {category.keywords.map((keyword) => {
                      const isSelected = selectedKeywords.includes(keyword.id);
                      const canSelect = selectedKeywords.length < maxKeywords || isSelected;
                      
                      return (
                        <div
                          key={keyword.id}
                          className={`
                            relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                            ${isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : canSelect
                                ? `${getKeywordUsageColor(keyword.popularity)} hover:shadow-sm hover:scale-[1.02]`
                                : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            }
                          `}
                          onClick={() => canSelect && handleKeywordClick(keyword.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${
                              isSelected ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              {keyword.text}
                            </span>
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                keyword.popularity >= 90 ? 'bg-green-100 text-green-700' :
                                keyword.popularity >= 80 ? 'bg-blue-100 text-blue-700' :
                                keyword.popularity >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              熱度 {keyword.popularity}%
                            </Badge>
                          </div>
                          
                          {/* 熱度指示器 */}
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                            <div 
                              className={`h-1 rounded-full ${
                                keyword.popularity >= 90 ? 'bg-green-500' :
                                keyword.popularity >= 80 ? 'bg-blue-500' :
                                keyword.popularity >= 70 ? 'bg-yellow-500' :
                                'bg-gray-500'
                              }`}
                              style={{ width: `${keyword.popularity}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      {selectedKeywords.length >= maxKeywords && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            已達到關鍵字選擇上限 ({maxKeywords} 個)。如需選擇其他關鍵字，請先取消已選擇的關鍵字。
          </div>
        </div>
      )}
    </div>
  );
};