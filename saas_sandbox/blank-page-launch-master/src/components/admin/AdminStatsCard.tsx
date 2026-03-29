import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { adminTheme, StatColorKey } from '@/styles/admin-theme';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: StatColorKey;
  trend?: number;
  trendLabel?: string;
  description?: string;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
  title, value, icon: Icon, color = 'primary',
  trend, trendLabel, description, compact = false,
  className, onClick,
}) => {
  const colorTheme = adminTheme.statColors[color];
  
  const getTrendDisplay = () => {
    if (trend === undefined || trend === null) return null;
    const isPositive = trend > 0;
    const isNeutral = trend === 0;
    const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
    const trendColorClass = isNeutral 
      ? 'text-muted-foreground' 
      : isPositive ? 'text-emerald-600' : 'text-rose-600';
    
    return (
      <div className={cn('flex items-center gap-1 text-xs font-semibold', trendColorClass)}>
        <TrendIcon className="h-3 w-3" />
        <span>{isPositive && '+'}{trend}</span>
        {trendLabel && <span className="text-muted-foreground font-normal">{trendLabel}</span>}
      </div>
    );
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-4 rounded-xl bg-card border border-[hsl(150,20%,88%)] shadow-[0_2px_8px_hsla(150,30%,20%,0.08)] admin-stat-glow',
          onClick && 'cursor-pointer', className
        )}
        onClick={onClick}
      >
        <div className="p-2.5 rounded-lg" style={colorTheme.bgStyle}>
          <Icon className="h-4 w-4" style={colorTheme.iconStyle} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-xl font-bold text-foreground truncate">{value}</p>
        </div>
        {getTrendDisplay()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative p-5 rounded-xl bg-card border border-[hsl(150,20%,88%)] shadow-[0_2px_8px_hsla(150,30%,20%,0.08)] admin-stat-glow overflow-hidden',
        onClick && 'cursor-pointer', className
      )}
      onClick={onClick}
    >
      {/* Decorative corner */}
      <div className={cn(
        'absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-[0.06] transition-opacity duration-300 group-hover:opacity-[0.1]',
        colorTheme.bg
      )} style={{ background: `radial-gradient(circle, hsl(var(--primary) / 0.3), transparent)` }} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="p-2 rounded-lg transition-transform duration-200 group-hover:scale-110" style={colorTheme.bgStyle}>
            <Icon className="h-4 w-4" style={colorTheme.iconStyle} />
          </div>
        </div>
        
        <div className="mb-1">
          <p className="text-3xl font-extrabold text-foreground tracking-tight leading-none">{value}</p>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          {getTrendDisplay()}
          {description && !trend && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface AdminStatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({
  children, columns = 4, className,
}) => {
  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', columnClasses[columns], className)}>
      {children}
    </div>
  );
};

export default AdminStatsCard;
