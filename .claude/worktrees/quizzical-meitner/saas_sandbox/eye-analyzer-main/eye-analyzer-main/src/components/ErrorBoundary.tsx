import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.toString() };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-card rounded-2xl shadow-soft border border-border p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">系統發生錯誤</h1>
            <p className="text-muted-foreground mb-6">請截圖傳送給工程團隊：</p>
            
            <code className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg text-xs text-destructive block break-all text-left">
              {this.state.error}
            </code>
            
            <button 
              className="mt-8 px-6 py-3 gradient-primary text-primary-foreground rounded-lg font-semibold flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
              重新整理
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
