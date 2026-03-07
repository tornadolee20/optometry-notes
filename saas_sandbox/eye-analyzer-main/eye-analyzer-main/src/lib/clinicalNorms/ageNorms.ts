/**
 * 年齡分層臨床常模資料庫
 * Age-Based Clinical Norms Database
 * 基於文獻數據，提供年齡分層的正常值參考
 */

// ============= 年齡分層定義 =============
export type AgeGroup = '6-10' | '11-17' | '18-30' | '31-40' | '41-50' | '50+';

export interface AgeNormValue {
  mean: number;
  sd: number;      // Standard Deviation
  lowerLimit?: number;
  upperLimit: number;
  source?: string;
}

export interface AgeGroupNorms {
  npc: AgeNormValue;              // Near Point of Convergence (cm)
  accommodationAmplitude: AgeNormValue;  // 調節幅度 (D)
  positiveRelativeAccommodation: AgeNormValue;  // PRA (D)
  negativeRelativeAccommodation: AgeNormValue;  // NRA (D)
  boBreak: AgeNormValue;          // BO Break (Δ)
  boRecovery: AgeNormValue;       // BO Recovery (Δ)
  biBreak: AgeNormValue;          // BI Break (Δ)
  biRecovery: AgeNormValue;       // BI Recovery (Δ)
  nearPhoria: AgeNormValue;       // Near Phoria (Δ)
  distPhoria: AgeNormValue;       // Distance Phoria (Δ)
  flipper: AgeNormValue;          // Accommodation Facility (cpm)
  vergenceFacility: AgeNormValue; // Vergence Facility (cpm)
}

// ============= 年齡常模資料 =============
export const AGE_BASED_NORMS: Record<AgeGroup, AgeGroupNorms> = {
  '6-10': {
    npc: { mean: 5, sd: 2, upperLimit: 9, source: 'Scheiman 2008' },
    accommodationAmplitude: { mean: 16, sd: 2, lowerLimit: 12, upperLimit: 20, source: 'Hofstetter' },
    positiveRelativeAccommodation: { mean: -3.5, sd: 1.0, lowerLimit: -5.0, upperLimit: -2.0 },
    negativeRelativeAccommodation: { mean: 2.25, sd: 0.5, lowerLimit: 1.75, upperLimit: 2.75 },
    boBreak: { mean: 20, sd: 5, lowerLimit: 12, upperLimit: 28 },
    boRecovery: { mean: 14, sd: 4, lowerLimit: 8, upperLimit: 20 },
    biBreak: { mean: 14, sd: 4, lowerLimit: 8, upperLimit: 20 },
    biRecovery: { mean: 8, sd: 3, lowerLimit: 4, upperLimit: 14 },
    nearPhoria: { mean: -2, sd: 3, lowerLimit: -5, upperLimit: 3 },
    distPhoria: { mean: 0, sd: 2, lowerLimit: -2, upperLimit: 2 },
    flipper: { mean: 7, sd: 2.5, lowerLimit: 4, upperLimit: 12, source: 'Hennessey 1984' },
    vergenceFacility: { mean: 10, sd: 3, lowerLimit: 5, upperLimit: 15 },
  },
  '11-17': {
    npc: { mean: 4, sd: 2, upperLimit: 8, source: 'Scheiman 2008' },
    accommodationAmplitude: { mean: 13, sd: 2, lowerLimit: 10, upperLimit: 16, source: 'Hofstetter' },
    positiveRelativeAccommodation: { mean: -4.0, sd: 1.0, lowerLimit: -5.5, upperLimit: -2.5 },
    negativeRelativeAccommodation: { mean: 2.25, sd: 0.5, lowerLimit: 1.75, upperLimit: 2.75 },
    boBreak: { mean: 22, sd: 5, lowerLimit: 14, upperLimit: 30 },
    boRecovery: { mean: 16, sd: 4, lowerLimit: 10, upperLimit: 22 },
    biBreak: { mean: 15, sd: 4, lowerLimit: 9, upperLimit: 21 },
    biRecovery: { mean: 9, sd: 3, lowerLimit: 5, upperLimit: 15 },
    nearPhoria: { mean: -3, sd: 3, lowerLimit: -6, upperLimit: 3 },
    distPhoria: { mean: -0.5, sd: 1.5, lowerLimit: -3, upperLimit: 2 },
    flipper: { mean: 10, sd: 3, lowerLimit: 6, upperLimit: 15, source: 'Scheiman & Wick' },
    vergenceFacility: { mean: 12, sd: 3, lowerLimit: 6, upperLimit: 18 },
  },
  '18-30': {
    npc: { mean: 5, sd: 2, upperLimit: 9, source: 'Morgan 1944' },
    accommodationAmplitude: { mean: 10, sd: 2, lowerLimit: 7, upperLimit: 13, source: 'Hofstetter' },
    positiveRelativeAccommodation: { mean: -3.25, sd: 1.0, lowerLimit: -4.5, upperLimit: -2.0 },
    negativeRelativeAccommodation: { mean: 2.0, sd: 0.5, lowerLimit: 1.5, upperLimit: 2.5 },
    boBreak: { mean: 21, sd: 6, lowerLimit: 12, upperLimit: 30, source: 'Morgan 1944' },
    boRecovery: { mean: 15, sd: 4, lowerLimit: 8, upperLimit: 22 },
    biBreak: { mean: 13, sd: 4, lowerLimit: 7, upperLimit: 19, source: 'Morgan 1944' },
    biRecovery: { mean: 9, sd: 3, lowerLimit: 4, upperLimit: 14 },
    nearPhoria: { mean: -3, sd: 3, lowerLimit: -6, upperLimit: 0, source: 'Morgan 1944' },
    distPhoria: { mean: -1, sd: 1.5, lowerLimit: -4, upperLimit: 2 },
    flipper: { mean: 12, sd: 3, lowerLimit: 8, upperLimit: 18, source: 'Scheiman & Wick' },
    vergenceFacility: { mean: 15, sd: 3, lowerLimit: 10, upperLimit: 20 },
  },
  '31-40': {
    npc: { mean: 6, sd: 2, upperLimit: 10, source: 'Clinical consensus' },
    accommodationAmplitude: { mean: 7, sd: 1.5, lowerLimit: 5, upperLimit: 9, source: 'Hofstetter' },
    positiveRelativeAccommodation: { mean: -2.75, sd: 1.0, lowerLimit: -4.0, upperLimit: -1.5 },
    negativeRelativeAccommodation: { mean: 2.0, sd: 0.5, lowerLimit: 1.5, upperLimit: 2.5 },
    boBreak: { mean: 19, sd: 5, lowerLimit: 10, upperLimit: 28 },
    boRecovery: { mean: 13, sd: 4, lowerLimit: 7, upperLimit: 20 },
    biBreak: { mean: 12, sd: 4, lowerLimit: 6, upperLimit: 18 },
    biRecovery: { mean: 8, sd: 3, lowerLimit: 3, upperLimit: 13 },
    nearPhoria: { mean: -2, sd: 3, lowerLimit: -5, upperLimit: 2 },
    distPhoria: { mean: -0.5, sd: 1.5, lowerLimit: -3, upperLimit: 2 },
    flipper: { mean: 10, sd: 3, lowerLimit: 6, upperLimit: 15 },
    vergenceFacility: { mean: 12, sd: 3, lowerLimit: 8, upperLimit: 18 },
  },
  '41-50': {
    npc: { mean: 8, sd: 3, upperLimit: 14, source: 'Pre-presbyopia norms' },
    accommodationAmplitude: { mean: 4.5, sd: 1.5, lowerLimit: 2, upperLimit: 7, source: 'Hofstetter' },
    positiveRelativeAccommodation: { mean: -2.0, sd: 0.75, lowerLimit: -3.0, upperLimit: -1.0 },
    negativeRelativeAccommodation: { mean: 1.75, sd: 0.5, lowerLimit: 1.25, upperLimit: 2.25 },
    boBreak: { mean: 17, sd: 5, lowerLimit: 9, upperLimit: 25 },
    boRecovery: { mean: 11, sd: 4, lowerLimit: 5, upperLimit: 17 },
    biBreak: { mean: 11, sd: 4, lowerLimit: 5, upperLimit: 17 },
    biRecovery: { mean: 7, sd: 3, lowerLimit: 2, upperLimit: 12 },
    nearPhoria: { mean: -1, sd: 3, lowerLimit: -4, upperLimit: 3 },
    distPhoria: { mean: 0, sd: 1.5, lowerLimit: -2, upperLimit: 2 },
    flipper: { mean: 8, sd: 3, lowerLimit: 4, upperLimit: 13 },
    vergenceFacility: { mean: 10, sd: 3, lowerLimit: 6, upperLimit: 15 },
  },
  '50+': {
    npc: { mean: 10, sd: 4, upperLimit: 18, source: 'Presbyopia norms' },
    accommodationAmplitude: { mean: 2, sd: 1, lowerLimit: 0.5, upperLimit: 4, source: 'Hofstetter' },
    positiveRelativeAccommodation: { mean: -1.25, sd: 0.5, lowerLimit: -2.0, upperLimit: -0.5 },
    negativeRelativeAccommodation: { mean: 1.5, sd: 0.5, lowerLimit: 1.0, upperLimit: 2.0 },
    boBreak: { mean: 15, sd: 5, lowerLimit: 7, upperLimit: 23 },
    boRecovery: { mean: 9, sd: 4, lowerLimit: 3, upperLimit: 15 },
    biBreak: { mean: 10, sd: 4, lowerLimit: 4, upperLimit: 16 },
    biRecovery: { mean: 6, sd: 3, lowerLimit: 1, upperLimit: 11 },
    nearPhoria: { mean: 0, sd: 3, lowerLimit: -3, upperLimit: 4 },
    distPhoria: { mean: 0.5, sd: 1.5, lowerLimit: -1, upperLimit: 3 },
    flipper: { mean: 6, sd: 3, lowerLimit: 2, upperLimit: 11 },
    vergenceFacility: { mean: 8, sd: 3, lowerLimit: 4, upperLimit: 13 },
  },
};

// ============= 工具函式 =============

/**
 * 根據年齡取得對應的年齡分層
 */
export function getAgeGroup(age: number): AgeGroup {
  if (age <= 10) return '6-10';
  if (age <= 17) return '11-17';
  if (age <= 30) return '18-30';
  if (age <= 40) return '31-40';
  if (age <= 50) return '41-50';
  return '50+';
}

/**
 * 取得特定年齡的常模數據
 */
export function getNormsForAge(age: number): AgeGroupNorms {
  const ageGroup = getAgeGroup(age);
  return AGE_BASED_NORMS[ageGroup];
}

/**
 * 評估指標值是否在正常範圍內
 */
export type NormEvaluation = 'normal' | 'borderline' | 'abnormal';

export interface NormEvaluationResult {
  status: NormEvaluation;
  deviation: number; // 偏離 SD 數
  percentile?: number;
  ageAdjusted: boolean;
}

export function evaluateAgainstNorm(
  value: number,
  norm: AgeNormValue,
  higherIsBetter: boolean = false
): NormEvaluationResult {
  const deviation = (value - norm.mean) / norm.sd;
  const absDeviation = Math.abs(deviation);
  
  // 計算百分位（假設正態分佈）
  const percentile = calculatePercentile(deviation);
  
  let status: NormEvaluation;
  if (absDeviation <= 1) {
    status = 'normal';
  } else if (absDeviation <= 2) {
    status = 'borderline';
  } else {
    status = 'abnormal';
  }
  
  // 如果有上下限，也要檢查
  if (norm.upperLimit !== undefined && value > norm.upperLimit) {
    status = higherIsBetter ? 'normal' : 'abnormal';
  }
  if (norm.lowerLimit !== undefined && value < norm.lowerLimit) {
    status = higherIsBetter ? 'abnormal' : (status === 'normal' ? 'borderline' : 'abnormal');
  }
  
  return {
    status,
    deviation,
    percentile,
    ageAdjusted: true,
  };
}

/**
 * 根據年齡評估 NPC
 */
export function evaluateNpcByAge(npc: number, age: number): NormEvaluationResult {
  const norms = getNormsForAge(age);
  return evaluateAgainstNorm(npc, norms.npc, false);
}

/**
 * 根據年齡評估調節幅度
 */
export function evaluateAccommodationByAge(aa: number, age: number): NormEvaluationResult {
  const norms = getNormsForAge(age);
  return evaluateAgainstNorm(aa, norms.accommodationAmplitude, true);
}

/**
 * 根據年齡評估 BO 融像儲備
 */
export function evaluateBoReserveByAge(boBreak: number, age: number): NormEvaluationResult {
  const norms = getNormsForAge(age);
  return evaluateAgainstNorm(boBreak, norms.boBreak, true);
}

/**
 * 根據年齡評估 BI 融像儲備
 */
export function evaluateBiReserveByAge(biBreak: number, age: number): NormEvaluationResult {
  const norms = getNormsForAge(age);
  return evaluateAgainstNorm(biBreak, norms.biBreak, true);
}

/**
 * 根據年齡評估翻轉鏡
 */
export function evaluateFlipperByAge(flipper: number, age: number): NormEvaluationResult {
  const norms = getNormsForAge(age);
  return evaluateAgainstNorm(flipper, norms.flipper, true);
}

/**
 * 計算百分位數（Z-score to percentile）
 */
function calculatePercentile(zScore: number): number {
  // 使用近似公式計算累積分佈函數
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = zScore < 0 ? -1 : 1;
  const x = Math.abs(zScore) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return Math.round(50 * (1.0 + sign * y));
}

/**
 * 取得年齡常模摘要文字
 */
export function getAgeNormSummary(age: number, language: 'zh-TW' | 'zh-CN' = 'zh-TW'): string {
  const ageGroup = getAgeGroup(age);
  const norms = AGE_BASED_NORMS[ageGroup];
  
  const labels = language === 'zh-CN' ? {
    ageGroup: '年龄组',
    npc: 'NPC',
    aa: '调节幅度',
    expected: '预期',
  } : {
    ageGroup: '年齡組',
    npc: 'NPC',
    aa: '調節幅度',
    expected: '預期',
  };
  
  return `${labels.ageGroup}: ${ageGroup}歲 | ${labels.npc} ${labels.expected}: ≤${norms.npc.upperLimit}cm | ${labels.aa} ${labels.expected}: ${norms.accommodationAmplitude.lowerLimit}-${norms.accommodationAmplitude.upperLimit}D`;
}

// ============= Hofstetter 調節幅度公式 =============
export const HOFSTETTER = {
  minimum: (age: number) => Math.max(0, 15 - 0.25 * age),
  average: (age: number) => Math.max(0, 18.5 - 0.30 * age),
  maximum: (age: number) => Math.max(0, 25 - 0.40 * age),
};

/**
 * 取得 Hofstetter 調節幅度預期值
 */
export function getHofstetterExpected(age: number): { min: number; avg: number; max: number } {
  return {
    min: HOFSTETTER.minimum(age),
    avg: HOFSTETTER.average(age),
    max: HOFSTETTER.maximum(age),
  };
}
