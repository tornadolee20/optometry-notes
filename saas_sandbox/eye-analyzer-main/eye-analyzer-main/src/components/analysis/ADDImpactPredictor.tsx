/**
 * ADD Impact Predictor - 老花眼 ADD 處方影響預測系統
 * 基於梯度法 AC/A 計算輻輳變化，評估處方風險並提供臨床建議
 */

import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  TrendingDown, 
  ChevronDown,
  Calculator,
  Eye,
  Glasses,
  Target
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ADDImpactPredictorProps {
  gradientACA: number;        // 梯度法 AC/A（優先使用）
  calculatedACA: number;      // 計算法 AC/A
  addPower: number;           // ADD 下加光度數
  nearPhoria: number;         // 近距斜位
  distPhoria: number;         // 遠距斜位
  diagnosisType: string;      // 診斷類型
  aaDeficit: number;          // AA 不足量
  age: number;                // 年齡
  nearBIBreak: number;        // 近距 BI break
  nearBOBreak: number;        // 近距 BO break
}

export const ADDImpactPredictor: React.FC<ADDImpactPredictorProps> = ({
  gradientACA,
  calculatedACA,
  addPower,
  nearPhoria,
  distPhoria,
  diagnosisType,
  aaDeficit,
  age,
  nearBIBreak,
  nearBOBreak
}) => {
  const { language } = useLanguage();
  const [isTechDetailsOpen, setIsTechDetailsOpen] = useState(false);
  
  const isCN = language === 'zh-CN';
  const isEN = language === 'en';
  
  const t = (tw: string, cn: string, en: string) => 
    isEN ? en : isCN ? cn : tw;
  
  // 如果沒有 ADD 或 ADD < 0.5D，不顯示預測
  if (!addPower || addPower < 0.5) {
    return null;
  }
  
  // ========== 核心計算邏輯 ==========
  
  // 使用梯度法 AC/A（如果可用），否則使用計算法
  const effectiveACA = gradientACA > 0 ? gradientACA : calculatedACA;
  
  // 1. 計算輻輳變化（使用有效 AC/A）
  const convergenceChange = effectiveACA * addPower;
  
  // 2. 預測戴 ADD 後的近距斜位
  // ADD 增加調節放鬆 → 調節性輻輳減少 → 斜位往 exo 方向移動
  const predictedNearPhoria = nearPhoria - convergenceChange;
  
  // 3. 判斷斜位類型變化
  const getPhoriaType = (phoria: number) => {
    if (phoria > 2) return 'eso';
    if (phoria < -2) return 'exo';
    return 'ortho';
  };
  
  const originalPhoriaType = getPhoriaType(nearPhoria);
  const predictedPhoriaType = getPhoriaType(predictedNearPhoria);
  const phoriaTypeChanged = originalPhoriaType !== predictedPhoriaType;
  
  // 4. 評估融像儲備充足性（Sheard 準則）
  const sheardDemand = 2 * Math.abs(predictedNearPhoria);
  // exo 需要 BO 儲備，eso 需要 BI 儲備
  const compensatoryReserve = predictedNearPhoria < 0 
    ? nearBOBreak  // exo 需要 BO 儲備
    : nearBIBreak; // eso 需要 BI 儲備
  const sheardMet = compensatoryReserve >= sheardDemand;
  
  // 5. 判斷風險等級
  const isHighRisk = 
    (effectiveACA > 5.5 && (diagnosisType.includes('AI') || diagnosisType.includes('AIFI'))) ||
    (Math.abs(predictedNearPhoria) > 8) ||
    (!sheardMet && Math.abs(predictedNearPhoria) > 4) ||
    phoriaTypeChanged;
  
  const isMediumRisk = 
    !isHighRisk && (
      (effectiveACA > 4.5 && aaDeficit > 2.0) ||
      (Math.abs(predictedNearPhoria) > 6) ||
      (!sheardMet)
    );
  
  // 6. 建議稜鏡補償
  const needsPrism = Math.abs(predictedNearPhoria) > 6 || !sheardMet;
  const suggestedPrism = needsPrism 
    ? {
        amount: Math.min(Math.ceil(Math.abs(predictedNearPhoria) / 2), 6),
        direction: predictedNearPhoria < 0 ? 'BI' : 'BO',
        reason: !sheardMet 
          ? t(
              `Sheard 準則不符合（需要 ${sheardDemand.toFixed(0)}Δ，現有 ${compensatoryReserve.toFixed(0)}Δ）`,
              `Sheard 准则不符合（需要 ${sheardDemand.toFixed(0)}Δ，现有 ${compensatoryReserve.toFixed(0)}Δ）`,
              `Sheard criterion not met (need ${sheardDemand.toFixed(0)}Δ, have ${compensatoryReserve.toFixed(0)}Δ)`
            )
          : t(
              `預測斜位過大（${Math.abs(predictedNearPhoria).toFixed(1)}Δ）`,
              `预测斜位过大（${Math.abs(predictedNearPhoria).toFixed(1)}Δ）`,
              `Predicted phoria too large (${Math.abs(predictedNearPhoria).toFixed(1)}Δ)`
            )
      }
    : null;
  
  // 7. 建議調整 ADD
  const suggestedADDReduction = isHighRisk ? 0.50 : isMediumRisk ? 0.25 : 0;
  const alternativeADD = Math.max(0.5, addPower - suggestedADDReduction);
  const alternativeConvergenceChange = effectiveACA * alternativeADD;
  const alternativeNearPhoria = nearPhoria - alternativeConvergenceChange;
  
  // 格式化斜位顯示
  const formatPhoria = (phoria: number) => {
    const sign = phoria > 0 ? '+' : '';
    return `${sign}${phoria.toFixed(1)}Δ`;
  };
  
  const getPhoriaLabel = (type: string) => {
    switch (type) {
      case 'eso': return t('內斜', '内斜', 'eso');
      case 'exo': return t('外斜', '外斜', 'exo');
      default: return t('正位', '正位', 'ortho');
    }
  };
  
  // ========== UI 渲染 ==========
  
  return (
    <Card className={cn(
      "relative overflow-hidden",
      isHighRisk && "border-destructive/50",
      isMediumRisk && !isHighRisk && "border-warning/50"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {isHighRisk && <AlertTriangle className="h-5 w-5 text-destructive" />}
          {isMediumRisk && !isHighRisk && <AlertTriangle className="h-5 w-5 text-warning" />}
          {!isHighRisk && !isMediumRisk && <CheckCircle className="h-5 w-5 text-success" />}
          <span>{t('ADD 處方影響預測', 'ADD 处方影响预测', 'ADD Prescription Impact Prediction')}</span>
        </CardTitle>
        <CardDescription>
          {t(
            `基於${gradientACA > 0 ? '梯度法' : '計算法'} AC/A ${effectiveACA.toFixed(1)} Δ/D 的臨床預測分析`,
            `基于${gradientACA > 0 ? '梯度法' : '计算法'} AC/A ${effectiveACA.toFixed(1)} Δ/D 的临床预测分析`,
            `Clinical prediction based on ${gradientACA > 0 ? 'Gradient' : 'Calculated'} AC/A ${effectiveACA.toFixed(1)} Δ/D`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* ========== 區塊 1：當前影響預測 ========== */}
        <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">
              {t('📊 當前 ADD 處方影響分析', '📊 当前 ADD 处方影响分析', '📊 Current ADD Impact Analysis')}
            </span>
          </div>
          
          <div className="space-y-3 text-sm">
            {/* ADD 度數 */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('ADD 下加光：', 'ADD 下加光：', 'ADD Power:')}</span>
              <Badge variant="outline" className="font-mono">
                +{addPower.toFixed(2)}D
              </Badge>
            </div>
            
            {/* 輻輳變化 */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('調節性輻輳減少：', '调节性辐辏减少：', 'Convergence Decrease:')}</span>
              <Badge variant="secondary" className="font-mono">
                {convergenceChange.toFixed(1)}Δ
              </Badge>
            </div>
            
            {/* 計算說明 */}
            <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              {t('計算', '计算', 'Calc')}: AC/A {effectiveACA.toFixed(1)} × ADD {addPower.toFixed(2)} = {convergenceChange.toFixed(1)}Δ
            </div>
            
            {/* 斜位變化對比 */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* 原斜位 */}
              <div className="p-2 bg-background rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">
                  {t('原近距斜位', '原近距斜位', 'Original Near Phoria')}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-semibold">{formatPhoria(nearPhoria)}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {getPhoriaLabel(originalPhoriaType)}
                  </Badge>
                </div>
              </div>
              
              {/* 預測斜位 */}
              <div className={cn(
                "p-2 rounded-lg border",
                phoriaTypeChanged ? "bg-warning/10 border-warning/30" : "bg-background"
              )}>
                <div className="text-xs text-muted-foreground mb-1">
                  {t('預測近距斜位', '预测近距斜位', 'Predicted Near Phoria')}
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "font-mono font-semibold",
                    phoriaTypeChanged && "text-warning"
                  )}>
                    {formatPhoria(predictedNearPhoria)}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-[10px]", phoriaTypeChanged && "border-warning text-warning")}
                  >
                    {getPhoriaLabel(predictedPhoriaType)}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* 斜位變化提示 */}
            {phoriaTypeChanged && (
              <div className="flex items-center gap-2 text-warning text-xs bg-warning/10 px-2 py-1.5 rounded">
                <TrendingDown className="h-3.5 w-3.5" />
                <span>
                  ⚠️ {t('斜位類型改變', '斜位类型改变', 'Phoria type changed')}: {getPhoriaLabel(originalPhoriaType)} → {getPhoriaLabel(predictedPhoriaType)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* ========== 區塊 2：Sheard 準則檢查 ========== */}
        <div className={cn(
          "p-4 rounded-xl border",
          sheardMet ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
        )}>
          <div className="flex items-center gap-2 mb-3">
            {sheardMet ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <span className="font-semibold text-sm">
              {t('Sheard 準則檢查', 'Sheard 准则检查', 'Sheard Criterion Check')}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-2 bg-background/50 rounded">
              <div className="text-xs text-muted-foreground mb-1">
                {t('需求（2×斜位）', '需求（2×斜位）', 'Demand (2×phoria)')}
              </div>
              <div className="font-mono font-semibold">{sheardDemand.toFixed(0)}Δ</div>
            </div>
            <div className="text-center p-2 bg-background/50 rounded">
              <div className="text-xs text-muted-foreground mb-1">
                {t(`補償性儲備`, `补偿性储备`, 'Reserve')} ({predictedNearPhoria < 0 ? 'BO' : 'BI'})
              </div>
              <div className="font-mono font-semibold">{compensatoryReserve.toFixed(0)}Δ</div>
            </div>
            <div className="text-center p-2 bg-background/50 rounded">
              <div className="text-xs text-muted-foreground mb-1">
                {t('結果', '结果', 'Result')}
              </div>
              <div className={cn(
                "font-semibold",
                sheardMet ? "text-success" : "text-destructive"
              )}>
                {sheardMet ? '✓' : '✗'}
              </div>
            </div>
          </div>
        </div>
        
        {/* ========== 區塊 3：風險警示與建議 ========== */}
        {(isHighRisk || isMediumRisk) && (
          <Alert variant={isHighRisk ? "destructive" : "default"} className={cn(!isHighRisk && "border-warning/50 bg-warning/5")}>
            <AlertTriangle className={cn("h-4 w-4", !isHighRisk && "text-warning")} />
            <AlertTitle className={!isHighRisk ? "text-warning" : ""}>
              {isHighRisk 
                ? t('🚨 高風險警示', '🚨 高风险警示', '🚨 High Risk Alert')
                : t('⚠️ 需注意', '⚠️ 需注意', '⚠️ Attention Required')
              }
            </AlertTitle>
            <AlertDescription className="space-y-3">
              {/* 風險描述 */}
              <p className="text-sm">
                {isHighRisk ? (
                  t(
                    `高 AC/A (${effectiveACA.toFixed(1)}) + ${diagnosisType} 組合，處方 ADD +${addPower.toFixed(2)}D 會顯著降低近距輻輳（-${convergenceChange.toFixed(1)}Δ），可能導致外斜視傾向、複視或閱讀困難。`,
                    `高 AC/A (${effectiveACA.toFixed(1)}) + ${diagnosisType} 组合，处方 ADD +${addPower.toFixed(2)}D 会显著降低近距辐辏（-${convergenceChange.toFixed(1)}Δ），可能导致外斜视倾向、复视或阅读困难。`,
                    `High AC/A (${effectiveACA.toFixed(1)}) + ${diagnosisType} combination. ADD +${addPower.toFixed(2)}D will significantly reduce near convergence (-${convergenceChange.toFixed(1)}Δ), potentially causing exophoria, diplopia, or reading difficulties.`
                  )
                ) : (
                  t(
                    `當前 ADD 處方會降低 ${convergenceChange.toFixed(1)}Δ 輻輳，建議評估患者的融像儲備是否充足。`,
                    `当前 ADD 处方会降低 ${convergenceChange.toFixed(1)}Δ 辐辏，建议评估患者的融像储备是否充足。`,
                    `Current ADD will reduce convergence by ${convergenceChange.toFixed(1)}Δ. Recommend evaluating patient's fusional reserves.`
                  )
                )}
              </p>
              
              {/* 建議方案 */}
              <div className="space-y-2 pt-2">
                <div className="font-semibold text-sm flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" />
                  {t('💡 臨床建議方案：', '💡 临床建议方案：', '💡 Clinical Recommendations:')}
                </div>
                
                {/* 方案 A：調整 ADD */}
                {suggestedADDReduction > 0 && (
                  <div className="p-3 bg-background/80 rounded-lg border text-sm">
                    <div className="font-semibold text-primary mb-2 flex items-center gap-1">
                      <Glasses className="h-3.5 w-3.5" />
                      {t('方案 A：降低 ADD 度數（保守處方）', '方案 A：降低 ADD 度数（保守处方）', 'Option A: Reduce ADD (Conservative)')}
                    </div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• ADD {t('調整為', '调整为', 'adjusted to')}: +{alternativeADD.toFixed(2)}D</li>
                      <li>• {t('輻輳減少量', '辐辏减少量', 'Convergence decrease')}: {alternativeConvergenceChange.toFixed(1)}Δ（{t('較溫和', '较温和', 'more moderate')}）</li>
                      <li>• {t('預測近距斜位', '预测近距斜位', 'Predicted phoria')}: {formatPhoria(alternativeNearPhoria)}</li>
                      <li className="text-success">✓ {t('降低風險，維持舒適閱讀', '降低风险，维持舒适阅读', 'Lower risk, maintain comfortable reading')}</li>
                    </ul>
                  </div>
                )}
                
                {/* 方案 B：稜鏡補償 */}
                {suggestedPrism && (
                  <div className="p-3 bg-background/80 rounded-lg border text-sm">
                    <div className="font-semibold text-primary mb-2 flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {t('方案 B：稜鏡補償（維持完整 ADD）', '方案 B：棱镜补偿（维持完整 ADD）', 'Option B: Prism Compensation (Maintain Full ADD)')}
                    </div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• ADD {t('維持', '维持', 'maintain')}: +{addPower.toFixed(2)}D</li>
                      <li>• {t('建議稜鏡', '建议棱镜', 'Recommended prism')}: {suggestedPrism.direction} {suggestedPrism.amount}Δ（{t('近用', '近用', 'near')}）</li>
                      <li>• {t('原因', '原因', 'Reason')}: {suggestedPrism.reason}</li>
                      <li className="text-warning">⚠️ {t('需試戴確認舒適度', '需试戴确认舒适度', 'Trial frame fitting required')}</li>
                    </ul>
                  </div>
                )}
                
                {/* 方案 C：視覺訓練 */}
                {!sheardMet && (
                  <div className="p-3 bg-background/80 rounded-lg border text-sm">
                    <div className="font-semibold text-primary mb-2 flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" />
                      {t('方案 C：輻輳訓練（長期改善）', '方案 C：辐辏训练（长期改善）', 'Option C: Vergence Training (Long-term)')}
                    </div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• {t('訓練目標', '训练目标', 'Target')}: {t('提升', '提升', 'Increase')} {predictedNearPhoria < 0 ? 'BO' : 'BI'} break {t('至', '至', 'to')} {Math.ceil(sheardDemand * 1.5)}Δ {t('以上', '以上', 'or above')}</li>
                      <li>• {t('建議療程', '建议疗程', 'Recommended duration')}: 4-6 {t('週，每週 3 次', '周，每周 3 次', 'weeks, 3x/week')}</li>
                      <li className="text-success">✓ {t('根本性改善視覺功能', '根本性改善视觉功能', 'Fundamental improvement of visual function')}</li>
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* ========== 區塊 4：無風險案例的正面回饋 ========== */}
        {!isHighRisk && !isMediumRisk && (
          <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
            <div className="flex items-center gap-2 text-success mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">
                ✓ {t('ADD 處方安全評估通過', 'ADD 处方安全评估通过', 'ADD Prescription Safety Check Passed')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t(
                `當前 ADD +${addPower.toFixed(2)}D 不會造成顯著的輻輳問題，預測近距斜位 ${Math.abs(predictedNearPhoria).toFixed(1)}Δ 在可接受範圍內，且符合 Sheard 準則。`,
                `当前 ADD +${addPower.toFixed(2)}D 不会造成显著的辐辏问题，预测近距斜位 ${Math.abs(predictedNearPhoria).toFixed(1)}Δ 在可接受范围内，且符合 Sheard 准则。`,
                `Current ADD +${addPower.toFixed(2)}D will not cause significant convergence issues. Predicted near phoria ${Math.abs(predictedNearPhoria).toFixed(1)}Δ is within acceptable range and meets Sheard criterion.`
              )}
            </p>
          </div>
        )}
        
        {/* ========== 區塊 5：技術細節（可摺疊）========== */}
        <Collapsible open={isTechDetailsOpen} onOpenChange={setIsTechDetailsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
            <span className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              {t('📊 技術細節與計算公式', '📊 技术细节与计算公式', '📊 Technical Details & Formulas')}
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isTechDetailsOpen && "rotate-180"
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="p-3 bg-muted/20 rounded-lg text-xs font-mono space-y-2 text-muted-foreground">
              <p>{t('梯度法 AC/A', '梯度法 AC/A', 'Gradient AC/A')}: {gradientACA > 0 ? gradientACA.toFixed(2) : 'N/A'} Δ/D</p>
              <p>{t('計算法 AC/A', '计算法 AC/A', 'Calculated AC/A')}: {calculatedACA.toFixed(2)} Δ/D</p>
              <div className="pt-2 border-t border-border/50">
                <p className="mb-1">{t('輻輳變化公式', '辐辏变化公式', 'Convergence Formula')}:</p>
                <p className="pl-2">{t('調節性輻輳減少', '调节性辐辏减少', 'Convergence decrease')} = AC/A × ADD</p>
                <p className="pl-2">= {effectiveACA.toFixed(2)} × {addPower.toFixed(2)} = {convergenceChange.toFixed(2)}Δ</p>
              </div>
              <div className="pt-2 border-t border-border/50">
                <p className="mb-1">{t('斜位預測公式', '斜位预测公式', 'Phoria Prediction')}:</p>
                <p className="pl-2">{t('預測近距斜位', '预测近距斜位', 'Predicted phoria')} = {t('原斜位', '原斜位', 'Original')} - {t('輻輳減少', '辐辏减少', 'Decrease')}</p>
                <p className="pl-2">= {nearPhoria.toFixed(0)} - {convergenceChange.toFixed(1)} = {predictedNearPhoria.toFixed(1)}Δ</p>
              </div>
              <div className="pt-2 border-t border-border/50">
                <p className="mb-1">Sheard {t('準則檢查', '准则检查', 'Check')}:</p>
                <p className="pl-2">{t('需求', '需求', 'Demand')} = 2 × |{t('預測斜位', '预测斜位', 'Predicted')}| = {sheardDemand.toFixed(1)}Δ</p>
                <p className="pl-2">{t('儲備', '储备', 'Reserve')} = {predictedNearPhoria < 0 ? 'BO' : 'BI'} Break = {compensatoryReserve.toFixed(0)}Δ</p>
                <p className="pl-2">{t('結果', '结果', 'Result')}: {sheardMet 
                  ? t('✓ 符合（儲備 ≥ 需求）', '✓ 符合（储备 ≥ 需求）', '✓ Met (Reserve ≥ Demand)')
                  : t('✗ 不符合（儲備 < 需求）', '✗ 不符合（储备 < 需求）', '✗ Not met (Reserve < Demand)')
                }</p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
      </CardContent>
    </Card>
  );
};

export default ADDImpactPredictor;
