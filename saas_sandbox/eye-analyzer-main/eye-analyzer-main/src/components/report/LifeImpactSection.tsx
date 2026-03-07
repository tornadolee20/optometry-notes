import { CalculationResult } from '@/lib/calculateLogic';
import { ViewMode } from '../ViewModeSelector';
import { getApplicableInterferences, InterferenceTemplate } from '@/lib/lifeInterferenceTemplates';
import { Heart, BookOpen, Monitor, Car, Coffee, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReportCard } from './ReportCard';

interface LifeImpactSectionProps {
  result: CalculationResult;
  viewMode: ViewMode;
  npc: number;
  flipper: number;
  age: number;
}

const scenarioIcons = [BookOpen, Monitor, Smartphone, Car, Coffee];

export const LifeImpactSection = ({
  result,
  viewMode,
  npc,
  flipper,
  age,
}: LifeImpactSectionProps) => {
  const { t, language } = useLanguage();
  const interferences = getApplicableInterferences(result, npc, flipper, age);

  if (interferences.length === 0) {
    return null;
  }

  const getTextByMode = (template: InterferenceTemplate): string => {
    switch (viewMode) {
      case 'basic':
        return t(template.simpleKey);
      case 'pro':
        return t(template.proKey);
      case 'expert':
        return t(template.expertKey);
      default:
        return t(template.simpleKey);
    }
  };

  // Limit items based on mode - show fewer in basic mode
  const displayItems = viewMode === 'basic' 
    ? interferences.slice(0, 2) 
    : interferences.slice(0, 5);

  // Use friendlier title based on mode
  const title = language === 'en' 
    ? 'You May Experience These Symptoms'
    : language === 'zh-CN' 
      ? '你可能会有这些感受' 
      : '你可能會有這些感受';

  return (
    <ReportCard
      icon={Heart}
      title={title}
      variant="default"
      collapsible={viewMode !== 'basic'}
      defaultOpen={true}
    >
      <ul className="space-y-3">
        {displayItems.map((template, index) => {
          const Icon = scenarioIcons[index % scenarioIcons.length];
          return (
            <li
              key={template.id}
              className="list-item"
            >
              <div className="icon-box bg-muted text-muted-foreground">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">
                  {getTextByMode(template)}
                </p>
                {viewMode === 'expert' && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {t('correspondingCondition')}：{template.condition}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {viewMode === 'basic' && (
        <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border leading-relaxed">
          {language === 'en' 
            ? 'The above symptoms are based on your examination data and what you may experience in daily life. Please consult your optometrist if you have any questions.'
            : language === 'zh-CN' 
              ? '以上是根据您的检查数据，可能在日常生活中感受到的情况。如有疑问，请与验光师讨论。'
              : '以上是根據您的檢查數據，可能在日常生活中感受到的情況。如有疑問，請與驗光師討論。'}
        </p>
      )}
    </ReportCard>
  );
};
