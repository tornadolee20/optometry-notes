import { Suspense, ComponentType, lazy } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PerformanceService from "@/services/performanceService";

/** Generic type for a dynamic import that returns a React component module */
type LazyImportFn = () => Promise<{ default: ComponentType<Record<string, never>> }>;

interface LazyRouteProps {
  component: LazyImportFn;
  fallback?: React.ReactElement;
  name?: string;
  preload?: boolean;
}

interface LoadingFallbackProps {
  name?: string;
}

const LoadingFallback = ({ name }: LoadingFallbackProps) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {name ? `載入 ${name}...` : '載入中...'}
        </h3>
        <p className="text-sm text-muted-foreground text-center">
          請稍候，我們正在為您準備內容
        </p>
        <div className="w-full bg-muted rounded-full h-1 mt-4">
          <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const LazyRoute = ({ component, fallback, name, preload = false }: LazyRouteProps) => {
  const performanceService = PerformanceService.getInstance();
  
  const LazyComponent = lazy(() => {
    const startTime = performanceService.startMeasure(`lazy-load-${name || 'component'}`);
    
    return component().then(module => {
      performanceService.endMeasure(`lazy-load-${name || 'component'}`, startTime);
      return module;
    }).catch(error => {
      console.error(`懶加載失敗 ${name}:`, error);
      return {
        default: () => (
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-destructive text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">載入失敗</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {name ? `無法載入 ${name}` : '組件載入失敗'}
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                  重新載入
                </button>
              </CardContent>
            </Card>
          </div>
        )
      };
    });
  });

  if (preload) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        component().catch(() => {});
      });
    } else {
      setTimeout(() => {
        component().catch(() => {});
      }, 100);
    }
  }

  return (
    <Suspense fallback={fallback || <LoadingFallback name={name} />}>
      <LazyComponent />
    </Suspense>
  );
};

/**
 * 創建懶加載路由的工廠函數
 */
export const createLazyRoute = (
  componentPath: string,
  name?: string,
  preload?: boolean
) => {
  return (
    <LazyRoute
      component={() => import(/* @vite-ignore */ componentPath)}
      name={name}
      preload={preload}
    />
  );
};

/**
 * 路由預載入管理器
 */
export class RoutePreloader {
  private static preloadedRoutes = new Set<string>();
  private static preloadPromises = new Map<string, Promise<unknown>>();

  /**
   * 預載入路由組件
   */
  static preloadRoute(importFn: LazyImportFn, routeName: string): Promise<unknown> {
    if (this.preloadedRoutes.has(routeName)) {
      return Promise.resolve();
    }

    if (this.preloadPromises.has(routeName)) {
      return this.preloadPromises.get(routeName)!;
    }

    const preloadPromise = importFn()
      .then((module) => {
        this.preloadedRoutes.add(routeName);
        this.preloadPromises.delete(routeName);
        return module;
      })
      .catch((error) => {
        this.preloadPromises.delete(routeName);
        console.error(`預載入路由 ${routeName} 失敗:`, error);
        throw error;
      });

    this.preloadPromises.set(routeName, preloadPromise);
    return preloadPromise;
  }

  /**
   * 根據用戶行為預載入相關路由
   */
  static preloadOnHover(element: HTMLElement, importFn: LazyImportFn, routeName: string): (() => void) {
    let timeoutId: NodeJS.Timeout;

    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        this.preloadRoute(importFn, routeName);
      }, 100);
    };

    const handleMouseLeave = () => {
      clearTimeout(timeoutId);
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    const cleanup = () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeoutId);
    };
    return cleanup;
  }

  /**
   * 在網絡空閒時預載入路由
   */
  static preloadOnIdle(importFn: LazyImportFn, routeName: string): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadRoute(importFn, routeName);
      });
    } else {
      setTimeout(() => {
        this.preloadRoute(importFn, routeName);
      }, 1000);
    }
  }

  /**
   * 根據用戶偏好預載入常用路由
   */
  static preloadPopularRoutes(): void {
    const popularRoutes = [
      {
        name: 'dashboard',
        importFn: () => import('@/pages/admin/EnterpriseAdminDashboard')
      },
      {
        name: 'stores',
        importFn: () => import('@/pages/admin/StoreList')
      }
    ];

    window.addEventListener('load', () => {
      setTimeout(() => {
        popularRoutes.forEach(route => {
          this.preloadOnIdle(route.importFn, route.name);
        });
      }, 2000);
    });
  }

  /**
   * 檢查路由是否已預載入
   */
  static isPreloaded(routeName: string): boolean {
    return this.preloadedRoutes.has(routeName);
  }

  /**
   * 清除預載入快取
   */
  static clearCache(): void {
    this.preloadedRoutes.clear();
    this.preloadPromises.clear();
  }

  /**
   * 獲取預載入統計
   */
  static getStats(): {
    preloadedCount: number;
    pendingCount: number;
    preloadedRoutes: string[];
  } {
    return {
      preloadedCount: this.preloadedRoutes.size,
      pendingCount: this.preloadPromises.size,
      preloadedRoutes: Array.from(this.preloadedRoutes)
    };
  }
}

/**
 * React Hook for route preloading
 */
export const useRoutePreloader = () => {
  const preloadRoute = (importFn: LazyImportFn, routeName: string) => {
    return RoutePreloader.preloadRoute(importFn, routeName);
  };

  const preloadOnHover = (element: HTMLElement | null, importFn: LazyImportFn, routeName: string) => {
    if (!element) return;
    return RoutePreloader.preloadOnHover(element, importFn, routeName);
  };

  const isPreloaded = (routeName: string) => {
    return RoutePreloader.isPreloaded(routeName);
  };

  return {
    preloadRoute,
    preloadOnHover,
    isPreloaded,
    stats: RoutePreloader.getStats()
  };
};

export default LazyRoute;
