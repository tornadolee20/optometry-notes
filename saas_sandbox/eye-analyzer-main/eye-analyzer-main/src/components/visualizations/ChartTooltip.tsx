import React from 'react';
import { cn } from '@/lib/utils';

export interface ChartTooltipData {
  visible: boolean;
  x: number;
  y: number;
  content: {
    title: string;
    value?: string;
    status?: string;
    statusType?: 'success' | 'warning' | 'error';
    description?: string;
    details?: string[];
  } | null;
}

interface ChartTooltipProps {
  tooltip: ChartTooltipData;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ tooltip }) => {
  if (!tooltip.visible || !tooltip.content) return null;

  const { content } = tooltip;

  return (
    <div
      className="fixed z-50 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        left: tooltip.x + 12,
        top: tooltip.y + 12,
      }}
    >
      <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 max-w-xs">
        <p className="font-semibold text-sm">{content.title}</p>
        
        {content.value && (
          <p className="text-lg font-bold mt-1">{content.value}</p>
        )}
        
        {content.status && (
          <p className={cn(
            "text-xs mt-1.5 font-medium",
            content.statusType === 'success' && "text-clinical-normal",
            content.statusType === 'warning' && "text-amber-600",
            content.statusType === 'error' && "text-destructive"
          )}>
            {content.status}
          </p>
        )}
        
        {content.description && (
          <p className="text-xs text-muted-foreground mt-1.5">
            {content.description}
          </p>
        )}
        
        {content.details && content.details.length > 0 && (
          <ul className="text-xs text-muted-foreground mt-2 space-y-0.5">
            {content.details.map((detail, i) => (
              <li key={i}>• {detail}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChartTooltip;
