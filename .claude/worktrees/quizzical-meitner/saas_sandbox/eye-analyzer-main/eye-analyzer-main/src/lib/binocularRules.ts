/**
 * 雙眼視覺分析規則檔
 * 定義各項指標的正常範圍與臨界值，用於計算健康分數與診斷分類
 */

import { 
  getNormsForAge, 
  evaluateNpcByAge, 
  evaluateAccommodationByAge,
  evaluateBoReserveByAge,
  evaluateBiReserveByAge,
  evaluateFlipperByAge,
  getAgeGroup,
  type NormEvaluationResult 
} from './clinicalNorms/ageNorms';

// ============= 指標閾值定義 =============
export interface ThresholdRange {
  normal: { max: number };
  yellow: { min: number; max: number };
  red: { min: number };
}

export interface BinocularRules {
  npc: ThresholdRange;
  ciss: ThresholdRange;
  cissChild: ThresholdRange; // 18歲以下
  stereo: ThresholdRange;
  vergenceFacility: ThresholdRange;
  flipper: ThresholdRange;
  bcc: { normalMin: number; normalMax: number; yellowMax: number };
  nearPhoriaExo: ThresholdRange; // 外斜
  nearPhoriaEso: ThresholdRange; // 內斜
  distPhoriaExo: ThresholdRange;
  distPhoriaEso: ThresholdRange;
  biBreak: { normal: number; low: number };
  boBreak: { normal: number; low: number };
  accommodationAmplitude: { 
    formula: (age: number) => number; // Hofstetter minimum
    yellowRatio: number; // 低於預期值的比例
    redRatio: number;
  };
}

export const BINOCULAR_RULES: BinocularRules = {
  // NPC: 近點集合 (cm)
  npc: {
    normal: { max: 6 },
    yellow: { min: 7, max: 8 },
    red: { min: 9 },
  },
  
  // CISS: 症狀問卷 (成人 ≥18歲)
  ciss: {
    normal: { max: 20 },
    yellow: { min: 21, max: 28 },
    red: { min: 29 },
  },
  
  // CISS: 症狀問卷 (兒童 <18歲)
  cissChild: {
    normal: { max: 15 },
    yellow: { min: 16, max: 20 },
    red: { min: 21 },
  },
  
  // 立體視 (秒弧)
  stereo: {
    normal: { max: 40 },
    yellow: { min: 50, max: 100 },
    red: { min: 200 },
  },
  
  // 聚散靈敏度 (cpm)
  vergenceFacility: {
    normal: { max: Infinity }, // 12+ 正常
    yellow: { min: 8, max: 11 },
    red: { min: 0 }, // <8 異常
  },
  
  // 調節靈敏度 (cpm)
  flipper: {
    normal: { max: Infinity }, // 10+ 正常
    yellow: { min: 6, max: 9 },
    red: { min: 0 }, // <6 異常
  },
  
  // BCC 雙眼交叉柱鏡（取代 MEM）
  bcc: {
    normalMin: 0.25,
    normalMax: 0.75,
    yellowMax: 1.00,
  },
  
  // 近距眼位 - 外斜 (負值)
  nearPhoriaExo: {
    normal: { max: -3 }, // 0 ~ -3 正常
    yellow: { min: -4, max: -6 },
    red: { min: -7 }, // ≤-7 紅燈
  },
  
  // 近距眼位 - 內斜 (正值)
  nearPhoriaEso: {
    normal: { max: 3 }, // 0 ~ 3 正常
    yellow: { min: 4, max: 6 },
    red: { min: 7 },
  },
  
  // 遠距眼位 - 外斜
  distPhoriaExo: {
    normal: { max: -1 }, // 0 ~ -1 正常
    yellow: { min: -2, max: -4 },
    red: { min: -5 },
  },
  
  // 遠距眼位 - 內斜
  distPhoriaEso: {
    normal: { max: 2 },
    yellow: { min: 3, max: 5 },
    red: { min: 6 },
  },
  
  // BI 開散力破裂點
  biBreak: {
    normal: 12,
    low: 8,
  },
  
  // BO 集合力破裂點
  boBreak: {
    normal: 18,
    low: 12,
  },
  
  // 調節幅度 - Hofstetter 公式
  accommodationAmplitude: {
    formula: (age: number) => Math.max(0, 15 - 0.25 * age),
    yellowRatio: 0.8, // 低於預期80%為黃燈
    redRatio: 0.6, // 低於預期60%為紅燈
  },
};

// ============= 評級函式 =============
export type RiskLevel = 'normal' | 'yellow' | 'red';

export const evaluateNpc = (npc: number, age?: number): RiskLevel => {
  // 如果提供年齡，使用年齡調整的常模
  if (age !== undefined) {
    const result = evaluateNpcByAge(npc, age);
    if (result.status === 'normal') return 'normal';
    if (result.status === 'borderline') return 'yellow';
    return 'red';
  }
  // 否則使用傳統閾值
  if (npc <= BINOCULAR_RULES.npc.normal.max) return 'normal';
  if (npc <= BINOCULAR_RULES.npc.yellow.max) return 'yellow';
  return 'red';
};

/**
 * 使用年齡常模評估 NPC（進階版）
 */
export const evaluateNpcWithAgeNorm = (npc: number, age: number): { 
  riskLevel: RiskLevel; 
  normResult: NormEvaluationResult;
  ageGroup: string;
} => {
  const normResult = evaluateNpcByAge(npc, age);
  const ageGroup = getAgeGroup(age);
  let riskLevel: RiskLevel = 'normal';
  
  if (normResult.status === 'abnormal') riskLevel = 'red';
  else if (normResult.status === 'borderline') riskLevel = 'yellow';
  
  return { riskLevel, normResult, ageGroup };
};

export const evaluateCiss = (score: number, age: number): RiskLevel => {
  const rules = age < 18 ? BINOCULAR_RULES.cissChild : BINOCULAR_RULES.ciss;
  if (score <= rules.normal.max) return 'normal';
  if (score <= rules.yellow.max) return 'yellow';
  return 'red';
};

export const evaluateStereo = (stereo: number): RiskLevel => {
  if (stereo <= BINOCULAR_RULES.stereo.normal.max) return 'normal';
  if (stereo <= BINOCULAR_RULES.stereo.yellow.max) return 'yellow';
  return 'red';
};

export const evaluateVergenceFacility = (cpm: number): RiskLevel => {
  if (cpm >= 12) return 'normal';
  if (cpm >= 8) return 'yellow';
  return 'red';
};

export const evaluateFlipper = (cpm: number): RiskLevel => {
  if (cpm >= 10) return 'normal';
  if (cpm >= 6) return 'yellow';
  return 'red';
};

export const evaluateBcc = (bcc: number, age?: number): RiskLevel => {
  // 年齡 >= 40：放寬標準
  if (age !== undefined && age >= 40) {
    if (bcc > 1.5) return 'red';  // 明顯調節不足
    return 'normal';  // 參考值
  }
  // 標準判讀
  const { normalMin, normalMax, yellowMax } = BINOCULAR_RULES.bcc;
  if (bcc >= normalMin && bcc <= normalMax) return 'normal';
  if (bcc < -0.25) return 'red';  // Lead
  if (bcc > 1.0) return 'red';    // High Lag
  if (bcc <= yellowMax && bcc >= 0) return 'yellow';
  return 'yellow';  // Borderline
};

export const evaluateNearPhoria = (phoria: number): RiskLevel => {
  if (phoria < 0) { // 外斜
    if (phoria >= -3) return 'normal';
    if (phoria >= -6) return 'yellow';
    return 'red';
  } else { // 內斜
    if (phoria <= 3) return 'normal';
    if (phoria <= 6) return 'yellow';
    return 'red';
  }
};

export const evaluateDistPhoria = (phoria: number): RiskLevel => {
  if (phoria < 0) { // 外斜
    if (phoria >= -1) return 'normal';
    if (phoria >= -4) return 'yellow';
    return 'red';
  } else { // 內斜
    if (phoria <= 2) return 'normal';
    if (phoria <= 5) return 'yellow';
    return 'red';
  }
};

export const evaluateAccommodationAmplitude = (aa: number, age: number): RiskLevel => {
  const expected = BINOCULAR_RULES.accommodationAmplitude.formula(age);
  if (expected <= 0) return 'normal'; // 老花年齡
  const ratio = aa / expected;
  if (ratio >= BINOCULAR_RULES.accommodationAmplitude.yellowRatio) return 'normal';
  if (ratio >= BINOCULAR_RULES.accommodationAmplitude.redRatio) return 'yellow';
  return 'red';
};

/**
 * 使用年齡常模評估調節幅度（進階版）
 */
export const evaluateAccommodationWithAgeNorm = (aa: number, age: number): { 
  riskLevel: RiskLevel; 
  normResult: NormEvaluationResult;
  expected: { min: number; avg: number; max: number };
} => {
  const normResult = evaluateAccommodationByAge(aa, age);
  const norms = getNormsForAge(age);
  
  let riskLevel: RiskLevel = 'normal';
  if (normResult.status === 'abnormal') riskLevel = 'red';
  else if (normResult.status === 'borderline') riskLevel = 'yellow';
  
  return { 
    riskLevel, 
    normResult,
    expected: {
      min: norms.accommodationAmplitude.lowerLimit || 0,
      avg: norms.accommodationAmplitude.mean,
      max: norms.accommodationAmplitude.upperLimit,
    }
  };
};

/**
 * 使用年齡常模評估融像儲備
 */
export const evaluateFusionalReservesWithAgeNorm = (
  biBreak: number, 
  boBreak: number, 
  age: number
): { 
  bi: { riskLevel: RiskLevel; normResult: NormEvaluationResult };
  bo: { riskLevel: RiskLevel; normResult: NormEvaluationResult };
} => {
  const biResult = evaluateBiReserveByAge(biBreak, age);
  const boResult = evaluateBoReserveByAge(boBreak, age);
  
  const toRiskLevel = (status: NormEvaluationResult['status']): RiskLevel => {
    if (status === 'abnormal') return 'red';
    if (status === 'borderline') return 'yellow';
    return 'normal';
  };
  
  return {
    bi: { riskLevel: toRiskLevel(biResult.status), normResult: biResult },
    bo: { riskLevel: toRiskLevel(boResult.status), normResult: boResult },
  };
};

/**
 * 使用年齡常模評估翻轉鏡
 */
export const evaluateFlipperWithAgeNorm = (flipper: number, age: number): { 
  riskLevel: RiskLevel; 
  normResult: NormEvaluationResult;
} => {
  const normResult = evaluateFlipperByAge(flipper, age);
  let riskLevel: RiskLevel = 'normal';
  
  if (normResult.status === 'abnormal') riskLevel = 'red';
  else if (normResult.status === 'borderline') riskLevel = 'yellow';
  
  return { riskLevel, normResult };
};

// ============= 健康分數計算 =============
export interface ExamDataForScore {
  npc?: number;
  cissScore?: number;
  distPhoria?: number;
  nearPhoria?: number;
  biBreak?: number;
  boBreak?: number;
  aaOD?: number;
  aaOS?: number;
  flipper?: number;
  mem?: number;
  stereo?: number;
  vergenceFacilityCpm?: number;
  vergenceFacilityAborted?: boolean;
}

const SCORE_WEIGHTS = {
  npc: { yellow: 8, red: 15 },
  ciss: { yellow: 8, red: 15 },
  nearPhoria: { yellow: 8, red: 15 },
  distPhoria: { yellow: 5, red: 10 },
  biBreak: { yellow: 5, red: 10 },
  boBreak: { yellow: 5, red: 10 },
  accommodation: { yellow: 8, red: 15 },
  flipper: { yellow: 5, red: 10 },
  mem: { yellow: 5, red: 10 },
  stereo: { yellow: 5, red: 10 },
  vergenceFacility: { yellow: 5, red: 10 },
};

export const calculateHealthScore = (examData: ExamDataForScore, age: number): number => {
  let score = 100;
  
  // NPC
  if (examData.npc !== undefined) {
    const level = evaluateNpc(examData.npc);
    if (level === 'yellow') score -= SCORE_WEIGHTS.npc.yellow;
    else if (level === 'red') score -= SCORE_WEIGHTS.npc.red;
  }
  
  // CISS
  if (examData.cissScore !== undefined) {
    const level = evaluateCiss(examData.cissScore, age);
    if (level === 'yellow') score -= SCORE_WEIGHTS.ciss.yellow;
    else if (level === 'red') score -= SCORE_WEIGHTS.ciss.red;
  }
  
  // Near Phoria
  if (examData.nearPhoria !== undefined) {
    const level = evaluateNearPhoria(examData.nearPhoria);
    if (level === 'yellow') score -= SCORE_WEIGHTS.nearPhoria.yellow;
    else if (level === 'red') score -= SCORE_WEIGHTS.nearPhoria.red;
  }
  
  // Distance Phoria
  if (examData.distPhoria !== undefined) {
    const level = evaluateDistPhoria(examData.distPhoria);
    if (level === 'yellow') score -= SCORE_WEIGHTS.distPhoria.yellow;
    else if (level === 'red') score -= SCORE_WEIGHTS.distPhoria.red;
  }
  
  // BI Break
  if (examData.biBreak !== undefined) {
    if (examData.biBreak < BINOCULAR_RULES.biBreak.low) score -= SCORE_WEIGHTS.biBreak.red;
    else if (examData.biBreak < BINOCULAR_RULES.biBreak.normal) score -= SCORE_WEIGHTS.biBreak.yellow;
  }
  
  // BO Break
  if (examData.boBreak !== undefined) {
    if (examData.boBreak < BINOCULAR_RULES.boBreak.low) score -= SCORE_WEIGHTS.boBreak.red;
    else if (examData.boBreak < BINOCULAR_RULES.boBreak.normal) score -= SCORE_WEIGHTS.boBreak.yellow;
  }
  
  // Accommodation Amplitude (average of OD & OS)
  if (examData.aaOD !== undefined && examData.aaOS !== undefined) {
    const avgAA = (examData.aaOD + examData.aaOS) / 2;
    const level = evaluateAccommodationAmplitude(avgAA, age);
    if (level === 'yellow') score -= SCORE_WEIGHTS.accommodation.yellow;
    else if (level === 'red') score -= SCORE_WEIGHTS.accommodation.red;
  }
  
  // Flipper (調節靈敏度)
  if (examData.flipper !== undefined) {
    const level = evaluateFlipper(examData.flipper);
    if (level === 'yellow') score -= SCORE_WEIGHTS.flipper.yellow;
    else if (level === 'red') score -= SCORE_WEIGHTS.flipper.red;
  }
  
  // BCC (formerly MEM)
  if (examData.mem !== undefined) {
    const level = evaluateBcc(examData.mem, age);
    if (level === 'yellow') score -= SCORE_WEIGHTS.mem.yellow;
    else if (level === 'red') score -= SCORE_WEIGHTS.mem.red;
  }
  
  // Stereo
  if (examData.stereo !== undefined) {
    const level = evaluateStereo(examData.stereo);
    if (level === 'yellow') score -= SCORE_WEIGHTS.stereo.yellow;
    else if (level === 'red') score -= SCORE_WEIGHTS.stereo.red;
  }
  
  // Vergence Facility
  if (examData.vergenceFacilityCpm !== undefined) {
    if (examData.vergenceFacilityAborted) {
      score -= SCORE_WEIGHTS.vergenceFacility.red;
    } else {
      const level = evaluateVergenceFacility(examData.vergenceFacilityCpm);
      if (level === 'yellow') score -= SCORE_WEIGHTS.vergenceFacility.yellow;
      else if (level === 'red') score -= SCORE_WEIGHTS.vergenceFacility.red;
    }
  }
  
  return Math.max(0, Math.min(100, score));
};

// ============= 診斷分類 =============
export type BinocularDiagnosis = 
  | 'NORMAL'
  | 'CI' // Convergence Insufficiency 集合不足
  | 'CE' // Convergence Excess 集合過度
  | 'AI' // Accommodative Insufficiency 調節不足
  | 'AE' // Accommodative Excess 調節過度
  | 'AIFI' // Accommodative Infacility 調節靈敏度不足
  | 'BX' // Basic Exophoria 基本型外斜
  | 'BE' // Basic Esophoria 基本型內斜
  | 'DE' // Divergence Excess 開散過度
  | 'DI' // Divergence Insufficiency 開散不足
  | 'MIXED' // 混合型
  | 'OTHER';

export interface ClassificationResult {
  primary: BinocularDiagnosis;
  secondary: BinocularDiagnosis | null;
  description: string;
  descriptionCN: string;
}

export const classifyBinocularStatus = (
  examData: ExamDataForScore,
  age: number
): ClassificationResult => {
  const {
    npc = 6,
    nearPhoria = 0,
    distPhoria = 0,
    aaOD = 10,
    aaOS = 10,
    flipper = 10,
    mem = 0.5,
    boBreak = 18,
    biBreak = 12,
  } = examData;
  
  const avgAA = (aaOD + aaOS) / 2;
  const expectedAA = BINOCULAR_RULES.accommodationAmplitude.formula(age);
  const hasExoNear = nearPhoria <= -4;
  const hasEsoNear = nearPhoria >= 4;
  const hasExoDist = distPhoria <= -2;
  const hasEsoDist = distPhoria >= 3;
  const phoriaDiff = Math.abs(nearPhoria - distPhoria);
  
  // 計算 AC/A (簡化版)
  const effectiveDemand = 100 / 40; // 假設 40cm 工作距離
  const pd = 6.4; // 假設 64mm PD
  const acaCalc = pd + (nearPhoria - distPhoria) / effectiveDemand;
  const isHighAcA = acaCalc > 6;
  const isLowAcA = acaCalc < 3;
  
  let primary: BinocularDiagnosis = 'NORMAL';
  let secondary: BinocularDiagnosis | null = null;
  
  // === 集合問題診斷 ===
  
  // CI: 近距外斜 + NPC 退縮 + BO 不足
  if (hasExoNear && (npc > 6 || boBreak < 15)) {
    primary = 'CI';
  }
  // CE: 近距內斜 + 高 AC/A
  else if (hasEsoNear && isHighAcA) {
    primary = 'CE';
  }
  // DE: 遠距外斜明顯 > 近距
  else if (hasExoDist && phoriaDiff >= 5 && isHighAcA) {
    primary = 'DE';
  }
  // DI: 遠距內斜 + 低 AC/A
  else if (hasEsoDist && isLowAcA) {
    primary = 'DI';
  }
  // BX: 遠近皆外斜，差異不大
  else if (hasExoNear && hasExoDist && phoriaDiff < 5) {
    primary = 'BX';
  }
  // BE: 遠近皆內斜，差異不大
  else if (hasEsoNear && hasEsoDist && phoriaDiff < 5) {
    primary = 'BE';
  }
  
  // === 調節問題診斷（次要）===
  if (age < 45 && avgAA < expectedAA * 0.7) {
    secondary = secondary || 'AI';
    if (primary === 'NORMAL') primary = 'AI';
  } else if (flipper < 6) {
    secondary = secondary || 'AIFI';
    if (primary === 'NORMAL') primary = 'AIFI';
  } else if (mem > 0.75 && age < 40) {
    // MEM 滯後高，暗示調節不足
    if (secondary === null) secondary = 'AI';
  } else if (mem < 0) {
    // MEM 超前，暗示調節過度
    if (secondary === null) secondary = 'AE';
  }
  
  // 描述生成
  const descMap: Record<BinocularDiagnosis, { tw: string; cn: string }> = {
    NORMAL: { tw: '雙眼視覺功能正常', cn: '双眼视觉功能正常' },
    CI: { tw: '疑似集合不足', cn: '疑似集合不足' },
    CE: { tw: '疑似集合過度', cn: '疑似集合过度' },
    AI: { tw: '疑似調節不足', cn: '疑似调节不足' },
    AE: { tw: '疑似調節過度', cn: '疑似调节过度' },
    AIFI: { tw: '疑似調節靈敏度不足', cn: '疑似调节灵敏度不足' },
    BX: { tw: '疑似基本型外斜', cn: '疑似基本型外斜' },
    BE: { tw: '疑似基本型內斜', cn: '疑似基本型内斜' },
    DE: { tw: '疑似開散過度', cn: '疑似散开过度' },
    DI: { tw: '疑似開散不足', cn: '疑似散开不足' },
    MIXED: { tw: '混合型雙眼視覺異常', cn: '混合型双眼视觉异常' },
    OTHER: { tw: '其他雙眼視覺問題', cn: '其他双眼视觉问题' },
  };
  
  let description = descMap[primary].tw;
  let descriptionCN = descMap[primary].cn;
  
  if (secondary && secondary !== primary) {
    description += ` / ${descMap[secondary].tw}`;
    descriptionCN += ` / ${descMap[secondary].cn}`;
  }
  
  return {
    primary,
    secondary,
    description,
    descriptionCN,
  };
};

// ============= 完整評估函式 =============
export interface BinocularEvaluation {
  healthScore: number;
  classification: ClassificationResult;
  diagnosticCode: string;
}

export const evaluateBinocularVision = (
  examData: ExamDataForScore,
  age: number
): BinocularEvaluation => {
  const healthScore = calculateHealthScore(examData, age);
  const classification = classifyBinocularStatus(examData, age);
  
  // 生成診斷代碼 (用於資料庫儲存)
  let diagnosticCode = classification.primary;
  if (classification.secondary) {
    diagnosticCode += `+${classification.secondary}`;
  }
  
  return {
    healthScore,
    classification,
    diagnosticCode,
  };
};

// ============= 匯出新的分析函式 =============
export { 
  analyzePrimaryDistance, 
  generatePrismRecommendation,
  calculateSheardPrism,
  calculatePercivalPrism,
  type PrimaryDistanceAnalysis,
  type PrismRecommendation,
  type PrimaryDistancePattern,
} from './binocularAnalysis';
