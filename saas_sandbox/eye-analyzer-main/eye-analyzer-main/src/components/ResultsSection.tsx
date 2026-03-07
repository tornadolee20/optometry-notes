import { OEPChartTabs } from './visualizations/OEPChartTabs';
import { CalculationResult } from '@/lib/calculateLogic';
import { AlertTriangle, GraduationCap, Glasses, ClipboardList, BarChart2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ViewMode } from './ViewModeSelector';
import { BasicSuggestions } from './BasicSuggestions';
import { WhyButton } from './WhyButton';
import { CollapsibleSection } from './CollapsibleSection';
import { getBasicSuggestions } from '@/lib/getBasicSuggestions';
import { getSimplifiedManagement } from '@/lib/getSimplifiedManagement';
import { LifeInterferenceSection } from './LifeInterferenceSection';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculateDiagnosticResults, BinocularDataPoints } from '@/lib/oepChartUtils';
import { ScenarioRecommendations } from './ScenarioRecommendations';
import { 
  analyzePrimaryDistance, 
  generatePrismRecommendation, 
  generateAllScenarioRecommendations 
} from '@/lib/binocularAnalysis';
import { ADDImpactPredictor } from './analysis/ADDImpactPredictor';

interface ResultsSectionProps {
  result: CalculationResult;
  distPhoria: number;
  nearPhoria: number;
  biBreak: number;
  boBreak: number;
  distBiBreak?: number;
  distBoBreak?: number;
  // Blur points
  biBlur?: number | null;
  boBlur?: number | null;
  distBiBlur?: number | null;
  distBoBlur?: number | null;
  // Recovery points
  biRecovery?: number;
  boRecovery?: number;
  distBiRecovery?: number;
  distBoRecovery?: number;
  pd: number;
  nra?: number;
  pra?: number;
  mem?: number;
  age?: number;
  aaOD?: number;
  aaOS?: number;
  flipper?: number;
  npc?: number;
  viewMode?: ViewMode;
  // ADD Impact Predictor props
  addPower?: number;
}

export const ResultsSection = ({ 
  result, 
  distPhoria, 
  nearPhoria, 
  biBreak, 
  boBreak, 
  distBiBreak,
  distBoBreak,
  biBlur,
  boBlur,
  distBiBlur,
  distBoBlur,
  biRecovery,
  boRecovery,
  distBiRecovery,
  distBoRecovery,
  pd,
  nra = 2.0,
  pra = -2.5,
  mem = 0.5,
  age = 30,
  aaOD = 8,
  aaOS = 8,
  flipper = 12,
  npc = 6,
  viewMode = 'basic',
  addPower = 0
}: ResultsSectionProps) => {
  const { t, language } = useLanguage();

  const priorityStyles = {
    Treat: 'bg-destructive text-destructive-foreground',
    Monitor: 'bg-warning text-warning-foreground',
    'Refer/VT': 'bg-success text-success-foreground',
  };

  const priorityLabels = {
    Treat: t('needsTreatment'),
    Monitor: t('monitor'),
    'Refer/VT': t('good'),
  };

  const basicSuggestions = getBasicSuggestions(result);

  // 構建雙眼視資料結構（與 OEPChartEnhanced 使用相同計算）
  const binocularData: BinocularDataPoints = {
    distance: {
      phoria: distPhoria,
      BI: { blur: distBiBlur ?? undefined, break: distBiBreak ?? 7, recovery: distBiRecovery },
      BO: { blur: distBoBlur ?? undefined, break: distBoBreak ?? 9, recovery: distBoRecovery },
    },
    near: {
      phoria: nearPhoria,
      BI: { blur: biBlur ?? undefined, break: biBreak, recovery: biRecovery },
      BO: { blur: boBlur ?? undefined, break: boBreak, recovery: boRecovery },
    },
  };

  // 使用統一的診斷計算函數
  const diagnosticResults = calculateDiagnosticResults(binocularData, language);
  
  // 從統一計算結果中提取判讀
  const morganDistPass = diagnosticResults.morgan.distance;
  const morganNearPass = diagnosticResults.morgan.near;
  const sheardDistPass = diagnosticResults.sheard.distance;
  const sheardNearPass = diagnosticResults.sheard.near;
  const percivalDistPass = diagnosticResults.percival.distance;
  const percivalNearPass = diagnosticResults.percival.near;
  
  // 為訓練需求計算和顯示保留原始值
  const sheardDemand = Math.abs(nearPhoria) * 2;
  const sheardReserve = nearPhoria < 0 ? boBreak : biBreak;
  const distSheardReserve = distPhoria < 0 ? (distBoBreak || 9) : (distBiBreak || 7);
  const totalNear = biBreak + boBreak;

  // Training needs for pro/expert
  const avgAA = (aaOD + aaOS) / 2;
  const expectedAA = Math.max(0, 15 - 0.25 * age);

  const trainingNeeds: { category: string; target: string; sop: string[] }[] = [];

  // Helper for bilingual SOP text
  const isCN = t('loading') === '加载中...';

  if (!sheardNearPass || !sheardDistPass) {
    trainingNeeds.push({
      category: nearPhoria < 0 ? t('boPositiveFusion') : t('biNegativeFusion'),
      target: `${t('enhanceReserveTo')}${nearPhoria < 0 ? 'BO' : 'BI'} ${Math.ceil(sheardDemand)}Δ ${t('orAbove')}`,
      sop: nearPhoria < 0 
        ? [
            isCN ? 'Pencil Push-ups：铅笔由远推近，维持单一影像' : 'Pencil Push-ups：鉛筆由遠推近，維持單一影像',
            isCN ? 'Brock String：三颗珠子训练融像' : 'Brock String：三顆珠子訓練融像',
            isCN ? 'BO Prism Training：逐渐增加棱镜量' : 'BO Prism Training：逐漸增加稜鏡量'
          ]
        : [
            isCN ? 'Lifesaver Card：负向融像训练' : 'Lifesaver Card：負向融像訓練',
            isCN ? '散开运动：注视远方后快速看近' : '散開運動：注視遠方後快速看近',
            isCN ? 'BI Prism Training：逐渐增加 BI 棱镜' : 'BI Prism Training：逐漸增加 BI 稜鏡'
          ]
    });
  }

  if (npc > 6) {
    trainingNeeds.push({
      category: t('npcConvergence'),
      target: `${npc} cm → 6 cm`,
      sop: [
        isCN ? 'Pencil Push-ups：每日 3 组 × 20 次' : 'Pencil Push-ups：每日 3 組 × 20 次',
        isCN ? 'Brock String 辐辏训练' : 'Brock String 輻輳訓練',
        isCN ? '辐辏卡近距离训练' : '輻輳卡近距離訓練'
      ]
    });
  }

  if (avgAA < expectedAA) {
    trainingNeeds.push({
      category: t('accommodationAmplitudeTraining'),
      target: `${avgAA.toFixed(1)} D → ${expectedAA.toFixed(1)} D`,
      sop: [
        isCN ? 'Push-up 调节训练：由远推近测量' : 'Push-up 調節訓練：由遠推近測量',
        isCN ? 'Minus Lens 训练：逐渐增加负镜量' : 'Minus Lens 訓練：逐漸增加負鏡量',
        isCN ? '目标：提升至期望值' : '目標：提升至期望值'
      ]
    });
  }

  if (flipper < 12) {
    trainingNeeds.push({
      category: t('accommodationFacilityTraining'),
      target: `${flipper} cpm → 12 cpm`,
      sop: [
        isCN ? '±2.00 Flipper 训练：双眼交替清晰' : '±2.00 Flipper 訓練：雙眼交替清晰',
        isCN ? 'Hart Chart：远近交替注视' : 'Hart Chart：遠近交替注視',
        isCN ? '每日练习 5 分钟' : '每日練習 5 分鐘'
      ]
    });
  }

  // 計算情境建議方案（用於 Pro/Expert 模式）
  const cissScore = typeof result.ciss === 'object' ? result.ciss.score : (result.ciss || 0);
  const primaryAnalysis = analyzePrimaryDistance(
    distPhoria, 
    nearPhoria, 
    npc, 
    boBreak, 
    biBreak, 
    cissScore
  );
  
  const prismRec = generatePrismRecommendation(
    primaryAnalysis,
    sheardNearPass && sheardDistPass,
    percivalNearPass && percivalDistPass,
    distPhoria,
    nearPhoria,
    cissScore
  );
  
  const scenarioRecommendations = generateAllScenarioRecommendations(
    primaryAnalysis.pattern,
    prismRec,
    cissScore,
    age,
    language === 'zh-CN' ? 'zh-CN' : language === 'en' ? 'en' : 'zh-TW'
  );

  // 判斷預設情境
  const getDefaultScenario = (): 'A' | 'B' | 'C' => {
    if (cissScore >= 21) return 'A';
    if (cissScore < 16) return 'C';
    return 'B';
  };

  return (
    <div className="space-y-4 md:space-y-5 animate-slide-up">
      {/* 卡片 1：健康分數 + 診斷 - Enhanced with hover-lift */}
      <div className="bg-card p-5 md:p-6 rounded-2xl shadow-card border border-border relative overflow-hidden hover-lift">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
        <div className="flex justify-between items-start mb-4 border-b border-border/50 pb-4">
          <div className="flex-1">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {t('clinicalDiagnosis')}
            </div>
            {/* Phase 2 Task 5: Enhanced diagnosis title - 28px mobile, font-weight 700 */}
            <h2 className="text-[28px] md:text-2xl font-extrabold text-foreground leading-snug mb-2 animate-fade-in">
              {t(result.diag.nameKey as any)}
              {result.diag.secondaryKey && t(result.diag.secondaryKey as any)}
            </h2>
            {result.diag.secondaryKey && viewMode === 'basic' && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t(result.diag.secondaryKey as any)}</p>
            )}
            {/* Phase 2 Task 5: Badges with enhanced pulse animation for priority */}
            <div className="flex gap-2 mt-3 flex-wrap stagger-fade-in">
              {viewMode !== 'basic' && (
                <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md font-medium animate-badge-pop">
                  AC/A: {result.aca.val} ({result.aca.category})
                </span>
              )}
              {result.accom.status !== 'Normal' && viewMode !== 'basic' && (
                <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-md font-medium animate-badge-pop">
                  {result.accom.status}
                </span>
              )}
              {/* Task 5: "需處置" label - 16px font, 8px 16px padding, pulse animation */}
              <span className={cn(
                "px-4 py-2 text-base rounded-lg font-bold animate-badge-pop",
                result.priority === 'Treat' && "animate-pulse",
                priorityStyles[result.priority as keyof typeof priorityStyles] || 'bg-secondary text-secondary-foreground'
              )}>
                {priorityLabels[result.priority as keyof typeof priorityLabels] || result.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts - Enhanced visibility */}
        {result.alerts.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/15 p-3 rounded-xl space-y-2 animate-pulse-slow">
            {result.alerts.map((a, i) => (
              <div key={i} className="text-sm font-medium text-destructive flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{a}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 卡片 2：生活干擾區塊 - 所有模式都有 */}
      <LifeInterferenceSection
        result={result}
        viewMode={viewMode}
        npc={npc}
        flipper={flipper}
        age={age}
      />

      {/* 卡片 3：給客戶的 3 個重點建議 (Basic Mode) */}
      {viewMode === 'basic' && (
        <div className="bg-card p-5 md:p-6 rounded-2xl shadow-card border border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-success/60 via-success/30 to-transparent" />
          <BasicSuggestions suggestions={basicSuggestions} />
        </div>
      )}

      {/* Pro + Expert: OEP Graph */}
      {(viewMode === 'pro' || viewMode === 'expert') && (
        <>
          {/* Consistency Messages */}
          {result.consistency.length > 0 && (
            <div className="bg-warning/5 border border-warning/15 p-3 rounded-xl space-y-2">
              {result.consistency.map((a, i) => (
                <div key={i} className="text-sm font-medium text-foreground flex items-center gap-2 leading-relaxed">
                  {a}
                </div>
              ))}
            </div>
          )}

          {/* 卡片 3：OEP Graph Section - Enhanced visual priority with responsive design */}
          <div className="bg-card p-4 md:p-6 rounded-2xl shadow-lg border-2 border-primary/20 relative overflow-hidden card-interactive">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-chart-1 to-transparent" />
            <h4 className="text-lg md:text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <BarChart2 className="w-6 h-6" />
              {t('oepChart')}
            </h4>
            
            {/* Phase 3: Responsive layout - stack on mobile, side-by-side on large screens */}
            <div className="flex flex-col xl:flex-row gap-4">
              {/* Graph - Enhanced size and prominence with responsive sizing */}
              <div className="flex-1 bg-white dark:bg-gray-950 p-3 md:p-4 rounded-xl border-2 border-border shadow-sm min-h-[420px] md:min-h-[500px] xl:min-h-[550px]">
                <OEPChartTabs
                  distPhoria={distPhoria}
                  nearPhoria={nearPhoria}
                  nearBiBreak={biBreak}
                  nearBoBreak={boBreak}
                  distBiBreak={distBiBreak ?? 7}
                  distBoBreak={distBoBreak ?? 9}
                  nearBiBlur={biBlur ?? undefined}
                  nearBoBlur={boBlur ?? undefined}
                  distBiBlur={distBiBlur ?? undefined}
                  distBoBlur={distBoBlur ?? undefined}
                  nearBiRecovery={biRecovery}
                  nearBoRecovery={boRecovery}
                  distBiRecovery={distBiRecovery}
                  distBoRecovery={distBoRecovery}
                  pd={pd}
                  age={age}
                  aa={Math.min(aaOD, aaOS)}
                />
              </div>
              
              {/* Side Panel - AC/A & Accommodation - Collapsible on mobile */}
              <div className="xl:w-48 grid grid-cols-2 xl:grid-cols-1 gap-3">
                {/* AC/A Ratio Card - Task 5: Enhanced number sizes with reliability indicator */}
                <div className="bg-secondary/40 p-4 rounded-xl border border-border/50 hover-lift">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs md:text-[11px] font-semibold text-primary uppercase tracking-wide">
                      AC/A ({result.aca.method.toUpperCase()})
                    </div>
                    {/* Reliability indicator */}
                    {result.aca.reliability && (
                      <span className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                        result.aca.reliability === 'high' ? "bg-success/20 text-success" :
                        result.aca.reliability === 'low' ? "bg-warning/20 text-warning" :
                        "bg-primary/20 text-primary"
                      )}>
                        {result.aca.reliability === 'high' ? '✓' : 
                         result.aca.reliability === 'low' ? '⚠️' : '○'}
                      </span>
                    )}
                  </div>
                  <div className="text-[40px] md:text-3xl font-bold text-foreground flex items-baseline gap-1 leading-none">
                    {result.aca.val}
                    <span className="text-[22px] md:text-lg text-muted-foreground font-medium">: 1</span>
                  </div>
                  {viewMode === 'expert' && (
                    <div className="text-xs md:text-[11px] text-muted-foreground mt-2">
                      Calc: {result.aca.calc}{result.aca.reliability === 'low' && result.aca.grad === null ? ' ⚠️' : ''} | Grad: {result.aca.grad ?? '-'}
                    </div>
                  )}
                  {/* Gradient recommendation alert */}
                  {result.aca.needsGradient && result.aca.grad === null && viewMode === 'expert' && (
                    <div className="mt-2 text-[10px] text-warning bg-warning/10 px-2 py-1 rounded">
                      {language === 'en' ? '⚠️ Gradient AC/A recommended' : 
                       language === 'zh-CN' ? '⚠️ 建议补测梯度法' : '⚠️ 建議補測梯度法'}
                    </div>
                  )}
                </div>
                
                {/* Accommodation Card - Enhanced number sizes and spacing */}
                <div className="bg-card p-4 rounded-xl border border-border/50 hover-lift">
                  <div className="text-xs md:text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    ACCOMMODATION
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base md:text-sm font-medium text-foreground">NRA:</span>
                      <span className="text-xl md:text-base font-bold text-foreground">{nra > 0 ? '+' : ''}{nra}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base md:text-sm font-medium text-foreground">PRA:</span>
                      <span className="text-xl md:text-base font-bold text-foreground">{pra}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base md:text-sm font-medium text-foreground">BCC:</span>
                      <span className="text-xl md:text-base font-bold text-foreground">{mem > 0 ? '+' : ''}{mem}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Critical 警告區塊 - Enhanced visibility */}
            {diagnosticResults.warnings.length > 0 && (
              <div className="mt-4 p-4 bg-destructive/15 border-l-4 border-destructive rounded-r-xl shadow-sm animate-pulse-slow">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-destructive text-base">
                      🚨 {language === 'en' ? 'Critical Abnormality Detected' : language === 'zh-CN' ? '严重异常检测' : '嚴重異常檢測'}
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {diagnosticResults.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-destructive font-medium flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                    {!sheardNearPass && (
                      <div className="mt-3 text-sm text-destructive/90 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                        <span className="font-semibold">Sheard {t('near')}:</span> {language === 'en' ? 'Reserve' : language === 'zh-CN' ? '储备' : '儲備'} {sheardReserve}Δ &lt; {language === 'en' ? 'Demand' : language === 'zh-CN' ? '需求' : '需求'} {sheardDemand}Δ
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* 評分顯示 - Enhanced with score ring style */}
            <div className="mt-4 flex items-center justify-between p-4 bg-gradient-to-r from-secondary/70 to-secondary/40 rounded-xl border border-border/50 hover-lift">
              <span className="text-base font-semibold text-foreground">
                {language === 'en' ? 'Overall Score' : language === 'zh-CN' ? '综合评分' : '綜合評分'}
              </span>
              <div className="flex items-center gap-3">
                {/* Phase 2: Animated score display */}
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                    <circle 
                      cx="32" cy="32" r="28" fill="none" 
                      stroke={diagnosticResults.overallScore >= 80 ? "hsl(var(--clinical-normal))" : diagnosticResults.overallScore >= 60 ? "hsl(var(--clinical-warning))" : "hsl(var(--clinical-abnormal))"}
                      strokeWidth="5" 
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - diagnosticResults.overallScore / 100)}`}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn(
                      "text-xl font-bold",
                      diagnosticResults.overallScore >= 80 ? "text-success" :
                      diagnosticResults.overallScore >= 60 ? "text-warning" : "text-destructive"
                    )}>
                      {diagnosticResults.overallScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 卡片 4：建議處置方案（依情境選擇）- Pro/Expert 模式 */}
          <div className="animate-fade-in">
            <ScenarioRecommendations 
              scenarios={scenarioRecommendations}
              defaultScenario={getDefaultScenario()}
              language={language === 'zh-CN' ? 'zh-CN' : language === 'en' ? 'en' : 'zh-TW'}
            />
          </div>

          {/* 卡片 4.5：ADD 處方影響預測（當 ADD > 0.5D 時顯示）*/}
          {addPower > 0.5 && viewMode === 'expert' && (
            <div className="animate-fade-in">
              <ADDImpactPredictor
                gradientACA={result.aca.grad ?? 0}
                calculatedACA={result.aca.calc}
                addPower={addPower}
                nearPhoria={nearPhoria}
                distPhoria={distPhoria}
                diagnosisType={result.diag.code}
                aaDeficit={Math.max(0, (18.5 - 0.3 * age) - ((aaOD + aaOS) / 2))}
                age={age}
                nearBIBreak={biBreak}
                nearBOBreak={boBreak}
              />
            </div>
          )}

          {/* 卡片 5：Morgan/Sheard/Percival Summary - Mobile optimized */}
          <div className="bg-card p-5 md:p-6 rounded-2xl shadow-card border border-border relative overflow-hidden hover-lift">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-warning/50 via-warning/25 to-transparent" />
            <h4 className="text-lg md:text-base font-semibold text-foreground mb-4">{t('criteriaSummary')}</h4>
            <div className="space-y-3 md:space-y-2.5 stagger-fade-in">
              {/* Morgan */}
              <div className="flex items-start gap-3 md:gap-2 flex-wrap p-3 md:p-2 rounded-xl md:rounded-lg bg-secondary/20 md:bg-transparent hover:bg-secondary/30 transition-colors">
                <span className="font-semibold text-base md:text-sm text-foreground min-w-[80px] md:min-w-[70px]">Morgan：</span>
                <span className="text-base md:text-sm leading-relaxed flex-1 text-foreground/80 md:text-foreground/70 flex items-center flex-wrap gap-1">
                  {t('distance')} {morganDistPass ? <CheckCircle className="inline w-5 h-5 md:w-4 md:h-4 text-success animate-badge-pop" /> : <XCircle className="inline w-5 h-5 md:w-4 md:h-4 text-destructive animate-badge-pop" />}
                  <span className="mx-1">，</span>
                  {t('near')} {morganNearPass ? <CheckCircle className="inline w-5 h-5 md:w-4 md:h-4 text-success animate-badge-pop" /> : <XCircle className="inline w-5 h-5 md:w-4 md:h-4 text-destructive animate-badge-pop" />}
                  {!morganNearPass && <span className="text-muted-foreground ml-1 text-sm md:text-xs block md:inline w-full md:w-auto mt-1 md:mt-0">（{t('nearPhoriaOutOfComfort')}）</span>}
                </span>
                <WhyButton 
                  explanation={t('morganExplanation')}
                  className="flex-shrink-0 min-h-[44px] md:min-h-0"
                />
              </div>
              
              {/* Sheard */}
              <div className="flex items-start gap-3 md:gap-2 flex-wrap p-3 md:p-2 rounded-xl md:rounded-lg bg-secondary/20 md:bg-transparent hover:bg-secondary/30 transition-colors">
                <span className="font-semibold text-base md:text-sm text-foreground min-w-[80px] md:min-w-[70px]">Sheard：</span>
                <span className="text-base md:text-sm leading-relaxed flex-1 text-foreground/80 md:text-foreground/70 flex items-center flex-wrap gap-1">
                  {t('distance')} {sheardDistPass ? <CheckCircle className="inline w-5 h-5 md:w-4 md:h-4 text-success animate-badge-pop" /> : <XCircle className="inline w-5 h-5 md:w-4 md:h-4 text-destructive animate-badge-pop" />}
                  <span className="mx-1">，</span>
                  {t('near')} {sheardNearPass ? <CheckCircle className="inline w-5 h-5 md:w-4 md:h-4 text-success animate-badge-pop" /> : <XCircle className="inline w-5 h-5 md:w-4 md:h-4 text-destructive animate-badge-pop" />}
                  {!sheardNearPass && <span className="text-muted-foreground ml-1 text-sm md:text-xs block md:inline w-full md:w-auto mt-1 md:mt-0">（{t('nearReserveInsufficient')}）</span>}
                </span>
                <WhyButton 
                  explanation={t('sheardExplanation')}
                  className="flex-shrink-0 min-h-[44px] md:min-h-0"
                />
              </div>
              
              {/* Percival */}
              <div className="flex items-start gap-3 md:gap-2 flex-wrap p-3 md:p-2 rounded-xl md:rounded-lg bg-secondary/20 md:bg-transparent hover:bg-secondary/30 transition-colors">
                <span className="font-semibold text-base md:text-sm text-foreground min-w-[80px] md:min-w-[70px]">Percival：</span>
                <span className="text-base md:text-sm leading-relaxed flex-1 text-foreground/80 md:text-foreground/70 flex items-center flex-wrap gap-1">
                  {t('distance')} {percivalDistPass ? <CheckCircle className="inline w-5 h-5 md:w-4 md:h-4 text-success animate-badge-pop" /> : <XCircle className="inline w-5 h-5 md:w-4 md:h-4 text-destructive animate-badge-pop" />}
                  <span className="mx-1">，</span>
                  {t('near')} {percivalNearPass ? <CheckCircle className="inline w-5 h-5 md:w-4 md:h-4 text-success animate-badge-pop" /> : <XCircle className="inline w-5 h-5 md:w-4 md:h-4 text-destructive animate-badge-pop" />}
                  {!percivalDistPass && <span className="text-muted-foreground ml-1 text-sm md:text-xs block md:inline w-full md:w-auto mt-1 md:mt-0">（{t('distanceBIWeak')}）</span>}
                </span>
                <WhyButton 
                  explanation={t('percivalExplanation')}
                  className="flex-shrink-0 min-h-[44px] md:min-h-0"
                />
              </div>

              {/* Expert mode: 顯示詳細數值 - Phase 3: Progressive disclosure */}
              {viewMode === 'expert' && (
                <div className="mt-4 md:mt-3 pt-4 md:pt-3 border-t border-border/50 text-sm md:text-[11px] text-muted-foreground space-y-2 md:space-y-1 leading-relaxed bg-muted/30 p-4 md:p-3 rounded-xl md:rounded-lg stagger-fade-in">
                  <div className="font-medium text-foreground/70 mb-3 md:mb-2 text-sm md:text-xs uppercase tracking-wide">
                    {language === 'en' ? 'Detailed Calculations' : language === 'zh-CN' ? '详细计算' : '詳細計算'}
                  </div>
                  <div className="font-mono text-sm md:text-[11px]">{t('sheardNearDemand')} {Math.abs(nearPhoria) * 2}Δ，{t('sheardNearActual')} {sheardReserve}Δ</div>
                  <div className="font-mono text-sm md:text-[11px]">{t('sheardDistDemand')} {Math.abs(distPhoria) * 2}Δ，{t('sheardNearActual')} {distSheardReserve}Δ</div>
                  <div className="font-mono text-sm md:text-[11px]">{t('percivalNear')} {biBreak}Δ / BO {boBreak}Δ，{t('weakerSideNeed')} {(totalNear / 3).toFixed(1)}Δ</div>
                </div>
              )}
            </div>
          </div>

          {/* 卡片 6：稜鏡建議 + 訓練方向 - Mobile optimized */}
          {(result.mgmt.some(m => m.includes('稜鏡') || m.includes('Prism') || m.includes('棱镜')) || trainingNeeds.length > 0) && (
            <div className="bg-card p-5 md:p-6 rounded-2xl shadow-card border border-border relative overflow-hidden space-y-5 md:space-y-4">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-accent/50 via-accent/25 to-transparent" />
              {/* 稜鏡建議 */}
              {result.mgmt.some(m => m.includes('稜鏡') || m.includes('Prism') || m.includes('棱镜')) && (
                <div className="bg-primary/5 border border-primary/15 p-4 md:p-3 rounded-xl">
                  <h4 className="text-base md:text-sm font-semibold text-primary mb-3 md:mb-2">{t('prismAssistance')}</h4>
                  {viewMode === 'pro' ? (
                    <p className="text-base md:text-sm text-muted-foreground leading-relaxed">
                      {t('considerPrism')}{nearPhoria < 0 ? ' BI ' : ' BO '}{t('prismAfterTest')}
                    </p>
                  ) : (
                    <div className="text-base md:text-sm text-muted-foreground space-y-2 md:space-y-1">
                      {result.mgmt.filter(m => m.includes('稜鏡') || m.includes('Prism') || m.includes('棱镜')).map((m, i) => (
                        <p key={i} className="leading-relaxed">• {m}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 訓練建議 */}
              {trainingNeeds.length > 0 && (
                <div>
                  <h4 className="text-base md:text-sm font-semibold text-foreground mb-4 md:mb-3">{t('trainingDirection')}</h4>
                  <div className="space-y-3 md:space-y-2">
                    {trainingNeeds.map((need, idx) => (
                      <div key={idx} className="bg-accent/5 border border-accent/15 rounded-xl p-4 md:p-3">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3 md:mb-2">
                          <span className="font-semibold text-base md:text-sm text-foreground">{need.category}</span>
                          <span className="text-sm md:text-[11px] bg-accent/15 px-3 py-1.5 md:px-2 md:py-0.5 rounded-lg md:rounded text-accent-foreground self-start">{need.target}</span>
                        </div>
                        {viewMode === 'expert' ? (
                          <ul className="text-base md:text-sm text-muted-foreground space-y-2 md:space-y-1">
                            {need.sop.map((step, stepIdx) => (
                              <li key={stepIdx} className="leading-relaxed">• {step}</li>
                            ))}
                          </ul>
                        ) : (
                          <CollapsibleSection title={t('expandSteps')} className="min-h-[44px] md:min-h-0">
                            <ul className="space-y-2 md:space-y-1 text-base md:text-sm">
                              {need.sop.map((step, stepIdx) => (
                                <li key={stepIdx} className="leading-relaxed">• {step}</li>
                              ))}
                            </ul>
                          </CollapsibleSection>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 卡片 7：Professor Commentary - Pro + Expert - Mobile optimized with better readability */}
      {(viewMode === 'pro' || viewMode === 'expert') && (
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden hover-lift">
          {/* Header with better contrast */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200/50 dark:border-amber-800/30 p-4 md:p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <GraduationCap className="w-14 h-14 md:w-16 md:h-16 text-amber-600" />
            </div>
            <div className="font-bold text-amber-700 dark:text-amber-400 mb-1 text-base md:text-sm flex items-center gap-2">
              <GraduationCap className="w-5 h-5 md:w-4 md:h-4" />
              {t('professorInterpretation')}
            </div>
          </div>
          {/* Content with high contrast */}
          <div className="p-5 md:p-6 bg-card">
            <CollapsibleSection 
              title={t('importantPoints')} 
              defaultOpen={viewMode === 'expert'} 
              className="border-l-amber-400/50 min-h-[44px] md:min-h-0"
            >
              <div className="text-base md:text-sm leading-8 md:leading-7 text-foreground whitespace-pre-wrap">
                {result.commentaryParts.map((part, idx) => {
                  let text = t(part.key as any);
                  if (part.params) {
                    Object.entries(part.params).forEach(([key, val]) => {
                      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
                    });
                  }
                  return <span key={idx}>{text}{idx < result.commentaryParts.length - 1 ? '\n' : ''}</span>;
                })}
              </div>
            </CollapsibleSection>
          </div>
        </div>
      )}

      {/* 卡片 8：Management & Lens - 所有模式 - Mobile optimized */}
      <div className="bg-card p-5 md:p-6 rounded-2xl shadow-card border border-border relative overflow-hidden hover-lift">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/50 via-secondary/30 to-transparent" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-4">
          {/* Management Recommendations */}
          <div className="bg-primary/5 border border-primary/15 p-5 md:p-4 rounded-xl">
            <h4 className="text-base md:text-sm font-semibold text-primary uppercase mb-4 md:mb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 md:w-4 md:h-4" />
              {viewMode === 'basic' ? t('keyRecommendations') : t('trainingDirection')}
            </h4>
            <ul className="space-y-3 md:space-y-2">
              {viewMode === 'basic' ? (
                getSimplifiedManagement(result.mgmt, result).length > 0 ? (
                  getSimplifiedManagement(result.mgmt, result).map((m, i) => (
                    <li key={i} className="flex gap-3 md:gap-2 text-base md:text-sm text-foreground/80 font-medium leading-relaxed">
                      <span className="text-primary/70 flex-shrink-0">•</span>
                      <span>{m.fallbackText || t(m.textKey)}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-base md:text-sm text-muted-foreground">{t('normal')}</li>
                )
              ) : (
                result.mgmt.length > 0 ? (
                  result.mgmt.map((m, i) => (
                    <li key={i} className="flex gap-3 md:gap-2 text-base md:text-sm text-foreground/80 font-medium leading-relaxed">
                      <span className="text-primary/70 flex-shrink-0">•</span>
                      <span>{m}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-base md:text-sm text-muted-foreground">{t('normal')}</li>
                )
              )}
            </ul>
          </div>

          {/* Lens Recommendations */}
          <div className="bg-secondary/30 p-5 md:p-4 rounded-xl border border-border/50 flex flex-col justify-center">
            <div className="text-sm md:text-[11px] font-semibold text-muted-foreground uppercase mb-3 md:mb-2 flex items-center gap-2">
              <Glasses className="w-5 h-5 md:w-4 md:h-4" />
              {t('lens')}
            </div>
            <div className="font-bold text-xl md:text-lg text-foreground">{t(result.lensRec.titleKey as any)}</div>
            <div className="text-base md:text-sm text-muted-foreground mt-2 md:mt-1 leading-relaxed">
              {t(result.lensRec.descKey as any).replace(/\{(\w+)\}/g, (_, key) => 
                String(result.lensRec.descParams?.[key] ?? `{${key}}`)
              )}
            </div>
          </div>
        </div>

        {/* 免責聲明 */}
        <div className="mt-5 md:mt-4 pt-4 border-t border-border/50">
          <p className="text-sm md:text-[11px] text-muted-foreground text-center leading-relaxed">
            {t('loading') === '載入中...' 
              ? '本報告僅為臨床決策輔助工具，最終診斷與處方需由合格專業人員判斷。'
              : '本报告仅为临床决策辅助工具，最终诊断与处方需由合格专业人员判断。'}
          </p>
        </div>
      </div>
    </div>
  );
};
