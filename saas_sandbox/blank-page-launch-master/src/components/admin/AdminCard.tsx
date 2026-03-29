import React from 'react';
import { cn } from '@/lib/utils';
import { adminTheme, GradientKey } from '@/styles/admin-theme';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  accentColor?: GradientKey;
  hoverable?: boolean;
  onClick?: () => void;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  children, className, variant = 'default',
  accentColor, hoverable = false, onClick,
}) => {
  const variantStyles = {
    default: 'bg-card border border-[hsl(150,20%,88%)] shadow-[0_2px_8px_hsla(150,30%,20%,0.08)]',
    elevated: 'bg-card border border-[hsl(150,20%,88%)] shadow-[0_2px_8px_hsla(150,30%,20%,0.08)] admin-card-shine',
    outlined: 'bg-transparent border-2 border-[hsl(150,20%,88%)]',
    glass: 'admin-glass',
  };

  return (
    <div
      className={cn(
        'rounded-xl p-5 relative overflow-hidden',
        variantStyles[variant],
        hoverable && 'cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {accentColor && (
        <div className={cn(
          'absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r',
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

export const AdminCardHeader: React.FC<AdminCardHeaderProps> = ({
  title, description, icon, action, className,
}) => {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-5', className)}>
      <div className="flex items-center gap-2.5">
        {icon && <div className="flex-shrink-0 p-1.5 rounded-lg bg-primary/8">{icon}</div>}
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

interface AdminCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminCardContent: React.FC<AdminCardContentProps> = ({ children, className }) => {
  return <div className={cn('', className)}>{children}</div>;
};

interface AdminCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminCardFooter: React.FC<AdminCardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-border/60 flex items-center justify-between', className)}>
      {children}
    </div>
  );
};

export default AdminCard;
