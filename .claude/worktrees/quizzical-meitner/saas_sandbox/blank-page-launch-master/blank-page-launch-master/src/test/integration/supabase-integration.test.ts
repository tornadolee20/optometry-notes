import { describe, it, expect, beforeAll } from 'vitest';
import { supabase, testSupabaseConnection } from '@/integrations/supabase/client';

// 這個測試文件專門用於測試真實的 Supabase 連接
// 只在特定環境下運行（例如有 TEST_DB_URL 環境變數時）
describe('Supabase Integration Tests', () => {
  beforeAll(async () => {
    // 檢查是否有測試數據庫配置
    if (!process.env.TEST_SUPABASE_URL) {
      console.log('跳過 Supabase 集成測試：未配置測試數據庫');
      return;
    }
  });

  it('should connect to Supabase successfully', async () => {
    // 只在有測試環境配置時運行
    if (!process.env.TEST_SUPABASE_URL) {
      console.log('跳過：需要 TEST_SUPABASE_URL 環境變數');
      return;
    }

    const isConnected = await testSupabaseConnection();
    expect(isConnected).toBe(true);
  });

  it('should handle authentication', async () => {
    if (!process.env.TEST_SUPABASE_URL) return;

    const { data, error } = await supabase.auth.getSession();
    expect(error).toBeNull();
    // 測試環境下應該沒有活躍會話
    expect(data.session).toBeNull();
  });

  it('should query public tables', async () => {
    if (!process.env.TEST_SUPABASE_URL) return;

    // 測試公共表查詢（不需要認證）
    const { error } = await supabase
      .from('stores')
      .select('*')
      .limit(1);

    // 這個測試可能會失敗，這取決於你的數據庫結構
    expect(error).toBeNull();
  });
});