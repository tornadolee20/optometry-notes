/**
 * 診斷結果面板組件
 * 顯示 Morgan/Sheard/Percival 三大標準判斷結果
 * Mobile-First 優化版本
 * 
 * OEP 圖表 Y 軸說明：
 * - Y 軸代表「調節刺激量」（Accommodative Stimulus），刻度 1-12
 * - 遠方（Distance）固定在 Y ≈ 2.5（圖表底部區域）
 * - 近方（Near, 40cm）固定在 Y ≈ 10（圖表頂部區域）
 * - 右側屈光度刻度：Y=2.5 ≈ +0.5D，Y=12 ≈ -9.5D
 * - 此設計符合國際 OEP 視光學標準，便於臨床判讀
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, XCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DiagnosticResults, getScoreGrade } from '@/lib/oepChartUtils';
import { cn } from '@/lib/utils';
import { Y_POSITIONS } from '@/lib/criteriaCalculations';

interface DiagnosticResultsPanelProps {
  results: DiagnosticResults;
  className?: string;
}

export const DiagnosticResultsPanel: React.FC<DiagnosticResultsPanelProps> = ({
  results,
  className,
}) => {
  const { language } = useLanguage();
  const isCN = language === 'zh-CN';
  const isEN = language === 'en';

  const t = (tw: string, cn: string, en: string) =>
    isEN ? en : isCN ? cn : tw;

  const scoreGrade = getScoreGrade(results.overallScore, language);

  const standards = [
    {
      name: 'Morgan',
      distance: results.morgan.distance,
      near: results.morgan.near,
      distanceDetail: results.morgan.distanceDetail,
      nearDetail: results.morgan.nearDetail,
      description: t(
        '眼位是否在正常範圍',
        '眼位是否在正常范围',
        'Phoria within normal range'
      ),
    },
    {
      name: 'Sheard',
      distance: results.sheard.distance,
      near: results.sheard.near,
      distanceDetail: results.sheard.distanceDetail,
      nearDetail: results.sheard.nearDetail,
      description: t(
        '補償性儲備 ≥ 2×斜位',
        '补偿性储备 ≥ 2×斜位',
        'Compensating reserve ≥ 2× phoria'
      ),
    },
    {
      name: 'Percival',
      distance: results.percival.distance,
      near: results.percival.near,
      distanceDetail: results.percival.distanceDetail,
      nearDetail: results.percival.nearDetail,
      description: t(
        '小儲備 ≥ 大儲備/3',
        '小储备 ≥ 大储备/3',
        'Min reserve ≥ Max/3'
      ),
    },
  ];

  // Mobile-optimized status badge with larger touch target
  const StatusBadge = ({ 
    pass, 
    label, 
    detail 
  }: { 
    pass: boolean; 
    label: string; 
    detail: string;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={pass ? 'default' : 'destructive'}
            className={cn(
              // Mobile: 44px min touch target, larger text
              'cursor-help min-h-[36px] md:min-h-[28px] px-3 md:px-2 py-1.5 md:py-1',
              'text-sm md:text-xs gap-1.5 md:gap-1 font-medium',
              'transition-all duration-200 active:scale-95',
              pass && 'bg-success hover:bg-success/90'
            )}
            aria-label={`${label}: ${pass ? t('通過', '通过', 'Pass') : t('不通過', '不通过', 'Fail')}`}
          >
            {pass ? (
              <CheckCircle2 className="h-4 w-4 md:h-3 md:w-3 flex-shrink-0" aria-hidden="true" />
            ) : (
              <XCircle className="h-4 w-4 md:h-3 md:w-3 flex-shrink-0" aria-hidden="true" />
            )}
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="text-sm md:text-xs leading-relaxed">{detail}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Y 軸座標說明組件
  const YAxisExplanation = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md',
            'bg-muted/50 hover:bg-muted cursor-help',
            'text-xs text-muted-foreground',
            'transition-colors'
          )}>
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{t('圖表座標', '图表坐标', 'Chart Axes')}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[300px] p-3">
          <div className="space-y-2 text-xs">
            <p className="font-semibold text-sm">{t('Y 軸座標說明', 'Y 轴坐标说明', 'Y-Axis Explanation')}</p>
            <p>{t(
              'Y 軸代表「調節刺激量」（1-12），遠方在圖表底部，近方在頂部',
              'Y 轴代表「调节刺激量」（1-12），远方在图表底部，近方在顶部',
              'Y-axis represents Accommodative Stimulus (1-12), Distance at bottom, Near at top'
            )}</p>
            <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-border/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('遠方', '远方', 'Distance')}:</span>
                <span className="font-medium">Y ≈ {Y_POSITIONS.DISTANCE} {t('（底部）', '（底部）', '(bottom)')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('近方 (40cm)', '近方 (40cm)', 'Near (40cm)')}:</span>
                <span className="font-medium">Y ≈ {Y_POSITIONS.NEAR} {t('（頂部）', '（顶部）', '(top)')}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50">
              <p className="text-muted-foreground">{t(
                '右側屈光度刻度：Y=2.5 ≈ +0.5D，Y=12 ≈ -9.5D',
                '右侧屈光度刻度：Y=2.5 ≈ +0.5D，Y=12 ≈ -9.5D',
                'Right axis diopters: Y=2.5 ≈ +0.5D, Y=12 ≈ -9.5D'
              )}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Card 
      className={cn('overflow-hidden', className)}
      role="region"
      aria-label={t('診斷結果面板', '诊断结果面板', 'Diagnostic Results Panel')}
    >
      <CardContent className="p-4 md:p-4">
        {/* Y-Axis Explanation Helper */}
        <div className="flex justify-end mb-3">
          <YAxisExplanation />
        </div>

        {/* Mobile: Vertical stack layout, Desktop: Horizontal flex */}
        <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-4 md:gap-4">
          
          {/* 三大標準判斷 - Mobile: Full width grid, Desktop: Inline flex */}
          <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-4 w-full md:w-auto">
            {standards.map((std) => (
              <TooltipProvider key={std.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* Mobile: Card-like row with full width, Desktop: Compact inline */}
                    <div className={cn(
                      'flex items-center gap-3 md:gap-2',
                      'p-3 md:p-0 rounded-xl md:rounded-none',
                      'bg-secondary/30 md:bg-transparent',
                      'cursor-help min-h-[52px] md:min-h-0',
                      'transition-colors hover:bg-secondary/50 md:hover:bg-transparent',
                      'active:bg-secondary/60 md:active:bg-transparent'
                    )}>
                      {/* Standard name with info icon on mobile */}
                      <div className="flex items-center gap-1.5 min-w-[70px] md:min-w-0">
                        <span className="font-semibold text-base md:text-sm text-foreground md:text-muted-foreground">
                          {std.name}
                        </span>
                        <Info className="h-4 w-4 text-muted-foreground md:hidden" />
                      </div>
                      
                      {/* Status badges container */}
                      <div className="flex items-center gap-2 ml-auto md:ml-0">
                        <StatusBadge
                          pass={std.distance}
                          label={t('遠', '远', 'Dist')}
                          detail={std.distanceDetail}
                        />
                        <StatusBadge
                          pass={std.near}
                          label={t('近', '近', 'Near')}
                          detail={std.nearDetail}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px]">
                    <p className="text-sm md:text-xs leading-relaxed">{std.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* 綜合評分 - Mobile: Prominent centered, Desktop: Compact right-aligned */}
          <div className={cn(
            'flex items-center justify-center md:justify-end gap-4 md:gap-3',
            'p-4 md:p-0 rounded-xl md:rounded-none',
            'bg-gradient-to-r from-secondary/40 to-secondary/20 md:bg-transparent',
            'border border-border/50 md:border-0'
          )}>
            {/* Score ring - larger on mobile */}
            <div
              className={cn(
                'relative rounded-full flex items-center justify-center',
                'w-16 h-16 md:w-14 md:h-14',
                'shadow-lg md:shadow-none',
                'transition-transform hover:scale-105'
              )}
              style={{
                border: `4px solid ${scoreGrade.color}`,
                backgroundColor: scoreGrade.bgColor,
              }}
            >
              <span
                className="text-2xl md:text-lg font-bold"
                style={{ color: scoreGrade.color }}
              >
                {results.overallScore}
              </span>
            </div>
            
            {/* Grade label */}
            <div className="text-center md:text-left">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1 hidden md:block">
                {t('評分', '评分', 'Score')}
              </div>
              <span
                className="text-lg md:text-sm font-bold md:font-medium"
                style={{ color: scoreGrade.color }}
              >
                {scoreGrade.label}
              </span>
            </div>
          </div>
        </div>

        {/* 警告訊息 - Mobile: Larger text and touch targets */}
        {results.warnings.length > 0 && (
          <div className="mt-4 md:mt-3 pt-4 md:pt-3 border-t border-border/50">
            <div className="space-y-2 md:space-y-1">
              {results.warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-start gap-2 md:gap-1.5',
                    'p-3 md:p-2 rounded-lg md:rounded',
                    'bg-destructive/10 md:bg-destructive/5',
                    'text-sm md:text-xs text-destructive font-medium md:font-normal',
                    'leading-relaxed'
                  )}
                >
                  <AlertTriangle className="h-5 w-5 md:h-3 md:w-3 flex-shrink-0 mt-0.5 md:mt-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticResultsPanel;
