/**
 * 患者縱向追蹤分析工具
 * Longitudinal trend analysis utilities for patient tracking
 */

export interface HistoryRecord {
  date: string;
  healthScore: number | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  keyMetrics: {
    npc: number | null;
    ciss: number | null;
    boBreakNear: number | null;
    biBreakNear: number | null;
    distPhoria: number | null;
    nearPhoria: number | null;
  };
}

export interface ImprovementResult {
  absoluteChange: number;
  percentChange: number;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface TrainingEffectiveness {
  overallEffectiveness: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
  improvementSummary: {
    npc: ImprovementResult | null;
    ciss: ImprovementResult | null;
    healthScore: ImprovementResult | null;
    boBreakNear: ImprovementResult | null;
  };
}

/**
 * 計算改善率
 * Calculate improvement for a given metric
 */
export function calculateImprovement(
  initial: number,
  current: number,
  metricType: 'npc' | 'ciss' | 'healthScore' | 'boBreakNear' | 'biBreakNear'
): ImprovementResult {
  // For NPC and CISS, lower is better
  // For healthScore and vergence reserves, higher is better
  const lowerIsBetter = metricType === 'npc' || metricType === 'ciss';
  
  const change = lowerIsBetter
    ? initial - current  // 越小越好，所以 initial - current > 0 表示改善
    : current - initial; // 越大越好，所以 current - initial > 0 表示改善
    
  const percentChange = initial !== 0 
    ? (Math.abs(change) / initial) * 100 * Math.sign(change)
    : 0;
  
  // 判斷趨勢：改善需要 > 10%，穩定在 ±10% 之間
  const threshold = 10;
  const trend: 'improving' | 'stable' | 'worsening' = 
    percentChange > threshold ? 'improving' :
    percentChange < -threshold ? 'worsening' :
    'stable';
    
  return {
    absoluteChange: change,
    percentChange,
    trend
  };
}

/**
 * 預測達標時間（線性回歸）
 * Predict when target will be reached using linear regression
 */
export function predictTargetDate(
  historyData: HistoryRecord[],
  currentValue: number,
  targetValue: number,
  metric: 'npc' | 'ciss' | 'healthScore'
): Date | null {
  if (historyData.length < 2) return null;
  
  // 取得該指標的歷史數據
  const dataPoints: { date: Date; value: number }[] = [];
  
  for (const record of historyData) {
    let value: number | null = null;
    if (metric === 'npc') value = record.keyMetrics.npc;
    else if (metric === 'ciss') value = record.keyMetrics.ciss;
    else if (metric === 'healthScore') value = record.healthScore;
    
    if (value !== null) {
      dataPoints.push({ date: new Date(record.date), value });
    }
  }
  
  if (dataPoints.length < 2) return null;
  
  // 排序（從舊到新）
  dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // 線性回歸計算斜率
  const n = dataPoints.length;
  const x = dataPoints.map(d => d.date.getTime());
  const y = dataPoints.map(d => d.value);
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumXX = x.reduce((total, xi) => total + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  if (slope === 0) return null;
  
  // 計算達標時間
  const targetTime = (targetValue - intercept) / slope;
  const targetDate = new Date(targetTime);
  
  // 如果預測日期在過去或太遠（超過2年），返回 null
  const now = new Date();
  const twoYearsLater = new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);
  
  if (targetDate < now || targetDate > twoYearsLater) {
    return null;
  }
  
  return targetDate;
}

/**
 * 訓練效果評估
 * Evaluate overall training effectiveness
 */
export function evaluateTrainingEffect(
  historyData: HistoryRecord[]
): TrainingEffectiveness {
  const recommendations: string[] = [];
  
  if (historyData.length < 2) {
    return {
      overallEffectiveness: 'fair',
      recommendations: ['需要更多歷史數據來評估療效'],
      improvementSummary: {
        npc: null,
        ciss: null,
        healthScore: null,
        boBreakNear: null
      }
    };
  }
  
  // 排序（從舊到新）
  const sorted = [...historyData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const initial = sorted[0];
  const current = sorted[sorted.length - 1];
  
  // 計算各指標改善情況
  const improvements = {
    npc: initial.keyMetrics.npc !== null && current.keyMetrics.npc !== null
      ? calculateImprovement(initial.keyMetrics.npc, current.keyMetrics.npc, 'npc')
      : null,
    ciss: initial.keyMetrics.ciss !== null && current.keyMetrics.ciss !== null
      ? calculateImprovement(initial.keyMetrics.ciss, current.keyMetrics.ciss, 'ciss')
      : null,
    healthScore: initial.healthScore !== null && current.healthScore !== null
      ? calculateImprovement(initial.healthScore, current.healthScore, 'healthScore')
      : null,
    boBreakNear: initial.keyMetrics.boBreakNear !== null && current.keyMetrics.boBreakNear !== null
      ? calculateImprovement(initial.keyMetrics.boBreakNear, current.keyMetrics.boBreakNear, 'boBreakNear')
      : null
  };
  
  // 計算整體效果分數
  let improvingCount = 0;
  let worseningCount = 0;
  let totalMetrics = 0;
  
  Object.values(improvements).forEach(imp => {
    if (imp) {
      totalMetrics++;
      if (imp.trend === 'improving') improvingCount++;
      if (imp.trend === 'worsening') worseningCount++;
    }
  });
  
  // 評估整體效果
  let overallEffectiveness: 'excellent' | 'good' | 'fair' | 'poor';
  
  if (totalMetrics === 0) {
    overallEffectiveness = 'fair';
    recommendations.push('無法評估：缺少可比較的指標數據');
  } else {
    const improvementRatio = improvingCount / totalMetrics;
    
    if (improvementRatio >= 0.75 && worseningCount === 0) {
      overallEffectiveness = 'excellent';
      recommendations.push('療效優異，建議繼續維持當前訓練計畫');
    } else if (improvementRatio >= 0.5) {
      overallEffectiveness = 'good';
      recommendations.push('療效良好，可考慮強化弱項訓練');
    } else if (worseningCount > improvingCount) {
      overallEffectiveness = 'poor';
      recommendations.push('部分指標惡化，建議重新評估訓練計畫');
      recommendations.push('考慮調整訓練強度或方式');
    } else {
      overallEffectiveness = 'fair';
      recommendations.push('療效一般，建議增加訓練頻率或調整方法');
    }
  }
  
  // 針對具體指標給建議
  if (improvements.npc?.trend === 'worsening') {
    recommendations.push('NPC 退步：建議加強 push-up 訓練');
  }
  if (improvements.ciss?.trend === 'worsening') {
    recommendations.push('CISS 症狀加重：需關注個案配合度與症狀原因');
  }
  if (improvements.boBreakNear?.trend === 'improving') {
    recommendations.push('融像儲備改善：訓練有效，可逐步增加難度');
  }
  
  return {
    overallEffectiveness,
    recommendations,
    improvementSummary: improvements
  };
}

/**
 * 計算建議回診日期
 * Calculate recommended follow-up date based on treatment scenario
 */
export function calculateFollowUpDate(
  treatmentPlan: string | null,
  examDate: string
): Date {
  const baseDate = new Date(examDate);
  
  // 根據處置方案決定回診間隔
  let daysToAdd = 90; // 預設 3 個月
  
  if (treatmentPlan) {
    if (treatmentPlan.includes('A') || treatmentPlan.toLowerCase().includes('training')) {
      daysToAdd = 30; // 情境 A（積極訓練）：1 個月
    } else if (treatmentPlan.includes('B') || treatmentPlan.toLowerCase().includes('prism')) {
      daysToAdd = 60; // 情境 B（稜鏡）：2 個月
    } else if (treatmentPlan.includes('C') || treatmentPlan.toLowerCase().includes('observation')) {
      daysToAdd = 90; // 情境 C（觀察）：3 個月
    }
  }
  
  return new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
}

/**
 * 格式化趨勢顯示
 * Format trend for display with arrow and color class
 */
export function formatTrendDisplay(
  trend: 'improving' | 'stable' | 'worsening',
  percentChange: number
): { arrow: string; colorClass: string; text: string } {
  switch (trend) {
    case 'improving':
      return {
        arrow: '↑',
        colorClass: 'text-green-600',
        text: `+${Math.abs(percentChange).toFixed(0)}%`
      };
    case 'worsening':
      return {
        arrow: '↓',
        colorClass: 'text-red-600',
        text: `-${Math.abs(percentChange).toFixed(0)}%`
      };
    case 'stable':
    default:
      return {
        arrow: '→',
        colorClass: 'text-yellow-600',
        text: '穩定'
      };
  }
}

/**
 * 從 ExamRecord 轉換為 HistoryRecord
 * Convert exam records to history records for trend analysis
 */
export function convertToHistoryRecords(
  examRecords: Array<{
    exam_date: string;
    health_score: number | null;
    diagnostic_classification: string | null;
    treatment_plan?: string | null;
    exam_data: Record<string, any>;
  }>
): HistoryRecord[] {
  return examRecords.map(record => ({
    date: record.exam_date,
    healthScore: record.health_score,
    diagnosis: record.diagnostic_classification,
    treatmentPlan: record.treatment_plan || null,
    keyMetrics: {
      npc: record.exam_data?.npc ?? null,
      ciss: record.exam_data?.cissScore ?? null,
      boBreakNear: record.exam_data?.boBreakNear ?? record.exam_data?.boBreak ?? null,
      biBreakNear: record.exam_data?.biBreakNear ?? record.exam_data?.biBreak ?? null,
      distPhoria: record.exam_data?.distPhoria ?? null,
      nearPhoria: record.exam_data?.nearPhoria ?? null
    }
  }));
}
