import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 集成測試設置 - 不 mock Supabase，使用真實連接

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestIdleCallback
;(global as any).requestIdleCallback = vi.fn((cb: any) => window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 1));
;(global as any).cancelIdleCallback = vi.fn((id: number) => window.clearTimeout(id));

// Mock Performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    }
  }
});

// 設置測試環境變數
process.env.NODE_ENV = 'test';

// 如果需要連接測試數據庫，確保環境變數正確設置
if (process.env.TEST_SUPABASE_URL && process.env.TEST_SUPABASE_ANON_KEY) {
  process.env.VITE_SUPABASE_URL = process.env.TEST_SUPABASE_URL;
  process.env.VITE_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY;
}

console.log('🧪 集成測試環境已初始化');
console.log(`📦 Supabase URL: ${process.env.VITE_SUPABASE_URL ? '已配置' : '未配置'}`);
console.log(`🔑 Supabase Key: ${process.env.VITE_SUPABASE_ANON_KEY ? '已配置' : '未配置'}`);

// 全局錯誤處理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});