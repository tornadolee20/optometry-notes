import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import PerformanceService from '@/services/performanceService';

// Mock logger service
vi.mock('@/services/loggerService', () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn()
}));

/** Helper to reset the singleton instance for clean tests */
function resetSingleton(): void {
  // Access private static field for testing purposes
  const Service = PerformanceService as unknown as { instance: PerformanceService | undefined };
  Service.instance = undefined;
}

/** Helper to access performance.memory (Chrome-only API) */
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

describe('PerformanceService', () => {
  let performanceService: PerformanceService;

  beforeEach(() => {
    vi.clearAllMocks();
    resetSingleton();
    performanceService = PerformanceService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = PerformanceService.getInstance();
      const instance2 = PerformanceService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize with unique session ID', () => {
      const instance1 = PerformanceService.getInstance();
      const session1 = instance1.getCurrentSession();
      expect(session1.sessionId).toMatch(/^perf_\d+_[a-z0-9]+$/);
    });
  });

  describe('Session Management', () => {
    it('should track session data correctly', () => {
      const session = performanceService.getCurrentSession();
      expect(session).toHaveProperty('sessionId');
      expect(session).toHaveProperty('startTime');
      expect(session).toHaveProperty('pageViews');
      expect(session).toHaveProperty('interactions');
      expect(session).toHaveProperty('errors');
      expect(session).toHaveProperty('performance');
      expect(session.pageViews).toBe(0);
      expect(session.interactions).toBe(0);
      expect(session.errors).toBe(0);
    });

    it('should increment page views', () => {
      expect(performanceService.getCurrentSession().pageViews).toBe(0);
      performanceService.incrementPageView();
      expect(performanceService.getCurrentSession().pageViews).toBe(1);
    });
  });

  describe('Custom Performance Measurement', () => {
    it('should start and end measurements', () => {
      const measureName = 'test-operation';
      const startTime = performanceService.startMeasure(measureName);
      expect(typeof startTime).toBe('number');
      expect(startTime).toBeGreaterThan(0);

      const duration = performanceService.endMeasure(measureName, startTime);
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle measurement errors gracefully', () => {
      const originalNow = global.performance.now;
      global.performance.now = vi.fn(() => {
        throw new Error('Performance API error');
      });
      
      expect(() => {
        performanceService.startMeasure('test');
      }).not.toThrow();
      
      global.performance.now = originalNow;
    });

    it('should use custom performance measurement', () => {
      const startTime = Date.now() - 1000;
      expect(() => {
        performanceService.measureCustomPerformance('custom-measure', startTime);
      }).not.toThrow();
    });
  });

  describe('Memory Monitoring', () => {
    it('should handle memory API availability', () => {
      const perf = global.performance as PerformanceWithMemory;
      const mockMemory = {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000
      };
      perf.memory = mockMemory;
      
      const session = performanceService.getCurrentSession();
      expect(session.performance.memoryUsage).toBe(25);
      
      delete perf.memory;
      const sessionWithoutMemory = performanceService.getCurrentSession();
      expect(sessionWithoutMemory.performance.memoryUsage).toBe(0);
    });
  });

  describe('Performance Metrics', () => {
    it('should get current performance metrics', () => {
      const metrics = performanceService.getCurrentSession().performance;
      expect(metrics).toHaveProperty('loadTime');
      expect(metrics).toHaveProperty('firstContentfulPaint');
      expect(metrics).toHaveProperty('largestContentfulPaint');
      expect(metrics).toHaveProperty('firstInputDelay');
      expect(metrics).toHaveProperty('cumulativeLayoutShift');
      expect(metrics).toHaveProperty('timeToInteractive');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('bundleSize');
      
      Object.values(metrics).forEach(value => {
        expect(typeof value).toBe('number');
      });
    });

    it('should handle performance API errors gracefully', () => {
      const originalGetEntriesByType = global.performance.getEntriesByType;
      global.performance.getEntriesByType = vi.fn(() => {
        throw new Error('Performance API error');
      });
      
      const metrics = performanceService.getCurrentSession().performance;
      expect(metrics.loadTime).toBe(0);
      expect(metrics.firstContentfulPaint).toBe(0);
      
      global.performance.getEntriesByType = originalGetEntriesByType;
    });
  });

  describe('Event Handling', () => {
    it('should handle beforeunload event', () => {
      const mockSendBeacon = vi.fn();
      Object.defineProperty(global.navigator, 'sendBeacon', {
        value: mockSendBeacon,
        writable: true,
        configurable: true,
      });
      
      const event = new Event('beforeunload');
      window.dispatchEvent(event);
      
      expect(mockSendBeacon).toHaveBeenCalled();
      const [url, data] = mockSendBeacon.mock.calls[0];
      expect(url).toBe('/api/performance');
      expect(typeof data).toBe('string');
      expect(() => JSON.parse(data as string)).not.toThrow();
    });

    it('should handle sendBeacon unavailability', () => {
      Object.defineProperty(global.navigator, 'sendBeacon', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      expect(() => {
        const event = new Event('beforeunload');
        window.dispatchEvent(event);
      }).not.toThrow();
    });
  });

  describe('Performance Observer', () => {
    it('should handle PerformanceObserver unavailability', () => {
      const originalPerformanceObserver = global.PerformanceObserver;
      Object.defineProperty(global, 'PerformanceObserver', { value: undefined, writable: true, configurable: true });
      
      expect(() => {
        new PerformanceService();
      }).not.toThrow();
      
      global.PerformanceObserver = originalPerformanceObserver;
    });

    it('should handle unsupported entry types gracefully', () => {
      const mockObserve = vi.fn((options: PerformanceObserverInit) => {
        if (options.entryTypes?.includes('unsupported')) {
          throw new Error('Unsupported entry type');
        }
      });
      const mockPerformanceObserver = vi.fn(() => ({
        observe: mockObserve,
        disconnect: vi.fn()
      }));
      Object.defineProperty(global, 'PerformanceObserver', { value: mockPerformanceObserver, writable: true, configurable: true });
      
      expect(() => {
        new PerformanceService();
      }).not.toThrow();
    });
  });

  describe('User Interaction Tracking', () => {
    it('should track click interactions', () => {
      const initial = performanceService.getCurrentSession().interactions;
      document.dispatchEvent(new MouseEvent('click'));
      expect(performanceService.getCurrentSession().interactions).toBe(initial + 1);
    });

    it('should track keyboard interactions', () => {
      const initial = performanceService.getCurrentSession().interactions;
      document.dispatchEvent(new KeyboardEvent('keydown'));
      expect(performanceService.getCurrentSession().interactions).toBe(initial + 1);
    });

    it('should throttle scroll interactions', () => {
      vi.useFakeTimers();
      const initial = performanceService.getCurrentSession().interactions;
      
      document.dispatchEvent(new Event('scroll'));
      document.dispatchEvent(new Event('scroll'));
      document.dispatchEvent(new Event('scroll'));
      
      // Throttled - not yet counted
      expect(performanceService.getCurrentSession().interactions).toBe(initial);
      
      vi.advanceTimersByTime(101);
      expect(performanceService.getCurrentSession().interactions).toBe(initial + 1);
    });
  });

  describe('Error Tracking', () => {
    it('should track JavaScript errors', () => {
      resetSingleton();
      const freshService = PerformanceService.getInstance();
      const initialErrors = freshService.getCurrentSession().errors;
      
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Test error'),
        message: 'Test error message'
      });
      window.dispatchEvent(errorEvent);
      
      expect(freshService.getCurrentSession().errors).toBeGreaterThan(initialErrors);
    });

    it('should track unhandled promise rejections', () => {
      // PromiseRejectionEvent may not be available in jsdom, skip if so
      if (typeof PromiseRejectionEvent === 'undefined') {
        return;
      }
      
      const initialErrors = performanceService.getCurrentSession().errors;
      const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject(new Error('Test rejection')),
        reason: new Error('Test rejection')
      });
      window.dispatchEvent(rejectionEvent);
      
      expect(performanceService.getCurrentSession().errors).toBeGreaterThan(initialErrors);
    });

    it('should track resource loading errors', () => {
      resetSingleton();
      const freshService = PerformanceService.getInstance();
      const initialErrors = freshService.getCurrentSession().errors;
      
      const mockImage = document.createElement('img');
      mockImage.src = 'nonexistent.jpg';
      const errorEvent = new Event('error');
      Object.defineProperty(errorEvent, 'target', {
        value: mockImage,
        writable: false
      });
      window.dispatchEvent(errorEvent);
      
      expect(freshService.getCurrentSession().errors).toBeGreaterThan(initialErrors);
    });
  });
});
