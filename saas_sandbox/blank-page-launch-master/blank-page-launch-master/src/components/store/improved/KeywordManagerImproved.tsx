import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { KeywordInput } from "../keyword-manager/KeywordInput";
import { KeywordList } from "../keyword-manager/KeywordList";
import { useStoreKeywords } from "@/hooks/use-store-keywords";
import { regenerateKeywords } from "@/utils/regenerate-keywords";
import { 
  Search, 
  Filter, 
  BarChart3, 
  TrendingUp,
  Star,
  RotateCcw
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  storeId: string;
}

interface KeywordAnalytics {
  totalUsage: number;
  mostUsed: Array<{ keyword: string; count: number }>;
  categoryStats: Record<string, number>;
}

export const KeywordManagerImproved = ({ storeId }: Props) => {
  const { toast } = useToast();
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<'service' | 'environment' | 'product' | 'general' | 'area'>('general');
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const {
    keywords,
    isLoading,
    fetchKeywords,
    addKeyword,
    deleteKeyword
  } = useStoreKeywords(storeId);

  // 篩選和搜尋邏輯
  const filteredKeywords = useMemo(() => {
    return keywords.filter(keyword => {
      const matchesSearch = searchTerm === "" || 
        keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || 
        keyword.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [keywords, searchTerm, categoryFilter]);

  // 分析數據
  const analytics: KeywordAnalytics = useMemo(() => {
    const totalUsage = keywords.reduce((sum, kw) => sum + (kw.usage_count || 0), 0);
    const mostUsed = keywords
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
      .slice(0, 5)
      .map(kw => ({ keyword: kw.keyword, count: kw.usage_count || 0 }));
    
    const categoryStats = keywords.reduce((stats, kw) => {
      const category = kw.category || 'general';
      stats[category] = (stats[category] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);

    return { totalUsage, mostUsed, categoryStats };
  }, [keywords]);

  const handleAddKeyword = async () => {
    if (newKeyword.trim()) {
      const result = await addKeyword(newKeyword, selectedCategory);
      if (result) {
        setNewKeyword("");
        toast({
          title: "成功",
          description: `已新增關鍵字「${newKeyword}」`,
        });
      }
    }
  };

  const handleRegenerateKeywords = async () => {
    try {
      await regenerateKeywords(storeId);
      await fetchKeywords();
      
      toast({
        title: "成功",
        description: "已更新關鍵字組合",
      });
    } catch (error) {
      console.error('Error regenerating keywords:', error);
      toast({
        variant: "destructive",
        title: "錯誤",
        description: "無法更新關鍵字組合",
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
  };

  const categories = [
    { value: 'service', label: '服務' },
    { value: 'environment', label: '環境' },
    { value: 'product', label: '產品' },
    { value: 'general', label: '一般' },
    { value: 'area', label: '地區' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              真實感受管理
              <Badge variant="outline" className="text-xs">
                {keywords.length} 個關鍵字
              </Badge>
            </CardTitle>
            <CardDescription>管理評論真實感受和優先順序</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showAnalytics ? '隱藏' : '顯示'}統計
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 分析面板 */}
        {showAnalytics && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                使用統計
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalUsage}</div>
                  <div className="text-sm text-gray-600">總使用次數</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{keywords.length}</div>
                  <div className="text-sm text-gray-600">關鍵字總數</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(analytics.categoryStats).length}
                  </div>
                  <div className="text-sm text-gray-600">使用類別</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analytics.mostUsed[0]?.count || 0}
                  </div>
                  <div className="text-sm text-gray-600">最高使用次數</div>
                </div>
              </div>

              {analytics.mostUsed.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    最常使用的關鍵字
                  </h4>
                  <div className="space-y-1">
                    {analytics.mostUsed.map((item, index) => (
                      <div key={item.keyword} className="flex justify-between items-center py-1">
                        <span className="text-sm flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          {item.keyword}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {item.count} 次
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 搜尋和篩選 */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜尋關鍵字..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="分類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分類</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchTerm || categoryFilter !== "all") && (
              <Button variant="outline" onClick={handleClearFilters}>
                <RotateCcw className="w-4 h-4 mr-2" />
                清除
              </Button>
            )}
          </div>

          {/* 搜尋結果提示 */}
          {(searchTerm || categoryFilter !== "all") && (
            <div className="text-sm text-gray-600">
              找到 {filteredKeywords.length} 個關鍵字
              {searchTerm && ` 包含「${searchTerm}」`}
              {categoryFilter !== "all" && ` 在「${categories.find(c => c.value === categoryFilter)?.label}」分類中`}
            </div>
          )}
        </div>

        {/* 新增關鍵字 */}
        <KeywordInput
          newKeyword={newKeyword}
          selectedCategory={selectedCategory}
          onKeywordChange={setNewKeyword}
          onCategoryChange={(category) => setSelectedCategory(category as 'service' | 'environment' | 'product' | 'general' | 'area')}
          onAdd={handleAddKeyword}
        />

        {/* 關鍵字列表 */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
            <p className="text-gray-600">載入關鍵字中...</p>
          </div>
        ) : filteredKeywords.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              {searchTerm || categoryFilter !== "all" ? (
                <>
                  <Search className="w-12 h-12 mx-auto mb-2" />
                  <p>沒有找到符合條件的關鍵字</p>
                </>
              ) : (
                <>
                  <Star className="w-12 h-12 mx-auto mb-2" />
                  <p>還沒有新增任何關鍵字</p>
                </>
              )}
            </div>
            {(searchTerm || categoryFilter !== "all") && (
              <Button variant="outline" onClick={handleClearFilters}>
                清除搜尋條件
              </Button>
            )}
          </div>
        ) : (
          <KeywordList
            keywords={filteredKeywords}
            onDelete={deleteKeyword}
            onRegenerate={handleRegenerateKeywords}
          />
        )}
      </CardContent>
    </Card>
  );
};