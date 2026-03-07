/**
 * 病理警示區塊元件
 * Pathology Alert Section Component
 * 在專家報告頁面最上方顯示病理警示
 */

import { AlertTriangle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { 
  PathologyAlert, 
  PathologyAlertLevel,
  getAlertLevelBgClass 
} from '@/lib/screening/pathologyScreening';
import { useLanguage } from '@/contexts/LanguageContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PathologyAlertSectionProps {
  alerts: PathologyAlert[];
  showAll?: boolean;
}

export const PathologyAlertSection = ({ alerts, showAll = false }: PathologyAlertSectionProps) => {
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(showAll);
  
  if (alerts.length === 0) {
    return null;
  }
  
  const isCN = language === 'zh-CN';
  
  // 分離 CRITICAL 和其他警示
  const criticalAlerts = alerts.filter(a => a.level === 'CRITICAL');
  const otherAlerts = alerts.filter(a => a.level !== 'CRITICAL');
  
  // 決定顯示哪些警示
  const displayedAlerts = expanded 
    ? alerts 
    : [...criticalAlerts, ...otherAlerts.slice(0, 2)];
  const hasMore = !expanded && alerts.length > displayedAlerts.length;
  
  const getIcon = (level: PathologyAlertLevel) => {
    switch (level) {
      case 'CRITICAL':
        return <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />;
      case 'WARNING':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'INFO':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getLevelLabel = (level: PathologyAlertLevel) => {
    const labels = {
      CRITICAL: isCN ? '危急' : '危急',
      WARNING: isCN ? '警告' : '警告',
      INFO: isCN ? '提示' : '提示',
    };
    return labels[level];
  };
  
  const getUrgencyLabel = (urgency: PathologyAlert['urgency']) => {
    const labels = {
      immediate: isCN ? '立即' : '立即',
      urgent: isCN ? '緊急' : '緊急',
      routine: isCN ? '常規' : '常規',
    };
    return labels[urgency];
  };

  return (
    <div className="space-y-3">
      {/* 主標題 - 只有 CRITICAL 時顯示 */}
      {criticalAlerts.length > 0 && (
        <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 animate-pulse flex-shrink-0" />
          <div>
            <p className="font-bold text-lg">
              {isCN ? '⚠️ 需排除病理因素' : '⚠️ 需排除病理因素'}
            </p>
            <p className="text-sm opacity-90">
              {isCN 
                ? '發現以下需要注意的臨床警示，建議轉診進一步評估' 
                : '發現以下需要注意的臨床警示，建議轉診進一步評估'}
            </p>
          </div>
        </div>
      )}
      
      {/* 警示列表 */}
      <div className="space-y-2">
        {displayedAlerts.map((alert) => (
          <Alert 
            key={alert.id} 
            className={`${getAlertLevelBgClass(alert.level)} border-2`}
          >
            <div className="flex items-start gap-3">
              {getIcon(alert.level)}
              <div className="flex-1 min-w-0">
                <AlertTitle className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">
                    {isCN ? (alert.titleCN || alert.title) : alert.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    alert.level === 'CRITICAL' 
                      ? 'bg-destructive text-destructive-foreground' 
                      : alert.level === 'WARNING'
                      ? 'bg-amber-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}>
                    {getLevelLabel(alert.level)}
                  </span>
                  {alert.requiresReferral && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500 text-white">
                      {isCN ? '需轉診' : '需轉診'}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {getUrgencyLabel(alert.urgency)}
                  </span>
                </AlertTitle>
                <AlertDescription className="mt-1 text-sm">
                  <p className="text-foreground/80">
                    {isCN ? (alert.descriptionCN || alert.description) : alert.description}
                  </p>
                  <p className="mt-2 text-foreground font-medium flex items-start gap-1">
                    <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {isCN ? (alert.recommendationCN || alert.recommendation) : alert.recommendation}
                    </span>
                  </p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </div>
      
      {/* 展開/收起按鈕 */}
      {hasMore && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(true)}
          className="w-full text-muted-foreground"
        >
          {isCN 
            ? `顯示其餘 ${alerts.length - displayedAlerts.length} 項警示` 
            : `顯示其餘 ${alerts.length - displayedAlerts.length} 項警示`}
        </Button>
      )}
      
      {expanded && alerts.length > 3 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(false)}
          className="w-full text-muted-foreground"
        >
          {isCN ? '收起' : '收起'}
        </Button>
      )}
    </div>
  );
};
