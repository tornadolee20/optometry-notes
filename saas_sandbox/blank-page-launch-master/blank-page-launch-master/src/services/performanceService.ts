import { logInfo, logWarn, logError } from "@/services/loggerService";

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  memoryUsage: number;
  bundleSize: number;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

export interface UserSession {
  sessionId: string;
  startTime: number;
  pageViews: number;
  interactions: number;
  errors: number;
  performance: PerformanceMetrics;
}

export class PerformanceService {
  
  private static instance: PerformanceService;
  private sessionId: string;
  private startTime: number;
  private pageViews: number = 0;
  private interactions: number = 0;
  private errors: number = 0;
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializePerformanceMonitoring();
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  /**
   * 初始化性能監控
   */
  private initializePerformanceMonitoring(): void {
    try {
      // 監控性能指標
      this.observePerformanceMetrics();
      
      // 監控資源加載
      this.observeResourceLoading();
      
      // 監控用戶交互
      this.observeUserInteractions();
      
      // 監控錯誤
      this.observeErrors();
      
      // 監控內存使用
      this.observeMemoryUsage();

      // 頁面卸載時發送性能數據
      this.setupUnloadHandler();

      logInfo("性能監控已初始化", "performance", { sessionId: this.sessionId });

    } catch (error) {
      logError("性能監控初始化失敗", "performance", {}, error as Error);
    }
  }

  /**
   * 觀察性能指標
   */
  private observePerformanceMetrics(): void {
    try {
      if ('PerformanceObserver' in window) {
        // 觀察 Core Web Vitals
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.processPerformanceEntry(entry);
          }
        });

        // 觀察不同類型的性能指標
        const entryTypes = ['navigation', 'measure', 'paint', 'largest-contentful-paint'];
        
        entryTypes.forEach(entryType => {
          try {
            this.performanceObserver!.observe({ entryTypes: [entryType] });
          } catch (error) {
            // 某些瀏覽器可能不支持特定的 entry type
            console.warn(`Performance Observer不支持 ${entryType}:`, error);
          }
        });
      }

      // 使用 Web Vitals API（如果可用）
      this.observeWebVitals();

    } catch (error) {
      logError("性能指標觀察設置失敗", "performance", {}, error as Error);
    }
  }

  /**
   * 觀察 Web Vitals
   */
  private observeWebVitals(): void {
    // 模擬 Web Vitals 測量（實際應用中應使用 web-vitals 庫）
    setTimeout(() => {
      this.measureCoreWebVitals();
    }, 1000);
  }

  /**
   * 測量核心 Web Vitals
   */
  private measureCoreWebVitals(): void {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          loadTime: navigation.loadEventEnd - navigation.startTime,
          firstContentfulPaint: this.getFirstContentfulPaint(),
          largestContentfulPaint: this.getLargestContentfulPaint(),
          firstInputDelay: this.getFirstInputDelay(),
          cumulativeLayoutShift: this.getCumulativeLayoutShift(),
          timeToInteractive: this.getTimeToInteractive()
        };

        this.reportPerformanceMetrics(metrics);
      }

    } catch (error) {
      logError("Core Web Vitals 測量失敗", "performance", {}, error as Error);
    }
  }

  /**
   * 觀察資源加載
   */
  private observeResourceLoading(): void {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.analyzeResourcePerformance(entry as PerformanceResourceTiming);
          }
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });

    } catch (error) {
      logError("資源加載觀察設置失敗", "performance", {}, error as Error);
    }
  }

  /**
   * 觀察用戶交互
   */
  private observeUserInteractions(): void {
    try {
      // 監控點擊事件
      document.addEventListener('click', () => {
        this.interactions++;
        this.recordInteraction('click');
      });

      // 監控鍵盤事件
      document.addEventListener('keydown', () => {
        this.interactions++;
        this.recordInteraction('keydown');
      });

      // 監控滾動事件
      let scrollTimeout: NodeJS.Timeout;
      document.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.interactions++;
          this.recordInteraction('scroll');
        }, 100);
      });

    } catch (error) {
      logError("用戶交互觀察設置失敗", "performance", {}, error as Error);
    }
  }

  /**
   * 觀察錯誤
   */
  private observeErrors(): void {
    try {
      // JavaScript 錯誤
      window.addEventListener('error', (event) => {
        this.errors++;
        this.recordError('javascript', event.error?.message || 'Unknown error', event.error?.stack);
      });

      // Promise 拒絕
      window.addEventListener('unhandledrejection', (event) => {
        this.errors++;
        this.recordError('promise', event.reason?.message || 'Promise rejection', event.reason?.stack);
      });

      // 資源加載錯誤
      window.addEventListener('error', (event) => {
        if (event.target !== window) {
          this.errors++;
          this.recordError('resource', `Failed to load: ${(event.target as any)?.src || 'unknown resource'}`);
        }
      }, true);

    } catch (error) {
      logError("錯誤觀察設置失敗", "performance", {}, error as Error);
    }
  }

  /**
   * 觀察內存使用
   */
  private observeMemoryUsage(): void {
    try {
      // 定期檢查內存使用情況
      setInterval(() => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          this.recordMemoryUsage({
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit
          });
        }
      }, 30000); // 每30秒檢查一次

    } catch (error) {
      logError("內存使用觀察設置失敗", "performance", {}, error as Error);
    }
  }

  /**
   * 處理性能條目
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    try {
      switch (entry.entryType) {
        case 'navigation':
          this.processNavigationTiming(entry as PerformanceNavigationTiming);
          break;
        case 'paint':
          this.processPaintTiming(entry);
          break;
        case 'largest-contentful-paint':
          this.processLargestContentfulPaint(entry);
          break;
        case 'measure':
          this.processCustomMeasure(entry);
          break;
      }

    } catch (error) {
      logError("性能條目處理失敗", "performance", { entryType: entry.entryType }, error as Error);
    }
  }

  /**
   * 分析資源性能
   */
  private analyzeResourcePerformance(entry: PerformanceResourceTiming): void {
    try {
      const resourceInfo: ResourceTiming = {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize || 0,
        type: this.getResourceType(entry.name)
      };

      // 檢查慢資源
      if (entry.duration > 1000) { // 超過1秒
        logWarn("發現慢資源", "performance", {
          resource: resourceInfo,
          sessionId: this.sessionId
        });
      }

      // 檢查大文件
      if (resourceInfo.size > 1024 * 1024) { // 超過1MB
        logWarn("發現大文件", "performance", {
          resource: resourceInfo,
          sessionId: this.sessionId
        });
      }

    } catch (error) {
      logError("資源性能分析失敗", "performance", { resourceName: entry.name }, error as Error);
    }
  }

  /**
   * 記錄交互
   */
  private recordInteraction(type: string): void {
    logInfo("用戶交互", "performance", {
      type,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }

  /**
   * 記錄錯誤
   */
  private recordError(type: string, message: string, stack?: string): void {
    logError("前端錯誤", "performance", {
      type,
      message,
      stack,
      sessionId: this.sessionId
    });
  }

  /**
   * 記錄內存使用
   */
  private recordMemoryUsage(memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  }): void {
    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    
    if (usagePercent > 80) {
      logWarn("內存使用率過高", "performance", {
        usagePercent: usagePercent.toFixed(2),
        memory,
        sessionId: this.sessionId
      });
    }

    logInfo("內存使用情況", "performance", {
      memory,
      usagePercent: usagePercent.toFixed(2),
      sessionId: this.sessionId
    });
  }

  /**
   * 報告性能指標
   */
  private reportPerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
    logInfo("性能指標報告", "performance", {
      metrics,
      sessionId: this.sessionId
    });

    // 檢查性能閾值
    this.checkPerformanceThresholds(metrics);
  }

  /**
   * 檢查性能閾值
   */
  private checkPerformanceThresholds(metrics: Partial<PerformanceMetrics>): void {
    try {
      const thresholds = {
        loadTime: 3000, // 3秒
        firstContentfulPaint: 1800, // 1.8秒
        largestContentfulPaint: 2500, // 2.5秒
        firstInputDelay: 100, // 100毫秒
        cumulativeLayoutShift: 0.1, // 0.1
        timeToInteractive: 3800 // 3.8秒
      };

      Object.entries(metrics).forEach(([key, value]) => {
        const threshold = thresholds[key as keyof typeof thresholds];
        if (threshold && value > threshold) {
          logWarn(`性能指標超出閾值: ${key}`, "performance", {
            metric: key,
            value,
            threshold,
            sessionId: this.sessionId
          });
        }
      });

    } catch (error) {
      logError("性能閾值檢查失敗", "performance", {}, error as Error);
    }
  }

  /**
   * 獲取當前會話數據
   */
  getCurrentSession(): UserSession {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      pageViews: this.pageViews,
      interactions: this.interactions,
      errors: this.errors,
      performance: this.getCurrentPerformanceMetrics()
    };
  }

  /**
   * 增加頁面瀏覽數
   */
  incrementPageView(): void {
    this.pageViews++;
    logInfo("頁面瀏覽", "performance", {
      pageViews: this.pageViews,
      sessionId: this.sessionId
    });
  }

  /**
   * 手動測量性能
   */
  measureCustomPerformance(name: string, startTime: number): void {
    try {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      logInfo("自定義性能測量", "performance", {
        name,
        duration,
        sessionId: this.sessionId
      });

    } catch (error) {
      logError("自定義性能測量失敗", "performance", { name }, error as Error);
    }
  }

  /**
   * 開始自定義測量
   */
  startMeasure(name: string): number {
    try {
      const startTime = performance.now();
      performance.mark(`${name}-start`);
      return startTime;
    } catch (error) {
      logError("開始性能測量失敗", "performance", { name }, error as Error);
      return Date.now();
    }
  }

  /**
   * 結束自定義測量
   */
  endMeasure(name: string, startTime: number): number {
    try {
      const duration = performance.now() - startTime;
      this.measureCustomPerformance(name, startTime);
      return duration;
    } catch (error) {
      logError("結束性能測量失敗", "performance", { name }, error as Error);
      return 0;
    }
  }

  // 私有輔助方法
  private generateSessionId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['js', 'jsx', 'ts', 'tsx'].includes(extension || '')) return 'script';
    if (['css', 'scss', 'sass'].includes(extension || '')) return 'stylesheet';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) return 'image';
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension || '')) return 'font';
    if (['json', 'xml'].includes(extension || '')) return 'xhr';
    
    return 'other';
  }

  private getCurrentPerformanceMetrics(): PerformanceMetrics {
    try {
      return {
        loadTime: this.getLoadTime(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
        largestContentfulPaint: this.getLargestContentfulPaint(),
        firstInputDelay: this.getFirstInputDelay(),
        cumulativeLayoutShift: this.getCumulativeLayoutShift(),
        timeToInteractive: this.getTimeToInteractive(),
        memoryUsage: this.getMemoryUsage(),
        bundleSize: this.getBundleSize()
      };
    } catch (error) {
      logError("獲取性能指標失敗", "performance", {}, error as Error);
      return {
        loadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
        timeToInteractive: 0,
        memoryUsage: 0,
        bundleSize: 0
      };
    }
  }

  private setupUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      try {
        const sessionData = this.getCurrentSession();
        
        // 使用 sendBeacon 發送最終數據
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/performance', JSON.stringify(sessionData));
        }

        logInfo("會話結束", "performance", {
          sessionData,
          duration: Date.now() - this.startTime
        });

      } catch (error) {
        console.error("會話結束處理失敗:", error);
      }
    });
  }

  // 模擬性能指標獲取方法（實際應使用真實的 API）
  private getLoadTime(): number {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigation ? navigation.loadEventEnd - navigation.startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  private getLargestContentfulPaint(): number {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
  }

  private getFirstInputDelay(): number {
    // FID 需要實際的用戶交互來測量
    return 0; // 簡化實現
  }

  private getCumulativeLayoutShift(): number {
    // CLS 需要布局變化監控
    return 0; // 簡化實現
  }

  private getTimeToInteractive(): number {
    // TTI 需要複雜的計算
    return 0; // 簡化實現
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }

  private getBundleSize(): number {
    // 可以從構建工具或 webpack 統計中獲取
    return 0; // 簡化實現
  }

  private processNavigationTiming(entry: PerformanceNavigationTiming): void {
    logInfo("導航時序", "performance", {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.startTime,
      loadComplete: entry.loadEventEnd - entry.startTime,
      sessionId: this.sessionId
    });
  }

  private processPaintTiming(entry: PerformanceEntry): void {
    logInfo("繪製時序", "performance", {
      name: entry.name,
      startTime: entry.startTime,
      sessionId: this.sessionId
    });
  }

  private processLargestContentfulPaint(entry: PerformanceEntry): void {
    logInfo("最大內容繪製", "performance", {
      startTime: entry.startTime,
      sessionId: this.sessionId
    });
  }

  private processCustomMeasure(entry: PerformanceEntry): void {
    logInfo("自定義測量", "performance", {
      name: entry.name,
      duration: entry.duration,
      sessionId: this.sessionId
    });
  }
}

export default PerformanceService;