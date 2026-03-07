/**
 * OEP 幾何引擎 - 核心計算模組
 * 
 * 包含：
 * - 需求線計算（正確公式）
 * - 雙 AC/A 計算系統
 * - 動態 X 軸範圍計算
 */

// ============= 需求線計算 =============

/**
 * 計算需求線上的點
 * 公式：X_demand = PD(cm) × D
 * 
 * 範例：
 * - PD 60mm, D=0: 6.0 × 0 = 0Δ
 * - PD 60mm, D=2.5: 6.0 × 2.5 = 15Δ
 * - PD 64mm, D=2.5: 6.4 × 2.5 = 16Δ
 * - PD 80mm, D=12: 8.0 × 12 = 96Δ
 * 
 * @param pd_mm 瞳距（毫米）
 * @param accommodation_d 調節刺激量（屈光度 D）
 * @returns 需求線 X 座標（稜鏡度 Δ）
 */
export function calculateDemandPoint(pd_mm: number, accommodation_d: number): number {
  const pd_cm = pd_mm / 10;
  return pd_cm * accommodation_d;
}

/**
 * 生成完整需求線路徑
 * 
 * @param pd_mm 瞳距（毫米）
 * @param yRange Y 軸範圍 [min, max]（調節刺激量 D）
 * @param resolution 解析度（每多少 D 產生一個點）
 * @returns 需求線路徑點陣列
 */
export function generateDemandLinePath(
  pd_mm: number,
  yRange: [number, number] = [0, 12],
  resolution: number = 0.5
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let y = yRange[0]; y <= yRange[1]; y += resolution) {
    points.push({
      x: calculateDemandPoint(pd_mm, y),
      y: y
    });
  }
  return points;
}

/**
 * 預設 PD 值的需求線端點
 * 用於繪製標準參考線
 */
export const STANDARD_PD_LINES = {
  60: { label: '60mm', color: '#6B7280' },
  64: { label: '64mm', color: '#374151' },
  67: { label: '67mm', color: '#1F2937' },
} as const;

/**
 * 計算標準 PD 線的端點座標
 */
export function getStandardPDLineEndpoints(pd_mm: number): {
  start: { x: number; y: number };
  end: { x: number; y: number };
} {
  return {
    start: { x: 0, y: 0 },           // 原點（遠方 0D）
    end: { x: calculateDemandPoint(pd_mm, 12), y: 12 }  // 12D 處
  };
}

// ============= AC/A 計算系統 =============

/**
 * 計算量法 AC/A（Calculated AC/A）
 * 用於診斷分類和繪製斜位線
 * 
 * 公式：AC/A = PD(cm) + (近距斜位 - 遠距斜位) / 調節需求
 * 
 * 注意：
 * - 斜位符號：exo = 負值，eso = 正值
 * - 結果為 Δ/D（每屈光度的稜鏡需求）
 * 
 * @param distance_phoria 遠距斜位（Δ）
 * @param near_phoria 近距斜位（Δ）
 * @param pd_mm 瞳距（毫米）
 * @param accommodation 調節需求（預設 2.5D，40cm）
 * @returns AC/A 值（Δ/D）
 */
export function calculateACA_Calculated(
  distance_phoria: number,
  near_phoria: number,
  pd_mm: number,
  accommodation: number = 2.5
): number {
  const pd_cm = pd_mm / 10;
  const phoria_change = near_phoria - distance_phoria;
  const ac_a = pd_cm + (phoria_change / accommodation);
  return Math.round(ac_a * 10) / 10;
}

/**
 * 梯度法 AC/A（Gradient AC/A）
 * 用於處方預測，特別是老花患者
 * 
 * 公式：AC/A = |加片後斜位 - 原始斜位| / 鏡片度數
 * 
 * 注意：
 * - 不包含 PD
 * - 需要進行額外的臨床測量
 * - 對於 ≥40 歲或調節幅度不足者更可靠
 * 
 * @param baseline_phoria 基線斜位（Δ）
 * @param with_lens_phoria 加片後斜位（Δ）
 * @param lens_power 測試鏡片度數（D）
 * @returns AC/A 值（Δ/D）或 null（無法計算時）
 */
export function calculateACA_Gradient(
  baseline_phoria: number,
  with_lens_phoria: number,
  lens_power: number
): number | null {
  if (lens_power === 0) return null;
  const phoria_change = Math.abs(with_lens_phoria - baseline_phoria);
  const ac_a = phoria_change / Math.abs(lens_power);
  return Math.round(ac_a * 10) / 10;
}

/**
 * AC/A 分類
 */
export interface ACAClassification {
  value: number;
  category: 'low' | 'normal' | 'high' | 'abnormal';
  label: string;
  labelEN: string;
  color: string;
}

/**
 * 取得 AC/A 分類結果
 */
export function classifyACA(aca: number): ACAClassification {
  if (aca < 0 || aca > 10) {
    return {
      value: aca,
      category: 'abnormal',
      label: '異常',
      labelEN: 'Abnormal',
      color: '#DC2626'
    };
  }
  if (aca < 3) {
    return {
      value: aca,
      category: 'low',
      label: '低',
      labelEN: 'Low',
      color: '#3B82F6'
    };
  }
  if (aca > 5) {
    return {
      value: aca,
      category: 'high',
      label: '高',
      labelEN: 'High',
      color: '#EF4444'
    };
  }
  return {
    value: aca,
    category: 'normal',
    label: '正常',
    labelEN: 'Normal',
    color: '#10B981'
  };
}

// ============= 動態軸範圍計算 =============

export interface BinocularTestData {
  distance: {
    phoria: number;
    bi_blur?: number;
    bi_break: number;
    bi_recovery?: number;
    bo_blur?: number;
    bo_break: number;
    bo_recovery?: number;
  };
  near: {
    phoria: number;
    bi_blur?: number;
    bi_break: number;
    bi_recovery?: number;
    bo_blur?: number;
    bo_break: number;
    bo_recovery?: number;
  };
}

/**
 * 計算圖表所需的動態 X 軸範圍
 * 確保 PD 80mm 在 12D 的 96Δ 也能完整顯示
 * 
 * @param pd_mm 瞳距（毫米）
 * @param testData 雙眼視測試數據
 * @param padding 邊距比例（預設 10%）
 * @returns [xMin, xMax] X 軸範圍
 */
export function calculateDynamicXAxisRange(
  pd_mm: number,
  testData: BinocularTestData,
  padding: number = 0.1
): [number, number] {
  // 計算最大需求點（12D 時的 X 座標）
  const maxDemandPoint = calculateDemandPoint(pd_mm, 12);
  
  // 收集所有 X 值
  const allXValues: number[] = [
    0,                              // 原點
    maxDemandPoint,                 // 需求線最大值
    testData.distance.phoria,       // 遠距斜位
    testData.near.phoria,           // 近距斜位
  ];
  
  // 添加 BI 值（負方向）
  if (testData.distance.bi_break) allXValues.push(-testData.distance.bi_break);
  if (testData.distance.bi_blur) allXValues.push(-testData.distance.bi_blur);
  if (testData.near.bi_break) allXValues.push(-testData.near.bi_break);
  if (testData.near.bi_blur) allXValues.push(-testData.near.bi_blur);
  
  // 添加 BO 值（正方向）
  if (testData.distance.bo_break) allXValues.push(testData.distance.bo_break);
  if (testData.distance.bo_blur) allXValues.push(testData.distance.bo_blur);
  if (testData.near.bo_break) allXValues.push(testData.near.bo_break);
  if (testData.near.bo_blur) allXValues.push(testData.near.bo_blur);
  
  // 計算範圍
  const dataMin = Math.min(...allXValues);
  const dataMax = Math.max(...allXValues);
  const range = dataMax - dataMin;
  
  // 加上邊距
  const xMin = Math.floor(dataMin - range * padding);
  const xMax = Math.ceil(dataMax + range * padding);
  
  // 確保最小範圍
  return [
    Math.min(xMin, -25),  // 至少顯示到 -25Δ（BI 方向）
    Math.max(xMax, 40)    // 至少顯示到 40Δ（BO 方向）
  ];
}

/**
 * 計算近方 X 軸範圍（可能比遠方更寬）
 */
export function calculateNearXAxisRange(
  pd_mm: number,
  testData: BinocularTestData,
  padding: number = 0.1
): [number, number] {
  const baseRange = calculateDynamicXAxisRange(pd_mm, testData, padding);
  
  // 近方通常需要更寬的 BO 範圍
  const nearDemandAt2_5D = calculateDemandPoint(pd_mm, 2.5);
  
  return [
    baseRange[0],
    Math.max(baseRange[1], nearDemandAt2_5D + 30)  // 需求線 + 30Δ BO 儲備空間
  ];
}

// ============= 斜位線計算 =============

/**
 * 計算斜位線（連接遠距和近距斜位點）
 * 斜位線的斜率反映 AC/A
 */
export function calculatePhoriaLine(
  distance_phoria: number,
  near_phoria: number,
  distance_y: number = 0,
  near_y: number = 2.5
): {
  start: { x: number; y: number };
  end: { x: number; y: number };
  slope: number;  // AC/A（不含 PD）
} {
  const slope = (near_phoria - distance_phoria) / (near_y - distance_y);
  
  return {
    start: { x: distance_phoria, y: distance_y },
    end: { x: near_phoria, y: near_y },
    slope: Math.round(slope * 10) / 10
  };
}

/**
 * 延伸斜位線到完整 Y 軸範圍
 */
export function extendPhoriaLine(
  distance_phoria: number,
  near_phoria: number,
  yRange: [number, number] = [0, 12]
): Array<{ x: number; y: number }> {
  const slope = (near_phoria - distance_phoria) / 2.5;  // 基於 0 到 2.5D 的斜率
  
  return [
    { x: distance_phoria + slope * yRange[0], y: yRange[0] },
    { x: distance_phoria + slope * yRange[1], y: yRange[1] }
  ];
}

// ============= 診斷準則幾何 =============

/**
 * Sheard 準則：補償性融像儲備 ≥ 2 × 斜位需求
 */
export function calculateSheardGeometry(
  phoria: number,
  compensatingVergence: number
): {
  demandPosition: number;
  reservePosition: number;
  margin: number;
  passes: boolean;
} {
  const demand = Math.abs(phoria) * 2;
  const demandPosition = phoria < 0 
    ? phoria + demand   // exo: 向 BO 方向
    : phoria - demand;  // eso: 向 BI 方向
    
  return {
    demandPosition,
    reservePosition: phoria < 0 ? compensatingVergence : -compensatingVergence,
    margin: compensatingVergence - demand,
    passes: compensatingVergence >= demand
  };
}

/**
 * Percival 準則：較小儲備 ≥ 較大儲備的 1/3
 */
export function calculatePercivalGeometry(
  phoria: number,
  bi_break: number,
  bo_break: number
): {
  zoneLeft: number;
  zoneRight: number;
  totalRange: number;
  passes: boolean;
} {
  const totalRange = bi_break + bo_break;
  const thirdRange = totalRange / 3;
  const minReserve = Math.min(bi_break, bo_break);
  const maxReserve = Math.max(bi_break, bo_break);
  
  return {
    zoneLeft: phoria - thirdRange,
    zoneRight: phoria + thirdRange,
    totalRange,
    passes: minReserve >= maxReserve / 3
  };
}

// ============= 座標轉換輔助 =============

/**
 * OEP 圖表座標系統常數
 */
export const OEP_COORDINATE_SYSTEM = {
  Y_AXIS: {
    MIN: 0,
    MAX: 12,
    DISTANCE_LEVEL: 0,    // 遠方測試在 Y=0（底線）
    NEAR_LEVEL: 2.5,      // 近方測試在 Y=2.5（40cm = 2.5D）
  },
  X_AXIS: {
    BI_DIRECTION: 'negative',  // BI 為負方向
    BO_DIRECTION: 'positive',  // BO 為正方向
    DEFAULT_MIN: -25,
    DEFAULT_MAX: 45,
  },
  ADD_CONVERSION: {
    // ADD = 2.5 - stimulus（右 Y 軸換算）
    formula: (stimulus: number) => 2.5 - stimulus,
    MIN: -9.5,  // 當 stimulus = 12 時
    MAX: 2.5,   // 當 stimulus = 0 時
  }
} as const;
