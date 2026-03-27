import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Download,
  User,
  Store,
  Settings,
  Database,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ActivityLog {
  id: string;
  timestamp: string;
  user_email: string;
  action: string;
  resource_type: 'store' | 'subscription' | 'keyword' | 'admin' | 'system';
  resource_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  severity: 'info' | 'warning' | 'error' | 'success';
}

// 模擬活動日誌數據（在實際應用中，這些應該來自資料庫）
const generateMockLogs = (): ActivityLog[] => {
  const actions = [
    { action: '登入系統', resource_type: 'admin', severity: 'info' },
    { action: '建立店家', resource_type: 'store', severity: 'success' },
    { action: '更新訂閱狀態', resource_type: 'subscription', severity: 'success' },
    { action: '刪除關鍵字', resource_type: 'keyword', severity: 'warning' },
    { action: '修改店家資訊', resource_type: 'store', severity: 'info' },
    { action: '系統備份', resource_type: 'system', severity: 'info' },
    { action: '登入失敗', resource_type: 'admin', severity: 'error' },
    { action: '匯出數據', resource_type: 'system', severity: 'info' }
  ];

  const emails = ['admin@example.com', 'manager@example.com', 'system@system.local'];
  
  return Array.from({ length: 50 }, (_, index) => {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const baseTime = new Date();
    baseTime.setHours(baseTime.getHours() - Math.floor(Math.random() * 72));
    
    return {
      id: `log_${index + 1}`,
      timestamp: baseTime.toISOString(),
      user_email: emails[Math.floor(Math.random() * emails.length)],
      action: action.action,
      resource_type: action.resource_type as ActivityLog['resource_type'],
      resource_id: `resource_${Math.floor(Math.random() * 1000)}`,
      details: {
        target: `店家_${Math.floor(Math.random() * 100)}`,
        changes: ['狀態更新', '資料修改'][Math.floor(Math.random() * 2)]
      },
      ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: action.severity as ActivityLog['severity']
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 篩選狀態
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('24h');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, severityFilter, resourceFilter, timeFilter]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // 在實際應用中，這裡會查詢真實的活動日誌表
      // const { data, error } = await supabase
      //   .from('activity_logs')
      //   .select('*')
      //   .order('timestamp', { ascending: false })
      //   .limit(100);
      
      // 暫時使用模擬數據
      setTimeout(() => {
        const mockLogs = generateMockLogs();
        setLogs(mockLogs);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: '無法載入活動日誌'
      });
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // 時間篩選
    const now = new Date();
    let timeThreshold: Date;
    switch (timeFilter) {
      case '1h':
        timeThreshold = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeThreshold = new Date(0);
    }

    filtered = filtered.filter(log => new Date(log.timestamp) >= timeThreshold);

    // 搜尋篩選
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details?.target && log.details.target.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 嚴重程度篩選
    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    // 資源類型篩選
    if (resourceFilter !== 'all') {
      filtered = filtered.filter(log => log.resource_type === resourceFilter);
    }

    setFilteredLogs(filtered);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSeverityFilter('all');
    setResourceFilter('all');
    setTimeFilter('24h');
  };

  const exportLogs = () => {
    const csvContent = [
      ['時間', '使用者', '操作', '資源類型', '嚴重程度', 'IP地址'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString('zh-TW'),
        log.user_email,
        log.action,
        log.resource_type,
        log.severity,
        log.ip_address || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'store':
        return <Store className="h-4 w-4" />;
      case 'admin':
        return <User className="h-4 w-4" />;
      case 'system':
        return <Database className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getResourceTypeText = (resourceType: string) => {
    switch (resourceType) {
      case 'store':
        return '店家';
      case 'subscription':
        return '訂閱';
      case 'keyword':
        return '關鍵字';
      case 'admin':
        return '管理員';
      case 'system':
        return '系統';
      default:
        return '其他';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'success':
        return '成功';
      case 'warning':
        return '警告';
      case 'error':
        return '錯誤';
      default:
        return '資訊';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">活動日誌</h1>
          <p className="text-gray-600">追蹤系統內所有活動和操作記錄</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchLogs}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重新整理
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            匯出日誌
          </Button>
        </div>
      </div>

      {/* 篩選工具列 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            篩選條件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜尋操作或使用者..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="時間範圍" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">最近1小時</SelectItem>
                <SelectItem value="24h">最近24小時</SelectItem>
                <SelectItem value="7d">最近7天</SelectItem>
                <SelectItem value="30d">最近30天</SelectItem>
                <SelectItem value="all">全部</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="嚴重程度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有程度</SelectItem>
                <SelectItem value="info">資訊</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="warning">警告</SelectItem>
                <SelectItem value="error">錯誤</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="資源類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有類型</SelectItem>
                <SelectItem value="store">店家</SelectItem>
                <SelectItem value="subscription">訂閱</SelectItem>
                <SelectItem value="keyword">關鍵字</SelectItem>
                <SelectItem value="admin">管理員</SelectItem>
                <SelectItem value="system">系統</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              重設
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 統計摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{filteredLogs.length}</div>
            <div className="text-sm text-gray-600">總記錄數</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {filteredLogs.filter(log => log.severity === 'error').length}
            </div>
            <div className="text-sm text-gray-600">錯誤記錄</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredLogs.filter(log => log.severity === 'warning').length}
            </div>
            <div className="text-sm text-gray-600">警告記錄</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredLogs.filter(log => log.severity === 'success').length}
            </div>
            <div className="text-sm text-gray-600">成功記錄</div>
          </CardContent>
        </Card>
      </div>

      {/* 日誌列表 */}
      <Card>
        <CardHeader>
          <CardTitle>活動記錄</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              沒有找到符合條件的日誌記錄
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`p-2 rounded-lg ${getSeverityColor(log.severity)}`}>
                      {getSeverityIcon(log.severity)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{log.action}</span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getResourceIcon(log.resource_type)}
                        {getResourceTypeText(log.resource_type)}
                      </Badge>
                      <Badge className={getSeverityColor(log.severity)}>
                        {getSeverityText(log.severity)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{log.user_email}</span>
                      {log.details?.target && (
                        <span> • 目標: {log.details.target}</span>
                      )}
                      {log.ip_address && (
                        <span> • IP: {log.ip_address}</span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString('zh-TW')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;