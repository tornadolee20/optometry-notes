import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { clinicalTooltips, ClinicalTooltipData } from '@/lib/clinicalTooltips';
import { cn } from '@/lib/utils';

interface ClinicalTooltipContentProps {
  tooltipKey: string;
  age?: number;
}

export const ClinicalTooltipContent = ({ tooltipKey, age }: ClinicalTooltipContentProps) => {
  const { language } = useLanguage();
  const tooltip = clinicalTooltips[tooltipKey];
  
  if (!tooltip) {
    return null;
  }

  const getName = (t: ClinicalTooltipData) => {
    if (language === 'en') return t.nameEn;
    if (language === 'zh-CN') return t.nameZhCN;
    return t.nameZhTW;
  };

  const getDescription = (t: ClinicalTooltipData) => {
    if (language === 'en') return t.descriptionEn;
    if (language === 'zh-CN') return t.descriptionZhCN;
    return t.descriptionZhTW;
  };

  const getRangeLabel = (range: ClinicalTooltipData['ranges'][0]) => {
    if (language === 'en') return range.labelEn;
    if (language === 'zh-CN') return range.labelZhCN;
    return range.labelZhTW;
  };

  const getUnit = (t: ClinicalTooltipData) => {
    if (!t.unitZhTW) return null;
    if (language === 'en') return t.unitEn;
    if (language === 'zh-CN') return t.unitZhCN;
    return t.unitZhTW;
  };

  const getBadgeColorClass = (color: 'green' | 'yellow' | 'red' | 'blue') => {
    switch (color) {
      case 'green':
        return 'bg-success/20 text-success border-success/30 hover:bg-success/20';
      case 'yellow':
        return 'bg-warning/20 text-warning border-warning/30 hover:bg-warning/20';
      case 'red':
        return 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/20';
      case 'blue':
        return 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/20';
      default:
        return '';
    }
  };

  // For AA, show age-specific expected value
  const getAdjustedRanges = () => {
    if (tooltipKey === 'aa' && age) {
      const expected = Math.max(0, 18.5 - 0.3 * age).toFixed(1);
      return [{
        ...tooltip.ranges[0],
        condition: `≥${expected}D (Hofstetter)`
      }];
    }
    return tooltip.ranges;
  };

  const displayRanges = getAdjustedRanges();

  return (
    <div className="space-y-2.5 max-w-sm">
      {/* Header: Name + Abbreviation */}
      <div>
        <div className="font-semibold text-base text-foreground">
          {getName(tooltip)}
          {tooltip.abbreviation && (
            <span className="text-muted-foreground font-normal ml-1">
              ({tooltip.abbreviation})
            </span>
          )}
        </div>
        {language !== 'en' && (
          <div className="text-xs text-muted-foreground">
            {tooltip.nameEn}
          </div>
        )}
      </div>

      {/* Range Badges */}
      <div className="flex gap-1.5 flex-wrap">
        {displayRanges.map((range, index) => (
          <Badge 
            key={index}
            variant="outline"
            className={cn(
              "text-xs font-medium px-2 py-0.5",
              getBadgeColorClass(range.color)
            )}
          >
            {getRangeLabel(range)} {range.condition}
          </Badge>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {getDescription(tooltip)}
        {getUnit(tooltip) && (
          <span className="text-xs ml-1">
            ({language === 'en' ? 'Unit' : '單位'}: {getUnit(tooltip)})
          </span>
        )}
      </p>
    </div>
  );
};
