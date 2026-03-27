/**
 * 研究資料核心變數定義
 * Core Variables Definition for Research Data Quality
 */

export interface CoreVariable {
  key: string;
  name: string;
  nameZh: string;
  description: string;
  required: boolean; // 核心變數為 true，選填變數為 false
  dataType: 'number' | 'string' | 'boolean';
  validRange?: { min?: number; max?: number };
}

// 15 項核心變數（必填）
export const CORE_VARIABLES: CoreVariable[] = [
  {
    key: 'age',
    name: 'Age',
    nameZh: '年齡',
    description: '患者年齡',
    required: true,
    dataType: 'number',
    validRange: { min: 3, max: 100 }
  },
  {
    key: 'gender',
    name: 'Gender',
    nameZh: '性別',
    description: '患者性別',
    required: true,
    dataType: 'string'
  },
  {
    key: 'ciss',
    name: 'CISS Score',
    nameZh: 'CISS 問卷分數',
    description: '聚合不足症狀問卷分數 (0-60)',
    required: true,
    dataType: 'number',
    validRange: { min: 0, max: 60 }
  },
  {
    key: 'stereo',
    name: 'Stereoacuity',
    nameZh: '立體視',
    description: '立體視力 (秒弧)',
    required: true,
    dataType: 'number',
    validRange: { min: 20, max: 800 }
  },
  {
    key: 'dist',
    name: 'Distance Phoria',
    nameZh: '遠距眼位',
    description: '遠距水平隱斜位 (稜鏡度)',
    required: true,
    dataType: 'number',
    validRange: { min: -30, max: 30 }
  },
  {
    key: 'near',
    name: 'Near Phoria',
    nameZh: '近距眼位',
    description: '近距水平隱斜位 (稜鏡度)',
    required: true,
    dataType: 'number',
    validRange: { min: -40, max: 40 }
  },
  {
    key: 'npc',
    name: 'Near Point of Convergence',
    nameZh: 'NPC 近點',
    description: '近聚合點 (cm)',
    required: true,
    dataType: 'number',
    validRange: { min: 0, max: 30 }
  },
  // 8 項融像儲備（近距 BI/BO Break/Recovery + 遠距 BI/BO Break/Recovery）
  {
    key: 'biB',
    name: 'Near BI Break',
    nameZh: '近距 BI 破裂點',
    description: '近距 Base-In 融像破裂點 (稜鏡度)',
    required: true,
    dataType: 'number',
    validRange: { min: 0, max: 50 }
  },
  {
    key: 'biR',
    name: 'Near BI Recovery',
    nameZh: '近距 BI 恢復點',
    description: '近距 Base-In 融像恢復點 (稜鏡度)',
    required: true,
    dataType: 'number',
    validRange: { min: 0, max: 50 }
  },
  {
    key: 'boB',
    name: 'Near BO Break',
    nameZh: '近距 BO 破裂點',
    description: '近距 Base-Out 融像破裂點 (稜鏡度)',
    required: true,
    dataType: 'number',
    validRange: { min: 0, max: 60 }
  },
  {
    key: 'boR',
    name: 'Near BO Recovery',
    nameZh: '近距 BO 恢復點',
    description: '近距 Base-Out 融像恢復點 (稜鏡度)',
    required: true,
    dataType: 'number',
    validRange: { min: 0, max: 60 }
  },
  {
    key: 'distBiB',
    name: 'Distance BI Break',
    nameZh: '遠距 BI 破裂點',
    description: '遠距 Base-In 融像破裂點 (稜鏡度)',
    required: true,
    dataType: 'number',
    validRange: { min: 0, max: 30 }
  },
  {
    key: 'distBoB',
    name: 'Distance BO Break',
    nameZh: '遠距 BO 破裂點',
    description: '遠距 Base-Out 融像破裂點 (稜鏡度)',
    required: true,
    dataType: 'number',
    validRange: { min: 0, max: 40 }
  },
];

// 選填變數（推薦但非必填）
export const OPTIONAL_VARIABLES: CoreVariable[] = [
  {
    key: 'distBiR',
    name: 'Distance BI Recovery',
    nameZh: '遠距 BI 恢復點',
    description: '遠距 Base-In 融像恢復點 (稜鏡度)',
    required: false,
    dataType: 'number',
    validRange: { min: 0, max: 30 }
  },
  {
    key: 'distBoR',
    name: 'Distance BO Recovery',
    nameZh: '遠距 BO 恢復點',
    description: '遠距 Base-Out 融像恢復點 (稜鏡度)',
    required: false,
    dataType: 'number',
    validRange: { min: 0, max: 40 }
  },
  {
    key: 'vergenceFacilityCpm',
    name: 'Vergence Facility',
    nameZh: '聚散靈活度',
    description: '聚散靈活度測試 (cpm)',
    required: false,
    dataType: 'number',
    validRange: { min: 0, max: 30 }
  },
  {
    key: 'aaOD',
    name: 'Amplitude of Accommodation OD',
    nameZh: '調節幅度 OD',
    description: '右眼調節幅度 (屈光度)',
    required: false,
    dataType: 'number',
    validRange: { min: 0, max: 20 }
  },
  {
    key: 'aaOS',
    name: 'Amplitude of Accommodation OS',
    nameZh: '調節幅度 OS',
    description: '左眼調節幅度 (屈光度)',
    required: false,
    dataType: 'number',
    validRange: { min: 0, max: 20 }
  },
  {
    key: 'mem',
    name: 'MEM Retinoscopy',
    nameZh: 'MEM 視網膜鏡檢查',
    description: 'MEM 調節遲滯 (屈光度)',
    required: false,
    dataType: 'number',
    validRange: { min: -2, max: 2 }
  },
  {
    key: 'nra',
    name: 'NRA',
    nameZh: '負相對調節',
    description: '負相對調節力 (屈光度)',
    required: false,
    dataType: 'number',
    validRange: { min: 0, max: 5 }
  },
  {
    key: 'pra',
    name: 'PRA',
    nameZh: '正相對調節',
    description: '正相對調節力 (屈光度)',
    required: false,
    dataType: 'number',
    validRange: { min: -10, max: 0 }
  },
  {
    key: 'flipper',
    name: 'Flipper Facility',
    nameZh: '調節靈活度',
    description: '調節翻轉器測試 (cpm)',
    required: false,
    dataType: 'string' // "pass" or "fail" or "5/8" etc.
  },
];

// 所有變數合併
export const ALL_RESEARCH_VARIABLES = [...CORE_VARIABLES, ...OPTIONAL_VARIABLES];

/**
 * 檢查資料是否有效（在合理範圍內）
 */
export function isValidValue(key: string, value: any): boolean {
  if (value === undefined || value === null || value === '') {
    return false;
  }
  
  const variable = ALL_RESEARCH_VARIABLES.find(v => v.key === key);
  if (!variable) return true;
  
  if (variable.dataType === 'number') {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue)) return false;
    
    if (variable.validRange) {
      if (variable.validRange.min !== undefined && numValue < variable.validRange.min) {
        return false;
      }
      if (variable.validRange.max !== undefined && numValue > variable.validRange.max) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * 計算核心變數完整度
 */
export function calculateCoreCompleteness(examData: Record<string, any>): {
  completeness: number;
  filledCount: number;
  totalCount: number;
  missingFields: string[];
} {
  const missingFields: string[] = [];
  let filledCount = 0;
  const totalCount = CORE_VARIABLES.length;
  
  CORE_VARIABLES.forEach(variable => {
    const value = examData[variable.key];
    if (isValidValue(variable.key, value)) {
      filledCount++;
    } else {
      missingFields.push(variable.nameZh);
    }
  });
  
  return {
    completeness: totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0,
    filledCount,
    totalCount,
    missingFields
  };
}

/**
 * 計算選填變數完整度
 */
export function calculateOptionalCompleteness(examData: Record<string, any>): {
  completeness: number;
  filledCount: number;
  totalCount: number;
  missingFields: string[];
} {
  const missingFields: string[] = [];
  let filledCount = 0;
  const totalCount = OPTIONAL_VARIABLES.length;
  
  OPTIONAL_VARIABLES.forEach(variable => {
    const value = examData[variable.key];
    if (isValidValue(variable.key, value)) {
      filledCount++;
    } else {
      missingFields.push(variable.nameZh);
    }
  });
  
  return {
    completeness: totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0,
    filledCount,
    totalCount,
    missingFields
  };
}
