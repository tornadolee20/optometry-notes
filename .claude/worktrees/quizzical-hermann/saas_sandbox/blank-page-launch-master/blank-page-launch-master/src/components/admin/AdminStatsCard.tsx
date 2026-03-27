import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { adminTheme, StatColorKey } from '@/styles/admin-theme';

interface AdminStatsCardProps {
  /**
   * 標題/標籤
   */
  title: string;
  /**
   * 數值
   */
  value: string | number;
  /**
   * 圖標
   */
  icon: LucideIcon;
  /**
   * 顏色主題
   * @default 'primary'
   */
  color?: StatColorKey;
  /**
   * 趨勢變化（正數為上升，負數為下降）
   */
  trend?: number;
  /**
   * 趨勢描述
   */
  trendLabel?: string;
  /**
   * 附加描述
   */
  description?: string;
  /**
   * 是否顯示為緊湊模式
   * @default false
   */
  compact?: boolean;
  /**
   * 自訂類名
   */
  className?: string;
  /**
   * 點擊事件
   */
  onClick?: () => void;
}

/**
 * 後台統一統計卡片組件
 */
export const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  trend,
  trendLabel,
  description,
  compact = false,
  className,
  onClick,
}) => {
  const colorTheme = adminTheme.statColors[color];
  
  // 趨勢圖標和顏色
  const getTrendDisplay = () => {
    if (trend === undefined || trend === null) return null;
    
    const isPositive = trend > 0;
    const isNeutral = trend === 0;
    const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
    const trendColorClass = isNeutral 
      ? 'text-muted-foreground' 
      : isPositive 
        ? 'text-emerald-600' 
        : 'text-rose-600';
    
    return (
      <div className={cn('flex items-center gap-1 text-sm font-medium', trendColorClass)}>
        <TrendIcon className="h-4 w-4" />
        <span>{isPositive && '+'}{trend}%</span>
        {trendLabel && (
          <span className="text-muted-foreground font-normal ml-1">{trendLabel}</span>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-4',
          adminTheme.radius.lg,
          'bg-card border border-border',
          adminTheme.shadows.sm,
          onClick && 'cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300',
          className
        )}
        onClick={onClick}
      >
        <div className={cn('p-2', adminTheme.radius.md, colorTheme.bg)}>
          <Icon className={cn('h-5 w-5', colorTheme.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={adminTheme.typography.label}>{title}</p>
          <p className={cn(adminTheme.typography.smallValue, 'truncate')}>{value}</p>
        </div>
        {getTrendDisplay()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        adminTheme.spacing.cardPadding,
        adminTheme.radius.lg,
        'bg-card border border-border',
        adminTheme.shadows.md,
        'relative overflow-hidden',
        onClick && 'cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-300',
        className
      )}
      onClick={onClick}
    >
      {/* 背景裝飾 */}
      <div className={cn(
        'absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10',
        `bg-gradient-to-br ${adminTheme.gradients[color]}`
      )} />
      
      <div className="relative">
        {/* 頂部：標籤和圖標 */}
        <div className="flex items-start justify-between mb-4">
          <p className={adminTheme.typography.label}>{title}</p>
          <div className={cn('p-2', adminTheme.radius.md, colorTheme.bg)}>
            <Icon className={cn('h-5 w-5', colorTheme.icon)} />
          </div>
        </div>
        
        {/* 數值 */}
        <div className="mb-2">
          <p className={adminTheme.typography.value}>{value}</p>
        </div>
        
        {/* 底部：趨勢或描述 */}
        <div className="flex items-center justify-between">
          {getTrendDisplay()}
          {description && !trend && (
            <p className={adminTheme.typography.cardDescription}>{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface AdminStatsGridProps {
  children: React.ReactNode;
  /**
   * 每行顯示的卡片數量
   * @default 4
   */
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * 統計卡片網格容器
 */
export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({
  children,
  columns = 4,
  className,
}) => {
  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn(
      'grid gap-6',
      columnClasses[columns],
      className
    )}>
      {children}
    </div>
  );
};

export default AdminStatsCard;
