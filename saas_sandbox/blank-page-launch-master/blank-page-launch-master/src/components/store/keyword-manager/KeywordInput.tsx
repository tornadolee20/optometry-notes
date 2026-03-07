
import { useState } from "react";
import { Plus, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Keyword } from "@/types/store";

interface KeywordInputProps {
  newKeyword: string;
  selectedCategory: Keyword['category'];
  onKeywordChange: (value: string) => void;
  onCategoryChange: (value: Keyword['category']) => void;
  onAdd: () => void;
  disabled?: boolean;
  limitReached?: boolean;
  remainingCount?: number;
  storeId?: string;
  onKeywordSuggest?: (keyword: string, category: Keyword['category']) => void;
}

export const CATEGORY_LABELS = {
  service: '服務體驗',
  environment: '環境感受',
  product: '商品評價',
  general: '整體印象',
  area: '地區特色'
};

export const KeywordInput = ({
  newKeyword,
  selectedCategory,
  onKeywordChange,
  onCategoryChange,
  onAdd,
  disabled = false,
  limitReached = false,
  remainingCount = 0,
  storeId,
  onKeywordSuggest,
}: KeywordInputProps) => {
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateSuggestions = async () => {
    if (!storeId) return;
    
    setIsGenerating(true);
    try {
      // 获取店家信息
      const { data: storeData } = await supabase
        .from('stores')
        .select('store_name, industry, description')
        .eq('id', storeId)
        .single();
      
      if (!storeData) return;
      
      // 获取已有的主要关键字
      const { data: keywordsData } = await supabase
        .from('store_keywords')
        .select('keyword')
        .eq('store_id', storeId)
        .eq('is_primary', true);
      
      const primaryKeywords = keywordsData?.map(k => k.keyword) || [];
      
      // 调用现有的 generate-keywords Edge Function
      const { data, error } = await supabase.functions.invoke('generate-keywords', {
        body: {
          storeName: storeData.store_name || '',
          industry: storeData.industry || '',
          description: storeData.description || '',
          primaryKeywords: primaryKeywords
        }
      });
      
      if (!error && data?.keywords) {
        // 取前8个关键字作为建议
        setSuggestedKeywords(data.keywords.slice(0, 8));
      }
    } catch (error) {
      console.error('生成建议关键字失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSuggestedKeywordClick = (keyword: string) => {
    if (onKeywordSuggest) {
      onKeywordSuggest(keyword, selectedCategory);
    } else {
      onKeywordChange(keyword);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select
          value={selectedCategory}
          onValueChange={(value) => onCategoryChange(value as Keyword['category'])}
          disabled={disabled}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="選擇分類" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder={
            disabled 
              ? "已達使用限制" 
              : "輸入您的自訂感受（3-7字）"
          }
          value={newKeyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !disabled && onAdd()}
          disabled={disabled}
        />
        <Button 
          onClick={onAdd} 
          disabled={disabled || !newKeyword.trim()}
          className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {disabled ? (
            <Lock className="w-4 h-4 mr-1" />
          ) : (
            <Plus className="w-4 h-4 mr-1" />
          )}
          {disabled ? "已限制" : "新增"}
        </Button>
      </div>
      
      {/* AI 建议按钮 */}
      {storeId && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={disabled || isGenerating}
            className="flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            {isGenerating ? "生成中..." : "AI 建议 8 个"}
          </Button>
          {suggestedKeywords.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuggestedKeywords([])}
              className="text-gray-500"
            >
              清除建议
            </Button>
          )}
        </div>
      )}
      
      {/* 建议关键字标签 */}
      {suggestedKeywords.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">AI 建议关键字（点击添加）：</p>
          <div className="flex flex-wrap gap-2">
            {suggestedKeywords.map((keyword, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleSuggestedKeywordClick(keyword)}
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* 限制提示 */}
      {limitReached && (
        <Alert className="border-orange-200 bg-orange-50">
          <Lock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            您已達到當前方案的關鍵字數量上限。請升級到更高的方案以獲得更多額度。
          </AlertDescription>
        </Alert>
      )}
      
      {/* 剩餘數量提示 */}
      {!limitReached && remainingCount > 0 && remainingCount <= 5 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertDescription className="text-yellow-800">
            ℹ️ 您還可以新增 {remainingCount} 個關鍵字
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
