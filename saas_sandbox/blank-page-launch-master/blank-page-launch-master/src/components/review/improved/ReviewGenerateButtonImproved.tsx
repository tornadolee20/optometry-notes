import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Zap, 
  RefreshCw, 
  Clock,
  CheckCircle,
  Loader2,
  StopCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const GENERATION_STAGES = [
  { text: "理解您的真實體驗", duration: 3 },
  { text: "了解店家特色風格", duration: 4 },
  { text: "構思評論結構", duration: 3 },
  { text: "撰寫個人化內容", duration: 4 },
  { text: "最後潤飾調整", duration: 1 }
];

interface ReviewGenerateButtonImprovedProps {
  isGenerating: boolean;
  hasGeneratedReview: boolean;
  onGenerate: () => void;
  onCancel?: () => void;
  disabled: boolean;
}

export const ReviewGenerateButtonImproved = ({
  isGenerating,
  hasGeneratedReview,
  onGenerate,
  onCancel,
  disabled
}: ReviewGenerateButtonImprovedProps) => {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [currentStage, setCurrentStage] = useState("");


  useEffect(() => {
    if (isGenerating) {
      setProgress(0);
      setTimeRemaining(15);
      let currentTime = 0;
      let stageIndex = 0;
      
      const interval = setInterval(() => {
        currentTime += 0.5;
        const progressPercent = Math.min((currentTime / 15) * 100, 95);
        setProgress(progressPercent);
        setTimeRemaining(Math.max(15 - currentTime, 0));

        // 更新當前階段
        let cumulativeTime = 0;
        for (let i = 0; i < GENERATION_STAGES.length; i++) {
          cumulativeTime += GENERATION_STAGES[i].duration;
          if (currentTime <= cumulativeTime) {
            if (stageIndex !== i) {
              stageIndex = i;
              setCurrentStage(GENERATION_STAGES[i].text);
            }
            break;
          }
        }

        if (currentTime >= 15) {
          setProgress(100);
          setTimeRemaining(0);
          setCurrentStage("完成撰寫");
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
      setTimeRemaining(15);
      setCurrentStage("");
    }
  }, [isGenerating]);

  const getButtonText = () => {
    if (isGenerating) return "正在撰寫您的評論...";
    if (hasGeneratedReview) return "重新撰寫評論";
    return "分享我的體驗感受";
  };

  const getButtonIcon = () => {
    if (isGenerating) return <Loader2 className="w-5 h-5 animate-spin" />;
    if (hasGeneratedReview) return <RefreshCw className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4">
      {/* 主要生成按鈕 */}
      <Button
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        className={cn(
          "w-full h-16 text-lg font-medium rounded-xl transition-all duration-300",
          "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
          "shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          isGenerating && "cursor-not-allowed"
        )}
        aria-describedby={isGenerating ? "generation-progress" : disabled ? "generation-disabled-hint" : undefined}
        aria-label={
          isGenerating 
            ? "正在生成評論，請稍候" 
            : hasGeneratedReview 
            ? "重新生成評論" 
            : "開始生成評論"
        }
        role="button"
        tabIndex={0}
      >
        <motion.div
          className="flex items-center justify-center gap-3"
          animate={{ scale: isGenerating ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 2, repeat: isGenerating ? Infinity : 0 }}
        >
          {getButtonIcon()}
          <span>{getButtonText()}</span>
          {!isGenerating && !disabled && (
            <Zap className="w-4 h-4 text-yellow-300" />
          )}
        </motion.div>
      </Button>

      {/* 禁用狀態提示 */}
      <AnimatePresence>
        {disabled && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
            id="generation-disabled-hint"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 text-yellow-700">
              <Clock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm">請先選擇至少 3 個關鍵字才能開始撰寫評論</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 生成進度面板 */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6"
            id="generation-progress"
            role="status"
            aria-live="polite"
            aria-label="評論生成進度"
          >
            <div className="space-y-4">
              {/* 進度條 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900" id="progress-label">撰寫進度</span>
                  <span className="text-sm text-blue-700" aria-live="polite">{Math.round(progress)}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2 bg-blue-100"
                  aria-labelledby="progress-label"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>

              {/* 當前階段 */}
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
                role="status"
                aria-live="polite"
                aria-label="當前處理階段"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" aria-hidden="true" />
                <span className="text-sm text-blue-800">{currentStage}</span>
              </motion.div>

              {/* 時間預估 */}
              <div className="flex items-center justify-between text-xs text-blue-600" role="timer" aria-live="polite">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span>預計剩餘時間</span>
                </div>
                <span className="font-medium" aria-label={`剩餘 ${timeRemaining > 0 ? Math.ceil(timeRemaining) : 0} 秒`}>
                  {timeRemaining > 0 ? `${Math.ceil(timeRemaining)} 秒` : "即將完成"}
                </span>
              </div>

              {/* 取消按鈕 */}
              {onCancel && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    aria-label="停止生成評論"
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    停止生成
                  </Button>
                </div>
              )}

              {/* 提示文字 */}
              <div className="text-xs text-blue-600 bg-blue-100 rounded-lg p-2 text-center">
                AI 正在根據您選擇的關鍵字，為您撰寫個人化的評論內容
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 生成完成提示 */}
      <AnimatePresence>
        {hasGeneratedReview && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3"
            role="status"
            aria-live="polite"
            aria-label="評論生成完成通知"
          >
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm">評論已生成完成！您可以查看並複製使用，或點擊重新撰寫。</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};