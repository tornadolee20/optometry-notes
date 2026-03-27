
import { useEffect } from "react";
import type { Keyword } from "@/types/store";
import { KeywordGrid } from "./keyword-selector/KeywordGrid";
import { ExpandButton } from "./keyword-selector/ExpandButton";
import { CustomInput } from "./keyword-selector/CustomInput";
import { SelectedKeywords } from "./keyword-selector/SelectedKeywords";
import { RefreshButton } from "./keyword-selector/RefreshButton";
import { useToast } from "@/components/ui/use-toast";
import { useKeywordGenerator } from "@/hooks/use-keyword-generator";
import { useState } from "react";

interface KeywordSelectorProps {
  keywords: Keyword[];
  selectedKeywords: string[];
  onKeywordSelect: (keywords: string[]) => void;
  storeId: string;
  onKeywordsUpdate?: (keywords: Keyword[]) => void;
}

export const KeywordSelector = ({
  keywords: initialKeywords,
  selectedKeywords,
  onKeywordSelect,
  storeId,
  onKeywordsUpdate,
}: KeywordSelectorProps) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const { keywords, isGenerating, regenerateKeywords } = useKeywordGenerator(storeId, initialKeywords);

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

  const handleCustomKeyword = (keyword: string) => {
    if (selectedKeywords.length >= 6) {
      toast({
        title: "提醒",
        description: "最多只能選擇 6 個關鍵字",
      });
      return;
    }
    onKeywordSelect([...selectedKeywords, keyword]);
  };

  const handleRegenerate = async () => {
    const newKeywords = await regenerateKeywords();
    if (onKeywordsUpdate) {
      onKeywordsUpdate(newKeywords);
    }
  };

  useEffect(() => {
    handleRegenerate();
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <RefreshButton 
          isLoading={isGenerating}
          onClick={handleRegenerate}
        />
        
        <div className="relative">
          <KeywordGrid 
            keywords={keywords}
            selectedKeywords={selectedKeywords}
            onKeywordClick={handleKeywordClick}
            isExpanded={isExpanded}
          />

          {keywords.length > 8 && (
            <ExpandButton 
              isExpanded={isExpanded}
              onClick={() => setIsExpanded(!isExpanded)}
            />
          )}
        </div>

        <CustomInput onSubmit={handleCustomKeyword} />

        <SelectedKeywords 
          keywords={selectedKeywords}
          onReset={() => onKeywordSelect([])}
          onRemove={handleKeywordClick}
        />
      </div>
    </div>
  );
};
