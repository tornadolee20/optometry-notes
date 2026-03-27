/**
 * Follow-up Tab Content - 追蹤計畫
 */

import { CalculationResult } from '@/lib/calculateLogic';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Bell, AlertTriangle, CheckCircle2, Clock, Download, Printer, BookOpen } from 'lucide-react';
import ProgressTimeline from '@/components/visualizations/ProgressTimeline';
import { TherapyPlanDisplay } from '@/components/therapy/TherapyPlanDisplay';
import { getTherapyProtocol, getPatternDisplayName } from '@/lib/visionTherapy/therapyProtocol';
import { generateTherapyManualPdf, printTherapyPlan } from '@/lib/visionTherapy/therapyPdfGenerator';
import { toast } from '@/hooks/use-toast';
import { 
  followUpTranslations, 
  warningSignTranslations, 
  ciMilestoneTranslations,
  ceMilestoneTranslations,
  defaultMilestoneTranslations,
  tr,
  getT
} from '@/lib/translations/reportTranslations';

interface FollowUpTabContentProps {
  result: CalculationResult;
  age: number;
}

interface MilestoneItem {
  week: number;
  title: string;
  description: string;
  metrics: string[];
}

interface TimelineMilestone {
  week: number;
  goal: string;
  goalCN?: string;
  status: 'completed' | 'in-progress' | 'pending';
  description?: string;
  descriptionCN?: string;
}

export const FollowUpTabContent = ({ result, age }: FollowUpTabContentProps) => {
  const { language } = useLanguage();
  const t = getT(language);

  const diagCode = result.diag.code;
  const isTrainingCase = ['CI', 'Pseudo-CI', 'CE', 'BX', 'BE', 'DE', 'DI'].includes(diagCode);

  // Generate timeline milestones based on diagnosis pattern
  const getTimelineMilestones = (): TimelineMilestone[] => {
    const startMilestone: TimelineMilestone = {
      week: 0,
      goal: language === 'en' ? 'Start' : 'Start',
      goalCN: '開始',
      status: 'completed',
      description: language === 'en' ? 'Initial assessment complete' : 'Initial assessment complete',
      descriptionCN: '完成初始評估'
    };

    if (diagCode === 'CI' || diagCode === 'Pseudo-CI') {
      return [
        startMilestone,
        {
          week: 4,
          goal: 'NPC < 8cm',
          goalCN: 'NPC < 8cm',
          status: 'pending',
          description: language === 'en' ? 'Near point of convergence improved to within 8cm' : 'Near point of convergence improved to within 8cm',
          descriptionCN: '近點聚合改善到 8cm 以內'
        },
        {
          week: 8,
          goal: 'CISS < 16',
          goalCN: 'CISS < 16',
          status: 'pending',
          description: language === 'en' ? 'Symptom score improved to mild range' : 'Symptom score improved to mild range',
          descriptionCN: '症狀評分改善到輕度以下'
        },
        {
          week: 12,
          goal: language === 'en' ? 'Reserves ✓' : 'Reserves ✓',
          goalCN: '融像達標',
          status: 'pending',
          description: 'BO break ≥ 15Δ, recovery ≥ 10Δ',
          descriptionCN: 'BO break ≥ 15Δ, recovery ≥ 10Δ'
        }
      ];
    } else if (diagCode === 'CE') {
      return [
        startMilestone,
        {
          week: 4,
          goal: 'Eso < 4Δ',
          goalCN: '內斜 < 4Δ',
          status: 'pending',
          description: language === 'en' ? 'Near esophoria reduced' : 'Near esophoria reduced',
          descriptionCN: '近距內斜視減少'
        },
        {
          week: 8,
          goal: 'BI ≥ 12Δ',
          goalCN: 'BI ≥ 12Δ',
          status: 'pending',
          description: language === 'en' ? 'BI fusional reserve improved' : 'BI fusional reserve improved',
          descriptionCN: 'BI 融像儲備改善'
        },
        {
          week: 12,
          goal: language === 'en' ? 'Symptoms ↓' : 'Symptoms ↓',
          goalCN: '症狀緩解',
          status: 'pending',
          description: language === 'en' ? 'No fatigue or headache during reading' : 'No fatigue or headache during reading',
          descriptionCN: '閱讀時不再感到疲勞或頭痛'
        }
      ];
    } else if (diagCode === 'BX' || diagCode === 'DE') {
      return [
        startMilestone,
        {
          week: 4,
          goal: 'BO +5Δ',
          goalCN: 'BO +5Δ',
          status: 'pending',
          description: language === 'en' ? 'BO break increased by 5Δ or more' : 'BO break increased by 5Δ or more',
          descriptionCN: 'BO break 增加 5Δ 以上'
        },
        {
          week: 8,
          goal: language === 'en' ? 'Balance' : 'Balance',
          goalCN: '遠近平衡',
          status: 'pending',
          description: language === 'en' ? 'Distance/near exophoria difference < 4Δ' : 'Distance/near exophoria difference < 4Δ',
          descriptionCN: '遠近距 Exophoria 差距 < 4Δ'
        },
        {
          week: 12,
          goal: language === 'en' ? 'Compensate' : 'Compensate',
          goalCN: '代償達標',
          status: 'pending',
          description: language === 'en' ? 'BO ≥ 2× Exophoria (Sheard criterion)' : 'BO ≥ 2× Exophoria (Sheard criterion)',
          descriptionCN: 'BO ≥ 2倍 Exophoria（Sheard 標準）'
        }
      ];
    } else if (diagCode === 'BE' || diagCode === 'DI') {
      return [
        startMilestone,
        {
          week: 4,
          goal: 'BI +5Δ',
          goalCN: 'BI +5Δ',
          status: 'pending',
          description: language === 'en' ? 'BI break increased by 5Δ or more' : 'BI break increased by 5Δ or more',
          descriptionCN: 'BI break 增加 5Δ 以上'
        },
        {
          week: 8,
          goal: language === 'en' ? 'Prism adapt' : 'Prism adapt',
          goalCN: '稜鏡適應',
          status: 'pending',
          description: language === 'en' ? 'Prism adaptation confirmed stable' : 'Prism adaptation confirmed stable',
          descriptionCN: '確認稜鏡適應穩定'
        },
        {
          week: 12,
          goal: language === 'en' ? 'Stable' : 'Stable',
          goalCN: '穩定',
          status: 'pending',
          description: language === 'en' ? 'Symptoms stable, no diplopia' : 'Symptoms stable, no diplopia',
          descriptionCN: '症狀穩定，無複視'
        }
      ];
    }
    
    // Default/Normal
    return [
      startMilestone,
      {
        week: 12,
        goal: language === 'en' ? 'Review' : 'Review',
        goalCN: '複查',
        status: 'pending',
        description: language === 'en' ? 'Routine follow-up' : 'Routine follow-up',
        descriptionCN: '常規追蹤檢查'
      }
    ];
  };

  // Generate follow-up schedule based on diagnosis
  const getFollowUpSchedule = (): { weeks: number; label: string; description: string }[] => {
    if (isTrainingCase) {
      return [
        { 
          weeks: 4, 
          label: tr(followUpTranslations.week4, language), 
          description: tr(followUpTranslations.initialEvaluation, language) 
        },
        { 
          weeks: 8, 
          label: tr(followUpTranslations.week8, language), 
          description: tr(followUpTranslations.midEvaluation, language) 
        },
        { 
          weeks: 12, 
          label: tr(followUpTranslations.week12, language), 
          description: tr(followUpTranslations.stageComplete, language) 
        },
        { 
          weeks: 24, 
          label: tr(followUpTranslations.week24, language), 
          description: tr(followUpTranslations.finalEvaluation, language) 
        },
      ];
    }
    return [
      { 
        weeks: 12, 
        label: tr(followUpTranslations.month3, language), 
        description: tr(followUpTranslations.routineCheckup, language) 
      },
      { 
        weeks: 52, 
        label: tr(followUpTranslations.year1, language), 
        description: tr(followUpTranslations.annualCheckup, language) 
      },
    ];
  };

  // Generate milestones based on diagnosis
  const getMilestones = (): MilestoneItem[] => {
    if (diagCode === 'CI' || diagCode === 'Pseudo-CI') {
      return [
        {
          week: 4,
          title: tr(ciMilestoneTranslations.week4Title, language),
          description: tr(ciMilestoneTranslations.week4Desc, language),
          metrics: ['Brock String > 30cm', 'NPC +2cm'],
        },
        {
          week: 8,
          title: tr(ciMilestoneTranslations.week8Title, language),
          description: tr(ciMilestoneTranslations.week8Desc, language),
          metrics: ['NPC ≤ 8cm', 'BO ↑'],
        },
        {
          week: 12,
          title: tr(ciMilestoneTranslations.week12Title, language),
          description: tr(ciMilestoneTranslations.week12Desc, language),
          metrics: ['CISS ≥ -10', 'NPC ≤ 6cm'],
        },
        {
          week: 24,
          title: tr(ciMilestoneTranslations.week24Title, language),
          description: tr(ciMilestoneTranslations.week24Desc, language),
          metrics: ['NPC stable', 'CISS low'],
        },
      ];
    } else if (diagCode === 'CE') {
      return [
        {
          week: 4,
          title: tr(ceMilestoneTranslations.week4Title, language),
          description: tr(ceMilestoneTranslations.week4Desc, language),
          metrics: [t('症狀緩解', '症状缓解', 'Symptoms relieved')],
        },
        {
          week: 12,
          title: tr(ceMilestoneTranslations.week12Title, language),
          description: tr(ceMilestoneTranslations.week12Desc, language),
          metrics: ['AC/A stable'],
        },
      ];
    }
    
    return [
      {
        week: 12,
        title: tr(defaultMilestoneTranslations.routineFollowUp, language),
        description: tr(defaultMilestoneTranslations.confirmStability, language),
        metrics: [t('指標正常', '指标正常', 'Metrics normal')],
      },
    ];
  };

  const schedule = getFollowUpSchedule();
  const milestones = getMilestones();
  const timelineMilestones = getTimelineMilestones();

  // Warning signs to watch for
  const getWarningSignsList = (): string[] => {
    if (diagCode === 'CI' || diagCode === 'Pseudo-CI') {
      return [
        tr(warningSignTranslations.blurryReading, language),
        tr(warningSignTranslations.diplopia, language),
        tr(warningSignTranslations.headache, language),
        tr(warningSignTranslations.readingAvoidance, language),
      ];
    } else if (diagCode === 'CE') {
      return [
        tr(warningSignTranslations.nearWorkDiscomfort, language),
        tr(warningSignTranslations.eyeFatigue, language),
        tr(warningSignTranslations.nearDiplopia, language),
      ];
    }
    return [
      tr(warningSignTranslations.newDiplopia, language),
      tr(warningSignTranslations.suddenVisionChange, language),
      tr(warningSignTranslations.persistentHeadache, language),
    ];
  };

  const warningSignsList = getWarningSignsList();

  return (
    <div className="space-y-4">
      {/* Follow-up Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-primary" />
            {tr(followUpTranslations.recommendedSchedule, language)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {schedule.map((item, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold z-10 flex-shrink-0">
                    {item.weeks}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Timeline - Progress Visualization */}
      {isTrainingCase && (
        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            <ProgressTimeline
              currentWeek={0}
              totalWeeks={12}
              milestones={timelineMilestones}
            />
          </div>
        </div>
      )}

      {/* Detailed Therapy Plan */}
      {isTrainingCase && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-primary" />
              {tr(followUpTranslations.detailedTrainingPlan, language)}
            </CardTitle>
            <CardDescription>
              {t(
                `根據您的診斷 (${getPatternDisplayName(diagCode)}) 量身定制的 ${getTherapyProtocol(diagCode).totalWeeks} 週訓練方案`,
                `根据您的诊断 (${getPatternDisplayName(diagCode)}) 量身定制的 ${getTherapyProtocol(diagCode).totalWeeks} 周训练方案`,
                `A ${getTherapyProtocol(diagCode).totalWeeks}-week training program customized for your diagnosis (${getPatternDisplayName(diagCode)})`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TherapyPlanDisplay protocol={getTherapyProtocol(diagCode)} />
          </CardContent>
        </Card>
      )}

      {/* Download/Print Actions */}
      {isTrainingCase && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              const protocol = getTherapyProtocol(diagCode);
              generateTherapyManualPdf(protocol);
              toast({
                title: tr(followUpTranslations.downloadStarted, language),
                description: tr(followUpTranslations.generatingPdf, language),
              });
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            {tr(followUpTranslations.downloadManual, language)}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              const protocol = getTherapyProtocol(diagCode);
              printTherapyPlan(protocol);
            }}
          >
            <Printer className="h-4 w-4 mr-2" />
            {tr(followUpTranslations.printPlan, language)}
          </Button>
        </div>
      )}

      {/* Treatment Milestones */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-primary" />
              {tr(followUpTranslations.treatmentMilestones, language)}
            </CardTitle>
            <CardDescription>
              {tr(followUpTranslations.clinicalProgress, language)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestones.map((milestone, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {t(`第 ${milestone.week} 週`, `第 ${milestone.week} 周`, `Week ${milestone.week}`)}
                  </Badge>
                  <span className="font-medium">{milestone.title}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {milestone.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {milestone.metrics.map((metric, mIdx) => (
                    <Badge key={mIdx} variant="outline" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Home Training Reminders */}
      {isTrainingCase && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5 text-primary" />
              {tr(followUpTranslations.homeTrainingReminders, language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    {tr(followUpTranslations.dailyTrainingTime, language)}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {tr(followUpTranslations.dailyTrainingDesc, language)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <Bell className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    {tr(followUpTranslations.trainingLog, language)}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {tr(followUpTranslations.trainingLogDesc, language)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Signs */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
            {tr(followUpTranslations.warningSigns, language)}
          </CardTitle>
          <CardDescription>
            {tr(followUpTranslations.warningSignsDesc, language)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {warningSignsList.map((sign, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                {sign}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
