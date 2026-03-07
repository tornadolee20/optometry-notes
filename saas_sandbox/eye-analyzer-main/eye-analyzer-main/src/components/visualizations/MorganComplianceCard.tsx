import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface MorganComplianceCardProps {
  distPhoria: number;
  nearPhoria: number;
  distPass: boolean;
  nearPass: boolean;
}

export const MorganComplianceCard: React.FC<MorganComplianceCardProps> = ({
  distPhoria,
  nearPhoria,
  distPass,
  nearPass,
}) => {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';

  const t = (tw: string, cn: string, en: string) =>
    isEN ? en : isCN ? cn : tw;

  const allPass = distPass && nearPass;

  // Morgan norm ranges
  const distRange = { min: -1, max: 2 };
  const nearRange = { min: -6, max: 0 };

  const formatPhoria = (value: number) => {
    if (value > 0) return `+${value.toFixed(0)}Δ`;
    if (value < 0) return `${value.toFixed(0)}Δ`;
    return '0Δ';
  };

  const PhoriaCard = ({
    label,
    value,
    pass,
    range,
  }: {
    label: string;
    value: number;
    pass: boolean;
    range: { min: number; max: number };
  }) => (
    <div
      className={cn(
        "rounded-lg border-2 p-3 transition-all",
        pass
          ? "border-success/50 bg-success/5 dark:bg-success/10"
          : "border-destructive/50 bg-destructive/5 dark:bg-destructive/10"
      )}
      role="status"
      aria-label={`${label}: ${formatPhoria(value)}, ${pass ? t('符合標準', '符合标准', 'Pass') : t('不符合標準', '不符合标准', 'Fail')}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {pass ? (
          <CheckCircle className="h-5 w-5 text-success" aria-hidden="true" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
        )}
      </div>

      {/* Value */}
      <div
        className={cn(
          "text-2xl font-bold mb-1",
          pass ? "text-success" : "text-destructive"
        )}
      >
        {formatPhoria(value)}
      </div>

      {/* Expected range */}
      <div className="text-xs text-muted-foreground">
        {t('預期', '预期', 'Expected')}: {range.min > 0 ? '+' : ''}{range.min} {t('至', '至', 'to')} {range.max > 0 ? '+' : ''}{range.max}Δ
      </div>

      {/* Warning if not pass */}
      {!pass && (
        <div className="mt-2 text-xs font-medium text-destructive">
          {t('超出正常範圍', '超出正常范围', 'Outside normal range')}
        </div>
      )}
    </div>
  );

  return (
    <Card
      className={cn(
        "border-l-4 transition-all",
        allPass ? "border-l-success" : "border-l-destructive"
      )}
      role="region"
      aria-label={t('Morgan 常模評估', 'Morgan 常模评估', 'Morgan Norms Assessment')}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5" aria-hidden="true" />
            {t('Morgan 常模評估', 'Morgan 常模评估', 'Morgan Norms')}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "font-semibold",
              allPass
                ? "bg-success/10 text-success border-success/30"
                : "bg-destructive/10 text-destructive border-destructive/30"
            )}
          >
            {allPass
              ? t('✓ 通過', '✓ 通过', '✓ Pass')
              : t('✗ 需處置', '✗ 需处置', '✗ Action Needed')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Grid for Distance and Near */}
        <div className="grid grid-cols-2 gap-3">
          <PhoriaCard
            label={t('遠距（6m）', '远距（6m）', 'Distance (6m)')}
            value={distPhoria}
            pass={distPass}
            range={distRange}
          />
          <PhoriaCard
            label={t('近距（40cm）', '近距（40cm）', 'Near (40cm)')}
            value={nearPhoria}
            pass={nearPass}
            range={nearRange}
          />
        </div>

        {/* Tip when not passing - Dark mode support */}
        {!allPass && (
          <div className="mt-3 flex items-start gap-2 p-2 bg-warning/10 dark:bg-warning/5 border border-warning/30 rounded-md">
            <Lightbulb className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-xs text-warning-foreground dark:text-warning">
              {t(
                '斜位超出 Morgan 常模可能需要稜鏡補償或視覺訓練',
                '斜位超出 Morgan 常模可能需要棱镜补偿或视觉训练',
                'Phoria outside Morgan norms may require prism compensation or vision training'
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MorganComplianceCard;
