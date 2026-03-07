import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ACAAnalysisCardProps {
  calculatedACA: number;
  gradientACA?: number;
  isReliable: boolean;
  aaDeficit: number;
}

export const ACAAnalysisCard: React.FC<ACAAnalysisCardProps> = ({
  calculatedACA,
  gradientACA,
  isReliable,
  aaDeficit,
}) => {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';
  const [isOpen, setIsOpen] = React.useState(false);

  const t = (tw: string, cn: string, en: string) =>
    isEN ? en : isCN ? cn : tw;

  // Determine which value to display prominently
  const hasGradient = gradientACA !== undefined && gradientACA !== null;
  const primaryValue = hasGradient ? gradientACA : calculatedACA;
  const primaryMethod = hasGradient 
    ? t('梯度法', '梯度法', 'Gradient')
    : t('計算法', '计算法', 'Calculated');

  // Theoretical AC/A is typically around 4.0 Δ/D
  const theoreticalACA = 4.0;
  const deviation = primaryValue - theoreticalACA;

  // Determine if recommendation badge should show
  const showRecommendation = !hasGradient && aaDeficit > 2.0;

  // Format value with sign
  const formatValue = (value: number) => {
    if (value >= 0) return value.toFixed(1);
    return value.toFixed(1);
  };

  return (
    <Card 
      className="border-l-4 border-l-primary"
      role="region"
      aria-label={t('AC/A 比率分析', 'AC/A 比率分析', 'AC/A Ratio Analysis')}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {t('AC/A 比率分析', 'AC/A 比率分析', 'AC/A Ratio Analysis')}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Primary Value Display */}
        <div className="text-center py-2" aria-live="polite">
          <div className="text-5xl font-bold tabular-nums text-primary">
            {formatValue(primaryValue)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Δ/D（{primaryMethod}）
          </div>
        </div>

        {/* Reliability Badge - Dark mode support */}
        {showRecommendation && (
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="bg-warning/10 dark:bg-warning/5 border-warning/30 text-warning cursor-help"
                  >
                    <Info className="h-3 w-3 mr-1" aria-hidden="true" />
                    {t('建議梯度法驗證', '建议梯度法验证', 'Gradient verification recommended')}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    {t(
                      '調節不足可能影響計算法準確度，建議補測梯度法 AC/A（使用 +1.00D 或 +2.00D 鏡片）',
                      '调节不足可能影响计算法准确度，建议补测梯度法 AC/A（使用 +1.00D 或 +2.00D 镜片）',
                      'Accommodative insufficiency may affect calculated AC/A accuracy. Consider gradient method (+1.00D or +2.00D lens).'
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Collapsible Details */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
            {isOpen 
              ? t('收起計算細節', '收起计算细节', 'Hide details')
              : t('查看計算細節', '查看计算细节', 'View details')
            }
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="mt-2 p-3 bg-muted rounded-md space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('計算法', '计算法', 'Calculated')}：
                </span>
                <span className="font-mono font-medium">
                  {calculatedACA.toFixed(2)} Δ/D
                </span>
              </div>
              
              {hasGradient && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('梯度法', '梯度法', 'Gradient')}：
                  </span>
                  <span className="font-mono font-medium text-primary">
                    {gradientACA!.toFixed(2)} Δ/D
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('理論值', '理论值', 'Theoretical')}：
                </span>
                <span className="font-mono">
                  {theoreticalACA.toFixed(1)} Δ/D
                </span>
              </div>
              
              <div className="flex justify-between pt-1 border-t border-border">
                <span className="text-muted-foreground">
                  {t('差異', '差异', 'Deviation')}：
                </span>
                <span className={cn(
                  "font-mono font-medium",
                  Math.abs(deviation) > 2 ? "text-amber-600" : "text-muted-foreground"
                )}>
                  {deviation >= 0 ? '+' : ''}{deviation.toFixed(1)} Δ/D
                </span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default ACAAnalysisCard;
