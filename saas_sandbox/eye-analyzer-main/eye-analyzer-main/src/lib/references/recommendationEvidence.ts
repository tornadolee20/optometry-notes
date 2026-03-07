// Recommendation-Evidence Mapping
// Links clinical recommendations to supporting literature

import { EvidenceLevel } from './literatureDatabase';

export enum RecommendationStrength {
  STRONG = 'Strong',
  MODERATE = 'Moderate',
  WEAK = 'Weak'
}

export const RECOMMENDATION_STRENGTH_DESCRIPTION = {
  [RecommendationStrength.STRONG]: {
    label: 'Strong',
    labelCN: '強烈建議',
    description: 'High-quality evidence supports this recommendation',
    descriptionCN: '高品質證據支持此建議',
    color: 'bg-green-600',
    textColor: 'text-white'
  },
  [RecommendationStrength.MODERATE]: {
    label: 'Moderate',
    labelCN: '建議',
    description: 'Moderate evidence supports this recommendation',
    descriptionCN: '中等證據支持此建議',
    color: 'bg-blue-500',
    textColor: 'text-white'
  },
  [RecommendationStrength.WEAK]: {
    label: 'Weak',
    labelCN: '可考慮',
    description: 'Limited evidence; may consider based on clinical judgment',
    descriptionCN: '有限證據；可依臨床判斷考慮',
    color: 'bg-yellow-500',
    textColor: 'text-white'
  }
};

export type RecommendationType = 'prism' | 'vision_training' | 'lens' | 'observation' | 'referral';
export type AgeGroup = 'child' | 'adolescent' | 'adult' | 'elderly' | 'all';

export interface RecommendationEvidence {
  id: string;
  recommendationType: RecommendationType;
  condition: string;
  conditionCN: string;
  ageGroup: AgeGroup;
  evidenceLevel: EvidenceLevel;
  recommendationStrength: RecommendationStrength;
  recommendationStrengthCN: string;
  supportingReferences: string[];
  numberOfStudies: number;
  totalSampleSize?: number;
  effectSize?: string;
  benefitSummary: string;
  benefitSummaryCN: string;
  limitations?: string[];
  limitationsCN?: string[];
  contraindications?: string[];
  contraindicationsCN?: string[];
}

// Recommendation-Evidence Map
export const RECOMMENDATION_EVIDENCE_MAP: RecommendationEvidence[] = [
  // CI → Vision Training (Strong Evidence)
  {
    id: 'CI_vision_training',
    recommendationType: 'vision_training',
    condition: 'CI',
    conditionCN: '集合不足',
    ageGroup: 'all',
    evidenceLevel: EvidenceLevel.IB,
    recommendationStrength: RecommendationStrength.STRONG,
    recommendationStrengthCN: '強烈建議',
    supportingReferences: ['citt-2008', 'citt-2005', 'scheiman-2011'],
    numberOfStudies: 3,
    totalSampleSize: 267,
    effectSize: 'Large (d > 0.8)',
    benefitSummary: 'Office-based vergence/accommodative therapy significantly improves NPC, PFV, and reduces CISS scores. Success rate >70% at 12 weeks.',
    benefitSummaryCN: '診所視覺訓練顯著改善NPC、PFV並降低CISS分數。12週成功率超過70%。',
    limitations: [
      'Requires regular office visits (weekly)',
      'Treatment duration typically 12-16 weeks',
      'Home reinforcement exercises needed'
    ],
    limitationsCN: [
      '需定期到診（每週）',
      '療程通常需12-16週',
      '需配合居家練習'
    ],
    contraindications: [
      'Intermittent exotropia with poor control',
      'Neurological conditions affecting vergence'
    ],
    contraindicationsCN: [
      '控制不良的間歇性外斜視',
      '影響聚散功能的神經疾病'
    ]
  },
  // CI → Prism (Weak Evidence)
  {
    id: 'CI_prism',
    recommendationType: 'prism',
    condition: 'CI',
    conditionCN: '集合不足',
    ageGroup: 'adult',
    evidenceLevel: EvidenceLevel.IV,
    recommendationStrength: RecommendationStrength.WEAK,
    recommendationStrengthCN: '可考慮',
    supportingReferences: ['sheard-1930', 'scheiman-wick-2019'],
    numberOfStudies: 2,
    benefitSummary: 'Base-in prism can provide symptomatic relief but does not address underlying vergence dysfunction. May be appropriate for patients who cannot complete vision therapy.',
    benefitSummaryCN: 'BI稜鏡可提供症狀緩解，但無法解決根本的聚散功能問題。適用於無法完成視覺訓練的患者。',
    limitations: [
      'Symptomatic relief only',
      'Does not improve vergence function',
      'May require increasing prism over time'
    ],
    limitationsCN: [
      '僅緩解症狀',
      '無法改善聚散功能',
      '可能需要逐漸增加稜鏡量'
    ]
  },
  // CE → Lens (Moderate Evidence)
  {
    id: 'CE_lens',
    recommendationType: 'lens',
    condition: 'CE',
    conditionCN: '集合過度',
    ageGroup: 'all',
    evidenceLevel: EvidenceLevel.IIB,
    recommendationStrength: RecommendationStrength.MODERATE,
    recommendationStrengthCN: '建議',
    supportingReferences: ['scheiman-wick-2019', 'gwiazda-2003'],
    numberOfStudies: 2,
    benefitSummary: 'Plus lens addition reduces accommodative demand and associated convergence. Especially effective in high AC/A ratio cases.',
    benefitSummaryCN: '正鏡片加入度減少調節需求及伴隨的集合。對高AC/A比值病例特別有效。',
    limitations: [
      'Requires accurate measurement of AC/A ratio',
      'May need bifocal or progressive lens'
    ],
    limitationsCN: [
      '需準確測量AC/A比值',
      '可能需要雙光或漸進鏡片'
    ]
  },
  // DE → Vision Training (Moderate Evidence)
  {
    id: 'DE_vision_training',
    recommendationType: 'vision_training',
    condition: 'DE',
    conditionCN: '分散過度',
    ageGroup: 'all',
    evidenceLevel: EvidenceLevel.IIB,
    recommendationStrength: RecommendationStrength.MODERATE,
    recommendationStrengthCN: '建議',
    supportingReferences: ['cooper-2012', 'scheiman-wick-2019'],
    numberOfStudies: 2,
    benefitSummary: 'Vergence training focusing on negative fusional vergence can improve symptoms. Less studied than CI treatment.',
    benefitSummaryCN: '著重負向融像聚散的視覺訓練可改善症狀。研究證據比CI治療少。',
    limitations: [
      'Less research compared to CI',
      'May require combined accommodative training'
    ],
    limitationsCN: [
      '研究證據較CI少',
      '可能需合併調節訓練'
    ]
  },
  // BX → Prism (Moderate Evidence)
  {
    id: 'BX_prism',
    recommendationType: 'prism',
    condition: 'BX',
    conditionCN: '基本型外斜',
    ageGroup: 'all',
    evidenceLevel: EvidenceLevel.IV,
    recommendationStrength: RecommendationStrength.MODERATE,
    recommendationStrengthCN: '建議',
    supportingReferences: ['sheard-1930', 'percival-1928', 'scheiman-wick-2019'],
    numberOfStudies: 3,
    benefitSummary: 'Base-in prism relieves symptoms when Sheard criterion is not met. Effective for reducing asthenopia associated with exophoria.',
    benefitSummaryCN: '當Sheard準則不符合時，BI稜鏡可緩解症狀。對於外斜位伴隨的視覺疲勞有效。',
    limitations: [
      'Based on clinical criteria, limited RCT data',
      'May need adjustment over time'
    ],
    limitationsCN: [
      '基於臨床準則，缺乏隨機對照試驗數據',
      '可能需要隨時間調整'
    ]
  },
  // BE → Prism (Moderate Evidence)
  {
    id: 'BE_prism',
    recommendationType: 'prism',
    condition: 'BE',
    conditionCN: '基本型內斜',
    ageGroup: 'all',
    evidenceLevel: EvidenceLevel.IV,
    recommendationStrength: RecommendationStrength.MODERATE,
    recommendationStrengthCN: '建議',
    supportingReferences: ['percival-1928', 'scheiman-wick-2019', 'von-noorden-2002'],
    numberOfStudies: 3,
    benefitSummary: 'Base-out prism relieves symptoms when Percival criterion is not met. Consider in patients with esophoria and limited negative fusional vergence.',
    benefitSummaryCN: '當Percival準則不符合時，BO稜鏡可緩解症狀。適用於內斜位且負向融像聚散受限的患者。',
    limitations: [
      'Based on clinical criteria',
      'Rule out accommodative esotropia first'
    ],
    limitationsCN: [
      '基於臨床準則',
      '需先排除調節性內斜視'
    ]
  },
  // FD → Prism (Weak Evidence)
  {
    id: 'FD_prism',
    recommendationType: 'prism',
    condition: 'FD',
    conditionCN: '固視差異',
    ageGroup: 'all',
    evidenceLevel: EvidenceLevel.IV,
    recommendationStrength: RecommendationStrength.WEAK,
    recommendationStrengthCN: '可考慮',
    supportingReferences: ['scheiman-wick-2019'],
    numberOfStudies: 1,
    benefitSummary: 'Associated phoria prism can reduce fixation disparity and symptoms. Limited evidence from controlled trials.',
    benefitSummaryCN: '相關斜位稜鏡可減少固視差異及症狀。缺乏對照試驗的證據。',
    limitations: [
      'Limited RCT evidence',
      'Requires specialized testing equipment'
    ],
    limitationsCN: [
      '缺乏隨機對照試驗證據',
      '需特殊測試設備'
    ]
  },
  // General → Observation (Expert Opinion)
  {
    id: 'asymptomatic_observation',
    recommendationType: 'observation',
    condition: 'asymptomatic',
    conditionCN: '無症狀',
    ageGroup: 'all',
    evidenceLevel: EvidenceLevel.V,
    recommendationStrength: RecommendationStrength.WEAK,
    recommendationStrengthCN: '可考慮',
    supportingReferences: ['scheiman-wick-2019'],
    numberOfStudies: 1,
    benefitSummary: 'Asymptomatic patients with mild binocular vision findings may be monitored without active treatment. Counsel on visual hygiene.',
    benefitSummaryCN: '無症狀且雙眼視覺檢查輕微異常的患者可採觀察追蹤，不須積極治療。衛教視覺保健。',
    limitations: [
      'Based on expert consensus',
      'Regular monitoring recommended'
    ],
    limitationsCN: [
      '基於專家共識',
      '建議定期追蹤'
    ]
  },
  // Stereo deficiency → Referral
  {
    id: 'stereo_deficiency_referral',
    recommendationType: 'referral',
    condition: 'stereo_deficiency',
    conditionCN: '立體視缺陷',
    ageGroup: 'child',
    evidenceLevel: EvidenceLevel.IIB,
    recommendationStrength: RecommendationStrength.STRONG,
    recommendationStrengthCN: '強烈建議',
    supportingReferences: ['birch-2013', 'von-noorden-2002'],
    numberOfStudies: 2,
    benefitSummary: 'Children with significant stereoacuity deficiency should be referred for comprehensive evaluation to rule out strabismus or amblyopia.',
    benefitSummaryCN: '立體視力顯著缺陷的兒童應轉介進行全面評估，以排除斜視或弱視。',
    contraindications: [],
    contraindicationsCN: []
  }
];

// Helper function to get evidence for a condition and intervention
export function getEvidenceForRecommendation(
  condition: string,
  recommendationType: RecommendationType
): RecommendationEvidence | undefined {
  return RECOMMENDATION_EVIDENCE_MAP.find(
    e => e.condition.toLowerCase() === condition.toLowerCase() &&
         e.recommendationType === recommendationType
  );
}

// Helper function to get all evidence for a condition
export function getEvidenceForCondition(condition: string): RecommendationEvidence[] {
  return RECOMMENDATION_EVIDENCE_MAP.filter(
    e => e.condition.toLowerCase() === condition.toLowerCase()
  );
}

// Helper function to get evidence by ID
export function getEvidenceById(id: string): RecommendationEvidence | undefined {
  return RECOMMENDATION_EVIDENCE_MAP.find(e => e.id === id);
}

// Helper function to get highest evidence level for a condition
export function getHighestEvidenceLevel(condition: string): EvidenceLevel | null {
  const evidenceList = getEvidenceForCondition(condition);
  if (evidenceList.length === 0) return null;
  
  const levelOrder = [
    EvidenceLevel.IA,
    EvidenceLevel.IB,
    EvidenceLevel.IIA,
    EvidenceLevel.IIB,
    EvidenceLevel.III,
    EvidenceLevel.IV,
    EvidenceLevel.V
  ];
  
  return evidenceList.reduce((highest, current) => {
    const currentIndex = levelOrder.indexOf(current.evidenceLevel);
    const highestIndex = levelOrder.indexOf(highest.evidenceLevel);
    return currentIndex < highestIndex ? current : highest;
  }).evidenceLevel;
}

// Helper function to format recommendation summary
export function formatRecommendationSummary(
  evidence: RecommendationEvidence,
  language: 'en' | 'zh' = 'zh'
): string {
  if (language === 'zh') {
    return `${evidence.conditionCN} → ${getRecommendationTypeCN(evidence.recommendationType)}：${evidence.recommendationStrengthCN}（證據等級 ${evidence.evidenceLevel}）`;
  }
  return `${evidence.condition} → ${evidence.recommendationType}: ${evidence.recommendationStrength} (Evidence Level ${evidence.evidenceLevel})`;
}

function getRecommendationTypeCN(type: RecommendationType): string {
  const map: Record<RecommendationType, string> = {
    prism: '稜鏡處方',
    vision_training: '視覺訓練',
    lens: '鏡片處方',
    observation: '觀察追蹤',
    referral: '轉介'
  };
  return map[type];
}
