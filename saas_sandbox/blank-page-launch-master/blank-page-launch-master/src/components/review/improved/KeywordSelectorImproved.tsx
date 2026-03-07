import { useEffect, useState } from "react";
import type { Keyword } from "@/types/store";
import { useToast } from "@/components/ui/use-toast";
import { useKeywordGenerator } from "@/hooks/use-keyword-generator";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { RegenerateButton } from "./components/RegenerateButton";
import { KeywordSection } from "./components/KeywordSection";
import { CustomFeelingsSection } from "./components/CustomFeelingsSection";
import { SelectedKeywordsDisplay } from "./components/SelectedKeywordsDisplay";

interface KeywordSelectorImprovedProps {
  keywords: Keyword[];
  selectedKeywords: string[];
  onKeywordSelect: (keywords: string[]) => void;
  storeId: string;
  storeName?: string;
  onKeywordsUpdate?: (keywords: Keyword[]) => void;
  onCustomFeelingsChange?: (feelings: string[]) => void;
}

export const KeywordSelectorImproved = ({
  keywords: initialKeywords,
  selectedKeywords,
  onKeywordSelect,
  storeId,
  onKeywordsUpdate,
  onCustomFeelingsChange,
}: KeywordSelectorImprovedProps) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [customFeelings, setCustomFeelings] = useState<string[]>([]);
  const { keywords, isGenerating, regenerateKeywords } = useKeywordGenerator(storeId, initialKeywords);

  const maxKeywords = 6;
  const minKeywords = 3;

  const handleKeywordClick = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      onKeywordSelect(selectedKeywords.filter(k => k !== keyword));
    } else {
      const totalSelected = selectedKeywords.length + customFeelings.length;
      if (totalSelected >= maxKeywords) {
        toast({
          title: "已達上限",
          description: `真實感受與自訂感受總共最多只能選擇 ${maxKeywords} 個`,
        });
        return;
      }
      onKeywordSelect([...selectedKeywords, keyword]);
    }
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent, keyword: string) => {
    // 支援Enter和Space鍵選擇關鍵字
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleKeywordClick(keyword);
    }
    // 支援方向鍵導航
    else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const allButtons = document.querySelectorAll('[data-keyword-button]');
      const currentIndex = Array.from(allButtons).findIndex(
        button => button === e.currentTarget
      );
      
      let nextIndex = currentIndex;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % allButtons.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        nextIndex = currentIndex === 0 ? allButtons.length - 1 : currentIndex - 1;
      }
      
      (allButtons[nextIndex] as HTMLElement)?.focus();
    }
  };

  const handleAddCustomFeeling = (feeling: string) => {
    const totalSelected = selectedKeywords.length + customFeelings.length;
    if (totalSelected >= maxKeywords) {
      toast({
        title: "已達上限",
        description: `真實感受與自訂感受總共最多只能選擇 ${maxKeywords} 個`,
      });
      return;
    }

    if (customFeelings.includes(feeling)) {
      toast({
        title: "重複感受",
        description: "這個感受已經被添加了",
      });
      return;
    }

    const newFeelings = [...customFeelings, feeling];
    setCustomFeelings(newFeelings);
    onCustomFeelingsChange?.(newFeelings);
    
    toast({
      title: "成功新增",
      description: `已新增自訂感受「${feeling}」`,
    });
  };

  const handleRemoveCustomFeeling = (feeling: string) => {
    const newFeelings = customFeelings.filter(f => f !== feeling);
    setCustomFeelings(newFeelings);
    onCustomFeelingsChange?.(newFeelings);
  };

  const handleRegenerate = async () => {
    const newKeywords = await regenerateKeywords();
    if (onKeywordsUpdate) {
      onKeywordsUpdate(newKeywords);
    }
  };

  // 計算策略類型 - 客人始終看到16個關鍵字
  const getKeywordStrategy = () => {
    return { type: 'focused', message: '精選16個關鍵字' };
  };

  const handleResetSelection = () => {
    onKeywordSelect([]);
    toast({
      title: "已重設",
      description: "已清除所有選擇的感受詞彙",
    });
  };

  // 分類關鍵字（嚴格顯示 16 個：主 + 其他 合計 16）
  const primaryKeywords = keywords.filter(kw => kw.is_primary);
  const regularKeywords = keywords.filter(kw => !kw.is_primary);
  
  const TOTAL_VISIBLE = 16;
  const visiblePrimaryKeywords = primaryKeywords.slice(0, Math.min(primaryKeywords.length, TOTAL_VISIBLE));
  const remainingForRegular = Math.max(0, TOTAL_VISIBLE - visiblePrimaryKeywords.length);
  // 確保總數始終為16個，無論展開狀態
  const visibleRegularKeywords = regularKeywords.slice(0, remainingForRegular);

  useEffect(() => {
    if (keywords.length < 16) {
      handleRegenerate();
    }
  }, [keywords.length]);

  return (
    <div className="space-y-6">
      <ProgressIndicator
        selectedCount={selectedKeywords.length}
        maxKeywords={maxKeywords}
        minKeywords={minKeywords}
        onReset={handleResetSelection}
      />


      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <RegenerateButton
            isGenerating={isGenerating}
            onRegenerate={handleRegenerate}
          />
          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md">
            {getKeywordStrategy().message}
          </div>
        </div>
      </div>

      {/* 傳統視圖 */}
      <div className="space-y-6">
        <KeywordSection
          title="重點推薦"
          keywords={visiblePrimaryKeywords}
          selectedKeywords={selectedKeywords}
          onKeywordClick={handleKeywordClick}
          onKeywordKeyDown={handleKeywordKeyDown}
          isPrimary={true}
        />

        <KeywordSection
          title="真實感受"
          keywords={visibleRegularKeywords}
          selectedKeywords={selectedKeywords}
          onKeywordClick={handleKeywordClick}
          onKeywordKeyDown={handleKeywordKeyDown}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          totalCount={regularKeywords.length}
          visibleCount={visibleRegularKeywords.length}
        />
      </div>

      <CustomFeelingsSection
        customFeelings={customFeelings}
        onAddFeeling={handleAddCustomFeeling}
        onRemoveFeeling={handleRemoveCustomFeeling}
      />

      <SelectedKeywordsDisplay
        selectedKeywords={selectedKeywords}
        onRemoveKeyword={handleKeywordClick}
      />


    </div>
  );
};