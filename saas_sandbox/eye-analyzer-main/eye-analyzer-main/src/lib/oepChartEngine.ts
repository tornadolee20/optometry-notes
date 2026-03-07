/**
 * OEP/ZCSBV 自動化數據填充引擎
 * 
 * 核心功能：
 * - 標準化病例數據結構
 * - 統一坐標轉換函數
 * - 自動繪圖點位生成
 */

// ============= 標準化數據結構 =============

/**
 * 遠方測試數據
 */
export interface DistanceTestData {
  phoria: number;        // 斜位（exo 負值，eso 正值）
  bi_blur?: number;      // BI 模糊（正值）
  bi_break: number;      // BI 破裂（正值）
  bi_rec?: number;       // BI 恢復（正值）
  bo_blur?: number;      // BO 模糊（正值）
  bo_break: number;      // BO 破裂（正值）
  bo_rec?: number;       // BO 恢復（正值）
}

/**
 * 近方測試數據
 */
export interface NearTestData {
  phoria: number;        // 斜位（exo 負值，eso 正值）
  bi_blur?: number;      // BI 模糊（正值）
  bi_break: number;      // BI 破裂（正值）
  bi_rec?: number;       // BI 恢復（正值）
  bo_blur?: number;      // BO 模糊（正值）
  bo_break: number;      // BO 破裂（正值）
  bo_rec?: number;       // BO 恢復（正值）
}

/**
 * 完整病例數據結構
 */
export interface PatientOEPData {
  age: number;           // 年齡
  pd: number;            // 瞳距 (mm)
  aa: number;            // 調節幅度 (D)
  far: DistanceTestData; // 遠方數據
  near: NearTestData;    // 近方數據
}

/**
 * 25歲標準案例（預設初始值）
 */
export const SAMPLE_CASE_25: PatientOEPData = {
  age: 25,
  pd: 63,
  aa: 12.0,
  far: {
    phoria: 0,
    bi_break: 8,
    bi_rec: 5,
    bo_break: 18,
    bo_rec: 12,
  },
  near: {
    phoria: -2,
    bi_break: 14,
    bi_rec: 11,
    bo_blur: 16,
    bo_break: 20,
    bo_rec: 11,
  }
};

// ============= 座標系統常數 =============

/**
 * OEP 圖表座標系統配置
 */
export const OEP_CHART_CONFIG = {
  // X 軸（底部 6m 絕對刻度）
  X_AXIS: {
    MIN: -20,    // 20Δ BI
    MAX: 100,    // 100Δ BO
  },
  // Y 軸（調節刺激）
  Y_AXIS: {
    MIN: 0,
    MAX: 13,     // 顯示至 12D
    DISPLAY_MAX: 12,
  },
  // 雙刻度對齊
  SCALE_ALIGNMENT: 15,  // 頂部 0 = 底部 +15
  // 固定 Y 座標
  DISTANCE_Y: 0,        // 遠方 Y=0
  NEAR_Y: 2.5,          // 近方 Y=2.5D
};

// ============= 座標轉換引擎 =============

/**
 * 創建座標轉換器
 * 
 * @param width 畫布寬度
 * @param height 畫布高度
 * @param padding 邊距配置
 */
export function createCoordinateMapper(
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number }
) {
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  
  const { X_AXIS, Y_AXIS } = OEP_CHART_CONFIG;
  
  /**
   * 核心座標轉換函數
   * 將稜鏡值和調節高度轉換為 SVG 像素座標
   * 
   * @param prismValue 稜鏡量（BI 為負，BO 為正）
   * @param accommodationD 調節高度 (D)
   * @returns SVG 像素座標 {x, y}
   */
  const getCoords = (prismValue: number, accommodationD: number): { x: number; y: number } => {
    // X 座標：基於底部 6m 絕對刻度
    const x = padding.left + ((prismValue - X_AXIS.MIN) / (X_AXIS.MAX - X_AXIS.MIN)) * plotWidth;
    
    // Y 座標：0D 在底部，12D 在頂部
    const y = padding.top + ((Y_AXIS.MAX - accommodationD) / (Y_AXIS.MAX - Y_AXIS.MIN)) * plotHeight;
    
    return { x, y };
  };
  
  /**
   * 僅轉換 X 座標
   */
  const scaleX = (prismValue: number): number => {
    return padding.left + ((prismValue - X_AXIS.MIN) / (X_AXIS.MAX - X_AXIS.MIN)) * plotWidth;
  };
  
  /**
   * 僅轉換 Y 座標
   */
  const scaleY = (accommodationD: number): number => {
    return padding.top + ((Y_AXIS.MAX - accommodationD) / (Y_AXIS.MAX - Y_AXIS.MIN)) * plotHeight;
  };
  
  /**
   * 頂部相對座標轉底部絕對座標
   */
  const relativeToAbsolute = (relative: number): number => {
    return relative + OEP_CHART_CONFIG.SCALE_ALIGNMENT;
  };
  
  /**
   * 底部絕對座標轉頂部相對座標
   */
  const absoluteToRelative = (absolute: number): number => {
    return absolute - OEP_CHART_CONFIG.SCALE_ALIGNMENT;
  };
  
  /**
   * ADD 換算（右 Y 軸）
   */
  const addConversion = (stimulus: number): number => {
    return 2.5 - stimulus;
  };
  
  // 預計算固定座標
  const distY = scaleY(OEP_CHART_CONFIG.DISTANCE_Y);
  const nearY = scaleY(OEP_CHART_CONFIG.NEAR_Y);
  const topY = scaleY(OEP_CHART_CONFIG.Y_AXIS.DISPLAY_MAX);
  const zeroRefX = scaleX(OEP_CHART_CONFIG.SCALE_ALIGNMENT);
  
  return {
    getCoords,
    scaleX,
    scaleY,
    relativeToAbsolute,
    absoluteToRelative,
    addConversion,
    // 預計算座標
    distY,
    nearY,
    topY,
    zeroRefX,
    // 尺寸資訊
    plotWidth,
    plotHeight,
    padding,
  };
}

// ============= 自動繪圖點位生成 =============

/**
 * 點位類型定義
 */
export type PointType = 'phoria' | 'blur' | 'break' | 'recovery';

/**
 * 可繪製的資料點
 */
export interface PlottablePoint {
  x: number;           // SVG X 座標
  y: number;           // SVG Y 座標
  type: PointType;     // 點位類型
  value: number;       // 原始數值
  label: string;       // 標籤（BI/BO/遠/近）
  layer: 'distance' | 'near';
  direction?: 'bi' | 'bo';
}

/**
 * 從病例數據生成所有可繪製點位
 * 
 * @param data 病例數據
 * @param mapper 座標轉換器
 * @returns 可繪製點位陣列
 */
export function generatePlottablePoints(
  data: PatientOEPData,
  mapper: ReturnType<typeof createCoordinateMapper>
): PlottablePoint[] {
  const points: PlottablePoint[] = [];
  const { getCoords } = mapper;
  const { far, near } = data;
  
  // ========== 遠方層 (Y=0) ==========
  const distY = 0;
  
  // 遠方斜位
  const farPhoriaCoords = getCoords(far.phoria, distY);
  points.push({
    x: farPhoriaCoords.x,
    y: farPhoriaCoords.y,
    type: 'phoria',
    value: far.phoria,
    label: '遠',
    layer: 'distance',
  });
  
  // 遠方 BI（注意：BI 在圖表上是負方向）
  if (far.bi_blur !== undefined) {
    const coords = getCoords(-far.bi_blur, distY);
    points.push({ x: coords.x, y: coords.y, type: 'blur', value: far.bi_blur, label: 'BI', layer: 'distance', direction: 'bi' });
  }
  const farBiBreakCoords = getCoords(-far.bi_break, distY);
  points.push({ x: farBiBreakCoords.x, y: farBiBreakCoords.y, type: 'break', value: far.bi_break, label: 'BI', layer: 'distance', direction: 'bi' });
  
  if (far.bi_rec !== undefined) {
    const coords = getCoords(-far.bi_rec, distY);
    points.push({ x: coords.x, y: coords.y, type: 'recovery', value: far.bi_rec, label: 'BI', layer: 'distance', direction: 'bi' });
  }
  
  // 遠方 BO（正方向）
  if (far.bo_blur !== undefined) {
    const coords = getCoords(far.bo_blur, distY);
    points.push({ x: coords.x, y: coords.y, type: 'blur', value: far.bo_blur, label: 'BO', layer: 'distance', direction: 'bo' });
  }
  const farBoBreakCoords = getCoords(far.bo_break, distY);
  points.push({ x: farBoBreakCoords.x, y: farBoBreakCoords.y, type: 'break', value: far.bo_break, label: 'BO', layer: 'distance', direction: 'bo' });
  
  if (far.bo_rec !== undefined) {
    const coords = getCoords(far.bo_rec, distY);
    points.push({ x: coords.x, y: coords.y, type: 'recovery', value: far.bo_rec, label: 'BO', layer: 'distance', direction: 'bo' });
  }
  
  // ========== 近方層 (Y=2.5) ==========
  // 重要：近方測試使用頂部相對刻度，需轉換為底部絕對座標
  // 公式：絕對值 = 相對值 + 15
  const nearYLevel = 2.5;
  const NEAR_TO_ABSOLUTE_OFFSET = OEP_CHART_CONFIG.SCALE_ALIGNMENT; // +15
  
  // 近方斜位（相對值轉絕對值）
  const nearPhoriaAbsolute = near.phoria + NEAR_TO_ABSOLUTE_OFFSET;
  const nearPhoriaCoords = getCoords(nearPhoriaAbsolute, nearYLevel);
  points.push({
    x: nearPhoriaCoords.x,
    y: nearPhoriaCoords.y,
    type: 'phoria',
    value: near.phoria, // 保留原始相對值用於顯示
    label: '近',
    layer: 'near',
  });
  
  // 近方 BI（相對值轉絕對值，BI 為負方向）
  if (near.bi_blur !== undefined) {
    const absoluteX = -near.bi_blur + NEAR_TO_ABSOLUTE_OFFSET;
    const coords = getCoords(absoluteX, nearYLevel);
    points.push({ x: coords.x, y: coords.y, type: 'blur', value: near.bi_blur, label: 'BI', layer: 'near', direction: 'bi' });
  }
  const nearBiBreakAbsolute = -near.bi_break + NEAR_TO_ABSOLUTE_OFFSET;
  const nearBiBreakCoords = getCoords(nearBiBreakAbsolute, nearYLevel);
  points.push({ x: nearBiBreakCoords.x, y: nearBiBreakCoords.y, type: 'break', value: near.bi_break, label: 'BI', layer: 'near', direction: 'bi' });
  
  if (near.bi_rec !== undefined) {
    const absoluteX = -near.bi_rec + NEAR_TO_ABSOLUTE_OFFSET;
    const coords = getCoords(absoluteX, nearYLevel);
    points.push({ x: coords.x, y: coords.y, type: 'recovery', value: near.bi_rec, label: 'BI', layer: 'near', direction: 'bi' });
  }
  
  // 近方 BO（相對值轉絕對值，BO 為正方向）
  if (near.bo_blur !== undefined) {
    const absoluteX = near.bo_blur + NEAR_TO_ABSOLUTE_OFFSET;
    const coords = getCoords(absoluteX, nearYLevel);
    points.push({ x: coords.x, y: coords.y, type: 'blur', value: near.bo_blur, label: 'BO', layer: 'near', direction: 'bo' });
  }
  const nearBoBreakAbsolute = near.bo_break + NEAR_TO_ABSOLUTE_OFFSET;
  const nearBoBreakCoords = getCoords(nearBoBreakAbsolute, nearYLevel);
  points.push({ x: nearBoBreakCoords.x, y: nearBoBreakCoords.y, type: 'break', value: near.bo_break, label: 'BO', layer: 'near', direction: 'bo' });
  
  if (near.bo_rec !== undefined) {
    const absoluteX = near.bo_rec + NEAR_TO_ABSOLUTE_OFFSET;
    const coords = getCoords(absoluteX, nearYLevel);
    points.push({ x: coords.x, y: coords.y, type: 'recovery', value: near.bo_rec, label: 'BO', layer: 'near', direction: 'bo' });
  }
  
  return points;
}

// ============= 連線生成 =============

/**
 * 生成 AC/A 傳動線座標
 */
export function generateACAPhoriaLine(
  data: PatientOEPData,
  mapper: ReturnType<typeof createCoordinateMapper>
): { start: { x: number; y: number }; end: { x: number; y: number } } {
  const { getCoords } = mapper;
  
  // 遠方使用絕對座標，近方相對值需轉換
  const nearPhoriaAbsolute = data.near.phoria + OEP_CHART_CONFIG.SCALE_ALIGNMENT;
  
  return {
    start: getCoords(data.far.phoria, 0),
    end: getCoords(nearPhoriaAbsolute, 2.5),
  };
}

/**
 * 生成需求線座標
 */
export function generateDemandLine(
  pd: number,
  mapper: ReturnType<typeof createCoordinateMapper>,
  yMax: number = 12
): { start: { x: number; y: number }; end: { x: number; y: number }; nearPoint: { x: number; y: number } } {
  const { getCoords } = mapper;
  const pd_cm = pd / 10;
  
  return {
    start: getCoords(0, 0),                           // 起點 (0, 0)
    end: getCoords(pd_cm * yMax, yMax),               // 終點 Y=12
    nearPoint: getCoords(pd_cm * 2.5, 2.5),           // 近方點 Y=2.5
  };
}

/**
 * 生成功能區多邊形（黃色區域 - 延伸到 AA 天花板）
 * 
 * BI 側邊線：連接遠方 BI 與近方 BI，延伸到 AA 天花板
 * BO 側邊線：連接遠方 BO 與近方 BO，延伸到 AA 天花板
 * 
 * 邏輯：BI/BO 各側都是「有模糊點就用模糊點，沒有就用破裂點」
 */
export function generateFunctionalZonePolygon(
  data: PatientOEPData,
  mapper: ReturnType<typeof createCoordinateMapper>,
  useBlur: boolean = true  // true: 優先使用模糊點, false: 使用破裂點
): string {
  const { getCoords } = mapper;
  const { far, near, aa } = data;
  const OFFSET = OEP_CHART_CONFIG.SCALE_ALIGNMENT;
  
  // BI 側：有模糊點就用模糊點，沒有就用破裂點
  const farBi = (useBlur && far.bi_blur !== undefined) ? far.bi_blur : far.bi_break;
  const nearBi = (useBlur && near.bi_blur !== undefined) ? near.bi_blur : near.bi_break;
  
  // BO 側：有模糊點就用模糊點，沒有就用破裂點
  const farBo = (useBlur && far.bo_blur !== undefined) ? far.bo_blur : far.bo_break;
  const nearBo = (useBlur && near.bo_blur !== undefined) ? near.bo_blur : near.bo_break;
  
  // 計算斜率並延伸到 AA 天花板
  // BI 側：遠方絕對值 = -farBi，近方絕對值 = -nearBi + OFFSET
  const biSlope = ((-nearBi + OFFSET) - (-farBi)) / (2.5 - 0);
  // BO 側：遠方絕對值 = farBo，近方絕對值 = nearBo + OFFSET
  const boSlope = ((nearBo + OFFSET) - farBo) / (2.5 - 0);
  
  // 計算 AA 天花板處的 X 座標（從遠方點延伸）
  const aaLevel = Math.min(aa, OEP_CHART_CONFIG.Y_AXIS.DISPLAY_MAX);
  const biAtAA = (-farBi) + biSlope * aaLevel;  // BI 在 AA 處的絕對 X
  const boAtAA = farBo + boSlope * aaLevel;     // BO 在 AA 處的絕對 X
  
  // 順時針生成多邊形路徑（6 個點）
  // 1. 遠方 BI (Y=0)
  // 2. 近方 BI (Y=2.5)
  // 3. AA 天花板 BI 側
  // 4. AA 天花板 BO 側
  // 5. 近方 BO (Y=2.5)
  // 6. 遠方 BO (Y=0)
  const points = [
    getCoords(-farBi, 0),                        // 遠方 BI（絕對）
    getCoords(-nearBi + OFFSET, 2.5),            // 近方 BI（相對轉絕對）
    getCoords(biAtAA, aaLevel),                  // AA 天花板 BI 側
    getCoords(boAtAA, aaLevel),                  // AA 天花板 BO 側
    getCoords(nearBo + OFFSET, 2.5),             // 近方 BO（相對轉絕對）
    getCoords(farBo, 0),                         // 遠方 BO（絕對）
  ];
  
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
}

/**
 * 計算 Percival 舒適帶（中央 1/3）- 延伸到 AA 天花板
 * BI/BO 側：有模糊點就用模糊點，沒有就用破裂點
 */
export function generatePercivalComfortZone(
  data: PatientOEPData,
  mapper: ReturnType<typeof createCoordinateMapper>
): string {
  const { getCoords } = mapper;
  const { far, near, aa } = data;
  const OFFSET = OEP_CHART_CONFIG.SCALE_ALIGNMENT;
  
  // BI 側：有模糊點就用模糊點，沒有就用破裂點
  const farBi = far.bi_blur !== undefined ? far.bi_blur : far.bi_break;
  const nearBi = near.bi_blur !== undefined ? near.bi_blur : near.bi_break;
  // BO 側：有模糊點就用模糊點，沒有就用破裂點
  const farBo = far.bo_blur !== undefined ? far.bo_blur : far.bo_break;
  const nearBo = near.bo_blur !== undefined ? near.bo_blur : near.bo_break;
  
  // 遠方中央 1/3（使用絕對座標）
  const farTotalWidth = farBi + farBo;
  const farThird = farTotalWidth / 3;
  const farCenter = (farBo - farBi) / 2;
  const farPsLeft = farCenter - farThird / 2;
  const farPsRight = farCenter + farThird / 2;
  
  // 近方中央 1/3（使用相對座標，繪製時轉換）
  const nearTotalWidth = nearBi + nearBo;
  const nearThird = nearTotalWidth / 3;
  const nearCenter = (nearBo - nearBi) / 2;
  const nearPsLeft = nearCenter - nearThird / 2;
  const nearPsRight = nearCenter + nearThird / 2;
  
  // 計算斜率並延伸到 AA 天花板
  const leftSlope = ((nearPsLeft + OFFSET) - farPsLeft) / (2.5 - 0);
  const rightSlope = ((nearPsRight + OFFSET) - farPsRight) / (2.5 - 0);
  
  const aaLevel = Math.min(aa, OEP_CHART_CONFIG.Y_AXIS.DISPLAY_MAX);
  const leftAtAA = farPsLeft + leftSlope * aaLevel;
  const rightAtAA = farPsRight + rightSlope * aaLevel;
  
  // 6 點多邊形（延伸到 AA 天花板）
  const points = [
    getCoords(farPsLeft, 0),
    getCoords(nearPsLeft + OFFSET, 2.5),
    getCoords(leftAtAA, aaLevel),
    getCoords(rightAtAA, aaLevel),
    getCoords(nearPsRight + OFFSET, 2.5),
    getCoords(farPsRight, 0),
  ];
  
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
}

// ============= AA 天花板計算 =============

/**
 * 根據年齡計算 AA 上限（Hofstetter 公式）
 */
export function calculateAACeiling(age: number): number {
  return Math.max(0, 18.5 - 0.3 * age);
}

/**
 * 根據實測 AA 獲取天花板 Y 座標
 */
export function getAACeilingY(
  aa: number,
  mapper: ReturnType<typeof createCoordinateMapper>
): number {
  const clampedAA = Math.min(aa, OEP_CHART_CONFIG.Y_AXIS.DISPLAY_MAX);
  return mapper.scaleY(clampedAA);
}

// ============= Morgan 常模檢查 =============

/**
 * 檢查斜位是否符合 Morgan 常模
 */
export function checkMorganNorm(
  phoria: number,
  isDistance: boolean
): { isNormal: boolean; range: [number, number] } {
  if (isDistance) {
    return {
      isNormal: phoria >= -1 && phoria <= 2,
      range: [-1, 2],
    };
  }
  return {
    isNormal: phoria >= -6 && phoria <= 0,
    range: [-6, 0],
  };
}

// ============= AC/A 計算 =============

/**
 * 計算量法 AC/A
 */
export function calculateCalculatedACA(data: PatientOEPData): number {
  const pd_cm = data.pd / 10;
  const phoriaChange = data.near.phoria - data.far.phoria;
  const aca = pd_cm + (phoriaChange / 2.5);
  return Math.round(aca * 10) / 10;
}
