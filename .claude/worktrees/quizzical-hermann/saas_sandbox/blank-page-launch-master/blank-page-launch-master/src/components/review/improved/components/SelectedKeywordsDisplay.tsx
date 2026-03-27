import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X } from "lucide-react";

interface SelectedKeywordsDisplayProps {
  selectedKeywords: string[];
  onRemoveKeyword: (keyword: string) => void;
}

export const SelectedKeywordsDisplay = ({
  selectedKeywords,
  onRemoveKeyword,
}: SelectedKeywordsDisplayProps) => {
  if (selectedKeywords.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-green-500" />
        已選擇的感受
      </h3>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {selectedKeywords.map((keyword, index) => (
            <motion.div
              key={keyword}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
            >
              <Badge 
                variant="default"
                className="bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer transition-colors px-3 py-1"
                onClick={() => onRemoveKeyword(keyword)}
              >
                <span className="text-xs font-medium mr-1">{index + 1}.</span>
                {keyword}
                <X className="w-4 h-4 ml-1 hover:text-red-500" />
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};