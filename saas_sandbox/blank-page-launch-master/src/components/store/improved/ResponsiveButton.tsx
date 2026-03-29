import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResponsiveButtonProps extends ButtonProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidthOnMobile?: boolean;
  touchOptimized?: boolean;
}

export const ResponsiveButton = ({
  children,
  icon,
  fullWidthOnMobile = false,
  touchOptimized = true,
  className,
  ...props
}: ResponsiveButtonProps) => {
  return (
    <Button
      className={cn(
        // 基本樣式
        "transition-all duration-200",
        // 觸控優化
        touchOptimized && "touch-manipulation",
        // 響應式寬度
        fullWidthOnMobile && "w-full sm:w-auto",
        // 響應式高度和間距
        "h-12 sm:h-10 px-6 sm:px-4",
        // 響應式字體
        "text-base sm:text-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </div>
    </Button>
  );
};

interface FloatingActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const FloatingActionButton = ({
  children,
  onClick,
  icon,
  className,
  disabled = false
}: FloatingActionButtonProps) => {
  return (
    <>
      {/* 底部空間預留 */}
      <div className="h-20 md:h-0" />
      
      {/* 固定按鈕 */}
      <div className="fixed md:relative bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto z-50">
        <div className="bg-white md:bg-transparent border-t md:border-t-0 p-4 md:p-0 shadow-lg md:shadow-none">
          <div className="max-w-md mx-auto md:max-w-none">
            <Button
              onClick={onClick}
              disabled={disabled}
              className={cn(
                "w-full md:w-auto h-12 text-base font-medium",
                "touch-manipulation",
                "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                "shadow-lg hover:shadow-xl",
                "transition-all duration-200",
                className
              )}
            >
              <div className="flex items-center justify-center gap-2">
                {icon && <span className="flex-shrink-0">{icon}</span>}
                <span>{children}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ResponsiveButtonGroup = ({
  children,
  orientation = 'horizontal',
  className
}: ButtonGroupProps) => {
  return (
    <div
      className={cn(
        "flex gap-2",
        orientation === 'horizontal' 
          ? "flex-col sm:flex-row" 
          : "flex-col",
        className
      )}
    >
      {children}
    </div>
  );
};