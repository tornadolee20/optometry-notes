import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react-swc';

// 集成測試配置，可以連接真實的測試數據庫
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // 不使用 mock setup，讓真實的 Supabase 連接生效
    setupFiles: ['./src/test/integration-setup.ts'],
    css: true,
    // 集成測試通常需要更長的超時時間
    testTimeout: 30000,
    hookTimeout: 30000,
    // 只運行集成測試
    include: ['src/test/integration/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});