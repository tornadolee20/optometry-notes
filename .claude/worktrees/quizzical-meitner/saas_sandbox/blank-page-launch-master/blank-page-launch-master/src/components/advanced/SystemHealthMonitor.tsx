import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Database, 
  Server, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SystemStatus {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
  details?: string;
}

interface SystemMetrics {
  cpu: { usage: number; trend: 'up' | 'down' | 'stable' };
  memory: { usage: number; total: number; trend: 'up' | 'down' | 'stable' };
  database: { connections: number; maxConnections: number; queryTime: number };
  api: { requestsPerMinute: number; errorRate: number; avgResponseTime: number };
  storage: { used: number; total: number; trend: 'up' | 'down' | 'stable' };
}

export const SystemHealthMonitor: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 模擬系統健康狀態
  const generateMockStatus = (): SystemStatus[] => {
    return [
      {
        component: 'Web Server',
        status: 'healthy',
        responseTime: Math.random() * 200 + 50,
        uptime: 99.9,
        lastCheck: new Date(),
        details: 'All endpoints responding normally'
      },
      {
        component: 'Database',
        status: Math.random() > 0.8 ? 'warning' : 'healthy',
        responseTime: Math.random() * 100 + 20,
        uptime: 99.5,
        lastCheck: new Date(),
        details: 'Connection pool healthy'
      },
      {
        component: 'Authentication Service',
        status: 'healthy',
        responseTime: Math.random() * 150 + 30,
        uptime: 99.8,
        lastCheck: new Date(),
        details: 'JWT validation working'
      },
      {
        component: 'File Storage',
        status: Math.random() > 0.9 ? 'warning' : 'healthy',
        responseTime: Math.random() * 300 + 100,
        uptime: 99.7,
        lastCheck: new Date(),
        details: 'Storage capacity normal'
      },
      {
        component: 'Email Service',
        status: Math.random() > 0.85 ? 'critical' : 'healthy',
        responseTime: Math.random() * 500 + 200,
        uptime: 99.2,
        lastCheck: new Date(),
        details: 'SMTP gateway operational'
      }
    ];
  };

  // 模擬系統指標
  const generateMockMetrics = (): SystemMetrics => {
    return {
      cpu: {
        usage: Math.random() * 80 + 10,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
      },
      memory: {
        usage: Math.random() * 70 + 20,
        total: 16,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
      },
      database: {
        connections: Math.floor(Math.random() * 50 + 10),
        maxConnections: 100,
        queryTime: Math.random() * 50 + 5
      },
      api: {
        requestsPerMinute: Math.floor(Math.random() * 500 + 100),
        errorRate: Math.random() * 5,
        avgResponseTime: Math.random() * 200 + 100
      },
      storage: {
        used: Math.random() * 80 + 10,
        total: 1000,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
      }
    };
  };

  const refreshStatus = async () => {
    setIsRefreshing(true);
    
    // 模擬 API 呼叫延遲
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSystemStatus(generateMockStatus());
    setMetrics(generateMockMetrics());
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshStatus();
    
    // 每30秒自動更新
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />;
      case 'stable':
        return <div className="h-3 w-3 bg-gray-300 rounded-full" />;
    }
  };

  const overallStatus = systemStatus.length > 0 ? 
    systemStatus.some(s => s.status === 'critical') ? 'critical' :
    systemStatus.some(s => s.status === 'warning') ? 'warning' : 'healthy' : 'healthy';

  return (
    <div className="space-y-6">
      {/* 系統總覽 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">系統健康狀態</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(overallStatus)}>
              {getStatusIcon(overallStatus)}
              <span className="ml-1">
                {overallStatus === 'healthy' ? '正常' : 
                 overallStatus === 'warning' ? '警告' : '異常'}
              </span>
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStatus}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            最後更新：{lastUpdate.toLocaleString('zh-TW')}
          </div>
          
          {overallStatus !== 'healthy' && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                系統檢測到 {systemStatus.filter(s => s.status !== 'healthy').length} 個問題需要關注
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 服務狀態 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemStatus.map((service, index) => (
          <motion.div
            key={service.component}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {service.component}
                  </CardTitle>
                  {getStatusIcon(service.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">回應時間</span>
                  <span className="font-mono">{service.responseTime.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">正常運行時間</span>
                  <span className="font-mono">{service.uptime}%</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {service.details}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 系統指標 */}
      {metrics && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* CPU 使用率 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">CPU 使用率</CardTitle>
                {getTrendIcon(metrics.cpu.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{metrics.cpu.usage.toFixed(1)}%</span>
                <Server className="h-4 w-4 text-gray-500" />
              </div>
              <Progress value={metrics.cpu.usage} className="h-2" />
            </CardContent>
          </Card>

          {/* 記憶體使用 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">記憶體使用</CardTitle>
                {getTrendIcon(metrics.memory.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">
                  {(metrics.memory.usage * metrics.memory.total / 100).toFixed(1)}GB
                </span>
                <span className="text-xs text-gray-500">/ {metrics.memory.total}GB</span>
              </div>
              <Progress value={metrics.memory.usage} className="h-2" />
            </CardContent>
          </Card>

          {/* 資料庫連線 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">資料庫</CardTitle>
                <Database className="h-4 w-4 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>連線數</span>
                  <span>{metrics.database.connections}/{metrics.database.maxConnections}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>平均查詢時間</span>
                  <span>{metrics.database.queryTime.toFixed(1)}ms</span>
                </div>
                <Progress 
                  value={(metrics.database.connections / metrics.database.maxConnections) * 100} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>

          {/* API 效能 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">API 效能</CardTitle>
                <Wifi className="h-4 w-4 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>請求/分鐘</span>
                  <span>{metrics.api.requestsPerMinute}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>錯誤率</span>
                  <span className={metrics.api.errorRate > 5 ? 'text-red-500' : ''}>
                    {metrics.api.errorRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>平均回應時間</span>
                  <span>{metrics.api.avgResponseTime.toFixed(0)}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 儲存空間 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">儲存空間</CardTitle>
                {getTrendIcon(metrics.storage.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">
                  {(metrics.storage.used * metrics.storage.total / 100).toFixed(0)}GB
                </span>
                <span className="text-xs text-gray-500">/ {metrics.storage.total}GB</span>
              </div>
              <Progress value={metrics.storage.used} className="h-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 警報歷史 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">最近警報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {systemStatus
              .filter(s => s.status !== 'healthy')
              .map((service, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${getStatusColor(service.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <span className="font-medium">{service.component}</span>
                    </div>
                    <span className="text-xs">
                      {service.lastCheck.toLocaleTimeString('zh-TW')}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    {service.details}
                  </div>
                </div>
              ))}
            
            {systemStatus.filter(s => s.status !== 'healthy').length === 0 && (
              <div className="text-center text-gray-500 py-4">
                目前沒有警報
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};