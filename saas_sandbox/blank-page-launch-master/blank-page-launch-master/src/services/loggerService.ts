import { supabase } from "@/integrations/supabase/client";

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface LogEntry {
  id?: string;
  level: LogLevel;
  message: string;
  category: string;
  details?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  source: 'client' | 'server';
  userAgent?: string;
  url?: string;
  stack?: string;
}

export interface LogFilter {
  level?: LogLevel;
  category?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export class LoggerService {
  private static instance: LoggerService;
  private sessionId: string;
  private userId?: string;
  private queue: LogEntry[] = [];
  private isFlushPending = false;
  private readonly MAX_QUEUE_SIZE = 50;
  private readonly FLUSH_INTERVAL = 5000; // 5秒

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startPeriodicFlush();
    this.setupUnloadHandler();
  }

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  /**
   * 設置當前用戶 ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Debug 日誌
   */
  debug(message: string, category: string = 'general', details?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, category, details);
  }

  /**
   * Info 日誌
   */
  info(message: string, category: string = 'general', details?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, category, details);
  }

  /**
   * Warning 日誌
   */
  warn(message: string, category: string = 'general', details?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, category, details);
  }

  /**
   * Error 日誌
   */
  error(message: string, category: string = 'general', details?: Record<string, any>, error?: Error): void {
    const logDetails = { ...details };
    
    if (error) {
      logDetails.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    
    this.log(LogLevel.ERROR, message, category, logDetails, error?.stack);
  }

  /**
   * Critical 日誌
   */
  critical(message: string, category: string = 'general', details?: Record<string, any>, error?: Error): void {
    const logDetails = { ...details };
    
    if (error) {
      logDetails.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    
    this.log(LogLevel.CRITICAL, message, category, logDetails, error?.stack);
    
    // Critical 錯誤立即發送
    this.flushLogs();
  }

  /**
   * 記錄用戶行為
   */
  logUserAction(action: string, details?: Record<string, any>): void {
    this.info(`用戶操作: ${action}`, 'user_action', details);
  }

  /**
   * 記錄性能指標
   */
  logPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.info(`性能指標: ${metric}`, 'performance', {
      metric,
      value,
      unit,
      timestamp: Date.now()
    });
  }

  /**
   * 記錄 API 調用
   */
  logApiCall(
    method: string, 
    url: string, 
    status: number, 
    duration: number, 
    details?: Record<string, any>
  ): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API ${method} ${url}`, 'api', {
      method,
      url,
      status,
      duration,
      ...details
    });
  }

  /**
   * 核心日誌方法
   */
  private log(
    level: LogLevel, 
    message: string, 
    category: string, 
    details?: Record<string, any>,
    stack?: string
  ): void {
    const logEntry: LogEntry = {
      level,
      message,
      category,
      details,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      source: 'client',
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack
    };

    // 在控制台輸出（僅開發模式）
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(logEntry);
    }

    // 添加到隊列
    this.queue.push(logEntry);

    // 檢查是否需要立即發送
    if (level === LogLevel.CRITICAL || this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flushLogs();
    }
  }

  /**
   * 控制台輸出
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.details);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.details);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.details);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(prefix, entry.message, entry.details);
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
    }
  }

  /**
   * 發送日誌到服務器
   */
  private async flushLogs(): Promise<void> {
    if (this.queue.length === 0 || this.isFlushPending) {
      return;
    }

    this.isFlushPending = true;
    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      const { error } = await supabase
        .from('system_logs')
        .insert(logsToSend);

      if (error) {
        console.error('發送日誌失敗:', error);
        // 失敗的日誌重新加入隊列
        this.queue.unshift(...logsToSend);
      }
    } catch (error) {
      console.error('日誌發送異常:', error);
      // 異常的日誌重新加入隊列
      this.queue.unshift(...logsToSend);
    } finally {
      this.isFlushPending = false;
    }
  }

  /**
   * 定期發送日誌
   */
  private startPeriodicFlush(): void {
    setInterval(() => {
      if (this.queue.length > 0) {
        this.flushLogs();
      }
    }, this.FLUSH_INTERVAL);
  }

  /**
   * 頁面卸載時發送剩餘日誌
   */
  private setupUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      if (this.queue.length > 0) {
        // 使用 sendBeacon 確保日誌能夠發送
        navigator.sendBeacon(
          '/api/logs',
          JSON.stringify(this.queue)
        );
      }
    });
  }

  /**
   * 生成會話 ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 查詢日誌
   */
  static async queryLogs(filter: LogFilter = {}): Promise<LogEntry[]> {
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filter.level) {
        query = query.eq('level', filter.level);
      }

      if (filter.category) {
        query = query.eq('category', filter.category);
      }

      if (filter.userId) {
        query = query.eq('userid', filter.userId);
      }

      if (filter.startDate) {
        query = query.gte('timestamp', filter.startDate);
      }

      if (filter.endDate) {
        query = query.lte('timestamp', filter.endDate);
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      const { data, error } = await query as any;

      if (error) {
        console.error('查詢日誌失敗:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        level: (row.level as LogLevel) ?? LogLevel.INFO,
        message: row.message ?? '',
        category: row.category ?? 'general',
        details: (row.details as any) ?? {},
        userId: row.userid ?? undefined,
        sessionId: row.sessionid ?? undefined,
        timestamp: row.timestamp ?? new Date().toISOString(),
        source: (row.source as 'client' | 'server') ?? 'client',
        userAgent: row.useragent ?? undefined,
        url: row.url ?? undefined,
        stack: row.stack ?? undefined,
      }));
    } catch (error) {
      console.error('日誌查詢異常:', error);
      return [];
    }
  }

  /**
   * 清理舊日誌
   */
  static async cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabase
        .from('system_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());

      if (error) {
        console.error('清理舊日誌失敗:', error);
      }
    } catch (error) {
      console.error('日誌清理異常:', error);
    }
  }
}

// 導出單例實例
export const logger = LoggerService.getInstance();

// 導出便捷方法
export const logDebug = (message: string, category?: string, details?: Record<string, any>) => 
  logger.debug(message, category, details);

export const logInfo = (message: string, category?: string, details?: Record<string, any>) => 
  logger.info(message, category, details);

export const logWarn = (message: string, category?: string, details?: Record<string, any>) => 
  logger.warn(message, category, details);

export const logError = (message: string, category?: string, details?: Record<string, any>, error?: Error) => 
  logger.error(message, category, details, error);

export const logCritical = (message: string, category?: string, details?: Record<string, any>, error?: Error) => 
  logger.critical(message, category, details, error);

export const logUserAction = (action: string, details?: Record<string, any>) => 
  logger.logUserAction(action, details);

export const logPerformance = (metric: string, value: number, unit?: string) => 
  logger.logPerformance(metric, value, unit);

export const logApiCall = (method: string, url: string, status: number, duration: number, details?: Record<string, any>) => 
  logger.logApiCall(method, url, status, duration, details);

export default logger;