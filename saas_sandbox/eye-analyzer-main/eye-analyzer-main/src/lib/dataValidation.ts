/**
 * 資料品質控制系統
 * Data Quality Control System for Binocular Vision Analysis
 */

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationResult {
  isValid: boolean;
  severity?: ValidationSeverity;
  message?: string;
  field?: string;
}

export interface DataQualityScore {
  completeness: number;      // 完整度 0-100
  consistency: number;       // 一致性 0-100
  reliability: number;       // 信度 0-100
  overall: number;           // 總分 0-100
  details: {
    filledFields: number;
    totalFields: number;
    inconsistencies: string[];
    missingRecommended: string[];
  };
}

export interface NormativeData {
  mean: number;
  sd: number;
}

export interface NormativeDatabase {
  npc: NormativeData;
  ciss: NormativeData;
  boBreakNear: NormativeData;
  biBreakNear: NormativeData;
  distPhoria: NormativeData;
  nearPhoria: NormativeData;
  [key: string]: NormativeData;
}

// 標準常模資料（基於臨床研究）
export const NORMATIVE_DATABASE: NormativeDatabase = {
  npc: { mean: 5, sd: 2 },
  ciss: { mean: 15, sd: 8 },
  boBreakNear: { mean: 21, sd: 6 },
  biBreakNear: { mean: 12, sd: 4 },
  distPhoria: { mean: 0, sd: 1.5 },
  nearPhoria: { mean: -3, sd: 3 },
};

// ============================================
// 1. 生理合理性檢查規則
// ============================================

/**
 * AC/A Ratio 合理範圍檢查
 */
export function validateACARatio(acaRatio: number): ValidationResult {
  if (isNaN(acaRatio) || acaRatio === undefined) {
    return { isValid: true }; // 未填寫時不驗證
  }
  
  if (acaRatio < 2) {
    return {
      isValid: false,
      severity: 'warning',
      field: 'acaRatio',
      message: `AC/A ratio ${acaRatio}:1 過低（正常 2-10:1），建議確認測量方法`
    };
  }
  
  if (acaRatio > 10) {
    return {
      isValid: false,
      severity: 'warning',
      field: 'acaRatio',
      message: `AC/A ratio ${acaRatio}:1 過高（正常 2-10:1），請確認是否有潛伏性斜視`
    };
  }
  
  return { isValid: true };
}

/**
 * NPC 與年齡相關性檢查
 */
export function validateNPCByAge(npc: number, age: number): ValidationResult {
  if (isNaN(npc) || npc === undefined || isNaN(age) || age === undefined) {
    return { isValid: true };
  }
  
  // 依年齡計算預期 NPC 上限
  let expectedMaxNPC: number;
  if (age < 40) {
    expectedMaxNPC = 8;
  } else if (age < 50) {
    expectedMaxNPC = 10;
  } else if (age < 60) {
    expectedMaxNPC = 12;
  } else {
    expectedMaxNPC = 15;
  }
  
  if (npc > expectedMaxNPC + 5) {
    return {
      isValid: false,
      severity: 'error',
      field: 'npc',
      message: `NPC ${npc}cm 相對於 ${age} 歲明顯過大（預期 < ${expectedMaxNPC}cm），建議重新測量或排除其他因素`
    };
  }
  
  if (npc > expectedMaxNPC + 2) {
    return {
      isValid: false,
      severity: 'warning',
      field: 'npc',
      message: `NPC ${npc}cm 略高於年齡預期值，可能為 CI 早期徵兆`
    };
  }
  
  // NPC 過小也需注意
  if (npc < 2 && age > 10) {
    return {
      isValid: false,
      severity: 'info',
      field: 'npc',
      message: `NPC ${npc}cm 極佳，請確認測量方法正確（應使用真實調節目標）`
    };
  }
  
  return { isValid: true };
}

/**
 * Phoria 與 AC/A 一致性驗證
 */
export function validatePhoriaACAConsistency(
  distPhoria: number,
  nearPhoria: number,
  calculatedACA: number,
  gradientACA?: number,
  pd?: number,
  workDist?: number
): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (isNaN(distPhoria) || isNaN(nearPhoria) || isNaN(calculatedACA)) {
    return results;
  }
  
  // 計算預期的遠近眼位差異
  const effectiveWorkDist = workDist || 40; // 預設 40cm
  const adjustmentDiopters = 100 / effectiveWorkDist; // 例如 40cm = 2.5D
  const expectedPhoriaDiff = calculatedACA * adjustmentDiopters;
  const actualPhoriaDiff = Math.abs(nearPhoria - distPhoria);
  
  if (Math.abs(actualPhoriaDiff - expectedPhoriaDiff) > 8) {
    results.push({
      isValid: false,
      severity: 'warning',
      field: 'phoria_aca',
      message: `遠近眼位差 ${actualPhoriaDiff.toFixed(1)}Δ 與 AC/A 預期差 ${expectedPhoriaDiff.toFixed(1)}Δ 不符，建議確認測量`
    });
  }
  
  // 比較 Calculated AC/A 與 Gradient AC/A
  if (gradientACA !== undefined && !isNaN(gradientACA)) {
    const acaDiff = Math.abs(calculatedACA - gradientACA);
    if (acaDiff > 3) {
      results.push({
        isValid: false,
        severity: 'info',
        field: 'aca_methods',
        message: `Calculated AC/A (${calculatedACA.toFixed(1)}) 與 Gradient AC/A (${gradientACA.toFixed(1)}) 差異 ${acaDiff.toFixed(1)}，可能有近感知集合影響`
      });
    }
  }
  
  return results;
}

/**
 * CISS 分數驗證
 */
export function validateCISS(ciss: number, age: number): ValidationResult {
  if (isNaN(ciss) || ciss === undefined) {
    return { isValid: true };
  }
  
  // CISS 最高分為 60
  if (ciss > 60) {
    return {
      isValid: false,
      severity: 'error',
      field: 'ciss',
      message: `CISS 分數 ${ciss} 超過量表最高值 60，請確認輸入`
    };
  }
  
  if (ciss < 0) {
    return {
      isValid: false,
      severity: 'error',
      field: 'ciss',
      message: `CISS 分數不可為負數`
    };
  }
  
  // 極端高分提示
  if (ciss >= 40) {
    return {
      isValid: false,
      severity: 'warning',
      field: 'ciss',
      message: `CISS ${ciss} 分極高，建議排除其他眼疾或心理因素`
    };
  }
  
  return { isValid: true };
}

// ============================================
// 2. 測量邏輯性檢查
// ============================================

/**
 * 融像儲備邏輯檢查（單一距離）
 */
export function validateVergenceReserves(
  biBreak: number,
  biRecovery: number,
  boBreak: number,
  boRecovery: number,
  distance: 'dist' | 'near' = 'near'
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const distLabel = distance === 'dist' ? '遠距' : '近距';
  
  // BI 驗證
  if (!isNaN(biBreak) && !isNaN(biRecovery)) {
    if (biBreak < biRecovery) {
      results.push({
        isValid: false,
        severity: 'error',
        field: `${distance}BiReserves`,
        message: `${distLabel} BI Break (${biBreak}Δ) 應大於 Recovery (${biRecovery}Δ)，請確認輸入順序`
      });
    } else if (biBreak - biRecovery < 2 && biBreak > 0) {
      results.push({
        isValid: false,
        severity: 'warning',
        field: `${distance}BiReserves`,
        message: `${distLabel} BI Break 與 Recovery 差距僅 ${biBreak - biRecovery}Δ，建議重新測量確認`
      });
    }
  }
  
  // BO 驗證
  if (!isNaN(boBreak) && !isNaN(boRecovery)) {
    if (boBreak < boRecovery) {
      results.push({
        isValid: false,
        severity: 'error',
        field: `${distance}BoReserves`,
        message: `${distLabel} BO Break (${boBreak}Δ) 應大於 Recovery (${boRecovery}Δ)，請確認輸入順序`
      });
    } else if (boBreak - boRecovery < 2 && boBreak > 0) {
      results.push({
        isValid: false,
        severity: 'warning',
        field: `${distance}BoReserves`,
        message: `${distLabel} BO Break 與 Recovery 差距僅 ${boBreak - boRecovery}Δ，建議重新測量確認`
      });
    }
  }
  
  // 極端值檢查
  if (!isNaN(boBreak) && boBreak > 50) {
    results.push({
      isValid: false,
      severity: 'warning',
      field: `${distance}BoBreak`,
      message: `${distLabel} BO Break ${boBreak}Δ 超過常見範圍，請確認測量`
    });
  }
  
  if (!isNaN(biBreak) && biBreak > 30) {
    results.push({
      isValid: false,
      severity: 'warning',
      field: `${distance}BiBreak`,
      message: `${distLabel} BI Break ${biBreak}Δ 超過常見範圍，請確認測量`
    });
  }
  
  return results;
}

/**
 * 遠近距數據關聯性檢查
 */
export function validateDistanceNearRelationship(
  distBiBreak: number,
  nearBiBreak: number,
  distBoBreak: number,
  nearBoBreak: number
): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // 近距 BO 通常應大於或等於遠距
  if (!isNaN(nearBoBreak) && !isNaN(distBoBreak)) {
    if (nearBoBreak < distBoBreak - 5) {
      results.push({
        isValid: false,
        severity: 'warning',
        field: 'boRelationship',
        message: `近距 BO break (${nearBoBreak}Δ) 顯著小於遠距 (${distBoBreak}Δ)，不符常見模式，建議確認`
      });
    }
  }
  
  // 遠距 BI 通常應略大於近距
  if (!isNaN(nearBiBreak) && !isNaN(distBiBreak)) {
    if (nearBiBreak > distBiBreak + 8) {
      results.push({
        isValid: false,
        severity: 'info',
        field: 'biRelationship',
        message: `近距 BI break (${nearBiBreak}Δ) 顯著大於遠距 (${distBiBreak}Δ)，請確認測量條件一致`
      });
    }
  }
  
  return results;
}

/**
 * 眼位合理性檢查
 */
export function validatePhoria(distPhoria: number, nearPhoria: number): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // 遠距眼位極端值
  if (!isNaN(distPhoria)) {
    if (Math.abs(distPhoria) > 10) {
      results.push({
        isValid: false,
        severity: 'warning',
        field: 'distPhoria',
        message: `遠距眼位 ${distPhoria}Δ 超出常見範圍（±10Δ），建議確認是否有斜視`
      });
    }
  }
  
  // 近距眼位極端值
  if (!isNaN(nearPhoria)) {
    if (Math.abs(nearPhoria) > 20) {
      results.push({
        isValid: false,
        severity: 'warning',
        field: 'nearPhoria',
        message: `近距眼位 ${nearPhoria}Δ 超出常見範圍（±20Δ），建議確認測量`
      });
    }
  }
  
  return results;
}

// ============================================
// 3. 統計離群值偵測
// ============================================

/**
 * 計算 Z-score
 */
export function calculateZScore(value: number, mean: number, sd: number): number {
  return (value - mean) / sd;
}

/**
 * Z-score 離群值檢測
 */
export function detectOutliers(examData: {
  npc?: number;
  ciss?: number;
  boBreakNear?: number;
  biBreakNear?: number;
  distPhoria?: number;
  nearPhoria?: number;
}): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  const indicators: { key: keyof typeof NORMATIVE_DATABASE; value: number | undefined; name: string }[] = [
    { key: 'npc', value: examData.npc, name: 'NPC' },
    { key: 'ciss', value: examData.ciss, name: 'CISS' },
    { key: 'boBreakNear', value: examData.boBreakNear, name: '近距 BO Break' },
    { key: 'biBreakNear', value: examData.biBreakNear, name: '近距 BI Break' },
    { key: 'distPhoria', value: examData.distPhoria, name: '遠距眼位' },
    { key: 'nearPhoria', value: examData.nearPhoria, name: '近距眼位' },
  ];
  
  indicators.forEach(indicator => {
    if (indicator.value === undefined || isNaN(indicator.value)) return;
    
    const norm = NORMATIVE_DATABASE[indicator.key];
    const zScore = calculateZScore(indicator.value, norm.mean, norm.sd);
    
    if (Math.abs(zScore) > 3) {
      results.push({
        isValid: false,
        severity: 'warning',
        field: String(indicator.key),
        message: `${indicator.name} 數值 ${indicator.value} 為極端值（Z=${zScore.toFixed(1)}，超過 ±3 SD），建議確認`
      });
    } else if (Math.abs(zScore) > 2.5) {
      results.push({
        isValid: false,
        severity: 'info',
        field: String(indicator.key),
        message: `${indicator.name} 數值 ${indicator.value} 偏離常模（Z=${zScore.toFixed(1)}）`
      });
    }
  });
  
  return results;
}

// ============================================
// 4. 綜合驗證與評分
// ============================================

export interface ExamDataForValidation {
  age?: number;
  npc?: number;
  ciss?: number;
  distPhoria?: number;
  nearPhoria?: number;
  distBiBreak?: number;
  distBiRecovery?: number;
  distBoBreak?: number;
  distBoRecovery?: number;
  nearBiBreak?: number;
  nearBiRecovery?: number;
  nearBoBreak?: number;
  nearBoRecovery?: number;
  calculatedACA?: number;
  gradientACA?: number;
  pd?: number;
  workDist?: number;
  amp?: number;
  flipper?: string;
  nra?: number;
  pra?: number;
  stereo?: number;
}

/**
 * 執行所有驗證
 */
export function runAllValidations(data: ExamDataForValidation): ValidationResult[] {
  const allResults: ValidationResult[] = [];
  
  // 1. AC/A 驗證
  if (data.calculatedACA !== undefined) {
    const acaResult = validateACARatio(data.calculatedACA);
    if (!acaResult.isValid) allResults.push(acaResult);
  }
  
  // 2. NPC 與年齡驗證
  if (data.npc !== undefined && data.age !== undefined) {
    const npcResult = validateNPCByAge(data.npc, data.age);
    if (!npcResult.isValid) allResults.push(npcResult);
  }
  
  // 3. CISS 驗證
  if (data.ciss !== undefined && data.age !== undefined) {
    const cissResult = validateCISS(data.ciss, data.age);
    if (!cissResult.isValid) allResults.push(cissResult);
  }
  
  // 4. Phoria 與 AC/A 一致性
  if (data.distPhoria !== undefined && data.nearPhoria !== undefined && data.calculatedACA !== undefined) {
    const consistencyResults = validatePhoriaACAConsistency(
      data.distPhoria,
      data.nearPhoria,
      data.calculatedACA,
      data.gradientACA,
      data.pd,
      data.workDist
    );
    allResults.push(...consistencyResults);
  }
  
  // 5. 眼位合理性
  if (data.distPhoria !== undefined || data.nearPhoria !== undefined) {
    const phoriaResults = validatePhoria(data.distPhoria || 0, data.nearPhoria || 0);
    allResults.push(...phoriaResults);
  }
  
  // 6. 遠距融像儲備驗證
  if (data.distBiBreak !== undefined || data.distBoBreak !== undefined) {
    const distVergenceResults = validateVergenceReserves(
      data.distBiBreak || 0,
      data.distBiRecovery || 0,
      data.distBoBreak || 0,
      data.distBoRecovery || 0,
      'dist'
    );
    allResults.push(...distVergenceResults);
  }
  
  // 7. 近距融像儲備驗證
  if (data.nearBiBreak !== undefined || data.nearBoBreak !== undefined) {
    const nearVergenceResults = validateVergenceReserves(
      data.nearBiBreak || 0,
      data.nearBiRecovery || 0,
      data.nearBoBreak || 0,
      data.nearBoRecovery || 0,
      'near'
    );
    allResults.push(...nearVergenceResults);
  }
  
  // 8. 遠近距關聯性
  const relationshipResults = validateDistanceNearRelationship(
    data.distBiBreak || 0,
    data.nearBiBreak || 0,
    data.distBoBreak || 0,
    data.nearBoBreak || 0
  );
  allResults.push(...relationshipResults);
  
  // 9. 統計離群值
  const outlierResults = detectOutliers({
    npc: data.npc,
    ciss: data.ciss,
    boBreakNear: data.nearBoBreak,
    biBreakNear: data.nearBiBreak,
    distPhoria: data.distPhoria,
    nearPhoria: data.nearPhoria,
  });
  allResults.push(...outlierResults);
  
  return allResults;
}

/**
 * 計算資料品質評分
 */
export function calculateDataQualityScore(data: ExamDataForValidation): DataQualityScore {
  // 定義重要欄位
  const essentialFields = [
    'age', 'distPhoria', 'nearPhoria', 'npc'
  ];
  
  const importantFields = [
    'nearBoBreak', 'nearBiBreak', 'distBoBreak', 'distBiBreak',
    'nearBoRecovery', 'nearBiRecovery', 'distBoRecovery', 'distBiRecovery'
  ];
  
  const recommendedFields = [
    'ciss', 'amp', 'flipper', 'nra', 'pra', 'stereo', 'gradientACA', 'pd', 'workDist'
  ];
  
  const allFields = [...essentialFields, ...importantFields, ...recommendedFields];
  
  // 計算完整度
  let filledEssential = 0;
  let filledImportant = 0;
  let filledRecommended = 0;
  const missingRecommended: string[] = [];
  
  const fieldLabels: Record<string, string> = {
    age: '年齡',
    distPhoria: '遠距眼位',
    nearPhoria: '近距眼位',
    npc: 'NPC',
    nearBoBreak: '近距 BO Break',
    nearBiBreak: '近距 BI Break',
    distBoBreak: '遠距 BO Break',
    distBiBreak: '遠距 BI Break',
    nearBoRecovery: '近距 BO Recovery',
    nearBiRecovery: '近距 BI Recovery',
    distBoRecovery: '遠距 BO Recovery',
    distBiRecovery: '遠距 BI Recovery',
    ciss: 'CISS 問卷',
    amp: '調節幅度',
    flipper: 'Flipper',
    nra: 'NRA',
    pra: 'PRA',
    stereo: '立體視',
    gradientACA: 'Gradient AC/A',
    pd: 'PD',
    workDist: '工作距離'
  };
  
  essentialFields.forEach(field => {
    const value = data[field as keyof ExamDataForValidation];
    if (value !== undefined && value !== '' && !isNaN(Number(value))) {
      filledEssential++;
    }
  });
  
  importantFields.forEach(field => {
    const value = data[field as keyof ExamDataForValidation];
    if (value !== undefined && value !== '' && !isNaN(Number(value))) {
      filledImportant++;
    }
  });
  
  recommendedFields.forEach(field => {
    const value = data[field as keyof ExamDataForValidation];
    if (value !== undefined && value !== '' && (typeof value === 'string' || !isNaN(Number(value)))) {
      filledRecommended++;
    } else {
      missingRecommended.push(fieldLabels[field] || field);
    }
  });
  
  const totalFilled = filledEssential + filledImportant + filledRecommended;
  const completeness = Math.round(
    (filledEssential / essentialFields.length * 40) +
    (filledImportant / importantFields.length * 40) +
    (filledRecommended / recommendedFields.length * 20)
  );
  
  // 執行驗證獲取一致性問題
  const validationResults = runAllValidations(data);
  const errors = validationResults.filter(r => r.severity === 'error');
  const warnings = validationResults.filter(r => r.severity === 'warning');
  const infos = validationResults.filter(r => r.severity === 'info');
  
  // 計算一致性分數
  const errorPenalty = errors.length * 15;
  const warningPenalty = warnings.length * 8;
  const infoPenalty = infos.length * 2;
  const consistency = Math.max(0, 100 - errorPenalty - warningPenalty - infoPenalty);
  
  // 計算信度分數（基於推薦項目填寫情況）
  const reliability = Math.round(
    (filledRecommended / recommendedFields.length * 60) +
    (data.gradientACA !== undefined ? 20 : 0) +
    (data.ciss !== undefined ? 20 : 0)
  );
  
  // 總分計算
  const overall = Math.round(completeness * 0.4 + consistency * 0.4 + reliability * 0.2);
  
  return {
    completeness,
    consistency,
    reliability,
    overall,
    details: {
      filledFields: totalFilled,
      totalFields: allFields.length,
      inconsistencies: validationResults.filter(r => !r.isValid).map(r => r.message || ''),
      missingRecommended
    }
  };
}

/**
 * 獲取驗證結果摘要
 */
export function getValidationSummary(results: ValidationResult[]): {
  errors: number;
  warnings: number;
  infos: number;
  hasBlockingErrors: boolean;
} {
  const errors = results.filter(r => r.severity === 'error').length;
  const warnings = results.filter(r => r.severity === 'warning').length;
  const infos = results.filter(r => r.severity === 'info').length;
  
  return {
    errors,
    warnings,
    infos,
    hasBlockingErrors: errors > 0
  };
}
