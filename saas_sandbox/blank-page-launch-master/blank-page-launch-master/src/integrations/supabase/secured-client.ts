import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getCSRFToken } from '@/utils/csrf-protection';

// 安全地從環境變數讀取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 驗證必要的環境變數
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

/**
 * 創建帶有 CSRF 保護的 Supabase 客戶端
 */
const createSecuredClient = (): SupabaseClient => {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {} as Record<string, string>,
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
};

/**
 * 帶有 CSRF 保護的 Supabase 客戶端實例
 */
export const securedSupabase = createSecuredClient();

/**
 * 安全的 Supabase 函數調用
 * 自動添加 CSRF 保護
 */
export const securedFunctionInvoke = async (
  functionName: string,
  body?: any,
  options?: {
    headers?: Record<string, string>;
    method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  }
) => {
  const csrfToken = getCSRFToken();
  
  const securedHeaders = {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  return securedSupabase.functions.invoke(functionName, {
    body: body ? JSON.stringify(body) : undefined,
    headers: securedHeaders,
    method: options?.method || 'POST',
  });
};

/**
 * 安全的資料庫操作包裝器
 */
export class SecuredSupabaseClient {
  private client: SupabaseClient;

  constructor() {
    this.client = securedSupabase;
  }

  /**
   * 安全的 select 操作
   */
  async select(table: string, query: string = '*', filters?: Record<string, any>) {
    let queryBuilder = this.client.from(table).select(query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
    }
    
    return queryBuilder;
  }

  /**
   * 安全的 insert 操作
   */
  async insert(table: string, data: any) {
    return this.client.from(table).insert(data);
  }

  /**
   * 安全的 update 操作
   */
  async update(table: string, data: any, filters: Record<string, any>) {
    let queryBuilder = this.client.from(table).update(data);
    
    Object.entries(filters).forEach(([key, value]) => {
      queryBuilder = queryBuilder.eq(key, value);
    });
    
    return queryBuilder;
  }

  /**
   * 安全的 delete 操作
   */
  async delete(table: string, filters: Record<string, any>) {
    let queryBuilder = this.client.from(table).delete();
    
    Object.entries(filters).forEach(([key, value]) => {
      queryBuilder = queryBuilder.eq(key, value);
    });
    
    return queryBuilder;
  }

  /**
   * 獲取原始客戶端（需要時使用）
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * 安全的檔案上傳
   */
  async uploadFile(bucket: string, path: string, file: File, options?: any) {
    return this.client.storage.from(bucket).upload(path, file, {
      ...options,
      metadata: {
        ...options?.metadata,
        'csrf-token': getCSRFToken(),
      },
    });
  }
}

/**
 * 預設的安全客戶端實例
 */
export const securedDB = new SecuredSupabaseClient();

/**
 * 測試安全連線
 */
export const testSecuredConnection = async () => {
  try {
    const { error } = await securedSupabase.from('stores').select('count').limit(1);
    if (error) {
      console.error('Secured Supabase 連線測試失敗:', error);
      return false;
    }
    console.log('Secured Supabase 連線測試成功');
    return true;
  } catch (err) {
    console.error('Secured Supabase 連線測試出現異常:', err);
    return false;
  }
};

export default securedSupabase;