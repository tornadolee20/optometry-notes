
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandButtonProps {
  isExpanded: boolean;
  onClick: () => void;
}

export const ExpandButton = ({ isExpanded, onClick }: ExpandButtonProps) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
    >
      {isExpanded ? (
        <>
          <ChevronUp className="w-4 h-4 mr-1" />
          收起真實感受
        </>
      ) : (
        <>
          <ChevronDown className="w-4 h-4 mr-1" />
          展開更多真實感受
        </>
      )}
    </Button>
  );
};
