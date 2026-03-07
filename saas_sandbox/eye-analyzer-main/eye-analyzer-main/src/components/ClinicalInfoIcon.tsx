import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ClinicalTooltipContent } from './ClinicalTooltipContent';
import { cn } from '@/lib/utils';

interface ClinicalInfoIconProps {
  tooltipKey: string;
  age?: number;
  className?: string;
  size?: number;
}

export const ClinicalInfoIcon = ({ 
  tooltipKey, 
  age, 
  className,
  size = 14 
}: ClinicalInfoIconProps) => {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button 
          type="button" 
          className={cn(
            "text-muted-foreground hover:text-primary transition-colors p-1 -m-1 rounded-full",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
            "touch-manipulation",
            className
          )}
          aria-label="顯示說明"
        >
          <Info size={size} className="md:w-3.5 md:h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        align="start"
        className="max-w-sm p-3 z-50"
        sideOffset={5}
      >
        <ClinicalTooltipContent tooltipKey={tooltipKey} age={age} />
      </TooltipContent>
    </Tooltip>
  );
};
