import { useLanguage } from '@/contexts/LanguageContext';
import { Dumbbell, Target, Eye, Zap, ChevronRight, Lightbulb } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { ViewMode } from '../ViewModeSelector';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TrainingNeed {
  category: string;
  target: string;
  items: string[];
}

interface TrainingRecommendationCardProps {
  trainingNeeds: TrainingNeed[];
  viewMode: ViewMode;
}

const categoryIcons: Record<string, LucideIcon> = {
  'BO': Target,
  'BI': Eye,
  'NPC': Zap,
  'AA': Dumbbell,
};

// Scientific rationale for each training type
const getTrainingRationale = (category: string, language: string): string => {
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';
  
  if (category.includes('BO') || category.includes('正向融像')) {
    return isEN 
      ? 'Principle: Enhance positive fusional reserves to improve binocular convergence ability and near work endurance. Studies show 4-8 weeks of training can significantly improve BO reserves.'
      : isCN 
      ? '原理：通过增加正向融像储备，提升双眼内转能力，改善近距离用眼耐力。研究显示 4-8 周训练可显著提升 BO 储备。'
      : '原理：透過增加正向融像儲備，提升雙眼內轉能力，改善近距離用眼耐力。研究顯示 4-8 週訓練可顯著提升 BO 儲備。';
  }
  if (category.includes('BI') || category.includes('負向融像') || category.includes('负向融像')) {
    return isEN
      ? 'Principle: Train coordination of extraocular muscles for divergence, balance convergence and divergence function. Suitable for convergence excess or basic esophoria patients.'
      : isCN
      ? '原理：训练双眼外转肌群的协调能力，平衡内聚与开散功能。适用于集合过度或基本型内斜患者。'
      : '原理：訓練雙眼外轉肌群的協調能力，平衡內聚與開散功能。適用於集合過度或基本型內斜患者。';
  }
  if (category.includes('NPC') || category.includes('輻輳') || category.includes('辐辏')) {
    return isEN
      ? 'Principle: NPC training enhances medial rectus endurance, reduces near point of convergence. Visible improvement typically seen in 2-4 weeks.'
      : isCN
      ? '原理：NPC 训练可增强内直肌的收缩耐力，缩短集合近点，通常 2-4 周可见明显进步。'
      : '原理：NPC 訓練可增強內直肌的收縮耐力，縮短集合近點，通常 2-4 週可見明顯進步。';
  }
  if (category.includes('調節幅度') || category.includes('调节幅度')) {
    return isEN
      ? 'Principle: Through progressive minus lens stimulation, strengthen ciliary muscle contraction, restore accommodative amplitude to age-expected values.'
      : isCN
      ? '原理：通过渐进式负镜刺激，增强睫状肌收缩力，恢复调节幅度至年龄期望值。'
      : '原理：透過漸進式負鏡刺激，增強睫狀肌收縮力，恢復調節幅度至年齡期望值。';
  }
  if (category.includes('靈敏度') || category.includes('灵敏度')) {
    return isEN
      ? 'Principle: Flipper training improves ciliary muscle rapid focus switching ability, reducing blur during distance-near transitions.'
      : isCN
      ? '原理：Flipper 训练可提升睫状肌快速切换对焦的能力，改善远近切换时的模糊感。'
      : '原理：Flipper 訓練可提升睫狀肌快速切換對焦的能力，改善遠近切換時的模糊感。';
  }
  return isEN 
    ? 'Principle: Systematic training to enhance visual function.'
    : isCN 
    ? '原理：通过系统性训练提升视觉功能。'
    : '原理：透過系統性訓練提升視覺功能。';
};

export const TrainingRecommendationCard = ({ trainingNeeds, viewMode }: TrainingRecommendationCardProps) => {
  const { t, language } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (trainingNeeds.length === 0) {
    return null;
  }

  // For basic mode, show simplified version
  if (viewMode === 'basic') {
    return (
      <ReportCard>
        <div className="flex items-start gap-4 p-1 md:p-0">
          <div className="icon-box bg-accent/10 text-accent h-12 w-12 md:h-10 md:w-10 flex-shrink-0">
            <Dumbbell size={24} className="md:hidden" />
            <Dumbbell size={20} className="hidden md:block" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="section-title text-sm md:text-xs">{t('trainingPlan')}</div>
            <h3 className="text-lg md:text-base font-bold text-foreground leading-snug">
              {t('visualTrainingRecommended')}
            </h3>
            <p className="text-base md:text-sm text-muted-foreground mt-3 md:mt-2 leading-relaxed">
              {t('trainingBasicDesc')}
            </p>
          </div>
        </div>
      </ReportCard>
    );
  }

  return (
    <ReportCard
      icon={Dumbbell}
      title={t('trainingPlan')}
      collapsible
      defaultOpen={viewMode === 'expert'}
    >
      <div className="space-y-3 md:space-y-2">
        {trainingNeeds.map((need, idx) => {
          const Icon = Object.entries(categoryIcons).find(([key]) => 
            need.category.includes(key)
          )?.[1] || Dumbbell;
          
          const isExpanded = expandedIndex === idx;
          const rationale = getTrainingRationale(need.category, language);

          return (
            <div 
              key={idx} 
              className="app-card-interactive !p-0 overflow-hidden transition-all duration-200 active:scale-[0.98]"
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
            >
              {/* Mobile-optimized touch target */}
              <div className="flex items-center gap-3 md:gap-3 p-4 md:p-3 min-h-[64px] md:min-h-0 cursor-pointer">
                <div className="icon-box bg-accent/10 text-accent h-11 w-11 md:h-9 md:w-9 flex-shrink-0">
                  <Icon size={20} className="md:hidden" />
                  <Icon size={16} className="hidden md:block" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base md:text-sm font-semibold text-foreground leading-tight">{need.category}</h4>
                  <span className="text-sm md:text-xs text-muted-foreground mt-0.5 block">{need.target}</span>
                </div>
                <ChevronRight 
                  size={24} 
                  className={cn(
                    "text-muted-foreground transition-transform duration-200 flex-shrink-0 md:w-[18px] md:h-[18px]",
                    isExpanded && "rotate-90"
                  )} 
                />
              </div>
              
              {isExpanded && (
                <div className="px-4 md:px-3 pb-4 md:pb-3 pt-0 animate-fade-in">
                  <ul className="space-y-2.5 md:space-y-1.5 pl-14 md:pl-13">
                    {need.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-sm md:text-xs text-muted-foreground flex items-start gap-2 min-h-[28px] md:min-h-0">
                        <span className="text-accent mt-0.5 text-base md:text-sm">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Expert mode: Show scientific rationale */}
                  {viewMode === 'expert' && (
                    <div className="mt-4 md:mt-3 pt-3 border-t border-border/50 flex items-start gap-2.5 md:gap-2">
                      <Lightbulb size={18} className="text-warning flex-shrink-0 mt-0.5 md:w-[14px] md:h-[14px]" />
                      <p className="text-sm md:text-xs text-muted-foreground italic leading-relaxed">
                        {rationale}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 md:mt-4 pt-4 md:pt-3 border-t border-border">
        <p className="text-sm md:text-xs text-muted-foreground leading-relaxed">
          {t('trainingNote1')}
        </p>
        {viewMode === 'expert' && (
          <p className="text-sm md:text-xs text-muted-foreground leading-relaxed mt-2 md:mt-1">
            {language === 'en'
              ? 'Reference: Scheiman & Wick, Clinical Management of Binocular Vision'
              : language === 'zh-CN' 
              ? '文献参考：Scheiman & Wick, Clinical Management of Binocular Vision'
              : '文獻參考：Scheiman & Wick, Clinical Management of Binocular Vision'}
          </p>
        )}
      </div>
    </ReportCard>
  );
};
