
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";

interface RefreshButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export const RefreshButton = ({ isLoading, onClick }: RefreshButtonProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCcw className="w-4 h-4" />
        )}
        換一組真實感受
      </Button>
    </div>
  );
};
