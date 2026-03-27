import React from 'react';
import { cn } from '@/lib/utils';
import { adminTheme } from '@/styles/admin-theme';

interface AdminPageWrapperProps {
  children: React.ReactNode;
  className?: string;
  /**
   * 是否使用最大寬度容器
   * @default true
   */
  useContainer?: boolean;
  /**
   * 是否添加垂直間距
   * @default true
   */
  withSpacing?: boolean;
}

/**
 * 後台頁面統一容器組件
 * 自動套用統一背景、間距和動畫
 */
export const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({ 
  children, 
  className,
  useContainer = true,
  withSpacing = true,
}) => {
  return (
    <div className={cn(
      // 統一背景
      'min-h-full',
      adminTheme.backgrounds.page,
      // 統一間距
      adminTheme.spacing.page,
      // 統一動畫
      adminTheme.animations.fadeIn,
      className
    )}>
      <div className={cn(
        useContainer && adminTheme.spacing.pageContainer,
        withSpacing && adminTheme.spacing.section,
      )}>
        {children}
      </div>
    </div>
  );
};

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // 用於放置操作按鈕
  className?: string;
}

/**
 * 後台頁面標題組件
 */
export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="space-y-1">
        <h1 className={adminTheme.typography.pageTitle}>{title}</h1>
        {description && (
          <p className={adminTheme.typography.pageDescription}>{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default AdminPageWrapper;
