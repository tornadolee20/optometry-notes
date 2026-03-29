import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ErrorContext {
  operation?: string;
  retry?: () => void;
  fallback?: () => void;
}

interface ErrorDetails {
  code?: string;
  message: string;
  cause?: Error;
}

interface ErrorLike {
  code?: string;
  message?: string;
}

const isErrorLike = (error: unknown): error is ErrorLike => {
  return typeof error === 'object' && error !== null;
};

const getErrorMsg = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (isErrorLike(error) && error.message) return error.message;
  return String(error);
};

export const useErrorHandler = () => {
  const { toast } = useToast();

  const getErrorMessage = useCallback((error: unknown): ErrorDetails => {
    if (isErrorLike(error) && error.code) {
      switch (error.code) {
        case 'PGRST116':
          return { code: 'NOT_FOUND', message: '找不到相關資料' };
        case '23505':
          return { code: 'DUPLICATE', message: '資料已存在，請檢查是否重複' };
        case '23503':
          return { code: 'FOREIGN_KEY', message: '相關資料不存在' };
        case '42501':
          return { code: 'PERMISSION', message: '權限不足，請重新登入' };
        default:
          return { code: error.code, message: getErrorMsg(error) || '資料庫操作失敗' };
      }
    }

    const msg = getErrorMsg(error);

    if (msg.includes('fetch') || msg.includes('network')) {
      return { code: 'NETWORK', message: '網路連線問題，請檢查網路後重試' };
    }
    if (msg.includes('auth') || msg.includes('unauthorized')) {
      return { code: 'AUTH', message: '身份驗證失敗，請重新登入' };
    }
    if (msg.includes('validation') || msg.includes('invalid')) {
      return { code: 'VALIDATION', message: '輸入資料格式錯誤，請檢查後重試' };
    }

    return { code: 'UNKNOWN', message: msg || '發生未知錯誤，請稍後再試' };
  }, []);

  const handleError = useCallback((error: unknown, context?: ErrorContext) => {
    const errorDetails = getErrorMessage(error);
    
    console.error(`Error in ${context?.operation || 'operation'}:`, {
      error, details: errorDetails, context,
    });

    toast({
      variant: "destructive",
      title: getErrorTitle(errorDetails.code),
      description: errorDetails.message,
    });

    if (context?.retry) {
      setTimeout(() => { context.retry?.(); }, 2000);
    }

    return errorDetails;
  }, [toast, getErrorMessage]);

  const getErrorTitle = (code?: string): string => {
    switch (code) {
      case 'NETWORK': return '網路連線問題';
      case 'AUTH': return '身份驗證失敗';
      case 'PERMISSION': return '權限不足';
      case 'NOT_FOUND': return '資料不存在';
      case 'DUPLICATE': return '資料重複';
      case 'VALIDATION': return '輸入錯誤';
      case 'FOREIGN_KEY': return '資料關聯錯誤';
      default: return '操作失敗';
    }
  };

  return { handleError, getErrorMessage };
};

// 帶重試機制的 API Hook
export const useApiWithRetry = <T extends unknown[], R>(
  apiFunction: (...args: T) => Promise<R>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    exponentialBackoff?: boolean;
    operation?: string;
  } = {}
) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    operation = 'API call'
  } = options;
  
  const { handleError } = useErrorHandler();

  const executeWithRetry = useCallback(async (...args: T): Promise<R> => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiFunction(...args);
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) {
          handleError(error, { operation });
          throw error;
        }
        const delay = exponentialBackoff 
          ? retryDelay * Math.pow(2, attempt - 1)
          : retryDelay;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }, [apiFunction, maxRetries, retryDelay, exponentialBackoff, operation, handleError]);

  return executeWithRetry;
};
