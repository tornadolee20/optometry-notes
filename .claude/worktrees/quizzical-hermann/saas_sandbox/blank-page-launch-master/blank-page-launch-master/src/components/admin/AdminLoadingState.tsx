import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { adminTheme, loadingStyles } from '@/styles/admin-theme';

interface AdminLoadingStateProps {
  /**
   * 載入訊息
   * @default '載入中...'
   */
  message?: string;
  /**
   * 附加描述
   */
  description?: string;
  /**
   * Spinner 尺寸
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * 載入狀態變體
   * @default 'spinner'
   */
  variant?: 'spinner' | 'skeleton' | 'card-skeleton' | 'table-skeleton';
  /**
   * 是否為全頁載入狀態
   * @default false
   */
  fullPage?: boolean;
  /**
   * 自訂類名
   */
  className?: string;
  /**
   * 骨架屏數量
   * @default 4
   */
  skeletonCount?: number;
}

/**
 * 全頁容器
 */
const FullPageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn(
    'min-h-screen flex items-center justify-center',
    adminTheme.backgrounds.page,
    className
  )}>
    {children}
  </div>
);

/**
 * 內嵌容器
 */
const InlineContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('flex items-center justify-center py-12', className)}>
    {children}
  </div>
);

/**
 * 後台統一載入狀態組件
 */
export const AdminLoadingState: React.FC<AdminLoadingStateProps> = ({
  message = '載入中...',
  description,
  size = 'md',
  variant = 'spinner',
  fullPage = false,
  className,
  skeletonCount = 4,
}) => {
  // Spinner 變體
  if (variant === 'spinner') {
    const Container = fullPage ? FullPageContainer : InlineContainer;
    return (
      <Container className={className}>
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            loadingStyles.spinner,
            loadingStyles.spinnerSize[size],
          )} />
          <div className="text-center">
            <h3 className={adminTheme.typography.cardTitle}>{message}</h3>
            {description && (
              <p className={cn(adminTheme.typography.cardDescription, 'mt-1')}>
                {description}
              </p>
            )}
          </div>
        </div>
      </Container>
    );
  }
  
  // 卡片骨架屏變體
  if (variant === 'card-skeleton') {
    return (
      <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-4', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className={cn('p-6', adminTheme.radius.lg, 'border bg-card')}>
            <Skeleton className="h-4 w-1/3 mb-4" />
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // 表格骨架屏變體
  if (variant === 'table-skeleton') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className={cn('border', adminTheme.radius.lg, 'overflow-hidden')}>
          <div className="bg-muted/50 p-4">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="p-4 border-t">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // 基礎 Skeleton 變體
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-3 mt-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className={cn('h-24 w-full', adminTheme.radius.lg)} />
        ))}
      </div>
    </div>
  );
};

export default AdminLoadingState;
