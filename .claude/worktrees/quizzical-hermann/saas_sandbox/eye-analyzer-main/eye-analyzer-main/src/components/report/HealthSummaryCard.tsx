import { cn } from '@/lib/utils';
import { CalculationResult } from '@/lib/calculateLogic';
import { useLanguage } from '@/contexts/LanguageContext';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ViewMode } from '../ViewModeSelector';

interface HealthSummaryCardProps {
  result: CalculationResult;
  viewMode: ViewMode;
  diagnosticClassification?: string; // 新增：來自資料庫的診斷分類
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

export const HealthSummaryCard = ({ result, viewMode, diagnosticClassification }: HealthSummaryCardProps) => {
  const { t, language } = useLanguage();

  const priorityConfig = {
    Treat: { 
      label: t('priorityTreat'), 
      bgClass: 'status-badge-error',
      icon: TrendingDown,
      emoji: '🔴'
    },
    Monitor: { 
      label: t('priorityMonitor'), 
      bgClass: 'status-badge-warning',
      icon: Minus,
      emoji: '🟡'
    },
    'Refer/VT': { 
      label: t('priorityGood'), 
      bgClass: 'status-badge-success',
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

  return (
    <div className="app-card">
      {/* Score Section - Hero style */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
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
          <div className="section-title">{t('healthScoreLabel')}</div>
          <div className={cn("inline-flex", config.bgClass)}>
            <span>{config.emoji}</span>
            <span>{config.label}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {getSummaryText()}
          </p>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={14} className="text-primary" />
          <span className="section-title mb-0">{t('diagnosisResult')}</span>
        </div>
        
        {/* 優先顯示資料庫診斷分類 */}
        {classificationLabel && (
          <div className="mb-2 px-2 py-1 bg-primary/10 rounded-md inline-block">
            <span className="text-sm font-medium text-primary">{classificationLabel}</span>
          </div>
        )}
        
        <h2 className="text-lg font-bold text-foreground leading-snug">
          {t(result.diag.nameKey as any)}
          {result.diag.secondaryKey && (
            <span className="text-muted-foreground font-medium text-base block mt-0.5">
              {t(result.diag.secondaryKey as any)}
            </span>
          )}
        </h2>
      </div>

      {/* Pro/Expert: Additional metrics */}
      {(viewMode === 'pro' || viewMode === 'expert') && (
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
          <div className="list-item flex-col items-start justify-center">
            <div className="text-xs text-muted-foreground">{t('acaRatioLabel')}</div>
            <div className="text-xl font-bold text-foreground">
              {result.aca.val}<span className="text-sm font-normal text-muted-foreground">:1</span>
            </div>
            <div className="text-xs text-muted-foreground">{result.aca.category}</div>
          </div>
          <div className="list-item flex-col items-start justify-center">
            <div className="text-xs text-muted-foreground">{t('functionalAgeLabel')}</div>
            <div className="text-xl font-bold text-foreground">{result.accom.functionalAge}</div>
            <div className="text-xs text-muted-foreground">{t('yearsOld')}</div>
          </div>
        </div>
      )}
    </div>
  );
};