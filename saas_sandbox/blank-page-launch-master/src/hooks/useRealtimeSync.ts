import { useState, useEffect, useCallback, useRef } from 'react';
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
  onUpdate?: (payload: Record<string, unknown>) => void;
  onInsert?: (payload: Record<string, unknown>) => void;
  onDelete?: (payload: Record<string, unknown>) => void;
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

  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef({ onUpdate, onInsert, onDelete });

  // Keep callbacks ref in sync without causing re-renders
  useEffect(() => {
    callbacksRef.current = { onUpdate, onInsert, onDelete };
  }, [onUpdate, onInsert, onDelete]);

  const updateStatus = useCallback((updates: Partial<SyncStatus>) => {
    setStatus(prev => ({ ...prev, ...updates }));
  }, []);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    updateStatus({ isConnected: false, error: null });
  }, [updateStatus]);

  const connect = useCallback(() => {
    // Clean up existing channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
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
          if (process.env.NODE_ENV !== 'production') {
            console.log('Realtime update:', payload);
          }
          
          updateStatus({ lastSync: new Date(), error: null });

          switch (payload.eventType) {
            case 'UPDATE':
              callbacksRef.current.onUpdate?.(payload);
              break;
            case 'INSERT':
              callbacksRef.current.onInsert?.(payload);
              break;
            case 'DELETE':
              callbacksRef.current.onDelete?.(payload);
              break;
          }
        }
      )
      .subscribe((subStatus) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Realtime subscription status:', subStatus);
        }
        
        if (subStatus === 'SUBSCRIBED') {
          updateStatus({ isConnected: true, error: null });
        } else if (subStatus === 'CHANNEL_ERROR') {
          updateStatus({ isConnected: false, error: 'Channel connection error' });
          if (autoReconnect) {
            setTimeout(connect, 5000);
          }
        } else if (subStatus === 'TIMED_OUT') {
          updateStatus({ isConnected: false, error: 'Connection timed out' });
          if (autoReconnect) {
            setTimeout(connect, 3000);
          }
        }
      });

    channelRef.current = newChannel;
  }, [table, filter, autoReconnect, updateStatus]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  const syncPendingChanges = useCallback(async () => {
    try {
      updateStatus({ pendingChanges: 0, lastSync: new Date(), error: null });
      return true;
    } catch (error) {
      console.error('Error syncing pending changes:', error);
      updateStatus({
        error: error instanceof Error ? error.message : 'Sync failed'
      });
      return false;
    }
  }, [updateStatus]);

  const checkConnection = useCallback(async () => {
    try {
      const { error } = await supabase.from(table as 'stores').select('count').limit(1);
      if (!error) {
        updateStatus({ error: null, lastSync: new Date() });
        return true;
      } else {
        updateStatus({ error: 'Database connection error' });
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

  // Periodic connection check
  // Use ref to avoid interval resetting on every checkConnection reference change
  const checkConnectionRef = useRef(checkConnection);
  useEffect(() => { checkConnectionRef.current = checkConnection; }, [checkConnection]);

  useEffect(() => {
    const interval = setInterval(() => checkConnectionRef.current(), 30000);
    return () => clearInterval(interval);
  }, []);

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
