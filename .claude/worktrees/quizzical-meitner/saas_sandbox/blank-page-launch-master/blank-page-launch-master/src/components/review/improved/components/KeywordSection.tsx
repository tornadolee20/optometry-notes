import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, Info } from "lucide-react";
import { KeywordButton } from "./KeywordButton";
import type { Keyword } from "@/types/store";

interface KeywordSectionProps {
  title: string;
  keywords: Keyword[];
  selectedKeywords: string[];
  onKeywordClick: (keyword: string) => void;
  onKeywordKeyDown?: (e: React.KeyboardEvent, keyword: string) => void;
  isPrimary?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  totalCount?: number;
  visibleCount?: number;
}

export const KeywordSection = ({
  title,
  keywords,
  selectedKeywords,
  onKeywordClick,
  onKeywordKeyDown,
  isPrimary = false,
  isExpanded,
  onToggleExpand,
  totalCount,
  visibleCount = 6,
}: KeywordSectionProps) => {
  if (keywords.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {isPrimary && <Star className="w-4 h-4 text-blue-500" />}
        <h3 className="font-medium text-gray-900">{title}</h3>
        {isPrimary && (
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            <Info className="w-3 h-3" />
            店家特色
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3" role="group" aria-label={title}>
        <AnimatePresence>
          {keywords.map((kw) => (
            <div key={kw.keyword} data-keyword-button>
              <KeywordButton 
                keyword={kw.keyword} 
                isPrimary={isPrimary}
                isSelected={selectedKeywords.includes(kw.keyword)}
                onClick={onKeywordClick}
                onKeyDown={onKeywordKeyDown}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
      
      {totalCount && totalCount > visibleCount && onToggleExpand && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={onToggleExpand}
            className="text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? "收起" : `顯示更多 (${totalCount - visibleCount})`}
          </Button>
        </div>
      )}
    </div>
  );
};