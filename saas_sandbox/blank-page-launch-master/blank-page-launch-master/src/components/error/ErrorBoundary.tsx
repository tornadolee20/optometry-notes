import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 更新 state 以觸發降級 UI 的渲染
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 記錄錯誤信息
    this.setState({
      error,
      errorInfo,
    });

    // 調用外部錯誤處理函數
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 發送錯誤到日誌服務
    this.logError(error, errorInfo);
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getCurrentUserId(),
      };

      // 發送到日誌服務（這裡可以集成 Sentry, LogRocket 等）
      console.error('React Error Boundary 捕獲錯誤:', errorReport);
      
      // 可以發送到外部服務
      // await this.sendErrorReport(errorReport);
    } catch (logError) {
      console.error('無法記錄錯誤:', logError);
    }
  }

  private getCurrentUserId(): string | null {
    try {
      // 嘗試從 localStorage 或其他地方獲取用戶 ID
      return localStorage.getItem('userId') || null;
    } catch {
      return null;
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定義的 fallback UI，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默認的錯誤 UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                糟糕！出現了一個錯誤
              </CardTitle>
              <CardDescription className="text-gray-600">
                應用程序遇到了意外錯誤。我們已經記錄了這個問題，正在努力修復。
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* 錯誤詳情（僅在開發環境顯示） */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-100 rounded-lg p-3 text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    錯誤詳情 (開發模式)
                  </summary>
                  <div className="space-y-2 text-xs text-gray-600 font-mono">
                    <div>
                      <strong>錯誤 ID:</strong> {this.state.errorId}
                    </div>
                    <div>
                      <strong>錯誤信息:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>錯誤堆疊:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-all">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* 操作按鈕 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  重試
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  重新載入頁面
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  回到首頁
                </Button>
              </div>

              {/* 錯誤報告 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Bug className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">幫助我們改進</p>
                    <p>
                      如果問題持續發生，請聯繫技術支援並提供錯誤 ID：
                      <code className="bg-blue-100 px-1 rounded text-xs ml-1">
                        {this.state.errorId}
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 簡化版的錯誤邊界，用於小組件
export const SimpleErrorBoundary: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-700 font-medium">載入失敗</p>
            <p className="text-xs text-red-600 mt-1">請重新整理頁面或稍後再試</p>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;