import { useLanguage } from '@/contexts/LanguageContext';
import { CalculationResult } from '@/lib/calculateLogic';
import { Maximize2, CheckCircle, AlertTriangle, XCircle, ArrowLeftRight, Info } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { cn } from '@/lib/utils';

interface VergenceReserveCardProps {
  result: CalculationResult;
  distPhoria: number;
  nearPhoria: number;
  biBreak: number;
  boBreak: number;
  distBiBreak?: number;
  distBoBreak?: number;
}

export const VergenceReserveCard = ({
  result,
  distPhoria,
  nearPhoria,
  biBreak,
  boBreak,
  distBiBreak = 7,
  distBoBreak = 9,
}: VergenceReserveCardProps) => {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';

  // Sheard's Criterion calculations
  const calcSheard = (phoria: number, biBreak: number, boBreak: number) => {
    const reserve = phoria < 0 ? boBreak : biBreak;
    const demand = Math.abs(phoria) * 2;
    const pass = reserve >= demand;
    const deficit = pass ? 0 : demand - reserve;
    return { reserve, demand, pass, deficit, direction: phoria < 0 ? 'BO' : 'BI' };
  };

  // Percival's Criterion calculations
  const calcPercival = (biBreak: number, boBreak: number) => {
    const total = biBreak + boBreak;
    const greaterReserve = Math.max(biBreak, boBreak);
    const lesserReserve = Math.min(biBreak, boBreak);
    const required = greaterReserve / 2;
    const pass = lesserReserve >= required;
    return { pass, lesserReserve, required, total };
  };

  const nearSheard = calcSheard(nearPhoria, biBreak, boBreak);
  const distSheard = calcSheard(distPhoria, distBiBreak, distBoBreak);
  const nearPercival = calcPercival(biBreak, boBreak);
  const distPercival = calcPercival(distBiBreak, distBoBreak);

  // Overall status
  const hasIssue = !nearSheard.pass || !distSheard.pass;

  // Reserve data for visualization
  const reserves = [
    {
      label: isEN ? 'Dist BI' : isCN ? '远用 BI' : '遠用 BI',
      value: distBiBreak,
      normal: 7,
      color: 'bg-blue-500'
    },
    {
      label: isEN ? 'Dist BO' : isCN ? '远用 BO' : '遠用 BO',
      value: distBoBreak,
      normal: 9,
      color: 'bg-emerald-500'
    },
    {
      label: isEN ? 'Near BI' : isCN ? '近用 BI' : '近用 BI',
      value: biBreak,
      normal: 21,
      color: 'bg-blue-500'
    },
    {
      label: isEN ? 'Near BO' : isCN ? '近用 BO' : '近用 BO',
      value: boBreak,
      normal: 21,
      color: 'bg-emerald-500'
    },
  ];

  const getStatusIcon = (pass: boolean) => {
    return pass ? (
      <CheckCircle size={16} className="text-success" />
    ) : (
      <XCircle size={16} className="text-destructive" />
    );
  };

  return (
    <ReportCard
      icon={Maximize2}
      title={isEN ? 'Fusional Reserve Analysis' : isCN ? '融像储备分析' : '融像儲備分析'}
      collapsible
      defaultOpen={hasIssue}
      variant="default"
    >
      <div className="space-y-4">
        {/* Reserve Bars Visualization */}
        <div className="expert-metric-box">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {isEN ? 'Fusional Reserve Values' : isCN ? '融像储备值' : '融像儲備值'}
          </h5>
          <div className="space-y-2.5">
            {reserves.map((r, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs font-medium text-foreground w-16 flex-shrink-0">
                  {r.label}
                </span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden relative">
                  <div 
                    className={cn("h-full rounded-full transition-all", r.color)}
                    style={{ width: `${Math.min(100, (r.value / Math.max(r.normal * 1.5, r.value)) * 100)}%` }}
                  />
                  {/* Normal marker */}
                  <div 
                    className="absolute top-0 h-full w-0.5 bg-foreground/40"
                    style={{ left: `${(r.normal / Math.max(r.normal * 1.5, r.value)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-foreground w-10 text-right">
                  {r.value}Δ
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            {isEN ? 'Black line marks Morgan normal expected values' : isCN ? '黑线标记为 Morgan 正常期望值' : '黑線標記為 Morgan 正常期望值'}
          </p>
        </div>

        {/* Sheard Criterion Analysis */}
        <div className="expert-metric-box">
          <div className="flex items-center gap-2 mb-3">
            <ArrowLeftRight size={16} className="text-expert" />
            <h5 className="text-sm font-semibold text-foreground">
              Sheard {isEN ? 'Criterion Analysis' : isCN ? '准则分析' : '準則分析'}
            </h5>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Distance */}
            <div className={cn(
              "p-3 rounded-lg border",
              distSheard.pass 
                ? "bg-success/5 border-success/20" 
                : "bg-destructive/5 border-destructive/20"
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {isEN ? 'Distance' : isCN ? '远用' : '遠用'}
                </span>
                {getStatusIcon(distSheard.pass)}
              </div>
              <div className="text-lg font-bold text-foreground mb-1">
                {distSheard.reserve}Δ / {distSheard.demand}Δ
              </div>
              <div className="text-[10px] text-muted-foreground">
                {isEN ? 'Reserve / Demand' : isCN ? '储备 / 需求' : '儲備 / 需求'} ({distSheard.direction})
              </div>
              {!distSheard.pass && (
                <div className="mt-2 text-xs text-destructive font-medium">
                  {isEN ? 'Deficit' : isCN ? '缺' : '缺'} {distSheard.deficit.toFixed(1)}Δ
                </div>
              )}
            </div>

            {/* Near */}
            <div className={cn(
              "p-3 rounded-lg border",
              nearSheard.pass 
                ? "bg-success/5 border-success/20" 
                : "bg-destructive/5 border-destructive/20"
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {isCN ? '近用' : '近用'}
                </span>
                {getStatusIcon(nearSheard.pass)}
              </div>
              <div className="text-lg font-bold text-foreground mb-1">
                {nearSheard.reserve}Δ / {nearSheard.demand}Δ
              </div>
              <div className="text-[10px] text-muted-foreground">
                {isCN ? '储备 / 需求' : '儲備 / 需求'} ({nearSheard.direction})
              </div>
              {!nearSheard.pass && (
                <div className="mt-2 text-xs text-destructive font-medium">
                  {isCN ? '缺' : '缺'} {nearSheard.deficit.toFixed(1)}Δ
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            {isCN 
              ? 'Sheard 准则：补偿性储备应 ≥ 眼位偏斜量的 2 倍，否则需考虑训练或棱镜处方。'
              : 'Sheard 準則：補償性儲備應 ≥ 眼位偏斜量的 2 倍，否則需考慮訓練或稜鏡處方。'}
          </p>
        </div>

        {/* Percival Criterion */}
        <div className="expert-metric-box">
          <div className="flex items-center gap-2 mb-3">
            <Maximize2 size={16} className="text-expert" />
            <h5 className="text-sm font-semibold text-foreground">
              Percival {isCN ? '准则' : '準則'}
            </h5>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className={cn(
              "p-3 rounded-lg border flex items-center gap-3",
              distPercival.pass 
                ? "bg-success/5 border-success/20" 
                : "bg-warning/5 border-warning/20"
            )}>
              <div className="flex-1">
                <span className="text-xs text-muted-foreground block mb-1">
                  {isCN ? '远用' : '遠用'}
                </span>
                <span className={cn(
                  "text-sm font-semibold",
                  distPercival.pass ? "text-success" : "text-warning"
                )}>
                  {distPercival.pass ? (isCN ? '通过' : '通過') : (isCN ? '边缘' : '邊緣')}
                </span>
              </div>
              {distPercival.pass ? (
                <CheckCircle size={18} className="text-success" />
              ) : (
                <AlertTriangle size={18} className="text-warning" />
              )}
            </div>
            
            <div className={cn(
              "p-3 rounded-lg border flex items-center gap-3",
              nearPercival.pass 
                ? "bg-success/5 border-success/20" 
                : "bg-warning/5 border-warning/20"
            )}>
              <div className="flex-1">
                <span className="text-xs text-muted-foreground block mb-1">
                  {isCN ? '近用' : '近用'}
                </span>
                <span className={cn(
                  "text-sm font-semibold",
                  nearPercival.pass ? "text-success" : "text-warning"
                )}>
                  {nearPercival.pass ? (isCN ? '通过' : '通過') : (isCN ? '边缘' : '邊緣')}
                </span>
              </div>
              {nearPercival.pass ? (
                <CheckCircle size={18} className="text-success" />
              ) : (
                <AlertTriangle size={18} className="text-warning" />
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            {isCN 
              ? 'Percival 准则：较小储备应 ≥ 较大储备的 1/2，确保舒适的中心带范围。'
              : 'Percival 準則：較小儲備應 ≥ 較大儲備的 1/2，確保舒適的中心帶範圍。'}
          </p>
        </div>

        {/* Clinical Interpretation */}
        <div className="flex items-start gap-2 pt-2 border-t border-border/50">
          <Info size={14} className="text-expert flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isCN 
              ? '融像储备是维持双眼单视的能力。储备不足会导致眼睛疲劳、头痛、阅读困难等症状。可透过视觉训练增强融像能力。'
              : '融像儲備是維持雙眼單視的能力。儲備不足會導致眼睛疲勞、頭痛、閱讀困難等症狀。可透過視覺訓練增強融像能力。'}
          </p>
        </div>
      </div>
    </ReportCard>
  );
};
