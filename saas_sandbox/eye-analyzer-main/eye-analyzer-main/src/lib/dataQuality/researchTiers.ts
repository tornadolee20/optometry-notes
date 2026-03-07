/**
 * 研究資料品質分級系統
 * Research Data Quality Tiering System
 */

import { 
  calculateCoreCompleteness, 
  calculateOptionalCompleteness,
  CORE_VARIABLES,
  OPTIONAL_VARIABLES
} from './coreVariables';

export type ResearchTier = 'gold' | 'high' | 'acceptable' | 'insufficient';

export interface TierInfo {
  tier: ResearchTier;
  label: string;
  labelZh: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  descriptionZh: string;
  useCases: string[];
  useCasesZh: string[];
}

export interface ResearchEligibility {
  tier: ResearchTier;
  tierInfo: TierInfo;
  isEligible: boolean;
  coreCompleteness: number;
  optionalCompleteness: number;
  totalCompleteness: number;
  qualityScore: number;
  missingCoreFields: string[];
  missingOptionalFields: string[];
  details: {
    coreFilledCount: number;
    coreTotalCount: number;
    optionalFilledCount: number;
    optionalTotalCount: number;
  };
}

// 三層品質分級定義
export const TIER_DEFINITIONS: Record<ResearchTier, TierInfo> = {
  gold: {
    tier: 'gold',
    label: 'Gold',
    labelZh: '金級',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    description: 'Complete data with excellent quality - suitable for primary statistical analysis',
    descriptionZh: '完整資料、品質優秀，適合主要統計分析',
    useCases: [
      'Primary statistical analysis',
      'Publication-ready research',
      'AI/ML model training',
      'Normative data establishment'
    ],
    useCasesZh: [
      '主要統計分析',
      '可發表之研究',
      'AI/ML 模型訓練',
      '建立常模資料'
    ]
  },
  high: {
    tier: 'high',
    label: 'High',
    labelZh: '高品質',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    description: 'Near-complete data with good quality - recommended for most analyses',
    descriptionZh: '資料幾近完整、品質良好，推薦用於多數分析',
    useCases: [
      'Secondary analysis',
      'Subgroup analysis',
      'Clinical correlation studies',
      'Algorithm validation'
    ],
    useCasesZh: [
      '次要分析',
      '亞群分析',
      '臨床相關性研究',
      '演算法驗證'
    ]
  },
  acceptable: {
    tier: 'acceptable',
    label: 'Acceptable',
    labelZh: '可接受',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    description: 'Basic data completeness - suitable for descriptive statistics',
    descriptionZh: '基本資料完整度，適合描述性統計',
    useCases: [
      'Descriptive statistics',
      'Prevalence studies',
      'Exploratory analysis',
      'Quality improvement initiatives'
    ],
    useCasesZh: [
      '描述性統計',
      '盛行率研究',
      '探索性分析',
      '品質改善專案'
    ]
  },
  insufficient: {
    tier: 'insufficient',
    label: 'Insufficient',
    labelZh: '不符合',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    description: 'Data does not meet minimum research standards',
    descriptionZh: '資料未達最低研究標準',
    useCases: [
      'Not suitable for research',
      'Requires additional data collection'
    ],
    useCasesZh: [
      '不適合用於研究',
      '需補充資料'
    ]
  }
};

/**
 * 根據品質分數和完整度判斷研究資格等級
 */
export function evaluateResearchEligibility(
  examData: Record<string, any>,
  qualityScore: number
): ResearchEligibility {
  // 計算核心變數完整度
  const coreResult = calculateCoreCompleteness(examData);
  
  // 計算選填變數完整度
  const optionalResult = calculateOptionalCompleteness(examData);
  
  // 計算總完整度（核心變數權重 80%，選填變數權重 20%）
  const totalCompleteness = Math.round(
    coreResult.completeness * 0.8 + optionalResult.completeness * 0.2
  );
  
  // 判斷等級
  let tier: ResearchTier;
  
  // 核心變數必須 100% 完整才能達到 Gold 或 High
  if (coreResult.completeness === 100 && totalCompleteness === 100 && qualityScore >= 85) {
    tier = 'gold';
  } else if (coreResult.completeness === 100 && totalCompleteness >= 95 && qualityScore >= 70) {
    tier = 'high';
  } else if (coreResult.completeness >= 90 && totalCompleteness >= 90 && qualityScore >= 60) {
    tier = 'acceptable';
  } else {
    tier = 'insufficient';
  }
  
  const tierInfo = TIER_DEFINITIONS[tier];
  
  return {
    tier,
    tierInfo,
    isEligible: tier !== 'insufficient',
    coreCompleteness: coreResult.completeness,
    optionalCompleteness: optionalResult.completeness,
    totalCompleteness,
    qualityScore,
    missingCoreFields: coreResult.missingFields,
    missingOptionalFields: optionalResult.missingFields,
    details: {
      coreFilledCount: coreResult.filledCount,
      coreTotalCount: coreResult.totalCount,
      optionalFilledCount: optionalResult.filledCount,
      optionalTotalCount: optionalResult.totalCount
    }
  };
}

/**
 * 取得等級資訊
 */
export function getTierInfo(tier: ResearchTier): TierInfo {
  return TIER_DEFINITIONS[tier];
}

/**
 * 取得所有等級的摘要
 */
export function getTierSummary(): { tier: ResearchTier; info: TierInfo; criteria: string }[] {
  return [
    {
      tier: 'gold',
      info: TIER_DEFINITIONS.gold,
      criteria: '完整度 100% + 品質 ≥85'
    },
    {
      tier: 'high',
      info: TIER_DEFINITIONS.high,
      criteria: '核心 100% + 總完整度 ≥95% + 品質 ≥70'
    },
    {
      tier: 'acceptable',
      info: TIER_DEFINITIONS.acceptable,
      criteria: '核心 ≥90% + 總完整度 ≥90% + 品質 ≥60'
    },
    {
      tier: 'insufficient',
      info: TIER_DEFINITIONS.insufficient,
      criteria: '未達上述標準'
    }
  ];
}

/**
 * 計算資料集中各等級的數量
 */
export function calculateTierDistribution(
  records: Array<{ examData: Record<string, any>; qualityScore: number }>
): {
  gold: number;
  high: number;
  acceptable: number;
  insufficient: number;
  total: number;
  eligible: number;
} {
  const distribution = {
    gold: 0,
    high: 0,
    acceptable: 0,
    insufficient: 0,
    total: records.length,
    eligible: 0
  };
  
  records.forEach(record => {
    const eligibility = evaluateResearchEligibility(record.examData, record.qualityScore);
    distribution[eligibility.tier]++;
    if (eligibility.isEligible) {
      distribution.eligible++;
    }
  });
  
  return distribution;
}

/**
 * 根據等級過濾資料
 */
export function filterByTier(
  records: Array<{ examData: Record<string, any>; qualityScore: number }>,
  minimumTier: ResearchTier
): Array<{ examData: Record<string, any>; qualityScore: number; tier: ResearchTier }> {
  const tierPriority: Record<ResearchTier, number> = {
    gold: 3,
    high: 2,
    acceptable: 1,
    insufficient: 0
  };
  
  const minPriority = tierPriority[minimumTier];
  
  return records
    .map(record => {
      const eligibility = evaluateResearchEligibility(record.examData, record.qualityScore);
      return { ...record, tier: eligibility.tier };
    })
    .filter(record => tierPriority[record.tier] >= minPriority);
}
