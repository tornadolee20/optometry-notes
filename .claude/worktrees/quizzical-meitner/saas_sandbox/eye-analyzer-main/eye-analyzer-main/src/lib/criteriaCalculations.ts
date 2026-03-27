/**
 * OEP 圖表臨床準則計算模組
 * 確保圖表和文字判讀使用相同邏輯
 * 符合國際視光學標準
 * 
 * 注意：AC/A 計算和分類現在使用 oep-geometry.ts 模組
 */

import { Language } from './binocularAnalysis';
import {
  calculateACA_Calculated,
  classifyACA,
  OEP_COORDINATE_SYSTEM,
} from '@/utils/oep-geometry';

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

// ============= Y 軸位置常數（調節刺激量 D，國際 OEP 標準）=============
// OEP 圖表格式：Y 軸範圍 0-12D，代表調節刺激量
// 遠方 (6m) 固定於 Y = 0（底線）
// 近方 (40cm) 固定於 Y = 2.5
// 斜軸設計：上方 X 軸對應近方範圍，下方 X 軸對應遠方範圍

export const Y_POSITIONS = {
  DISTANCE: 0,      // 遠方數據繪製位置（底線 Y=0）
  NEAR: 2.5,        // 近方數據繪製位置（40cm = 2.5D 調節需求）
  MIN: 0,           // Y 軸最小值（國際 OEP 標準 - 底線）
  MAX: 12,          // Y 軸最大值（國際 OEP 標準）
} as const;

// ============= X 軸範圍常數（臨床實務版 - 斜軸設計）=============
// 近方與遠方使用不同的 X 軸範圍，形成傾斜對應關係
// 符合國際 OEP 圖表標準

export const X_AXIS_RANGES = {
  near: {
    min: -35,         // BI 範圍：35 Base In（左側）
    max: 35,          // BO 範圍：35 Base Out（右側）
    warningZone: 30,  // >30Δ 為罕見範圍
  },
  distance: {
    min: -20,         // BI 範圍：20 Base In（左側）
    max: 50,          // BO 範圍：50 Base Out（右側）
    warningZone: 40,  // >40Δ 為罕見範圍
  },
} as const;

// ============= 水平薄帶高度 =============

export const ZONE_HEIGHT = 0.3; // 調節刺激量單位（D）- 常模區域薄帶高度

// ============= 準則計算函數 =============

export const CriteriaCalculations = {
  /**
   * AC/A 比計算（使用 oep-geometry.ts 模組）
   * 計算法公式：AC/A = PD(cm) + (近距斜位 - 遠距斜位) / 調節需求
   * 注意：此函數為向後兼容保留，新代碼應直接使用 calculateACA_Calculated
   * @param phoria_far 遠距斜位（負值=exo，正值=eso）
   * @param phoria_near 近距斜位
   * @param accommodativeDemand 調節需求（預設 2.5D）
   * @param pd_mm 瞳距（毫米，預設 64mm）
   * @returns AC/A 值
   */
  calculateACA(phoria_far: number, phoria_near: number, accommodativeDemand: number = 2.5, pd_mm: number = 64): number {
    // 使用 oep-geometry.ts 的計算函數
    return calculateACA_Calculated(phoria_far, phoria_near, pd_mm, accommodativeDemand);
  },

  /**
   * 獲取 AC/A 分類（使用 oep-geometry.ts 模組）
   */
  getACAClassification(aca: number, language: Language = 'zh-TW'): {
    value: number;
    classification: string;
    classificationEN: string;
    color: string;
    isAbnormal: boolean;
  } {
    const result = classifyACA(aca);
    const t = (tw: string, cn: string, en: string) =>
      language === 'en' ? en : language === 'zh-CN' ? cn : tw;
    
    return {
      value: aca,
      classification: t(result.label, result.label, result.labelEN),
      classificationEN: result.labelEN,
      color: result.color,
      isAbnormal: result.category === 'abnormal',
    };
  },

  /**
   * Sheard 準則計算
   * 補償性融像儲備 ≥ 2 × 斜位需求
   * @param phoria 斜位值
   * @param compensatingVergence 補償性融像儲備（exo用BO, eso用BI）
   * @returns Sheard 餘量（正值=通過，負值=不足）
   */
  calculateSheard(phoria: number, compensatingVergence: number): number {
    const demand = Math.abs(phoria) * 2;
    return compensatingVergence - demand;
  },

  /**
   * 檢查 Sheard 準則是否通過
   */
  checkSheardPass(phoria: number, compensatingVergence: number): boolean {
    return compensatingVergence >= Math.abs(phoria) * 2;
  },

  /**
   * 計算 Sheard 需求線位置（稜鏡度）
   * @param phoria 斜位值
   * @returns 需求線位置
   */
  getSheardDemandPosition(phoria: number): number {
    return phoria < 0 
      ? phoria + Math.abs(phoria) * 2  // exo: 向 BO 方向
      : phoria - Math.abs(phoria) * 2; // eso: 向 BI 方向
  },

  /**
   * Percival 準則計算
   * 較小儲備 ≥ 較大儲備的 1/3
   * @param BI BI break 值
   * @param BO BO break 值
   * @returns Percival 餘量（正值=通過，負值=不足）
   */
  calculatePercival(BI: number, BO: number): number {
    const minReserve = Math.min(BI, BO);
    const maxReserve = Math.max(BI, BO);
    const required = maxReserve / 3;
    return minReserve - required;
  },

  /**
   * 檢查 Percival 準則是否通過
   */
  checkPercivalPass(BI: number, BO: number): boolean {
    const minReserve = Math.min(BI, BO);
    const maxReserve = Math.max(BI, BO);
    return minReserve >= maxReserve / 3;
  },

  /**
   * 計算 Percival 舒適區範圍（國際標準 1/3 法則）
   * 舒適區 = 總融像範圍的中間 1/3，以斜位為中心
   * @param phoria 斜位值
   * @param biBreak BI break 值
   * @param boBreak BO break 值
   * @returns { left: number, right: number } 舒適區範圍
   */
  getPercivalZoneRange(phoria: number, biBreak: number, boBreak: number): { left: number; right: number } {
    const totalRange = biBreak + boBreak;
    const thirdRange = totalRange / 3;
    return {
      left: phoria - thirdRange,
      right: phoria + thirdRange,
    };
  },

  /**
   * Morgan 準則判斷
   * 檢查斜位是否在正常範圍內
   */
  checkMorgan(phoria: number, location: 'distance' | 'near'): boolean {
    const norms = MORGAN_NORMS[location].phoria;
    return phoria >= norms.min && phoria <= norms.max;
  },

  /**
   * 獲取 Morgan 區域座標（水平薄帶）
   * @param location 'distance' 或 'near'
   * @returns 區域的 xMin, xMax, y, height
   */
  getMorganZone(location: 'distance' | 'near'): {
    xMin: number;
    xMax: number;
    y: number;
    height: number;
  } {
    const norms = MORGAN_NORMS[location];
    const y = location === 'distance' ? Y_POSITIONS.DISTANCE : Y_POSITIONS.NEAR;
    
    return {
      xMin: norms.phoria.min - norms.BI.break,
      xMax: norms.phoria.max + norms.BO.break,
      y,
      height: ZONE_HEIGHT,
    };
  },
};

// ============= 輔助函數 =============

/**
 * 獲取翻譯文字
 */
export function getTranslatedText(
  language: Language,
  tw: string,
  cn: string,
  en: string
): string {
  return language === 'en' ? en : language === 'zh-CN' ? cn : tw;
}
