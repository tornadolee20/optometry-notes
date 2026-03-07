/**
 * OEP 標準版雙眼視覺機能圖 - 國際標準版
 * 按照國際視光學標準設計（Morgan 1944, Sheard 1930, OEP Clinical Guidelines）
 * 
 * Y 軸座標系統（調節刺激量 D）：
 * - Y 軸範圍 0 ~ 6D，代表「調節刺激量」
 * - 遠方 (Distance, 6m) 固定於 Y = 0.5（約 0D）
 * - 近方 (Near, 40cm) 固定於 Y = 2.5（= 2.5D 調節需求）
 * 
 * X 軸座標系統（斜軸設計，符合國際 OEP 標準）：
 * - 上方 X 軸（近方）：35 BI ← 0 → 35 BO（對稱）
 * - 下方 X 軸（遠方）：20 BI ← 0 → 50 BO（非對稱）
 * - 斜線連接上下軸端點，形成梯形區域
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BarChart2, Maximize2, ChevronDown, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChartTooltip, ChartTooltipData } from './ChartTooltip';
import { FloatingExportButton } from './FloatingExportButton';
import {
  POINT_SYMBOLS,
  BinocularDataPoints,
  calculateDiagnosticResults,
  downloadChartAsPNG,
  downloadChartAsPDF,
  checkAbnormal,
} from '@/lib/oepChartUtils';
import {
  MORGAN_NORMS,
  CriteriaCalculations,
  Y_POSITIONS,
} from '@/lib/criteriaCalculations';
import DiagnosticResultsPanel from './DiagnosticResultsPanel';
import { OEPChartLightbox } from '@/components/ui/OEPChartLightbox';
import { MorganComplianceCard } from './MorganComplianceCard';
import { ACAAnalysisCard } from './ACAAnalysisCard';
// 引入 OEP 幾何引擎
import {
  calculateACA_Calculated,
  calculateACA_Gradient,
  classifyACA,
  calculateDemandPoint,
  OEP_COORDINATE_SYSTEM,
} from '@/utils/oep-geometry';

// ============= Y 軸座標常數（國際標準 0-12D 調節刺激量）=============
// 國際 OEP 標準：Y 軸 0-12D
// 遠方 (6m) 固定於 Y = 0（底線）
// 近方 (40cm) 固定於 Y = 2.5
const Y_AXIS_CONFIG = {
  MIN: 0,           // Y 軸最小值（底線 = 遠方 6m）
  MAX: 12,          // Y 軸最大值
  DISTANCE: 0,      // 遠方數據繪製位置（底線 Y=0）
  NEAR: 2.5,        // 近方數據繪製位置（40cm = 2.5D）
} as const;

// 薄帶高度（Y 軸單位）
const ZONE_HEIGHT = 0.4;

// ADD 換算軸配置（右 Y 軸）
const ADD_AXIS_CONFIG = {
  MIN: -9.5,    // 對應 Y=12 時的 ADD 值
  MAX: 1.5,     // 對應 Y=0 時的 ADD 值（底線）
  // 公式：ADD = 2.5 - Y（40cm 距離 = 2.5D 調節需求）
  fromStimulus: (stimulus: number) => 2.5 - stimulus,
  toStimulus: (add: number) => 2.5 - add,
} as const;

// ============= 區域樣式配置（國際標準 OEP 格式）=============
// Ps Zone = 黃色（依照標準紙本圖）
const ZONE_STYLES = {
  morgan: {
    fill: 'rgba(34, 197, 94, 0.25)',
    stroke: 'rgb(22, 163, 74)',
    strokeWidth: 2.5,
  },
  percival: {
    // Ps Zone = 黃色（標準 OEP 圖規格）
    fill: 'rgba(255, 193, 7, 0.45)',
    stroke: 'rgb(245, 158, 11)',
    strokeWidth: 2.5,
  },
  sheard: {
    stroke: 'rgb(245, 158, 11)',
    strokeWidth: 3,
  },
  // 格線顏色（深色，接近紙本標準）
  grid: {
    major: '#333333',
    minor: '#666666',
  },
};

// ============= AC/A 智慧分析結果介面 =============
interface ACAAnalysisResult {
  calculated: {
    value: number;
    method: 'calculated';
    reliable: boolean;
  };
  gradient?: {
    value: number;
    method: 'gradient';
    addUsed: number;
  };
  displayValue: number;
  displayMethod: 'calculated' | 'gradient';
  reliability: 'high' | 'medium' | 'low';
  needsGradient: boolean;
  warning?: string;
}

interface OEPChartEnhancedProps {
  distPhoria: number;
  nearPhoria: number;
  biBreak: number;
  boBreak: number;
  distBiBreak?: number;
  distBoBreak?: number;
  biBlur?: number;
  boBlur?: number;
  biRecovery?: number;
  boRecovery?: number;
  distBiBlur?: number;
  distBoBlur?: number;
  distBiRecovery?: number;
  distBoRecovery?: number;
  age?: number;
  aaOD?: number;
  aaOS?: number;
  gradientACA?: number | null;
  addPower?: number;
  pd?: number; // 瞳距（毫米）- 用於需求線計算
  className?: string;
}

export const OEPChartEnhanced: React.FC<OEPChartEnhancedProps> = ({
  distPhoria,
  nearPhoria,
  biBreak,
  boBreak,
  distBiBreak,
  distBoBreak,
  biBlur,
  boBlur,
  biRecovery,
  boRecovery,
  distBiBlur,
  distBoBlur,
  distBiRecovery,
  distBoRecovery,
  age = 30,
  aaOD = 8,
  aaOS = 8,
  gradientACA = null,
  addPower = 0,
  pd = 64, // 預設 PD 64mm
  className,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(true);
  const [tooltip, setTooltip] = useState<ChartTooltipData>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const isCN = language === 'zh-CN';
  const isEN = language === 'en';

  const t = (tw: string, cn: string, en: string) =>
    isEN ? en : isCN ? cn : tw;

  // ============= 鍵盤快捷鍵支援 =============
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExport = useCallback(() => {
    if (chartRef.current) {
      downloadChartAsPNG(chartRef.current, 'OEP_Analysis');
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrint, handleExport, isLightboxOpen]);

  // 安全數值處理
  const safeDist = Number.isFinite(distPhoria) ? distPhoria : 0;
  const safeNear = Number.isFinite(nearPhoria) ? nearPhoria : 0;
  const safeBi = Number.isFinite(biBreak) ? biBreak : 10;
  const safeBo = Number.isFinite(boBreak) ? boBreak : 20;
  const safeDistBi = Number.isFinite(distBiBreak) ? distBiBreak : Math.round(safeBi * 0.7);
  const safeDistBo = Number.isFinite(distBoBreak) ? distBoBreak : Math.round(safeBo * 0.5);

  // 構建資料結構
  const data: BinocularDataPoints = {
    distance: {
      phoria: safeDist,
      BI: { blur: distBiBlur, break: safeDistBi, recovery: distBiRecovery },
      BO: { blur: distBoBlur, break: safeDistBo, recovery: distBoRecovery },
    },
    near: {
      phoria: safeNear,
      BI: { blur: biBlur, break: safeBi, recovery: biRecovery },
      BO: { blur: boBlur, break: safeBo, recovery: boRecovery },
    },
  };

  const diagnosticResults = calculateDiagnosticResults(data, language);

  // ============= AC/A 智慧分析（使用 oep-geometry.ts 模組）=============
  const calculateACAComplete = (): ACAAnalysisResult => {
    // 使用 oep-geometry.ts 的計算法 AC/A（假設 PD 64mm）
    const defaultPD = 64; // 預設 PD 值
    const calculatedValue = calculateACA_Calculated(safeDist, safeNear, defaultPD);
    
    const expectedAA = Math.max(0, 18.5 - 0.3 * age);
    const avgAA = (aaOD + aaOS) / 2;
    const aaDeficit = expectedAA - avgAA;
    
    const isPresbyopic = age >= 40;
    const hasAccommodativeDeficit = aaDeficit >= 2.0;
    const calculatedAbnormal = calculatedValue < 2.0;
    const calculatedReliable = !isPresbyopic && !hasAccommodativeDeficit && !calculatedAbnormal;
    const needsGradient = isPresbyopic || hasAccommodativeDeficit || calculatedAbnormal;
    const hasGradient = gradientACA !== null && gradientACA !== undefined;
    
    const result: ACAAnalysisResult = {
      calculated: {
        value: calculatedValue,
        method: 'calculated',
        reliable: calculatedReliable
      },
      displayValue: calculatedValue,
      displayMethod: 'calculated',
      reliability: 'medium',
      needsGradient
    };
    
    if (hasGradient) {
      result.gradient = {
        value: gradientACA!,
        method: 'gradient',
        addUsed: addPower > 0 ? addPower : 1.0
      };
      result.reliability = 'high';
      
      if (needsGradient) {
        result.displayValue = gradientACA!;
        result.displayMethod = 'gradient';
      }
    } else if (needsGradient) {
      result.reliability = 'low';
    }
    
    if (needsGradient && !hasGradient) {
      if (isPresbyopic) {
        result.warning = t(`⚠️ 年齡 ${age} 歲，建議補測梯度法 AC/A`, `⚠️ 年龄 ${age} 岁，建议补测梯度法 AC/A`, `⚠️ Age ${age}, Gradient AC/A recommended`);
      } else if (hasAccommodativeDeficit) {
        result.warning = t(`⚠️ 調節幅度不足 (${avgAA.toFixed(1)}D)，建議補測梯度法`, `⚠️ 调节幅度不足 (${avgAA.toFixed(1)}D)，建议补测梯度法`, `⚠️ AA deficit (${avgAA.toFixed(1)}D), Gradient recommended`);
      }
    }
    
    return result;
  };

  const acaResult = calculateACAComplete();
  const measuredACA = acaResult.displayValue;
  // 使用 oep-geometry.ts 的 classifyACA 函數
  const acaClassificationResult = classifyACA(measuredACA);
  const acaClassification = {
    value: measuredACA,
    classification: language === 'en' ? acaClassificationResult.labelEN : acaClassificationResult.label,
    classificationEN: acaClassificationResult.labelEN,
    color: acaClassificationResult.color,
    isAbnormal: acaClassificationResult.category === 'abnormal',
  };

  // Calculate aaDeficit for ACAAnalysisCard
  const expectedAA = Math.max(0, 18.5 - 0.3 * age);
  const avgAA = (aaOD + aaOS) / 2;
  const aaDeficit = expectedAA - avgAA;

  // ============= 圖表尺寸配置 =============
  const width = 900;
  const height = 650;
  const padding = { top: 80, right: 80, bottom: 80, left: 80 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // ============= Y 軸配置（國際標準 0-12D 調節刺激量）=============
  const yMin = Y_AXIS_CONFIG.MIN;  // 0
  const yMax = Y_AXIS_CONFIG.MAX;  // 12
  const yTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  // ADD 換算軸刻度（對應 Y 軸刻度：ADD = 2.5 - Y）
  const addTicks = [2.5, 1.5, 0.5, -0.5, -1.5, -2.5, -3.5, -4.5, -5.5, -6.5, -7.5, -8.5, -9.5];

  // Y 軸座標轉換（Y=12 在頂部，Y=0 在底部）
  const scaleY = (val: number) => {
    return padding.top + ((yMax - val) / (yMax - yMin)) * plotHeight;
  };

  // 固定 Y 座標
  // 遠方 (6m) 固定於底線 Y=0
  // 近方 (40cm) 固定於 Y=2.5
  const distY = scaleY(Y_AXIS_CONFIG.DISTANCE);  // 0 (底線)
  const nearY = scaleY(Y_AXIS_CONFIG.NEAR);       // 2.5

  // ============= X 軸配置（標準 OEP 雙軸系統 - 使用正值 BASE IN/OUT）=============
  // 需求線計算：X_demand = PD(cm) × D
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pd_cm = pd / 10;
  const demandLineDistance = calculateDemandPoint(pd, 0);     // 遠方 6m: 0Δ
  const demandLineNear = calculateDemandPoint(pd, 2.5);       // 近方 40cm: PD(cm) × 2.5

  // ============= 標準 OEP X 軸配置 =============
  // 頂部 X 軸（近方 40cm）：35 Base In ← 0 → 85 Base Out
  // 底部 X 軸（遠方 6m）：20 Base In ← 0 → 100 Base Out
  // 注意：所有刻度都是正值，BI 在左側，BO 在右側，0 為中央
  const X_AXIS_CONFIG = {
    // 近方 40cm（頂部軸，對應 Y=2.5）
    near: {
      biMax: 35,      // 左端點：35 Base In
      boMax: 85,      // 右端點：85 Base Out
      totalRange: 35 + 85, // 120
      warningZone: 50,
      // 刻度標記（全部正值）
      ticks: [35, 25, 15, 5, 0, 5, 15, 25, 35, 45, 55, 65, 75, 85],
      tickLabels: ['35', '25', '15', '5', '0', '5', '15', '25', '35', '45', '55', '65', '75', '85'],
    },
    // 遠方 6m（底部軸，對應 Y=0）
    distance: {
      biMax: 20,      // 左端點：20 Base In
      boMax: 100,     // 右端點：100 Base Out
      totalRange: 20 + 100, // 120
      warningZone: 40,
      // 刻度標記（全部正值）
      ticks: [20, 10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      tickLabels: ['20', '10', '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
    },
  };

  // ============= X 軸座標轉換函數 =============
  // 內部使用帶符號值：BI = 負值，BO = 正值
  // 這些函數將內部值映射到畫布座標
  
  // 近方 X 軸轉換：內部值 → 畫布 X 座標
  // 內部範圍：-35（BI）到 +85（BO）
  const scaleXNear = (internalValue: number): number => {
    // internalValue: 負值=BI, 正值=BO
    // 畫布上 BI 在左，BO 在右
    const biMax = X_AXIS_CONFIG.near.biMax;
    const boMax = X_AXIS_CONFIG.near.boMax;
    // 將內部值（-biMax ~ +boMax）映射到 (padding.left ~ padding.left + plotWidth)
    return padding.left + ((internalValue + biMax) / (biMax + boMax)) * plotWidth;
  };

  // 遠方 X 軸轉換：內部值 → 畫布 X 座標
  // 內部範圍：-20（BI）到 +100（BO）
  const scaleXDistance = (internalValue: number): number => {
    const biMax = X_AXIS_CONFIG.distance.biMax;
    const boMax = X_AXIS_CONFIG.distance.boMax;
    return padding.left + ((internalValue + biMax) / (biMax + boMax)) * plotWidth;
  };

  // 生成頂部軸刻度位置（用於繪製）
  const generateNearTickPositions = () => {
    const biMax = X_AXIS_CONFIG.near.biMax;
    const boMax = X_AXIS_CONFIG.near.boMax;
    const positions: Array<{ x: number; label: string; isBI: boolean; isZero: boolean }> = [];
    
    // BI 側（35, 25, 15, 5）
    for (let bi = biMax; bi > 0; bi -= 10) {
      positions.push({ x: scaleXNear(-bi), label: `${bi}`, isBI: true, isZero: false });
    }
    // 中央 0
    positions.push({ x: scaleXNear(0), label: '0', isBI: false, isZero: true });
    // BO 側（5, 15, 25, 35, 45, 55, 65, 75, 85）
    for (let bo = 5; bo <= boMax; bo += 10) {
      positions.push({ x: scaleXNear(bo), label: `${bo}`, isBI: false, isZero: false });
    }
    return positions;
  };

  // 生成底部軸刻度位置（用於繪製）
  const generateDistanceTickPositions = () => {
    const biMax = X_AXIS_CONFIG.distance.biMax;
    const boMax = X_AXIS_CONFIG.distance.boMax;
    const positions: Array<{ x: number; label: string; isBI: boolean; isZero: boolean }> = [];
    
    // BI 側（20, 10）
    for (let bi = biMax; bi > 0; bi -= 10) {
      positions.push({ x: scaleXDistance(-bi), label: `${bi}`, isBI: true, isZero: false });
    }
    // 中央 0
    positions.push({ x: scaleXDistance(0), label: '0', isBI: false, isZero: true });
    // BO 側（10, 20, 30, ... 100）
    for (let bo = 10; bo <= boMax; bo += 10) {
      positions.push({ x: scaleXDistance(bo), label: `${bo}`, isBI: false, isZero: false });
    }
    return positions;
  };

  const nearTickPositions = generateNearTickPositions();
  const distanceTickPositions = generateDistanceTickPositions();

  // 舊變數兼容（部分元件仍使用）
  const xMinNear = -X_AXIS_CONFIG.near.biMax;
  const xMaxNear = X_AXIS_CONFIG.near.boMax;
  const xMinDistance = -X_AXIS_CONFIG.distance.biMax;
  const xMaxDistance = X_AXIS_CONFIG.distance.boMax;

  // 檢查數據點是否超出顯示範圍
  const checkOutOfRange = (value: number, type: 'near' | 'distance', direction: 'bi' | 'bo') => {
    const config = X_AXIS_CONFIG[type];
    const maxVal = direction === 'bi' ? config.biMax : config.boMax;
    const absValue = Math.abs(value);
    
    if (absValue > maxVal) {
      // 超出範圍
      const clampedInternal = direction === 'bi' ? -maxVal : maxVal;
      return { outOfRange: true, displayValue: clampedInternal, actualValue: value, direction: direction === 'bi' ? 'left' as const : 'right' as const };
    }
    const internalValue = direction === 'bi' ? -absValue : absValue;
    return { outOfRange: false, displayValue: internalValue, actualValue: value, direction: null };
  };

  // 檢查數據點是否在警告區域
  const isInWarningZone = (value: number, type: 'near' | 'distance') => {
    const config = X_AXIS_CONFIG[type];
    return Math.abs(value) > config.warningZone;
  };

  // Morgan 常模計算
  const distMorganXMin = MORGAN_NORMS.distance.phoria.min;
  const distMorganXMax = MORGAN_NORMS.distance.phoria.max;
  const nearMorganXMin = MORGAN_NORMS.near.phoria.min;
  const nearMorganXMax = MORGAN_NORMS.near.phoria.max;

  const distMorganLeftX = scaleXDistance(distMorganXMin);
  const distMorganRightX = scaleXDistance(distMorganXMax);
  const nearMorganLeftX = scaleXNear(nearMorganXMin);
  const nearMorganRightX = scaleXNear(nearMorganXMax);

  const zoneHeightPx = Math.abs(scaleY(1) - scaleY(1 + ZONE_HEIGHT));

  // Sheard 準則
  const distSheardDemand = Math.abs(safeDist) * 2;
  const nearSheardDemand = Math.abs(safeNear) * 2;
  const distSheardEndX = safeDist < 0 ? scaleXDistance(distSheardDemand) : scaleXDistance(-distSheardDemand);
  const nearSheardEndX = safeNear < 0 ? scaleXNear(nearSheardDemand) : scaleXNear(-nearSheardDemand);

  // Percival 準則
  const distPercivalZone = CriteriaCalculations.getPercivalZoneRange(safeDist, safeDistBi, safeDistBo);
  const nearPercivalZone = CriteriaCalculations.getPercivalZoneRange(safeNear, safeBi, safeBo);
  const distPercivalLeftX = scaleXDistance(distPercivalZone.left);
  const distPercivalRightX = scaleXDistance(distPercivalZone.right);
  const nearPercivalLeftX = scaleXNear(nearPercivalZone.left);
  const nearPercivalRightX = scaleXNear(nearPercivalZone.right);

  // Morgan 常模符合度
  const distMorganCompliant = CriteriaCalculations.checkMorgan(safeDist, 'distance');
  const nearMorganCompliant = CriteriaCalculations.checkMorgan(safeNear, 'near');

  // 下載處理
  const handleDownloadPNG = async () => {
    if (chartRef.current) {
      await downloadChartAsPNG(chartRef.current, 'OEP_Analysis');
    }
  };

  const handleDownloadPDF = async () => {
    if (chartRef.current) {
      await downloadChartAsPDF(chartRef.current, 'OEP_Analysis');
    }
  };

  // ============= 資料點渲染組件 =============
  const DataPoint = ({
    x,
    y,
    type,
    value,
    isAbnormal,
    severity,
    showValue = true,
  }: {
    x: number;
    y: number;
    type: keyof typeof POINT_SYMBOLS;
    value: number;
    isAbnormal: boolean;
    severity: 'normal' | 'warning' | 'critical';
    showValue?: boolean;
  }) => {
    const symbol = POINT_SYMBOLS[type];
    const displayValue = value !== undefined && Number.isFinite(value)
      ? (Math.abs(value) < 1 ? value.toFixed(1) : value.toFixed(0))
      : '';

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <g className="cursor-pointer transition-transform hover:scale-125">
              {isAbnormal && (
                <circle
                  cx={x}
                  cy={y}
                  r={severity === 'critical' ? 24 : 18}
                  fill={severity === 'critical' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.3)'}
                  className={severity === 'critical' ? 'animate-pulse' : ''}
                />
              )}
              <circle cx={x} cy={y} r={12} fill="transparent" className="touch-target" />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isAbnormal ? (severity === 'critical' ? '#dc2626' : '#f59e0b') : symbol.color}
                fontSize="24"
                fontWeight="bold"
                className="select-none"
              >
                {symbol.symbol}
              </text>
              {showValue && displayValue && (
                <text
                  x={x}
                  y={y + 22}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill={isAbnormal ? (severity === 'critical' ? '#dc2626' : '#f59e0b') : '#374151'}
                >
                  {displayValue}
                </text>
              )}
            </g>
          </TooltipTrigger>
          <TooltipContent className="text-base p-3">
            <p className="font-semibold">
              {isEN ? symbol.labelEN : symbol.label}: {displayValue}Δ
            </p>
            {isAbnormal && (
              <p className="text-destructive text-sm mt-1">
                ⚠️ {t('異常', '异常', 'Abnormal')}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // ============= P1-1: 放大版圖例組件 =============
  const LegendContent = () => (
    <div className="space-y-3">
      {/* 符號說明 */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">{t('符號說明', '符号说明', 'Symbols')}</div>
        {/* Phoria */}
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
            <circle cx="10" cy="10" r="8" fill="hsl(var(--primary))" />
            <text x="10" y="10" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="12" fontWeight="bold">×</text>
          </svg>
          <span className="text-sm">{t('斜位 Phoria', '斜位 Phoria', 'Phoria')}</span>
        </div>
        {/* Break */}
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
            <text x="10" y="15" textAnchor="middle" fontSize="18" fontWeight="bold" fill="hsl(var(--success))">□</text>
          </svg>
          <span className="text-sm">{t('破裂點 Break', '破裂点 Break', 'Break')}</span>
        </div>
        {/* Blur */}
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
            <text x="10" y="15" textAnchor="middle" fontSize="18" fontWeight="bold" fill="hsl(var(--destructive))">○</text>
          </svg>
          <span className="text-sm">{t('模糊點 Blur', '模糊点 Blur', 'Blur')}</span>
        </div>
        {/* Recovery */}
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
            <text x="10" y="15" textAnchor="middle" fontSize="18" fontWeight="bold" fill="hsl(var(--warning))">△</text>
          </svg>
          <span className="text-sm">{t('恢復點 Recovery', '恢复点 Recovery', 'Recovery')}</span>
        </div>
      </div>
      {/* 準則說明 */}
      <div className="space-y-2 pt-2 border-t">
        <div className="text-xs font-semibold text-muted-foreground">{t('臨床準則', '临床准则', 'Criteria')}</div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-4 rounded" style={{ background: ZONE_STYLES.morgan.fill, border: `2px solid ${ZONE_STYLES.morgan.stroke}` }}></div>
          <span className="text-xs">Morgan {t('常模區', '常模区', 'Zone')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0 border-t-[3px] border-dashed" style={{ borderColor: ZONE_STYLES.sheard.stroke }}></div>
          <span className="text-xs">Sheard 2×{t('斜位', '斜位', 'Phoria')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-4 rounded" style={{ background: ZONE_STYLES.percival.fill, border: `2px solid ${ZONE_STYLES.percival.stroke}` }}></div>
          <span className="text-xs">Ps (Percival 1/3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0 border-t-2 border-dashed border-primary"></div>
          <span className="text-xs">AC/A {t('實測線', '实测线', 'Line')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0 border-t-[2.5px] border-dashed" style={{ borderColor: 'hsl(0 70% 50%)' }}></div>
          <span className="text-xs">{t('需求線 P.D.', '需求线 P.D.', 'Demand Line')}</span>
        </div>
      </div>
    </div>
  );

  // ============= 主圖表 SVG =============
  const ChartSVG = ({ scaleFactor = 1, showHeader = true }: { scaleFactor?: number; showHeader?: boolean }) => (
    <div className="relative w-full h-full flex flex-col">
      {/* P0-2：斜位數值 Header */}
      {showHeader && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 w-11/12 md:w-auto">
          <div className="bg-card/95 dark:bg-card/90 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg border-2 border-primary">
            <div className="flex gap-4 md:gap-8 text-center justify-center">
              <div className="flex-1 md:flex-none">
                <div className="text-[10px] md:text-xs text-muted-foreground mb-1">{t('遠方 (6m)', '远方 (6m)', 'Distance (6m)')}</div>
                <div className={cn(
                  "text-xl md:text-3xl font-bold tabular-nums",
                  distMorganCompliant ? "text-success" : "text-destructive"
                )}>
                  {safeDist === 0 ? 'Ortho' : `${safeDist > 0 ? '+' : ''}${safeDist.toFixed(0)}△`}
                </div>
                <div className="text-[9px] md:text-[10px] text-muted-foreground">
                  {safeDist === 0 ? '' : safeDist > 0 ? t('內斜', '内斜', 'Eso') : t('外斜', '外斜', 'Exo')}
                </div>
              </div>
              <div className="w-px bg-border" />
              <div className="flex-1 md:flex-none">
                <div className="text-[10px] md:text-xs text-muted-foreground mb-1">{t('近方 (40cm)', '近方 (40cm)', 'Near (40cm)')}</div>
                <div className={cn(
                  "text-xl md:text-3xl font-bold tabular-nums",
                  nearMorganCompliant ? "text-success" : "text-destructive"
                )}>
                  {safeNear === 0 ? 'Ortho' : `${safeNear > 0 ? '+' : ''}${safeNear.toFixed(0)}△`}
                </div>
                <div className="text-[9px] md:text-[10px] text-muted-foreground">
                  {safeNear === 0 ? '' : safeNear > 0 ? t('內斜', '内斜', 'Eso') : t('外斜', '外斜', 'Exo')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SVG 圖表 */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={cn("w-full h-full overflow-visible", showHeader && "mt-16 md:mt-20")}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={t('OEP 雙眼視覺機能圖', 'OEP 双眼视觉机能图', 'OEP Binocular Vision Graph')}
        tabIndex={0}
        style={{ minHeight: scaleFactor > 1 ? '550px' : undefined }}
      >
        <title>{t('OEP 雙眼視覺機能圖表', 'OEP 双眼视觉机能图表', 'OEP Binocular Vision Chart')}</title>
        <defs>
          <linearGradient id="morganZoneGradientOpt" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={ZONE_STYLES.morgan.stroke} stopOpacity="0.2" />
            <stop offset="100%" stopColor={ZONE_STYLES.morgan.stroke} stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* 圖表標題 */}
        <text x={width / 2} y={25} textAnchor="middle" fontSize="16" fontWeight="700" className="fill-foreground">
          {t('OEP 雙眼視覺機能圖（Graphical Analysis）', 'OEP 双眼视觉机能图（Graphical Analysis）', 'OEP Graphical Analysis of Binocular Vision')}
        </text>
        <text x={width / 2} y={45} textAnchor="middle" fontSize="10" className="fill-muted-foreground">
          {t(
            `頂部刻度：40cm 測量距離｜底部刻度：6m 測量距離｜需求線 P.D.=${pd}mm`,
            `顶部刻度：40cm 测量距离｜底部刻度：6m 测量距离｜需求线 P.D.=${pd}mm`,
            `Top Scale: 40cm｜Bottom Scale: 6m｜Demand Line P.D.=${pd}mm`
          )}
        </text>

        {/* 背景 */}
        <rect
          x={padding.left}
          y={padding.top}
          width={plotWidth}
          height={plotHeight}
          className="fill-card stroke-border"
          strokeWidth={2}
        />

        {/* 明確標示 Y=2.5 水平線（近方測量線）- 虛線 */}
        <line
          x1={padding.left}
          y1={nearY}
          x2={width - padding.right}
          y2={nearY}
          stroke={ZONE_STYLES.grid.major}
          strokeWidth={2}
          strokeDasharray="8 4"
          strokeOpacity={0.8}
        />
        
        {/* 明確標示 Y=0 水平線（遠方底線）- 實線 */}
        <line
          x1={padding.left}
          y1={distY}
          x2={width - padding.right}
          y2={distY}
          stroke={ZONE_STYLES.grid.major}
          strokeWidth={2.5}
        />

        {/* 斜軸邊界線 - 連接上下 X 軸形成梯形區域 */}
        {/* 左邊界：近方 35 BI → 遠方 20 BI */}
        <line
          x1={scaleXNear(xMinNear)}
          y1={nearY}
          x2={scaleXDistance(xMinDistance)}
          y2={distY}
          stroke={ZONE_STYLES.grid.major}
          strokeOpacity={0.6}
          strokeWidth={1.5}
        />
        {/* 右邊界：近方 35 BO → 遠方 50 BO */}
        <line
          x1={scaleXNear(xMaxNear)}
          y1={nearY}
          x2={scaleXDistance(xMaxDistance)}
          y2={distY}
          stroke={ZONE_STYLES.grid.major}
          strokeOpacity={0.6}
          strokeWidth={1.5}
        />
        {/* 中央零線（垂直）*/}
        <line
          x1={scaleXNear(0)}
          y1={nearY}
          x2={scaleXDistance(0)}
          y2={distY}
          stroke={ZONE_STYLES.grid.major}
          strokeOpacity={0.8}
          strokeWidth={2}
          strokeDasharray="6 3"
        />

        {/* 水平網格線（0-12D 調節刺激量）- 深色格線符合紙本標準 */}
        {yTicks.map((tick) => {
          // 主要數據線：Y=0（遠方底線）和 Y=2.5 附近（近方）
          const isBottomLine = tick === 0;
          const isNearLine = tick === 2 || tick === 3;
          const isMainLine = isBottomLine || isNearLine;
          
          return (
            <line
              key={`hgrid-${tick}`}
              x1={padding.left}
              y1={scaleY(tick)}
              x2={width - padding.right}
              y2={scaleY(tick)}
              stroke={ZONE_STYLES.grid.major}
              strokeOpacity={isMainLine ? 1 : 0.6}
              strokeWidth={isMainLine ? 1.5 : 1}
            />
          );
        })}

        {/* 垂直網格線（從近方頂部到遠方底線）*/}
        {/* 使用斜軸設計連接上下 X 軸 */}
        {nearTickPositions.filter((_, i) => i % 2 === 0).map((pos, i) => {
          // 計算對應的遠方位置（斜軸插值）
          const ratio = (pos.x - padding.left) / plotWidth;
          const xDist = padding.left + ratio * plotWidth;
          
          return (
            <line
              key={`vgrid-${i}`}
              x1={pos.x}
              y1={scaleY(9)} // 從 Y=9 開始（接近圖表頂部）
              x2={xDist}
              y2={scaleY(yMin)} // 底線 Y=0
              stroke={ZONE_STYLES.grid.minor}
              strokeOpacity={pos.isZero ? 0.8 : 0.5}
              strokeWidth={pos.isZero ? 1.5 : 1}
            />
          );
        })}

        {/* Morgan 區域（遠距）*/}
        <rect
          x={Math.min(distMorganLeftX, distMorganRightX)}
          y={distY - zoneHeightPx / 2}
          width={Math.abs(distMorganRightX - distMorganLeftX)}
          height={zoneHeightPx}
          fill="url(#morganZoneGradientOpt)"
          stroke={ZONE_STYLES.morgan.stroke}
          strokeWidth={ZONE_STYLES.morgan.strokeWidth}
          strokeDasharray="6 3"
          className="cursor-help"
          onMouseEnter={(e) => setTooltip({
            visible: true, x: e.clientX, y: e.clientY,
            content: {
              title: t('Morgan 常模區（遠距）', 'Morgan 常模区（远距）', 'Morgan Zone (Distance)'),
              description: t('Morgan 1944 年期望值：-1 至 +2Δ', 'Morgan 1944 年期望值：-1 至 +2Δ', 'Morgan 1944: -1 to +2Δ'),
            },
          })}
          onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
        />

        {/* Morgan 區域（近距）*/}
        <rect
          x={Math.min(nearMorganLeftX, nearMorganRightX)}
          y={nearY - zoneHeightPx / 2}
          width={Math.abs(nearMorganRightX - nearMorganLeftX)}
          height={zoneHeightPx}
          fill="url(#morganZoneGradientOpt)"
          stroke={ZONE_STYLES.morgan.stroke}
          strokeWidth={ZONE_STYLES.morgan.strokeWidth}
          strokeDasharray="6 3"
          className="cursor-help"
          onMouseEnter={(e) => setTooltip({
            visible: true, x: e.clientX, y: e.clientY,
            content: {
              title: t('Morgan 常模區（近距）', 'Morgan 常模区（近距）', 'Morgan Zone (Near)'),
              description: t('Morgan 1944 年期望值：-6 至 0Δ', 'Morgan 1944 年期望值：-6 至 0Δ', 'Morgan 1944: -6 to 0Δ'),
            },
          })}
          onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
        />

        {/* Ps Zone（Percival 舒適區 - 大型梯形黃色區域）*/}
        {/* 按照標準 OEP 圖，Ps Zone 從 Y=12（頂部）延伸到 Y=0（底線）形成梯形區域 */}
        <g className="cursor-help">
          {/* 計算 Y=12（頂部）處的 X 座標（近方刻度延伸）*/}
          {(() => {
            // 在 Y=12（圖表頂部）處使用近方比例計算 X 座標
            const y12 = scaleY(12);
            // Percival zone 在 Y=12 處的左右邊界
            // 使用與近方相同的相對比例
            const percivalLeftAtY12 = nearPercivalLeftX;
            const percivalRightAtY12 = nearPercivalRightX;
            
            return (
              <>
                {/* 梯形 Ps Zone（黃色填充）- 從 Y=12 到 Y=0 */}
                <polygon
                  points={`
                    ${percivalLeftAtY12},${y12}
                    ${percivalRightAtY12},${y12}
                    ${distPercivalRightX},${distY}
                    ${distPercivalLeftX},${distY}
                  `}
                  fill={ZONE_STYLES.percival.fill}
                  stroke={ZONE_STYLES.percival.stroke}
                  strokeWidth={ZONE_STYLES.percival.strokeWidth}
                  onMouseEnter={(e) => setTooltip({
                    visible: true, x: e.clientX, y: e.clientY,
                    content: {
                      title: t('Ps Zone（Percival 舒適區）', 'Ps Zone（Percival 舒适区）', 'Ps Zone (Percival Comfort Zone)'),
                      description: t('1/3 準則：小儲備 ≥ 大儲備 / 3，黃色區域為舒適融像範圍', '1/3 准则：小储备 ≥ 大储备 / 3，黄色区域为舒适融像范围', 'Percival 1/3 Rule: Lesser ≥ Greater / 3, yellow area is comfort zone'),
                    },
                  })}
                  onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                />
                {/* Ps 標籤 - 放在黃色區域內 */}
                <rect
                  x={padding.left + 25}
                  y={scaleY(7) - 14}
                  width={32}
                  height={28}
                  fill="#1a1a1a"
                  stroke="white"
                  strokeWidth={1}
                  rx={3}
                />
                <text
                  x={padding.left + 41}
                  y={scaleY(7)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  fontWeight="bold"
                  fill="white"
                >
                  Ps
                </text>
              </>
            );
          })()}
        </g>

        {/* Sheard 線（遠距）*/}
        {distSheardDemand > 0 && (
          <g>
            <line
              x1={scaleXDistance(safeDist)}
              y1={distY}
              x2={distSheardEndX}
              y2={distY}
              stroke={ZONE_STYLES.sheard.stroke}
              strokeWidth={ZONE_STYLES.sheard.strokeWidth}
              strokeDasharray="8 4"
            />
            <circle cx={distSheardEndX} cy={distY} r={5} fill={ZONE_STYLES.sheard.stroke} stroke="white" strokeWidth={2} />
            <text x={(scaleXDistance(safeDist) + distSheardEndX) / 2} y={distY - 10} textAnchor="middle" fontSize="10" fill={ZONE_STYLES.sheard.stroke} fontWeight="600">
              Sheard: {distSheardDemand.toFixed(0)}Δ
            </text>
          </g>
        )}

        {/* Sheard 線（近距）*/}
        {nearSheardDemand > 0 && (
          <g>
            <line
              x1={scaleXNear(safeNear)}
              y1={nearY}
              x2={nearSheardEndX}
              y2={nearY}
              stroke={ZONE_STYLES.sheard.stroke}
              strokeWidth={ZONE_STYLES.sheard.strokeWidth}
              strokeDasharray="8 4"
            />
            <circle cx={nearSheardEndX} cy={nearY} r={5} fill={ZONE_STYLES.sheard.stroke} stroke="white" strokeWidth={2} />
            <text x={(scaleXNear(safeNear) + nearSheardEndX) / 2} y={nearY + 20} textAnchor="middle" fontSize="10" fill={ZONE_STYLES.sheard.stroke} fontWeight="600">
              Sheard: {nearSheardDemand.toFixed(0)}Δ
            </text>
          </g>
        )}

        {/* 警告區域（BO 高值區）*/}
        {/* 近方 BO 警告區 */}
        {X_AXIS_CONFIG.near.warningZone < X_AXIS_CONFIG.near.boMax && (
          <g className="cursor-help">
            <rect
              x={scaleXNear(X_AXIS_CONFIG.near.warningZone)}
              y={nearY - zoneHeightPx}
              width={scaleXNear(X_AXIS_CONFIG.near.boMax) - scaleXNear(X_AXIS_CONFIG.near.warningZone)}
              height={zoneHeightPx * 2}
              fill="rgba(239, 68, 68, 0.12)"
              stroke="rgb(239, 68, 68)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              rx={4}
              onMouseEnter={(e) => setTooltip({
                visible: true, x: e.clientX, y: e.clientY,
                content: {
                  title: t('⚠ 罕見範圍（近方 BO）', '⚠ 罕见范围（近方 BO）', '⚠ Rare Range (Near BO)'),
                  description: t(`BO 值 >${X_AXIS_CONFIG.near.warningZone}Δ 在臨床上極少見`, `BO 值 >${X_AXIS_CONFIG.near.warningZone}Δ 在临床上极少见`, `BO >${X_AXIS_CONFIG.near.warningZone}Δ is clinically rare`),
                },
              })}
              onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
            />
            <text x={scaleXNear((X_AXIS_CONFIG.near.warningZone + X_AXIS_CONFIG.near.boMax) / 2)} y={nearY - zoneHeightPx - 8} textAnchor="middle" fontSize="9" fill="rgb(239, 68, 68)" fontWeight="600">
              ⚠ {t('罕見', '罕见', 'Rare')}
            </text>
          </g>
        )}

        {/* 遠方 BO 警告區 */}
        {X_AXIS_CONFIG.distance.warningZone < X_AXIS_CONFIG.distance.boMax && (
          <g className="cursor-help">
            <rect
              x={scaleXDistance(X_AXIS_CONFIG.distance.warningZone)}
              y={distY - zoneHeightPx}
              width={scaleXDistance(X_AXIS_CONFIG.distance.boMax) - scaleXDistance(X_AXIS_CONFIG.distance.warningZone)}
              height={zoneHeightPx * 2}
              fill="rgba(239, 68, 68, 0.12)"
              stroke="rgb(239, 68, 68)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              rx={4}
              onMouseEnter={(e) => setTooltip({
                visible: true, x: e.clientX, y: e.clientY,
                content: {
                  title: t('⚠ 極少見（遠方 BO）', '⚠ 极少见（远方 BO）', '⚠ Very Rare (Distance BO)'),
                  description: t(`BO 值 >${X_AXIS_CONFIG.distance.warningZone}Δ 在臨床上極少見`, `BO 值 >${X_AXIS_CONFIG.distance.warningZone}Δ 在临床上极少见`, `BO >${X_AXIS_CONFIG.distance.warningZone}Δ is clinically very rare`),
                },
              })}
              onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
            />
            <text x={scaleXDistance((X_AXIS_CONFIG.distance.warningZone + X_AXIS_CONFIG.distance.boMax) / 2)} y={distY + zoneHeightPx + 15} textAnchor="middle" fontSize="9" fill="rgb(239, 68, 68)" fontWeight="600">
              ⚠ {t('極少見', '极少见', 'Very Rare')}
            </text>
          </g>
        )}

        {/* 需求線（Demand Line）- 從遠方底線到近方 Y=2.5 */}
        <g>
          {/* 需求線（紅色虛線）- 連接 (0, Y=0) 到 (PD×2.5, Y=2.5) */}
          <line
            x1={scaleXDistance(demandLineDistance)}
            y1={distY}
            x2={scaleXNear(demandLineNear)}
            y2={nearY}
            stroke="hsl(0 70% 50%)"
            strokeWidth={2.5}
            strokeDasharray="10 5"
            opacity={0.8}
          />
          {/* 需求線標籤（遠方端點）*/}
          <circle cx={scaleXDistance(demandLineDistance)} cy={distY} r={4} fill="hsl(0 70% 50%)" stroke="white" strokeWidth={1.5} />
          <text x={scaleXDistance(demandLineDistance) + 8} y={distY - 12} fontSize="10" fill="hsl(0 70% 50%)" fontWeight="600">
            {t('需求線 0Δ', '需求线 0Δ', 'Demand 0Δ')}
          </text>
          {/* 需求線標籤（近方端點）*/}
          <circle cx={scaleXNear(demandLineNear)} cy={nearY} r={4} fill="hsl(0 70% 50%)" stroke="white" strokeWidth={1.5} />
          <text x={scaleXNear(demandLineNear) + 8} y={nearY - 12} fontSize="10" fill="hsl(0 70% 50%)" fontWeight="600">
            {t(`需求線 ${demandLineNear.toFixed(0)}Δ`, `需求线 ${demandLineNear.toFixed(0)}Δ`, `Demand ${demandLineNear.toFixed(0)}Δ`)}
          </text>
          {/* 需求線公式說明 */}
          <text x={scaleXNear(demandLineNear) + 8} y={nearY + 5} fontSize="9" fill="hsl(0 70% 50%)" opacity={0.8}>
            PD={pd}mm × 2.5D
          </text>
        </g>

        {/* 測量距離標註（左側）*/}
        {/* 近方標註 - 在 Y=2.5 高度 */}
        <text x={padding.left - 10} y={nearY - 15} textAnchor="end" fontSize="11" className="fill-primary" fontWeight="600">
          {t('近方 40cm', '近方 40cm', 'Near 40cm')}
        </text>
        <text x={padding.left - 10} y={nearY + 4} textAnchor="end" fontSize="12" className="fill-primary" fontWeight="700">
          Y=2.5
        </text>
        
        {/* 遠方標註 - 在 Y=0 高度（底線）*/}
        <text x={padding.left - 10} y={distY - 15} textAnchor="end" fontSize="11" className="fill-foreground" fontWeight="600">
          {t('遠方 6m', '远方 6m', 'Distance 6m')}
        </text>
        <text x={padding.left - 10} y={distY + 4} textAnchor="end" fontSize="12" className="fill-foreground" fontWeight="700">
          Y=0
        </text>

        {/* 右側數據區標註 */}
        <text x={width - padding.right + 10} y={nearY + 4} textAnchor="start" fontSize="10" className="fill-primary">
          {t('近方數據', '近方数据', 'Near Data')}
        </text>
        <text x={width - padding.right + 10} y={distY + 4} textAnchor="start" fontSize="10" className="fill-muted-foreground">
          {t('遠方數據', '远方数据', 'Distance Data')}
        </text>

        {/* ============= 雙 X 軸系統 ============= */}
        
        {/* 頂部 X 軸（近方 40cm - 標準 OEP 格式）*/}
        <g>
          {/* 軸標題 */}
          <text x={padding.left + plotWidth * 0.08} y={padding.top - 55} textAnchor="middle" fontSize="13" fontWeight="700" className="fill-foreground">
            BASE IN
          </text>
          <text x={padding.left + plotWidth * 0.5} y={padding.top - 55} textAnchor="middle" fontSize="11" fontWeight="500" className="fill-muted-foreground">
            {t('Prism scale at 40 cm.', 'Prism scale at 40 cm.', 'Prism scale at 40 cm.')}
          </text>
          <text x={padding.left + plotWidth * 0.92} y={padding.top - 55} textAnchor="middle" fontSize="13" fontWeight="700" className="fill-foreground">
            BASE OUT
          </text>
          {/* 近方刻度線（全正值）*/}
          {nearTickPositions.map((pos, i) => (
            <g key={`top-tick-${i}`}>
              <line
                x1={pos.x}
                y1={padding.top - 3}
                x2={pos.x}
                y2={padding.top - 12}
                stroke={pos.isZero ? 'hsl(var(--primary))' : 'currentColor'}
                strokeWidth={pos.isZero ? 2 : 1}
                className={pos.isZero ? '' : 'stroke-muted-foreground'}
              />
              <text
                x={pos.x}
                y={padding.top - 16}
                textAnchor="middle"
                fontSize={pos.isZero ? '11' : '9'}
                fontWeight={pos.isZero ? '700' : '400'}
                className={pos.isZero ? 'fill-primary' : 'fill-muted-foreground'}
              >
                {pos.label}
              </text>
            </g>
          ))}
          {/* 需求線標記（在近方軸上的位置）*/}
          <text x={scaleXNear(demandLineNear)} y={padding.top - 30} textAnchor="middle" fontSize="9" fill="hsl(0 70% 50%)" fontWeight="600">
            {t(`需求線 ${demandLineNear.toFixed(0)}Δ`, `需求线 ${demandLineNear.toFixed(0)}Δ`, `Demand ${demandLineNear.toFixed(0)}Δ`)}
          </text>
        </g>

        {/* 底部 X 軸（遠方 6m - 標準 OEP 格式）*/}
        <g>
          {/* 軸標題 */}
          <text x={padding.left + plotWidth * 0.08} y={height - padding.bottom + 60} textAnchor="middle" fontSize="13" fontWeight="700" className="fill-foreground">
            BASE IN
          </text>
          <text x={padding.left + plotWidth * 0.5} y={height - padding.bottom + 60} textAnchor="middle" fontSize="11" fontWeight="500" className="fill-muted-foreground">
            {t('Prism scale at 6m.', 'Prism scale at 6m.', 'Prism scale at 6m.')}
          </text>
          <text x={padding.left + plotWidth * 0.92} y={height - padding.bottom + 60} textAnchor="middle" fontSize="13" fontWeight="700" className="fill-foreground">
            BASE OUT
          </text>
          {/* 遠方刻度線（全正值）*/}
          {distanceTickPositions.map((pos, i) => (
            <g key={`bottom-tick-${i}`}>
              <line
                x1={pos.x}
                y1={height - padding.bottom + 3}
                x2={pos.x}
                y2={height - padding.bottom + 12}
                stroke={pos.isZero ? 'hsl(var(--primary))' : 'currentColor'}
                strokeWidth={pos.isZero ? 2 : 1}
                className={pos.isZero ? '' : 'stroke-muted-foreground'}
              />
              <text
                x={pos.x}
                y={height - padding.bottom + 25}
                textAnchor="middle"
                fontSize="10"
                fontWeight={pos.isZero ? '600' : '400'}
                className={pos.isZero ? 'fill-primary' : 'fill-muted-foreground'}
              >
                {pos.label}
              </text>
            </g>
          ))}
        </g>

        {/* 左側 Y 軸（調節刺激量 1-12D）*/}
        <g>
          <text
            x={padding.left - 55}
            y={height / 2}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            className="fill-foreground"
            transform={`rotate(-90, ${padding.left - 55}, ${height / 2})`}
          >
            {t('調節刺激量 (D)', '调节刺激量 (D)', 'Accommodative Stimulus (D)')}
          </text>
          {yTicks.map((tick) => (
            <text key={`y-left-${tick}`} x={padding.left - 12} y={scaleY(tick)} textAnchor="end" dominantBaseline="middle" fontSize="10" className="fill-muted-foreground">
              {tick}
            </text>
          ))}
        </g>
        
        {/* 右側 Y 軸（ADD 換算值）*/}
        <g>
          <text
            x={width - padding.right + 55}
            y={height / 2}
            textAnchor="middle"
            fontSize="12"
            className="fill-muted-foreground"
            transform={`rotate(90, ${width - padding.right + 55}, ${height / 2})`}
          >
            {t('ADD 換算值 (40cm)', 'ADD 换算值 (40cm)', 'ADD Conversion (40cm)')}
          </text>
          {addTicks.map((addVal, i) => {
            const stimulusVal = yTicks[i];
            return (
              <text 
                key={`y-right-${i}`} 
                x={width - padding.right + 12} 
                y={scaleY(stimulusVal)} 
                textAnchor="start" 
                dominantBaseline="middle" 
                fontSize="10" 
                className="fill-muted-foreground"
              >
                {addVal > 0 ? `+${addVal.toFixed(1)}` : addVal.toFixed(1)}
              </text>
            );
          })}
        </g>

        {/* 遠距資料點 */}
        <g className="animate-fade-in">
          {/* 斜位點 */}
          <g transform={`translate(${scaleXDistance(safeDist)}, ${distY})`}>
            <circle cx={0} cy={0} r={10} fill={distMorganCompliant ? "hsl(var(--success))" : "hsl(var(--destructive))"} stroke="white" strokeWidth={2} />
            <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="14" fontWeight="bold">×</text>
            <text x={0} y={-22} textAnchor="middle" fontSize="12" fill={distMorganCompliant ? "hsl(var(--success))" : "hsl(var(--destructive))"} fontWeight="700">
              {safeDist.toFixed(0)}Δ {distMorganCompliant ? '✓' : '✗'}
            </text>
          </g>

          {/* BI Break */}
          <DataPoint x={scaleXDistance(-safeDistBi)} y={distY} type="break" value={safeDistBi} isAbnormal={checkAbnormal(safeDistBi, 'distance', 'BI', language).isAbnormal} severity={checkAbnormal(safeDistBi, 'distance', 'BI', language).severity} />
          {/* BO Break */}
          <DataPoint x={scaleXDistance(safeDistBo)} y={distY} type="break" value={safeDistBo} isAbnormal={checkAbnormal(safeDistBo, 'distance', 'BO', language).isAbnormal} severity={checkAbnormal(safeDistBo, 'distance', 'BO', language).severity} />
          {/* Optional points */}
          {data.distance.BI.blur !== undefined && <DataPoint x={scaleXDistance(-data.distance.BI.blur)} y={distY - 15} type="blur" value={data.distance.BI.blur} isAbnormal={false} severity="normal" />}
          {data.distance.BO.blur !== undefined && <DataPoint x={scaleXDistance(data.distance.BO.blur)} y={distY - 15} type="blur" value={data.distance.BO.blur} isAbnormal={false} severity="normal" />}
          {data.distance.BI.recovery !== undefined && <DataPoint x={scaleXDistance(-data.distance.BI.recovery)} y={distY + 15} type="recovery" value={data.distance.BI.recovery} isAbnormal={false} severity="normal" />}
          {data.distance.BO.recovery !== undefined && <DataPoint x={scaleXDistance(data.distance.BO.recovery)} y={distY + 15} type="recovery" value={data.distance.BO.recovery} isAbnormal={false} severity="normal" />}
        </g>

        {/* 近距資料點 */}
        <g className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* 斜位點 */}
          <g transform={`translate(${scaleXNear(safeNear)}, ${nearY})`}>
            <circle cx={0} cy={0} r={10} fill={nearMorganCompliant ? "hsl(var(--success))" : "hsl(var(--destructive))"} stroke="white" strokeWidth={2} />
            <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="14" fontWeight="bold">×</text>
            <text x={0} y={-22} textAnchor="middle" fontSize="12" fill={nearMorganCompliant ? "hsl(var(--success))" : "hsl(var(--destructive))"} fontWeight="700">
              {safeNear.toFixed(0)}Δ {nearMorganCompliant ? '✓' : '✗'}
            </text>
          </g>

          {/* BI Break */}
          <DataPoint x={scaleXNear(-safeBi)} y={nearY} type="break" value={safeBi} isAbnormal={checkAbnormal(safeBi, 'near', 'BI', language).isAbnormal} severity={checkAbnormal(safeBi, 'near', 'BI', language).severity} />
          {/* BO Break */}
          <DataPoint x={scaleXNear(safeBo)} y={nearY} type="break" value={safeBo} isAbnormal={checkAbnormal(safeBo, 'near', 'BO', language).isAbnormal} severity={checkAbnormal(safeBo, 'near', 'BO', language).severity} />
          {/* Optional points */}
          {data.near.BI.blur !== undefined && <DataPoint x={scaleXNear(-data.near.BI.blur)} y={nearY - 15} type="blur" value={data.near.BI.blur} isAbnormal={false} severity="normal" />}
          {data.near.BO.blur !== undefined && <DataPoint x={scaleXNear(data.near.BO.blur)} y={nearY - 15} type="blur" value={data.near.BO.blur} isAbnormal={false} severity="normal" />}
          {data.near.BI.recovery !== undefined && <DataPoint x={scaleXNear(-data.near.BI.recovery)} y={nearY + 15} type="recovery" value={data.near.BI.recovery} isAbnormal={false} severity="normal" />}
          {data.near.BO.recovery !== undefined && <DataPoint x={scaleXNear(data.near.BO.recovery)} y={nearY + 15} type="recovery" value={data.near.BO.recovery} isAbnormal={false} severity="normal" />}
        </g>

        {/* AC/A 實測線 */}
        <line
          x1={scaleXDistance(safeDist)}
          y1={distY}
          x2={scaleXNear(safeNear)}
          y2={nearY}
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          strokeDasharray="8 4"
          opacity={0.85}
        />

        {/* AC/A 數值標註 */}
        <g transform={`translate(${(scaleXDistance(safeDist) + scaleXNear(safeNear)) / 2}, ${(distY + nearY) / 2})`}>
          <rect x={-50} y={-18} width={100} height={36} fill="white" stroke="hsl(var(--primary))" strokeWidth={2} rx={8} opacity={0.95} />
          <text x={0} y={-4} textAnchor="middle" fontSize="9" className="fill-muted-foreground">
            {acaResult.displayMethod === 'gradient' ? t('梯度法', '梯度法', 'Gradient') : t('計算法', '计算法', 'Calculated')}
          </text>
          <text x={0} y={12} textAnchor="middle" fontSize="14" fill="hsl(var(--primary))" fontWeight="700">
            AC/A: {measuredACA.toFixed(1)} Δ/D
          </text>
        </g>

        {/* 底部公式說明 */}
        <text x={width / 2} y={height - 30} textAnchor="middle" fontSize="10" className="fill-muted-foreground">
          {t(`AC/A = (${safeDist} - (${safeNear})) ÷ 2.5 = ${measuredACA.toFixed(1)} Δ/D`, `AC/A = (${safeDist} - (${safeNear})) ÷ 2.5 = ${measuredACA.toFixed(1)} Δ/D`, `AC/A = (${safeDist} - (${safeNear})) ÷ 2.5 = ${measuredACA.toFixed(1)} Δ/D`)}
        </text>
        {acaResult.warning && (
          <text x={width / 2} y={height - 15} textAnchor="middle" fontSize="10" fill="hsl(var(--warning))" fontWeight="600">
            {acaResult.warning}
          </text>
        )}
      </svg>

      {/* P2-1: 桌面版圖例（永遠展開）*/}
      {!isMobile && (
        <div className="absolute top-24 right-4 bg-card/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border max-w-[200px]">
          <LegendContent />
        </div>
      )}

      {/* P2-1: 手機版圖例（可折疊）*/}
      {isMobile && (
        <div className="absolute top-20 right-2 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border overflow-hidden max-w-[180px]">
          <Collapsible open={legendExpanded} onOpenChange={setLegendExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full flex justify-between px-3 py-2 hover:bg-muted/50">
                <span className="text-xs font-medium">{t('圖例', '图例', 'Legend')}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", legendExpanded && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-3 pt-0 border-t">
                <LegendContent />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card className={cn('', className)} role="region" aria-label={t('OEP 圖表分析區', 'OEP 图表分析区', 'OEP Chart Analysis')}>
        <CardHeader className="pb-2 px-3 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg md:text-base">
              <BarChart2 className="h-5 w-5 text-primary" aria-hidden="true" />
              {t('OEP 雙眼視覺機能圖', 'OEP 双眼视觉机能图', 'OEP Binocular Vision Graph')}
            </CardTitle>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsLightboxOpen(true)}
                title={t('放大查看', '放大查看', 'Enlarge')}
                className="h-10 md:h-8 px-3 text-sm"
                aria-label={t('放大圖表', '放大图表', 'Enlarge chart')}
              >
                <Maximize2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                {t('放大', '放大', 'Enlarge')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 md:px-6">
          {/* 響應式圖表容器 */}
          <div ref={chartContainerRef} className="w-full aspect-[4/3] min-h-[450px] max-h-[650px]">
            <div
              ref={chartRef}
              className={cn(
                "bg-card rounded-lg p-2 md:p-4 cursor-pointer relative h-full",
                "transition-all duration-200 hover:shadow-lg border border-transparent hover:border-primary/20",
                "focus-within:ring-2 focus-within:ring-primary/50"
              )}
              onClick={() => setIsLightboxOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsLightboxOpen(true);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={t('點擊放大圖表', '点击放大图表', 'Click to enlarge chart')}
            >
              <ChartSVG />
            </div>
          </div>
          
          {/* 懸浮提示說明 */}
          <div className="text-center text-xs text-muted-foreground mt-2 space-y-1">
            <p>{t('💡 懸浮於圖表元素可查看詳細說明', '💡 悬浮于图表元素可查看详细说明', '💡 Hover over chart elements for details')}</p>
            <p className="hidden md:block">{t('⌨️ Ctrl+E 匯出 PNG | Ctrl+P 列印', '⌨️ Ctrl+E 导出 PNG | Ctrl+P 打印', '⌨️ Ctrl+E Export PNG | Ctrl+P Print')}</p>
          </div>

          {/* P1-2: Morgan 評估區（提前至第二順位）*/}
          <div className="bg-gradient-to-r from-success/10 to-primary/10 dark:from-success/5 dark:to-primary/5 p-3 md:p-4 rounded-xl border-2 border-success/50 mt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex gap-3 md:gap-5 flex-wrap">
                {/* 遠方 Morgan */}
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md",
                    distMorganCompliant ? "bg-success" : "bg-destructive"
                  )}>
                    {distMorganCompliant 
                      ? <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      : <XCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    }
                  </div>
                  <div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{t('遠方 Morgan', '远方 Morgan', 'Dist Morgan')}</div>
                    <div className={cn(
                      "text-sm md:text-base font-bold",
                      distMorganCompliant ? "text-success" : "text-destructive"
                    )}>
                      {distMorganCompliant ? t('通過', '通过', 'Pass') : t('不通過', '不通过', 'Fail')}
                    </div>
                  </div>
                </div>
                {/* 近方 Morgan */}
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md",
                    nearMorganCompliant ? "bg-success" : "bg-destructive"
                  )}>
                    {nearMorganCompliant 
                      ? <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      : <XCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    }
                  </div>
                  <div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{t('近方 Morgan', '近方 Morgan', 'Near Morgan')}</div>
                    <div className={cn(
                      "text-sm md:text-base font-bold",
                      nearMorganCompliant ? "text-success" : "text-destructive"
                    )}>
                      {nearMorganCompliant ? t('通過', '通过', 'Pass') : t('不通過', '不通过', 'Fail')}
                    </div>
                  </div>
                </div>
              </div>
              {/* 綜合評分 */}
              <div className="text-center md:text-right">
                <div className="text-[10px] md:text-xs text-muted-foreground mb-1">{t('健康評分', '健康评分', 'Health Score')}</div>
                <div className={cn(
                  "text-3xl md:text-4xl font-bold tabular-nums",
                  diagnosticResults.overallScore >= 80 ? "text-success" :
                  diagnosticResults.overallScore >= 60 ? "text-warning" : "text-destructive"
                )}>
                  {diagnosticResults.overallScore}
                </div>
              </div>
            </div>
          </div>

          {/* P1-2: AC/A 說明區（降至第三順位）*/}
          <div className={cn(
            "p-3 md:p-4 rounded-lg border-l-4 mt-3",
            acaResult.reliability === 'low' ? "bg-warning/10 border-warning" : "bg-muted/50 border-primary"
          )}>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                {acaResult.reliability === 'low' && <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />}
                <span className="text-sm font-medium">{t('AC/A 比率', 'AC/A 比率', 'AC/A Ratio')}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">{acaResult.displayMethod === 'gradient' ? t('梯度法', '梯度法', 'Gradient') : t('計算法', '计算法', 'Calculated')}: </span>
                  <span className="font-bold" style={{ color: acaClassification.color }}>{measuredACA.toFixed(1)} Δ/D</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('分類', '分类', 'Type')}: </span>
                  <span className="font-bold" style={{ color: acaClassification.color }}>{acaClassification.classification}</span>
                </div>
              </div>
            </div>
            {acaResult.warning && (
              <div className="mt-2 text-xs text-warning">{acaResult.warning}</div>
            )}
          </div>

          {/* 診斷卡片 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <MorganComplianceCard
              distPhoria={safeDist}
              nearPhoria={safeNear}
              distPass={diagnosticResults.morgan.distance}
              nearPass={diagnosticResults.morgan.near}
            />
            <ACAAnalysisCard
              calculatedACA={acaResult.calculated.value}
              gradientACA={acaResult.gradient?.value}
              isReliable={acaResult.reliability === 'high'}
              aaDeficit={aaDeficit}
            />
          </div>

          {/* 診斷結果面板 */}
          <DiagnosticResultsPanel results={diagnosticResults} className="mt-4" />
        </CardContent>
      </Card>

      {/* Lightbox 全螢幕檢視 */}
      <OEPChartLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onDownloadPNG={handleDownloadPNG}
        onDownloadPDF={handleDownloadPDF}
      >
        <div className="bg-card rounded-lg p-4">
          <ChartSVG scaleFactor={1.2} showHeader={true} />
          <DiagnosticResultsPanel results={diagnosticResults} className="mt-4" />
        </div>
      </OEPChartLightbox>

      {/* Tooltip */}
      <ChartTooltip tooltip={tooltip} />

      {/* 浮動匯出按鈕 */}
      <FloatingExportButton
        onExportPNG={handleDownloadPNG}
        onExportPDF={handleDownloadPDF}
        onPrint={handlePrint}
      />
    </>
  );
};

export default OEPChartEnhanced;
