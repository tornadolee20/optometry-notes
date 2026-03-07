import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EvidenceLevel, EVIDENCE_LEVEL_DESCRIPTION } from '@/lib/references/literatureDatabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface EvidenceBadgeProps {
  level: EvidenceLevel;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1'
};

export function EvidenceBadge({ 
  level, 
  size = 'md', 
  showTooltip = true,
  className 
}: EvidenceBadgeProps) {
  const { language } = useLanguage();
  const levelInfo = EVIDENCE_LEVEL_DESCRIPTION[level];
  
  const isTraditionalChinese = language === 'zh-TW';
  const displayLabel = isTraditionalChinese ? levelInfo.labelCN : levelInfo.label;
  const description = isTraditionalChinese ? levelInfo.descriptionCN : levelInfo.description;
  
  const badge = (
    <Badge
      variant="outline"
      className={cn(
        levelInfo.color,
        levelInfo.textColor,
        'border-0 font-medium',
        sizeClasses[size],
        className
      )}
    >
      {displayLabel}
    </Badge>
  );
  
  if (!showTooltip) {
    return badge;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{levelInfo.label}</p>
            <p className="text-sm text-muted-foreground">{levelInfo.description}</p>
            {language === 'zh-TW' && (
              <p className="text-sm">{levelInfo.descriptionCN}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for inline use
export function EvidenceLevelIndicator({ level }: { level: EvidenceLevel }) {
  const levelInfo = EVIDENCE_LEVEL_DESCRIPTION[level];
  
  return (
    <span 
      className={cn(
        'inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold',
        levelInfo.color,
        levelInfo.textColor
      )}
      title={levelInfo.description}
    >
      {level}
    </span>
  );
}
