import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegenerateButtonProps {
  isGenerating: boolean;
  onRegenerate: () => void;
}

export const RegenerateButton = ({
  isGenerating,
  onRegenerate,
}: RegenerateButtonProps) => {
  return (
    <div className="flex justify-center">
      <Button
        variant="outline"
        onClick={onRegenerate}
        disabled={isGenerating}
        className="flex items-center gap-2"
      >
        <Shuffle className={cn("w-4 h-4", isGenerating && "animate-spin")} />
        {isGenerating ? "重新生成中..." : "換一組感受詞彙"}
      </Button>
    </div>
  );
};