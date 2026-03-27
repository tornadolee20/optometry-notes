import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Activity,
  Database,
  Zap
} from "lucide-react";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useToast } from "@/components/ui/use-toast";

interface RealtimeSyncDebuggerProps {
  table?: string;
  storeId?: string;
}

export const RealtimeSyncDebugger = ({ 
  table = "stores", 
  storeId 
}: RealtimeSyncDebuggerProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    successfulSyncs: 0,
    errors: 0,
    lastEventTime: null as Date | null
  });
  
  const { toast } = useToast();

  const addLog = (message: string, level: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('zh-TW');
    const logEntry = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [logEntry, ...prev.slice(0, 49)]); // 保留最近50條日誌
    
    if (level === 'error') {
      setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
    } else if (level === 'success') {
      setStats(prev => ({ 
        ...prev, 
        successfulSyncs: prev.successfulSyncs + 1,
        lastEventTime: new Date()
      }));
    }
  };

  const {
    status,
    connect,
    disconnect,
    reconnect,
    syncPendingChanges,
    checkConnection
  } = useRealtimeSync({
    table,
    filter: storeId ? `store_id=eq.${storeId}` : undefined,
    onUpdate: (payload) => {
      addLog(`UPDATE事件: ${JSON.stringify(payload.new)}`, 'success');
      setStats(prev => ({ 
        ...prev, 
        totalEvents: prev.totalEvents + 1,
        lastEventTime: new Date()
      }));
    },
    onInsert: (payload) => {
      addLog(`INSERT事件: ${JSON.stringify(payload.new)}`, 'success');
      setStats(prev => ({ 
        ...prev, 
        totalEvents: prev.totalEvents + 1,
        lastEventTime: new Date()
      }));
    },
    onDelete: (payload) => {
      addLog(`DELETE事件: ${JSON.stringify(payload.old)}`, 'success');
      setStats(prev => ({ 
        ...prev, 
        totalEvents: prev.totalEvents + 1,
        lastEventTime: new Date()
      }));
    },
    autoReconnect: true
  });

  useEffect(() => {
    if (isEnabled) {
      addLog('啟用即時同步調試器');
      connect();
    } else {
      addLog('停用即時同步調試器');
      disconnect();
    }
  }, [isEnabled, connect, disconnect]);

  useEffect(() => {
    if (status.error) {
      addLog(`錯誤: ${status.error}`, 'error');
    }
  }, [status.error]);

  useEffect(() => {
    if (status.isConnected) {
      addLog('✅ 已連接到即時同步服務', 'success');
    } else {
      addLog('❌ 與即時同步服務斷開連接', 'error');
    }
  }, [status.isConnected]);

  const handleTestConnection = async () => {
    addLog('測試連接中...');
    const isConnected = await checkConnection();
    if (isConnected) {
      addLog('✅ 連接測試成功', 'success');
      toast({
        title: "連接正常",
        description: "數據庫連接測試成功",
      });
    } else {
      addLog('❌ 連接測試失敗', 'error');
      toast({
        title: "連接失敗",
        description: "數據庫連接測試失敗",
        variant: "destructive",
      });
    }
  };

  const handleSyncPending = async () => {
    addLog('同步待處理變更中...');
    const success = await syncPendingChanges();
    if (success) {
      addLog('✅ 待處理變更同步成功', 'success');
      toast({
        title: "同步完成",
        description: "所有待處理的變更已同步",
      });
    } else {
      addLog('❌ 待處理變更同步失敗', 'error');
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
    setStats({
      totalEvents: 0,
      successfulSyncs: 0,
      errors: 0,
      lastEventTime: null
    });
    addLog('調試日誌已清除');
  };

  const getStatusColor = () => {
    if (!isEnabled) return 'text-gray-500';
    if (status.error) return 'text-red-500';
    if (status.isConnected) return 'text-green-500';
    return 'text-yellow-500';
  };

  const getStatusIcon = () => {
    if (!isEnabled) return <WifiOff className="w-4 h-4" />;
    if (status.error) return <AlertCircle className="w-4 h-4" />;
    if (status.isConnected) return <Wifi className="w-4 h-4" />;
    return <RefreshCw className="w-4 h-4 animate-spin" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              即時同步調試器
            </CardTitle>
            <CardDescription>
              監控和調試即時數據同步狀態
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="debug-mode"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
            <Label htmlFor="debug-mode">啟用調試</Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 狀態指示器 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className={getStatusColor()}>
              {getStatusIcon()}
            </div>
            <div>
              <div className="text-sm font-medium">連接狀態</div>
              <div className="text-xs text-gray-500">
                {!isEnabled ? '未啟用' : status.isConnected ? '已連接' : '斷開'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">監控表格</div>
              <div className="text-xs text-gray-500">{table}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <div>
              <div className="text-sm font-medium">總事件</div>
              <div className="text-xs text-gray-500">{stats.totalEvents}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <div>
              <div className="text-sm font-medium">成功同步</div>
              <div className="text-xs text-gray-500">{stats.successfulSyncs}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* 控制按鈕 */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={!isEnabled}
          >
            <Database className="w-4 h-4 mr-2" />
            測試連接
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={reconnect}
            disabled={!isEnabled}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重新連接
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncPending}
            disabled={!isEnabled}
          >
            <Clock className="w-4 h-4 mr-2" />
            同步待處理 ({status.pendingChanges})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearLogs}
          >
            清除日誌
          </Button>
        </div>

        {/* 統計信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-3">
            <div className="text-lg font-bold text-blue-600">{stats.totalEvents}</div>
            <div className="text-xs text-gray-500">總事件數</div>
          </Card>
          <Card className="p-3">
            <div className="text-lg font-bold text-green-600">{stats.successfulSyncs}</div>
            <div className="text-xs text-gray-500">成功同步</div>
          </Card>
          <Card className="p-3">
            <div className="text-lg font-bold text-red-600">{stats.errors}</div>
            <div className="text-xs text-gray-500">錯誤次數</div>
          </Card>
          <Card className="p-3">
            <div className="text-lg font-bold text-purple-600">
              {status.pendingChanges}
            </div>
            <div className="text-xs text-gray-500">待處理變更</div>
          </Card>
        </div>

        {/* 最近活動 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">調試日誌</h4>
            <Badge variant="outline">
              {debugLogs.length} 條記錄
            </Badge>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
            {debugLogs.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                暫無調試日誌
              </div>
            ) : (
              <div className="space-y-1">
                {debugLogs.map((log, index) => (
                  <div
                    key={index}
                    className="text-xs font-mono text-gray-700 break-all"
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 最後同步時間 */}
        {status.lastSync && (
          <div className="text-xs text-gray-500 text-center">
            最後同步: {status.lastSync.toLocaleString('zh-TW')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};