import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
}

export const LoadingSkeleton = ({ className }: LoadingSkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted rounded",
        className
      )}
    />
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  showProgress?: boolean;
  progress?: number;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  text, 
  showProgress = false, 
  progress = 0 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative">
        <div className={cn(
          "animate-spin rounded-full border-3 border-muted",
          sizeClasses[size]
        )} />
        <div className={cn(
          "absolute inset-0 animate-spin rounded-full border-3 border-transparent border-t-primary border-r-primary/80",
          sizeClasses[size]
        )} 
        style={{ 
          animationDuration: '1s',
          animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
      </div>
      
      {text && (
        <div className="text-center">
          <p className="text-foreground font-medium mb-1">
            {text}
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
      
      {showProgress && (
        <div className="w-64">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>進度</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out relative overflow-hidden" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-primary-foreground opacity-30 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const StoreProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-muted/50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-background rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <LoadingSkeleton className="h-6 w-24" />
            <LoadingSkeleton className="h-4 w-20" />
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <LoadingSkeleton className="h-4 w-16" />
                <LoadingSkeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-4">
              <LoadingSkeleton className="h-10 w-20" />
              <LoadingSkeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        <LoadingSkeleton className="h-12 w-full rounded-lg" />

        <div className="bg-background rounded-lg p-6 shadow-sm">
          <LoadingSkeleton className="h-6 w-24 mb-4" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <LoadingSkeleton className="h-4 w-16" />
              <LoadingSkeleton className="h-4 w-12" />
            </div>
            <div className="flex justify-between">
              <LoadingSkeleton className="h-4 w-20" />
              <LoadingSkeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg p-6 shadow-sm">
          <LoadingSkeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <div className="flex gap-2">
              <LoadingSkeleton className="h-10 flex-1" />
              <LoadingSkeleton className="h-10 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[...Array(8)].map((_, i) => (
                <LoadingSkeleton key={i} className="h-10" />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg p-6 shadow-sm">
          <LoadingSkeleton className="h-6 w-20 mb-4" />
          <LoadingSkeleton className="h-10 w-full mb-4" />
          <div className="flex justify-center">
            <LoadingSkeleton className="h-32 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const KeywordGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {[...Array(12)].map((_, i) => (
        <LoadingSkeleton key={i} className="h-12 rounded-lg" />
      ))}
    </div>
  );
};

export const ReviewGenerationSkeleton = () => {
  return (
    <div className="min-h-screen bg-muted/50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <LoadingSkeleton className="h-8 w-48 mx-auto" />
          <LoadingSkeleton className="h-4 w-64 mx-auto" />
        </div>

        <div className="flex justify-center space-x-2">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-3 w-8 rounded-full" />
          ))}
        </div>

        <div className="bg-background rounded-lg p-6 shadow-sm">
          <LoadingSkeleton className="h-6 w-32 mb-4" />
          <KeywordGridSkeleton />
        </div>

        <LoadingSkeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
};
