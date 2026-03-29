import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

import { AdminButton } from '@/components/admin/AdminButton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Search, RotateCcw, Download, Bug, ChevronDown, ChevronUp } from 'lucide-react';

type FrontendErrorLog = Tables<'frontend_error_logs'>;

export const FrontendErrorLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<FrontendErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('frontend_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching frontend error logs:', error);
      toast({ variant: 'destructive', title: '錯誤', description: '無法載入前端錯誤日誌' });
    } finally { setIsLoading(false); }
  };

  const filteredLogs = logs.filter(log =>
    !searchTerm ||
    log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.route?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.error_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportLogs = () => {
    const csvContent = [
      ['時間', '錯誤ID', '訊息', '路由', '用戶ID'],
      ...filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString('zh-TW'),
        log.error_id,
        (log.message || '').replace(/,/g, '，'),
        log.route || '',
        log.user_id || '',
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `frontend_errors_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const truncate = (str: string, max: number) =>
    str && str.length > max ? str.slice(0, max) + '…' : str;

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
          <Input placeholder="搜尋錯誤訊息、路由、ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
        </div>
        <AdminButton variant="outline" size="sm" onClick={fetchLogs} icon={RotateCcw}>刷新</AdminButton>
        <AdminButton variant="outline" size="sm" onClick={exportLogs} icon={Download}>匯出</AdminButton>
      </div>

      <p className="text-xs text-muted-foreground">共 {filteredLogs.length} 筆錯誤記錄（保留 30 天）</p>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bug className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">尚無前端錯誤記錄 🎉</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div key={log.id} className="rounded-lg border border-border/50 hover:border-border transition-all duration-200 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full flex items-start gap-3 p-3 text-left hover:bg-accent/30 transition-colors"
                >
                  <Bug className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-medium text-sm text-foreground line-clamp-1">{truncate(log.message, 80)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {log.route && <Badge variant="outline" className="text-[10px] h-4 px-1.5">{log.route}</Badge>}
                      <span className="text-[10px] text-muted-foreground/60">
                        {new Date(log.created_at).toLocaleString('zh-TW')}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2 border-t border-border/30 pt-2">
                    <DetailRow label="錯誤 ID" value={log.error_id} />
                    <DetailRow label="用戶 ID" value={log.user_id} />
                    <DetailRow label="User Agent" value={log.user_agent} />
                    {log.stack && (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Stack Trace</p>
                        <pre className="text-[10px] bg-muted/50 rounded p-2 overflow-x-auto max-h-40 whitespace-pre-wrap break-all text-foreground/80">{log.stack}</pre>
                      </div>
                    )}
                    {log.component_stack && (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Component Stack</p>
                        <pre className="text-[10px] bg-muted/50 rounded p-2 overflow-x-auto max-h-32 whitespace-pre-wrap break-all text-foreground/80">{log.component_stack}</pre>
                      </div>
                    )}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Metadata</p>
                        <pre className="text-[10px] bg-muted/50 rounded p-2 overflow-x-auto max-h-24 whitespace-pre-wrap break-all text-foreground/80">{JSON.stringify(log.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-[11px]">
      <span className="text-muted-foreground font-medium whitespace-nowrap">{label}:</span>
      <span className="text-foreground/80 break-all">{value}</span>
    </div>
  );
};
