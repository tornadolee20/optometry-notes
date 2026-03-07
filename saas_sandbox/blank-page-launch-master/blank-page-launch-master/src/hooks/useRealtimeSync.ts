import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  error: string | null;
  pendingChanges: number;
}

interface UseRealtimeSyncOptions {
  table: string;
  filter?: string;
  onUpdate?: (payload: any) => void;
  onInsert?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  autoReconnect?: boolean;
}

export const useRealtimeSync = ({
  table,
  filter,
  onUpdate,
  onInsert,
  onDelete,
  autoReconnect = true
}: UseRealtimeSyncOptions) => {
  const [status, setStatus] = useState<SyncStatus>({
    isConnected: false,
    lastSync: null,
    error: null,
    pendingChanges: 0
  });

  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const updateStatus = useCallback((updates: Partial<SyncStatus>) => {
    setStatus(prev => ({ ...prev, ...updates }));
  }, []);

  const connect = useCallback(() => {
    if (channel) {
      channel.unsubscribe();
    }

    const channelName = `realtime-${table}${filter ? `-${filter}` : ''}`;
    
    const newChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          updateStatus({
            lastSync: new Date(),
            error: null
          });

          switch (payload.eventType) {
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          updateStatus({
            isConnected: true,
            error: null
          });
        } else if (status === 'CHANNEL_ERROR') {
          updateStatus({
            isConnected: false,
            error: 'Channel connection error'
          });
          
          if (autoReconnect) {
            setTimeout(connect, 5000);
          }
        } else if (status === 'TIMED_OUT') {
          updateStatus({
            isConnected: false,
            error: 'Connection timed out'
          });
          
          if (autoReconnect) {
            setTimeout(connect, 3000);
          }
        }
      });

    setChannel(newChannel);
  }, [table, filter, onUpdate, onInsert, onDelete, autoReconnect, updateStatus]);

  const disconnect = useCallback(() => {
    if (channel) {
      channel.unsubscribe();
      setChannel(null);
    }
    updateStatus({
      isConnected: false,
      error: null
    });
  }, [channel, updateStatus]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  // 同步本地待處理的變更
  const syncPendingChanges = useCallback(async () => {
    try {
      // 這裡可以實現本地待處理變更的同步邏輯
      // 例如：從本地存儲獲取待處理的變更並上傳到服務器
      
      updateStatus({
        pendingChanges: 0,
        lastSync: new Date(),
        error: null
      });
      
      return true;
    } catch (error) {
      console.error('Error syncing pending changes:', error);
      updateStatus({
        error: error instanceof Error ? error.message : 'Sync failed'
      });
      return false;
    }
  }, [updateStatus]);

  // 檢查連接狀態
  const checkConnection = useCallback(async () => {
    try {
      // 簡單的連接測試
      const { error } = await supabase.from(table as any).select('count').limit(1);
      
      if (!error) {
        updateStatus({
          error: null,
          lastSync: new Date()
        });
        return true;
      } else {
        updateStatus({
          error: 'Database connection error'
        });
        return false;
      }
    } catch (error) {
      updateStatus({
        error: error instanceof Error ? error.message : 'Connection check failed'
      });
      return false;
    }
  }, [table, updateStatus]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // 定期檢查連接狀態
  useEffect(() => {
    const interval = setInterval(checkConnection, 30000); // 每30秒檢查一次

    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    status,
    connect,
    disconnect,
    reconnect,
    syncPendingChanges,
    checkConnection,
    isConnected: status.isConnected,
    lastSync: status.lastSync,
    error: status.error,
    pendingChanges: status.pendingChanges
  };
};