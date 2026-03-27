/**
 * OEP 圖表工具函數
 * 包含資料點符號、異常檢測、Morgan 標準等功能
 * 
 * 注意：AC/A 計算現在使用 oep-geometry.ts 模組
 */

import { Language } from './binocularAnalysis';
import { calculateACA_Calculated } from '@/utils/oep-geometry';

// ============= 資料點符號配置 =============

export const POINT_SYMBOLS = {
  phoria: { symbol: '×', color: 'hsl(217 91% 60%)', label: '斜位', labelEN: 'Phoria' },
  blur: { symbol: '○', color: 'hsl(0 84% 60%)', label: '模糊', labelEN: 'Blur' },
  break: { symbol: '□', color: 'hsl(142 71% 45%)', label: '破裂', labelEN: 'Break' },
  recovery: { symbol: '△', color: 'hsl(38 92% 50%)', label: '恢復', labelEN: 'Recovery' },
} as const;

export type PointType = keyof typeof POINT_SYMBOLS;

// ============= Morgan 標準常數 =============

export const MORGAN_NORMS = {
  distance: {
    phoria: { mean: 0.5, sd: 1, min: -1, max: 2 },
    BI: { blur: 7, break: 9, recovery: 5 },
    BO: { blur: 9, break: 19, recovery: 10 },
  },
  near: {
    phoria: { mean: -3, sd: 3, min: -6, max: 0 },
    BI: { blur: 13, break: 21, recovery: 13 },
    BO: { blur: 17, break: 21, recovery: 11 },
  },
} as const;

// ============= 異常檢測 =============

export interface AbnormalResult {
  isAbnormal: boolean;
  severity: 'normal' | 'warning' | 'critical';
  message?: string;
}

export function checkAbnormal(
  value: number,
  location: 'distance' | 'near',
  type: 'BI' | 'BO',
  language: Language = 'zh-TW'
): AbnormalResult {
  const norms = MORGAN_NORMS[location][type];
  const t = (tw: string, cn: string, en: string) =>
    language === 'en' ? en : language === 'zh-CN' ? cn : tw;
  
  // 接近 0 的極端異常
  if (value < 3) {
    return {
      isAbnormal: true,
      severity: 'critical',
      message: t(
        `${type} 儲備嚴重不足：${value}Δ（正常 ≥${norms.break}Δ）`,
        `${type} 储备严重不足：${value}Δ（正常 ≥${norms.break}Δ）`,
        `${type} reserve critically low: ${value}Δ (normal ≥${norms.break}Δ)`
      ),
    };
  }
  
  // 破裂點不足標準的 50% → 嚴重異常
  if (value < norms.break * 0.5) {
    return {
      isAbnormal: true,
      severity: 'critical',
      message: t(
        `${type} 儲備嚴重不足：${value}Δ < ${Math.round(norms.break * 0.5)}Δ`,
        `${type} 储备严重不足：${value}Δ < ${Math.round(norms.break * 0.5)}Δ`,
        `${type} reserve critically low: ${value}Δ < ${Math.round(norms.break * 0.5)}Δ`
      ),
    };
  }
  
  // 破裂點不足標準的 75% → 警告
  if (value < norms.break * 0.75) {
    return {
      isAbnormal: true,
      severity: 'warning',
      message: t(
        `${type} 儲備偏低：${value}Δ`,
        `${type} 储备偏低：${value}Δ`,
        `${type} reserve below normal: ${value}Δ`
      ),
    };
  }
  
  return { isAbnormal: false, severity: 'normal' };
}

export function checkPhoriaAbnormal(
  phoria: number,
  location: 'distance' | 'near',
  language: Language = 'zh-TW'
): AbnormalResult {
  const norms = MORGAN_NORMS[location].phoria;
  const t = (tw: string, cn: string, en: string) =>
    language === 'en' ? en : language === 'zh-CN' ? cn : tw;
  
  const deviation = phoria < norms.min 
    ? Math.abs(phoria - norms.min)
    : phoria > norms.max 
    ? phoria - norms.max 
    : 0;
  
  if (deviation > 4) {
    return {
      isAbnormal: true,
      severity: 'critical',
      message: t(
        `斜位嚴重偏離：${phoria}Δ（正常 ${norms.min} ~ ${norms.max}Δ）`,
        `斜位严重偏离：${phoria}Δ（正常 ${norms.min} ~ ${norms.max}Δ）`,
        `Phoria significantly deviated: ${phoria}Δ (normal ${norms.min} ~ ${norms.max}Δ)`
      ),
    };
  }
  
  if (deviation > 0) {
    return {
      isAbnormal: true,
      severity: 'warning',
      message: t(
        `斜位偏離：${phoria}Δ`,
        `斜位偏离：${phoria}Δ`,
        `Phoria deviated: ${phoria}Δ`
      ),
    };
  }
  
  return { isAbnormal: false, severity: 'normal' };
}

// ============= 雙眼視資料點結構 =============

export interface BinocularDataPoints {
  distance: {
    phoria: number;
    BI: { blur?: number; break: number; recovery?: number };
    BO: { blur?: number; break: number; recovery?: number };
  };
  near: {
    phoria: number;
    BI: { blur?: number; break: number; recovery?: number };
    BO: { blur?: number; break: number; recovery?: number };
  };
}

// ============= 診斷結果結構 =============

export interface DiagnosticResults {
  morgan: {
    distance: boolean;
    near: boolean;
    distanceDetail: string;
    nearDetail: string;
  };
  sheard: {
    distance: boolean;
    near: boolean;
    distanceDetail: string;
    nearDetail: string;
  };
  percival: {
    distance: boolean;
    near: boolean;
    distanceDetail: string;
    nearDetail: string;
  };
  warnings: string[];
  overallScore: number;
}

/**
 * 計算 AC/A 比（使用 oep-geometry.ts 模組）
 * 計算法公式：AC/A = PD(cm) + (近距斜位 - 遠距斜位) / 調節需求
 * 注意：此函數為向後兼容保留，新代碼應直接使用 calculateACA_Calculated
 */
export function calculateACA(
  phoria_far: number,
  phoria_near: number,
  accommodativeDemand: number = 2.5,
  pd_mm: number = 64
): number {
  return calculateACA_Calculated(phoria_far, phoria_near, pd_mm, accommodativeDemand);
}

export function calculateDiagnosticResults(
  data: BinocularDataPoints,
  language: Language = 'zh-TW'
): DiagnosticResults {
  const t = (tw: string, cn: string, en: string) =>
    language === 'en' ? en : language === 'zh-CN' ? cn : tw;

  // Morgan 判斷
  const distMorganPass = 
    data.distance.phoria >= MORGAN_NORMS.distance.phoria.min &&
    data.distance.phoria <= MORGAN_NORMS.distance.phoria.max;
  const nearMorganPass = 
    data.near.phoria >= MORGAN_NORMS.near.phoria.min &&
    data.near.phoria <= MORGAN_NORMS.near.phoria.max;

  // Sheard 判斷
  const distSheardDemand = Math.abs(data.distance.phoria) * 2;
  const distSheardReserve = data.distance.phoria < 0 
    ? data.distance.BO.break 
    : data.distance.BI.break;
  const distSheardPass = distSheardReserve >= distSheardDemand;

  const nearSheardDemand = Math.abs(data.near.phoria) * 2;
  const nearSheardReserve = data.near.phoria < 0 
    ? data.near.BO.break 
    : data.near.BI.break;
  const nearSheardPass = nearSheardReserve >= nearSheardDemand;

  // Percival 判斷
  const distMinReserve = Math.min(data.distance.BI.break, data.distance.BO.break);
  const distMaxReserve = Math.max(data.distance.BI.break, data.distance.BO.break);
  const distPercivalPass = distMinReserve >= distMaxReserve / 3;

  const nearMinReserve = Math.min(data.near.BI.break, data.near.BO.break);
  const nearMaxReserve = Math.max(data.near.BI.break, data.near.BO.break);
  const nearPercivalPass = nearMinReserve >= nearMaxReserve / 3;

  // 警告生成
  const warnings: string[] = [];
  
  // 近方 BO 異常檢測（特別處理極端情況）
  const boAbnormal = checkAbnormal(data.near.BO.break, 'near', 'BO', language);
  if (boAbnormal.isAbnormal && boAbnormal.message) {
    warnings.push(boAbnormal.message);
  }
  
  // 近方 BI 異常檢測
  const biAbnormal = checkAbnormal(data.near.BI.break, 'near', 'BI', language);
  if (biAbnormal.isAbnormal && biAbnormal.message) {
    warnings.push(biAbnormal.message);
  }
  
  // 斜位異常檢測
  const phoriaAbnormal = checkPhoriaAbnormal(data.near.phoria, 'near', language);
  if (phoriaAbnormal.isAbnormal && phoriaAbnormal.message) {
    warnings.push(phoriaAbnormal.message);
  }

  // 綜合評分（更嚴格的扣分邏輯）
  let score = 100;
  
  // Morgan 扣分
  if (!distMorganPass) score -= 10;
  if (!nearMorganPass) score -= 10;
  
  // Sheard 扣分（核心指標，扣更多）
  if (!distSheardPass) score -= 15;
  if (!nearSheardPass) score -= 20; // 近方 Sheard 不通過更嚴重
  
  // Percival 扣分
  if (!distPercivalPass) score -= 10;
  if (!nearPercivalPass) score -= 10;
  
  // 極端異常額外扣分
  if (data.near.BO.break < 5) score -= 15; // 極低 BO 儲備
  if (data.near.BI.break < 5) score -= 15; // 極低 BI 儲備
  
  // 警告數量扣分
  score -= warnings.length * 3;
  
  score = Math.max(0, score);

  return {
    morgan: {
      distance: distMorganPass,
      near: nearMorganPass,
      distanceDetail: t(
        `遠 ${data.distance.phoria}Δ（正常 ${MORGAN_NORMS.distance.phoria.min}~${MORGAN_NORMS.distance.phoria.max}Δ）`,
        `远 ${data.distance.phoria}Δ（正常 ${MORGAN_NORMS.distance.phoria.min}~${MORGAN_NORMS.distance.phoria.max}Δ）`,
        `Dist ${data.distance.phoria}Δ (norm ${MORGAN_NORMS.distance.phoria.min}~${MORGAN_NORMS.distance.phoria.max}Δ)`
      ),
      nearDetail: t(
        `近 ${data.near.phoria}Δ（正常 ${MORGAN_NORMS.near.phoria.min}~${MORGAN_NORMS.near.phoria.max}Δ）`,
        `近 ${data.near.phoria}Δ（正常 ${MORGAN_NORMS.near.phoria.min}~${MORGAN_NORMS.near.phoria.max}Δ）`,
        `Near ${data.near.phoria}Δ (norm ${MORGAN_NORMS.near.phoria.min}~${MORGAN_NORMS.near.phoria.max}Δ)`
      ),
    },
    sheard: {
      distance: distSheardPass,
      near: nearSheardPass,
      distanceDetail: t(
        `儲備 ${distSheardReserve}Δ ${distSheardPass ? '≥' : '<'} 需求 ${distSheardDemand.toFixed(1)}Δ`,
        `储备 ${distSheardReserve}Δ ${distSheardPass ? '≥' : '<'} 需求 ${distSheardDemand.toFixed(1)}Δ`,
        `Reserve ${distSheardReserve}Δ ${distSheardPass ? '≥' : '<'} Demand ${distSheardDemand.toFixed(1)}Δ`
      ),
      nearDetail: t(
        `儲備 ${nearSheardReserve}Δ ${nearSheardPass ? '≥' : '<'} 需求 ${nearSheardDemand.toFixed(1)}Δ`,
        `储备 ${nearSheardReserve}Δ ${nearSheardPass ? '≥' : '<'} 需求 ${nearSheardDemand.toFixed(1)}Δ`,
        `Reserve ${nearSheardReserve}Δ ${nearSheardPass ? '≥' : '<'} Demand ${nearSheardDemand.toFixed(1)}Δ`
      ),
    },
    percival: {
      distance: distPercivalPass,
      near: nearPercivalPass,
      distanceDetail: t(
        `小儲備 ${distMinReserve}Δ ${distPercivalPass ? '≥' : '<'} 大儲備/3 ${(distMaxReserve / 3).toFixed(1)}Δ`,
        `小储备 ${distMinReserve}Δ ${distPercivalPass ? '≥' : '<'} 大储备/3 ${(distMaxReserve / 3).toFixed(1)}Δ`,
        `Min ${distMinReserve}Δ ${distPercivalPass ? '≥' : '<'} Max/3 ${(distMaxReserve / 3).toFixed(1)}Δ`
      ),
      nearDetail: t(
        `小儲備 ${nearMinReserve}Δ ${nearPercivalPass ? '≥' : '<'} 大儲備/3 ${(nearMaxReserve / 3).toFixed(1)}Δ`,
        `小储备 ${nearMinReserve}Δ ${nearPercivalPass ? '≥' : '<'} 大储备/3 ${(nearMaxReserve / 3).toFixed(1)}Δ`,
        `Min ${nearMinReserve}Δ ${nearPercivalPass ? '≥' : '<'} Max/3 ${(nearMaxReserve / 3).toFixed(1)}Δ`
      ),
    },
    warnings,
    overallScore: score,
  };
}

// ============= 圖表下載功能 =============

export async function downloadChartAsPNG(
  chartElement: HTMLElement,
  filename: string
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(chartElement, { scale: 2 });
  const link = document.createElement('a');
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function downloadChartAsPDF(
  chartElement: HTMLElement,
  filename: string
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');
  
  const canvas = await html2canvas(chartElement, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width / 2, canvas.height / 2],
  });
  
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
  pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ============= 評分等級 =============

export function getScoreGrade(
  score: number,
  language: Language = 'zh-TW'
): { label: string; color: string; bgColor: string } {
  const t = (tw: string, cn: string, en: string) =>
    language === 'en' ? en : language === 'zh-CN' ? cn : tw;

  if (score >= 90) {
    return {
      label: t('優良', '优良', 'Excellent'),
      color: 'hsl(142 71% 45%)',
      bgColor: 'hsl(142 76% 96%)',
    };
  }
  if (score >= 70) {
    return {
      label: t('良好', '良好', 'Good'),
      color: 'hsl(48 96% 53%)',
      bgColor: 'hsl(48 96% 96%)',
    };
  }
  if (score >= 50) {
    return {
      label: t('尚可', '尚可', 'Fair'),
      color: 'hsl(25 95% 53%)',
      bgColor: 'hsl(25 95% 96%)',
    };
  }
  return {
    label: t('需注意', '需注意', 'Attention'),
    color: 'hsl(0 84% 60%)',
    bgColor: 'hsl(0 84% 96%)',
  };
}
