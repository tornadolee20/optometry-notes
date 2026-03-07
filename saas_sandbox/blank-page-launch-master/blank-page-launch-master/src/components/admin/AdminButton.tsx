import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';
import { LucideIcon, Loader2 } from 'lucide-react';
import { adminTheme } from '@/styles/admin-theme';

type AdminButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';

interface AdminButtonProps extends Omit<ButtonProps, 'variant'> {
  /**
   * 按鈕變體
   * @default 'default'
   */
  variant?: AdminButtonVariant;
  /**
   * 左側圖標
   */
  icon?: LucideIcon;
  /**
   * 右側圖標
   */
  iconRight?: LucideIcon;
  /**
   * 是否載入中
   */
  loading?: boolean;
  /**
   * 載入時的文字
   */
  loadingText?: string;
}

/**
 * 後台統一按鈕組件
 */
export const AdminButton: React.FC<AdminButtonProps> = ({
  children,
  variant = 'primary',
  icon: IconLeft,
  iconRight: IconRight,
  loading = false,
  loadingText,
  disabled,
  className,
  size = 'default',
  ...props
}) => {
  // 變體映射到 shadcn Button 變體和額外樣式
  const variantConfig = {
    primary: {
      base: 'default' as const,
      className: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    },
    secondary: {
      base: 'secondary' as const,
      className: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
    },
    outline: {
      base: 'outline' as const,
      className: 'border-border hover:bg-accent hover:text-accent-foreground',
    },
    ghost: {
      base: 'ghost' as const,
      className: 'hover:bg-accent hover:text-accent-foreground',
    },
    danger: {
      base: 'destructive' as const,
      className: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    },
    success: {
      base: 'default' as const,
      className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
  } satisfies Record<AdminButtonVariant, { base: ButtonProps['variant']; className: string }>;

  const config = variantConfig[variant ?? 'primary'];

  return (
    <Button
      variant={config.base}
      size={size}
      disabled={disabled || loading}
      className={cn(
        config.className,
        adminTheme.animations.transition,
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {IconLeft && <IconLeft className="mr-2 h-4 w-4" />}
          {children}
          {IconRight && <IconRight className="ml-2 h-4 w-4" />}
        </>
      )}
    </Button>
  );
};

interface AdminIconButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  /**
   * 圖標
   */
  icon: LucideIcon;
  /**
   * 按鈕變體
   * @default 'ghost'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /**
   * 尺寸
   * @default 'icon'
   */
  size?: 'sm' | 'default' | 'lg';
  /**
   * 無障礙標籤
   */
  'aria-label': string;
}

/**
 * 後台圖標按鈕組件
 */
export const AdminIconButton: React.FC<AdminIconButtonProps> = ({
  icon: Icon,
  variant = 'ghost',
  size = 'default',
  className,
  ...props
}) => {
  const variantConfig = {
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
    outline: 'border border-border hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    danger: 'hover:bg-destructive/10 hover:text-destructive text-muted-foreground',
  };

  const sizeConfig = {
    sm: 'h-8 w-8',
    default: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const iconSizeConfig = {
    sm: 'h-4 w-4',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        sizeConfig[size],
        variantConfig[variant],
        adminTheme.radius.md,
        adminTheme.animations.transition,
        className
      )}
      {...props}
    >
      <Icon className={iconSizeConfig[size]} />
    </Button>
  );
};

interface AdminButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 按鈕群組容器
 */
export const AdminButtonGroup: React.FC<AdminButtonGroupProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
    </div>
  );
};

export default AdminButton;
