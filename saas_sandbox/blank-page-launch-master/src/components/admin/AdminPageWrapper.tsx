import React from 'react';
import { cn } from '@/lib/utils';

interface AdminPageWrapperProps {
  children: React.ReactNode;
  className?: string;
  useContainer?: boolean;
  withSpacing?: boolean;
}

export const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({ 
  children, className, useContainer = true, withSpacing = true,
}) => {
  return (
    <div className={cn(
      'min-h-full py-6 px-5 lg:px-8',
      className
    )}>
      <div className={cn(
        useContainer && 'max-w-7xl mx-auto',
        withSpacing && 'space-y-6',
      )}>
        {children}
      </div>
    </div>
  );
};

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title, description, children, className,
}) => {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">{children}</div>
      )}
    </div>
  );
};

export default AdminPageWrapper;
