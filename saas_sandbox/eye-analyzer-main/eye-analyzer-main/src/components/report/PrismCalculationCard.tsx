import { useLanguage } from '@/contexts/LanguageContext';
import { CalculationResult } from '@/lib/calculateLogic';
import { 
  analyzePrimaryDistance, 
  generatePrismRecommendation,
  PrimaryDistanceAnalysis,
  PrismRecommendation 
} from '@/lib/binocularAnalysis';
import { Triangle, Calculator, CheckCircle, XCircle, Search, Lightbulb, ClipboardList, Eye, Dumbbell } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PrismCalculationCardProps {
  result: CalculationResult;
  nearPhoria: number;
  distPhoria: number;
  biBreak: number;
  boBreak: number;
  npc?: number;
  ciss?: number;
}

export const PrismCalculationCard = ({
  result,
  nearPhoria,
  distPhoria,
  biBreak,
  boBreak,
  npc = 6,
  ciss = 0,
}: PrismCalculationCardProps) => {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';
  const txt = (tw: string, cn: string, en: string) => isEN ? en : isCN ? cn : tw;

  // Sheard calculation
  const isExo = nearPhoria < 0;
  const sheardDemand = Math.abs(nearPhoria) * 2;
  const sheardReserve = isExo ? boBreak : biBreak;
  const sheardPass = sheardReserve >= sheardDemand;
  const sheardPrism = sheardPass ? 0 : Math.round(((2 * Math.abs(nearPhoria)) - sheardReserve) / 3 * 10) / 10;

  // Percival calculation
  const greater = Math.max(biBreak, boBreak);
  const lesser = Math.min(biBreak, boBreak);
  const percivalPass = lesser >= greater / 3;
  const percivalPrism = percivalPass ? 0 : Math.round((greater - (2 * lesser)) / 3 * 10) / 10;

  // Primary distance analysis
  const primaryAnalysis: PrimaryDistanceAnalysis = analyzePrimaryDistance(
    distPhoria,
    nearPhoria,
    npc,
    boBreak,
    biBreak,
    ciss
  );

  // Prism recommendation based on clinical analysis
  const prismRec: PrismRecommendation = generatePrismRecommendation(
    primaryAnalysis,
    sheardPass,
    percivalPass,
    distPhoria,
    nearPhoria,
    ciss
  );

  // Final prism recommendation from original calculation
  const hasPrismRec = result.finalRx.hPrism > 0;

  // Determine overall need for prism
  const needsPrism = !sheardPass || !percivalPass || prismRec.shouldRecommend;
  const criteriaConclusion = sheardPass && percivalPass 
    ? txt('臨床準則皆通過，融像儲備充足', '临床准则皆通过，融像储备充足', 'All clinical criteria passed, fusional reserves adequate')
    : txt('臨床準則未完全通過，需評估是否需要稜鏡輔助', '临床准则未完全通过，需评估是否需要棱镜辅助', 'Clinical criteria not fully met, evaluate need for prism assistance');

  return (
    <ReportCard
      icon={Triangle}
      title={txt('稜鏡計算詳情', '棱镜计算详情', 'Prism Calculation Details')}
      collapsible
      defaultOpen={false}
    >
      <div className="space-y-5 md:space-y-4">
        {/* ============================================ */}
        {/* 第一段：臨床標準判斷 */}
        {/* ============================================ */}
        <div className="bg-primary/5 border border-primary/20 p-5 md:p-4 rounded-xl">
          <div className="flex items-center gap-2.5 md:gap-2 mb-4 md:mb-3">
            <ClipboardList size={22} className="text-primary md:w-[18px] md:h-[18px]" />
            <h4 className="font-semibold text-foreground text-base md:text-sm">
              📋 {txt('臨床標準判斷', '临床标准判断', 'Clinical Criteria Assessment')}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-3 mb-4">
            {/* Sheard Criterion */}
            <div className="bg-background/60 p-4 md:p-3 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-3 md:mb-2">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="text-muted-foreground md:w-[14px] md:h-[14px]" />
                  <span className="text-base md:text-sm font-medium">Sheard Criterion</span>
                </div>
                {sheardPass ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-sm md:text-xs min-h-[32px] md:min-h-0 px-3 md:px-2">
                    <CheckCircle size={16} className="mr-1.5 md:w-3 md:h-3 md:mr-1" /> PASS
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-sm md:text-xs min-h-[32px] md:min-h-0 px-3 md:px-2">
                    <XCircle size={16} className="mr-1.5 md:w-3 md:h-3 md:mr-1" /> FAIL
                  </Badge>
                )}
              </div>
              <div className="text-sm md:text-xs text-muted-foreground space-y-1.5 md:space-y-0.5">
                <div className="min-h-[28px] md:min-h-0 flex items-center">{txt('儲備', '储备', 'Reserve')}: {sheardReserve}Δ ({isExo ? 'BO' : 'BI'})</div>
                <div className="min-h-[28px] md:min-h-0 flex items-center">{txt('需求', '需求', 'Demand')}: {sheardDemand}Δ (2×{Math.abs(nearPhoria)})</div>
                {!sheardPass && (
                  <div className="text-warning font-medium min-h-[28px] md:min-h-0 flex items-center">
                    {txt('建議稜鏡', '建议棱镜', 'Suggested Prism')}: {sheardPrism}Δ {isExo ? 'BI' : 'BO'}
                  </div>
                )}
              </div>
            </div>

            {/* Percival Criterion */}
            <div className="bg-background/60 p-4 md:p-3 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-3 md:mb-2">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="text-muted-foreground md:w-[14px] md:h-[14px]" />
                  <span className="text-base md:text-sm font-medium">Percival Criterion</span>
                </div>
                {percivalPass ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-sm md:text-xs min-h-[32px] md:min-h-0 px-3 md:px-2">
                    <CheckCircle size={16} className="mr-1.5 md:w-3 md:h-3 md:mr-1" /> PASS
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-sm md:text-xs min-h-[32px] md:min-h-0 px-3 md:px-2">
                    <XCircle size={16} className="mr-1.5 md:w-3 md:h-3 md:mr-1" /> FAIL
                  </Badge>
                )}
              </div>
              <div className="text-sm md:text-xs text-muted-foreground space-y-1.5 md:space-y-0.5">
                <div className="min-h-[28px] md:min-h-0 flex items-center">BI: {biBreak}Δ / BO: {boBreak}Δ</div>
                <div className="min-h-[28px] md:min-h-0 flex items-center">{txt('較弱側需', '较弱侧需', 'Weaker side needs')} ≥ {(greater / 3).toFixed(1)}Δ</div>
                {!percivalPass && (
                  <div className="text-warning font-medium min-h-[28px] md:min-h-0 flex items-center">
                    {txt('建議稜鏡', '建议棱镜', 'Suggested Prism')}: {percivalPrism}Δ
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conclusion */}
          <div className={cn(
            "p-4 md:p-3 rounded-lg text-base md:text-sm",
            sheardPass && percivalPass 
              ? "bg-success/10 text-success border border-success/20" 
              : "bg-warning/10 text-warning border border-warning/20"
          )}>
            <span className="font-medium">{txt('結論', '结论', 'Conclusion')}：</span>
            {criteriaConclusion}
          </div>
        </div>

        {/* ============================================ */}
        {/* 第二段：主要問題分析 */}
        {/* ============================================ */}
        <div className="bg-secondary/40 p-5 md:p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-2.5 md:gap-2 mb-4 md:mb-3">
            <Search size={22} className="text-primary md:w-[18px] md:h-[18px]" />
            <h4 className="font-semibold text-foreground text-base md:text-sm">
              🔍 {txt('主要問題分析', '主要问题分析', 'Primary Issue Analysis')}
            </h4>
          </div>

          <div className="space-y-4 md:space-y-3">
            {/* Diagnosis Type */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 min-h-[44px] md:min-h-0">
              <span className="text-base md:text-sm text-muted-foreground md:min-w-[80px]">
                {txt('診斷類型', '诊断类型', 'Diagnosis Type')}:
              </span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-base md:text-sm px-4 md:px-3 py-2 md:py-1 self-start min-h-[36px] md:min-h-0",
                  primaryAnalysis.pattern === 'NORMAL' 
                    ? "bg-success/10 text-success border-success/30"
                    : primaryAnalysis.pattern === 'CI' || primaryAnalysis.pattern === 'CE'
                    ? "bg-warning/10 text-warning border-warning/30"
                    : "bg-primary/10 text-primary border-primary/30"
                )}
              >
                {isEN ? primaryAnalysis.description : isCN ? primaryAnalysis.descriptionCN : primaryAnalysis.description}
              </Badge>
            </div>

            {/* Phoria Difference */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 min-h-[44px] md:min-h-0">
              <span className="text-base md:text-sm text-muted-foreground md:min-w-[80px]">
                {txt('遠近差異', '远近差异', 'Phoria Diff')}:
              </span>
              <span className="text-base md:text-sm font-medium text-foreground">
                {primaryAnalysis.phoriaDifference}Δ
                <span className="text-muted-foreground ml-2">
                  ({txt('遠', '远', 'Dist')} {distPhoria}Δ → {txt('近', '近', 'Near')} {nearPhoria}Δ)
                </span>
              </span>
            </div>

            {/* Primary Distance */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 min-h-[44px] md:min-h-0">
              <span className="text-base md:text-sm text-muted-foreground md:min-w-[80px]">
                {txt('主要距離', '主要距离', 'Primary Distance')}:
              </span>
              <span className="text-base md:text-sm font-medium text-foreground">
                {primaryAnalysis.primaryDistance === 'near' && txt('近距', '近距', 'Near')}
                {primaryAnalysis.primaryDistance === 'far' && txt('遠距', '远距', 'Distance')}
                {primaryAnalysis.primaryDistance === 'both' && txt('遠近皆有', '远近皆有', 'Both')}
                {primaryAnalysis.primaryDistance === 'none' && txt('無明顯問題', '无明显问题', 'No significant issue')}
              </span>
            </div>

            {/* Clinical Significance */}
            <div className="bg-muted/50 p-4 md:p-3 rounded-lg">
              <div className="flex items-start gap-2.5 md:gap-2">
                <Eye size={18} className="text-muted-foreground mt-0.5 flex-shrink-0 md:w-[14px] md:h-[14px]" />
                <p className="text-base md:text-sm text-muted-foreground leading-relaxed">
                  {isEN ? primaryAnalysis.clinicalSignificance : isCN ? primaryAnalysis.clinicalSignificanceCN : primaryAnalysis.clinicalSignificance}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* 第三段：建議處置 */}
        {/* ============================================ */}
        <div className={cn(
          "p-5 md:p-4 rounded-xl border",
          prismRec.shouldRecommend 
            ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700" 
            : "bg-success/5 border-success/20"
        )}>
          <div className="flex items-center gap-2.5 md:gap-2 mb-4 md:mb-3">
            <Lightbulb size={22} className={cn("md:w-[18px] md:h-[18px]", prismRec.shouldRecommend ? "text-amber-600" : "text-success")} />
            <h4 className="font-semibold text-foreground text-base md:text-sm">
              💡 {txt('建議處置', '建议处置', 'Recommended Treatment')}
            </h4>
          </div>

          {prismRec.shouldRecommend ? (
            <div className="space-y-4 md:space-y-3">
              {/* Priority Notice */}
              {prismRec.priority === 'secondary' && (
                <div className="flex items-center gap-2.5 md:gap-2 p-3 md:p-2 bg-primary/10 rounded-lg min-h-[48px] md:min-h-0">
                  <Dumbbell size={18} className="text-primary md:w-[14px] md:h-[14px]" />
                  <span className="text-base md:text-sm font-medium text-primary">
                    {txt('視覺訓練為首選 → 稜鏡為輔助', '视觉训练为首选 → 棱镜为辅助', 'Vision Training primary → Prism secondary')}
                  </span>
                </div>
              )}

              {/* Prism Recommendation */}
              <div className="bg-background/60 p-4 md:p-3 rounded-lg border border-border/50">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 md:mb-2">
                  <span className="text-base md:text-sm font-medium text-foreground">
                    {txt('稜鏡建議', '棱镜建议', 'Prism Recommendation')}
                  </span>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 min-h-[32px] md:min-h-0 px-3 md:px-2 text-sm md:text-xs">
                    {prismRec.distance === 'near' && txt('近用', '近用', 'Near')}
                    {prismRec.distance === 'far' && txt('遠用', '远用', 'Distance')}
                    {prismRec.distance === 'both' && txt('全天', '全天', 'Full-time')}
                    {' '}{prismRec.direction !== 'none' && prismRec.direction}
                  </Badge>
                </div>
                <p className="text-base md:text-sm text-muted-foreground leading-relaxed">
                  {isEN ? prismRec.rationale : isCN ? prismRec.rationaleCN : prismRec.rationale}
                </p>
              </div>

              {/* Calculated Prism Amount */}
              {(sheardPrism > 0 || percivalPrism > 0 || hasPrismRec) && (
                <div className="bg-background/60 p-4 md:p-3 rounded-lg border border-border/50">
                  <span className="text-base md:text-sm text-muted-foreground">
                    {txt('計算量', '计算量', 'Calculated Amount')}:
                  </span>
                  <span className="ml-2 text-xl md:text-lg font-bold text-primary">
                    {hasPrismRec 
                      ? `${result.finalRx.hPrism.toFixed(1)}Δ ${result.finalRx.hBase}`
                      : sheardPrism > 0 
                        ? `${sheardPrism}Δ ${isExo ? 'BI' : 'BO'}`
                        : `${percivalPrism}Δ`
                    }
                  </span>
                  <span className="ml-2 text-sm md:text-xs text-muted-foreground">
                    ({txt('建議臨床試戴確認', '建议临床试戴确认', 'Clinical trial recommended')})
                  </span>
                </div>
              )}

              {/* Alternatives */}
              <div className="bg-muted/50 p-4 md:p-3 rounded-lg">
                <span className="text-base md:text-sm font-medium text-foreground block mb-3 md:mb-2">
                  {txt('替代方案', '替代方案', 'Alternatives')}:
                </span>
                <ul className="text-base md:text-sm text-muted-foreground space-y-2.5 md:space-y-1">
                  {(isEN ? prismRec.alternatives : isCN ? prismRec.alternativesCN : prismRec.alternatives).map((alt, i) => (
                    <li key={i} className="flex items-center gap-2.5 md:gap-2 min-h-[32px] md:min-h-0">
                      <span className="w-2 h-2 md:w-1.5 md:h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                      <span className="leading-relaxed">{alt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-3">
              <div className="flex items-center gap-2.5 md:gap-2 min-h-[44px] md:min-h-0">
                <CheckCircle size={22} className="text-success md:w-[18px] md:h-[18px]" />
                <span className="text-base md:text-sm font-medium text-success">
                  {txt('目前不需要稜鏡輔助', '目前不需要棱镜辅助', 'No prism assistance needed')}
                </span>
              </div>
              <p className="text-base md:text-sm text-muted-foreground leading-relaxed">
                {isEN ? prismRec.rationale : isCN ? prismRec.rationaleCN : prismRec.rationale}
              </p>
              
              {/* Alternatives for non-prism cases */}
              {prismRec.alternatives.length > 0 && (
                <div className="bg-muted/50 p-4 md:p-3 rounded-lg">
                  <span className="text-base md:text-sm font-medium text-foreground block mb-3 md:mb-2">
                    {txt('建議', '建议', 'Recommendations')}:
                  </span>
                  <ul className="text-base md:text-sm text-muted-foreground space-y-2.5 md:space-y-1">
                    {(isEN ? prismRec.alternatives : isCN ? prismRec.alternativesCN : prismRec.alternatives).map((alt, i) => (
                      <li key={i} className="flex items-center gap-2.5 md:gap-2 min-h-[32px] md:min-h-0">
                        <span className="w-2 h-2 md:w-1.5 md:h-1.5 rounded-full bg-success/50 flex-shrink-0" />
                        <span className="leading-relaxed">{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Vertical Prism */}
          {result.vRes.has && (
            <div className="mt-4 md:mt-3 pt-4 md:pt-3 border-t border-border/50">
              <span className="text-base md:text-sm text-muted-foreground">{txt('垂直稜鏡', '垂直棱镜', 'Vertical Prism')}:</span>
              <span className="ml-2 font-semibold text-warning text-lg md:text-base">
                {result.vRes.val}Δ {result.vRes.base}
              </span>
            </div>
          )}
        </div>
      </div>
    </ReportCard>
  );
};
