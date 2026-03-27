import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { adminTheme } from '@/styles/admin-theme';

type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info'
  | 'outline';

type BadgeSize = 'sm' | 'default' | 'lg';

interface AdminBadgeProps {
  children: React.ReactNode;
  /**
   * 徽章變體
   * @default 'default'
   */
  variant?: BadgeVariant;
  /**
   * 尺寸
   * @default 'default'
   */
  size?: BadgeSize;
  /**
   * 左側圖標
   */
  icon?: LucideIcon;
  /**
   * 是否為圓點樣式（無文字）
   */
  dot?: boolean;
  /**
   * 自訂類名
   */
  className?: string;
}

/**
 * 後台統一徽章組件
 */
export const AdminBadge: React.FC<AdminBadgeProps> = ({
  children,
  variant = 'default',
  size = 'default',
  icon: Icon,
  dot = false,
  className,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
    info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    outline: 'bg-transparent border-border text-foreground',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const iconSizes: Record<BadgeSize, string> = {
    sm: 'h-3 w-3',
    default: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  // 圓點樣式
  if (dot) {
    const dotColors: Record<BadgeVariant, string> = {
      default: 'bg-muted-foreground',
      primary: 'bg-primary',
      secondary: 'bg-secondary-foreground',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-rose-500',
      info: 'bg-blue-500',
      outline: 'bg-foreground',
    };

    return (
      <span className={cn('flex items-center gap-2', className)}>
        <span className={cn('h-2 w-2 rounded-full', dotColors[variant])} />
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border',
        adminTheme.radius.full,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {children}
    </span>
  );
};

interface AdminStatusBadgeProps {
  /**
   * 狀態
   */
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'cancelled' | 'trial' | 'expired';
  /**
   * 自訂顯示文字
   */
  label?: string;
  /**
   * 尺寸
   */
  size?: BadgeSize;
  /**
   * 自訂類名
   */
  className?: string;
}

/**
 * 預定義狀態徽章
 */
export const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({
  status,
  label,
  size = 'default',
  className,
}) => {
  const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    active: { variant: 'success', label: '啟用中' },
    inactive: { variant: 'default', label: '未啟用' },
    pending: { variant: 'warning', label: '待審核' },
    suspended: { variant: 'danger', label: '已暫停' },
    cancelled: { variant: 'danger', label: '已取消' },
    trial: { variant: 'info', label: '試用中' },
    expired: { variant: 'default', label: '已過期' },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <AdminBadge 
      variant={config.variant} 
      size={size}
      dot
      className={className}
    >
      {label || config.label}
    </AdminBadge>
  );
};

interface AdminCountBadgeProps {
  /**
   * 數量
   */
  count: number;
  /**
   * 最大顯示數量
   * @default 99
   */
  max?: number;
  /**
   * 變體
   * @default 'primary'
   */
  variant?: BadgeVariant;
  /**
   * 自訂類名
   */
  className?: string;
}

/**
 * 數量徽章
 */
export const AdminCountBadge: React.FC<AdminCountBadgeProps> = ({
  count,
  max = 99,
  variant = 'primary',
  className,
}) => {
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <AdminBadge 
      variant={variant}
      size="sm"
      className={cn('min-w-[1.25rem] justify-center', className)}
    >
      {displayCount}
    </AdminBadge>
  );
};

export default AdminBadge;
