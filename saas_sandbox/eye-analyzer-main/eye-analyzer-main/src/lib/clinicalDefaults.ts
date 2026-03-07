// Clinical default values and normal ranges based on literature

export interface AgeBasedDefaults {
  aa: number;        // Accommodative Amplitude
  add: number;       // ADD power
  npc: number;       // Near Point of Convergence
  vf: number;        // Vergence Facility
  stereo: number;    // Stereopsis
}

// Calculate age-based defaults using clinical formulas
export const getAgeBasedDefaults = (age: number): AgeBasedDefaults => {
  // Hofstetter's formula for AA: 18.5 - (0.3 × age)
  const aa = Math.max(0, Number((18.5 - 0.3 * age).toFixed(2)));

  // ADD power based on age
  let add = 0;
  if (age < 40) add = 0;
  else if (age <= 42) add = 0.75;
  else if (age <= 45) add = 1.0;
  else if (age <= 47) add = 1.25;
  else if (age <= 50) add = 1.5;
  else if (age <= 52) add = 1.75;
  else if (age <= 55) add = 2.0;
  else if (age <= 57) add = 2.25;
  else if (age <= 60) add = 2.5;
  else add = 2.75;

  // NPC based on age
  let npc = 5;
  if (age < 40) npc = 5;
  else if (age <= 60) npc = 6;
  else npc = 7;

  // Vergence Facility based on age
  let vf = 15;
  if (age < 40) vf = 15;
  else if (age <= 60) vf = 12;
  else vf = 9;

  // Stereopsis based on age
  let stereo = 40;
  if (age < 40) stereo = 40;
  else if (age <= 60) stereo = 50;
  else stereo = 60;

  return { aa, add, npc, vf, stereo };
};

// Value status types
export type ValueStatus = 'normal' | 'warning' | 'abnormal';

// Enhanced clinical range with detailed info
export interface ClinicalNormalRange {
  name: string;
  nameZhTW: string;
  nameZhCN: string;
  normalMin?: number;
  normalMax?: number;
  warningMin?: number;
  warningMax?: number;
  isInverted?: boolean; // Lower values are better (e.g., NPC, stereo)
  reference?: string;
  referenceSource?: string;
  sampleSize?: string;
  clinicalSignificance?: string;
  clinicalSignificanceZhTW?: string;
  clinicalSignificanceZhCN?: string;
}

export const clinicalRanges: Record<string, ClinicalNormalRange> = {
  ciss_child: {
    name: 'CISS (Child)',
    nameZhTW: 'CISS 症狀問卷 (兒童)',
    nameZhCN: 'CISS 症状问卷 (儿童)',
    normalMax: 15,
    reference: '< 16',
    referenceSource: 'Borsting et al., 2003; CITT Study',
    sampleSize: 'N=392',
    clinicalSignificance: 'Evaluates visual discomfort symptoms, ≥16 indicates possible CI',
    clinicalSignificanceZhTW: '評估視覺不適症狀，≥16分提示可能有集合不足',
    clinicalSignificanceZhCN: '评估视觉不适症状，≥16分提示可能有集合不足'
  },
  ciss_adult: {
    name: 'CISS (Adult)',
    nameZhTW: 'CISS 症狀問卷 (成人)',
    nameZhCN: 'CISS 症状问卷 (成人)',
    normalMax: 20,
    reference: '< 21',
    referenceSource: 'Rouse et al., 2004; CITT Study',
    sampleSize: 'N=221',
    clinicalSignificance: 'Evaluates visual discomfort symptoms, ≥21 indicates possible CI',
    clinicalSignificanceZhTW: '評估視覺不適症狀，≥21分提示可能有集合不足',
    clinicalSignificanceZhCN: '评估视觉不适症状，≥21分提示可能有集合不足'
  },
  stereo: {
    name: 'Stereopsis',
    nameZhTW: '立體視',
    nameZhCN: '立体视',
    normalMax: 70,
    warningMax: 100,
    isInverted: true,
    reference: '≤ 70"',
    referenceSource: 'Wajuihian 2018',
    sampleSize: 'N=1056',
    clinicalSignificance: 'Evaluates binocular depth perception',
    clinicalSignificanceZhTW: '評估雙眼立體深度知覺',
    clinicalSignificanceZhCN: '评估双眼立体深度知觉'
  },
  bcc: {
    name: 'BCC (Binocular Cross Cylinder)',
    nameZhTW: 'BCC 雙眼交叉柱鏡',
    nameZhCN: 'BCC 双眼交叉柱镜',
    normalMin: 0.25,
    normalMax: 0.75,
    warningMax: 1.0,
    reference: '+0.25 ~ +0.75D',
    referenceSource: 'Scheiman & Wick 2014',
    sampleSize: 'N=1056',
    clinicalSignificance: 'Evaluates binocular accommodative response using cross cylinder',
    clinicalSignificanceZhTW: '使用交叉柱鏡評估雙眼調節反應',
    clinicalSignificanceZhCN: '使用交叉柱镜评估双眼调节反应'
  },
  nra: {
    name: 'NRA',
    nameZhTW: 'NRA 負相對調節',
    nameZhCN: 'NRA 负相对调节',
    normalMin: 1.75,
    normalMax: 2.5,
    reference: '+1.75 ~ +2.50D',
    referenceSource: 'Wajuihian 2018',
    sampleSize: 'N=1056',
    clinicalSignificance: 'Evaluates ability to relax accommodation',
    clinicalSignificanceZhTW: '評估調節放鬆能力',
    clinicalSignificanceZhCN: '评估调节放松能力'
  },
  pra: {
    name: 'PRA',
    nameZhTW: 'PRA 正相對調節',
    nameZhCN: 'PRA 正相对调节',
    normalMin: 2.0,
    normalMax: 3.0,
    reference: '-2.0 ~ -3.0D',
    referenceSource: 'Scheiman & Wick 2014',
    clinicalSignificance: 'Evaluates ability to stimulate accommodation',
    clinicalSignificanceZhTW: '評估調節刺激能力',
    clinicalSignificanceZhCN: '评估调节刺激能力'
  },
  npc: {
    name: 'NPC',
    nameZhTW: 'NPC 近點集合',
    nameZhCN: 'NPC 近点集合',
    normalMax: 7,
    warningMax: 10,
    isInverted: true,
    reference: '≤ 7cm',
    referenceSource: 'Scheiman & Wick 2014',
    clinicalSignificance: 'Evaluates convergence ability, >10cm indicates CI',
    clinicalSignificanceZhTW: '評估集合能力，>10cm提示集合不足',
    clinicalSignificanceZhCN: '评估集合能力，>10cm提示集合不足'
  },
  vf: {
    name: 'Vergence Facility',
    nameZhTW: 'VF 融像靈活度',
    nameZhCN: 'VF 融像灵活度',
    normalMin: 15,
    warningMin: 10,
    reference: '≥ 15 cpm',
    referenceSource: 'Gall et al., 1998',
    clinicalSignificance: 'Evaluates speed of vergence changes',
    clinicalSignificanceZhTW: '評估融像轉換速度',
    clinicalSignificanceZhCN: '评估融像转换速度'
  },
  flipper: {
    name: 'Accommodative Facility',
    nameZhTW: 'Flipper 調節靈活度',
    nameZhCN: 'Flipper 调节灵活度',
    normalMin: 11,
    warningMin: 8,
    reference: '≥ 11 cpm',
    referenceSource: 'Zellers et al., 1984',
    clinicalSignificance: 'Evaluates speed of focus changes',
    clinicalSignificanceZhTW: '評估調節轉換速度',
    clinicalSignificanceZhCN: '评估调节转换速度'
  },
  distPhoria: {
    name: 'Distance Phoria',
    nameZhTW: '遠距眼位',
    nameZhCN: '远距眼位',
    normalMin: -2,
    normalMax: 0,
    reference: 'Ortho ~ 2Δ exo',
    referenceSource: 'Morgan 1944',
    clinicalSignificance: 'Evaluates eye alignment at distance',
    clinicalSignificanceZhTW: '評估遠距離眼位對齊',
    clinicalSignificanceZhCN: '评估远距离眼位对齐'
  },
  nearPhoria: {
    name: 'Near Phoria',
    nameZhTW: '近距眼位',
    nameZhCN: '近距眼位',
    normalMin: -6,
    normalMax: -2.5,
    reference: '3 ~ 6Δ exo',
    referenceSource: 'Morgan 1944',
    clinicalSignificance: 'Evaluates eye alignment at near',
    clinicalSignificanceZhTW: '評估近距離眼位對齊',
    clinicalSignificanceZhCN: '评估近距离眼位对齐'
  },
  // Near Fusional Vergence Reserves - Wajuihian 2018
  nearBiBreak: {
    name: 'Near BI Break',
    nameZhTW: '近距 BI 破裂點',
    nameZhCN: '近距 BI 破裂点',
    normalMin: 12,
    normalMax: 23,
    reference: '12-23Δ',
    referenceSource: 'Wajuihian 2018',
    sampleSize: 'N=1056',
    clinicalSignificance: 'Evaluates negative fusional vergence reserve',
    clinicalSignificanceZhTW: '評估負向融像儲備，低於12Δ可能有融像困難',
    clinicalSignificanceZhCN: '评估负向融像储备，低于12Δ可能有融像困难'
  },
  nearBiRec: {
    name: 'Near BI Recovery',
    nameZhTW: '近距 BI 恢復點',
    nameZhCN: '近距 BI 恢复点',
    normalMin: 8,
    normalMax: 17,
    reference: '8-17Δ',
    referenceSource: 'Wajuihian 2018',
    sampleSize: 'N=1056',
    clinicalSignificance: 'Recovery point for negative fusional vergence',
    clinicalSignificanceZhTW: '負向融像恢復點',
    clinicalSignificanceZhCN: '负向融像恢复点'
  },
  nearBoBreak: {
    name: 'Near BO Break',
    nameZhTW: '近距 BO 破裂點',
    nameZhCN: '近距 BO 破裂点',
    normalMin: 16,
    normalMax: 35,
    reference: '16-35Δ',
    referenceSource: 'Wajuihian 2018',
    sampleSize: 'N=1056',
    clinicalSignificance: 'Evaluates positive fusional vergence reserve',
    clinicalSignificanceZhTW: '評估正向融像儲備，低於16Δ可能有融像困難',
    clinicalSignificanceZhCN: '评估正向融像储备，低于16Δ可能有融像困难'
  },
  nearBoRec: {
    name: 'Near BO Recovery',
    nameZhTW: '近距 BO 恢復點',
    nameZhCN: '近距 BO 恢复点',
    normalMin: 11,
    normalMax: 24,
    reference: '11-24Δ',
    referenceSource: 'Wajuihian 2018',
    sampleSize: 'N=1056',
    clinicalSignificance: 'Recovery point for positive fusional vergence',
    clinicalSignificanceZhTW: '正向融像恢復點',
    clinicalSignificanceZhCN: '正向融像恢复点'
  },
  // Distance Fusional Vergence Reserves - Morgan Norms + COMET Study
  distBiBreak: {
    name: 'Distance BI Break',
    nameZhTW: '遠距 BI 破裂點',
    nameZhCN: '远距 BI 破裂点',
    normalMin: 4,
    normalMax: 10,
    reference: '4-10Δ',
    referenceSource: 'Morgan 1944; COMET Study',
    clinicalSignificance: 'Evaluates distance negative fusional vergence',
    clinicalSignificanceZhTW: '評估遠距負向融像儲備',
    clinicalSignificanceZhCN: '评估远距负向融像储备'
  },
  distBiRec: {
    name: 'Distance BI Recovery',
    nameZhTW: '遠距 BI 恢復點',
    nameZhCN: '远距 BI 恢复点',
    normalMin: 2,
    normalMax: 6,
    reference: '2-6Δ',
    referenceSource: 'Morgan 1944; COMET Study',
    clinicalSignificance: 'Recovery point for distance negative fusional vergence',
    clinicalSignificanceZhTW: '遠距負向融像恢復點',
    clinicalSignificanceZhCN: '远距负向融像恢复点'
  },
  distBoBreak: {
    name: 'Distance BO Break',
    nameZhTW: '遠距 BO 破裂點',
    nameZhCN: '远距 BO 破裂点',
    normalMin: 11,
    normalMax: 27,
    reference: '11-27Δ',
    referenceSource: 'Morgan 1944; COMET Study',
    clinicalSignificance: 'Evaluates distance positive fusional vergence',
    clinicalSignificanceZhTW: '評估遠距正向融像儲備',
    clinicalSignificanceZhCN: '评估远距正向融像储备'
  },
  distBoRec: {
    name: 'Distance BO Recovery',
    nameZhTW: '遠距 BO 恢復點',
    nameZhCN: '远距 BO 恢复点',
    normalMin: 6,
    normalMax: 14,
    reference: '6-14Δ',
    referenceSource: 'Morgan 1944; COMET Study',
    clinicalSignificance: 'Recovery point for distance positive fusional vergence',
    clinicalSignificanceZhTW: '遠距正向融像恢復點',
    clinicalSignificanceZhCN: '远距正向融像恢复点'
  }
};

// Get value status based on clinical ranges
export const getValueStatus = (
  value: number,
  rangeKey: string,
  age?: number
): ValueStatus => {
  // Special case for CISS
  if (rangeKey === 'ciss') {
    const threshold = age && age < 18 ? 16 : 21;
    return value < threshold ? 'normal' : 'abnormal';
  }

  // Special case for BCC (with age-based evaluation)
  // Also handle 'mem' key for backwards compatibility
  if (rangeKey === 'bcc' || rangeKey === 'mem') {
    // Age >= 40: relaxed standards
    if (age !== undefined && age >= 40) {
      if (value > 1.5) return 'abnormal';  // Significant lag
      return 'normal';  // Reference value for presbyopes
    }
    // Standard evaluation
    if (value >= 0.25 && value <= 0.75) return 'normal';
    if (value < -0.25) return 'abnormal';  // Lead
    if (value > 1.0) return 'abnormal';    // High Lag
    if (value >= 0 && value <= 1.0) return 'warning';  // Borderline
    return 'warning';
  }

  const range = clinicalRanges[rangeKey];
  if (!range) return 'normal';

  const { normalMin, normalMax, warningMin, warningMax, isInverted } = range;

  // For inverted ranges (lower is better)
  if (isInverted) {
    if (normalMax !== undefined && value <= normalMax) return 'normal';
    if (warningMax !== undefined && value <= warningMax) return 'warning';
    return 'abnormal';
  }

  // Standard ranges
  const inNormal =
    (normalMin === undefined || value >= normalMin) &&
    (normalMax === undefined || value <= normalMax);
  if (inNormal) return 'normal';

  const inWarning =
    (warningMin === undefined || value >= warningMin) &&
    (warningMax === undefined || value <= warningMax);
  if (inWarning) return 'warning';

  return 'abnormal';
};

// Get status color classes
export const getStatusColorClass = (status: ValueStatus): string => {
  switch (status) {
    case 'normal':
      return 'bg-success/10 border-success/30';
    case 'warning':
      return 'bg-warning/10 border-warning/30';
    case 'abnormal':
      return 'bg-destructive/10 border-destructive/30';
    default:
      return '';
  }
};

// Get tooltip content for a clinical parameter
export const getClinicalTooltip = (rangeKey: string, age?: number, language: string = 'zh-TW'): { 
  range: string; 
  source: string;
  sampleSize?: string;
  clinicalSignificance?: string;
} | null => {
  if (rangeKey === 'ciss') {
    const threshold = age && age < 18 ? 16 : 21;
    const isChild = age && age < 18;
    return {
      range: isChild ? '< 16' : '< 21',
      source: 'Borsting et al., 2003; CITT Study',
      sampleSize: isChild ? 'N=392' : 'N=221',
      clinicalSignificance: language === 'zh-TW' 
        ? (isChild ? '評估視覺不適症狀，≥16分提示可能有集合不足' : '評估視覺不適症狀，≥21分提示可能有集合不足')
        : (isChild ? '评估视觉不适症状，≥16分提示可能有集合不足' : '评估视觉不适症状，≥21分提示可能有集合不足')
    };
  }

  const range = clinicalRanges[rangeKey];
  if (!range) return null;

  return {
    range: range.reference || '',
    source: range.referenceSource || '',
    sampleSize: range.sampleSize,
    clinicalSignificance: language === 'zh-TW' ? range.clinicalSignificanceZhTW : range.clinicalSignificanceZhCN
  };
};

// Default values for new customer reset
export const getDefaultResetValues = () => ({
  // Patient info
  patientCode: '',
  patientGender: 'male' as const,
  age: 36,
  
  // Basic
  pd: 64,
  ciss: 0,
  stereo: 70,
  workDist: 40,
  harmonDist: 0,
  
  // Refraction
  odSph: 0,
  odCyl: 0,
  odAx: 180,
  osSph: 0,
  osCyl: 0,
  osAx: 180,
  add: 0,
  
  // Accommodation (will be recalculated based on age)
  aaOD: 0,
  aaOS: 0,
  nra: 0,
  pra: 0,
  mem: 0,
  flipper: 0,
  
  // Vergence
  dist: 0,    // Ortho
  near: -3,   // 3Δ exo (default normal)
  vert: 0,
  npc: 5,
  vergenceFacility: 15,
  vergenceFacilityAborted: false,
  
  // Near fusion reserves - Wajuihian 2018 defaults
  biB: 12,
  biR: 12,
  boB: 20,
  boR: 15,
  
  // Distance fusion reserves - Morgan norms defaults
  distBiB: 7,
  distBiR: 4,
  distBoB: 20,  // Updated from 9 to 20 per Morgan norms
  distBoR: 10,
  
  // Gradient
  useGradient: false,
  gradPhoria: null,
});

// Generate new patient code with timestamp
export const generateNewPatientCode = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `P-${year}${month}${day}-${random}`;
};

// Literature references data for the reference modal
export interface LiteratureReference {
  category: string;
  categoryZhTW: string;
  categoryZhCN: string;
  references: {
    parameter: string;
    parameterZhTW: string;
    parameterZhCN: string;
    normalRange: string;
    source: string;
    year?: string;
    sampleSize?: string;
    notes?: string;
    notesZhTW?: string;
    notesZhCN?: string;
  }[];
}

export const literatureReferences: LiteratureReference[] = [
  {
    category: 'Accommodation Tests',
    categoryZhTW: '調節功能測試',
    categoryZhCN: '调节功能测试',
    references: [
      {
        parameter: 'Accommodative Amplitude',
        parameterZhTW: '調節幅度 (AA)',
        parameterZhCN: '调节幅度 (AA)',
        normalRange: '18.5 - (0.3 × age)',
        source: 'Hofstetter HW',
        year: '1950',
        notes: 'Minimum amplitude formula',
        notesZhTW: '最小調節幅度公式',
        notesZhCN: '最小调节幅度公式'
      },
      {
        parameter: 'NRA/PRA',
        parameterZhTW: 'NRA/PRA 相對調節',
        parameterZhCN: 'NRA/PRA 相对调节',
        normalRange: 'NRA +1.75~+2.50D, PRA -2.0~-3.0D',
        source: 'Wajuihian SO',
        year: '2018',
        sampleSize: 'N=1056',
        notes: 'J Optom',
        notesZhTW: '刊載於 J Optom 期刊',
        notesZhCN: '刊载于 J Optom 期刊'
      },
      {
        parameter: 'MEM Retinoscopy',
        parameterZhTW: 'MEM 動態檢影',
        parameterZhCN: 'MEM 动态检影',
        normalRange: '0 ~ +0.75D',
        source: 'Wajuihian SO',
        year: '2018',
        sampleSize: 'N=1056'
      },
      {
        parameter: 'Accommodative Facility',
        parameterZhTW: '調節靈活度 (Flipper)',
        parameterZhCN: '调节灵活度 (Flipper)',
        normalRange: '≥ 11 cpm',
        source: 'Zellers et al.',
        year: '1984'
      }
    ]
  },
  {
    category: 'Fusional Vergence Reserves',
    categoryZhTW: '融像儲備',
    categoryZhCN: '融像储备',
    references: [
      {
        parameter: 'Near BI Break/Recovery',
        parameterZhTW: '近距 BI 破裂/恢復',
        parameterZhCN: '近距 BI 破裂/恢复',
        normalRange: 'Break: 12-23Δ, Rec: 8-17Δ',
        source: 'Wajuihian SO',
        year: '2018',
        sampleSize: 'N=1056'
      },
      {
        parameter: 'Near BO Break/Recovery',
        parameterZhTW: '近距 BO 破裂/恢復',
        parameterZhCN: '近距 BO 破裂/恢复',
        normalRange: 'Break: 16-35Δ, Rec: 11-24Δ',
        source: 'Wajuihian SO',
        year: '2018',
        sampleSize: 'N=1056'
      },
      {
        parameter: 'Distance BI Break/Recovery',
        parameterZhTW: '遠距 BI 破裂/恢復',
        parameterZhCN: '远距 BI 破裂/恢复',
        normalRange: 'Break: 4-10Δ, Rec: 2-6Δ',
        source: 'Morgan MW',
        year: '1944',
        notes: 'Am J Optom + COMET Study',
        notesZhTW: '發表於 Am J Optom 及 COMET 研究',
        notesZhCN: '发表于 Am J Optom 及 COMET 研究'
      },
      {
        parameter: 'Distance BO Break/Recovery',
        parameterZhTW: '遠距 BO 破裂/恢復',
        parameterZhCN: '远距 BO 破裂/恢复',
        normalRange: 'Break: 11-27Δ, Rec: 6-14Δ',
        source: 'Morgan MW; COMET Study',
        year: '1944; 2011',
        notes: 'Anderson HA et al.',
        notesZhTW: 'COMET 研究縱貫追蹤',
        notesZhCN: 'COMET 研究纵贯追踪'
      }
    ]
  },
  {
    category: 'CISS Score',
    categoryZhTW: 'CISS 症狀評分',
    categoryZhCN: 'CISS 症状评分',
    references: [
      {
        parameter: 'Child Threshold',
        parameterZhTW: '兒童閾值',
        parameterZhCN: '儿童阈值',
        normalRange: '< 16',
        source: 'Borsting et al.; CITT Study',
        year: '2003',
        sampleSize: 'N=392',
        notes: 'Convergence Insufficiency Treatment Trial',
        notesZhTW: '集合不足治療試驗',
        notesZhCN: '集合不足治疗试验'
      },
      {
        parameter: 'Adult Threshold',
        parameterZhTW: '成人閾值',
        parameterZhCN: '成人阈值',
        normalRange: '< 21',
        source: 'Rouse MW et al.; CITT Study',
        year: '2004',
        sampleSize: 'N=221'
      }
    ]
  },
  {
    category: 'ADD Power (Presbyopia)',
    categoryZhTW: 'ADD 下加光 (老花)',
    categoryZhCN: 'ADD 下加光 (老花)',
    references: [
      {
        parameter: 'Age-based ADD Chart',
        parameterZhTW: '年齡對照表',
        parameterZhCN: '年龄对照表',
        normalRange: '40-42y: +0.75D ... >60y: +2.75D',
        source: 'Borish; Eyes On Eyecare',
        year: '2006; 2023',
        notes: 'Presbyopia Guidelines',
        notesZhTW: '老花配鏡指南',
        notesZhCN: '老花配镜指南'
      }
    ]
  },
  {
    category: 'Vergence Facility',
    categoryZhTW: '融像靈活度',
    categoryZhCN: '融像灵活度',
    references: [
      {
        parameter: 'VF Normal Value',
        parameterZhTW: 'VF 正常值',
        parameterZhCN: 'VF 正常值',
        normalRange: '≥ 15 cpm (< 40y), ≥ 12 cpm (40-60y), ≥ 9 cpm (> 60y)',
        source: 'Gall et al.',
        year: '1998',
        notes: 'Age-adjusted norms',
        notesZhTW: '依年齡調整之標準',
        notesZhCN: '依年龄调整之标准'
      }
    ]
  },
  {
    category: 'Phoria',
    categoryZhTW: '眼位',
    categoryZhCN: '眼位',
    references: [
      {
        parameter: 'Distance Phoria',
        parameterZhTW: '遠距眼位',
        parameterZhCN: '远距眼位',
        normalRange: 'Ortho ~ 2Δ exo',
        source: 'Morgan MW',
        year: '1944',
        notes: 'Am J Optom',
        notesZhTW: 'Morgan 常模',
        notesZhCN: 'Morgan 常模'
      },
      {
        parameter: 'Near Phoria',
        parameterZhTW: '近距眼位',
        parameterZhCN: '近距眼位',
        normalRange: '3 ~ 6Δ exo',
        source: 'Morgan MW',
        year: '1944'
      }
    ]
  }
];
