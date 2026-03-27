import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { analyzePrimaryDistance, generatePrismRecommendation, generateAllScenarioRecommendations } from '@/lib/binocularAnalysis';
import { ScenarioRecommendations } from './ScenarioRecommendations';
import {
  Y_POSITIONS,
  ZONE_HEIGHT,
  MORGAN_NORMS,
  CriteriaCalculations,
} from '@/lib/criteriaCalculations';

// Morgan 標準舒適區常數 (稜鏡度) - 使用統一常數
const MORGAN_CONSTANTS = {
  far: { exo: MORGAN_NORMS.distance.phoria.min, eso: MORGAN_NORMS.distance.phoria.max },
  near: { exo: MORGAN_NORMS.near.phoria.min, eso: MORGAN_NORMS.near.phoria.max },
};

interface VisualAnalysisGraphProps {
  distPhoria: number;
  nearPhoria: number;
  biBreak: number;       // 近距 BI break
  boBreak: number;       // 近距 BO break
  distBiBreak?: number;  // 遠距 BI break
  distBoBreak?: number;  // 遠距 BO break
  pd: number;
  acaVal?: number;       // calculated AC/A ratio
  workDemandD?: number;  // 工作距離調節需求 (D)
  // 調節相關參數
  age?: number;
  aaOD?: number;         // OD 調節幅度
  aaOS?: number;         // OS 調節幅度
  nra?: number;          // 負相對調節
  pra?: number;          // 正相對調節
  flipper?: number;      // 調節靈敏度 (cpm)
  npc?: number;          // 近點輻輳 (cm)
  ciss?: number;         // CISS 症狀分數
  className?: string;
}

export const VisualAnalysisGraph = ({ 
  distPhoria, 
  nearPhoria, 
  biBreak, 
  boBreak, 
  distBiBreak,
  distBoBreak,
  pd,
  acaVal,
  workDemandD = 2.5,
  age = 30,
  aaOD = 8,
  aaOS = 8,
  nra = 2.0,
  pra = -2.5,
  flipper = 12,
  npc = 6,
  ciss = 0,
  className 
}: VisualAnalysisGraphProps) => {
  const { language } = useLanguage();
  const txt = (tw: string, cn: string, en?: string) => {
    if (language === 'en' && en) return en;
    return language === 'zh-CN' ? cn : tw;
  };
  
  const safeDist = Number.isFinite(distPhoria) ? distPhoria : 0;
  const safeNear = Number.isFinite(nearPhoria) ? nearPhoria : 0;
  const safeBi = Number.isFinite(biBreak) ? biBreak : 10;
  const safeBo = Number.isFinite(boBreak) ? boBreak : 20;
  
  // 遠距融像儲備 (若無提供則用近距值的估計)
  const safeDistBi = Number.isFinite(distBiBreak) ? distBiBreak : Math.round(safeBi * 0.7);
  const safeDistBo = Number.isFinite(distBoBreak) ? distBoBreak : Math.round(safeBo * 0.5);
  
  // 計算 AC/A (使用統一計算邏輯)
  const calculatedACA = acaVal ?? CriteriaCalculations.calculateACA(safeDist, safeNear, workDemandD);

  // 響應式尺寸：手機上使用更緊湊的設計
  const width = 400;
  const height = 280; // 手機上稍矮一點
  const padding = 50;
  const rightPadding = 25;
  const topPadding = 25;
  const bottomPadding = 50;
  
  // 動態計算 X 軸範圍，確保資料清楚可見
  // 找出所有資料點的最小和最大值
  const allXValues = [
    safeDist,
    safeNear,
    safeDist - safeDistBi,  // 遠距 BI 邊界
    safeDist + safeDistBo,  // 遠距 BO 邊界
    safeNear - safeBi,      // 近距 BI 邊界
    safeNear + safeBo,      // 近距 BO 邊界
    MORGAN_CONSTANTS.far.exo,
    MORGAN_CONSTANTS.far.eso,
    MORGAN_CONSTANTS.near.exo,
    MORGAN_CONSTANTS.near.eso,
  ];
  
  const dataMin = Math.min(...allXValues);
  const dataMax = Math.max(...allXValues);
  const dataRange = dataMax - dataMin;
  
  // 加入邊距 (至少 20% 或 5 單位)
  const marginX = Math.max(dataRange * 0.2, 5);
  
  // 計算動態範圍，但保持合理的最小範圍
  const dynamicMinX = Math.min(-15, Math.floor(dataMin - marginX));
  const dynamicMaxX = Math.max(30, Math.ceil(dataMax + marginX));
  
  // 確保範圍至少有 30 單位寬，且包含 0
  const rangeWidth = dynamicMaxX - dynamicMinX;
  const minX = rangeWidth < 30 ? Math.min(dynamicMinX, -10) : dynamicMinX;
  const maxX = rangeWidth < 30 ? Math.max(dynamicMaxX, 25) : dynamicMaxX;
  
  const minY = 0;
  const maxY = 3.5;

  const scaleX = (val: number) => 
    ((val - minX) / (maxX - minX)) * (width - padding - rightPadding) + padding;
  const scaleY = (val: number) => 
    height - bottomPadding - ((val - minY) / (maxY - minY)) * (height - topPadding - bottomPadding);

  // 動態生成 X 軸刻度
  const generateXTicks = () => {
    const range = maxX - minX;
    const step = range <= 40 ? 5 : 10;
    const ticks: number[] = [];
    const start = Math.ceil(minX / step) * step;
    for (let i = start; i <= maxX; i += step) {
      ticks.push(i);
    }
    return ticks;
  };
  const xTicks = generateXTicks();

  // 實測 Phoria 點
  const pFar = { x: scaleX(safeDist), y: scaleY(0) };
  const pNear = { x: scaleX(safeNear), y: scaleY(workDemandD) };

  // 理論 Near Phoria (基於 calc AC/A 從 distPhoria 推算)
  // 公式: 理論近phoria = 遠phoria - (AC/A × 調節需求)
  // 負號是因為內聚會讓眼位往 eso 方向移動
  const theoreticalNearPhoria = safeDist - (calculatedACA * workDemandD);
  const pTheoNear = { x: scaleX(theoreticalNearPhoria), y: scaleY(workDemandD) };

  // 近距融像儲備範圍 (相對於近距 phoria)
  const nearBiBreakX = scaleX(safeNear - safeBi);
  const nearBoBreakX = scaleX(safeNear + safeBo);
  const nearRangeY = scaleY(workDemandD);

  // 遠距融像儲備範圍 (相對於遠距 phoria)
  const distBiBreakX = scaleX(safeDist - safeDistBi);
  const distBoBreakX = scaleX(safeDist + safeDistBo);
  const distRangeY = scaleY(0);

  // Morgan 標準舒適區 polygon (使用常數)
  const morganPoints = [
    { x: scaleX(MORGAN_CONSTANTS.far.exo), y: scaleY(0) },     // 遠距 exo 限
    { x: scaleX(MORGAN_CONSTANTS.far.eso), y: scaleY(0) },     // 遠距 eso 限
    { x: scaleX(MORGAN_CONSTANTS.near.eso), y: scaleY(workDemandD) },  // 近距 eso 限
    { x: scaleX(MORGAN_CONSTANTS.near.exo), y: scaleY(workDemandD) },  // 近距 exo 限
  ];
  const morganPath = morganPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

  // Demand line (理想 ortho 線)
  const demandFar = { x: scaleX(0), y: scaleY(0) };
  const demandNear = { x: scaleX(15), y: scaleY(workDemandD) };

  // ============================================
  // Sheard 準則計算（使用統一計算邏輯）
  // ============================================
  
  // 遠距 Sheard 分析
  const distSheardDemand = Math.abs(safeDist) * 2;
  const distSheardReserve = safeDist < 0 ? safeDistBo : safeDistBi;
  const distSheardPass = CriteriaCalculations.checkSheardPass(safeDist, distSheardReserve);
  const distSheardLineX = scaleX(CriteriaCalculations.getSheardDemandPosition(safeDist));
  
  // 近距 Sheard 分析
  const nearSheardDemand = Math.abs(safeNear) * 2;
  const nearSheardReserve = safeNear < 0 ? safeBo : safeBi;
  const nearSheardPass = CriteriaCalculations.checkSheardPass(safeNear, nearSheardReserve);
  const nearSheardLineX = scaleX(CriteriaCalculations.getSheardDemandPosition(safeNear));

  // ============================================
  // Percival 準則計算（使用統一計算邏輯）
  // ============================================
  
  // 遠距 Percival 分析
  const distMinReserve = Math.min(safeDistBi, safeDistBo);
  const distMaxReserve = Math.max(safeDistBi, safeDistBo);
  const distPercivalRequired = distMaxReserve / 3; // Percival uses 1/3, not 1/2
  const distPercivalPass = CriteriaCalculations.checkPercivalPass(safeDistBi, safeDistBo);
  // Percival 中點 = (BO - BI) / 2，正值表示需往 BO 方向移動
  const distPercivalMidpoint = (safeDistBo - safeDistBi) / 2;
  const distPercivalZoneStart = scaleX(safeDist - distPercivalRequired);
  const distPercivalZoneEnd = scaleX(safeDist + distPercivalRequired);
  
  // 近距 Percival 分析
  const nearMinReserve = Math.min(safeBi, safeBo);
  const nearMaxReserve = Math.max(safeBi, safeBo);
  const nearPercivalRequired = nearMaxReserve / 3; // Percival uses 1/3, not 1/2
  const nearPercivalPass = CriteriaCalculations.checkPercivalPass(safeBi, safeBo);
  const nearPercivalMidpoint = (safeBo - safeBi) / 2;
  // Use centralized Percival zone calculation
  const nearPercivalZoneRange = CriteriaCalculations.getPercivalZoneRange(safeNear, safeBi, safeBo);
  const nearPercivalZoneStart = scaleX(nearPercivalZoneRange.left);
  const nearPercivalZoneEnd = scaleX(nearPercivalZoneRange.right);

  // ============================================
  // Morgan 區判斷（使用統一常數）
  // ============================================
  const distInMorgan = CriteriaCalculations.checkMorgan(safeDist, 'distance');
  const nearInMorgan = CriteriaCalculations.checkMorgan(safeNear, 'near');

  // ============================================
  // 舒適度綜合評分 (0-100)
  // ============================================
  const calculateComfortScore = () => {
    let score = 100;
    const details: { category: string; points: number; reason: string }[] = [];

    // 1. Morgan 區判斷 (各 15 分, 共 30 分)
    if (!distInMorgan) {
      const distDeviation = safeDist < MORGAN_CONSTANTS.far.exo 
        ? Math.abs(safeDist - MORGAN_CONSTANTS.far.exo)
        : Math.abs(safeDist - MORGAN_CONSTANTS.far.eso);
      const deduct = Math.min(15, distDeviation * 3);
      score -= deduct;
      details.push({ category: language === 'en' ? 'Morgan Dist' : language === 'zh-CN' ? 'Morgan 远' : 'Morgan 遠', points: -deduct, reason: language === 'en' ? `Deviation ${distDeviation.toFixed(1)}Δ` : language === 'zh-CN' ? `偏离 ${distDeviation.toFixed(1)}Δ` : `偏離 ${distDeviation.toFixed(1)}Δ` });
    }
    if (!nearInMorgan) {
      const nearDeviation = safeNear < MORGAN_CONSTANTS.near.exo 
        ? Math.abs(safeNear - MORGAN_CONSTANTS.near.exo)
        : Math.abs(safeNear - MORGAN_CONSTANTS.near.eso);
      const deduct = Math.min(15, nearDeviation * 2);
      score -= deduct;
      details.push({ category: 'Morgan Near', points: -deduct, reason: language === 'en' ? `Deviation ${nearDeviation.toFixed(1)}Δ` : language === 'zh-CN' ? `偏离 ${nearDeviation.toFixed(1)}Δ` : `偏離 ${nearDeviation.toFixed(1)}Δ` });
    }

    // 2. Sheard 準則 (各 20 分, 共 40 分)
    if (!distSheardPass) {
      const ratio = distSheardDemand > 0 ? distSheardReserve / distSheardDemand : 1;
      const deduct = Math.min(20, Math.round((1 - ratio) * 20));
      score -= deduct;
      details.push({ category: language === 'en' ? 'Sheard Dist' : language === 'zh-CN' ? 'Sheard 远' : 'Sheard 遠', points: -deduct, reason: language === 'en' ? `Ratio ${ratio.toFixed(2)}` : `比值 ${ratio.toFixed(2)}` });
    }
    if (!nearSheardPass) {
      const ratio = nearSheardDemand > 0 ? nearSheardReserve / nearSheardDemand : 1;
      const deduct = Math.min(20, Math.round((1 - ratio) * 20));
      score -= deduct;
      details.push({ category: 'Sheard 近', points: -deduct, reason: `比值 ${ratio.toFixed(2)}` });
    }

    // 3. Percival 準則 (各 15 分, 共 30 分)
    if (!distPercivalPass) {
      const ratio = distPercivalRequired > 0 ? distMinReserve / distPercivalRequired : 1;
      const deduct = Math.min(15, Math.round((1 - ratio) * 15));
      score -= deduct;
      details.push({ category: language === 'en' ? 'Percival Dist' : language === 'zh-CN' ? 'Percival 远' : 'Percival 遠', points: -deduct, reason: language === 'en' ? `Ratio ${ratio.toFixed(2)}` : `比值 ${ratio.toFixed(2)}` });
    }
    if (!nearPercivalPass) {
      const ratio = nearPercivalRequired > 0 ? nearMinReserve / nearPercivalRequired : 1;
      const deduct = Math.min(15, Math.round((1 - ratio) * 15));
      score -= deduct;
      details.push({ category: 'Percival 近', points: -deduct, reason: `比值 ${ratio.toFixed(2)}` });
    }

    return { score: Math.max(0, score), details };
  };

  const { score: comfortScore, details: scoreDetails } = calculateComfortScore();
  
  // 評分等級
  const getScoreGrade = (score: number) => {
    if (score >= 90) return { label: txt('優良', '优良', 'Excellent'), color: 'hsl(160 70% 45%)' };
    if (score >= 70) return { label: txt('良好', '良好', 'Good'), color: 'hsl(45 90% 50%)' };
    if (score >= 50) return { label: txt('尚可', '尚可', 'Fair'), color: 'hsl(30 90% 50%)' };
    return { label: txt('需注意', '需注意', 'Attention'), color: 'hsl(0 80% 55%)' };
  };
  
  const scoreGrade = getScoreGrade(comfortScore);

  // ============================================
  // 主要問題距離分析 (使用 binocularAnalysis)
  // ============================================
  const primaryAnalysis = analyzePrimaryDistance(
    safeDist,
    safeNear,
    npc,
    safeBo,
    safeBi,
    ciss
  );

  // ============================================
  // 整合 Sheard/Percival 判斷：遠近皆通過才算通過
  // ============================================
  const sheardPass = distSheardPass && nearSheardPass;
  const percivalPass = distPercivalPass && nearPercivalPass;

  // ============================================
  // 使用 generatePrismRecommendation 統一邏輯
  // ============================================
  const unifiedPrismRec = generatePrismRecommendation(
    primaryAnalysis,
    sheardPass,
    percivalPass,
    safeDist,
    safeNear,
    ciss
  );

  // ============================================
  // 稜鏡補償建議計算 (基於統一邏輯)
  // ============================================
  const calculatePrismRecommendations = () => {
    const recommendations: { 
      distance: 'far' | 'near' | 'both'; 
      criterion: string; 
      prism: number; 
      direction: 'BI' | 'BO';
      reason: string;
    }[] = [];
    
    // 記錄訊息
    const filteredMessages: { distance: 'far' | 'near'; message: string }[] = [];

    // === 如果統一邏輯不建議稜鏡 ===
    if (!unifiedPrismRec.shouldRecommend) {
      filteredMessages.push({
        distance: 'far',
        message: unifiedPrismRec.rationaleCN
      });
      return { recommendations: [], filteredMessages };
    }

    // === 根據統一邏輯的 distance 和 direction 生成建議 ===
    const { distance: recDistance, direction: recDirection } = unifiedPrismRec;
    
    // BX/BE pattern: 全天稜鏡
    if (primaryAnalysis.pattern === 'BX' || primaryAnalysis.pattern === 'BE') {
      const avgPhoria = (Math.abs(safeDist) + Math.abs(safeNear)) / 2;
      const prismAmount = Math.ceil(avgPhoria / 3);
      recommendations.push({
        distance: 'both',
        criterion: 'Pattern',
        prism: prismAmount,
        direction: recDirection as 'BI' | 'BO',
        reason: `${primaryAnalysis.descriptionCN}，建議全天配戴稜鏡`
      });
      return { recommendations, filteredMessages };
    }

    // CI pattern: 主要問題在近距
    if (primaryAnalysis.pattern === 'CI') {
      // 遠距眼位正常，不建議遠用稜鏡
      if (Math.abs(safeDist) <= 2) {
        filteredMessages.push({
          distance: 'far',
          message: `遠距眼位接近正常 (${safeDist}Δ)，不需要遠用稜鏡`
        });
      }
      // 只建議近用稜鏡
      if (!nearSheardPass && safeNear !== 0) {
        const deficit = nearSheardDemand - nearSheardReserve;
        if (deficit > 0) {
          recommendations.push({
            distance: 'near',
            criterion: 'Sheard (CI)',
            prism: Math.ceil(deficit / 3),
            direction: 'BI',
            reason: `近距儲備不足 ${deficit.toFixed(1)}Δ`
          });
        }
      }
      return { recommendations, filteredMessages };
    }

    // DE pattern: 主要問題在遠距
    if (primaryAnalysis.pattern === 'DE') {
      // 近距眼位正常，不建議近用稜鏡
      if (Math.abs(safeNear) <= 3) {
        filteredMessages.push({
          distance: 'near',
          message: `近距眼位接近正常 (${safeNear}Δ)，不需要近用稜鏡`
        });
      }
      // 只建議遠用稜鏡
      if (!distSheardPass && safeDist !== 0) {
        const deficit = distSheardDemand - distSheardReserve;
        if (deficit > 0) {
          recommendations.push({
            distance: 'far',
            criterion: 'Sheard (DE)',
            prism: Math.ceil(deficit / 3),
            direction: 'BI',
            reason: `遠距儲備不足 ${deficit.toFixed(1)}Δ`
          });
        }
      }
      return { recommendations, filteredMessages };
    }

    // CE pattern: 近距內斜
    if (primaryAnalysis.pattern === 'CE') {
      if (!nearSheardPass && safeNear > 0) {
        const deficit = nearSheardDemand - nearSheardReserve;
        if (deficit > 0) {
          recommendations.push({
            distance: 'near',
            criterion: 'Sheard (CE)',
            prism: Math.ceil(deficit / 3),
            direction: 'BO',
            reason: `近距儲備不足 ${deficit.toFixed(1)}Δ`
          });
        }
      }
      return { recommendations, filteredMessages };
    }

    // DI pattern: 遠距內斜
    if (primaryAnalysis.pattern === 'DI') {
      if (!distSheardPass && safeDist > 0) {
        const deficit = distSheardDemand - distSheardReserve;
        if (deficit > 0) {
          recommendations.push({
            distance: 'far',
            criterion: 'Sheard (DI)',
            prism: Math.ceil(deficit / 3),
            direction: 'BO',
            reason: `遠距儲備不足 ${deficit.toFixed(1)}Δ`
          });
        }
      }
      return { recommendations, filteredMessages };
    }

    // 其他 pattern: 根據統一建議
    if (recDistance === 'near' && !nearSheardPass && safeNear !== 0) {
      const deficit = nearSheardDemand - nearSheardReserve;
      if (deficit > 0) {
        recommendations.push({
          distance: 'near',
          criterion: 'Sheard',
          prism: Math.ceil(deficit / 3),
          direction: recDirection as 'BI' | 'BO',
          reason: `近距儲備不足 ${deficit.toFixed(1)}Δ`
        });
      }
    }
    
    if (recDistance === 'far' && !distSheardPass && safeDist !== 0) {
      const deficit = distSheardDemand - distSheardReserve;
      if (deficit > 0) {
        recommendations.push({
          distance: 'far',
          criterion: 'Sheard',
          prism: Math.ceil(deficit / 3),
          direction: recDirection as 'BI' | 'BO',
          reason: `遠距儲備不足 ${deficit.toFixed(1)}Δ`
        });
      }
    }

    return { recommendations, filteredMessages };
  };


  const { recommendations: prismRecommendations, filteredMessages: prismFilteredMessages } = calculatePrismRecommendations();

  // ============================================
  // 視覺訓練建議計算
  // 根據不通過的準則給予 BI/BO 融像訓練方向
  // ============================================
  const calculateTrainingRecommendations = () => {
    const recommendations: {
      distance: 'far' | 'near';
      direction: 'BI' | 'BO';
      priority: 'high' | 'medium';
      reason: string;
      targetReserve: number;
      currentReserve: number;
    }[] = [];

    // Sheard 遠距：訓練補償性融像
    if (!distSheardPass && safeDist !== 0) {
      // Exophoria → 訓練 BO (增強正向融像儲備)
      // Esophoria → 訓練 BI (增強負向融像儲備)
      const direction: 'BI' | 'BO' = safeDist < 0 ? 'BO' : 'BI';
      const targetReserve = distSheardDemand; // 目標: reserve >= 2 × |phoria|
      recommendations.push({
        distance: 'far',
        direction,
        priority: 'high',
        reason: txt(`Sheard 不通過 (${safeDist < 0 ? 'exo' : 'eso'})`, `Sheard 不通过 (${safeDist < 0 ? 'exo' : 'eso'})`, `Sheard fail (${safeDist < 0 ? 'exo' : 'eso'})`),
        targetReserve,
        currentReserve: distSheardReserve
      });
    }

    // Sheard 近距
    if (!nearSheardPass && safeNear !== 0) {
      const direction: 'BI' | 'BO' = safeNear < 0 ? 'BO' : 'BI';
      const targetReserve = nearSheardDemand;
      recommendations.push({
        distance: 'near',
        direction,
        priority: 'high',
        reason: txt(`Sheard 不通過 (${safeNear < 0 ? 'exo' : 'eso'})`, `Sheard 不通过 (${safeNear < 0 ? 'exo' : 'eso'})`, `Sheard fail (${safeNear < 0 ? 'exo' : 'eso'})`),
        targetReserve,
        currentReserve: nearSheardReserve
      });
    }

    // Percival 遠距：訓練較弱側融像
    if (!distPercivalPass) {
      const smallerIsBI = safeDistBi < safeDistBo;
      // 訓練較弱側
      const direction: 'BI' | 'BO' = smallerIsBI ? 'BI' : 'BO';
      const targetReserve = Math.round(distPercivalRequired);
      recommendations.push({
        distance: 'far',
        direction,
        priority: 'medium',
        reason: txt(`Percival 不通過 (${smallerIsBI ? 'BI' : 'BO'}側較弱)`, `Percival 不通过 (${smallerIsBI ? 'BI' : 'BO'}侧较弱)`, `Percival fail (${smallerIsBI ? 'BI' : 'BO'} weaker)`),
        targetReserve,
        currentReserve: distMinReserve
      });
    }

    // Percival 近距
    if (!nearPercivalPass) {
      const smallerIsBI = safeBi < safeBo;
      const direction: 'BI' | 'BO' = smallerIsBI ? 'BI' : 'BO';
      const targetReserve = Math.round(nearPercivalRequired);
      recommendations.push({
        distance: 'near',
        direction,
        priority: 'medium',
        reason: txt(`Percival 不通過 (${smallerIsBI ? 'BI' : 'BO'}側較弱)`, `Percival 不通过 (${smallerIsBI ? 'BI' : 'BO'}侧较弱)`, `Percival fail (${smallerIsBI ? 'BI' : 'BO'} weaker)`),
        targetReserve,
        currentReserve: nearMinReserve
      });
    }

    // 合併同方向的建議
    const merged: typeof recommendations = [];
    for (const rec of recommendations) {
      const existing = merged.find(m => m.distance === rec.distance && m.direction === rec.direction);
      if (existing) {
        // 保留較高優先級和較大目標
        if (rec.priority === 'high') existing.priority = 'high';
        existing.targetReserve = Math.max(existing.targetReserve, rec.targetReserve);
        existing.reason = `${existing.reason}、${rec.reason.split(' ')[0]}`;
      } else {
        merged.push({ ...rec });
      }
    }

    return merged;
  };

  const trainingRecommendations = calculateTrainingRecommendations();

  // Y-axis ticks
  const yTicks = [0, 1, 2, 3];

  return (
    <div className={cn("w-full flex flex-col items-center", className)}>
      {/* 手機版：圖表容器 */}
      <div className="w-full overflow-x-auto pb-2 -mx-2 px-2 md:overflow-visible md:mx-0 md:px-0">
        <svg 
          width="100%" 
          viewBox={`0 0 ${width} ${height}`} 
          className="bg-card rounded-xl border border-border overflow-hidden min-w-[320px] md:min-w-0 md:max-w-[500px]"
          style={{ touchAction: 'pan-x pan-y' }}
        >
        <defs>
          <linearGradient id="nearFusionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(195 85% 55%)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(195 85% 55%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(195 85% 55%)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="distFusionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(280 70% 60%)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(280 70% 60%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(280 70% 60%)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="100%" height="100%" fill="hsl(var(--card))" />

        {/* Grid lines - vertical */}
        {xTicks.map((val) => (
          <line 
            key={`v-${val}`}
            x1={scaleX(val)} 
            y1={topPadding} 
            x2={scaleX(val)} 
            y2={height - bottomPadding} 
            stroke="hsl(var(--border))" 
            strokeWidth="1" 
            opacity={val === 0 ? "0.8" : "0.3"}
          />
        ))}

        {/* Grid lines - horizontal */}
        {yTicks.map((val) => (
          <line 
            key={`h-${val}`}
            x1={padding} 
            y1={scaleY(val)} 
            x2={width - rightPadding} 
            y2={scaleY(val)} 
            stroke="hsl(var(--border))" 
            strokeWidth="1" 
            opacity={val === 0 ? "0.8" : "0.3"}
          />
        ))}

        {/* Morgan 標準舒適區 (綠色虛線區) */}
        <path 
          d={morganPath} 
          fill="hsl(160 70% 50% / 0.12)" 
          stroke="hsl(160 70% 45%)" 
          strokeWidth="1.5" 
          strokeDasharray="5 3"
        />

        {/* Demand line (灰色虛線) */}
        <line 
          x1={demandFar.x} y1={demandFar.y} 
          x2={demandNear.x} y2={demandNear.y} 
          stroke="hsl(var(--muted-foreground))" 
          strokeWidth="2" 
          strokeDasharray="8 4" 
          opacity="0.4"
        />

        {/* Sheard 準則線 - 遠距 (需求 ×2 的位置) */}
        {safeDist !== 0 && (
          <>
            <line 
              x1={distSheardLineX} y1={distRangeY - 16} 
              x2={distSheardLineX} y2={distRangeY + 16} 
              stroke={distSheardPass ? "hsl(160 70% 45%)" : "hsl(0 80% 55%)"}
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            <text 
              x={distSheardLineX} 
              y={distRangeY + 26} 
              textAnchor="middle" 
              fontSize="9" 
              fill={distSheardPass ? "hsl(160 70% 40%)" : "hsl(0 80% 50%)"}
              fontWeight="700"
            >
              2×
            </text>
          </>
        )}

        {/* Percival 準則 - 遠距中間 1/3 舒適區 */}
        <rect 
          x={distPercivalZoneStart} 
          y={distRangeY - 6} 
          width={distPercivalZoneEnd - distPercivalZoneStart} 
          height={12} 
          fill={distPercivalPass ? "hsl(45 90% 55% / 0.25)" : "hsl(45 90% 55% / 0.1)"}
          stroke={distPercivalPass ? "hsl(45 85% 45%)" : "hsl(45 85% 45% / 0.4)"}
          strokeWidth="1"
          strokeDasharray="2 2"
          rx="2"
        />

        {/* 遠距融像儲備範圍 (紫色) */}
        <rect 
          x={distBiBreakX} 
          y={distRangeY - 10} 
          width={distBoBreakX - distBiBreakX} 
          height={20} 
          fill="url(#distFusionGradient)" 
          rx="3"
        />
        <line 
          x1={distBiBreakX} y1={distRangeY - 12} 
          x2={distBiBreakX} y2={distRangeY + 12} 
          stroke="hsl(280 70% 55%)" 
          strokeWidth="2"
        />
        <line 
          x1={distBoBreakX} y1={distRangeY - 12} 
          x2={distBoBreakX} y2={distRangeY + 12} 
          stroke="hsl(280 70% 55%)" 
          strokeWidth="2"
        />

        {/* Sheard 準則線 - 近距 (需求 ×2 的位置) */}
        {safeNear !== 0 && (
          <>
            <line 
              x1={nearSheardLineX} y1={nearRangeY - 16} 
              x2={nearSheardLineX} y2={nearRangeY + 16} 
              stroke={nearSheardPass ? "hsl(160 70% 45%)" : "hsl(0 80% 55%)"}
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            <text 
              x={nearSheardLineX} 
              y={nearRangeY + 26} 
              textAnchor="middle" 
              fontSize="9" 
              fill={nearSheardPass ? "hsl(160 70% 40%)" : "hsl(0 80% 50%)"}
              fontWeight="700"
            >
              2×
            </text>
          </>
        )}

        {/* Percival 準則 - 近距中間 1/3 舒適區 */}
        <rect 
          x={nearPercivalZoneStart} 
          y={nearRangeY - 6} 
          width={nearPercivalZoneEnd - nearPercivalZoneStart} 
          height={12} 
          fill={nearPercivalPass ? "hsl(45 90% 55% / 0.25)" : "hsl(45 90% 55% / 0.1)"}
          stroke={nearPercivalPass ? "hsl(45 85% 45%)" : "hsl(45 85% 45% / 0.4)"}
          strokeWidth="1"
          strokeDasharray="2 2"
          rx="2"
        />

        {/* 近距融像儲備範圍 (青色) */}
        <rect 
          x={nearBiBreakX} 
          y={nearRangeY - 10} 
          width={nearBoBreakX - nearBiBreakX} 
          height={20} 
          fill="url(#nearFusionGradient)" 
          rx="3"
        />
        <line 
          x1={nearBiBreakX} y1={nearRangeY - 12} 
          x2={nearBiBreakX} y2={nearRangeY + 12} 
          stroke="hsl(195 85% 50%)" 
          strokeWidth="2"
        />
        <line 
          x1={nearBoBreakX} y1={nearRangeY - 12} 
          x2={nearBoBreakX} y2={nearRangeY + 12} 
          stroke="hsl(195 85% 50%)" 
          strokeWidth="2"
        />

        {/* BI/BO 標籤 - 遠距 (手機上加大) */}
        <text x={distBiBreakX} y={distRangeY - 18} textAnchor="middle" fontSize="10" fill="hsl(280 70% 50%)" fontWeight="700">
          BI
        </text>
        <text x={distBoBreakX} y={distRangeY - 18} textAnchor="middle" fontSize="10" fill="hsl(280 70% 50%)" fontWeight="700">
          BO
        </text>

        {/* BI/BO 標籤 - 近距 (手機上加大) */}
        <text x={nearBiBreakX} y={nearRangeY - 18} textAnchor="middle" fontSize="10" fill="hsl(195 85% 45%)" fontWeight="700">
          BI
        </text>
        <text x={nearBoBreakX} y={nearRangeY - 18} textAnchor="middle" fontSize="10" fill="hsl(195 85% 45%)" fontWeight="700">
          BO
        </text>

        {/* 理論 AC/A 線 (灰色虛線) - 從 distPhoria 依 AC/A 推算理論近距位置 */}
        <line 
          x1={pFar.x} y1={pFar.y} 
          x2={pTheoNear.x} y2={pTheoNear.y} 
          stroke="hsl(var(--muted-foreground))" 
          strokeWidth="2.5" 
          strokeDasharray="6 4"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* 實測 AC/A 線 (藍色實線) */}
        <line 
          x1={pFar.x} y1={pFar.y} 
          x2={pNear.x} y2={pNear.y} 
          stroke="hsl(215 90% 50%)" 
          strokeWidth="3" 
          strokeLinecap="round"
        />

        {/* Phoria 點 - 遠距 */}
        <circle cx={pFar.x} cy={pFar.y} r="7" fill="hsl(215 90% 50%)" />
        
        {/* Phoria 點 - 近距 (實測) */}
        <circle cx={pNear.x} cy={pNear.y} r="7" fill="hsl(215 90% 50%)" />
        
        {/* Phoria 點 - 近距 (理論, 空心) */}
        <circle 
          cx={pTheoNear.x} cy={pTheoNear.y} r="6" 
          fill="none" 
          stroke="hsl(var(--muted-foreground))" 
          strokeWidth="2"
          strokeDasharray="3 2"
        />

        {/* 點標籤 (手機上加大) */}
        <text x={pFar.x + 10} y={pFar.y + 4} textAnchor="start" fontSize="11" fill="hsl(215 90% 45%)" fontWeight="700">
          {txt('遠', '远', 'Dist')} ({safeDist > 0 ? 'eso' : safeDist < 0 ? 'exo' : 'ortho'})
        </text>
        <text x={pNear.x + 10} y={pNear.y + 4} textAnchor="start" fontSize="11" fill="hsl(215 90% 45%)" fontWeight="700">
          {txt('近', '近', 'Near')} ({safeNear > 0 ? 'eso' : safeNear < 0 ? 'exo' : 'ortho'})
        </text>
        <text x={pTheoNear.x - 6} y={pTheoNear.y - 12} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="600">
          {txt('理論', '理论', 'Theory')}
        </text>

        {/* Y-axis label */}
        <text 
          x={12} 
          y={height / 2} 
          textAnchor="middle" 
          fontSize="10" 
          fill="hsl(var(--muted-foreground))" 
          fontWeight="600"
          transform={`rotate(-90, 12, ${height / 2})`}
        >
          {txt('調節 (D)', '调节 (D)', 'Accom (D)')}
        </text>

        {/* Y-axis tick labels */}
        {yTicks.map((val) => (
          <text 
            key={`yl-${val}`}
            x={padding - 6} 
            y={scaleY(val) + 4} 
            textAnchor="end" 
            fontSize="11" 
            fill="hsl(var(--muted-foreground))"
            fontWeight="500"
          >
            {val}
          </text>
        ))}

        {/* X-axis label */}
        <text 
          x={(width - rightPadding + padding) / 2} 
          y={height - 10} 
          textAnchor="middle" 
          fontSize="10" 
          fill="hsl(var(--muted-foreground))" 
          fontWeight="600"
        >
          {txt('稜鏡度 (BI − / BO +)', '棱镜度 (BI − / BO +)', 'Prism (BI − / BO +)')}
        </text>

        {/* X-axis tick labels */}
        {xTicks.map((val) => (
          <text 
            key={`xl-${val}`}
            x={scaleX(val)} 
            y={height - bottomPadding + 15} 
            textAnchor="middle" 
            fontSize="11" 
            fill="hsl(var(--muted-foreground))"
            fontWeight="500"
          >
            {val}
          </text>
        ))}

        {/* 距離標籤 */}
        <text 
          x={padding - 28} 
          y={scaleY(0) + 4} 
          textAnchor="end" 
          fontSize="10" 
          fill="hsl(var(--muted-foreground))"
          fontWeight="700"
        >
          {txt('遠', '远', 'Dist')}
        </text>
        <text 
          x={padding - 28} 
          y={scaleY(workDemandD) + 4} 
          textAnchor="end" 
          fontSize="10" 
          fill="hsl(var(--muted-foreground))"
          fontWeight="700"
        >
          {txt('近', '近', 'Near')}
        </text>
      </svg>
      </div>

      {/* Legend - 手機版簡化 */}
      <div className="mt-3 text-[11px] text-muted-foreground grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-2 md:gap-x-4 md:gap-y-2 w-full px-2">
        <span className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: 'hsl(215 90% 50%)' }} />
          {txt('實測 AC/A', '实测 AC/A', 'Measured AC/A')}
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded-full border-t-2 border-dashed" style={{ borderColor: 'hsl(var(--muted-foreground))' }} />
          {txt('理論 AC/A', '理论 AC/A', 'Theoretical AC/A')}
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-dashed" style={{ borderColor: 'hsl(160 70% 45%)', backgroundColor: 'hsl(160 70% 50% / 0.12)' }} />
          {txt('Morgan 區', 'Morgan 区', 'Morgan Zone')}
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-4 h-2 rounded border border-dashed" style={{ borderColor: 'hsl(45 85% 45%)', backgroundColor: 'hsl(45 90% 55% / 0.25)' }} />
          Percival
        </span>
      </div>
      
      {/* Comfort Score Display - 手機版緊湊設計 */}
      <div className="mt-4 flex items-center gap-4 md:flex-col md:items-center">
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={scoreGrade.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${comfortScore * 2.64} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl md:text-2xl font-bold" style={{ color: scoreGrade.color }}>
              {comfortScore}
            </span>
            <span className="text-[9px] md:text-[10px] text-muted-foreground">{txt('舒適度', '舒适度', 'Comfort')}</span>
          </div>
        </div>
        <div className="flex-1 md:hidden">
          <span 
            className="text-base font-bold"
            style={{ color: scoreGrade.color }}
          >
            {scoreGrade.label}
          </span>
          <div className="text-xs text-muted-foreground mt-1">
            {txt('根據 Morgan、Sheard、Percival 準則計算', '根据 Morgan、Sheard、Percival 准则计算', 'Based on Morgan, Sheard, Percival criteria')}
          </div>
        </div>
        <span 
          className="hidden md:block mt-1 text-sm font-semibold"
          style={{ color: scoreGrade.color }}
        >
          {scoreGrade.label}
        </span>
      </div>

      {/* Criteria Status Summary - 手機版橫向滾動或網格 */}
      <div className="mt-3 w-full space-y-2 px-2">
        {/* Morgan */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-semibold w-16 flex-shrink-0">Morgan</span>
          <div className="flex gap-2 flex-wrap">
            <div className={`px-2 py-1 rounded-full font-semibold ${distInMorgan ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
              {txt('遠', '远', 'Dist')} {distInMorgan ? '✓' : '✗'}
            </div>
            <div className={`px-2 py-1 rounded-full font-semibold ${nearInMorgan ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
              {txt('近', '近', 'Near')} {nearInMorgan ? '✓' : '✗'}
            </div>
          </div>
        </div>
        
        {/* Sheard */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-semibold w-16 flex-shrink-0">Sheard</span>
          <div className="flex gap-2 flex-wrap">
            <div className={`px-2 py-1 rounded-full font-semibold ${distSheardPass ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              {txt('遠', '远', 'Dist')} {distSheardPass ? '✓' : '✗'}
            </div>
            <div className={`px-2 py-1 rounded-full font-semibold ${nearSheardPass ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              {txt('近', '近', 'Near')} {nearSheardPass ? '✓' : '✗'}
            </div>
          </div>
        </div>
        
        {/* Percival */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-semibold w-16 flex-shrink-0">Percival</span>
          <div className="flex gap-2 flex-wrap">
            <div className={`px-2 py-1 rounded-full font-semibold ${distPercivalPass ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
              {txt('遠', '远', 'Dist')} {distPercivalPass ? '✓' : '✗'}
            </div>
            <div className={`px-2 py-1 rounded-full font-semibold ${nearPercivalPass ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
              {txt('近', '近', 'Near')} {nearPercivalPass ? '✓' : '✗'}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Distance Pattern Analysis */}
      <div className="mt-4 w-full px-2">
        <div className="bg-muted/30 border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔍</span>
            <span className="text-sm font-bold text-foreground">{txt('主要問題分析', '主要问题分析', 'Primary Issue Analysis')}</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{txt('診斷類型', '诊断类型', 'Diagnosis')}:</span>
              <span className="font-semibold text-foreground">{language === 'en' ? (primaryAnalysis.description || primaryAnalysis.descriptionCN) : language === 'zh-CN' ? primaryAnalysis.descriptionCN : primaryAnalysis.descriptionCN}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{txt('遠近眼位差異', '远近眼位差异', 'Phoria Difference')}:</span>
              <span className="font-semibold">{primaryAnalysis.phoriaDifference}Δ</span>
            </div>
            {primaryAnalysis.clinicalSignificanceCN && (
              <div className="flex items-start gap-2 mt-1">
                <span className="text-muted-foreground">{txt('臨床意義', '临床意义', 'Clinical Significance')}:</span>
                <span className="text-xs text-muted-foreground">{language === 'en' ? (primaryAnalysis.clinicalSignificance || primaryAnalysis.clinicalSignificanceCN) : language === 'zh-CN' ? primaryAnalysis.clinicalSignificanceCN : primaryAnalysis.clinicalSignificanceCN}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prism Recommendations */}
      {prismRecommendations.length > 0 ? (
        <div className="mt-4 w-full px-2">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💎</span>
              <span className="text-sm font-bold text-primary">{txt('稜鏡補償建議', '棱镜补偿建议', 'Prism Recommendation')}</span>
            </div>
            <div className="space-y-2">
              {prismRecommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between text-sm bg-background/50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                      rec.distance === 'far' 
                        ? 'bg-purple-500/20 text-purple-600' 
                        : rec.distance === 'both'
                          ? 'bg-amber-500/20 text-amber-600'
                          : 'bg-cyan-500/20 text-cyan-600'
                    }`}>
                      {rec.distance === 'far' 
                        ? txt('遠', '远', 'Dist') 
                        : rec.distance === 'both' 
                          ? txt('全天', '全天', 'Full-time')
                          : txt('近', '近', 'Near')}
                    </span>
                  </div>
                  <span className="font-bold text-primary">
                    {rec.prism}Δ {rec.direction}
                  </span>
                </div>
              ))}
            </div>
            {/* 優先順序提示 */}
            {unifiedPrismRec.priority === 'secondary' && (
              <div className="mt-2 p-2 bg-warning/10 rounded-lg">
                <p className="text-xs text-warning font-medium flex items-center gap-1">
                  <span>⚠️</span>
                  {txt('視覺訓練優先，稜鏡為輔助', '视觉训练优先，棱镜为辅助', 'Vision training first, prism as support')}
                </p>
              </div>
            )}
            {/* 替代方案 */}
            {unifiedPrismRec.alternativesCN && unifiedPrismRec.alternativesCN.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">{txt('替代方案', '替代方案', 'Alternatives')}: </span>
                {unifiedPrismRec.alternativesCN.join('、')}
              </div>
            )}
            {/* 顯示被過濾的建議 */}
            {prismFilteredMessages.length > 0 && (
              <div className="mt-2 space-y-1">
                {prismFilteredMessages.map((msg, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>ℹ️</span>
                    <span>{msg.message}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground text-center">
              * {txt('實際處方需臨床驗證', '实际处方需临床验证', 'Actual prescription requires clinical verification')}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 w-full px-2">
          <div className="bg-success/5 border border-success/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✅</span>
              <span className="text-sm font-bold text-success">{txt('稜鏡評估結果', '棱镜评估结果', 'Prism Assessment')}</span>
            </div>
            <div className="space-y-1">
              {prismFilteredMessages.length > 0 ? (
                prismFilteredMessages.map((msg, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground">{msg.message}</p>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  {txt('目前數據顯示不需要稜鏡輔助', '目前数据显示不需要棱镜辅助', 'Current data shows no prism assistance needed')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 多情境處置建議 */}
      {(() => {
        const scenarioRecs = generateAllScenarioRecommendations(
          primaryAnalysis.pattern,
          unifiedPrismRec,
          ciss,
          age
        );
        
        // 判斷預設顯示哪個情境
        const isHighSymptom = ciss >= 21;
        const isLowSymptom = ciss < 16;
        const defaultScenario = isLowSymptom ? 'C' : (isHighSymptom ? 'A' : 'B');
        
        return (
          <div className="mt-4 w-full px-2">
            <ScenarioRecommendations 
              scenarios={scenarioRecs}
              defaultScenario={defaultScenario}
              language={language === 'zh-CN' ? 'zh-CN' : 'zh-TW'}
            />
          </div>
        );
      })()}

      {/* Visual Training Recommendations */}
      {trainingRecommendations.length > 0 && (
        <div className="mt-4 w-full px-2">
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🏋️</span>
              <span className="text-sm font-bold text-accent-foreground">{txt('視覺訓練建議', '视觉训练建议', 'Vision Training Recommendations')}</span>
            </div>
            <div className="space-y-2">
              {trainingRecommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  className="bg-background/50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                        rec.distance === 'far' ? 'bg-purple-500/20 text-purple-600' : 'bg-cyan-500/20 text-cyan-600'
                      }`}>
                        {rec.distance === 'far' ? txt('遠', '远', 'Dist') : txt('近', '近', 'Near')}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                        rec.priority === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                      }`}>
                        {rec.priority === 'high' ? txt('優先', '优先', 'Priority') : txt('建議', '建议', 'Recommended')}
                      </span>
                    </div>
                    <span className={`font-bold text-sm ${
                      rec.direction === 'BO' ? 'text-emerald-600' : 'text-blue-600'
                    }`}>
                      {rec.direction} {txt('融像', '融像', 'Fusion')}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {txt('目標', '目标', 'Target')}: {rec.currentReserve}Δ → {rec.targetReserve}Δ
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-center">
              * {txt('訓練計畫應由專業人員制定', '训练计划应由专业人员制定', 'Training plan should be designed by professionals')}
            </p>
          </div>
        </div>
      )}

      {/* Accommodation Training Recommendations */}
      {(() => {
        // 調節訓練建議計算
        const avgAA = (aaOD + aaOS) / 2;
        const expectedAA = Math.max(0, 15 - 0.25 * age);
        const accomDemand = workDemandD * 2; // 調節需求的 2 倍 (Hofstetter 50% rule)
        
        const accomRecommendations: {
          type: 'amplitude' | 'facility' | 'nra' | 'pra';
          priority: 'high' | 'medium';
          title: string;
          current: string;
          target: string;
          reason: string;
          exercises: string[];
        }[] = [];

        // 1. 調節幅度不足
        if (avgAA < expectedAA) {
          const deficit = expectedAA - avgAA;
          accomRecommendations.push({
            type: 'amplitude',
            priority: deficit > 3 ? 'high' : 'medium',
            title: txt('調節幅度訓練', '调节幅度训练'),
            current: `${avgAA.toFixed(1)} D`,
            target: `${expectedAA.toFixed(1)} D`,
            reason: txt(`低於年齡期望值 ${deficit.toFixed(1)} D`, `低于年龄期望值 ${deficit.toFixed(1)} D`),
            exercises: language === 'en' ? [
              'Push-up training: gradually push target closer until blur',
              'Hart Chart: practice far-near alternation',
              'Minus Lens: progressively increase negative lens power'
            ] : language === 'zh-CN' ? [
              'Push-up 调节训练：将目标逐渐推近直到模糊',
              'Hart Chart 远近交替：训练调节灵活度与幅度',
              'Minus Lens 逐步增加：使用负镜片刺激调节'
            ] : [
              'Push-up 調節訓練：將目標逐漸推近直到模糊',
              'Hart Chart 遠近交替：訓練調節靈活度與幅度',
              'Minus Lens 逐步增加：使用負鏡片刺激調節'
            ]
          });
        }
        
        // 調節幅度不足以應付工作需求
        if (avgAA < accomDemand) {
          const deficit = accomDemand - avgAA;
          if (!accomRecommendations.some(r => r.type === 'amplitude')) {
            accomRecommendations.push({
              type: 'amplitude',
              priority: 'high',
              title: txt('調節幅度訓練', '调节幅度训练'),
              current: `${avgAA.toFixed(1)} D`,
              target: `${accomDemand.toFixed(1)} D`,
              reason: txt(`不足以應付近距工作需求 (${workDemandD}D × 2)`, `不足以应付近距工作需求 (${workDemandD}D × 2)`),
              exercises: language === 'en' ? [
                'Push-up training: push target closer until blur',
                'Hart Chart: far-near alternation training'
              ] : language === 'zh-CN' ? [
                'Push-up 调节训练：将目标逐渐推近直到模糊',
                'Hart Chart 远近交替：训练调节灵活度与幅度'
              ] : [
                'Push-up 調節訓練：將目標逐漸推近直到模糊',
                'Hart Chart 遠近交替：訓練調節靈活度與幅度'
              ]
            });
          }
        }

        // 2. 調節靈敏度不足 (正常值 ≥ 12 cpm)
        if (flipper < 12) {
          accomRecommendations.push({
            type: 'facility',
            priority: flipper < 8 ? 'high' : 'medium',
            title: txt('調節靈敏度訓練', '调节灵敏度训练'),
            current: `${flipper} cpm`,
            target: '≥12 cpm',
            reason: flipper < 8 ? txt('顯著低於正常值', '显著低于正常值') : txt('略低於正常值', '略低于正常值'),
            exercises: language === 'en' ? [
              '±2.00 Flipper training: alternating plus and minus lenses',
              'Hart Chart rhythm: far-near switching with metronome',
              'Accommodative Rock: rapid focus shifting'
            ] : language === 'zh-CN' ? [
              '±2.00 Flipper 训练：双眼交替正负镜片清晰化',
              'Hart Chart 节奏训练：配合节拍器进行远近切换',
              'Accommodative Rock：视标远近快速切换'
            ] : [
              '±2.00 Flipper 訓練：雙眼交替正負鏡片清晰化',
              'Hart Chart 節奏訓練：配合節拍器進行遠近切換',
              'Accommodative Rock：視標遠近快速切換'
            ]
          });
        }

        // 3. NRA 異常 (正常值 +2.00 ~ +2.50)
        if (nra < 1.75) {
          accomRecommendations.push({
            type: 'nra',
            priority: nra < 1.5 ? 'high' : 'medium',
            title: txt('負相對調節 (NRA) 訓練', '负相对调节 (NRA) 训练'),
            current: `+${nra.toFixed(2)} D`,
            target: '+2.00 ~ +2.50 D',
            reason: txt('NRA 低落，調節放鬆能力不足', 'NRA 低落，调节放松能力不足'),
            exercises: language === 'en' ? [
              'Distance viewing: regularly look at far objects to relax',
              'Plus lens reading: use +1.00 lens for relaxation training',
              '20-20-20 rule: every 20 min, look 20 feet away for 20 sec'
            ] : language === 'zh-CN' ? [
              '远方注视训练：定期望向远处放松睫状肌',
              '正镜片阅读：使用 +1.00 镜片阅读训练放松',
              '20-20-20 法则：每 20 分钟看 20 英尺外 20 秒'
            ] : [
              '遠方注視訓練：定期望向遠處放鬆睫狀肌',
              '正鏡片閱讀：使用 +1.00 鏡片閱讀訓練放鬆',
              '20-20-20 法則：每 20 分鐘看 20 呎外 20 秒'
            ]
          });
        } else if (nra > 2.75) {
          accomRecommendations.push({
            type: 'nra',
            priority: 'medium',
            title: txt('調節刺激訓練', '调节刺激训练'),
            current: `+${nra.toFixed(2)} D`,
            target: '+2.00 ~ +2.50 D',
            reason: txt('NRA 過高，可能調節反應不足', 'NRA 过高，可能调节反应不足'),
            exercises: language === 'en' ? [
              'Minus lens training: use -1.00 ~ -2.00 to stimulate accommodation',
              'Push-up training: enhance accommodation response'
            ] : language === 'zh-CN' ? [
              '负镜片训练：使用 -1.00 ~ -2.00 镜片刺激调节',
              'Push-up 调节训练：增强调节反应'
            ] : [
              '負鏡片訓練：使用 -1.00 ~ -2.00 鏡片刺激調節',
              'Push-up 調節訓練：增強調節反應'
            ]
          });
        }

        // 4. PRA 異常 (正常值 -2.25 ~ -3.00)
        if (pra > -2.0) {
          accomRecommendations.push({
            type: 'pra',
            priority: pra > -1.5 ? 'high' : 'medium',
            title: txt('正相對調節 (PRA) 訓練', '正相对调节 (PRA) 训练'),
            current: `${pra.toFixed(2)} D`,
            target: '-2.25 ~ -3.00 D',
            reason: txt('PRA 低落，調節用力能力不足', 'PRA 低落，调节用力能力不足'),
            exercises: language === 'en' ? [
              'Minus lens clearing: progressively train with -1.00 ~ -3.00',
              'Push-up training: maintain clarity after blur point',
              'Brock String: combine convergence with accommodation training'
            ] : language === 'zh-CN' ? [
              '负镜片清晰化：使用 -1.00 ~ -3.00 逐步训练',
              'Push-up 调节训练：推至模糊点后维持清晰',
              'Brock String 调节：配合集合进行调节训练'
            ] : [
              '負鏡片清晰化：使用 -1.00 ~ -3.00 逐步訓練',
              'Push-up 調節訓練：推至模糊點後維持清晰',
              'Brock String 調節：配合集合進行調節訓練'
            ]
          });
        }

        if (accomRecommendations.length === 0) return null;

        return (
          <div className="mt-4 w-full max-w-md">
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-xs">👁️</span>
                </div>
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">{txt('調節訓練建議', '调节训练建议')}</span>
              </div>
              <div className="space-y-2">
                {accomRecommendations.map((rec, idx) => (
                  <div 
                    key={idx} 
                    className="bg-background/50 rounded-md px-3 py-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          rec.type === 'amplitude' ? 'bg-orange-500/20 text-orange-600' : 
                          rec.type === 'facility' ? 'bg-amber-500/20 text-amber-600' :
                          rec.type === 'nra' ? 'bg-teal-500/20 text-teal-600' :
                          'bg-indigo-500/20 text-indigo-600'
                        }`}>
                          {rec.type === 'amplitude' ? txt('幅度', '幅度') : 
                           rec.type === 'facility' ? txt('靈敏', '灵敏') :
                           rec.type === 'nra' ? 'NRA' : 'PRA'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          rec.priority === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                        }`}>
                          {rec.priority === 'high' ? txt('優先', '优先') : txt('建議', '建议')}
                        </span>
                      </div>
                      <span className="font-bold text-sm text-orange-600 dark:text-orange-400">
                        {rec.title}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{rec.reason}</span>
                      <span>
                        {rec.current} → {rec.target}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {rec.exercises.map((ex, exIdx) => (
                        <div key={exIdx} className="text-[10px] text-muted-foreground/70 flex items-start gap-1">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground text-center">
                * {txt('調節訓練應漸進式進行，每日練習 10-15 分鐘效果最佳', '调节训练应渐进式进行，每日练习 10-15 分钟效果最佳')}
              </p>
            </div>
          </div>
        );
      })()}

      {/* NPC Training Recommendations */}
      {(() => {
        // NPC 訓練建議計算
        // 正常值: ≤ 6 cm (break), ≤ 10 cm (recovery)
        // 邊界值: 7-10 cm
        // 異常值: > 10 cm
        
        if (npc <= 6) return null; // 正常，無需訓練建議
        
        const isRemoteNPC = npc > 10;
        const isBorderline = npc > 6 && npc <= 10;
        
        // 判斷是否為假性 CI（調節不足導致）
        const avgAA = (aaOD + aaOS) / 2;
        const expectedAA = Math.max(0, 15 - 0.25 * age);
        const isPseudoCI = avgAA < expectedAA && npc > 6;
        
        // 計算訓練目標
        const targetNPC = 6;
        const improvement = npc - targetNPC;

        return (
          <div className="mt-4 w-full max-w-md">
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <span className="text-xs">🎯</span>
                </div>
                <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">{txt('NPC 輻輳訓練建議', 'NPC 辐辏训练建议')}</span>
              </div>
              
              <div className="bg-background/50 rounded-md px-3 py-2">
                {/* Status Header */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      isRemoteNPC ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                    }`}>
                      {isRemoteNPC ? txt('遠離', '远离') : txt('邊界', '边界')}
                    </span>
                    {isPseudoCI && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-600">
                        {txt('疑似假性 CI', '疑似假性 CI')}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {npc} cm → {targetNPC} cm
                  </span>
                </div>
                
                {/* Analysis */}
                <div className="text-[10px] text-muted-foreground mb-2">
                  {isRemoteNPC ? (
                    <span>{txt('NPC 顯著遠離 (＞10cm)，輻輳能力明顯不足，需積極訓練。', 'NPC 显著远离 (＞10cm)，辐辏能力明显不足，需积极训练。')}</span>
                  ) : (
                    <span>{txt('NPC 略遠 (6-10cm)，建議進行預防性訓練以維持良好輻輳功能。', 'NPC 略远 (6-10cm)，建议进行预防性训练以维持良好辐辏功能。')}</span>
                  )}
                  {isPseudoCI && (
                    <span className="block mt-1 text-purple-600">
                      ⚠️ {txt('合併調節不足，可能為假性集合不足 (Pseudo-CI)，建議同時訓練調節。', '合并调节不足，可能为假性集合不足 (Pseudo-CI)，建议同时训练调节。')}
                    </span>
                  )}
                </div>

                {/* Training Exercises */}
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                    {txt('推薦訓練方案：', '推荐训练方案：')}
                  </div>
                  
                  {/* Pencil Push-ups */}
                  <div className="bg-rose-500/5 rounded p-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
                      <span className="text-rose-500">①</span>
                      Pencil Push-ups ({txt('鉛筆推拿', '铅笔推拿')})
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-1 space-y-0.5">
                      <div>• {txt('將鉛筆置於手臂長度，緩慢推向鼻尖', '将铅笔置于手臂长度，缓慢推向鼻尖')}</div>
                      <div>• {txt('維持單一清晰影像，直到看到雙影', '维持单一清晰影像，直到看到双影')}</div>
                      <div>• {txt('記錄雙影出現距離，目標：≤6cm', '记录双影出现距离，目标：≤6cm')}</div>
                      <div>• {txt('每組 10-15 次，每日 3 組', '每组 10-15 次，每日 3 组')}</div>
                    </div>
                  </div>

                  {/* Brock String */}
                  <div className="bg-rose-500/5 rounded p-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
                      <span className="text-rose-500">②</span>
                      Brock String ({txt('布洛克線', '布洛克线')})
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-1 space-y-0.5">
                      <div>• {txt('繩上穿 3 顆不同顏色珠子，距離 30/60/90cm', '绳上穿 3 颗不同颜色珠子，距离 30/60/90cm')}</div>
                      <div>• {txt('注視不同珠子，確認看到 X 形交叉', '注视不同珠子，确认看到 X 形交叉')}</div>
                      <div>• {txt('訓練生理複視感知與輻輳控制', '训练生理复视感知与辐辏控制')}</div>
                      <div>• {txt('每個珠子注視 10 秒，每日 5-10 分鐘', '每个珠子注视 10 秒，每日 5-10 分钟')}</div>
                    </div>
                  </div>

                  {/* Convergence Cards */}
                  <div className="bg-rose-500/5 rounded p-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
                      <span className="text-rose-500">③</span>
                      Convergence Cards ({txt('輻輳卡', '辐辏卡')})
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-1 space-y-0.5">
                      <div>• {txt('使用 BO 輻輳卡進行融像訓練', '使用 BO 辐辏卡进行融像训练')}</div>
                      <div>• {txt('從大分離度開始，逐步增加難度', '从大分离度开始，逐步增加难度')}</div>
                      <div>• {txt('每日練習 10-15 分鐘', '每日练习 10-15 分钟')}</div>
                    </div>
                  </div>

                  {isPseudoCI && (
                    <div className="bg-purple-500/5 rounded p-2 border border-purple-500/20">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-purple-600">
                        <span>💡</span>
                        {txt('假性 CI 額外建議', '假性 CI 额外建议')}
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-1 space-y-0.5">
                        <div>• {txt('同時進行調節訓練 (±2.00 Flipper)', '同时进行调节训练 (±2.00 Flipper)')}</div>
                        <div>• {txt('考慮近用加入度數 (ADD) 減輕調節負擔', '考虑近用加入度数 (ADD) 减轻调节负担')}</div>
                        <div>• {txt('Hart Chart 遠近交替訓練', 'Hart Chart 远近交替训练')}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Tracking */}
                <div className="mt-3 pt-2 border-t border-rose-500/10">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{txt('預期進步幅度', '预期进步幅度')}</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {txt('約', '约')} {Math.min(improvement, 2)}-{Math.min(improvement, 4)} cm / {txt('週', '周')}
                    </span>
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1">
                    {txt('持續訓練 4-8 週通常可達到正常值（≤6cm）', '持续训练 4-8 周通常可达到正常值（≤6cm）')}
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[10px] text-muted-foreground text-center">
                * {txt('NPC 訓練需持之以恆，建議每日練習並記錄進度', 'NPC 训练需持之以恒，建议每日练习并记录进度')}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
