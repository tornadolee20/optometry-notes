/**
 * OEP 圖表圖例組件
 * 顯示資料點符號說明 (×○□△)
 */

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { POINT_SYMBOLS } from '@/lib/oepChartUtils';

interface ChartLegendProps {
  className?: string;
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ className }) => {
  const { language } = useLanguage();
  const isEN = language === 'en';

  const items = [
    { key: 'phoria', ...POINT_SYMBOLS.phoria },
    { key: 'blur', ...POINT_SYMBOLS.blur },
    { key: 'break', ...POINT_SYMBOLS.break },
    { key: 'recovery', ...POINT_SYMBOLS.recovery },
  ];

  return (
    <div 
      className={`inline-flex flex-col gap-1 px-3 py-2 rounded-lg bg-amber-50 border-2 border-amber-400 dark:bg-amber-950/50 dark:border-amber-600 ${className}`}
    >
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-2 text-sm">
          <span 
            className="w-5 text-center font-bold text-base"
            style={{ color: item.color }}
          >
            {item.symbol}
          </span>
          <span className="text-foreground/80">
            {isEN ? item.labelEN : item.label}→
          </span>
        </div>
      ))}
    </div>
  );
};

export default ChartLegend;
