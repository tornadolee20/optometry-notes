/**
 * OEP 臨床診斷圖（Tab 1）- 自動化數據填充引擎
 * 
 * 核心功能：
 * - 所有點位基於 getCoords() 自動計算
 * - 修改 patientData 數值時，圖表自動更新
 * - 嚴格遵循國際標準座標系統
 */

import React, { useMemo } from 'react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  PatientOEPData,
  SAMPLE_CASE_25,
  OEP_CHART_CONFIG,
  createCoordinateMapper,
  generatePlottablePoints,
  generateACAPhoriaLine,
  generateDemandLine,
  generateFunctionalZonePolygon,
  checkMorganNorm,
  calculateCalculatedACA,
  PlottablePoint,
} from '@/lib/oepChartEngine';

// 符號配置
const POINT_SYMBOLS = {
  phoria: { symbol: '×', color: '#3B82F6', label: '斜位', labelEN: 'Phoria' },
  blur: { symbol: '○', color: '#EF4444', label: '模糊', labelEN: 'Blur' },
  break: { symbol: '□', color: '#22C55E', label: '破裂', labelEN: 'Break' },
  recovery: { symbol: '△', color: '#F59E0B', label: '恢復', labelEN: 'Recovery' },
} as const;

// Hofstetter 公式計算 AA 預設值
const calculateDefaultAA = (age: number): number => {
  return Math.max(0, 18.5 - 0.3 * age);
};

interface OEPDiagnosticChartProps {
  // 支援兩種輸入方式：
  // 1. 使用 PatientOEPData 物件
  patientData?: PatientOEPData;
  // 2. 或使用分散的 props（向後兼容）
  distPhoria?: number;
  distBiBlur?: number;
  distBiBreak?: number;
  distBiRecovery?: number;
  distBoBlur?: number;
  distBoBreak?: number;
  distBoRecovery?: number;
  nearPhoria?: number;
  nearBiBlur?: number;
  nearBiBreak?: number;
  nearBiRecovery?: number;
  nearBoBlur?: number;
  nearBoBreak?: number;
  nearBoRecovery?: number;
  pd?: number;
  age?: number;
  aa?: number;  // 新增：調節幅度 (D)
  className?: string;
}

export const OEPDiagnosticChart: React.FC<OEPDiagnosticChartProps> = ({
  patientData: externalData,
  distPhoria,
  distBiBlur,
  distBiBreak,
  distBiRecovery,
  distBoBlur,
  distBoBreak,
  distBoRecovery,
  nearPhoria,
  nearBiBlur,
  nearBiBreak,
  nearBiRecovery,
  nearBoBlur,
  nearBoBreak,
  nearBoRecovery,
  pd,
  age,
  aa,
  className,
}) => {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';

  const t = (tw: string, cn: string, en: string) =>
    isEN ? en : isCN ? cn : tw;

  // 合併數據來源：優先使用 patientData，否則從分散 props 組合
  const data: PatientOEPData = useMemo(() => {
    if (externalData) return externalData;
    
    const patientAge = age ?? 25;
    // AA 動態計算：優先使用傳入值，否則用 Hofstetter 公式
    const patientAA = aa ?? calculateDefaultAA(patientAge);
    
    return {
      age: patientAge,
      pd: pd ?? 63,
      aa: patientAA,
      far: {
        phoria: distPhoria ?? 0,
        bi_blur: distBiBlur,
        bi_break: distBiBreak ?? 8,
        bi_rec: distBiRecovery,
        bo_blur: distBoBlur,
        bo_break: distBoBreak ?? 18,
        bo_rec: distBoRecovery,
      },
      near: {
        phoria: nearPhoria ?? -2,
        bi_blur: nearBiBlur,
        bi_break: nearBiBreak ?? 14,
        bi_rec: nearBiRecovery,
        bo_blur: nearBoBlur,
        bo_break: nearBoBreak ?? 20,
        bo_rec: nearBoRecovery,
      },
    };
  }, [externalData, distPhoria, distBiBlur, distBiBreak, distBiRecovery, distBoBlur, distBoBreak, distBoRecovery,
      nearPhoria, nearBiBlur, nearBiBreak, nearBiRecovery, nearBoBlur, nearBoBreak, nearBoRecovery, pd, age, aa]);

  // 圖表尺寸
  const width = 950;
  const height = 680;
  const padding = { top: 95, right: 100, bottom: 85, left: 85 };

  // 創建座標轉換器
  const mapper = useMemo(
    () => createCoordinateMapper(width, height, padding),
    [width, height]
  );

  // 自動生成所有繪圖點位
  const plottablePoints = useMemo(
    () => generatePlottablePoints(data, mapper),
    [data, mapper]
  );

  // 生成連線
  const acaLine = useMemo(() => generateACAPhoriaLine(data, mapper), [data, mapper]);
  const demandLine = useMemo(() => generateDemandLine(data.pd, mapper, data.aa), [data.pd, mapper, data.aa]);
  // 功能區邊線：模糊點優先，沒有模糊點則用破裂點
  const functionalZonePath = useMemo(() => generateFunctionalZonePolygon(data, mapper, true), [data, mapper]);

  // 計算 AC/A
  const calculatedACA = calculateCalculatedACA(data);

  // Morgan 常模檢查
  const distMorganCheck = checkMorganNorm(data.far.phoria, true);
  const nearMorganCheck = checkMorganNorm(data.near.phoria, false);

  // X/Y 軸配置
  const { X_AXIS, Y_AXIS, SCALE_ALIGNMENT } = OEP_CHART_CONFIG;

  // 資料點渲染組件
  const DataPoint = ({ point }: { point: PlottablePoint }) => {
    if (point.type === 'phoria') return null; // 斜位點單獨處理
    
    const symbol = POINT_SYMBOLS[point.type];
    const displayValue = Math.abs(point.value);

    return (
      <TooltipProvider key={`${point.layer}-${point.type}-${point.direction}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <g className="cursor-pointer transition-transform hover:scale-110">
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={symbol.color}
                fontSize="18"
                fontWeight="bold"
              >
                {symbol.symbol}
              </text>
              <text
                x={point.x}
                y={point.y + 16}
                textAnchor="middle"
                fontSize="9"
                fill="#374151"
                fontWeight="600"
              >
                {displayValue}Δ
              </text>
              <text
                x={point.x + 12}
                y={point.y - 8}
                textAnchor="start"
                fontSize="7"
                fill="#6B7280"
                fontStyle="italic"
              >
                {point.label}
              </text>
            </g>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{isEN ? symbol.labelEN : symbol.label}: {displayValue}Δ</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // 斜位點渲染組件
  const PhoriaPoint = ({ point, isNormal }: { point: PlottablePoint; isNormal: boolean }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <g className="cursor-pointer">
            <circle
              cx={point.x}
              cy={point.y}
              r={12}
              fill={isNormal ? '#22C55E' : '#EF4444'}
              stroke="white"
              strokeWidth={2}
            />
            <text
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="14"
              fontWeight="bold"
            >
              ×
            </text>
            <text
              x={point.x}
              y={point.y - 22}
              textAnchor="middle"
              fontSize="11"
              fill={isNormal ? '#22C55E' : '#EF4444'}
              fontWeight="700"
            >
              {point.value}Δ
            </text>
          </g>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{t('斜位', '斜位', 'Phoria')}: {point.value}Δ</p>
          <p className="text-sm text-muted-foreground">
            {point.value === 0 ? 'Ortho' : point.value > 0 ? t('內斜 Eso', '内斜 Eso', 'Eso') : t('外斜 Exo', '外斜 Exo', 'Exo')}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // 分離斜位點和其他點
  const phoriaPoints = plottablePoints.filter(p => p.type === 'phoria');
  const otherPoints = plottablePoints.filter(p => p.type !== 'phoria');

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* 標題 */}
        <text x={width / 2} y={20} textAnchor="middle" fontSize="16" fontWeight="700" className="fill-foreground">
          {t('OEP 臨床診斷圖', 'OEP 临床诊断图', 'OEP Diagnostic Chart')}
        </text>
        <text x={width / 2} y={36} textAnchor="middle" fontSize="10" className="fill-muted-foreground">
          {t(`自動填充引擎 | PD=${data.pd}mm | 年齡${data.age}歲`, 
             `自动填充引擎 | PD=${data.pd}mm | 年龄${data.age}岁`, 
             `Auto-Plot Engine | PD=${data.pd}mm | Age ${data.age}`)}
        </text>

        {/* 頂部相對刻度（40cm） */}
        <g>
          <text x={padding.left + 30} y={padding.top - 55} textAnchor="start" fontSize="10" className="fill-foreground" fontWeight="600">
            BASE IN
          </text>
          <text x={width / 2} y={padding.top - 55} textAnchor="middle" fontSize="10" className="fill-foreground" fontWeight="600">
            Prism scale at 40 cm.
          </text>
          <text x={width - padding.right - 30} y={padding.top - 55} textAnchor="end" fontSize="10" className="fill-foreground" fontWeight="600">
            BASE OUT
          </text>
          {/* 頂部相對刻度 - 每 5Δ */}
          {Array.from({ length: 25 }, (_, i) => -35 + i * 5).map((rel) => {
            const absX = mapper.relativeToAbsolute(rel);
            if (absX < X_AXIS.MIN || absX > X_AXIS.MAX) return null;
            const displayValue = Math.abs(rel);
            return (
              <text 
                key={`rel-${rel}`} 
                x={mapper.scaleX(absX)} 
                y={padding.top - 10} 
                textAnchor="middle" 
                fontSize={rel === 0 ? '11' : '9'} 
                className="fill-foreground"
                fontWeight={rel === 0 ? '700' : '400'}
              >
                {displayValue}
              </text>
            );
          })}
          <line 
            x1={padding.left} 
            y1={padding.top - 3} 
            x2={width - padding.right} 
            y2={padding.top - 3} 
            stroke="#374151" 
            strokeWidth={1.5}
          />
        </g>

        {/* 背景 */}
        <rect
          x={padding.left}
          y={padding.top}
          width={mapper.plotWidth}
          height={mapper.plotHeight}
          fill="white"
          stroke="#374151"
          strokeWidth={2}
        />

        {/* 水平網格線 - 每 1D */}
        {Array.from({ length: 13 }, (_, i) => i).map((d) => (
          <line
            key={`h-${d}`}
            x1={padding.left}
            y1={mapper.scaleY(d)}
            x2={width - padding.right}
            y2={mapper.scaleY(d)}
            stroke={d === 0 || d === 12 ? '#374151' : '#9CA3AF'}
            strokeWidth={d === 0 || d === 12 ? 2 : 1}
          />
        ))}
        
        {/* 2.5D 虛線（近方測試線） */}
        <line
          x1={padding.left}
          y1={mapper.nearY}
          x2={width - padding.right}
          y2={mapper.nearY}
          stroke="#374151"
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />

        {/* 垂直網格線 - 每 10Δ */}
        {Array.from({ length: Math.ceil((X_AXIS.MAX - X_AXIS.MIN) / 10) + 1 }, (_, i) => X_AXIS.MIN + i * 10).map((bottomX) => (
          <line
            key={`v-${bottomX}`}
            x1={mapper.scaleX(bottomX)}
            y1={mapper.distY}
            x2={mapper.scaleX(bottomX)}
            y2={mapper.topY}
            stroke="#9CA3AF"
            strokeWidth={bottomX === 0 ? 1.5 : 1}
          />
        ))}

        {/* 40cm 零位虛線（絕對座標 X=+15） */}
        <line
          x1={mapper.zeroRefX}
          y1={mapper.topY}
          x2={mapper.zeroRefX}
          y2={mapper.distY}
          stroke="#3B82F6"
          strokeWidth={2}
          strokeDasharray="4 4"
        />

        {/* 案例 PD 需求線（只顯示當前案例的 PD） */}
        <g>
          <text
            x={demandLine.end.x - 20}
            y={mapper.topY - 8}
            textAnchor="end"
            fontSize="10"
            fontWeight="600"
            className="fill-foreground"
          >
            P.D. {data.pd}
          </text>
        </g>

        {/* 功能區邊線（模糊點優先，與ZCSBV一致）*/}
        <path
          d={functionalZonePath}
          fill="rgba(251, 191, 36, 0.1)"
          stroke="#F59E0B"
          strokeWidth={1.5}
          strokeDasharray="8 4"
          opacity={0.7}
        />

        {/* 需求線（紅色虛線）*/}
        <line
          x1={demandLine.start.x}
          y1={demandLine.start.y}
          x2={demandLine.end.x}
          y2={demandLine.end.y}
          stroke="#DC2626"
          strokeWidth={2.5}
          strokeDasharray="8 4"
        />
        <circle cx={demandLine.start.x} cy={demandLine.start.y} r={5} fill="#DC2626" />
        <circle cx={demandLine.nearPoint.x} cy={demandLine.nearPoint.y} r={4} fill="#DC2626" stroke="white" strokeWidth={1} />
        <circle cx={demandLine.end.x} cy={demandLine.end.y} r={4} fill="#DC2626" stroke="white" strokeWidth={1} />

        {/* 需求線標註 */}
        <g>
          <rect 
            x={demandLine.end.x - 50} 
            y={demandLine.end.y - 25} 
            width={100} 
            height={20} 
            fill="white" 
            stroke="#DC2626" 
            strokeWidth={1.5} 
            rx={4}
          />
          <text 
            x={demandLine.end.x} 
            y={demandLine.end.y - 12} 
            textAnchor="middle" 
            fontSize="9" 
            fill="#DC2626" 
            fontWeight="700"
          >
            {t(`PD=${data.pd}mm 需求線`, `PD=${data.pd}mm 需求线`, `PD=${data.pd}mm Demand`)}
          </text>
        </g>

        {/* AC/A 傳動線（藍色實線） */}
        <line
          x1={acaLine.start.x}
          y1={acaLine.start.y}
          x2={acaLine.end.x}
          y2={acaLine.end.y}
          stroke="#3B82F6"
          strokeWidth={3}
        />

        {/* AC/A 數值標註 */}
        <g transform={`translate(${Math.min(Math.max((acaLine.start.x + acaLine.end.x) / 2 + 50, padding.left + 80), width - padding.right - 80)}, ${(acaLine.start.y + acaLine.end.y) / 2})`}>
          <rect x={-45} y={-16} width={90} height={32} fill="white" stroke="#3B82F6" strokeWidth={2} rx={6} />
          <text x={0} y={-2} textAnchor="middle" fontSize="8" fill="#6B7280">AC/A</text>
          <text x={0} y={12} textAnchor="middle" fontSize="14" fill="#3B82F6" fontWeight="700">
            {calculatedACA.toFixed(1)} Δ/D
          </text>
        </g>

        {/* 自動渲染所有資料點 */}
        {otherPoints.map((point, idx) => (
          <DataPoint key={`point-${idx}`} point={point} />
        ))}

        {/* 斜位點（特殊樣式） */}
        {phoriaPoints.map((point, idx) => (
          <PhoriaPoint 
            key={`phoria-${idx}`} 
            point={point} 
            isNormal={point.layer === 'distance' ? distMorganCheck.isNormal : nearMorganCheck.isNormal} 
          />
        ))}

        {/* 左 Y 軸標籤 */}
        <text
          x={padding.left - 60}
          y={height / 2}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          className="fill-foreground"
          transform={`rotate(-90, ${padding.left - 60}, ${height / 2})`}
        >
          Stimulus to Accommodation
        </text>
        {Array.from({ length: 13 }, (_, i) => i).map((d) => (
          <text key={`y-label-${d}`} x={padding.left - 10} y={mapper.scaleY(d)} textAnchor="end" dominantBaseline="middle" fontSize="10" className="fill-foreground">
            {d}
          </text>
        ))}

        {/* 右 Y 軸標籤 */}
        <text
          x={width - padding.right + 65}
          y={height / 2}
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          className="fill-foreground"
          transform={`rotate(90, ${width - padding.right + 65}, ${height / 2})`}
        >
          Add to distance correction at 40 cm
        </text>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((d) => {
          const addValue = mapper.addConversion(d);
          return (
            <text 
              key={`y-right-${d}`} 
              x={width - padding.right + 12} 
              y={mapper.scaleY(d)} 
              textAnchor="start" 
              dominantBaseline="middle" 
              fontSize="9" 
              className="fill-foreground"
            >
              {addValue >= 0 ? `+${addValue.toFixed(2)}` : addValue.toFixed(2)}
            </text>
          );
        })}

        {/* 底部 X 軸標籤 */}
        <text x={padding.left + 30} y={height - 52} textAnchor="start" fontSize="10" fontWeight="600" className="fill-foreground">
          BASE IN
        </text>
        <text x={width / 2} y={height - 15} textAnchor="middle" fontSize="10" fontWeight="600" className="fill-foreground">
          Prism scale at 6m.
        </text>
        <text x={width - padding.right - 30} y={height - 52} textAnchor="end" fontSize="10" fontWeight="600" className="fill-foreground">
          BASE OUT
        </text>
        {Array.from({ length: Math.ceil((X_AXIS.MAX - X_AXIS.MIN) / 10) + 1 }, (_, i) => X_AXIS.MIN + i * 10).map((x) => (
          <text 
            key={`x-label-${x}`} 
            x={mapper.scaleX(x)} 
            y={height - padding.bottom + 18} 
            textAnchor="middle" 
            fontSize="10" 
            className="fill-foreground"
            fontWeight={x === 0 ? '600' : '400'}
          >
            {Math.abs(x)}
          </text>
        ))}

        {/* 圖例 - 移至右下角 */}
        <g transform={`translate(${width - padding.right - 145}, ${height - padding.bottom - 155})`}>
          <rect x={0} y={0} width={140} height={145} fill="white" stroke="#E5E7EB" rx={6} opacity={0.95} />
          <text x={70} y={16} textAnchor="middle" fontSize="9" fontWeight="600" className="fill-foreground">
            {t('圖例 Legend', '图例', 'Legend')}
          </text>
          <circle cx={18} cy={32} r={7} fill="#3B82F6" />
          <text x={18} y={32} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="9" fontWeight="bold">×</text>
          <text x={32} y={35} fontSize="8" className="fill-foreground">{t('斜位 Phoria', '斜位', 'Phoria')}</text>
          <text x={18} y={48} textAnchor="middle" fill="#EF4444" fontSize="12" fontWeight="bold">○</text>
          <text x={32} y={51} fontSize="8" className="fill-foreground">{t('模糊 Blur', '模糊', 'Blur')}</text>
          <text x={18} y={64} textAnchor="middle" fill="#22C55E" fontSize="12" fontWeight="bold">□</text>
          <text x={32} y={67} fontSize="8" className="fill-foreground">{t('破裂 Break', '破裂', 'Break')}</text>
          <text x={18} y={80} textAnchor="middle" fill="#F59E0B" fontSize="12" fontWeight="bold">△</text>
          <text x={32} y={83} fontSize="8" className="fill-foreground">{t('恢復 Recovery', '恢复', 'Recovery')}</text>
          <line x1={8} y1={92} x2={132} y2={92} stroke="#E5E7EB" />
          <line x1={10} y1={104} x2={28} y2={104} stroke="#DC2626" strokeWidth={2} strokeDasharray="4 2" />
          <text x={32} y={107} fontSize="8" className="fill-foreground">{t('需求線', '需求线', 'Demand')}</text>
          <line x1={10} y1={118} x2={28} y2={118} stroke="#3B82F6" strokeWidth={2} />
          <text x={32} y={121} fontSize="8" className="fill-foreground">{t('傳動線 AC/A', 'AC/A', 'AC/A Line')}</text>
          <line x1={10} y1={132} x2={28} y2={132} stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="6 3" />
          <text x={32} y={135} fontSize="8" className="fill-foreground">{t('40cm 零位', '40cm零位', '40cm Zero')}</text>
        </g>

        {/* 公式說明 */}
        <text x={width / 2} y={height - 4} textAnchor="middle" fontSize="8" className="fill-muted-foreground">
          {t(
            `需求線：X = PD(cm) × D ｜ AC/A = PD(cm) + (${data.near.phoria} − ${data.far.phoria}) ÷ 2.5 = ${calculatedACA.toFixed(1)} Δ/D`,
            `需求线：X = PD(cm) × D ｜ AC/A = PD(cm) + (${data.near.phoria} − ${data.far.phoria}) ÷ 2.5 = ${calculatedACA.toFixed(1)} Δ/D`,
            `Demand: X = PD(cm) × D ｜ AC/A = PD(cm) + (${data.near.phoria} − ${data.far.phoria}) ÷ 2.5 = ${calculatedACA.toFixed(1)} Δ/D`
          )}
        </text>
      </svg>
    </div>
  );
};

export default OEPDiagnosticChart;
