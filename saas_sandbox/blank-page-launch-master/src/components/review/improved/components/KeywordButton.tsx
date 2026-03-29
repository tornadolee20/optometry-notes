import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeywordButtonProps {
  keyword: string;
  isPrimary?: boolean;
  isSelected: boolean;
  onClick: (keyword: string) => void;
  onKeyDown?: (e: React.KeyboardEvent, keyword: string) => void;
}

export const KeywordButton = ({ 
  keyword, 
  isPrimary = false, 
  isSelected, 
  onClick,
  onKeyDown
}: KeywordButtonProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant={isSelected ? "default" : "outline"}
        onClick={() => onClick(keyword)}
        onKeyDown={(e) => onKeyDown?.(e, keyword)}
        className={cn(
          "min-h-[52px] text-base sm:text-sm py-4 px-4 w-full transition-all duration-200",
          "touch-manipulation relative focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isSelected 
            ? "bg-green-500 hover:bg-green-600 text-primary-foreground border-green-500 shadow-lg" 
            : isPrimary
            ? "border-primary/30 bg-primary/10 hover:bg-primary/15 text-primary"
            : "hover:border-border hover:bg-muted"
        )}
        aria-pressed={isSelected}
        aria-label={`${isPrimary ? '重點' : ''}關鍵字：${keyword}${isSelected ? '，已選擇' : ''}`}
        tabIndex={0}
      >
        <div className="flex items-center justify-center gap-2 w-full">
          {isPrimary && !isSelected && (
            <Star className="w-3 h-3 text-primary flex-shrink-0" />
          )}
          <span className="truncate">{keyword}</span>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex-shrink-0"
            >
              <Check className="w-4 h-4" />
            </motion.div>
          )}
        </div>
        
        {isPrimary && !isSelected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
        )}
      </Button>
    </motion.div>
  );
};
