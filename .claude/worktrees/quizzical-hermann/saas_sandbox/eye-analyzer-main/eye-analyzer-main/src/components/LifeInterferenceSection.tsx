import { CalculationResult } from '@/lib/calculateLogic';
import { ViewMode } from './ViewModeSelector';
import { getApplicableInterferences, InterferenceTemplate } from '@/lib/lifeInterferenceTemplates';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LifeInterferenceSectionProps {
  result: CalculationResult;
  viewMode: ViewMode;
  npc: number;
  flipper: number;
  age: number;
}

export const LifeInterferenceSection = ({
  result,
  viewMode,
  npc,
  flipper,
  age,
}: LifeInterferenceSectionProps) => {
  const { t } = useLanguage();
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

  const getModeTitle = (): string => {
    switch (viewMode) {
      case 'basic':
        return t('lifeInterferenceTitleBasic');
      case 'pro':
        return t('lifeInterferenceTitlePro');
      case 'expert':
        return t('lifeInterferenceTitleExpert');
      default:
        return t('lifeInterferenceTitleDefault');
    }
  };

  return (
    <div className="bg-card p-5 md:p-6 rounded-2xl shadow-card border border-border relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-warning/50 via-warning/25 to-transparent" />
      
      <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-warning/80" />
        {getModeTitle()}
      </h4>

      <div className="space-y-2.5">
        {interferences.map((template, index) => (
          <div
            key={template.id}
            className="flex items-start gap-3 p-3 bg-warning/5 border border-warning/15 rounded-xl"
          >
            <span className="flex-shrink-0 w-5 h-5 bg-warning/15 text-warning/80 rounded-full flex items-center justify-center text-xs font-semibold">
              {index + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm text-foreground/80 leading-relaxed">
                {getTextByMode(template)}
              </p>
              {viewMode === 'expert' && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  {t('correspondingCondition')}：{template.condition}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {viewMode === 'basic' && (
        <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
          {t('lifeInterferenceFooterBasic')}
        </p>
      )}

      {viewMode === 'pro' && (
        <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
          {t('lifeInterferenceFooterPro')}
        </p>
      )}
    </div>
  );
};
