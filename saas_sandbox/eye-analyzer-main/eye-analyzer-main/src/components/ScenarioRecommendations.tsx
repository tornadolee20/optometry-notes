import { useState } from 'react';
import { 
  ScenarioRecommendation, 
  ClinicalScenario, 
  TreatmentMethod 
} from '@/lib/binocularAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Eye, 
  Activity, 
  Clock, 
  AlertCircle,
  Glasses,
  Target,
  Calendar
} from 'lucide-react';

interface ScenarioRecommendationsProps {
  scenarios: ScenarioRecommendation[];
  defaultScenario?: ClinicalScenario;
  language?: 'zh-TW' | 'zh-CN' | 'en';
}

const getMethodLabels = (language: 'zh-TW' | 'zh-CN' | 'en'): Record<TreatmentMethod, { label: string; icon: typeof Eye; color: string }> => {
  const t = (zhTW: string, zhCN: string, en: string) => 
    language === 'en' ? en : language === 'zh-CN' ? zhCN : zhTW;
  
  return {
    VT: { label: t('視覺訓練', '视觉训练', 'Vision Training'), icon: Target, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    PRISM: { label: t('稜鏡處方', '棱镜处方', 'Prism Rx'), icon: Glasses, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    OBSERVATION: { label: t('觀察追蹤', '观察追踪', 'Observation'), icon: Eye, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    REFERRAL: { label: t('轉診評估', '转诊评估', 'Referral'), icon: AlertCircle, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    ADD_LENS: { label: t('正加入度數', '正加入度数', 'Plus Add'), icon: Glasses, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' }
  };
};

const getPriorityLabels = (language: 'zh-TW' | 'zh-CN' | 'en'): Record<number, { label: string; style: string }> => {
  const t = (zhTW: string, zhCN: string, en: string) => 
    language === 'en' ? en : language === 'zh-CN' ? zhCN : zhTW;
  
  return {
    1: { label: t('優先', '优先', 'Primary'), style: 'bg-primary text-primary-foreground' },
    2: { label: t('次要', '次要', 'Secondary'), style: 'bg-muted text-muted-foreground' },
    3: { label: t('備案', '备案', 'Alternative'), style: 'bg-muted/50 text-muted-foreground' }
  };
};

export function ScenarioRecommendations({ 
  scenarios, 
  defaultScenario = 'A',
  language = 'zh-TW' 
}: ScenarioRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<ClinicalScenario>(defaultScenario);
  
  const t = (zhTW: string, zhCN: string, en: string) => 
    language === 'en' ? en : language === 'zh-CN' ? zhCN : zhTW;

  const methodLabels = getMethodLabels(language);
  const priorityLabels = getPriorityLabels(language);

  if (!scenarios || scenarios.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-3 px-3 md:px-6">
        <CardTitle className="flex items-center gap-2 text-xl md:text-lg">
          <Activity className="h-6 w-6 md:h-5 md:w-5 text-primary" />
          {t('建議處置方案（依情境選擇）', '建议处置方案（依情境选择）', 'Treatment Plans (By Scenario)')}
        </CardTitle>
        <p className="text-sm md:text-sm text-muted-foreground mt-1">
          {t(
            '依據個案症狀嚴重度、配合度與年齡，提供不同情境的處置建議',
            '依据个案症状严重度、配合度与年龄，提供不同情境的处置建议',
            'Treatment recommendations based on symptom severity, compliance, and age'
          )}
        </p>
      </CardHeader>
      <CardContent className="px-3 md:px-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ClinicalScenario)}>
          {/* Mobile-optimized Tab List with larger touch targets */}
          <TabsList className="grid w-full grid-cols-3 mb-4 h-auto p-1 gap-1">
            {scenarios.map(s => (
              <TabsTrigger 
                key={s.scenario.id} 
                value={s.scenario.id}
                className="flex flex-col items-center gap-1 min-h-[56px] md:min-h-[44px] py-2 px-2 text-sm md:text-xs rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md active:scale-95"
              >
                <span className="font-semibold text-base md:text-sm">{s.scenario.title.split('：')[0].split(':')[0]}</span>
                {s.scenario.applicable && (
                  <Badge variant="outline" className="text-xs md:text-[10px] px-2 md:px-1 py-0.5 md:py-0 h-5 md:h-4 border-current">
                    {t('適用', '适用', 'Applies')}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {scenarios.map(scenarioRec => (
            <TabsContent key={scenarioRec.scenario.id} value={scenarioRec.scenario.id} className="space-y-4 mt-0">
              {/* 情境說明 - Mobile optimized */}
              <div className="rounded-lg border bg-card p-4 md:p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg md:text-base leading-tight">{scenarioRec.scenario.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{scenarioRec.scenario.subtitle}</p>
                  </div>
                  {scenarioRec.scenario.applicable ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 self-start min-h-[32px] md:min-h-0 px-3 md:px-2 text-sm md:text-xs">
                      <CheckCircle2 className="h-4 w-4 md:h-3 md:w-3 mr-1.5 md:mr-1" />
                      {t('符合條件', '符合条件', 'Matches')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground self-start min-h-[32px] md:min-h-0 px-3 md:px-2 text-sm md:text-xs">
                      <Circle className="h-4 w-4 md:h-3 md:w-3 mr-1.5 md:mr-1" />
                      {t('參考用', '参考用', 'Reference')}
                    </Badge>
                  )}
                </div>
                
                <div className="mt-3">
                  <p className="font-medium text-muted-foreground mb-2 text-sm">
                    {t('適用條件：', '适用条件：', 'Applicable Conditions:')}
                  </p>
                  <ul className="space-y-2 md:space-y-1">
                    {scenarioRec.scenario.conditions.map((cond, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground min-h-[28px] md:min-h-0">
                        <span className="text-primary mt-0.5 text-base">•</span>
                        <span className="text-sm leading-relaxed">{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 處置建議 - Mobile optimized */}
              <div className="space-y-3">
                <h4 className="font-semibold text-base md:text-sm flex items-center gap-2">
                  <Target className="h-5 w-5 md:h-4 md:w-4 text-primary" />
                  {t('處置建議', '处置建议', 'Treatment Recommendations')}
                </h4>
                
                {scenarioRec.treatments.map((treatment, index) => {
                  const methodInfo = methodLabels[treatment.method];
                  const priorityInfo = priorityLabels[treatment.priority];
                  const Icon = methodInfo.icon;
                  
                  return (
                    <div 
                      key={index} 
                      className={`rounded-lg border p-4 transition-all ${
                        treatment.priority === 1 
                          ? 'border-primary/50 bg-primary/5' 
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className={`${priorityInfo.style} min-h-[32px] md:min-h-0 px-3 md:px-2 text-sm md:text-xs`}>
                          {priorityInfo.label}
                        </Badge>
                        <Badge className={`${methodInfo.color} min-h-[32px] md:min-h-0 px-3 md:px-2 text-sm md:text-xs`}>
                          <Icon className="h-4 w-4 md:h-3 md:w-3 mr-1.5 md:mr-1" />
                          {methodInfo.label}
                        </Badge>
                        {treatment.duration && (
                          <span className="text-sm md:text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                            <Clock className="h-4 w-4 md:h-3 md:w-3" />
                            {treatment.duration}
                          </span>
                        )}
                      </div>
                      
                      <p className="font-medium text-base md:text-sm mb-3 md:mb-2 leading-relaxed">{treatment.description}</p>
                      
                      {treatment.details.length > 0 && (
                        <ul className="space-y-2 md:space-y-1">
                          {treatment.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground min-h-[28px] md:min-h-0">
                              <span className="text-primary mt-0.5 text-base">→</span>
                              <span className="text-sm leading-relaxed">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 預期效果與追蹤 - Mobile stacked, desktop side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border bg-green-50 dark:bg-green-950/30 p-4 md:p-3">
                  <h5 className="font-medium text-base md:text-sm flex items-center gap-2 mb-2 md:mb-1 text-green-800 dark:text-green-200">
                    <CheckCircle2 className="h-5 w-5 md:h-4 md:w-4" />
                    {t('預期效果', '预期效果', 'Expected Outcome')}
                  </h5>
                  <p className="text-sm leading-relaxed text-green-700 dark:text-green-300">
                    {scenarioRec.expectedOutcome}
                  </p>
                </div>
                
                <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-4 md:p-3">
                  <h5 className="font-medium text-base md:text-sm flex items-center gap-2 mb-2 md:mb-1 text-blue-800 dark:text-blue-200">
                    <Calendar className="h-5 w-5 md:h-4 md:w-4" />
                    {t('追蹤建議', '追踪建议', 'Follow-up')}
                  </h5>
                  <p className="text-sm leading-relaxed text-blue-700 dark:text-blue-300">
                    {scenarioRec.followUp}
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
