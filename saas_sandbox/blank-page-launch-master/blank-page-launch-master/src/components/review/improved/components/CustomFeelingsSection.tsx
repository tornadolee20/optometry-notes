import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface CustomFeelingsSectionProps {
  customFeelings: string[];
  onAddFeeling: (feeling: string) => void;
  onRemoveFeeling: (feeling: string) => void;
}

export const CustomFeelingsSection = ({
  customFeelings,
  onAddFeeling,
  onRemoveFeeling,
}: CustomFeelingsSectionProps) => {
  const [customKeyword, setCustomKeyword] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSubmit = () => {
    if (!customKeyword.trim()) return;
    onAddFeeling(customKeyword.trim());
    setCustomKeyword("");
  };

  const handleCancel = () => {
    setShowCustomInput(false);
    setCustomKeyword("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">自訂感受</h3>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            用自己的話描述體驗感受，系統會自動分析情感
            {customFeelings.length >= 3 && (
              <span className="text-red-600 font-medium ml-1">
                （已達 {customFeelings.length} 個，將影響評論風格）
              </span>
            )}
          </p>
        </div>
        {!showCustomInput && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInput(true)}
            className="text-blue-600 border-blue-200"
            disabled={customFeelings.length >= 10}
          >
            <Plus className="w-4 h-4 mr-1" />
            新增
          </Button>
        )}
      </div>
      
      {/* 已添加的自訂感受 */}
      {customFeelings.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">已添加的感受：</div>
          <div className="flex flex-wrap gap-2">
            {customFeelings.map((feeling, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => onRemoveFeeling(feeling)}
              >
                {feeling}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <AnimatePresence>
        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <Input
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                placeholder="用自己的話描述感受..."
                maxLength={20}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="flex-1"
              />
              <Button 
                onClick={handleSubmit}
                disabled={!customKeyword.trim()}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              {customKeyword.length}/20 字元 · {customFeelings.length}/10 個感受
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};