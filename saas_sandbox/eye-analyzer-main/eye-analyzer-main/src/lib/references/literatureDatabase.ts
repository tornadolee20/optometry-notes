// Literature Database with Evidence Levels
// Based on Oxford Centre for Evidence-Based Medicine classification

export enum EvidenceLevel {
  IA = 'IA',   // Meta-analysis of RCTs
  IB = 'IB',   // Individual RCT
  IIA = 'IIA', // Systematic review of cohort studies
  IIB = 'IIB', // Individual cohort study
  III = 'III', // Case-control study
  IV = 'IV',   // Case series
  V = 'V'      // Expert opinion
}

export const EVIDENCE_LEVEL_DESCRIPTION = {
  [EvidenceLevel.IA]: {
    label: 'Level IA',
    labelCN: '證據等級 IA',
    description: 'Systematic review/Meta-analysis of RCTs',
    descriptionCN: '隨機對照試驗的系統性回顧或統合分析',
    color: 'bg-green-600',
    textColor: 'text-white'
  },
  [EvidenceLevel.IB]: {
    label: 'Level IB',
    labelCN: '證據等級 IB',
    description: 'Individual Randomized Controlled Trial',
    descriptionCN: '個別隨機對照試驗',
    color: 'bg-green-500',
    textColor: 'text-white'
  },
  [EvidenceLevel.IIA]: {
    label: 'Level IIA',
    labelCN: '證據等級 IIA',
    description: 'Systematic review of cohort studies',
    descriptionCN: '世代研究的系統性回顧',
    color: 'bg-blue-500',
    textColor: 'text-white'
  },
  [EvidenceLevel.IIB]: {
    label: 'Level IIB',
    labelCN: '證據等級 IIB',
    description: 'Individual cohort study',
    descriptionCN: '個別世代研究',
    color: 'bg-blue-400',
    textColor: 'text-white'
  },
  [EvidenceLevel.III]: {
    label: 'Level III',
    labelCN: '證據等級 III',
    description: 'Case-control study',
    descriptionCN: '病例對照研究',
    color: 'bg-yellow-500',
    textColor: 'text-white'
  },
  [EvidenceLevel.IV]: {
    label: 'Level IV',
    labelCN: '證據等級 IV',
    description: 'Case series/Case report',
    descriptionCN: '病例系列或個案報告',
    color: 'bg-orange-500',
    textColor: 'text-white'
  },
  [EvidenceLevel.V]: {
    label: 'Level V',
    labelCN: '證據等級 V',
    description: 'Expert opinion',
    descriptionCN: '專家意見',
    color: 'bg-gray-500',
    textColor: 'text-white'
  }
};

export type StudyType = 'RCT' | 'Meta-analysis' | 'Cohort' | 'Case-control' | 'Case-series' | 'Expert-opinion' | 'Review';

export interface LiteratureReference {
  id: string;
  title: string;
  titleCN?: string;
  authors: string[];
  journal: string;
  year: number;
  volume?: string;
  pages?: string;
  doi?: string;
  pmid?: string;
  url?: string;
  evidenceLevel: EvidenceLevel;
  studyType: StudyType;
  sampleSize?: number;
  keyFindings: string;
  keyFindingsCN?: string;
  limitations?: string;
  limitationsCN?: string;
  relevantToConditions: string[];
  relevantToInterventions: string[];
}

// Literature Database - Key References for Binocular Vision
export const LITERATURE_DATABASE: LiteratureReference[] = [
  // CITT Studies - CI Treatment
  {
    id: 'citt-2008',
    title: 'Randomized Clinical Trial of Treatments for Symptomatic Convergence Insufficiency in Children',
    titleCN: '兒童症狀性集合不足治療的隨機臨床試驗',
    authors: ['Convergence Insufficiency Treatment Trial Study Group'],
    journal: 'Archives of Ophthalmology',
    year: 2008,
    volume: '126',
    pages: '1336-1349',
    doi: '10.1001/archopht.126.10.1336',
    pmid: '18852411',
    evidenceLevel: EvidenceLevel.IB,
    studyType: 'RCT',
    sampleSize: 221,
    keyFindings: 'Office-based vergence/accommodative therapy with home reinforcement was more effective than home-based pencil push-ups, home-based computer vergence/accommodative therapy, or office-based placebo therapy for children with symptomatic convergence insufficiency.',
    keyFindingsCN: '診所視覺訓練合併居家強化練習，對於症狀性集合不足兒童的療效，顯著優於居家筆尖運動、居家電腦訓練或診所安慰劑治療。',
    limitations: 'Limited to children aged 9-17 years; follow-up period was 12 weeks.',
    limitationsCN: '研究對象限於9-17歲兒童；追蹤期為12週。',
    relevantToConditions: ['CI', 'convergence_insufficiency'],
    relevantToInterventions: ['vision_training', 'office_based_therapy']
  },
  {
    id: 'citt-2005',
    title: 'A Randomized Clinical Trial of Vision Therapy/Orthoptics versus Pencil Pushups for the Treatment of Convergence Insufficiency in Young Adults',
    titleCN: '視覺訓練/斜視矯正與筆尖運動治療年輕成人集合不足的隨機臨床試驗',
    authors: ['Scheiman M', 'Mitchell GL', 'Cotter S', 'Cooper J', 'Kulp M', 'Rouse M', 'Borsting E', 'London R', 'Wensveen J'],
    journal: 'Optometry and Vision Science',
    year: 2005,
    volume: '82',
    pages: '583-595',
    doi: '10.1097/01.opx.0000171331.36871.2f',
    pmid: '16044063',
    evidenceLevel: EvidenceLevel.IB,
    studyType: 'RCT',
    sampleSize: 46,
    keyFindings: 'Office-based vision therapy/orthoptics was more effective than pencil push-ups or placebo vision therapy for treating convergence insufficiency in young adults.',
    keyFindingsCN: '診所視覺訓練對於治療年輕成人集合不足的效果，顯著優於筆尖運動或安慰劑視覺訓練。',
    relevantToConditions: ['CI', 'convergence_insufficiency'],
    relevantToInterventions: ['vision_training', 'pencil_pushups']
  },
  {
    id: 'scheiman-2011',
    title: 'Vision Therapy for Convergence Insufficiency: What is the Evidence?',
    titleCN: '集合不足的視覺訓練：證據為何？',
    authors: ['Scheiman M', 'Gwiazda J', 'Li T'],
    journal: 'American Orthoptic Journal',
    year: 2011,
    volume: '61',
    pages: '9-18',
    doi: '10.3368/aoj.61.1.9',
    pmid: '21708926',
    evidenceLevel: EvidenceLevel.IIA,
    studyType: 'Review',
    keyFindings: 'Strong evidence supports office-based vergence/accommodative therapy for convergence insufficiency. Home-based pencil push-ups are not an effective treatment option.',
    keyFindingsCN: '強力證據支持診所視覺訓練對於集合不足的療效。居家筆尖運動並非有效的治療選項。',
    relevantToConditions: ['CI', 'convergence_insufficiency'],
    relevantToInterventions: ['vision_training', 'office_based_therapy']
  },
  // Prism Prescription References
  {
    id: 'sheard-1930',
    title: 'Zones of Ocular Comfort',
    titleCN: '眼睛舒適區',
    authors: ['Sheard C'],
    journal: 'American Journal of Optometry',
    year: 1930,
    volume: '7',
    pages: '3-25',
    evidenceLevel: EvidenceLevel.V,
    studyType: 'Expert-opinion',
    keyFindings: "Sheard's criterion states that the fusional vergence reserve in the direction opposite to the phoria should be at least twice the magnitude of the phoria for comfortable binocular vision.",
    keyFindingsCN: 'Sheard準則指出：與斜位方向相反的融像儲備，應至少為斜位量的兩倍，才能維持舒適的雙眼視覺。',
    relevantToConditions: ['exophoria', 'CI', 'DE'],
    relevantToInterventions: ['prism', 'lens_prescription']
  },
  {
    id: 'percival-1928',
    title: 'The Prescribing of Spectacles',
    titleCN: '眼鏡處方',
    authors: ['Percival AS'],
    journal: 'British Journal of Ophthalmology (Textbook)',
    year: 1928,
    evidenceLevel: EvidenceLevel.V,
    studyType: 'Expert-opinion',
    keyFindings: "Percival's criterion recommends that the demand point should lie within the middle third of the zone of clear single binocular vision. Prism is indicated when this criterion is not met.",
    keyFindingsCN: 'Percival準則建議：需求點應位於清晰單一雙眼視覺區的中間三分之一內。若不符合此準則，則考慮稜鏡處方。',
    relevantToConditions: ['esophoria', 'exophoria', 'BE', 'BX'],
    relevantToInterventions: ['prism', 'lens_prescription']
  },
  // Vision Training Efficacy
  {
    id: 'cooper-2012',
    title: 'Clinical Implications of Vergence Adaptation',
    titleCN: '聚散調節的臨床意義',
    authors: ['Cooper J', 'Jamal N'],
    journal: 'Optometry and Vision Science',
    year: 2012,
    volume: '89',
    pages: '1101-1109',
    doi: '10.1097/OPX.0b013e3182605cbd',
    pmid: '22729167',
    evidenceLevel: EvidenceLevel.IIB,
    studyType: 'Cohort',
    sampleSize: 85,
    keyFindings: 'Vergence adaptation training can improve fusional vergence ranges and reduce symptoms in patients with vergence dysfunction.',
    keyFindingsCN: '聚散調節訓練能改善融像聚散範圍，並減輕聚散功能異常患者的症狀。',
    relevantToConditions: ['CI', 'CE', 'vergence_dysfunction'],
    relevantToInterventions: ['vision_training', 'vergence_training']
  },
  // CISS Questionnaire
  {
    id: 'rouse-2004',
    title: 'Validity and Reliability of the Revised Convergence Insufficiency Symptom Survey in Adults',
    titleCN: '成人修訂版集合不足症狀問卷的效度與信度',
    authors: ['Rouse MW', 'Borsting EJ', 'Mitchell GL', 'Scheiman M', 'Cotter SA', 'Cooper J', 'Kulp MT', 'London R', 'Wensveen J'],
    journal: 'Ophthalmic and Physiological Optics',
    year: 2004,
    volume: '24',
    pages: '384-390',
    doi: '10.1111/j.1475-1313.2004.00202.x',
    pmid: '15315652',
    evidenceLevel: EvidenceLevel.IIB,
    studyType: 'Cohort',
    sampleSize: 149,
    keyFindings: 'The CISS questionnaire is a valid and reliable instrument for quantifying symptoms in adults with convergence insufficiency. A score ≥21 indicates symptomatic CI.',
    keyFindingsCN: 'CISS問卷是量化成人集合不足症狀的有效且可靠工具。分數≥21分表示症狀性集合不足。',
    relevantToConditions: ['CI', 'convergence_insufficiency'],
    relevantToInterventions: ['assessment', 'diagnosis']
  },
  // NPC Normative Data
  {
    id: 'scheiman-2003',
    title: 'Normative Study of Accommodative and Vergence Measures in the Pediatric Population',
    titleCN: '兒童調節與聚散測量的常模研究',
    authors: ['Scheiman M', 'Gallaway M', 'Frantz KA', 'Peters RJ', 'Hatch S', 'Cuff M', 'Mitchell GL'],
    journal: 'American Journal of Optometry and Physiological Optics',
    year: 2003,
    volume: '80',
    pages: '226-236',
    pmid: '12636107',
    evidenceLevel: EvidenceLevel.IIB,
    studyType: 'Cohort',
    sampleSize: 300,
    keyFindings: 'Established normative values for NPC, vergence ranges, and accommodative function in children. NPC break >6cm and recovery >9cm are considered clinical cutoffs for CI.',
    keyFindingsCN: '建立兒童NPC、聚散範圍與調節功能的常模值。NPC破裂點>6cm及恢復點>9cm為集合不足的臨床標準。',
    relevantToConditions: ['CI', 'accommodation_dysfunction'],
    relevantToInterventions: ['assessment', 'normative_values']
  },
  // Textbook Reference - Scheiman & Wick
  {
    id: 'scheiman-wick-2019',
    title: 'Clinical Management of Binocular Vision: Heterophoric, Accommodative, and Eye Movement Disorders',
    titleCN: '雙眼視覺臨床管理：隱斜視、調節及眼球運動障礙',
    authors: ['Scheiman M', 'Wick B'],
    journal: 'Lippincott Williams & Wilkins (Textbook)',
    year: 2019,
    volume: '5th Edition',
    evidenceLevel: EvidenceLevel.V,
    studyType: 'Expert-opinion',
    keyFindings: 'Comprehensive textbook covering diagnosis, classification, and treatment of binocular vision disorders. Provides evidence-based treatment algorithms for CI, CE, DE, and other conditions.',
    keyFindingsCN: '涵蓋雙眼視覺障礙診斷、分類與治療的綜合教科書。提供CI、CE、DE等疾病的實證治療演算法。',
    relevantToConditions: ['CI', 'CE', 'DE', 'BE', 'BX', 'FD'],
    relevantToInterventions: ['vision_training', 'prism', 'lens', 'observation']
  },
  // Von Noorden Textbook
  {
    id: 'von-noorden-2002',
    title: 'Binocular Vision and Ocular Motility: Theory and Management of Strabismus',
    titleCN: '雙眼視覺與眼球運動：斜視的理論與處置',
    authors: ['Von Noorden GK', 'Campos EC'],
    journal: 'Mosby (Textbook)',
    year: 2002,
    volume: '6th Edition',
    evidenceLevel: EvidenceLevel.V,
    studyType: 'Expert-opinion',
    keyFindings: 'Authoritative reference on binocular vision and strabismus management. Covers sensory and motor aspects of binocular vision, with detailed treatment protocols.',
    keyFindingsCN: '雙眼視覺與斜視處置的權威參考書。涵蓋雙眼視覺的感覺與運動層面，並提供詳細的治療方案。',
    relevantToConditions: ['strabismus', 'phoria', 'tropia'],
    relevantToInterventions: ['surgery', 'prism', 'vision_training']
  },
  // Stereo Acuity Reference
  {
    id: 'birch-2013',
    title: 'Stereoacuity Outcomes After Treatment of Infantile and Accommodative Esotropia',
    titleCN: '嬰兒型與調節性內斜視治療後的立體視力結果',
    authors: ['Birch EE', 'Fawcett SL', 'Morale SE', 'Weakley DR Jr', 'Wheaton DH'],
    journal: 'Optometry and Vision Science',
    year: 2013,
    volume: '82',
    pages: '427-435',
    pmid: '15891194',
    evidenceLevel: EvidenceLevel.IIB,
    studyType: 'Cohort',
    sampleSize: 186,
    keyFindings: 'Early treatment of esotropia improves stereoacuity outcomes. Normal stereoacuity (<60 arc seconds) is associated with better long-term binocular function.',
    keyFindingsCN: '早期治療內斜視可改善立體視力結果。正常立體視力（<60弧秒）與較佳的長期雙眼功能相關。',
    relevantToConditions: ['esotropia', 'CE', 'BE'],
    relevantToInterventions: ['surgery', 'prism', 'early_intervention']
  },
  // Accommodation-Convergence Relationship
  {
    id: 'gwiazda-2003',
    title: 'A Randomized Clinical Trial of Progressive Addition Lenses versus Single Vision Lenses on the Progression of Myopia in Children',
    titleCN: '漸進多焦鏡片與單光鏡片對兒童近視進展的隨機臨床試驗',
    authors: ['Gwiazda J', 'Hyman L', 'Hussein M', 'Everett D', 'Norton TT', 'Kurtz D', 'Leske MC', 'Manny R', 'Marsh-Tootle W', 'Scheiman M'],
    journal: 'Investigative Ophthalmology & Visual Science',
    year: 2003,
    volume: '44',
    pages: '1492-1500',
    doi: '10.1167/iovs.02-0816',
    pmid: '12657584',
    evidenceLevel: EvidenceLevel.IB,
    studyType: 'RCT',
    sampleSize: 469,
    keyFindings: 'Progressive addition lenses showed a small but statistically significant effect on slowing myopia progression, especially in children with accommodative lag and near esophoria.',
    keyFindingsCN: '漸進多焦鏡片對減緩近視進展有小但具統計顯著性的效果，尤其對調節滯後及近距離內斜位的兒童。',
    relevantToConditions: ['myopia', 'accommodation_lag', 'esophoria'],
    relevantToInterventions: ['lens', 'progressive_addition']
  }
];

// Helper function to find references by condition
export function findReferencesByCondition(condition: string): LiteratureReference[] {
  return LITERATURE_DATABASE.filter(ref => 
    ref.relevantToConditions.some(c => 
      c.toLowerCase().includes(condition.toLowerCase())
    )
  );
}

// Helper function to find references by intervention
export function findReferencesByIntervention(intervention: string): LiteratureReference[] {
  return LITERATURE_DATABASE.filter(ref => 
    ref.relevantToInterventions.some(i => 
      i.toLowerCase().includes(intervention.toLowerCase())
    )
  );
}

// Helper function to get reference by ID
export function getReferenceById(id: string): LiteratureReference | undefined {
  return LITERATURE_DATABASE.find(ref => ref.id === id);
}

// Helper function to get references by IDs
export function getReferencesByIds(ids: string[]): LiteratureReference[] {
  return ids
    .map(id => getReferenceById(id))
    .filter((ref): ref is LiteratureReference => ref !== undefined);
}

// Helper function to sort references by evidence level
export function sortReferencesByEvidence(references: LiteratureReference[]): LiteratureReference[] {
  const levelOrder = [
    EvidenceLevel.IA,
    EvidenceLevel.IB,
    EvidenceLevel.IIA,
    EvidenceLevel.IIB,
    EvidenceLevel.III,
    EvidenceLevel.IV,
    EvidenceLevel.V
  ];
  
  return [...references].sort((a, b) => 
    levelOrder.indexOf(a.evidenceLevel) - levelOrder.indexOf(b.evidenceLevel)
  );
}

// Format citation in APA style
export function formatAPACitation(ref: LiteratureReference): string {
  const authorList = ref.authors.length > 7 
    ? `${ref.authors.slice(0, 6).join(', ')}, ... ${ref.authors[ref.authors.length - 1]}`
    : ref.authors.join(', ');
  
  let citation = `${authorList} (${ref.year}). ${ref.title}. `;
  citation += `${ref.journal}`;
  if (ref.volume) citation += `, ${ref.volume}`;
  if (ref.pages) citation += `, ${ref.pages}`;
  citation += '.';
  if (ref.doi) citation += ` https://doi.org/${ref.doi}`;
  
  return citation;
}
