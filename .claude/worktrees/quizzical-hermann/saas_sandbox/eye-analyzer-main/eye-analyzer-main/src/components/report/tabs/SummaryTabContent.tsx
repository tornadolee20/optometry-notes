/**
 * Summary Tab Content - 檢查總結
 */

import { CalculationResult } from '@/lib/calculateLogic';
import { PathologyAlert } from '@/lib/screening/pathologyScreening';
import { PathologyAlertSection } from '../PathologyAlertSection';
import { QuickSummary } from '../QuickSummary';
import { CissAnalysisCard } from '../CissAnalysisCard';
import { StereoAnalysisCard } from '../StereoAnalysisCard';
import { VergenceReserveCard } from '../VergenceReserveCard';
import { AccommodationAnalysisCard } from '../AccommodationAnalysisCard';
import { ScoreBreakdownCard } from '../ScoreBreakdownCard';
import { DiagnosticLogicCard } from '../DiagnosticLogicCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Eye, Glasses, AlertTriangle, Info } from 'lucide-react';
import EyePositionVisualizer from '@/components/visualizations/EyePositionVisualizer';
import FusionalReserveChart from '@/components/visualizations/FusionalReserveChart';
import OEPChartTabs from '@/components/visualizations/OEPChartTabs';
import { 
  RefractionData, 
  analyzeRefraction, 
  getAdaptationLabel 
} from '@/lib/analysis/refractionAnalysis';

interface SummaryTabContentProps {
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
  odSph?: number;
  osSph?: number;
  odCyl?: number;
  osCyl?: number;
  odAx?: number;
  osAx?: number;
  refraction?: RefractionData;
}

export const SummaryTabContent = ({
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
  odSph,
  osSph,
  odCyl,
  osCyl,
  odAx,
  osAx,
  refraction,
}: SummaryTabContentProps) => {
  const { language } = useLanguage();
  const isCN = language === 'zh-CN';

  // Pattern description map
  const patternDescriptions: Record<string, { tw: string; cn: string; color: string }> = {
    'CI': { tw: '集合不足', cn: '集合不足', color: 'bg-amber-500' },
    'CE': { tw: '集合過度', cn: '集合过度', color: 'bg-orange-500' },
    'BX': { tw: '基本型外斜', cn: '基本型外斜', color: 'bg-blue-500' },
    'BE': { tw: '基本型內斜', cn: '基本型内斜', color: 'bg-purple-500' },
    'DE': { tw: '開散過度', cn: '散开过度', color: 'bg-teal-500' },
    'DI': { tw: '開散不足', cn: '散开不足', color: 'bg-indigo-500' },
    'Pseudo-CI': { tw: '假性集合不足', cn: '假性集合不足', color: 'bg-yellow-500' },
    'NORMAL': { tw: '正常', cn: '正常', color: 'bg-green-500' },
  };

  const pattern = patternDescriptions[result.diag.code] || { tw: result.diag.code, cn: result.diag.code, color: 'bg-gray-500' };

  // Calculate anisometropia
  const hasRefractionData = odSph !== undefined && osSph !== undefined;
  const anisometropia = hasRefractionData 
    ? Math.abs((odSph! + (odCyl || 0) / 2) - (osSph! + (osCyl || 0) / 2))
    : 0;

  // Identify abnormal metrics
  const abnormalMetrics: { name: string; value: string; status: 'warning' | 'error' }[] = [];
  
  if (npc > 6) {
    abnormalMetrics.push({ 
      name: 'NPC', 
      value: `${npc} cm`, 
      status: npc > 8 ? 'error' : 'warning' 
    });
  }
  if (cissScore >= (age < 18 ? 16 : 21)) {
    abnormalMetrics.push({ 
      name: 'CISS', 
      value: `${cissScore}`, 
      status: cissScore >= (age < 18 ? 21 : 29) ? 'error' : 'warning' 
    });
  }
  if (boBreak < 12) {
    abnormalMetrics.push({ 
      name: isCN ? 'BO储备' : 'BO 儲備', 
      value: `${boBreak}Δ`, 
      status: boBreak < 8 ? 'error' : 'warning' 
    });
  }
  if (biBreak < 8) {
    abnormalMetrics.push({ 
      name: isCN ? 'BI储备' : 'BI 儲備', 
      value: `${biBreak}Δ`, 
      status: biBreak < 4 ? 'error' : 'warning' 
    });
  }

  return (
    <div className="space-y-4">
      {/* Pathology Alerts - Top priority */}
      {pathologyAlerts.length > 0 && (
        <PathologyAlertSection alerts={pathologyAlerts} />
      )}

      {/* Health Score & Diagnosis Summary */}
      <QuickSummary result={result} alerts={result.alerts} />

      {/* Main Diagnosis Pattern Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-5 w-5 text-primary" />
            {isCN ? '主要诊断模式' : '主要診斷模式'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Badge className={`${pattern.color} text-white text-lg px-4 py-1`}>
              {result.diag.code}
            </Badge>
            <span className="text-lg font-semibold">
              {isCN ? pattern.cn : pattern.tw}
            </span>
          </div>
          
          {/* Abnormal Metrics Quick View */}
          {abnormalMetrics.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {isCN ? '异常指标' : '異常指標'}
              </p>
              <div className="flex flex-wrap gap-2">
                {abnormalMetrics.map((metric, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className={metric.status === 'error' 
                      ? 'border-destructive text-destructive' 
                      : 'border-amber-500 text-amber-600'
                    }
                  >
                    {metric.name}: {metric.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eye Position Visualizer */}
      <EyePositionVisualizer
        distancePhoria={distPhoria}
        nearPhoria={nearPhoria}
        pattern={result.diag.code as 'CI' | 'CE' | 'DI' | 'DE' | 'BX' | 'BE' | 'NORMAL'}
      />

      {/* Fusional Reserve Chart - Near */}
      <FusionalReserveChart
        boBreak={boBreak}
        boRecovery={Math.round(boBreak * 0.6)}
        biBreak={biBreak}
        biRecovery={Math.round(biBreak * 0.6)}
        sheardMinimum={Math.abs(nearPhoria) * 2}
        percivalRange={[8, 20]}
        distance="near"
        phoria={nearPhoria}
      />

      {/* OEP Enhanced Binocular Vision Graph */}
      <OEPChartTabs
        distPhoria={distPhoria}
        nearPhoria={nearPhoria}
        nearBiBreak={biBreak}
        nearBoBreak={boBreak}
        distBiBreak={distBiBreak ?? 7}
        distBoBreak={distBoBreak ?? 9}
        pd={pd}
        age={age}
        aa={Math.min(aaOD, aaOS)}
      />

      {/* Refraction Summary (if available) */}
      {(hasRefractionData || refraction) && (() => {
        // Use refraction data if available, otherwise construct from individual props
        const refractionData: RefractionData | null = refraction || (hasRefractionData ? {
          OD: { sphere: odSph!, cylinder: odCyl || 0, axis: odAx || 0 },
          OS: { sphere: osSph!, cylinder: osCyl || 0, axis: osAx || 0 },
          spectacleWearing: true,
          adaptation: 'good' as const,
        } : null);
        
        if (!refractionData) return null;
        
        const refractionAnalysis = analyzeRefraction(refractionData);
        
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Glasses className="h-5 w-5 text-primary" />
                {isCN ? '屈光状态摘要' : '屈光狀態摘要'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 度數顯示 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">OD（{isCN ? '右眼' : '右眼'}）</p>
                  <code className="font-mono text-sm font-semibold">
                    {refractionAnalysis.summary.OD}
                  </code>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">OS（{isCN ? '左眼' : '左眼'}）</p>
                  <code className="font-mono text-sm font-semibold">
                    {refractionAnalysis.summary.OS}
                  </code>
                </div>
              </div>
              
              {/* 配戴狀態 */}
              {refraction && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {refraction.spectacleWearing 
                      ? (isCN ? '配戴眼鏡' : '配戴眼鏡')
                      : (isCN ? '未配戴眼镜' : '未配戴眼鏡')
                    }
                  </Badge>
                  {refraction.spectacleWearing && (
                    <Badge 
                      variant="outline" 
                      className={
                        refraction.adaptation === 'poor' 
                          ? 'border-destructive text-destructive'
                          : refraction.adaptation === 'new'
                          ? 'border-amber-500 text-amber-600'
                          : ''
                      }
                    >
                      {getAdaptationLabel(refraction.adaptation, isCN)}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* 屈光參差警示 */}
              {refractionAnalysis.anisometropia >= 2.0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>
                    {isCN ? '屈光参差' : '屈光參差'}：{refractionAnalysis.anisometropia.toFixed(2)}D
                  </AlertTitle>
                  <AlertDescription>
                    {isCN 
                      ? '两眼度数差距较大，可能影响双眼视功能'
                      : '兩眼度數差距較大，可能影響雙眼視功能'
                    }
                  </AlertDescription>
                </Alert>
              )}
              
              {refractionAnalysis.anisometropia >= 1.0 && refractionAnalysis.anisometropia < 2.0 && (
                <Badge variant="outline" className="border-amber-500 text-amber-600">
                  {isCN ? '屈光参差' : '屈光參差'}：{refractionAnalysis.anisometropia.toFixed(2)}D
                </Badge>
              )}
              
              {/* 臨床影響提示 */}
              {refractionAnalysis.clinicalImpact.length > 0 && (
                <div className="space-y-2">
                  {refractionAnalysis.clinicalImpact.map((impact, idx) => (
                    <Alert 
                      key={idx} 
                      variant={impact.type === 'warning' ? 'destructive' : 'default'}
                      className={impact.type === 'info' ? 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20' : ''}
                    >
                      {impact.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4 text-blue-500" />
                      )}
                      <AlertTitle className={impact.type === 'info' ? 'text-blue-700 dark:text-blue-400' : ''}>
                        {isCN ? impact.titleCN : impact.title}
                      </AlertTitle>
                      <AlertDescription className={impact.type === 'info' ? 'text-blue-600/80 dark:text-blue-300/80' : ''}>
                        <p className="mb-1">{isCN ? impact.messageCN : impact.message}</p>
                        <p className="text-xs opacity-80">
                          💡 {isCN ? impact.recommendationCN : impact.recommendation}
                        </p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Detailed Analysis Cards */}
      <CissAnalysisCard result={result} cissScore={cissScore} age={age} />
      <StereoAnalysisCard stereo={result.stereo} age={age} />
      <VergenceReserveCard
        result={result}
        distPhoria={distPhoria}
        nearPhoria={nearPhoria}
        biBreak={biBreak}
        boBreak={boBreak}
        distBiBreak={distBiBreak}
        distBoBreak={distBoBreak}
      />
      <AccommodationAnalysisCard
        result={result}
        aaOD={aaOD}
        aaOS={aaOS}
        nra={nra}
        pra={pra}
        mem={mem}
        age={age}
        flipper={flipper}
      />
      <ScoreBreakdownCard result={result} age={age} mem={mem} />
      <DiagnosticLogicCard
        result={result}
        pd={pd}
        distPhoria={distPhoria}
        nearPhoria={nearPhoria}
        workDist={40}
      />
    </div>
  );
};
