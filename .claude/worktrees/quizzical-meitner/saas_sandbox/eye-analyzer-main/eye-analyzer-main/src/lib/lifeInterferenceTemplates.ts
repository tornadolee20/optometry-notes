import { CalculationResult } from './calculateLogic';
import { Language, TranslationKey } from './translations';

/**
 * 生活干擾文字模版系統
 * 每個診斷/狀況對應三種模式的翻譯 key
 */

export interface InterferenceTemplate {
  id: string;
  condition: string; // 對應的診斷或狀況
  simpleKey: TranslationKey;    // 簡易模式翻譯 key
  proKey: TranslationKey;       // 專業模式翻譯 key
  expertKey: TranslationKey;    // 專家模式翻譯 key
}

// 主要診斷類別的生活干擾模版
export const diagnosisTemplates: InterferenceTemplate[] = [
  // 集合不足 (CI)
  {
    id: 'ci',
    condition: 'CI',
    simpleKey: 'ciSimple',
    proKey: 'ciPro',
    expertKey: 'ciExpert',
  },
  // 假性集合不足
  {
    id: 'pseudo-ci',
    condition: 'Pseudo-CI',
    simpleKey: 'pseudoCiSimple',
    proKey: 'pseudoCiPro',
    expertKey: 'pseudoCiExpert',
  },
  // 集合過度 (CE)
  {
    id: 'ce',
    condition: 'CE',
    simpleKey: 'ceSimple',
    proKey: 'cePro',
    expertKey: 'ceExpert',
  },
  // 開散過度 (DE)
  {
    id: 'de',
    condition: 'DE',
    simpleKey: 'deSimple',
    proKey: 'dePro',
    expertKey: 'deExpert',
  },
  // 開散不足 (DI)
  {
    id: 'di',
    condition: 'DI',
    simpleKey: 'diSimple',
    proKey: 'diPro',
    expertKey: 'diExpert',
  },
  // 基本型外斜
  {
    id: 'bx',
    condition: 'BX',
    simpleKey: 'bxSimple',
    proKey: 'bxPro',
    expertKey: 'bxExpert',
  },
  // 基本型內斜
  {
    id: 'be',
    condition: 'BE',
    simpleKey: 'beSimple',
    proKey: 'bePro',
    expertKey: 'beExpert',
  },
];

// 調節狀況的生活干擾模版
export const accommodationTemplates: InterferenceTemplate[] = [
  // 調節不足
  {
    id: 'ai',
    condition: 'Insufficiency',
    simpleKey: 'aiSimple',
    proKey: 'aiPro',
    expertKey: 'aiExpert',
  },
  // 調節過度
  {
    id: 'ae',
    condition: 'Excess',
    simpleKey: 'aeSimple',
    proKey: 'aePro',
    expertKey: 'aeExpert',
  },
  // 調節靈敏度異常
  {
    id: 'infacility',
    condition: 'Infacility',
    simpleKey: 'infacilitySimple',
    proKey: 'infacilityPro',
    expertKey: 'infacilityExpert',
  },
  // 老花
  {
    id: 'presbyopia',
    condition: 'Presbyopia',
    simpleKey: 'presbyopiaSimple',
    proKey: 'presbyopiaPro',
    expertKey: 'presbyopiaExpert',
  },
  // 前老花
  {
    id: 'pre-presbyopia',
    condition: 'Pre-Presbyopia',
    simpleKey: 'prePresbyopiaSimple',
    proKey: 'prePresbyopiaPro',
    expertKey: 'prePresbyopiaExpert',
  },
];

// 其他狀況的生活干擾模版
export const otherTemplates: InterferenceTemplate[] = [
  // NPC 偏大
  {
    id: 'npc-large',
    condition: 'NPC_LARGE',
    simpleKey: 'npcLargeSimple',
    proKey: 'npcLargePro',
    expertKey: 'npcLargeExpert',
  },
  // BCC 異常 (formerly MEM)
  {
    id: 'bcc-lag',
    condition: 'BCC_LAG',
    simpleKey: 'bccLagSimple',
    proKey: 'bccLagPro',
    expertKey: 'bccLagExpert',
  },
  // 人體工學風險
  {
    id: 'ergo-risk',
    condition: 'ERGO_RISK',
    simpleKey: 'ergoRiskSimple',
    proKey: 'ergoRiskPro',
    expertKey: 'ergoRiskExpert',
  },
  // CISS 症狀明顯
  {
    id: 'ciss-high',
    condition: 'CISS_HIGH',
    simpleKey: 'cissHighSimple',
    proKey: 'cissHighPro',
    expertKey: 'cissHighExpert',
  },
  // 輻輳靈活度不足
  {
    id: 'vf-deficient',
    condition: 'VF_DEFICIENT',
    simpleKey: 'vfDeficientSimple',
    proKey: 'vfDeficientPro',
    expertKey: 'vfDeficientExpert',
  },
  // 輻輳靈活度偏低
  {
    id: 'vf-borderline',
    condition: 'VF_BORDERLINE',
    simpleKey: 'vfBorderlineSimple',
    proKey: 'vfBorderlinePro',
    expertKey: 'vfBorderlineExpert',
  },
];

/**
 * 根據計算結果，取得適用的生活干擾模版列表
 */
export function getApplicableInterferences(result: CalculationResult, npc: number, flipper: number, age: number): InterferenceTemplate[] {
  const applicable: InterferenceTemplate[] = [];
  const diagCode = result.diag.code;
  const accomStatus = result.accom.status;

  // 主要診斷
  const diagTemplate = diagnosisTemplates.find(t => t.condition === diagCode);
  if (diagTemplate) {
    applicable.push(diagTemplate);
  }

  // 調節狀況
  const accomTemplate = accommodationTemplates.find(t => t.condition === accomStatus);
  if (accomTemplate) {
    applicable.push(accomTemplate);
  }

  // NPC 偏大
  if (npc > 6) {
    const npcTemplate = otherTemplates.find(t => t.condition === 'NPC_LARGE');
    if (npcTemplate) applicable.push(npcTemplate);
  }

  // BCC 異常（從 alerts 檢查）
  if (result.alerts.some(a => a.includes('BCC'))) {
    const bccTemplate = otherTemplates.find(t => t.condition === 'BCC_LAG');
    if (bccTemplate) applicable.push(bccTemplate);
  }

  // 人體工學風險
  if (result.ergoRisk) {
    const ergoTemplate = otherTemplates.find(t => t.condition === 'ERGO_RISK');
    if (ergoTemplate) applicable.push(ergoTemplate);
  }

  // CISS 症狀明顯
  if (result.ciss.symptomatic) {
    const cissTemplate = otherTemplates.find(t => t.condition === 'CISS_HIGH');
    if (cissTemplate) applicable.push(cissTemplate);
  }

  // 調節靈敏度異常（如果尚未包含）
  if (flipper < 12 && !applicable.some(t => t.condition === 'Infacility')) {
    const flipperTemplate = accommodationTemplates.find(t => t.condition === 'Infacility');
    if (flipperTemplate) applicable.push(flipperTemplate);
  }

  // 輻輳靈活度
  if (result.vergenceFacility.status === 'deficient') {
    const vfTemplate = otherTemplates.find(t => t.condition === 'VF_DEFICIENT');
    if (vfTemplate) applicable.push(vfTemplate);
  } else if (result.vergenceFacility.status === 'borderline') {
    const vfTemplate = otherTemplates.find(t => t.condition === 'VF_BORDERLINE');
    if (vfTemplate) applicable.push(vfTemplate);
  }

  // 限制數量：簡易模式 2-4 條
  return applicable.slice(0, 5);
}
