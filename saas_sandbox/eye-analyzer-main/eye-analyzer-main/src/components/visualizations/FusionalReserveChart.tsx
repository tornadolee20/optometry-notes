import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface FusionalReserveChartProps {
  boBreak: number;
  boRecovery: number;
  biBreak: number;
  biRecovery: number;
  sheardMinimum: number;
  percivalRange: [number, number];
  distance: 'far' | 'near';
  phoria?: number;
}

const FusionalReserveChart: React.FC<FusionalReserveChartProps> = ({
  boBreak,
  boRecovery,
  biBreak,
  biRecovery,
  sheardMinimum,
  percivalRange,
  distance,
  phoria = 0
}) => {
  const { language } = useLanguage();
  const maxValue = Math.max(boBreak, biBreak, 30) + 5;
  
  const isExophoria = phoria < 0;
  const compensatingReserve = isExophoria ? boBreak : biBreak;
  const meetsSheard = compensatingReserve >= sheardMinimum;
  const inPercivalRange = compensatingReserve >= percivalRange[0] && compensatingReserve <= percivalRange[1];

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      fusionalReserveAnalysis: { 'zh-TW': '融像儲備分析', 'zh-CN': '融像储备分析', 'en': 'Fusional Reserve Analysis' },
      farDistance: { 'zh-TW': '遠距離', 'zh-CN': '远距离', 'en': 'Distance' },
      nearDistance: { 'zh-TW': '近距離', 'zh-CN': '近距离', 'en': 'Near' },
      compensatingReserve: { 'zh-TW': '代償性儲備', 'zh-CN': '代偿性储备', 'en': 'Compensating Reserve' },
      clinicalStandardReference: { 'zh-TW': '臨床標準參照', 'zh-CN': '临床标准参照', 'en': 'Clinical Standard Reference' },
      sheardCriterion: { 'zh-TW': 'Sheard 準則', 'zh-CN': 'Sheard 准则', 'en': "Sheard's Criterion" },
      percivalComfortZone: { 'zh-TW': 'Percival 舒適區', 'zh-CN': 'Percival 舒适区', 'en': "Percival's Comfort Zone" },
      meetsCriterion: { 'zh-TW': '符合', 'zh-CN': '符合', 'en': 'Meets' },
      belowStandard: { 'zh-TW': '低於標準', 'zh-CN': '低于标准', 'en': 'Below Standard' },
      inComfortZone: { 'zh-TW': '舒適區內', 'zh-CN': '舒适区内', 'en': 'In Comfort Zone' },
      outOfComfortZone: { 'zh-TW': '舒適區外', 'zh-CN': '舒适区外', 'en': 'Out of Comfort Zone' },
      fusionalReserveInsufficient: { 'zh-TW': '融像儲備不足', 'zh-CN': '融像储备不足', 'en': 'Fusional Reserve Insufficient' },
      boLabel: { 'zh-TW': 'BO（基底朝外，集合儲備）', 'zh-CN': 'BO（基底朝外，集合储备）', 'en': 'BO (Base Out, Convergence Reserve)' },
      biLabel: { 'zh-TW': 'BI（基底朝內，分散儲備）', 'zh-CN': 'BI（基底朝内，分散储备）', 'en': 'BI (Base In, Divergence Reserve)' },
      insufficientMessage: { 
        'zh-TW': `代償性儲備 (${compensatingReserve}Δ) 低於 Sheard 標準 (${sheardMinimum}Δ)，可能需要稜鏡或視覺訓練介入。`,
        'zh-CN': `代偿性储备 (${compensatingReserve}Δ) 低于 Sheard 标准 (${sheardMinimum}Δ)，可能需要棱镜或视觉训练介入。`,
        'en': `Compensating reserve (${compensatingReserve}Δ) is below Sheard's criterion (${sheardMinimum}Δ), may need prism or vision training intervention.`
      },
    };
    return translations[key]?.[language] || translations[key]?.['zh-TW'] || key;
  };

  const renderBar = (
    label: string,
    breakValue: number,
    recoveryValue: number,
    primaryColor: string,
    secondaryColor: string,
    isCompensating: boolean
  ) => {
    const breakWidth = (breakValue / maxValue) * 100;
    const recoveryWidth = (recoveryValue / maxValue) * 100;
    const sheardWidth = (sheardMinimum / maxValue) * 100;

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="font-medium flex items-center gap-2">
            {label}
            {isCompensating && (
              <Badge variant="secondary" className="text-xs">
                {t('compensatingReserve')}
              </Badge>
            )}
          </span>
          <span className="font-mono text-muted-foreground">
            {breakValue}Δ / {recoveryValue}Δ
          </span>
        </div>
        
        <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
          {/* Recovery zone */}
          <div 
            className={cn("absolute h-full transition-all", secondaryColor)}
            style={{ width: `${recoveryWidth}%` }}
          />
          {/* Break zone */}
          <div 
            className={cn("absolute h-full transition-all", primaryColor)}
            style={{ width: `${breakWidth}%`, opacity: 0.7 }}
          />
          
          {/* Sheard reference line */}
          {isCompensating && (
            <div 
              className="absolute h-full w-0.5 border-l-2 border-dashed border-orange-500 z-10"
              style={{ left: `${sheardWidth}%` }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-orange-500 rounded-full" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sheard: {sheardMinimum}Δ</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          
          {/* Value labels inside bar */}
          <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium text-white">
            <span className="drop-shadow-md">R: {recoveryValue}Δ</span>
            <span className="drop-shadow-md">B: {breakValue}Δ</span>
          </div>
        </div>
        
        {/* Scale markers */}
        <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
          <span>0</span>
          <span>{Math.round(maxValue / 2)}Δ</span>
          <span>{maxValue}Δ</span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          {t('fusionalReserveAnalysis')} - 
          {distance === 'far' 
            ? ` ${t('farDistance')}`
            : ` ${t('nearDistance')}`
          }
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* BO Bar */}
        {renderBar(
          t('boLabel'),
          boBreak,
          boRecovery,
          'bg-emerald-500',
          'bg-emerald-300',
          isExophoria
        )}

        {/* BI Bar */}
        {renderBar(
          t('biLabel'),
          biBreak,
          biRecovery,
          'bg-blue-500',
          'bg-blue-300',
          !isExophoria && phoria > 0
        )}

        {/* Clinical Standards Reference */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            {t('clinicalStandardReference')}
          </h4>
          
          {/* Sheard's Criterion */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[160px]">
              <div className="w-6 h-0.5 border-t-2 border-dashed border-orange-500" />
              <span className="text-sm">{t('sheardCriterion')}</span>
            </div>
            <span className="text-sm font-mono">{sheardMinimum}Δ</span>
            {meetsSheard ? (
              <Badge variant="default" className="bg-green-600 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {t('meetsCriterion')}
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {t('belowStandard')}
              </Badge>
            )}
          </div>

          {/* Percival's Criterion */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[160px]">
              <div className="w-6 h-3 bg-green-200 rounded" />
              <span className="text-sm">{t('percivalComfortZone')}</span>
            </div>
            <span className="text-sm font-mono">{percivalRange[0]}-{percivalRange[1]}Δ</span>
            {inPercivalRange ? (
              <Badge variant="default" className="bg-green-600 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {t('inComfortZone')}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                {t('outOfComfortZone')}
              </Badge>
            )}
          </div>
        </div>

        {/* Summary */}
        {!meetsSheard && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-destructive">
                  {t('fusionalReserveInsufficient')}
                </span>
                <p className="text-muted-foreground mt-1">
                  {t('insufficientMessage')}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FusionalReserveChart;
