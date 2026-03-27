/**
 * ScoreRing - 環形分數顯示組件
 * Phase 2: Visual hierarchy enhancement with animated circular score
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from './AnimatedNumber';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeConfig = {
  sm: { width: 60, strokeWidth: 5, fontSize: 'text-lg' },
  md: { width: 80, strokeWidth: 6, fontSize: 'text-2xl' },
  lg: { width: 100, strokeWidth: 7, fontSize: 'text-3xl' },
};

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  maxScore = 100,
  size = 'md',
  showLabel = true,
  label,
  className,
}) => {
  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / maxScore, 1);
  const offset = circumference * (1 - progress);

  // Color based on score
  const getScoreColor = () => {
    if (score >= 80) return 'hsl(var(--clinical-normal))';
    if (score >= 60) return 'hsl(var(--clinical-warning))';
    return 'hsl(var(--clinical-abnormal))';
  };

  const getScoreLabel = () => {
    if (label) return label;
    if (score >= 80) return '優良';
    if (score >= 60) return '需關注';
    return '需處理';
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: config.width, height: config.width }}>
        {/* Background ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={config.width}
          height={config.width}
        >
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress ring with animation */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={getScoreColor()}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
            style={{
              '--score-offset': offset,
            } as React.CSSProperties}
          />
        </svg>
        
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedNumber
            value={score}
            className={cn('font-bold', config.fontSize)}
            style={{ color: getScoreColor() } as React.CSSProperties}
          />
        </div>
      </div>
      
      {showLabel && (
        <span 
          className="text-xs font-medium animate-badge-pop"
          style={{ color: getScoreColor() }}
        >
          {getScoreLabel()}
        </span>
      )}
    </div>
  );
};

export default ScoreRing;
