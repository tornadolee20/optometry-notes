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

export const useErrorHandler = () => {
  const { toast } = useToast();

  const getErrorMessage = useCallback((error: any): ErrorDetails => {
    // Supabase 錯誤處理
    if (error?.code) {
      switch (error.code) {
        case 'PGRST116':
          return {
            code: 'NOT_FOUND',
            message: '找不到相關資料',
          };
        case '23505':
          return {
            code: 'DUPLICATE',
            message: '資料已存在，請檢查是否重複',
          };
        case '23503':
          return {
            code: 'FOREIGN_KEY',
            message: '相關資料不存在',
          };
        case '42501':
          return {
            code: 'PERMISSION',
            message: '權限不足，請重新登入',
          };
        default:
          return {
            code: error.code,
            message: error.message || '資料庫操作失敗',
          };
      }
    }

    // 網路錯誤
    if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      return {
        code: 'NETWORK',
        message: '網路連線問題，請檢查網路後重試',
      };
    }

    // Auth 錯誤
    if (error?.message?.includes('auth') || error?.message?.includes('unauthorized')) {
      return {
        code: 'AUTH',
        message: '身份驗證失敗，請重新登入',
      };
    }

    // 驗證錯誤
    if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
      return {
        code: 'VALIDATION',
        message: '輸入資料格式錯誤，請檢查後重試',
      };
    }

    // 預設錯誤
    return {
      code: 'UNKNOWN',
      message: error?.message || '發生未知錯誤，請稍後再試',
    };
  }, []);

  const handleError = useCallback((error: any, context?: ErrorContext) => {
    const errorDetails = getErrorMessage(error);
    
    console.error(`Error in ${context?.operation || 'operation'}:`, {
      error,
      details: errorDetails,
      context,
    });

    // 構建 toast 動作按鈕
    const actions = [];
    
    if (context?.retry) {
      actions.push({
        label: '重試',
        onClick: context.retry,
      });
    }
    
    if (context?.fallback) {
      actions.push({
        label: '返回',
        onClick: context.fallback,
      });
    }

    // 顯示錯誤 toast
    toast({
      variant: "destructive",
      title: getErrorTitle(errorDetails.code),
      description: errorDetails.message,
    });

    // 如果有動作按鈕，延遲顯示（簡化處理）
    if (actions.length > 0 && context?.retry) {
      setTimeout(() => {
        if (context.retry) {
          context.retry();
        }
      }, 2000);
    }

    return errorDetails;
  }, [toast, getErrorMessage]);

  const getErrorTitle = (code?: string): string => {
    switch (code) {
      case 'NETWORK':
        return '網路連線問題';
      case 'AUTH':
        return '身份驗證失敗';
      case 'PERMISSION':
        return '權限不足';
      case 'NOT_FOUND':
        return '資料不存在';
      case 'DUPLICATE':
        return '資料重複';
      case 'VALIDATION':
        return '輸入錯誤';
      case 'FOREIGN_KEY':
        return '資料關聯錯誤';
      default:
        return '操作失敗';
    }
  };

  return {
    handleError,
    getErrorMessage,
  };
};

// 帶重試機制的 API Hook
export const useApiWithRetry = <T extends any[], R>(
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
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiFunction(...args);
      } catch (error) {
        lastError = error;
        
        // 如果是最後一次嘗試，拋出錯誤
        if (attempt === maxRetries) {
          handleError(error, { operation });
          throw error;
        }

        // 計算延遲時間
        const delay = exponentialBackoff 
          ? retryDelay * Math.pow(2, attempt - 1)
          : retryDelay;

        // 等待後重試
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }, [apiFunction, maxRetries, retryDelay, exponentialBackoff, operation, handleError]);

  return executeWithRetry;
};