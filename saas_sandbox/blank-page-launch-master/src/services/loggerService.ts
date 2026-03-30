import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";


/** Flexible record type for log details */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LogDetails = Record<string, any>;

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
  details?: LogDetails;
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
  private readonly FLUSH_INTERVAL = 5000;

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

  setUserId(userId: string): void {
    this.userId = userId;
  }

  debug(message: string, category: string = 'general', details?: LogDetails): void {
    this.log(LogLevel.DEBUG, message, category, details);
  }

  info(message: string, category: string = 'general', details?: LogDetails): void {
    this.log(LogLevel.INFO, message, category, details);
  }

  warn(message: string, category: string = 'general', details?: LogDetails): void {
    this.log(LogLevel.WARN, message, category, details);
  }

  error(message: string, category: string = 'general', details?: LogDetails, error?: Error): void {
    const logDetails: LogDetails = { ...details };
    if (error) {
      logDetails.error = { name: error.name, message: error.message, stack: error.stack };
    }
    this.log(LogLevel.ERROR, message, category, logDetails, error?.stack);
  }

  critical(message: string, category: string = 'general', details?: LogDetails, error?: Error): void {
    const logDetails: LogDetails = { ...details };
    if (error) {
      logDetails.error = { name: error.name, message: error.message, stack: error.stack };
    }
    this.log(LogLevel.CRITICAL, message, category, logDetails, error?.stack);
    this.flushLogs();
  }

  logUserAction(action: string, details?: LogDetails): void {
    this.info(`用戶操作: ${action}`, 'user_action', details);
  }

  logPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.info(`性能指標: ${metric}`, 'performance', { metric, value, unit, timestamp: Date.now() });
  }

  logApiCall(method: string, url: string, status: number, duration: number, details?: LogDetails): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API ${method} ${url}`, 'api', { method, url, status, duration, ...details });
  }

  private log(level: LogLevel, message: string, category: string, details?: LogDetails, stack?: string): void {
    const logEntry: LogEntry = {
      level, message, category, details,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      source: 'client',
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack
    };

    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(logEntry);
    }

    this.queue.push(logEntry);

    if (level === LogLevel.CRITICAL || this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flushLogs();
    }
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
    switch (entry.level) {
      case LogLevel.DEBUG: console.debug(prefix, entry.message, entry.details); break;
      case LogLevel.INFO: console.info(prefix, entry.message, entry.details); break;
      case LogLevel.WARN: console.warn(prefix, entry.message, entry.details); break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(prefix, entry.message, entry.details);
        if (entry.stack) console.error('Stack trace:', entry.stack);
        break;
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.queue.length === 0 || this.isFlushPending) return;

    this.isFlushPending = true;
    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      const dbRows = logsToSend.map(entry => ({
        level: entry.level,
        message: entry.message,
        category: entry.category,
        details: (entry.details ?? null) as Json | null,
        userid: entry.userId ?? null,
        sessionid: entry.sessionId ?? null,
        timestamp: entry.timestamp,
        source: entry.source,
        useragent: entry.userAgent ?? null,
        url: entry.url ?? null,
        stack: entry.stack ?? null,
      }));
      const { error } = await supabase.from('system_logs').insert(dbRows);
      if (error) {
        console.error('發送日誌失敗:', error);
        this.queue.unshift(...logsToSend);
      }
    } catch (error: unknown) {
      console.error('日誌發送異常:', error);
      this.queue.unshift(...logsToSend);
    } finally {
      this.isFlushPending = false;
    }
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      if (this.queue.length > 0) this.flushLogs();
    }, this.FLUSH_INTERVAL);
  }

  private setupUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      // Flush pending logs to Supabase on page unload
      // sendBeacon to /api/logs is not used (endpoint doesn't exist)
      // Instead, attempt a synchronous flush via the existing flushLogs mechanism
      if (this.queue.length > 0) {
        console.debug('[Logger] Flushing', this.queue.length, 'pending logs on unload');
        this.flushLogs().catch(() => {});
      }
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async queryLogs(filter: LogFilter = {}): Promise<LogEntry[]> {
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filter.level) query = query.eq('level', filter.level);
      if (filter.category) query = query.eq('category', filter.category);
      if (filter.userId) query = query.eq('userid', filter.userId);
      if (filter.startDate) query = query.gte('timestamp', filter.startDate);
      if (filter.endDate) query = query.lte('timestamp', filter.endDate);
      if (filter.limit) query = query.limit(filter.limit);

      const { data, error } = await query;

      if (error) {
        console.error('查詢日誌失敗:', error);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        level: (row.level as LogLevel) ?? LogLevel.INFO,
        message: row.message ?? '',
        category: row.category ?? 'general',
        details: (row.details && typeof row.details === 'object' && !Array.isArray(row.details)) ? row.details as LogDetails : undefined,
        userId: row.userid ?? undefined,
        sessionId: row.sessionid ?? undefined,
        timestamp: row.timestamp ?? new Date().toISOString(),
        source: (row.source as 'client' | 'server') ?? 'client',
        userAgent: row.useragent ?? undefined,
        url: row.url ?? undefined,
        stack: row.stack ?? undefined,
      }));
    } catch (error: unknown) {
      console.error('日誌查詢異常:', error);
      return [];
    }
  }

  static async cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const { error } = await supabase.from('system_logs').delete().lt('timestamp', cutoffDate.toISOString());
      if (error) console.error('清理舊日誌失敗:', error);
    } catch (error: unknown) {
      console.error('日誌清理異常:', error);
    }
  }
}

export const logger = LoggerService.getInstance();

export const logDebug = (message: string, category?: string, details?: LogDetails) => 
  logger.debug(message, category, details);

export const logInfo = (message: string, category?: string, details?: LogDetails) => 
  logger.info(message, category, details);

export const logWarn = (message: string, category?: string, details?: LogDetails) => 
  logger.warn(message, category, details);

export const logError = (message: string, category?: string, details?: LogDetails, error?: Error) => 
  logger.error(message, category, details, error);

export const logCritical = (message: string, category?: string, details?: LogDetails, error?: Error) => 
  logger.critical(message, category, details, error);

export const logUserAction = (action: string, details?: LogDetails) => 
  logger.logUserAction(action, details);

export const logPerformance = (metric: string, value: number, unit?: string) => 
  logger.logPerformance(metric, value, unit);

export const logApiCall = (method: string, url: string, status: number, duration: number, details?: LogDetails) => 
  logger.logApiCall(method, url, status, duration, details);

export default logger;
