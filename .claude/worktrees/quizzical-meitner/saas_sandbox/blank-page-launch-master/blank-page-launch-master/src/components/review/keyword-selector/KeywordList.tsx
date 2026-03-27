
import { motion } from "framer-motion";
import type { Keyword } from "@/types/store";

interface KeywordListProps {
  keywords: Keyword[];
  selectedKeywords: string[];
  isExpanded: boolean;
  onKeywordClick: (keyword: string) => void;
  onToggleExpand: () => void;
}

export const KeywordList = ({
  keywords,
  selectedKeywords,
  isExpanded,
  onKeywordClick,
  onToggleExpand,
}: KeywordListProps) => {
  const visibleKeywords = isExpanded ? keywords : keywords.slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {visibleKeywords.map((kw, index) => (
          <motion.button
            key={kw.id || index}
            onClick={() => onKeywordClick(kw.keyword)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              p-3 rounded-lg text-sm font-medium text-center transition-all
              ${selectedKeywords.includes(kw.keyword)
                ? 'bg-green-500 text-white transform scale-105 hover:bg-green-600'
                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }
              ${kw.is_primary && !selectedKeywords.includes(kw.keyword)
                ? 'border-blue-200 bg-blue-50'
                : ''
              }
            `}
          >
            {kw.keyword}
            {selectedKeywords.includes(kw.keyword) && (
              <span className="ml-1">✓</span>
            )}
            {kw.is_primary && !selectedKeywords.includes(kw.keyword) && (
              <span className="ml-1 text-blue-500">★</span>
            )}
          </motion.button>
        ))}
      </div>

      {keywords.length > 8 && (
        <button
          onClick={onToggleExpand}
          className="w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
        >
          {isExpanded ? (
            <>
              <span>收起關鍵字</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              <span>展開更多關鍵字</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
};
