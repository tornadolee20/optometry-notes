import { useLanguage } from '@/contexts/LanguageContext';
import { CalculationResult } from '@/lib/calculateLogic';
import { Brain, ArrowRight, Calculator } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { cn } from '@/lib/utils';

interface DiagnosticLogicCardProps {
  result: CalculationResult;
  pd: number;
  distPhoria: number;
  nearPhoria: number;
  workDist: number;
}

export const DiagnosticLogicCard = ({
  result,
  pd,
  distPhoria,
  nearPhoria,
  workDist,
}: DiagnosticLogicCardProps) => {
  const { t, language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';

  const effectiveDemand = 100 / (workDist || 40);
  const pdInCm = pd / 10;

  // Diagnostic decision tree
  const diagnosisLogic = getDiagnosisLogic(result.diag.code, result.aca.category, language);

  return (
    <ReportCard
      icon={Brain}
      title={isEN ? 'Diagnostic Logic' : isCN ? '诊断逻辑推导' : '診斷邏輯推導'}
      collapsible
      defaultOpen={false}
    >
      <div className="space-y-4">
        {/* AC/A Calculation Formula */}
        <div className="bg-secondary/40 p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Calculator size={16} className="text-primary" />
            <h5 className="text-sm font-semibold text-foreground">
              {isEN ? 'AC/A Calculation Formula' : isCN ? 'AC/A 计算公式' : 'AC/A 計算公式'}
            </h5>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg mb-3 font-mono text-sm text-foreground/90">
            AC/A = PD/10 + (NP - DP) / Demand
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PD:</span>
                <span className="font-medium text-foreground">{pd} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isEN ? 'Distance Phoria (DP):' : isCN ? '远方眼位 (DP):' : '遠方眼位 (DP):'}</span>
                <span className="font-medium text-foreground">{distPhoria}Δ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isEN ? 'Near Phoria (NP):' : isCN ? '近方眼位 (NP):' : '近方眼位 (NP):'}</span>
                <span className="font-medium text-foreground">{nearPhoria}Δ</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isEN ? 'Accom. Demand:' : isCN ? '调节需求:' : '調節需求:'}</span>
                <span className="font-medium text-foreground">{effectiveDemand.toFixed(2)} D</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Calc AC/A:</span>
                <span className="font-bold text-primary">{result.aca.calc}</span>
              </div>
              {result.aca.grad !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grad AC/A:</span>
                  <span className="font-bold text-primary">{result.aca.grad}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{isEN ? 'Method Used:' : isCN ? '采用方法:' : '採用方法:'}</span>
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-semibold",
              result.aca.category === 'Low' && "bg-chart-1/20 text-chart-1",
              result.aca.category === 'Normal' && "bg-success/20 text-success",
              result.aca.category === 'High' && "bg-warning/20 text-warning"
            )}>
              {result.aca.method} = {result.aca.val}:1 ({result.aca.category})
            </span>
          </div>
        </div>

        {/* Diagnosis Decision Tree */}
        <div className="bg-accent/5 p-4 rounded-xl border border-accent/20">
          <h5 className="text-sm font-semibold text-foreground mb-3">
            {isEN ? 'Diagnostic Decision Tree' : isCN ? '诊断决策树' : '診斷決策樹'}
          </h5>
          
          <div className="space-y-2">
            {diagnosisLogic.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <ArrowRight size={14} className={cn(
                  "mt-1 flex-shrink-0",
                  step.active ? "text-primary" : "text-muted-foreground/50"
                )} />
                <span className={cn(
                  "text-sm",
                  step.active ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-accent/20">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{isEN ? 'Final Diagnosis:' : isCN ? '最终诊断:' : '最終診斷:'}</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded font-semibold text-sm">
                {t(result.diag.nameKey as any)}
                {result.diag.secondaryKey && ` ${t(result.diag.secondaryKey as any)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Consistency Warnings */}
        {result.consistency.length > 0 && (
          <div className="bg-warning/5 p-3 rounded-xl border border-warning/20">
            <h5 className="text-sm font-semibold text-warning mb-2">
              {isEN ? 'Data Consistency Warnings' : isCN ? '数据一致性警示' : '數據一致性警示'}
            </h5>
            <ul className="space-y-1.5">
              {result.consistency.map((msg, idx) => (
                <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>{msg}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ReportCard>
  );
};

function getDiagnosisLogic(diagCode: string, acaCategory: string, language: string): { text: string; active: boolean }[] {
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';
  
  const logic = [
    {
      text: isEN ? 'Presbyope (≥45y) + BCC ≤+0.75D + PRA ≤-2.00D + Flipper <8 → AE (stiffness)' : isCN ? '老花 (≥45岁) + BCC ≤+0.75D + PRA ≤-2.00D + Flipper <8 → AE (调节僵化)' : '老花 (≥45歲) + BCC ≤+0.75D + PRA ≤-2.00D + Flipper <8 → AE (調節僵化)',
      active: diagCode === 'AE'
    },
    {
      text: isEN ? 'Presbyope (≥45y) + BCC ≥+1.25D + AA <50% expected + NRA <+1.50D → AI' : isCN ? '老花 (≥45岁) + BCC ≥+1.25D + AA <50%预期 + NRA <+1.50D → AI' : '老花 (≥45歲) + BCC ≥+1.25D + AA <50%預期 + NRA <+1.50D → AI',
      active: diagCode === 'AI'
    },
    {
      text: isEN ? 'AA deficit ≥2D + Flipper <8 + NPC ≥8cm + Exo ≥6Δ → AIFI (priority)' : isCN ? 'AA不足 ≥2D + Flipper <8 + NPC ≥8cm + 外斜 ≥6Δ → AIFI (优先)' : 'AA不足 ≥2D + Flipper <8 + NPC ≥8cm + 外斜 ≥6Δ → AIFI (優先)',
      active: diagCode === 'AIFI'
    },
    {
      text: isEN ? 'Exo + Low AC/A → Convergence Insufficiency (CI)' : isCN ? '外斜 (Exo) + Low AC/A → 集合不足 (CI)' : '外斜 (Exo) + Low AC/A → 集合不足 (CI)',
      active: diagCode === 'CI'
    },
    {
      text: isEN ? 'Child (≤12y) + AA deficit ≥3D → AI priority over BX' : isCN ? '儿童 (≤12岁) + AA不足 ≥3D → AI 优先于 BX' : '兒童 (≤12歲) + AA不足 ≥3D → AI 優先於 BX',
      active: diagCode === 'AI'
    },
    {
      text: isEN ? 'Exo + High AC/A → Divergence Excess (DE)' : isCN ? '外斜 (Exo) + High AC/A → 开散过度 (DE)' : '外斜 (Exo) + High AC/A → 開散過度 (DE)',
      active: diagCode === 'DE'
    },
    {
      text: isEN ? 'Exo + Normal AC/A → Basic Exophoria (BX)' : isCN ? '外斜 (Exo) + Normal AC/A → 基本型外斜 (BX)' : '外斜 (Exo) + Normal AC/A → 基本型外斜 (BX)',
      active: diagCode === 'BX'
    },
    {
      text: isEN ? 'Distance Exo + Near Eso (shift ≥6Δ) → CE (high AC/A pattern)' : isCN ? '远距外斜 + 近距内斜 (差距≥6Δ) → CE (高AC/A模式)' : '遠距外斜 + 近距內斜 (差距≥6Δ) → CE (高AC/A模式)',
      active: diagCode === 'CE'
    },
    {
      text: isEN ? 'Near Eso ≥4Δ + High AC/A (≥6:1) → Convergence Excess (CE)' : isCN ? '近方内斜 ≥4Δ + 高 AC/A (≥6:1) → 集合过度 (CE)' : '近方內斜 ≥4Δ + 高 AC/A (≥6:1) → 集合過度 (CE)',
      active: diagCode === 'CE'
    },
    {
      text: isEN ? 'Eso + Low AC/A → Divergence Insufficiency (DI)' : isCN ? '内斜 (Eso) + Low AC/A → 开散不足 (DI)' : '內斜 (Eso) + Low AC/A → 開散不足 (DI)',
      active: diagCode === 'DI'
    },
    {
      text: isEN ? 'Eso + Normal AC/A → Basic Esophoria (BE)' : isCN ? '内斜 (Eso) + Normal AC/A → 基本型内斜 (BE)' : '內斜 (Eso) + Normal AC/A → 基本型內斜 (BE)',
      active: diagCode === 'BE'
    },
    {
      text: isEN ? 'CI + Normal NPC + Accommodative Anomaly → Pseudo-CI' : isCN ? 'CI + NPC正常 + 调节异常 → 假性集合不足' : 'CI + NPC正常 + 調節異常 → 假性集合不足',
      active: diagCode === 'Pseudo-CI'
    },
    {
      text: isEN ? 'Normal Phoria → Normal Binocular Vision' : isCN ? '眼位正常 → 正常双眼视觉' : '眼位正常 → 正常雙眼視覺',
      active: diagCode === 'NORMAL'
    },
  ];
  
  return logic;
}
