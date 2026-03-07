import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    then: vi.fn(() => Promise.resolve({ data: [], error: null }))
  }))
};

// Mock modules
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options });

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock store data
export const mockStore = {
  id: 'test-store-id',
  name: 'Test Store',
  owner_id: 'test-user-id',
  plan: 'premium',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock review data
export const mockReview = {
  id: 'test-review-id',
  store_id: 'test-store-id',
  customer_name: 'Test Customer',
  rating: 5,
  comment: 'Great service!',
  platform: 'google',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock payment transaction
export const mockPaymentTransaction = {
  id: 'test-payment-id',
  store_id: 'test-store-id',
  amount: 29.99,
  currency: 'USD',
  status: 'completed',
  payment_method: 'credit_card',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Utility functions for testing
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 100));

export const createMockEvent = (type: string, eventInitDict?: EventInit) => 
  new Event(type, eventInitDict);

export const createMockMouseEvent = (type: string, eventInitDict?: MouseEventInit) => 
  new MouseEvent(type, eventInitDict);

export const createMockKeyboardEvent = (type: string, eventInitDict?: KeyboardEventInit) => 
  new KeyboardEvent(type, eventInitDict);

// Re-export everything
export * from '@testing-library/react';
export { screen, waitFor, fireEvent } from '@testing-library/react';
export { customRender as render };
export { mockSupabase };