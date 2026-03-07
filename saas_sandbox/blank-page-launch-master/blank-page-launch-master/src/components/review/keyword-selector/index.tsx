
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Keyword } from "@/types/store";
import { KeywordList } from "./KeywordList";
import { CustomKeywordInput } from "./CustomKeywordInput";

interface KeywordSelectorProps {
  keywords: Keyword[];
  selectedKeywords: string[];
  onKeywordSelect: (keywords: string[]) => void;
  storeId: string;
}

export const KeywordSelector = ({
  keywords: initialKeywords,
  selectedKeywords,
  onKeywordSelect,
  storeId,
}: KeywordSelectorProps) => {
  const { toast } = useToast();
  const [customKeyword, setCustomKeyword] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleKeywordClick = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      onKeywordSelect(selectedKeywords.filter(k => k !== keyword));
    } else {
      if (selectedKeywords.length >= 6) {
        toast({
          title: "提醒",
          description: "最多只能選擇 6 個關鍵字",
        });
        return;
      }
      onKeywordSelect([...selectedKeywords, keyword]);
    }
  };

  const handleAddCustomKeyword = () => {
    if (!customKeyword.trim()) return;
    if (selectedKeywords.length >= 6) {
      toast({
        title: "提醒",
        description: "最多只能選擇 6 個關鍵字",
      });
      return;
    }
    onKeywordSelect([...selectedKeywords, customKeyword.trim()]);
    setCustomKeyword("");
  };

  const regenerateKeywords = async () => {
    try {
      setIsGenerating(true);

      // 獲取店家信息和行業
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('industry')
        .eq('id', storeId)
        .single();

      if (storeError) {
        console.error('Store error:', storeError);
        throw new Error('無法獲取店家資訊');
      }

      const industry = storeData?.industry || 'general';

      // 獲取行業熱門關鍵字
      const { data: industryKeywordsData } = await supabase
        .from('industry_keywords')
        .select('keyword, usage_count')
        .eq('industry', industry)
        .order('usage_count', { ascending: false })
        .limit(16);

      // 準備默認關鍵字
      const defaultKeywords = [
        "服務態度好", "環境整潔", "價格實惠", "專業技術", 
        "設備完善", "交通方便", "停車方便", "氣氛舒適",
        "CP值高", "回客率高", "推薦朋友", "值得再訪",
        "商品多樣", "品質保證", "服務親切", "經驗豐富"
      ];

      // 組合關鍵字
      let allKeywords: Keyword[] = [];

      // 添加行業關鍵字
      if (industryKeywordsData && industryKeywordsData.length > 0) {
        allKeywords = industryKeywordsData.map(kw => ({
          id: crypto.randomUUID(),
          keyword: kw.keyword,
          category: 'general' as const,
          source: 'ai' as const,
          is_primary: false
        }));
      }

      // 如果行業關鍵字不夠16個，添加默認關鍵字
      while (allKeywords.length < 16) {
        const remainingCount = 16 - allKeywords.length;
        const additionalKeywords = defaultKeywords
          .filter(dk => !allKeywords.some(k => k.keyword === dk))
          .slice(0, remainingCount)
          .map(keyword => ({
            id: crypto.randomUUID(),
            keyword,
            category: 'general' as const,
            source: 'ai' as const,
            is_primary: false
          }));
        allKeywords = [...allKeywords, ...additionalKeywords];
      }

      setKeywords(allKeywords);
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
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (initialKeywords.length < 16) {
      regenerateKeywords();
    }
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">評論關鍵字</h2>
          <p className="text-sm text-gray-500">
            選擇3-6個關鍵字來描述您的體驗
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {selectedKeywords.map((keyword, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => handleKeywordClick(keyword)}
            >
              {keyword} ×
            </motion.div>
          ))}
        </div>

        <KeywordList
          keywords={keywords}
          selectedKeywords={selectedKeywords}
          isExpanded={isExpanded}
          onKeywordClick={handleKeywordClick}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />

        <div className="relative">
          <CustomKeywordInput
            value={customKeyword}
            onChange={setCustomKeyword}
            onAdd={handleAddCustomKeyword}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            isFocused={inputFocused}
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={regenerateKeywords}
            disabled={isGenerating}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            換一組關鍵字
          </button>
        </div>
      </div>
    </Card>
  );
};
