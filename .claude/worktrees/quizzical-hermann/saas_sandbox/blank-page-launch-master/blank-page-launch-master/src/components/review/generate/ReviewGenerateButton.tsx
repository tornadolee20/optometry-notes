
import { RefreshCcw, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewGenerateButtonProps {
  isGenerating: boolean;
  hasGeneratedReview: boolean;
  onGenerate: () => void;
  disabled?: boolean;
}

export const ReviewGenerateButton = ({
  isGenerating,
  hasGeneratedReview,
  onGenerate,
  disabled
}: ReviewGenerateButtonProps) => {
  return (
    <Button
      className="w-full h-16 bg-[#698B69] hover:bg-[#557755] text-white text-lg rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
      onClick={onGenerate}
      disabled={disabled || isGenerating}
    >
      {isGenerating ? (
        <>
          <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
          撰寫評論中...
        </>
      ) : hasGeneratedReview ? (
        <>
          <RefreshCcw className="w-5 h-5 mr-2" />
          我想重新撰寫
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5 mr-2" />
          <Zap className="w-5 h-5 mr-2" />
          根據我的感受撰寫評論
        </>
      )}
    </Button>
  );
};
