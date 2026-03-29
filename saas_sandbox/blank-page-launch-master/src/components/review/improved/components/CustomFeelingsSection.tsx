import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Sparkles } from "lucide-react";

interface CustomFeelingsSectionProps {
  customFeelings: string[];
  onAddFeeling: (feeling: string) => void;
  onRemoveFeeling: (feeling: string) => void;
}

const SMART_PLACEHOLDERS = [
"分享您的感動...",
"例如：驗光師超有耐心",
"推薦這裡的...",
"最印象深刻的是...",
"服務讓我覺得...",
"下次還會再來因為...",
"朋友一定會喜歡..."];


export const CustomFeelingsSection = ({
  customFeelings,
  onAddFeeling,
  onRemoveFeeling
}: CustomFeelingsSectionProps) => {
  const [customKeyword, setCustomKeyword] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SMART_PLACEHOLDERS.length);
    setPlaceholder(SMART_PLACEHOLDERS[randomIndex]);
  }, [showCustomInput]);

  const handleInputChange = (value: string) => {
    setCustomKeyword(value);
    if (value.trim().length > 0) {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    } else {
      setIsTyping(false);
    }
  };

  const handleSubmit = () => {
    if (!customKeyword.trim()) return;
    onAddFeeling(customKeyword.trim());
    setCustomKeyword("");
    setIsTyping(false);
    const randomIndex = Math.floor(Math.random() * SMART_PLACEHOLDERS.length);
    setPlaceholder(SMART_PLACEHOLDERS[randomIndex]);
  };

  const handleCancel = () => {
    setShowCustomInput(false);
    setCustomKeyword("");
    setIsTyping(false);
  };

  return (
    <div
      className="space-y-3 rounded-xl p-4 border border-amber-200/60"
      style={{ backgroundColor: "hsl(45, 100%, 96%)" }}>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground flex items-center gap-1.5">打出自己真實的感受
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            用自己的話描述體驗，系統會以此為評論主軸
            {customFeelings.length >= 3 &&
            <span className="text-amber-700 font-medium ml-1">
                （已達 {customFeelings.length} 個）
              </span>
            }
          </p>
        </div>
        {!showCustomInput &&
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomInput(true)}
          className="text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100"
          disabled={customFeelings.length >= 10}>
          
            <Plus className="w-4 h-4 mr-1" />
            新增
          </Button>
        }
      </div>

      {/* 已添加的自訂感受 */}
      {customFeelings.length > 0 &&
      <div className="space-y-2">
          <div className="text-sm font-medium text-amber-800">已添加的感受：</div>
          <div className="flex flex-wrap gap-2">
            {customFeelings.map((feeling, index) =>
          <Badge
            key={index}
            variant="secondary"
            className="px-3 py-1 text-sm cursor-pointer bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 transition-colors"
            onClick={() => onRemoveFeeling(feeling)}>
            
                {feeling}
                <X className="h-3 w-3 ml-1" />
              </Badge>
          )}
          </div>
        </div>
      }

      <AnimatePresence>
        {showCustomInput &&
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2">
          
            <div className="flex gap-2">
              <Input
              value={customKeyword}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              maxLength={20}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 border-amber-300 focus:border-amber-400 focus:ring-amber-200" />
            
              <Button
              onClick={handleSubmit}
              disabled={!customKeyword.trim()}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-primary-foreground">
              
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleCancel} size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {customKeyword.length}/20 字元 · {customFeelings.length}/10 個感受
              </p>
            </div>
            <AnimatePresence>
              {isTyping &&
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs font-medium bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              
                  太棒了！您的真實分享是我們進步的動力 ✨
                </motion.p>
            }
            </AnimatePresence>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

};
