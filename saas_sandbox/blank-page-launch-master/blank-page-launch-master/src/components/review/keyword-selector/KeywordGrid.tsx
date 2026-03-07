
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Keyword } from "@/types/store";

interface KeywordGridProps {
  keywords: Keyword[];
  selectedKeywords: string[];
  onKeywordClick: (keyword: string) => void;
  isExpanded: boolean;
}

export const KeywordGrid = ({ 
  keywords,
  selectedKeywords,
  onKeywordClick,
  isExpanded
}: KeywordGridProps) => {
  const visibleKeywords = isExpanded ? keywords : keywords.slice(0, 8);

  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-4 gap-2"
      layout
      transition={{
        layout: { duration: 0.3, ease: "easeInOut" }
      }}
    >
      {visibleKeywords.map((kw, index) => (
        <motion.div
          key={kw.id || index}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ 
            delay: index * 0.03,
            duration: 0.3,
            ease: "easeOut"
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          layout
        >
          <Button
            variant={selectedKeywords.includes(kw.keyword) ? "default" : "outline"}
            onClick={() => onKeywordClick(kw.keyword)}
            className={`text-sm h-auto py-3 px-4 w-full transition-all duration-300 ease-out relative overflow-hidden ${
              selectedKeywords.includes(kw.keyword) 
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg border-green-500" 
                : kw.is_primary
                ? "border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 shadow-sm"
                : "hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
            }`}
            size="sm"
          >
            <span className="relative z-10 flex items-center justify-center">
              {kw.keyword}
              {selectedKeywords.includes(kw.keyword) && (
                <motion.span 
                  className="ml-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
                >
                  ✓
                </motion.span>
              )}
              {kw.is_primary && !selectedKeywords.includes(kw.keyword) && (
                <motion.span 
                  className="ml-1 text-blue-500"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  ★
                </motion.span>
              )}
            </span>
            
            {/* 選中時的背景動畫 */}
            {selectedKeywords.includes(kw.keyword) && (
              <motion.div
                className="absolute inset-0 bg-white opacity-20"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};
