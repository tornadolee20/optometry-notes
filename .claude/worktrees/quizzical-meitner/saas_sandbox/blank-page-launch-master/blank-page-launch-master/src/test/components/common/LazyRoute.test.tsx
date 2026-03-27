import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import { LazyRoute, RoutePreloader } from '@/components/common/LazyRoute';

// Mock PerformanceService
vi.mock('@/services/performanceService', () => ({
  default: {
    getInstance: () => ({
      startMeasure: vi.fn(() => Date.now()),
      endMeasure: vi.fn()
    })
  }
}));

describe('LazyRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading fallback initially', () => {
    const mockComponent = () => Promise.resolve({
      default: () => <div>Loaded Component</div>
    });

    render(
      <LazyRoute 
        component={mockComponent}
        name="TestComponent"
      />
    );

    expect(screen.getByText('載入 TestComponent...')).toBeInTheDocument();
    expect(screen.getByText('請稍候，我們正在為您準備內容')).toBeInTheDocument();
  });

  it('renders component after loading', async () => {
    const mockComponent = () => Promise.resolve({
      default: () => <div>Loaded Component</div>
    });

    render(
      <LazyRoute 
        component={mockComponent}
        name="TestComponent"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Loaded Component')).toBeInTheDocument();
    });
  });

  it('shows error state when component fails to load', async () => {
    const mockComponent = () => Promise.reject(new Error('Load failed'));

    render(
      <LazyRoute 
        component={mockComponent}
        name="TestComponent"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('載入失敗')).toBeInTheDocument();
      expect(screen.getByText('無法載入 TestComponent')).toBeInTheDocument();
      expect(screen.getByText('重新載入')).toBeInTheDocument();
    });
  });

  it('uses custom fallback when provided', () => {
    const mockComponent = () => Promise.resolve({
      default: () => <div>Loaded Component</div>
    });

    const customFallback = <div>Custom Loading...</div>;

    render(
      <LazyRoute 
        component={mockComponent}
        fallback={customFallback}
      />
    );

    expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
  });

  it('preloads component when preload is true', () => {
    const mockComponent = vi.fn(() => Promise.resolve({
      default: () => <div>Loaded Component</div>
    }));

    render(
      <LazyRoute 
        component={mockComponent}
        preload={true}
      />
    );

    // Component should be called for preloading
    expect(mockComponent).toHaveBeenCalled();
  });

  it('shows generic loading message when no name provided', () => {
    const mockComponent = () => Promise.resolve({
      default: () => <div>Loaded Component</div>
    });

    render(<LazyRoute component={mockComponent} />);

    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });
});

describe('RoutePreloader', () => {
  beforeEach(() => {
    RoutePreloader.clearCache();
    vi.clearAllMocks();
  });

  it('preloads route successfully', async () => {
    const mockImport = vi.fn(() => Promise.resolve({ default: () => <div>Component</div> }));
    
    await RoutePreloader.preloadRoute(mockImport, 'test-route');
    
    expect(mockImport).toHaveBeenCalled();
    expect(RoutePreloader.isPreloaded('test-route')).toBe(true);
  });

  it('does not preload same route twice', async () => {
    const mockImport = vi.fn(() => Promise.resolve({ default: () => <div>Component</div> }));
    
    await RoutePreloader.preloadRoute(mockImport, 'test-route');
    await RoutePreloader.preloadRoute(mockImport, 'test-route');
    
    expect(mockImport).toHaveBeenCalledTimes(1);
  });

  it('handles preload failures gracefully', async () => {
    const mockImport = vi.fn(() => Promise.reject(new Error('Import failed')));
    
    await expect(
      RoutePreloader.preloadRoute(mockImport, 'test-route')
    ).rejects.toThrow('Import failed');
    
    expect(RoutePreloader.isPreloaded('test-route')).toBe(false);
  });

  it('returns correct stats', async () => {
    const mockImport1 = vi.fn(() => Promise.resolve({ default: () => <div>Component1</div> }));
    const mockImport2 = vi.fn(() => Promise.resolve({ default: () => <div>Component2</div> }));
    
    await RoutePreloader.preloadRoute(mockImport1, 'route1');
    await RoutePreloader.preloadRoute(mockImport2, 'route2');
    
    const stats = RoutePreloader.getStats();
    expect(stats.preloadedCount).toBe(2);
    expect(stats.preloadedRoutes).toContain('route1');
    expect(stats.preloadedRoutes).toContain('route2');
  });

  it('clears cache correctly', async () => {
    const mockImport = vi.fn(() => Promise.resolve({ default: () => <div>Component</div> }));
    
    await RoutePreloader.preloadRoute(mockImport, 'test-route');
    expect(RoutePreloader.isPreloaded('test-route')).toBe(true);
    
    RoutePreloader.clearCache();
    expect(RoutePreloader.isPreloaded('test-route')).toBe(false);
  });

  it('preloads on hover with delay', () => {
    const mockElement = document.createElement('div');
    const mockImport = vi.fn(() => Promise.resolve({ default: () => <div>Component</div> }));
    
    const cleanup = RoutePreloader.preloadOnHover(mockElement, mockImport, 'test-route');
    
    // Simulate mouse enter
    const mouseEnterEvent = new MouseEvent('mouseenter');
    mockElement.dispatchEvent(mouseEnterEvent);
    
    // Should not be called immediately due to delay
    expect(mockImport).not.toHaveBeenCalled();
    
    // Cleanup
    cleanup();
  });

  it('cancels hover preload on mouse leave', () => {
    const mockElement = document.createElement('div');
    const mockImport = vi.fn(() => Promise.resolve({ default: () => <div>Component</div> }));
    
    const cleanup = RoutePreloader.preloadOnHover(mockElement, mockImport, 'test-route');
    
    // Simulate mouse enter then leave quickly
    const mouseEnterEvent = new MouseEvent('mouseenter');
    const mouseLeaveEvent = new MouseEvent('mouseleave');
    
    mockElement.dispatchEvent(mouseEnterEvent);
    mockElement.dispatchEvent(mouseLeaveEvent);
    
    // Should not preload due to quick mouse leave
    expect(mockImport).not.toHaveBeenCalled();
    
    cleanup();
  });
});