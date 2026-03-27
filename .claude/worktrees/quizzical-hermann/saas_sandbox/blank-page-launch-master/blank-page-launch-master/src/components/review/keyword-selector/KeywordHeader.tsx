
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";

interface KeywordHeaderProps {
  isGenerating: boolean;
  onRegenerate: () => void;
}

export const KeywordHeader = ({ isGenerating, onRegenerate }: KeywordHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm md:text-base font-medium">選擇3-6個詞彙來描述您的真實感受</p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRegenerate}
        disabled={isGenerating}
        className="flex items-center gap-2"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCcw className="w-4 h-4" />
        )}
        換一組感受詞彙
      </Button>
    </div>
  );
};
