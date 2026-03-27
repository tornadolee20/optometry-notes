/**
 * 雙眼視覺主要問題分析與稜鏡建議邏輯
 * 用於消除 OEP 稜鏡建議與 Sheard/Percival 判斷的矛盾
 */

// ============= 類型定義 =============

export type Language = 'zh-TW' | 'zh-CN' | 'en';

export type PrimaryDistancePattern = 
  | 'CI'      // Convergence Insufficiency - 集合不足
  | 'CE'      // Convergence Excess - 集合過度
  | 'DE'      // Divergence Excess - 開散過度
  | 'DI'      // Divergence Insufficiency - 開散不足
  | 'BX'      // Basic Exophoria - 基本型外斜
  | 'BE'      // Basic Esophoria - 基本型內斜
  | 'NORMAL'  // 正常範圍
  | 'OTHER';  // 其他

export interface PrimaryDistanceAnalysis {
  pattern: PrimaryDistancePattern;
  primaryDistance: 'near' | 'far' | 'both' | 'none';
  phoriaDifference: number;
  description: string;
  descriptionCN: string;
  clinicalSignificance: string;
  clinicalSignificanceCN: string;
}

export interface PrismRecommendation {
  shouldRecommend: boolean;
  distance: 'near' | 'far' | 'both' | 'none';
  direction: 'BI' | 'BO' | 'none';
  amount?: number;
  priority: 'primary' | 'secondary' | 'none'; // 視覺訓練優先時為 secondary
  rationale: string;
  rationaleCN: string;
  alternatives: string[];
  alternativesCN: string[];
}

// ============= 翻譯輔助函式 =============

const createTranslator = (language: Language) => 
  (zhTW: string, zhCN: string, en: string) => 
    language === 'en' ? en : language === 'zh-CN' ? zhCN : zhTW;

// ============= 主要問題距離分析 =============

/**
 * 分析主要問題距離與 pattern
 * @param distPhoria - 遠距眼位 (負=外斜, 正=內斜)
 * @param nearPhoria - 近距眼位 (負=外斜, 正=內斜)
 * @param npc - 近點輻輳 (cm)
 * @param boBreak - 近距 BO break
 * @param biBreak - 近距 BI break
 * @param ciss - CISS 症狀分數
 */
export function analyzePrimaryDistance(
  distPhoria: number,
  nearPhoria: number,
  npc: number,
  boBreak: number,
  biBreak: number,
  ciss: number
): PrimaryDistanceAnalysis {
  const phoriaDiff = Math.abs(nearPhoria - distPhoria);
  const nearIsExo = nearPhoria < 0;
  const distIsExo = distPhoria < 0;
  const nearIsEso = nearPhoria > 0;
  const distIsEso = distPhoria > 0;
  
  // CI: 近距外斜 > 遠距 + 4Δ，且 NPC > 6 或 BO < 15
  if (nearIsExo && nearPhoria < distPhoria - 4 && (npc > 6 || boBreak < 15)) {
    return {
      pattern: 'CI',
      primaryDistance: 'near',
      phoriaDifference: phoriaDiff,
      description: 'Convergence Insufficiency (CI)',
      descriptionCN: '集合不足型 (CI)',
      clinicalSignificance: 'Near exophoria with receded NPC and/or reduced BO reserve. Training-responsive condition.',
      clinicalSignificanceCN: '近距外斜伴隨 NPC 退縮及/或 BO 儲備不足。對視覺訓練反應良好。',
    };
  }
  
  // CE: 近距內斜 ≥ 4Δ，差異 ≥ 4Δ，BI < 10
  if (nearIsEso && nearPhoria >= 4 && phoriaDiff >= 4 && biBreak < 10) {
    return {
      pattern: 'CE',
      primaryDistance: 'near',
      phoriaDifference: phoriaDiff,
      description: 'Convergence Excess (CE)',
      descriptionCN: '集合過度型 (CE)',
      clinicalSignificance: 'Near esophoria with high AC/A ratio. Consider plus lens or vision training.',
      clinicalSignificanceCN: '近距內斜伴隨高 AC/A 比值。考慮正鏡片或視覺訓練。',
    };
  }
  
  // DE: 遠距外斜 ≤ -3Δ，差異 ≥ 5Δ
  if (distIsExo && distPhoria <= -3 && phoriaDiff >= 5) {
    return {
      pattern: 'DE',
      primaryDistance: 'far',
      phoriaDifference: phoriaDiff,
      description: 'Divergence Excess (DE)',
      descriptionCN: '開散過度型 (DE)',
      clinicalSignificance: 'Distance exophoria significantly greater than near. High AC/A ratio.',
      clinicalSignificanceCN: '遠距外斜明顯大於近距。高 AC/A 比值。',
    };
  }
  
  // DI: 遠距內斜 ≥ 3Δ，差異 ≥ 4Δ
  if (distIsEso && distPhoria >= 3 && phoriaDiff >= 4) {
    return {
      pattern: 'DI',
      primaryDistance: 'far',
      phoriaDifference: phoriaDiff,
      description: 'Divergence Insufficiency (DI)',
      descriptionCN: '開散不足型 (DI)',
      clinicalSignificance: 'Distance esophoria with low AC/A ratio. Consider prism for distance.',
      clinicalSignificanceCN: '遠距內斜伴隨低 AC/A 比值。考慮遠用稜鏡。',
    };
  }
  
  // BX: 遠近皆外斜，差異 < 4Δ
  if (nearIsExo && distIsExo && phoriaDiff < 4) {
    return {
      pattern: 'BX',
      primaryDistance: 'both',
      phoriaDifference: phoriaDiff,
      description: 'Basic Exophoria (BX)',
      descriptionCN: '基本型外斜 (BX)',
      clinicalSignificance: 'Exophoria at all distances with similar magnitude. Consider full-time prism if symptomatic.',
      clinicalSignificanceCN: '遠近皆外斜且幅度相近。若有症狀可考慮全天稜鏡。',
    };
  }
  
  // BE: 遠近皆內斜，差異 < 4Δ
  if (nearIsEso && distIsEso && phoriaDiff < 4) {
    return {
      pattern: 'BE',
      primaryDistance: 'both',
      phoriaDifference: phoriaDiff,
      description: 'Basic Esophoria (BE)',
      descriptionCN: '基本型內斜 (BE)',
      clinicalSignificance: 'Esophoria at all distances with similar magnitude. Consider full-time prism if symptomatic.',
      clinicalSignificanceCN: '遠近皆內斜且幅度相近。若有症狀可考慮全天稜鏡。',
    };
  }
  
  // NORMAL: 遠近眼位都在正常範圍
  const distNormal = distPhoria >= -1 && distPhoria <= 2;
  const nearNormal = nearPhoria >= -6 && nearPhoria <= 3;
  
  if (distNormal && nearNormal) {
    return {
      pattern: 'NORMAL',
      primaryDistance: 'none',
      phoriaDifference: phoriaDiff,
      description: 'Normal Binocular Status',
      descriptionCN: '眼位正常範圍',
      clinicalSignificance: 'Phoria within expected norms. Monitor if symptomatic.',
      clinicalSignificanceCN: '眼位在預期正常範圍內。若有症狀則追蹤觀察。',
    };
  }
  
  // OTHER: 不符合上述分類
  return {
    pattern: 'OTHER',
    primaryDistance: Math.abs(nearPhoria) > Math.abs(distPhoria) ? 'near' : 'far',
    phoriaDifference: phoriaDiff,
    description: 'Unclassified Binocular Anomaly',
    descriptionCN: '未分類雙眼視覺異常',
    clinicalSignificance: 'Pattern does not fit typical classification. Further evaluation needed.',
    clinicalSignificanceCN: '不符合典型分類模式。需進一步評估。',
  };
}

// ============= 稜鏡建議生成 =============

/**
 * 基於臨床分析決定稜鏡建議
 * @param analysis - 主要問題分析結果
 * @param sheardPass - Sheard 準則是否通過
 * @param percivalPass - Percival 準則是否通過
 * @param distPhoria - 遠距眼位
 * @param nearPhoria - 近距眼位
 * @param ciss - CISS 症狀分數
 */
export function generatePrismRecommendation(
  analysis: PrimaryDistanceAnalysis,
  sheardPass: boolean,
  percivalPass: boolean,
  distPhoria: number,
  nearPhoria: number,
  ciss: number
): PrismRecommendation {
  const { pattern, primaryDistance } = analysis;
  
  // NORMAL 且 Sheard/Percival 都通過：不需要稜鏡
  if (pattern === 'NORMAL' && sheardPass && percivalPass) {
    return {
      shouldRecommend: false,
      distance: 'none',
      direction: 'none',
      priority: 'none',
      rationale: 'Phoria within normal range and fusion reserves adequate. No prism needed.',
      rationaleCN: '眼位在正常範圍且融像儲備充足。不需要稜鏡。',
      alternatives: ['Monitor symptoms', 'Visual hygiene education'],
      alternativesCN: ['追蹤症狀', '視覺衛生衛教'],
    };
  }
  
  // CI pattern: 主要問題在近距
  if (pattern === 'CI') {
    // 遠距眼位 ≤ 2Δ：只考慮近用稜鏡，不建議遠用
    const distIsNearNormal = Math.abs(distPhoria) <= 2;
    
    if (distIsNearNormal) {
      return {
        shouldRecommend: !sheardPass || ciss >= 25,
        distance: 'near',
        direction: 'BI',
        priority: 'secondary', // 視覺訓練優先
        rationale: `CI pattern with near-normal distance phoria (${distPhoria}Δ). Near prism only if training insufficient. Distance prism NOT recommended.`,
        rationaleCN: `集合不足型，遠距眼位接近正常 (${distPhoria}Δ)。僅於訓練效果不足時考慮近用稜鏡。不建議遠用稜鏡。`,
        alternatives: ['Pencil push-ups', 'Brock string', 'BO prism training', 'Computer glasses with prism'],
        alternativesCN: ['鉛筆推進訓練', 'Brock 三珠訓練', 'BO 稜鏡訓練', '電腦眼鏡加稜鏡'],
      };
    }
    
    return {
      shouldRecommend: !sheardPass || ciss >= 25,
      distance: 'near',
      direction: 'BI',
      priority: 'secondary',
      rationale: 'CI pattern. Vision training is first-line treatment. Near prism as adjunct.',
      rationaleCN: '集合不足型。視覺訓練為首選治療。近用稜鏡作為輔助。',
      alternatives: ['Pencil push-ups', 'Brock string', 'BO prism training'],
      alternativesCN: ['鉛筆推進訓練', 'Brock 三珠訓練', 'BO 稜鏡訓練'],
    };
  }
  
  // DE pattern: 主要問題在遠距
  if (pattern === 'DE') {
    // 近距眼位 ≤ 3Δ：只考慮遠用稜鏡，不建議近用
    const nearIsNearNormal = Math.abs(nearPhoria) <= 3;
    
    if (nearIsNearNormal) {
      return {
        shouldRecommend: !sheardPass,
        distance: 'far',
        direction: 'BI',
        priority: 'secondary',
        rationale: `DE pattern with near-normal near phoria (${nearPhoria}Δ). Distance prism only. Near prism NOT recommended.`,
        rationaleCN: `開散過度型，近距眼位接近正常 (${nearPhoria}Δ)。僅考慮遠用稜鏡。不建議近用稜鏡。`,
        alternatives: ['Distance-only glasses with prism', 'Vision training for distance BO'],
        alternativesCN: ['遠用眼鏡加稜鏡', '遠距 BO 視覺訓練'],
      };
    }
    
    return {
      shouldRecommend: !sheardPass,
      distance: 'far',
      direction: 'BI',
      priority: 'secondary',
      rationale: 'DE pattern. Consider distance prism. Vision training may also help.',
      rationaleCN: '開散過度型。考慮遠用稜鏡。視覺訓練也可能有幫助。',
      alternatives: ['Distance BO training', 'Minus lens therapy'],
      alternativesCN: ['遠距 BO 訓練', '負鏡片療法'],
    };
  }
  
  // CE pattern: 近距內斜
  if (pattern === 'CE') {
    return {
      shouldRecommend: !sheardPass || ciss >= 25,
      distance: 'near',
      direction: 'BO',
      priority: 'secondary',
      rationale: 'CE pattern. Plus lens or vision training preferred. Near prism as last resort.',
      rationaleCN: '集合過度型。優先考慮正鏡片或視覺訓練。近用稜鏡為最後手段。',
      alternatives: ['Plus lens for near', 'BI prism training', 'Relaxation techniques'],
      alternativesCN: ['近用正鏡片', 'BI 稜鏡訓練', '放鬆技巧'],
    };
  }
  
  // DI pattern: 遠距內斜
  if (pattern === 'DI') {
    return {
      shouldRecommend: !sheardPass,
      distance: 'far',
      direction: 'BO',
      priority: 'primary', // DI 對稜鏡反應較好
      rationale: 'DI pattern. Distance prism often needed. Less responsive to training.',
      rationaleCN: '開散不足型。通常需要遠用稜鏡。對訓練反應較差。',
      alternatives: ['Distance BI training', 'Base-out prism for distance'],
      alternativesCN: ['遠距 BI 訓練', '遠用 BO 稜鏡'],
    };
  }
  
  // BX pattern: 基本型外斜
  if (pattern === 'BX') {
    const shouldRec = (!sheardPass || !percivalPass) && ciss >= 20;
    return {
      shouldRecommend: shouldRec,
      distance: 'both',
      direction: 'BI',
      priority: shouldRec ? 'secondary' : 'none',
      rationale: 'BX pattern. Full-time prism if symptomatic and reserves inadequate.',
      rationaleCN: '基本型外斜。若有症狀且儲備不足，可考慮全天稜鏡。',
      alternatives: ['BO vergence training', 'Monitor symptoms'],
      alternativesCN: ['BO 聚散訓練', '追蹤症狀'],
    };
  }
  
  // BE pattern: 基本型內斜
  if (pattern === 'BE') {
    const shouldRec = (!sheardPass || !percivalPass) && ciss >= 20;
    return {
      shouldRecommend: shouldRec,
      distance: 'both',
      direction: 'BO',
      priority: shouldRec ? 'secondary' : 'none',
      rationale: 'BE pattern. Full-time prism if symptomatic and reserves inadequate.',
      rationaleCN: '基本型內斜。若有症狀且儲備不足，可考慮全天稜鏡。',
      alternatives: ['BI vergence training', 'Plus lens trial'],
      alternativesCN: ['BI 聚散訓練', '正鏡片試戴'],
    };
  }
  
  // Sheard/Percival 都通過但非 NORMAL：高症狀時仍可能需要處置
  if (sheardPass && percivalPass) {
    if (ciss >= 30) {
      return {
        shouldRecommend: true,
        distance: Math.abs(nearPhoria) > Math.abs(distPhoria) ? 'near' : 'far',
        direction: nearPhoria < 0 || distPhoria < 0 ? 'BI' : 'BO',
        priority: 'secondary',
        rationale: 'High symptoms despite passing criteria. Consider prism trial or training.',
        rationaleCN: '雖然準則通過但症狀嚴重。考慮試戴稜鏡或訓練。',
        alternatives: ['Vision training', 'Symptom management', 'Prism trial'],
        alternativesCN: ['視覺訓練', '症狀管理', '稜鏡試戴'],
      };
    }
    
    return {
      shouldRecommend: false,
      distance: 'none',
      direction: 'none',
      priority: 'none',
      rationale: 'Sheard and Percival criteria met. Prism not indicated at this time.',
      rationaleCN: 'Sheard 與 Percival 準則皆通過。目前不建議稜鏡。',
      alternatives: ['Vision training if symptomatic', 'Monitor'],
      alternativesCN: ['若有症狀可考慮視覺訓練', '追蹤觀察'],
    };
  }
  
  // 預設：根據眼位方向給建議
  const dominantPhoria = Math.abs(nearPhoria) > Math.abs(distPhoria) ? nearPhoria : distPhoria;
  const dominantDistance = Math.abs(nearPhoria) > Math.abs(distPhoria) ? 'near' : 'far';
  
  return {
    shouldRecommend: true,
    distance: dominantDistance,
    direction: dominantPhoria < 0 ? 'BI' : 'BO',
    priority: 'secondary',
    rationale: 'Fusion reserve criteria not met. Consider prism with vision training.',
    rationaleCN: '融像儲備準則未通過。考慮稜鏡搭配視覺訓練。',
    alternatives: ['Vision training', 'Prism adaptation', 'Lifestyle modifications'],
    alternativesCN: ['視覺訓練', '稜鏡適應', '生活型態調整'],
  };
}

// ============= 輔助函式 =============

/**
 * 計算建議稜鏡量 (Sheard 公式)
 */
export function calculateSheardPrism(phoria: number, reserve: number): number {
  const demand = Math.abs(phoria) * 2;
  if (reserve >= demand) return 0;
  return Math.round(((demand - reserve) / 3) * 10) / 10;
}

/**
 * 計算建議稜鏡量 (Percival 公式)
 */
export function calculatePercivalPrism(biBreak: number, boBreak: number): number {
  const greater = Math.max(biBreak, boBreak);
  const lesser = Math.min(biBreak, boBreak);
  if (lesser >= greater / 3) return 0;
  return Math.round(((greater - 2 * lesser) / 3) * 10) / 10;
}

// ============= 多情境建議系統 =============

export type ClinicalScenario = 'A' | 'B' | 'C';

export interface ScenarioDescription {
  id: ClinicalScenario;
  title: string;
  subtitle: string;
  applicable: boolean;
  conditions: string[];
}

export type TreatmentMethod = 'VT' | 'PRISM' | 'OBSERVATION' | 'REFERRAL' | 'ADD_LENS';

export interface TreatmentOption {
  priority: number; // 1=優先, 2=次要, 3=備案
  method: TreatmentMethod;
  description: string;
  duration?: string;
  details: string[];
}

export interface ScenarioRecommendation {
  scenario: ScenarioDescription;
  treatments: TreatmentOption[];
  expectedOutcome: string;
  followUp: string;
}

/**
 * 判斷適用的臨床情境
 */
export function determineApplicableScenarios(
  ciss: number,
  age: number,
  primaryPattern: PrimaryDistancePattern,
  language: Language = 'zh-TW'
): ScenarioDescription[] {
  const t = createTranslator(language);
  const isHighSymptom = ciss >= 21;
  const isTrainableAge = age >= 7 && age <= 60;
  const isLowSymptom = ciss < 16;

  const scenarios: ScenarioDescription[] = [
    {
      id: 'A',
      title: t('情境 A：積極處置方案', '情境 A：积极处置方案', 'Scenario A: Active Treatment'),
      subtitle: t('症狀明顯 + 配合度高', '症状明显 + 配合度高', 'Significant symptoms + High compliance'),
      applicable: isHighSymptom && isTrainableAge,
      conditions: [
        t('CISS 分數 ≥ 21（症狀明顯）', 'CISS 分数 ≥ 21（症状明显）', 'CISS score ≥ 21 (significant symptoms)'),
        t('年齡適合視覺訓練（7-60 歲）', '年龄适合视觉训练（7-60 岁）', 'Age suitable for vision training (7-60 years)'),
        t('個案配合度高，願意執行訓練計畫', '个案配合度高，愿意执行训练计划', 'High compliance, willing to follow training plan')
      ]
    },
    {
      id: 'B',
      title: t('情境 B：務實處置方案', '情境 B：务实处置方案', 'Scenario B: Practical Treatment'),
      subtitle: t('症狀明顯 + 配合度低或時間有限', '症状明显 + 配合度低或时间有限', 'Significant symptoms + Low compliance or limited time'),
      applicable: isHighSymptom,
      conditions: [
        t('CISS 分數 ≥ 21（症狀明顯）', 'CISS 分数 ≥ 21（症状明显）', 'CISS score ≥ 21 (significant symptoms)'),
        t('個案配合度低、時間有限，或年齡較大', '个案配合度低、时间有限，或年龄较大', 'Low compliance, limited time, or older age'),
        t('需要快速緩解症狀', '需要快速缓解症状', 'Need quick symptom relief')
      ]
    },
    {
      id: 'C',
      title: t('情境 C：觀察追蹤方案', '情境 C：观察追踪方案', 'Scenario C: Monitor & Observe'),
      subtitle: t('症狀輕微 + 融像能力尚可', '症状轻微 + 融像能力尚可', 'Mild symptoms + Adequate fusion'),
      applicable: isLowSymptom,
      conditions: [
        t('CISS 分數 < 16（症狀輕微）', 'CISS 分数 < 16（症状轻微）', 'CISS score < 16 (mild symptoms)'),
        t('融像保留度通過 Sheard/Percival 檢驗', '融像保留度通过 Sheard/Percival 检验', 'Fusion reserves pass Sheard/Percival criteria'),
        t('暫不影響日常生活與學習', '暂不影响日常生活与学习', 'No significant impact on daily life')
      ]
    }
  ];

  return scenarios;
}

/**
 * 為特定情境生成處置建議
 */
export function generateScenarioRecommendation(
  scenario: ClinicalScenario,
  primaryPattern: PrimaryDistancePattern,
  prismRec: PrismRecommendation,
  ciss: number,
  age: number,
  language: Language = 'zh-TW'
): ScenarioRecommendation {
  const t = createTranslator(language);
  const scenarios = determineApplicableScenarios(ciss, age, primaryPattern, language);
  const scenarioDesc = scenarios.find(s => s.id === scenario) || scenarios[0];

  let treatments: TreatmentOption[] = [];
  let expectedOutcome = '';
  let followUp = '';

  // ============= CI 處置方案 =============
  if (primaryPattern === 'CI') {
    if (scenario === 'A') {
      treatments = [
        {
          priority: 1,
          method: 'VT',
          description: t('視覺訓練療程（優先選項）', '视觉训练疗程（优先选项）', 'Vision Training Program (Primary)'),
          duration: t('12-16 週，每週 2-3 次', '12-16 周，每周 2-3 次', '12-16 weeks, 2-3 times per week'),
          details: [
            t('辦公室訓練：BO vergence training、Brock string、電腦化訓練', 
              '办公室训练：BO vergence training、Brock string、电脑化训练',
              'Office training: BO vergence training, Brock string, computerized training'),
            t('居家訓練：pencil push-up、近距融像訓練卡',
              '居家训练：pencil push-up、近距融像训练卡',
              'Home training: pencil push-up, near fusion cards'),
            t('目標：提升 BO 融像保留度至 > 20Δ、改善 NPC 至 < 6 cm',
              '目标：提升 BO 融像保留度至 > 20Δ、改善 NPC 至 < 6 cm',
              'Goal: Improve BO reserves to > 20Δ, improve NPC to < 6 cm')
          ]
        },
        {
          priority: 2,
          method: 'PRISM',
          description: t('近用加入式稜鏡（訓練期間輔助）', '近用加入式棱镜（训练期间辅助）', 'Near Add Prism (Training Aid)'),
          details: [
            t(`建議度數：${prismRec.amount || 3}Δ BI（base-in）`,
              `建议度数：${prismRec.amount || 3}Δ BI（base-in）`,
              `Recommended: ${prismRec.amount || 3}Δ BI (base-in)`),
            t('用途：近距閱讀、3C 使用時配戴',
              '用途：近距阅读、3C 使用时配戴',
              'Use: For reading and digital device use'),
            t('作用：減輕訓練初期症狀，提升配合度',
              '作用：减轻训练初期症状，提升配合度',
              'Purpose: Reduce early training symptoms, improve compliance')
          ]
        }
      ];
      expectedOutcome = t('12-16 週後，80% 個案症狀明顯改善，融像能力提升',
        '12-16 周后，80% 个案症状明显改善，融像能力提升',
        'After 12-16 weeks, 80% of cases show significant symptom improvement and better fusion');
      followUp = t('每 4 週複檢一次，追蹤訓練效果與症狀變化',
        '每 4 周复检一次，追踪训练效果与症状变化',
        'Re-evaluate every 4 weeks to monitor training progress and symptoms');
    } else if (scenario === 'B') {
      treatments = [
        {
          priority: 1,
          method: 'PRISM',
          description: t('近用稜鏡為主要處置', '近用棱镜为主要处置', 'Near Prism as Primary Treatment'),
          details: [
            t(`建議度數：${prismRec.amount || 3}-${(prismRec.amount || 3) + 2}Δ BI`,
              `建议度数：${prismRec.amount || 3}-${(prismRec.amount || 3) + 2}Δ BI`,
              `Recommended: ${prismRec.amount || 3}-${(prismRec.amount || 3) + 2}Δ BI`),
            t('配戴時機：近距工作時全程配戴',
              '配戴时机：近距工作时全程配戴',
              'Wear: Full-time during near work'),
            t('優點：快速緩解症狀，無需每日訓練',
              '优点：快速缓解症状，无需每日训练',
              'Advantage: Quick symptom relief, no daily training required')
          ]
        },
        {
          priority: 2,
          method: 'VT',
          description: t('簡易居家訓練（選配）', '简易居家训练（选配）', 'Simple Home Training (Optional)'),
          details: [
            t('Pencil push-up：每日 5-10 分鐘',
              'Pencil push-up：每日 5-10 分钟',
              'Pencil push-up: 5-10 minutes daily'),
            t('Near-far focusing：改善調節靈活度',
              'Near-far focusing：改善调节灵活度',
              'Near-far focusing: Improve accommodative flexibility'),
            t('若配合度提升，可轉為完整訓練療程',
              '若配合度提升，可转为完整训练疗程',
              'If compliance improves, can switch to full training program')
          ]
        }
      ];
      expectedOutcome = t('稜鏡配戴後症狀立即減輕，長期需搭配訓練鞏固',
        '棱镜配戴后症状立即减轻，长期需搭配训练巩固',
        'Immediate symptom relief with prism; long-term training recommended');
      followUp = t('3 個月後複檢，評估是否需調整度數或轉為訓練',
        '3 个月后复检，评估是否需调整度数或转为训练',
        'Re-evaluate in 3 months to assess if adjustment or training is needed');
    } else {
      treatments = [
        {
          priority: 1,
          method: 'OBSERVATION',
          description: t('觀察追蹤，暫不積極處置', '观察追踪，暂不积极处置', 'Monitor, No Active Treatment'),
          details: [
            t('衛教：減少連續近距用眼時間（20-20-20 法則）',
              '卫教：减少连续近距用眼时间（20-20-20 法则）',
              'Education: Reduce continuous near work (20-20-20 rule)'),
            t('增加戶外活動，減少 3C 使用',
              '增加户外活动，减少 3C 使用',
              'Increase outdoor activities, reduce screen time'),
            t('注意症狀變化（頭痛、複視、閱讀困難加劇）',
              '注意症状变化（头痛、复视、阅读困难加剧）',
              'Watch for symptom changes (headache, diplopia, reading difficulty)')
          ]
        },
        {
          priority: 2,
          method: 'VT',
          description: t('若症狀惡化，考慮視覺訓練', '若症状恶化，考虑视觉训练', 'Consider VT if Symptoms Worsen'),
          details: [
            t('追蹤 3-6 個月',
              '追踪 3-6 个月',
              'Follow-up in 3-6 months'),
            t('CISS 分數若上升至 ≥ 21，建議開始訓練',
              'CISS 分数若上升至 ≥ 21，建议开始训练',
              'Start training if CISS score rises to ≥ 21')
          ]
        }
      ];
      expectedOutcome = t('多數輕症個案可自行代償，部分隨年齡增長需重新評估',
        '多数轻症个案可自行代偿，部分随年龄增长需重新评估',
        'Most mild cases self-compensate; some may need re-evaluation with age');
      followUp = t('6 個月後複檢，或症狀加劇時提早回診',
        '6 个月后复检，或症状加剧时提早回诊',
        'Re-evaluate in 6 months, or earlier if symptoms worsen');
    }
  }

  // ============= CE 處置方案 =============
  else if (primaryPattern === 'CE') {
    if (scenario === 'A') {
      treatments = [
        {
          priority: 1,
          method: 'VT',
          description: t('視覺訓練療程（BI vergence + 調節放鬆）', '视觉训练疗程（BI vergence + 调节放松）', 'Vision Training (BI Vergence + Accommodative Relaxation)'),
          duration: t('12-16 週', '12-16 周', '12-16 weeks'),
          details: [
            t('訓練重點：BI 融像範圍、負相對調節（NRA）',
              '训练重点：BI 融像范围、负相对调节（NRA）',
              'Focus: BI fusion range, negative relative accommodation (NRA)'),
            t('目標：降低近距內斜、改善調節靈活度',
              '目标：降低近距内斜、改善调节灵活度',
              'Goal: Reduce near esophoria, improve accommodative flexibility'),
            t('居家：調節放鬆訓練、遠近交替注視',
              '居家：调节放松训练、远近交替注视',
              'Home: Accommodative relaxation, distance-near alternating fixation')
          ]
        },
        {
          priority: 2,
          method: 'ADD_LENS',
          description: t('近用正加入度數（減輕調節負擔）', '近用正加入度数（减轻调节负担）', 'Near Plus Add (Reduce Accommodative Demand)'),
          details: [
            t('建議度數：+0.75 至 +1.50 D ADD',
              '建议度数：+0.75 至 +1.50 D ADD',
              'Recommended: +0.75 to +1.50 D ADD'),
            t('適用：高 AC/A 比值個案',
              '适用：高 AC/A 比值个案',
              'For: High AC/A ratio cases'),
            t('作用：減少調節性集合過度',
              '作用：减少调节性集合过度',
              'Purpose: Reduce accommodative convergence excess')
          ]
        }
      ];
      expectedOutcome = t('訓練後 AC/A 比值改善，近距內斜減輕',
        '训练后 AC/A 比值改善，近距内斜减轻',
        'After training, AC/A ratio improves, near esophoria reduces');
      followUp = t('每 4 週追蹤，觀察訓練進度',
        '每 4 周追踪，观察训练进度',
        'Follow-up every 4 weeks to monitor progress');
    } else if (scenario === 'B') {
      treatments = [
        {
          priority: 1,
          method: 'ADD_LENS',
          description: t('近用正加入度數為主', '近用正加入度数为主', 'Near Plus Add as Primary Treatment'),
          details: [
            t('建議度數：+1.00 至 +1.50 D ADD',
              '建议度数：+1.00 至 +1.50 D ADD',
              'Recommended: +1.00 to +1.50 D ADD'),
            t('快速緩解近距內斜症狀',
              '快速缓解近距内斜症状',
              'Quick relief from near esophoria symptoms'),
            t('可搭配漸進多焦或閱讀鏡片',
              '可搭配渐进多焦或阅读镜片',
              'Can use progressive or reading lenses')
          ]
        },
        {
          priority: 2,
          method: 'PRISM',
          description: t('近用稜鏡（BO base-out）', '近用棱镜（BO base-out）', 'Near Prism (BO base-out)'),
          details: [
            t(`建議度數：${prismRec.amount || 3}Δ BO`,
              `建议度数：${prismRec.amount || 3}Δ BO`,
              `Recommended: ${prismRec.amount || 3}Δ BO`),
            t('適用於 ADD 效果不佳時',
              '适用于 ADD 效果不佳时',
              'For cases where ADD is insufficient')
          ]
        }
      ];
      expectedOutcome = t('近距症狀快速緩解，但需持續配戴',
        '近距症状快速缓解，但需持续配戴',
        'Quick near symptom relief, but requires continued wear');
      followUp = t('3 個月後複檢，評估是否需調整度數',
        '3 个月后复检，评估是否需调整度数',
        'Re-evaluate in 3 months to assess if adjustment is needed');
    } else {
      treatments = [
        {
          priority: 1,
          method: 'OBSERVATION',
          description: t('觀察追蹤', '观察追踪', 'Monitor & Observe'),
          details: [
            t('衛教：適度休息、避免長時間近距工作',
              '卫教：适度休息、避免长时间近距工作',
              'Education: Take breaks, avoid prolonged near work'),
            t('注意症狀變化',
              '注意症状变化',
              'Watch for symptom changes')
          ]
        }
      ];
      expectedOutcome = t('輕症個案多可自行代償',
        '轻症个案多可自行代偿',
        'Most mild cases self-compensate');
      followUp = t('6 個月後追蹤',
        '6 个月后追踪',
        'Follow-up in 6 months');
    }
  }

  // ============= DE 處置方案 =============
  else if (primaryPattern === 'DE') {
    if (scenario === 'A') {
      treatments = [
        {
          priority: 1,
          method: 'VT',
          description: t('視覺訓練療程（遠距 BO 訓練）', '视觉训练疗程（远距 BO 训练）', 'Vision Training (Distance BO Training)'),
          duration: t('12-16 週', '12-16 周', '12-16 weeks'),
          details: [
            t('訓練重點：遠距 BO 融像範圍',
              '训练重点：远距 BO 融像范围',
              'Focus: Distance BO fusion range'),
            t('目標：提升遠距融像儲備',
              '目标：提升远距融像储备',
              'Goal: Improve distance fusion reserves'),
            t('可搭配負鏡片療法',
              '可搭配负镜片疗法',
              'Can combine with minus lens therapy')
          ]
        }
      ];
      expectedOutcome = t('遠距外斜症狀改善',
        '远距外斜症状改善',
        'Distance exophoria symptoms improve');
      followUp = t('每 4 週追蹤',
        '每 4 周追踪',
        'Follow-up every 4 weeks');
    } else if (scenario === 'B') {
      treatments = [
        {
          priority: 1,
          method: 'PRISM',
          description: t('遠用稜鏡（BI base-in）', '远用棱镜（BI base-in）', 'Distance Prism (BI base-in)'),
          details: [
            t(`建議度數：${prismRec.amount || 3}Δ BI`,
              `建议度数：${prismRec.amount || 3}Δ BI`,
              `Recommended: ${prismRec.amount || 3}Δ BI`),
            t('僅用於遠距配戴',
              '仅用于远距配戴',
              'For distance wear only'),
            t('近距眼位正常，不需近用稜鏡',
              '近距眼位正常，不需近用棱镜',
              'Near phoria is normal, no near prism needed')
          ]
        }
      ];
      expectedOutcome = t('遠距複視/疲勞緩解',
        '远距复视/疲劳缓解',
        'Distance diplopia/fatigue relieved');
      followUp = t('3 個月後複檢',
        '3 个月后复检',
        'Re-evaluate in 3 months');
    } else {
      treatments = [
        {
          priority: 1,
          method: 'OBSERVATION',
          description: t('觀察追蹤', '观察追踪', 'Monitor & Observe'),
          details: [
            t('定期追蹤遠距眼位變化',
              '定期追踪远距眼位变化',
              'Regularly monitor distance phoria changes')
          ]
        }
      ];
      expectedOutcome = t('輕症多可自行代償',
        '轻症多可自行代偿',
        'Most mild cases self-compensate');
      followUp = t('6 個月後追蹤',
        '6 个月后追踪',
        'Follow-up in 6 months');
    }
  }

  // ============= DI 處置方案 =============
  else if (primaryPattern === 'DI') {
    if (scenario === 'A' || scenario === 'B') {
      treatments = [
        {
          priority: 1,
          method: 'PRISM',
          description: t('遠用稜鏡（BO base-out）為主要處置', '远用棱镜（BO base-out）为主要处置', 'Distance Prism (BO base-out) as Primary Treatment'),
          details: [
            t(`建議度數：${prismRec.amount || 3}Δ BO`,
              `建议度数：${prismRec.amount || 3}Δ BO`,
              `Recommended: ${prismRec.amount || 3}Δ BO`),
            t('DI 對視覺訓練反應較差，稜鏡為首選',
              'DI 对视觉训练反应较差，棱镜为首选',
              'DI responds poorly to VT; prism is first-line'),
            t('可考慮全天配戴或僅遠用',
              '可考虑全天配戴或仅远用',
              'Consider full-time or distance-only wear')
          ]
        },
        {
          priority: 2,
          method: 'VT',
          description: t('遠距 BI 訓練（輔助）', '远距 BI 训练（辅助）', 'Distance BI Training (Adjunct)'),
          details: [
            t('可嘗試但效果有限',
              '可尝试但效果有限',
              'Can try but limited effectiveness'),
            t('主要用於減少稜鏡依賴',
              '主要用于减少棱镜依赖',
              'Mainly to reduce prism dependence')
          ]
        }
      ];
      expectedOutcome = t('稜鏡配戴後遠距複視症狀緩解',
        '棱镜配戴后远距复视症状缓解',
        'Distance diplopia relieved with prism');
      followUp = t('1-3 個月後複檢，調整度數',
        '1-3 个月后复检，调整度数',
        'Re-evaluate in 1-3 months, adjust power');
    } else {
      treatments = [
        {
          priority: 1,
          method: 'OBSERVATION',
          description: t('追蹤觀察', '追踪观察', 'Monitor & Observe'),
          details: [
            t('注意遠距複視症狀',
              '注意远距复视症状',
              'Watch for distance diplopia symptoms')
          ]
        }
      ];
      expectedOutcome = t('輕症可觀察',
        '轻症可观察',
        'Mild cases can be monitored');
      followUp = t('6 個月後追蹤',
        '6 个月后追踪',
        'Follow-up in 6 months');
    }
  }

  // ============= BX 處置方案 =============
  else if (primaryPattern === 'BX') {
    if (scenario === 'A') {
      treatments = [
        {
          priority: 1,
          method: 'VT',
          description: t('視覺訓練療程（BO 聚散訓練）', '视觉训练疗程（BO 聚散训练）', 'Vision Training (BO Vergence Training)'),
          duration: t('12-16 週', '12-16 周', '12-16 weeks'),
          details: [
            t('訓練遠近距 BO 融像範圍',
              '训练远近距 BO 融像范围',
              'Train BO fusion range at all distances'),
            t('目標：提升整體融像儲備',
              '目标：提升整体融像储备',
              'Goal: Improve overall fusion reserves')
          ]
        },
        {
          priority: 2,
          method: 'PRISM',
          description: t('全天稜鏡（訓練輔助）', '全天棱镜（训练辅助）', 'Full-time Prism (Training Aid)'),
          details: [
            t(`建議度數：${prismRec.amount || 3}Δ BI 全天配戴`,
              `建议度数：${prismRec.amount || 3}Δ BI 全天配戴`,
              `Recommended: ${prismRec.amount || 3}Δ BI full-time`),
            t('減輕訓練期間症狀',
              '减轻训练期间症状',
              'Reduce symptoms during training')
          ]
        }
      ];
      expectedOutcome = t('融像能力全面提升',
        '融像能力全面提升',
        'Overall fusion ability improves');
      followUp = t('每 4 週追蹤',
        '每 4 周追踪',
        'Follow-up every 4 weeks');
    } else if (scenario === 'B') {
      treatments = [
        {
          priority: 1,
          method: 'PRISM',
          description: t('全天稜鏡為主要處置', '全天棱镜为主要处置', 'Full-time Prism as Primary Treatment'),
          details: [
            t(`建議度數：${prismRec.amount || 3}-${(prismRec.amount || 3) + 2}Δ BI`,
              `建议度数：${prismRec.amount || 3}-${(prismRec.amount || 3) + 2}Δ BI`,
              `Recommended: ${prismRec.amount || 3}-${(prismRec.amount || 3) + 2}Δ BI`),
            t('遠近皆需配戴',
              '远近皆需配戴',
              'Wear for both distance and near'),
            t('快速緩解全天症狀',
              '快速缓解全天症状',
              'Quick relief from all-day symptoms')
          ]
        }
      ];
      expectedOutcome = t('全天症狀緩解',
        '全天症状缓解',
        'All-day symptoms relieved');
      followUp = t('3 個月後複檢',
        '3 个月后复检',
        'Re-evaluate in 3 months');
    } else {
      treatments = [
        {
          priority: 1,
          method: 'OBSERVATION',
          description: t('觀察追蹤', '观察追踪', 'Monitor & Observe'),
          details: [
            t('追蹤症狀變化',
              '追踪症状变化',
              'Monitor symptom changes')
          ]
        }
      ];
      expectedOutcome = t('輕症可觀察',
        '轻症可观察',
        'Mild cases can be monitored');
      followUp = t('6 個月後追蹤',
        '6 个月后追踪',
        'Follow-up in 6 months');
    }
  }

  // ============= BE 處置方案 =============
  else if (primaryPattern === 'BE') {
    if (scenario === 'A') {
      treatments = [
        {
          priority: 1,
          method: 'VT',
          description: t('視覺訓練療程（BI 聚散訓練）', '视觉训练疗程（BI 聚散训练）', 'Vision Training (BI Vergence Training)'),
          duration: t('12-16 週', '12-16 周', '12-16 weeks'),
          details: [
            t('訓練遠近距 BI 融像範圍',
              '训练远近距 BI 融像范围',
              'Train BI fusion range at all distances'),
            t('目標：提升負融像儲備',
              '目标：提升负融像储备',
              'Goal: Improve negative fusional reserves')
          ]
        }
      ];
      expectedOutcome = t('負融像能力提升',
        '负融像能力提升',
        'Negative fusional ability improves');
      followUp = t('每 4 週追蹤',
        '每 4 周追踪',
        'Follow-up every 4 weeks');
    } else if (scenario === 'B') {
      treatments = [
        {
          priority: 1,
          method: 'PRISM',
          description: t('全天稜鏡為主要處置', '全天棱镜为主要处置', 'Full-time Prism as Primary Treatment'),
          details: [
            t(`建議度數：${prismRec.amount || 3}Δ BO 全天配戴`,
              `建议度数：${prismRec.amount || 3}Δ BO 全天配戴`,
              `Recommended: ${prismRec.amount || 3}Δ BO full-time`),
            t('快速緩解內斜症狀',
              '快速缓解内斜症状',
              'Quick relief from esophoria symptoms')
          ]
        }
      ];
      expectedOutcome = t('全天症狀緩解',
        '全天症状缓解',
        'All-day symptoms relieved');
      followUp = t('3 個月後複檢',
        '3 个月后复检',
        'Re-evaluate in 3 months');
    } else {
      treatments = [
        {
          priority: 1,
          method: 'OBSERVATION',
          description: t('觀察追蹤', '观察追踪', 'Monitor & Observe'),
          details: [
            t('追蹤症狀變化',
              '追踪症状变化',
              'Monitor symptom changes')
          ]
        }
      ];
      expectedOutcome = t('輕症可觀察',
        '轻症可观察',
        'Mild cases can be monitored');
      followUp = t('6 個月後追蹤',
        '6 个月后追踪',
        'Follow-up in 6 months');
    }
  }

  // ============= NORMAL 處置方案 =============
  else if (primaryPattern === 'NORMAL') {
    treatments = [
      {
        priority: 1,
        method: 'OBSERVATION',
        description: t('無需特別處置', '无需特别处置', 'No Special Treatment Needed'),
        details: [
          t('眼位與融像能力在正常範圍',
            '眼位与融像能力在正常范围',
            'Phoria and fusion within normal limits'),
          t('若有症狀，追蹤觀察',
            '若有症状，追踪观察',
            'Monitor if symptomatic')
        ]
      }
    ];
    expectedOutcome = t('維持良好雙眼視覺功能',
      '维持良好双眼视觉功能',
      'Maintain good binocular function');
    followUp = t('年度追蹤即可',
      '年度追踪即可',
      'Annual follow-up is sufficient');
  }

  // ============= OTHER/預設 =============
  else {
    treatments = [
      {
        priority: 1,
        method: 'OBSERVATION',
        description: t('個別評估，依症狀與個案需求調整', '个别评估，依症状与个案需求调整', 'Individual Assessment Based on Symptoms'),
        details: [
          t('需進一步臨床評估',
            '需进一步临床评估',
            'Further clinical evaluation needed')
        ]
      }
    ];
    expectedOutcome = t('需進一步臨床評估',
      '需进一步临床评估',
      'Further clinical evaluation needed');
    followUp = t('3-6 個月追蹤',
      '3-6 个月追踪',
      'Follow-up in 3-6 months');
  }

  return {
    scenario: scenarioDesc,
    treatments,
    expectedOutcome,
    followUp
  };
}

/**
 * 為所有適用情境生成建議
 */
export function generateAllScenarioRecommendations(
  primaryPattern: PrimaryDistancePattern,
  prismRec: PrismRecommendation,
  ciss: number,
  age: number,
  language: Language = 'zh-TW'
): ScenarioRecommendation[] {
  const scenarios: ClinicalScenario[] = ['A', 'B', 'C'];
  return scenarios.map(s => generateScenarioRecommendation(s, primaryPattern, prismRec, ciss, age, language));
}
