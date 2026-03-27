/**
 * ZCSBV 功能報告圖（Tab 2）- 自動化數據填充引擎
 * 
 * 核心功能：
 * - 黃色視覺體能區由模糊點自動生成
 * - Percival 1/3 舒適帶自動計算
 * - AA 天花板由 patientData.aa 動態決定
 */

import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  PatientOEPData,
  OEP_CHART_CONFIG,
  createCoordinateMapper,
  generateDemandLine,
  generateFunctionalZonePolygon,
  generatePercivalComfortZone,
  calculateAACeiling,
  getAACeilingY,
} from '@/lib/oepChartEngine';

interface ZCSBVFunctionalChartProps {
  // 使用 PatientOEPData 物件
  patientData?: PatientOEPData;
  // 或分散 props（向後兼容）
  distBiBlur?: number;
  distBiBreak?: number;
  distBoBlur?: number;
  distBoBreak?: number;
  nearBiBlur?: number;
  nearBiBreak?: number;
  nearBoBlur?: number;
  nearBoBreak?: number;
  distPhoria?: number;
  nearPhoria?: number;
  pd?: number;
  age?: number;
  aa?: number;
  className?: string;
}

export const ZCSBVFunctionalChart: React.FC<ZCSBVFunctionalChartProps> = ({
  patientData: externalData,
  distBiBlur,
  distBiBreak,
  distBoBlur,
  distBoBreak,
  nearBiBlur,
  nearBiBreak,
  nearBoBlur,
  nearBoBreak,
  distPhoria,
  nearPhoria,
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

  // 合併數據來源
  const data: PatientOEPData = useMemo(() => {
    if (externalData) return externalData;
    
    // 使用預設值建構數據
    const safeAge = age ?? 25;
    const safePd = pd ?? 63;
    const safeAa = aa ?? calculateAACeiling(safeAge);
    
    // 關鍵邏輯：break 是必填，blur 是選填
    const safeDistBiBreak = distBiBreak ?? 7;
    const safeDistBoBreak = distBoBreak ?? 9;
    const safeNearBiBreak = nearBiBreak ?? 13;
    const safeNearBoBreak = nearBoBreak ?? 17;
    
    return {
      age: safeAge,
      pd: safePd,
      aa: safeAa,
      far: {
        phoria: distPhoria ?? 0,
        bi_blur: distBiBlur,       // 可能為 undefined
        bi_break: safeDistBiBreak, // 必填
        bo_blur: distBoBlur,       // 可能為 undefined
        bo_break: safeDistBoBreak, // 必填
      },
      near: {
        phoria: nearPhoria ?? -2,
        bi_blur: nearBiBlur,       // 可能為 undefined
        bi_break: safeNearBiBreak, // 必填
        bo_blur: nearBoBlur,       // 可能為 undefined
        bo_break: safeNearBoBreak, // 必填
      },
    };
  }, [externalData, distBiBlur, distBiBreak, distBoBlur, distBoBreak, nearBiBlur, nearBiBreak, nearBoBlur, nearBoBreak, distPhoria, nearPhoria, pd, age, aa]);

  // 圖表尺寸
  const width = 950;
  const height = 650;
  const padding = { top: 95, right: 100, bottom: 85, left: 85 };

  // 創建座標轉換器
  const mapper = useMemo(
    () => createCoordinateMapper(width, height, padding),
    [width, height]
  );

  // 生成視覺體能區多邊形（黃色區域）
  const zonePolygonPath = useMemo(
    () => generateFunctionalZonePolygon(data, mapper, true),
    [data, mapper]
  );

  // 生成 Percival 舒適帶（中央 1/3）
  const psPolygonPath = useMemo(
    () => generatePercivalComfortZone(data, mapper),
    [data, mapper]
  );

  // 生成需求線
  const demandLine = useMemo(
    () => generateDemandLine(data.pd, mapper),
    [data.pd, mapper]
  );

  // AA 天花板計算（由 patientData.aa 決定）
  const aaCeiling = data.aa;
  const aaCeilingY = getAACeilingY(aaCeiling, mapper);

  // 獲取邊界點數值（模糊優先，無模糊則用破裂）
  const farBiBoundary = data.far.bi_blur ?? data.far.bi_break;
  const farBoBoundary = data.far.bo_blur ?? data.far.bo_break;
  const nearBiBoundary = data.near.bi_blur ?? data.near.bi_break;
  const nearBoBoundary = data.near.bo_blur ?? data.near.bo_break;

  // 檢查需求線是否在視覺體能區內
  const pd_cm = data.pd / 10;
  const demandAtNear = pd_cm * 2.5;
  const demandLineInZone = 
    demandAtNear >= -nearBiBoundary && demandAtNear <= nearBoBoundary;

  // 計算 Percival 舒適帶範圍
  const farTotalWidth = farBiBoundary + farBoBoundary;
  const farThird = farTotalWidth / 3;
  const farCenter = (farBoBoundary - farBiBoundary) / 2;
  const farPsLeft = farCenter - farThird / 2;
  const farPsRight = farCenter + farThird / 2;
  
  const nearTotalWidth = nearBiBoundary + nearBoBoundary;
  const nearThird = nearTotalWidth / 3;
  const nearCenter = (nearBoBoundary - nearBiBoundary) / 2;
  const nearPsLeft = nearCenter - nearThird / 2;
  const nearPsRight = nearCenter + nearThird / 2;

  // 檢查需求線是否在舒適帶內
  const demandInPsZone = demandAtNear >= nearPsLeft && demandAtNear <= nearPsRight;

  // 軸配置
  const { X_AXIS, Y_AXIS, SCALE_ALIGNMENT } = OEP_CHART_CONFIG;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* 標題 */}
        <text x={width / 2} y={20} textAnchor="middle" fontSize="16" fontWeight="700" className="fill-foreground">
          {t('ZCSBV 視覺體能區', 'ZCSBV 视觉体能区', 'ZCSBV Visual Performance Zone')}
        </text>
        <text x={width / 2} y={38} textAnchor="middle" fontSize="10" className="fill-muted-foreground">
          {t(
            `自動填充引擎｜年齡 ${data.age} 歲｜AA ${aaCeiling.toFixed(1)}D`,
            `自动填充引擎｜年龄 ${data.age} 岁｜AA ${aaCeiling.toFixed(1)}D`,
            `Auto-Plot Engine｜Age ${data.age}｜AA ${aaCeiling.toFixed(1)}D`
          )}
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
          {/* 頂部相對刻度 */}
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

        {/* 水平網格線 */}
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
        
        {/* 2.5D 虛線 */}
        <line
          x1={padding.left}
          y1={mapper.nearY}
          x2={width - padding.right}
          y2={mapper.nearY}
          stroke="#374151"
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />

        {/* 垂直網格線 */}
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

        {/* 40cm 零位虛線 */}
        <line
          x1={mapper.zeroRefX}
          y1={mapper.topY}
          x2={mapper.zeroRefX}
          y2={mapper.distY}
          stroke="#374151"
          strokeWidth={2}
          strokeDasharray="4 4"
        />

        {/* AA 天花板（藍色水平線）- 由 patientData.aa 決定高度 */}
        <g>
          <line
            x1={padding.left}
            y1={aaCeilingY}
            x2={width - padding.right}
            y2={aaCeilingY}
            stroke="#3B82F6"
            strokeWidth={3}
            strokeDasharray="12 6"
          />
          <rect x={width - padding.right - 100} y={aaCeilingY - 18} width={95} height={20} fill="white" stroke="#3B82F6" rx={4} />
          <text x={width - padding.right - 52} y={aaCeilingY - 4} textAnchor="middle" fontSize="10" fill="#3B82F6" fontWeight="600">
            {t(`AA ${aaCeiling.toFixed(1)}D`, `AA ${aaCeiling.toFixed(1)}D`, `AA ${aaCeiling.toFixed(1)}D`)}
          </text>
        </g>

        {/* 視覺體能區（黃色多邊形） */}
        <path
          d={zonePolygonPath}
          fill="rgba(251, 191, 36, 0.35)"
          stroke="#F59E0B"
          strokeWidth={2.5}
        />

        {/* Ps 舒適帶（綠色高亮區域 - 中央 1/3） */}
        <path
          d={psPolygonPath}
          fill="rgba(34, 197, 94, 0.3)"
          stroke="#22C55E"
          strokeWidth={2}
          strokeDasharray="6 3"
        />
        <g transform={`translate(${(mapper.scaleX(farPsLeft) + mapper.scaleX(farPsRight)) / 2}, ${mapper.distY + 25})`}>
          <text x={0} y={0} textAnchor="middle" fontSize="9" fill="#16A34A" fontWeight="600">
            {t('Ps 舒適區 (1/3)', 'Ps 舒适区', 'Ps Comfort Zone')}
          </text>
        </g>

        {/* 需求線（紅色虛線） */}
        <line
          x1={demandLine.start.x}
          y1={demandLine.start.y}
          x2={demandLine.end.x}
          y2={demandLine.end.y}
          stroke={demandLineInZone ? '#22C55E' : '#EF4444'}
          strokeWidth={3}
          strokeDasharray="8 4"
        />
        <circle cx={demandLine.start.x} cy={demandLine.start.y} r={6} fill={demandLineInZone ? '#22C55E' : '#EF4444'} stroke="white" strokeWidth={2} />
        <circle cx={demandLine.nearPoint.x} cy={demandLine.nearPoint.y} r={5} fill={demandLineInZone ? '#22C55E' : '#EF4444'} stroke="white" strokeWidth={2} />
        <text x={demandLine.nearPoint.x + 12} y={demandLine.nearPoint.y - 8} fontSize="10" fill={demandLineInZone ? '#22C55E' : '#EF4444'} fontWeight="700">
          {t('需求線', '需求线', 'Demand Line')}
        </text>

        {/* 邊界點標記（模糊優先，無模糊用破裂）- 近方使用頂部相對刻度 (+15 offset) */}
        <g>
          {/* 遠方邊界點 - 使用底部絕對刻度 */}
          <circle cx={mapper.scaleX(-farBiBoundary)} cy={mapper.distY} r={7} fill="#F59E0B" stroke="white" strokeWidth={2} />
          <text x={mapper.scaleX(-farBiBoundary)} y={mapper.distY - 16} textAnchor="middle" fontSize="9" fill="#D97706" fontWeight="600">
            {farBiBoundary}Δ
          </text>
          <circle cx={mapper.scaleX(farBoBoundary)} cy={mapper.distY} r={7} fill="#F59E0B" stroke="white" strokeWidth={2} />
          <text x={mapper.scaleX(farBoBoundary)} y={mapper.distY - 16} textAnchor="middle" fontSize="9" fill="#D97706" fontWeight="600">
            {farBoBoundary}Δ
          </text>
          {/* 近方邊界點 - 使用頂部相對刻度 (相對值 + 15 = 絕對值) */}
          <circle cx={mapper.scaleX(-nearBiBoundary + SCALE_ALIGNMENT)} cy={mapper.nearY} r={7} fill="#F59E0B" stroke="white" strokeWidth={2} />
          <text x={mapper.scaleX(-nearBiBoundary + SCALE_ALIGNMENT)} y={mapper.nearY - 16} textAnchor="middle" fontSize="9" fill="#D97706" fontWeight="600">
            {nearBiBoundary}Δ
          </text>
          <circle cx={mapper.scaleX(nearBoBoundary + SCALE_ALIGNMENT)} cy={mapper.nearY} r={7} fill="#F59E0B" stroke="white" strokeWidth={2} />
          <text x={mapper.scaleX(nearBoBoundary + SCALE_ALIGNMENT)} y={mapper.nearY - 16} textAnchor="middle" fontSize="9" fill="#D97706" fontWeight="600">
            {nearBoBoundary}Δ
          </text>
        </g>

        {/* AC/A 傳動線（遠近眼位連線） */}
        {(() => {
          // 遠方眼位：使用底部絕對刻度
          const distPhoriaX = mapper.scaleX(data.far.phoria);
          const distPhoriaY = mapper.distY;
          // 近方眼位：相對值轉絕對值（絕對X = phoria + 15）
          const nearPhoriaAbsolute = data.near.phoria + SCALE_ALIGNMENT;
          const nearPhoriaX = mapper.scaleX(nearPhoriaAbsolute);
          const nearPhoriaY = mapper.nearY;
          
          return (
            <g>
              {/* 連線 */}
              <line
                x1={distPhoriaX}
                y1={distPhoriaY}
                x2={nearPhoriaX}
                y2={nearPhoriaY}
                stroke="#8B5CF6"
                strokeWidth={2.5}
              />
              {/* 遠方端點 */}
              <circle cx={distPhoriaX} cy={distPhoriaY} r={5} fill="#8B5CF6" stroke="white" strokeWidth={2} />
              {/* 近方端點 */}
              <circle cx={nearPhoriaX} cy={nearPhoriaY} r={5} fill="#8B5CF6" stroke="white" strokeWidth={2} />
            </g>
          );
        })()}

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

        {/* 圖例 - 右下角 */}
        <g transform={`translate(${width - padding.right - 145}, ${height - padding.bottom - 115})`}>
          <rect x={0} y={0} width={140} height={105} fill="white" stroke="#374151" rx={6} />
          <text x={70} y={16} textAnchor="middle" fontSize="9" fontWeight="600" className="fill-foreground">
            {t('圖例 Legend', '图例', 'Legend')}
          </text>
          <rect x={12} y={28} width={18} height={14} fill="rgba(251, 191, 36, 0.35)" stroke="#F59E0B" strokeWidth={1.5} />
          <text x={36} y={38} fontSize="8" className="fill-foreground">{t('視覺體能區', '视觉体能区', 'Performance Zone')}</text>
          <rect x={12} y={48} width={18} height={14} fill="rgba(34, 197, 94, 0.3)" stroke="#22C55E" strokeDasharray="4 2" />
          <text x={36} y={58} fontSize="8" className="fill-foreground">{t('Ps 舒適帶 (1/3)', '舒适带 (1/3)', 'Ps Comfort (1/3)')}</text>
          <line x1={12} y1={73} x2={30} y2={73} stroke="#EF4444" strokeWidth={2} strokeDasharray="4 2" />
          <text x={36} y={76} fontSize="8" className="fill-foreground">{t('需求線', '需求线', 'Demand Line')}</text>
          <line x1={12} y1={88} x2={30} y2={88} stroke="#3B82F6" strokeWidth={2} strokeDasharray="6 3" />
          <text x={36} y={91} fontSize="8" className="fill-foreground">{t('AA 天花板', 'AA 上限', 'AA Ceiling')}</text>
        </g>

        {/* 狀態指示 */}
        <g transform={`translate(${padding.left + 10}, ${padding.top + 10})`}>
          <rect 
            x={0} y={0} width={200} height={50} 
            fill={demandLineInZone ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'} 
            stroke={demandLineInZone ? '#22C55E' : '#EF4444'} 
            rx={8} 
          />
          <text x={100} y={20} textAnchor="middle" fontSize="12" fill={demandLineInZone ? '#16A34A' : '#DC2626'} fontWeight="700">
            {demandLineInZone
              ? t('✓ 需求線在體能區內', '✓ 需求线在体能区内', '✓ Demand Line in Zone')
              : t('✗ 需求線超出體能區', '✗ 需求线超出体能区', '✗ Demand Line Outside')
            }
          </text>
          <text x={100} y={38} textAnchor="middle" fontSize="10" fill={demandInPsZone ? '#16A34A' : '#D97706'}>
            {demandInPsZone
              ? t('且在舒適帶內', '且在舒适带内', 'Within Comfort Zone')
              : t('需求線不在舒適帶', '需求线不在舒适带', 'Outside Comfort Zone')
            }
          </text>
        </g>

        {/* 公式說明 */}
        <text x={width / 2} y={height - 4} textAnchor="middle" fontSize="8" className="fill-muted-foreground">
          {t(
            `需求線公式：X = PD(cm) × D ｜ PD = ${data.pd}mm → 近方需求 = ${demandAtNear.toFixed(1)}Δ`,
            `需求线公式：X = PD(cm) × D ｜ PD = ${data.pd}mm → 近方需求 = ${demandAtNear.toFixed(1)}Δ`,
            `Demand: X = PD(cm) × D ｜ PD = ${data.pd}mm → Near Demand = ${demandAtNear.toFixed(1)}Δ`
          )}
        </text>
      </svg>
    </div>
  );
};

export default ZCSBVFunctionalChart;
