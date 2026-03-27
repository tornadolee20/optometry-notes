/**
 * CSRF 防護工具
 * 提供 CSRF Token 生成、驗證和管理功能
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * 生成隨機 CSRF Token
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * 獲取當前的 CSRF Token，如果不存在則生成新的
 */
export const getCSRFToken = (): string => {
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }
  
  return token;
};

/**
 * 設置 CSRF Token
 */
export const setCSRFToken = (token: string): void => {
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
};

/**
 * 清除 CSRF Token
 */
export const clearCSRFToken = (): void => {
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
};

/**
 * 驗證 CSRF Token
 */
export const validateCSRFToken = (receivedToken: string): boolean => {
  const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  return storedToken !== null && storedToken === receivedToken;
};

/**
 * 為請求添加 CSRF Token 標頭
 */
export const addCSRFTokenToHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  const token = getCSRFToken();
  return {
    ...headers,
    [CSRF_HEADER_NAME]: token,
  };
};

/**
 * 為 fetch 請求添加 CSRF 保護
 */
export const fetchWithCSRF = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getCSRFToken();
  
  const headers = new Headers(options.headers);
  headers.set(CSRF_HEADER_NAME, token);
  headers.set('Content-Type', 'application/json');
  
  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * 初始化 CSRF 防護
 * 在應用啟動時調用
 */
export const initCSRFProtection = (): void => {
  // 如果沒有 token 或者 token 已過期，生成新的
  const existingToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  
  if (!existingToken) {
    const newToken = generateCSRFToken();
    sessionStorage.setItem(CSRF_TOKEN_KEY, newToken);
    console.log('CSRF protection initialized with new token');
  } else {
    console.log('CSRF protection initialized with existing token');
  }
  
  // 監聽頁面卸載，清理 token（可選）
  window.addEventListener('beforeunload', () => {
    // 在某些情況下，你可能想要保留 token 直到瀏覽器關閉
    // clearCSRFToken();
  });
};

/**
 * 為表單添加隱藏的 CSRF Token 字段
 */
export const addCSRFTokenToForm = (form: HTMLFormElement): void => {
  const token = getCSRFToken();
  
  // 檢查是否已經存在 CSRF 字段
  let csrfInput = form.querySelector('input[name="csrf_token"]') as HTMLInputElement;
  
  if (!csrfInput) {
    csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrf_token';
    form.appendChild(csrfInput);
  }
  
  csrfInput.value = token;
};

/**
 * CSRF Token 刷新策略
 * 定期刷新 token 以增強安全性
 */
export const refreshCSRFToken = (): string => {
  const newToken = generateCSRFToken();
  setCSRFToken(newToken);
  console.log('CSRF token refreshed');
  return newToken;
};

/**
 * 設置自動刷新 CSRF Token
 * @param intervalMinutes 刷新間隔（分鐘）
 */
export const setupCSRFTokenAutoRefresh = (intervalMinutes: number = 30): number => {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  return window.setInterval(() => {
    refreshCSRFToken();
  }, intervalMs);
};

export const CSRF_CONSTANTS = {
  TOKEN_KEY: CSRF_TOKEN_KEY,
  HEADER_NAME: CSRF_HEADER_NAME,
} as const;