import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Sparkles, Download, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeywordGuideHint } from "@/components/store/KeywordGuideHint";
import { IndustryTemplateSwitcher } from "@/components/store/IndustryTemplateSwitcher";
import { IndustryOnboarding } from "@/components/store/IndustryOnboarding";
import { isSandboxStore } from "@/config/sandbox";
import type { Keyword } from "@/types/store";
import { useStoreKeywords } from "@/hooks/use-store-keywords";
import { KeywordFilterTabs, type FilterCategory } from "@/components/store/keyword-manager/KeywordFilterTabs";
import { InlineKeywordEdit } from "@/components/store/keyword-manager/InlineKeywordEdit";
import { ResetKeywordsButton } from "@/components/store/keyword-manager/ResetKeywordsButton";

interface KeywordManagerCompactProps {
  storeId?: string;
  storeEmail?: string;
  storeIndustry?: string;
  maxHeight?: string;
  showSearch?: boolean;
  showFilters?: boolean;
}

export const KeywordManagerCompact = ({
  storeId,
  storeEmail,
  storeIndustry,
  maxHeight = "400px",
  showSearch = true,
  showFilters: _showFilters = true
}: KeywordManagerCompactProps) => {
  const { keywords, isLoading, fetchKeywords, addKeyword, deleteKeyword } = useStoreKeywords(storeId || "");
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Keyword['category']>('general');
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [isBatchAdding, setIsBatchAdding] = useState(false);
  const { toast } = useToast();

  const MAX_KEYWORDS = 48;
  const isSandbox = isSandboxStore(storeEmail);

  const categories: {value: Keyword['category'];label: string;}[] = [
  { value: "general", label: "整體印象" },
  { value: "product", label: "技術成效" },
  { value: "service", label: "服務溝通" },
  { value: "environment", label: "環境設備" },
  { value: "area", label: "地區特色" }];


  const getCategoryLabel = (category: string) =>
  categories.find((c) => c.value === category)?.label || category;

  useEffect(() => {
    if (storeId) fetchKeywords();
  }, [storeId, storeIndustry]);

  const handleAddKeyword = async () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;

    if (keywords.length >= MAX_KEYWORDS) {
      toast({
        variant: "destructive",
        title: "已達上限",
        description: `最多只能設定 ${MAX_KEYWORDS} 個關鍵字`
      });
      return;
    }

    if (trimmed.length < 3 || trimmed.length > 7) {
      toast({
        variant: "destructive",
        title: "格式不符",
        description: "關鍵字長度需為 3~7 個字"
      });
      return;
    }

    const created = await addKeyword(trimmed, selectedCategory);
    if (created) {
      setNewKeyword("");
      toast({ title: "新增成功", description: `已新增關鍵字「${trimmed}」` });
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    const keyword = keywords.find((k) => k.id === id);
    await deleteKeyword(id);
    if (keyword) toast({ title: "刪除成功", description: `已刪除關鍵字「${keyword.keyword}」` });
  };

  const generateSuggestions = async () => {
    if (!storeId) return;
    setIsGeneratingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-keywords', {
        body: { storeId, primaryKeywords: keywords.map((k) => k.keyword) }
      });
      if (error) throw error;
      if (data?.keywords) {
        const existingKeywords = keywords.map((k) => k.keyword.toLowerCase());
        const newSuggestions = data.keywords.
        filter((kw: string) => !existingKeywords.includes(kw.toLowerCase())).
        slice(0, 8);
        setSuggestedKeywords(newSuggestions);
        setSelectedSuggestions([]);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({ variant: "destructive", title: "產生建議失敗", description: "請稍後再試" });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleBatchAdd = async () => {
    if (selectedSuggestions.length === 0) return;
    const remainingSlots = MAX_KEYWORDS - keywords.length;
    if (remainingSlots === 0) return;

    setIsBatchAdding(true);
    try {
      let successCount = 0;
      const keywordsToAdd = selectedSuggestions.slice(0, remainingSlots);
      for (const suggestion of keywordsToAdd) {
        if (!isSandbox && (suggestion.length < 3 || suggestion.length > 7)) continue;
        if (keywords.some((k) => k.keyword.toLowerCase() === suggestion.toLowerCase())) continue;
        const created = await addKeyword(suggestion, 'general');
        if (created) successCount++;
      }
      setSelectedSuggestions([]);
      if (successCount > 0) {
        toast({ title: "批量新增完成", description: `成功新增 ${successCount} 個關鍵字` });
      }
    } finally {
      setIsBatchAdding(false);
    }
  };

  const generateCSV = (kwList: Keyword[]) => {
    const headers = ['keyword', 'category', 'usage_count', 'is_primary'];
    const csvContent = [
    headers.join(','),
    ...kwList.map((k) => [`"${k.keyword}"`, `"${getCategoryLabel(k.category)}"`, k.usage_count || 0, k.is_primary || false].join(','))].
    join('\n');
    return '\uFEFF' + csvContent;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAllCSV = () => {
    if (keywords.length === 0) return;
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
    downloadCSV(generateCSV(keywords), `keywords-${storeId}-${timestamp}.csv`);
    toast({ title: "下載成功", description: `已下載 ${keywords.length} 個關鍵字` });
  };

  const filteredKeywords = keywords.filter((kw) => {
    const matchesSearch = kw.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && kw.category === activeTab;
  });

  const usagePercentage = keywords.length / MAX_KEYWORDS * 100;
  const remainingCount = MAX_KEYWORDS - keywords.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">關鍵字管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>);

  }

  return (
    <>
      {!isSandbox && storeId &&
      <IndustryOnboarding
        storeId={storeId}
        storeIndustry={storeIndustry}
        keywordCount={keywords.length}
        onKeywordsApplied={fetchKeywords} />

      }

      <KeywordGuideHint />

      {storeId && isSandbox &&
      <IndustryTemplateSwitcher
        storeId={storeId}
        currentKeywords={keywords}
        onKeywordsChanged={fetchKeywords}
        storeIndustry={storeIndustry} />

      }

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
                    className="h-8 px-3">
                    
                    <Download className="w-4 h-4 mr-1" />
                    下載
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportAllCSV}>
                    下載全部關鍵字 ({keywords.length})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Badge variant="outline" className="text-sm font-medium">
                {keywords.length}/{MAX_KEYWORDS}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                已設定 {keywords.length} 個關鍵字
              </span>
              <span className={`font-medium ${
              usagePercentage >= 90 ? 'text-destructive' :
              usagePercentage >= 70 ? 'text-orange-600' :
              'text-green-600'}`
              }>
                {remainingCount > 0 ? `還可新增 ${remainingCount} 個` : '已達上限'}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="輸入自訂感受關鍵字（3-7字）"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                className="flex-1"
                disabled={keywords.length >= MAX_KEYWORDS} />
              
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Keyword['category'])}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) =>
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddKeyword}
                size="sm"
                disabled={keywords.length >= MAX_KEYWORDS}
                className="bg-brand-sage hover:bg-brand-sage-dark">
                
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {/* 保留 orange 狀態色 */}
            {keywords.length >= MAX_KEYWORDS &&
            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                已達到 {MAX_KEYWORDS} 個關鍵字上限，請刪除不需要的關鍵字後再新增
              </div>
            }
          </div>

          {/* AI 建議區塊 */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-primary/5 to-accent rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">系統智慧建議</span>
              </div>
              <Button
                onClick={generateSuggestions}
                disabled={isGeneratingSuggestions || !storeId}
                size="sm"
                variant="outline"
                className="text-primary border-primary/30 hover:bg-primary/10">
                
                {isGeneratingSuggestions ?
                <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
                    產生中...
                  </> :

                <>
                    <Wand2 className="w-3 h-3 mr-1" />
                    AI 建議 8 個
                  </>
                }
              </Button>
            </div>
            
            {suggestedKeywords.length > 0 &&
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-primary">選擇要新增的關鍵字</p>
                  <div className="flex items-center gap-2 text-xs text-primary/80">
                    <span>已選 {selectedSuggestions.length} 個</span>
                    <span>•</span>
                    <span>可新增 {Math.max(0, MAX_KEYWORDS - keywords.length)} 個</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedKeywords.map((suggestion, index) => {
                  const isSelected = selectedSuggestions.includes(suggestion);
                  const cannotAdd = keywords.length >= MAX_KEYWORDS;
                  const isExisting = keywords.some((k) => k.keyword.toLowerCase() === suggestion.toLowerCase());
                  const isInvalid = !isSandbox && (suggestion.length < 3 || suggestion.length > 7);
                  return (
                    <div key={index} className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                    isSelected ? 'bg-primary/5 border-primary/30' : 'bg-background border-border'} ${
                    cannotAdd || isExisting || isInvalid ? 'opacity-50' : 'hover:border-primary/30'}`}>
                        <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          setSelectedSuggestions((prev) =>
                          checked ? [...prev, suggestion] : prev.filter((s) => s !== suggestion)
                          );
                        }}
                        disabled={cannotAdd || isExisting || isInvalid}
                        className="data-[state=checked]:bg-primary" />
                      
                        <button
                        onClick={() => setNewKeyword(suggestion)}
                        className="flex-1 text-left text-sm hover:text-primary transition-colors">
                        
                          {suggestion}
                          {/* 保留 orange/red 狀態色 */}
                          {isExisting && <span className="text-xs text-orange-500 ml-1">(已存在)</span>}
                          {isInvalid && <span className="text-xs text-destructive ml-1">(長度不符)</span>}
                        </button>
                      </div>);

                })}
                </div>
                {selectedSuggestions.length > 0 &&
              <Button
                onClick={handleBatchAdd}
                disabled={isBatchAdding || keywords.length >= MAX_KEYWORDS}
                size="sm"
                className="w-full">
                
                    {isBatchAdding ?
                <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground mr-2" />
                        批量新增中...
                      </> :

                <>
                        <Plus className="w-3 h-3 mr-1" />
                        批量新增選中的 {selectedSuggestions.length} 個關鍵字
                      </>
                }
                  </Button>
              }
              </div>
            }
          </div>

          {keywords.length > 0 &&
          <KeywordFilterTabs
            keywords={keywords}
            activeTab={activeTab}
            onTabChange={setActiveTab} />

          }

          {showSearch && keywords.length > 0 &&
          <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
              placeholder="搜索關鍵字..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10" />
            
            </div>
          }

          <div className="overflow-y-auto" style={{ maxHeight }}>
            {filteredKeywords.length === 0 ?
            <div className="text-center py-4 text-muted-foreground text-sm">
                {searchTerm || activeTab !== "all" ? "沒有找到符合條件的關鍵字" : "尚未新增任何關鍵字"}
              </div> :

            <div className="grid grid-cols-2 gap-3">
                {filteredKeywords.map((keyword) =>
              <InlineKeywordEdit
                key={keyword.id}
                keyword={keyword}
                onUpdate={fetchKeywords}
                onDelete={handleDeleteKeyword}
                categoryLabel={getCategoryLabel(keyword.category)} />

              )}
              </div>
            }
          </div>

          <div className="pt-2 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              總計: {keywords.length}/{MAX_KEYWORDS} 個關鍵字
              {remainingCount > 0 &&
              <span className="text-green-600 ml-2">還可新增 {remainingCount} 個</span>
              }
            </span>
            {storeId &&
            <ResetKeywordsButton
              storeId={storeId}
              keywordCount={keywords.length}
              onReset={fetchKeywords} />

            }
          </div>
        </CardContent>
      </Card>
    </>);

};