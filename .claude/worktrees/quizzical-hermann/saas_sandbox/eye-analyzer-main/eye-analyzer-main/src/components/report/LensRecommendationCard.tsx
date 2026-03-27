import { CalculationResult } from '@/lib/calculateLogic';
import { useLanguage } from '@/contexts/LanguageContext';
import { Glasses } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { ViewMode } from '../ViewModeSelector';

interface LensRecommendationCardProps {
  result: CalculationResult;
  viewMode?: ViewMode;
}

export const LensRecommendationCard = ({ result, viewMode = 'basic' }: LensRecommendationCardProps) => {
  const { t, language } = useLanguage();

  // For basic mode, show simpler presentation
  if (viewMode === 'basic') {
    return (
      <ReportCard>
        <div className="flex items-start gap-4 p-1 md:p-0">
          <div className="icon-box-primary h-12 w-12 md:h-10 md:w-10 flex-shrink-0">
            <Glasses size={24} className="md:hidden" />
            <Glasses size={18} className="hidden md:block" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 md:mb-1">
              {language === 'en' ? 'Lens Recommendation' : language === 'zh-CN' ? '镜片建议' : '鏡片建議'}
            </div>
            <h3 className="text-lg md:text-base font-bold text-foreground leading-snug">
              {t(result.lensRec.titleKey as any)}
            </h3>
            <p className="text-base md:text-sm text-muted-foreground mt-3 md:mt-2 leading-relaxed">
              {language === 'en' 
                ? 'Your optometrist will recommend the most suitable lens based on your condition.'
                : language === 'zh-CN' 
                ? '验光师会根据您的情况，推荐最适合的镜片方案。'
                : '驗光師會根據您的情況，推薦最適合的鏡片方案.'}
            </p>
          </div>
        </div>
      </ReportCard>
    );
  }

  // Pro/Expert mode - collapsible with full details
  return (
    <ReportCard
      icon={Glasses}
      title={t(result.lensRec.titleKey as any)}
      collapsible
      defaultOpen={viewMode === 'expert'}
    >
      <p className="text-base md:text-sm text-muted-foreground leading-relaxed py-1 md:py-0">
        {t(result.lensRec.descKey as any).replace(/\{(\w+)\}/g, (_, key) => 
          String(result.lensRec.descParams?.[key] ?? `{${key}}`)
        )}
      </p>
    </ReportCard>
  );
};
