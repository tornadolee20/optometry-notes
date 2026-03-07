import { Target, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  selectedCount: number;
  maxKeywords: number;
  minKeywords: number;
  onReset: () => void;
}

export const ProgressIndicator = ({
  selectedCount,
  maxKeywords,
  minKeywords,
  onReset,
}: ProgressIndicatorProps) => {
  const progressPercentage = (selectedCount / maxKeywords) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-gray-900">
            選擇你的真實感受
          </span>
        </div>
        <Badge variant={selectedCount >= minKeywords ? "default" : "secondary"}>
          {selectedCount}/{maxKeywords}
        </Badge>
      </div>
      
      <Progress 
        value={progressPercentage} 
        className={cn(
          "h-2 transition-all duration-300",
          selectedCount >= minKeywords && "bg-green-100"
        )}
      />
      
      <div className="flex items-center justify-between text-base sm:text-sm">
        <span className="text-gray-600">
          {selectedCount < minKeywords 
            ? `還需要選擇 ${minKeywords - selectedCount} 個感受詞彙`
            : selectedCount === maxKeywords 
            ? "已達到最大選擇數量"
            : `還可以選擇 ${maxKeywords - selectedCount} 個感受詞彙`
          }
        </span>
        {selectedCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="text-gray-500 hover:text-red-500"
          >
            <X className="w-4 h-4 mr-1" />
            清除
          </Button>
        )}
      </div>
    </div>
  );
};