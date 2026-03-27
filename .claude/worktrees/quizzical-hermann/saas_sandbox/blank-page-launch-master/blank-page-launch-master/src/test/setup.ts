import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
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

// Mock localStorage
const localStorageMock: Storage = {
  getItem: vi.fn() as any,
  setItem: vi.fn() as any,
  removeItem: vi.fn() as any,
  clear: vi.fn() as any,
  key: vi.fn(),
  length: 0,
};
(global as any).localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock: Storage = {
  getItem: vi.fn() as any,
  setItem: vi.fn() as any,
  removeItem: vi.fn() as any,
  clear: vi.fn() as any,
  key: vi.fn(),
  length: 0,
};
(global as any).sessionStorage = sessionStorageMock;

// Mock navigator.sendBeacon
Object.defineProperty(navigator, 'sendBeacon', {
  writable: true,
  value: vi.fn(() => true),
});

// Mock crypto API for test environment
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: vi.fn(() => 'test-uuid-1234-5678-9012'),
  },
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Image constructor
global.Image = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  
  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 100);
  }
} as any;