import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminButton } from '@/components/admin/AdminButton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  FileText, Search, RotateCcw, Download,
  CheckCircle, AlertTriangle, XCircle, Info,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  activity_type: string;
  description: string | null;
  entity_type: string;
  entity_id: string;
  performed_by: string | null;
  created_at: string | null;
  metadata: Record<string, unknown> | null;
}

const activityTypeMap: Record<string, string> = {
  grant_free_subscription: '贈送免費訂閱',
  subscription_activated: '訂閱已啟用',
  subscription_created: '建立訂閱',
  subscription_expired: '訂閱到期',
  subscription_renewed: '訂閱續約',
  subscription_cancelled: '取消訂閱',
  subscriptions_expired: '批次訂閱到期',
  subscription_granted: '管理員授予訂閱',
  store_created: '新增店家',
  store_updated: '更新店家',
  store_deleted: '刪除店家',
  store_suspended: '停用店家',
  user_login: '用戶登入',
  user_registered: '用戶註冊',
  payment_received: '收到付款',
  bank_transfer_approved: '轉帳核准',
  bank_transfer_submitted: '提交轉帳',
  keyword_updated: '更新關鍵字',
  settings_updated: '更新設定',
};

const entityTypeMap: Record<string, string> = {
  subscription: '訂閱', store: '店家', user: '用戶',
  payment: '付款', keyword: '關鍵字', system: '系統', settings: '設定',
};

const translateActivityType = (type: string) => activityTypeMap[type] || type.replace(/_/g, ' ');
const translateEntityType = (type: string) => entityTypeMap[type] || type;
const translateDescription = (desc: string) => {
  if (!desc) return '';
  return desc
    .replace('Subscription extended via bank transfer approval', '透過轉帳核准延長訂閱')
    .replace('Subscription activated', '訂閱已啟用')
    .replace('Free subscription granted', '已贈送免費訂閱')
    .replace('Admin granted free subscription', '管理員授予免費訂閱')
    .replace('Store created', '店家已建立')
    .replace('Store updated', '店家已更新');
};

const getSeverityIcon = (type: string) => {
  if (type.includes('delete') || type.includes('error')) return <XCircle className="h-4 w-4 text-destructive" />;
  if (type.includes('warning') || type.includes('suspend')) return <AlertTriangle className="h-4 w-4 text-primary" />;
  if (type.includes('create') || type.includes('success') || type.includes('activated') || type.includes('grant')) return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  return <Info className="h-4 w-4 text-muted-foreground" />;
};

export const ActivityLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs').select('*')
        .order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      setLogs((data || []) as ActivityLog[]);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({ variant: 'destructive', title: '錯誤', description: '無法載入活動日誌' });
    } finally { setIsLoading(false); }
  };

  const filteredLogs = logs.filter(log =>
    !searchTerm ||
    log.activity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportLogs = () => {
    const csvContent = [
      ['時間', '類型', '描述', '實體類型', '實體ID'],
      ...filteredLogs.map(log => [
        new Date(log.created_at || '').toLocaleString('zh-TW'),
        log.activity_type, log.description || '', log.entity_type, log.entity_id
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜尋日誌..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
        </div>
        <AdminButton variant="outline" size="sm" onClick={fetchLogs} icon={RotateCcw}>刷新</AdminButton>
        <AdminButton variant="outline" size="sm" onClick={exportLogs} icon={Download}>匯出</AdminButton>
      </div>

      <p className="text-xs text-muted-foreground">共 {filteredLogs.length} 筆記錄</p>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">尚無活動日誌記錄</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/30 hover:border-border transition-all duration-200">
              <div className="mt-0.5 flex-shrink-0">{getSeverityIcon(log.activity_type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-sm text-foreground">{translateActivityType(log.activity_type)}</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5">{translateEntityType(log.entity_type)}</Badge>
                </div>
                {log.description && <p className="text-xs text-muted-foreground line-clamp-1">{translateDescription(log.description)}</p>}
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {new Date(log.created_at || '').toLocaleString('zh-TW')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
