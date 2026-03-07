import { CalculationResult } from '@/lib/calculateLogic';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface QuickSummaryProps {
  result: CalculationResult;
  alerts: string[];
  diagnosticClassification?: string; // 來自資料庫的診斷分類
}

// 診斷代碼對應的顯示名稱
const diagnosisLabels: Record<string, { tw: string; cn: string; en: string }> = {
  NORMAL: { tw: '雙眼視覺功能正常', cn: '双眼视觉功能正常', en: 'Normal Binocular Vision' },
  CI: { tw: '集合不足', cn: '集合不足', en: 'Convergence Insufficiency' },
  CE: { tw: '集合過度', cn: '集合过度', en: 'Convergence Excess' },
  AI: { tw: '調節不足', cn: '调节不足', en: 'Accommodative Insufficiency' },
  AE: { tw: '調節過度', cn: '调节过度', en: 'Accommodative Excess' },
  AIFI: { tw: '調節靈敏度不足', cn: '调节灵敏度不足', en: 'Accommodative Infacility' },
  BX: { tw: '基本型外斜', cn: '基本型外斜', en: 'Basic Exophoria' },
  BE: { tw: '基本型內斜', cn: '基本型内斜', en: 'Basic Esophoria' },
  DE: { tw: '開散過度', cn: '散开过度', en: 'Divergence Excess' },
  DI: { tw: '開散不足', cn: '散开不足', en: 'Divergence Insufficiency' },
  'Pseudo-CI': { tw: '假性集合不足', cn: '假性集合不足', en: 'Pseudo Convergence Insufficiency' },
};

export const QuickSummary = ({ result, alerts, diagnosticClassification }: QuickSummaryProps) => {
  const { t, language } = useLanguage();
  const [alertsOpen, setAlertsOpen] = useState(false);

  // 解析診斷分類並顯示
  const getDiagnosisLabel = () => {
    if (!diagnosticClassification) return null;
    
    const codes = diagnosticClassification.split('+');
    const labels = codes.map(code => {
      const label = diagnosisLabels[code];
      return label ? (language === 'en' ? label.en : language === 'zh-TW' ? label.tw : label.cn) : code;
    });
    
    return labels.join(' / ');
  };

  const classificationLabel = getDiagnosisLabel();

  const priorityConfig = {
    Treat: { 
      label: t('priorityTreat'), 
      bgClass: 'bg-destructive/10 text-destructive',
      icon: TrendingDown,
      emoji: '🔴'
    },
    Monitor: { 
      label: t('priorityMonitor'), 
      bgClass: 'bg-warning/10 text-warning',
      icon: Minus,
      emoji: '🟡'
    },
    'Refer/VT': { 
      label: t('priorityGood'), 
      bgClass: 'bg-success/10 text-success',
      icon: TrendingUp,
      emoji: '🟢'
    },
  };

  const config = priorityConfig[result.priority as keyof typeof priorityConfig] || priorityConfig['Refer/VT'];

  const getSummaryText = () => {
    const score = result.healthScore;
    if (score >= 90) return t('summaryExcellent');
    if (score >= 70) return t('summaryGood');
    if (score >= 50) return t('summaryModerate');
    return t('summaryNeedsAttention');
  };

  const getScoreColor = () => {
    const score = result.healthScore;
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="app-card">
      {/* Score Section - Hero style */}
      <div className="flex items-center gap-4">
        {/* Large Score Circle */}
        <div className={cn(
          "w-20 h-20 rounded-2xl flex flex-col items-center justify-center",
          "bg-gradient-to-br from-primary/10 to-primary/5"
        )}>
          <span className={cn("text-3xl font-bold", getScoreColor())}>
            {result.healthScore}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
            / 100
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {t('healthScoreLabel')}
          </div>
          <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", config.bgClass)}>
            <span>{config.emoji}</span>
            <span>{config.label}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {getSummaryText()}
          </p>
        </div>
      </div>

      {/* Diagnosis - simplified */}
      <div className="mt-4 pt-4 border-t border-border">
        {/* 優先顯示資料庫診斷分類 */}
        {classificationLabel && (
          <div className="mb-2 px-2 py-1 bg-primary/10 rounded-md inline-block">
            <span className="text-sm font-medium text-primary">{classificationLabel}</span>
          </div>
        )}
        <h2 className="text-lg font-bold text-foreground leading-snug">
          {t(result.diag.nameKey as any)}
        </h2>
        {result.diag.secondaryKey && (
          <span className="text-muted-foreground text-sm">
            {t(result.diag.secondaryKey as any)}
          </span>
        )}
      </div>

      {/* Alerts - collapsible with softer colors */}
      {alerts.length > 0 && (
        <Collapsible open={alertsOpen} onOpenChange={setAlertsOpen}>
          <CollapsibleTrigger className="w-full mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                <span className="text-sm font-medium text-warning">
                  {language === 'en' ? `${alerts.length} item(s) need attention` : language === 'zh-CN' ? `${alerts.length} 项建议优先关注` : `${alerts.length} 項建議優先關注`}
                </span>
              </div>
              <ChevronDown 
                size={16} 
                className={cn(
                  "text-muted-foreground transition-transform duration-200",
                  alertsOpen && "rotate-180"
                )} 
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-accordion-down">
            <ul className="mt-3 space-y-2">
              {alerts.map((alert, i) => (
                <li key={i} className="text-sm text-warning/90 leading-relaxed flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-warning/50 flex-shrink-0" />
                  <span>{alert}</span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
