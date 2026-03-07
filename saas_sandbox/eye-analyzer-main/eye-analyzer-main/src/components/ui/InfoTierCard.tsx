/**
 * InfoTierCard - 資訊分層卡片組件
 * Phase 3: Progressive disclosure for expert mode
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoTierCardProps {
  // Tier 1: Always visible
  title: string;
  primaryValue?: React.ReactNode;
  primaryLabel?: string;
  badge?: React.ReactNode;
  
  // Tier 2: Expandable details
  detailsTitle?: string;
  details?: React.ReactNode;
  
  // Tier 3: Expert-only deep dive
  expertTitle?: string;
  expertContent?: React.ReactNode;
  
  // Styling
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
  defaultExpanded?: boolean;
  showExpert?: boolean;
}

const variantStyles = {
  default: 'border-border bg-card',
  primary: 'border-primary/20 bg-primary/5',
  success: 'border-success/20 bg-success/5',
  warning: 'border-warning/20 bg-warning/5',
  destructive: 'border-destructive/20 bg-destructive/5',
};

export const InfoTierCard: React.FC<InfoTierCardProps> = ({
  title,
  primaryValue,
  primaryLabel,
  badge,
  detailsTitle = '查看詳情',
  details,
  expertTitle = '專家數據',
  expertContent,
  variant = 'default',
  className,
  defaultExpanded = false,
  showExpert = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showExpertContent, setShowExpertContent] = useState(false);

  return (
    <div 
      className={cn(
        'rounded-xl border p-4 transition-all duration-200 hover-lift',
        variantStyles[variant],
        className
      )}
    >
      {/* Tier 1: Primary info - Always visible */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {title}
            </span>
            {badge}
          </div>
          {primaryValue && (
            <div className="text-xl font-bold text-foreground">
              {primaryValue}
            </div>
          )}
          {primaryLabel && (
            <div className="text-sm text-muted-foreground mt-0.5">
              {primaryLabel}
            </div>
          )}
        </div>
        
        {/* Expand toggle for Tier 2 */}
        {details && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label={isExpanded ? '收起' : '展開'}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
        )}
      </div>

      {/* Tier 2: Expandable details */}
      <AnimatePresence>
        {isExpanded && details && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-border/50">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                {detailsTitle}
              </div>
              <div className="text-sm text-foreground/80 stagger-fade-in">
                {details}
              </div>
              
              {/* Tier 3: Expert toggle */}
              {showExpert && expertContent && (
                <button
                  onClick={() => setShowExpertContent(!showExpertContent)}
                  className="mt-3 text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {showExpertContent ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showExpertContent ? '隱藏專家數據' : expertTitle}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier 3: Expert-only content */}
      <AnimatePresence>
        {showExpertContent && expertContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 mt-2 border-t border-dashed border-border/30">
              <div className="text-[11px] font-mono text-muted-foreground bg-muted/30 p-2 rounded">
                {expertContent}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfoTierCard;
