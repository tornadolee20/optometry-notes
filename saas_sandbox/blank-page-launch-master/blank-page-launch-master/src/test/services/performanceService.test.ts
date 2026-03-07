import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import PerformanceService from '@/services/performanceService';

// Mock logger service
vi.mock('@/services/loggerService', () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn()
}));

describe('PerformanceService', () => {
  let performanceService: PerformanceService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the singleton instance
    (PerformanceService as any).instance = undefined;
    performanceService = PerformanceService.getInstance();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = PerformanceService.getInstance();
      const instance2 = PerformanceService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should initialize with unique session ID', () => {
      const instance1 = PerformanceService.getInstance();
      const instance2 = PerformanceService.getInstance();
      
      const session1 = instance1.getCurrentSession();
      const session2 = instance2.getCurrentSession();
      
      expect(session1.sessionId).toBe(session2.sessionId);
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
      const initialSession = performanceService.getCurrentSession();
      expect(initialSession.pageViews).toBe(0);
      
      performanceService.incrementPageView();
      
      const updatedSession = performanceService.getCurrentSession();
      expect(updatedSession.pageViews).toBe(1);
    });
  });

  describe('Custom Performance Measurement', () => {
    it('should start and end measurements', () => {
      const measureName = 'test-operation';
      
      const startTime = performanceService.startMeasure(measureName);
      expect(typeof startTime).toBe('number');
      expect(startTime).toBeGreaterThan(0);
      
      // Mock some time passage
      vi.advanceTimersByTime(100);
      
      const duration = performanceService.endMeasure(measureName, startTime);
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle measurement errors gracefully', () => {
      // Mock performance.now to throw error
      const originalNow = global.performance.now;
      global.performance.now = vi.fn(() => {
        throw new Error('Performance API error');
      });
      
      // Should not throw error
      expect(() => {
        performanceService.startMeasure('test');
      }).not.toThrow();
      
      // Restore original method
      global.performance.now = originalNow;
    });

    it('should use custom performance measurement', () => {
      const measureName = 'custom-measure';
      const startTime = Date.now() - 1000; // 1 second ago
      
      expect(() => {
        performanceService.measureCustomPerformance(measureName, startTime);
      }).not.toThrow();
    });
  });

  describe('Memory Monitoring', () => {
    it('should handle memory API availability', () => {
      // Test when memory API is available
      const mockMemory = {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000
      };
      
      (global.performance as any).memory = mockMemory;
      
      const session = performanceService.getCurrentSession();
      expect(session.performance.memoryUsage).toBe(25); // 1M / 4M * 100
      
      // Test when memory API is not available
      delete (global.performance as any).memory;
      
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
      
      // All metrics should be numbers
      Object.values(metrics).forEach(value => {
        expect(typeof value).toBe('number');
      });
    });

    it('should handle performance API errors gracefully', () => {
      // Mock getEntriesByType to throw error
      const originalGetEntriesByType = global.performance.getEntriesByType;
      global.performance.getEntriesByType = vi.fn(() => {
        throw new Error('Performance API error');
      });
      
      // Should not throw error and return default metrics
      const metrics = performanceService.getCurrentSession().performance;
      expect(metrics.loadTime).toBe(0);
      expect(metrics.firstContentfulPaint).toBe(0);
      
      // Restore original method
      global.performance.getEntriesByType = originalGetEntriesByType;
    });
  });

  describe('Event Handling', () => {
    it('should handle beforeunload event', () => {
      const mockSendBeacon = vi.fn();
      (global.navigator as any).sendBeacon = mockSendBeacon;
      
      // Trigger beforeunload event
      const event = new Event('beforeunload');
      window.dispatchEvent(event);
      
      // Should attempt to send beacon
      expect(mockSendBeacon).toHaveBeenCalled();
      
      const [url, data] = mockSendBeacon.mock.calls[0];
      expect(url).toBe('/api/performance');
      expect(typeof data).toBe('string');
      
      // Should be valid JSON
      expect(() => JSON.parse(data)).not.toThrow();
    });

    it('should handle sendBeacon unavailability', () => {
      // Remove sendBeacon
      delete (global.navigator as any).sendBeacon;
      
      // Should not throw error
      expect(() => {
        const event = new Event('beforeunload');
        window.dispatchEvent(event);
      }).not.toThrow();
    });
  });

  describe('Performance Observer', () => {
    it('should handle PerformanceObserver unavailability', () => {
      // Mock PerformanceObserver to be undefined
      const originalPerformanceObserver = global.PerformanceObserver;
      (global as any).PerformanceObserver = undefined;
      
      // Should not throw error during initialization
      expect(() => {
        new PerformanceService();
      }).not.toThrow();
      
      // Restore PerformanceObserver
      global.PerformanceObserver = originalPerformanceObserver;
    });

    it('should handle unsupported entry types gracefully', () => {
      // Mock PerformanceObserver.observe to throw for unsupported types
      const mockObserve = vi.fn((options) => {
        if (options.entryTypes.includes('unsupported')) {
          throw new Error('Unsupported entry type');
        }
      });
      
      const mockPerformanceObserver = vi.fn(() => ({
        observe: mockObserve,
        disconnect: vi.fn()
      }));
      
      (global as any).PerformanceObserver = mockPerformanceObserver;
      
      // Should not throw error even with unsupported entry types
      expect(() => {
        new PerformanceService();
      }).not.toThrow();
    });
  });

  describe('User Interaction Tracking', () => {
    it('should track click interactions', () => {
      const initialSession = performanceService.getCurrentSession();
      const initialInteractions = initialSession.interactions;
      
      // Simulate click event
      const clickEvent = new MouseEvent('click');
      document.dispatchEvent(clickEvent);
      
      const updatedSession = performanceService.getCurrentSession();
      expect(updatedSession.interactions).toBe(initialInteractions + 1);
    });

    it('should track keyboard interactions', () => {
      const initialSession = performanceService.getCurrentSession();
      const initialInteractions = initialSession.interactions;
      
      // Simulate keydown event
      const keyEvent = new KeyboardEvent('keydown');
      document.dispatchEvent(keyEvent);
      
      const updatedSession = performanceService.getCurrentSession();
      expect(updatedSession.interactions).toBe(initialInteractions + 1);
    });

    it('should throttle scroll interactions', () => {
      const initialSession = performanceService.getCurrentSession();
      const initialInteractions = initialSession.interactions;
      
      // Simulate multiple scroll events
      const scrollEvent = new Event('scroll');
      document.dispatchEvent(scrollEvent);
      document.dispatchEvent(scrollEvent);
      document.dispatchEvent(scrollEvent);
      
      // Should still be throttled
      const immediateSession = performanceService.getCurrentSession();
      expect(immediateSession.interactions).toBe(initialInteractions);
      
      // After timeout, should register interaction
      vi.advanceTimersByTime(101);
      
      const laterSession = performanceService.getCurrentSession();
      expect(laterSession.interactions).toBe(initialInteractions + 1);
    });
  });

  describe('Error Tracking', () => {
    it('should track JavaScript errors', () => {
      const initialSession = performanceService.getCurrentSession();
      const initialErrors = initialSession.errors;
      
      // Simulate error event
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Test error'),
        message: 'Test error message'
      });
      window.dispatchEvent(errorEvent);
      
      const updatedSession = performanceService.getCurrentSession();
      expect(updatedSession.errors).toBe(initialErrors + 1);
    });

    it('should track unhandled promise rejections', () => {
      const initialSession = performanceService.getCurrentSession();
      const initialErrors = initialSession.errors;
      
      // Simulate unhandled rejection
      const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject(new Error('Test rejection')),
        reason: new Error('Test rejection')
      });
      window.dispatchEvent(rejectionEvent);
      
      const updatedSession = performanceService.getCurrentSession();
      expect(updatedSession.errors).toBe(initialErrors + 1);
    });

    it('should track resource loading errors', () => {
      const initialSession = performanceService.getCurrentSession();
      const initialErrors = initialSession.errors;
      
      // Create a mock element for resource error
      const mockImage = document.createElement('img');
      mockImage.src = 'nonexistent.jpg';
      
      // Simulate resource error
      const errorEvent = new Event('error');
      Object.defineProperty(errorEvent, 'target', {
        value: mockImage,
        writable: false
      });
      
      window.dispatchEvent(errorEvent);
      
      const updatedSession = performanceService.getCurrentSession();
      expect(updatedSession.errors).toBe(initialErrors + 1);
    });
  });
});