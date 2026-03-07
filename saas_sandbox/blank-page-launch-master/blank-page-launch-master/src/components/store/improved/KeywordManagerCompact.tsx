import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Sparkles, X, Download, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import type { Keyword } from "@/types/store";
import { useStoreKeywords } from "@/hooks/use-store-keywords";

interface KeywordManagerCompactProps {
  storeId?: string;
  maxHeight?: string;
  showSearch?: boolean;
  showFilters?: boolean;
}

export const KeywordManagerCompact = ({ 
  storeId, 
  maxHeight = "400px",
  showSearch = true,
  showFilters = true 
}: KeywordManagerCompactProps) => {
const { keywords, isLoading, fetchKeywords, addKeyword, deleteKeyword } = useStoreKeywords(storeId || "");
const [newKeyword, setNewKeyword] = useState("");
const [selectedCategory, setSelectedCategory] = useState<Keyword['category']>('general');
const [searchTerm, setSearchTerm] = useState("");
const [categoryFilter, setCategoryFilter] = useState<'all' | Keyword['category']>('all');
const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
const [isBatchAdding, setIsBatchAdding] = useState(false);
const { toast } = useToast();

// 固定關鍵字上限（全系統一致）
const MAX_KEYWORDS = 48;

const categories: { value: Keyword['category']; label: string }[] = [
  { value: "general", label: "整體印象" },
  { value: "product", label: "商品評價" },
  { value: "service", label: "服務體驗" },
  { value: "environment", label: "環境感受" },
  { value: "area", label: "地區特色" }
];

  useEffect(() => {
    if (storeId) {
      fetchKeywords();
    }
  }, [storeId]);

  const handleAddKeyword = async () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;

    // 檢查關鍵字數量限制
    if (keywords.length >= MAX_KEYWORDS) {
      toast({
        variant: "destructive",
        title: "已達上限",
        description: `最多只能設定 ${MAX_KEYWORDS} 個關鍵字`,
      });
      return;
    }

    if (trimmed.length < 3 || trimmed.length > 7) {
      toast({
        variant: "destructive",
        title: "格式不符",
        description: "關鍵字長度需為 3~7 個字",
      });
      return;
    }

    const created = await addKeyword(trimmed, selectedCategory);
    if (created) {
      setNewKeyword("");
      toast({
        title: "新增成功",
        description: `已新增關鍵字「${trimmed}」`,
      });
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    const keyword = keywords.find(k => k.id === id);
    await deleteKeyword(id);
    if (keyword) {
      toast({
        title: "刪除成功",
        description: `已刪除關鍵字「${keyword.keyword}」`,
      });
    }
  };

  const generateSuggestions = async () => {
    if (!storeId) {
      toast({
        variant: "destructive",
        title: "無法產生建議",
        description: "缺少店家資訊",
      });
      return;
    }

    setIsGeneratingSuggestions(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-keywords', {
        body: {
          storeId,
          primaryKeywords: keywords.map(k => k.keyword)
        }
      });

      if (error) {
        console.error('Error generating suggestions:', error);
        toast({
          variant: "destructive",
          title: "產生建議失敗",
          description: "請稍後再試或聯繫客服",
        });
        return;
      }

      if (data?.keywords && Array.isArray(data.keywords)) {
        // 過濾掉已經存在的關鍵字
        const existingKeywords = keywords.map(k => k.keyword.toLowerCase());
        const newSuggestions = data.keywords
          .filter((keyword: string) => !existingKeywords.includes(keyword.toLowerCase()))
          .slice(0, 8);
        
        setSuggestedKeywords(newSuggestions);
        setSelectedSuggestions([]); // 重置選中狀態
        
        if (newSuggestions.length === 0) {
          toast({
            title: "AI 建議",
            description: "暫無新的關鍵字建議，您的關鍵字已經很完整！",
          });
        } else {
          toast({
            title: "AI 建議產生成功",
            description: `產生了 ${newSuggestions.length} 個關鍵字建議`,
          });
        }
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        variant: "destructive",
        title: "產生建議失敗",
        description: "請稍後再試或聯繫客服",
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setNewKeyword(suggestion);
    // 自動選擇 general 分類
    setSelectedCategory('general');
  };

  const handleSuggestionSelect = (suggestion: string, checked: boolean) => {
    setSelectedSuggestions(prev => 
      checked 
        ? [...prev, suggestion]
        : prev.filter(s => s !== suggestion)
    );
  };

  const handleBatchAdd = async () => {
    if (selectedSuggestions.length === 0) return;

    // 檢查剩餘容量
    const remainingSlots = MAX_KEYWORDS - keywords.length;
    if (remainingSlots === 0) {
      toast({
        variant: "destructive",
        title: "無法新增",
        description: "已達到關鍵字上限",
      });
      return;
    }

    setIsBatchAdding(true);
    
    try {
      let successCount = 0;
      let failedItems: { keyword: string; reason: string }[] = [];
      
      // 取前N個關鍵字，不超過剩餘容量
      const keywordsToAdd = selectedSuggestions.slice(0, remainingSlots);
      
      for (const suggestion of keywordsToAdd) {
        // 檢查長度
        if (suggestion.length < 3 || suggestion.length > 7) {
          failedItems.push({ keyword: suggestion, reason: "長度不符(3-7字)" });
          continue;
        }
        
        // 檢查是否重複
        const exists = keywords.some(k => k.keyword.toLowerCase() === suggestion.toLowerCase());
        if (exists) {
          failedItems.push({ keyword: suggestion, reason: "關鍵字已存在" });
          continue;
        }
        
        try {
          const created = await addKeyword(suggestion, 'general');
          if (created) {
            successCount++;
          } else {
            failedItems.push({ keyword: suggestion, reason: "新增失敗" });
          }
        } catch (error) {
          failedItems.push({ keyword: suggestion, reason: "系統錯誤" });
        }
      }
      
      // 清空選中狀態
      setSelectedSuggestions([]);
      
      // 顯示結果
      if (successCount > 0) {
        toast({
          title: "批量新增完成",
          description: `成功新增 ${successCount} 個關鍵字${failedItems.length > 0 ? `，${failedItems.length} 個失敗` : ''}`,
        });
      }
      
      if (failedItems.length > 0 && successCount === 0) {
        toast({
          variant: "destructive",
          title: "批量新增失敗",
          description: `所有關鍵字都無法新增，請檢查重複或長度問題`,
        });
      }
      
    } finally {
      setIsBatchAdding(false);
    }
  };

  // CSV 導出功能
  const generateCSV = (keywordsToExport: Keyword[]) => {
    const headers = ['keyword', 'category', 'usage_count', 'is_primary', 'source', 'priority'];
    const csvContent = [
      headers.join(','),
      ...keywordsToExport.map(keyword => [
        `"${keyword.keyword}"`,
        `"${getCategoryLabel(keyword.category)}"`,
        keyword.usage_count || 0,
        keyword.is_primary || false,
        `"${keyword.source || 'manual'}"`,
        keyword.priority || 0
      ].join(','))
    ].join('\n');
    
    // 添加 UTF-8 BOM 以確保 Excel 正確顯示中文
    return '\uFEFF' + csvContent;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAllCSV = () => {
    if (keywords.length === 0) {
      toast({
        variant: "destructive",
        title: "無法下載",
        description: "目前沒有關鍵字可供下載",
      });
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '').replace(/(\d{8})(\d{4})/, '$1-$2');
    const filename = `keywords-${storeId}-${timestamp}.csv`;
    const csvContent = generateCSV(keywords);
    
    downloadCSV(csvContent, filename);
    
    toast({
      title: "下載成功",
      description: `已下載 ${keywords.length} 個關鍵字`,
    });
  };

  const handleExportFilteredCSV = () => {
    if (filteredKeywords.length === 0) {
      toast({
        variant: "destructive",
        title: "無法下載",
        description: "目前沒有符合篩選條件的關鍵字可供下載",
      });
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '').replace(/(\d{8})(\d{4})/, '$1-$2');
    const filename = `keywords-filtered-${storeId}-${timestamp}.csv`;
    const csvContent = generateCSV(filteredKeywords);
    
    downloadCSV(csvContent, filename);
    
    toast({
      title: "下載成功", 
      description: `已下載 ${filteredKeywords.length} 個篩選後的關鍵字`,
    });
  };

  const filteredKeywords = keywords.filter(keyword => {
    const matchesSearch = keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || keyword.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">關鍵字管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 計算使用進度
  const usagePercentage = (keywords.length / MAX_KEYWORDS) * 100;
  const remainingCount = MAX_KEYWORDS - keywords.length;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-sage" />
            感受關鍵字管理
          </CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={keywords.length === 0}
                  className="h-8 px-3"
                >
                  <Download className="w-4 h-4 mr-1" />
                  下載
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportAllCSV}>
                  下載全部關鍵字 ({keywords.length})
                </DropdownMenuItem>
                {(searchTerm || categoryFilter !== 'all') && (
                  <DropdownMenuItem onClick={handleExportFilteredCSV}>
                    下載篩選結果 ({filteredKeywords.length})
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Badge variant="outline" className="text-sm font-medium">
              {keywords.length}/{MAX_KEYWORDS}
            </Badge>
          </div>
        </div>
        
        {/* 進度顯示 */}
        <div className="space-y-2 mt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              已設定 {keywords.length} 個關鍵字
            </span>
            <span className={`font-medium ${
              usagePercentage >= 90 ? 'text-red-600' :
              usagePercentage >= 70 ? 'text-orange-600' :
              'text-green-600'
            }`}>
              {remainingCount > 0 ? `還可新增 ${remainingCount} 個` : '已達上限'}
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className={`h-2 ${
              usagePercentage >= 90 ? 'bg-red-100' :
              usagePercentage >= 70 ? 'bg-orange-100' :
              'bg-green-100'
            }`}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 新增關鍵字 */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="輸入自訂感受關鍵字（3-7字）"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
              className="flex-1"
              disabled={keywords.length >= MAX_KEYWORDS}
            />
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Keyword['category'])}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="選擇分類" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddKeyword} 
              size="sm"
              disabled={keywords.length >= MAX_KEYWORDS}
              className="bg-brand-sage hover:bg-brand-sage-dark"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {keywords.length >= MAX_KEYWORDS && (
            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
              已達到 {MAX_KEYWORDS} 個關鍵字上限，請刪除不需要的關鍵字後再新增
            </div>
          )}
        </div>

        {/* AI 建議區塊 */}
        <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">AI 智能建議</span>
            </div>
            <Button 
              onClick={generateSuggestions}
              disabled={isGeneratingSuggestions || !storeId}
              size="sm"
              variant="outline"
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              {isGeneratingSuggestions ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                  產生中...
                </>
              ) : (
                <>
                  <Wand2 className="w-3 h-3 mr-1" />
                  AI 建議 8 個
                </>
              )}
            </Button>
          </div>
          
          {suggestedKeywords.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-700">選擇要新增的關鍵字</p>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <span>已選 {selectedSuggestions.length} 個</span>
                  <span>•</span>
                  <span>可新增 {Math.max(0, MAX_KEYWORDS - keywords.length)} 個</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {suggestedKeywords.map((suggestion, index) => {
                  const isSelected = selectedSuggestions.includes(suggestion);
                  const cannotAdd = keywords.length >= MAX_KEYWORDS;
                  const isExisting = keywords.some(k => k.keyword.toLowerCase() === suggestion.toLowerCase());
                  const isInvalid = suggestion.length < 3 || suggestion.length > 7;
                  
                  return (
                    <div key={index} className={`
                      flex items-center gap-2 p-2 rounded border transition-colors
                      ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
                      ${(cannotAdd || isExisting || isInvalid) ? 'opacity-50' : 'hover:border-blue-300'}
                    `}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSuggestionSelect(suggestion, checked as boolean)}
                        disabled={cannotAdd || isExisting || isInvalid}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <button
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex-1 text-left text-sm hover:text-blue-600 transition-colors"
                        title={
                          isExisting ? '關鍵字已存在' :
                          isInvalid ? '長度不符(3-7字)' :
                          cannotAdd ? '已達上限' :
                          '點擊填入輸入框'
                        }
                      >
                        {suggestion}
                        {isExisting && <span className="text-xs text-orange-500 ml-1">(已存在)</span>}
                        {isInvalid && <span className="text-xs text-red-500 ml-1">(長度不符)</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {selectedSuggestions.length > 0 && (
                <Button
                  onClick={handleBatchAdd}
                  disabled={isBatchAdding || keywords.length >= MAX_KEYWORDS}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isBatchAdding ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      批量新增中...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      批量新增選中的 {selectedSuggestions.length} 個關鍵字
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 搜索和篩選 */}
        {showSearch && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索關鍵字..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {showFilters && (
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="篩選分類" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* 關鍵字列表 - 一行兩個 */}
        <div 
          className="overflow-y-auto"
          style={{ maxHeight }}
        >
          {filteredKeywords.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              {searchTerm || categoryFilter !== "all" ? "沒有找到符合條件的關鍵字" : "尚未新增任何關鍵字"}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredKeywords.map((keyword) => (
                <div
                  key={keyword.id}
                  className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-brand-sage/50 hover:shadow-sm transition-all"
                >
                  {/* 刪除按鈕 */}
                  <button
                    onClick={() => handleDeleteKeyword(keyword.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded p-1"
                    title="刪除關鍵字"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                  
                  {/* 關鍵字內容 */}
                  <div className="pr-6">
                    <div className="font-medium text-sm text-gray-800 mb-1 truncate" title={keyword.keyword}>
                      {keyword.keyword}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(keyword.category)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {keyword.usage_count ?? 0}次
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 統計信息 */}
        <div className="pt-2 border-t text-xs text-gray-500 flex justify-between">
          <span>總計: {keywords.length}/{MAX_KEYWORDS} 個關鍵字</span>
          {remainingCount > 0 && (
            <span className="text-green-600">還可新增 {remainingCount} 個</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};