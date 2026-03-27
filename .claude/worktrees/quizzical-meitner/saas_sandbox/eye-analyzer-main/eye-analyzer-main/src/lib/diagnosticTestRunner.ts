/**
 * 診斷規則驗證測試執行器
 * 用於自動化驗證所有測試案例的診斷輸出
 */

import { MOCK_CASES, MockCase, MockCaseData } from './mockCases';
import { calculateLogic, CalculationInput } from './calculateLogic';

export interface DiagnosticMismatch {
  field: string;
  expected: string;
  actual: string;
  severity: 'critical' | 'warning';
}

export interface DiagnosticTestResult {
  caseId: string;
  caseName: string;
  passed: boolean;
  expectedDiagnosis: string;
  expectedPrimaryDiagnosis: string;
  expectedPriority?: string;
  actualDiagnosis: string;
  actualPriority: string;
  actualHealthScore: number;
  mismatches: DiagnosticMismatch[];
}

export interface TestSummary {
  totalCases: number;
  passed: number;
  failed: number;
  passRate: number;
  failedCases: DiagnosticTestResult[];
  allResults: DiagnosticTestResult[];
  runTimestamp: string;
}

/**
 * 將 MockCaseData 轉換為 calculateLogic 需要的 CalculationInput 格式
 */
const convertMockCaseToInput = (data: MockCaseData): Partial<CalculationInput> => {
  return {
    age: data.age,
    pd: data.pd,
    npc: data.npc,
    workDist: 40, // 預設工作距離
    harmonDist: 0,
    odSph: data.refraction?.OD?.sphere ?? -2.0,
    odCyl: data.refraction?.OD?.cylinder ?? -0.5,
    odAxis: data.refraction?.OD?.axis ?? 180,
    osSph: data.refraction?.OS?.sphere ?? -2.0,
    osCyl: data.refraction?.OS?.cylinder ?? -0.5,
    osAxis: data.refraction?.OS?.axis ?? 180,
    add: 0,
    aaOD: data.aaOD,
    aaOS: data.aaOS,
    nra: data.nra,
    pra: data.pra,
    mem: data.mem,
    flipper: data.flipper,
    distPhoria: data.dist_phoria,
    nearPhoria: data.near_phoria,
    vertPhoria: 0,
    nearPhoriaGradient: null,
    biBreak: data.bi_break,
    biRec: Math.round(data.bi_break * 0.7),
    boBreak: data.bo_break,
    boRec: Math.round(data.bo_break * 0.7),
    cissScore: data.ciss,
    stereo: data.stereo,
    vergenceFacilityCpm: data.vergence_facility,
    vergenceFacilityAborted: false,
  };
};

/**
 * 執行單一案例測試
 */
export const runSingleTest = (mockCase: MockCase): DiagnosticTestResult => {
  // 轉換資料格式
  const input = convertMockCaseToInput(mockCase.data);
  
  // 呼叫計算邏輯
  const result = calculateLogic(input);
  
  // 建立 mismatches 陣列
  const mismatches: DiagnosticMismatch[] = [];
  
  // 1. 比對主診斷代碼（critical）
  if (result.diag.code !== mockCase.expectedDiagnosis) {
    mismatches.push({
      field: 'diagCode',
      expected: mockCase.expectedDiagnosis,
      actual: result.diag.code,
      severity: 'critical',
    });
  }
  
  // 2. 比對處置優先級（warning）
  if (mockCase.expected_priority && result.priority !== mockCase.expected_priority) {
    mismatches.push({
      field: 'priority',
      expected: mockCase.expected_priority,
      actual: result.priority,
      severity: 'warning',
    });
  }
  
  // passed 條件：沒有 critical mismatch
  const hasCriticalMismatch = mismatches.some(m => m.severity === 'critical');
  
  return {
    caseId: mockCase.id,
    caseName: mockCase.name,
    passed: !hasCriticalMismatch,
    expectedDiagnosis: mockCase.expectedDiagnosis,
    expectedPrimaryDiagnosis: mockCase.expected_primary_diagnosis || mockCase.description,
    expectedPriority: mockCase.expected_priority,
    actualDiagnosis: result.diag.code,
    actualPriority: result.priority,
    actualHealthScore: result.healthScore,
    mismatches,
  };
};

/**
 * 執行所有測試案例
 */
export const runAllDiagnosticTests = (): TestSummary => {
  const allResults = MOCK_CASES.map(runSingleTest);
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.length - passed;
  
  return {
    totalCases: allResults.length,
    passed,
    failed,
    passRate: allResults.length > 0 ? Math.round((passed / allResults.length) * 100) : 0,
    failedCases: allResults.filter(r => !r.passed),
    allResults,
    runTimestamp: new Date().toISOString(),
  };
};
