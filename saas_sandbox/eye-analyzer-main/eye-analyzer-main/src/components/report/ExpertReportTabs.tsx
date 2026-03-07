/**
 * Expert Report Tabs Component
 * 專家報告漸進式揭露 Tabs 架構
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalculationResult } from '@/lib/calculateLogic';
import { PathologyAlert } from '@/lib/screening/pathologyScreening';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart3, Lightbulb, BookOpen, Calendar } from 'lucide-react';

// Tab content components
import { SummaryTabContent } from './tabs/SummaryTabContent';
import { TreatmentTabContent } from './tabs/TreatmentTabContent';
import { LiteratureTabContent } from './tabs/LiteratureTabContent';
import { FollowUpTabContent } from './tabs/FollowUpTabContent';

interface ExpertReportTabsProps {
  result: CalculationResult;
  pathologyAlerts: PathologyAlert[];
  npc: number;
  cissScore: number;
  age: number;
  distPhoria: number;
  nearPhoria: number;
  biBreak: number;
  boBreak: number;
  distBiBreak?: number;
  distBoBreak?: number;
  aaOD: number;
  aaOS: number;
  flipper: number;
  pd: number;
  nra: number;
  pra: number;
  mem: number;
  trainingNeeds: { category: string; target: string; items: string[] }[];
  odSph?: number;
  osSph?: number;
  odCyl?: number;
  osCyl?: number;
}

export const ExpertReportTabs = ({
  result,
  pathologyAlerts,
  npc,
  cissScore,
  age,
  distPhoria,
  nearPhoria,
  biBreak,
  boBreak,
  distBiBreak,
  distBoBreak,
  aaOD,
  aaOS,
  flipper,
  pd,
  nra,
  pra,
  mem,
  trainingNeeds,
  odSph,
  osSph,
  odCyl,
  osCyl,
}: ExpertReportTabsProps) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('summary');
  const isCN = language === 'zh-CN';

  const tabLabels = {
    summary: isCN ? '检查总结' : '檢查總結',
    treatment: isCN ? '处置建议' : '處置建議',
    literature: isCN ? '文献依据' : '文獻依據',
    followup: isCN ? '追踪计划' : '追蹤計畫',
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-4 h-auto p-1 bg-muted/50 overflow-x-auto">
        <TabsTrigger 
          value="summary" 
          className="flex flex-col sm:flex-row items-center gap-1 py-2 px-1 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-background"
        >
          <BarChart3 className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{tabLabels.summary}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="treatment" 
          className="flex flex-col sm:flex-row items-center gap-1 py-2 px-1 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-background"
        >
          <Lightbulb className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{tabLabels.treatment}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="literature" 
          className="flex flex-col sm:flex-row items-center gap-1 py-2 px-1 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-background"
        >
          <BookOpen className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{tabLabels.literature}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="followup" 
          className="flex flex-col sm:flex-row items-center gap-1 py-2 px-1 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-background"
        >
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{tabLabels.followup}</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-4">
        <TabsContent value="summary" className="mt-0 space-y-4">
          <SummaryTabContent
            result={result}
            pathologyAlerts={pathologyAlerts}
            npc={npc}
            cissScore={cissScore}
            age={age}
            distPhoria={distPhoria}
            nearPhoria={nearPhoria}
            biBreak={biBreak}
            boBreak={boBreak}
            distBiBreak={distBiBreak}
            distBoBreak={distBoBreak}
            aaOD={aaOD}
            aaOS={aaOS}
            flipper={flipper}
            pd={pd}
            nra={nra}
            pra={pra}
            mem={mem}
            odSph={odSph}
            osSph={osSph}
            odCyl={odCyl}
            osCyl={osCyl}
          />
        </TabsContent>

        <TabsContent value="treatment" className="mt-0 space-y-4">
          <TreatmentTabContent
            result={result}
            trainingNeeds={trainingNeeds}
            nearPhoria={nearPhoria}
            distPhoria={distPhoria}
            biBreak={biBreak}
            boBreak={boBreak}
          />
        </TabsContent>

        <TabsContent value="literature" className="mt-0 space-y-4">
          <LiteratureTabContent
            diagCode={result.diag.code}
          />
        </TabsContent>

        <TabsContent value="followup" className="mt-0 space-y-4">
          <FollowUpTabContent
            result={result}
            age={age}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};
