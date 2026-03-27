import React from 'react';
import { cn } from '@/lib/utils';
import { adminTheme, GradientKey } from '@/styles/admin-theme';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  /**
   * 卡片變體
   * @default 'default'
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  /**
   * 是否有頂部色彩條
   */
  accentColor?: GradientKey;
  /**
   * 是否有 hover 效果
   * @default false
   */
  hoverable?: boolean;
  /**
   * 點擊事件
   */
  onClick?: () => void;
}

/**
 * 後台統一卡片組件
 */
export const AdminCard: React.FC<AdminCardProps> = ({
  children,
  className,
  variant = 'default',
  accentColor,
  hoverable = false,
  onClick,
}) => {
  const variantStyles = {
    default: cn(
      'bg-card border border-border',
      adminTheme.shadows.md,
    ),
    elevated: cn(
      'bg-card border border-border',
      adminTheme.shadows.elevated,
    ),
    outlined: 'bg-transparent border-2 border-border',
    glass: cn(
      'bg-card/80 backdrop-blur-sm border border-border/50',
      adminTheme.shadows.sm,
    ),
  };

  return (
    <div
      className={cn(
        adminTheme.radius.lg,
        adminTheme.spacing.cardPadding,
        variantStyles[variant],
        hoverable && 'cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-300',
        onClick && 'cursor-pointer',
        'relative overflow-hidden',
        className
      )}
      onClick={onClick}
    >
      {/* 頂部色彩條 */}
      {accentColor && (
        <div className={cn(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
          adminTheme.gradients[accentColor]
        )} />
      )}
      {children}
    </div>
  );
};

interface AdminCardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * 卡片標題區域
 */
export const AdminCardHeader: React.FC<AdminCardHeaderProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div>
          <h3 className={adminTheme.typography.cardTitle}>{title}</h3>
          {description && (
            <p className={cn(adminTheme.typography.cardDescription, 'mt-1')}>
              {description}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

interface AdminCardContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 卡片內容區域
 */
export const AdminCardContent: React.FC<AdminCardContentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
};

interface AdminCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 卡片底部區域
 */
export const AdminCardFooter: React.FC<AdminCardFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-border flex items-center justify-between', className)}>
      {children}
    </div>
  );
};

export default AdminCard;
