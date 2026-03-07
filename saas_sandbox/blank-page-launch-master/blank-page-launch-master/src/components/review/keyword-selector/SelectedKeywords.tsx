
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

interface SelectedKeywordsProps {
  keywords: string[];
  onReset: () => void;
  onRemove: (keyword: string) => void;
}

export const SelectedKeywords = ({
  keywords,
  onReset,
  onRemove
}: SelectedKeywordsProps) => {
  if (keywords.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm md:text-base font-medium">已選擇的真實感受：</p>
        <button 
          className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
          onClick={onReset}
        >
          <RefreshCcw className="w-3 h-3" />
          重置
        </button>
      </div>
      <motion.div 
        className="flex flex-wrap gap-2 mt-2"
        layout
      >
        {keywords.map((keyword, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              variant="default"
              size="sm"
              className="bg-green-100 text-green-700 hover:bg-green-200"
              onClick={() => onRemove(keyword)}
            >
              {keyword} ×
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
