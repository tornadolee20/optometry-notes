import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface VisionAcuityCardProps {
  distBcvaOD?: string | null;
  distBcvaOS?: string | null;
  nearBcvaOD?: string | null;
  nearBcvaOS?: string | null;
  distUaOD?: string | null;
  distUaOS?: string | null;
}

export const VisionAcuityCard = ({
  distBcvaOD,
  distBcvaOS,
  nearBcvaOD,
  nearBcvaOS,
  distUaOD,
  distUaOS,
}: VisionAcuityCardProps) => {
  const { language } = useLanguage();
  
  const t = (zhTW: string, zhCN: string, en: string) => {
    if (language === 'en') return en;
    if (language === 'zh-CN') return zhCN;
    return zhTW;
  };

  // Check if any VA data exists
  const hasData = distBcvaOD || distBcvaOS || nearBcvaOD || nearBcvaOS || distUaOD || distUaOS;
  
  if (!hasData) {
    return null;
  }

  const formatVA = (value: string | null | undefined) => {
    if (!value) return '—';
    return value;
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-5 w-5 text-primary" />
          {t('視力檢查結果', '视力检查结果', 'Visual Acuity Results')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Distance BCVA */}
        {(distBcvaOD || distBcvaOS) && (
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">
              {t('遠方最佳矯正視力', '远方最佳矫正视力', 'Distance BCVA')}
            </span>
            <div className="flex gap-4 text-sm font-medium">
              <span>OD: {formatVA(distBcvaOD)}</span>
              <span>OS: {formatVA(distBcvaOS)}</span>
            </div>
          </div>
        )}
        
        {/* Near BCVA */}
        {(nearBcvaOD || nearBcvaOS) && (
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">
              {t('近方最佳矯正視力', '近方最佳矫正视力', 'Near BCVA')}
            </span>
            <div className="flex gap-4 text-sm font-medium">
              <span>OD: {formatVA(nearBcvaOD)}</span>
              <span>OS: {formatVA(nearBcvaOS)}</span>
            </div>
          </div>
        )}
        
        {/* Distance UA (if BCVA not present, show UA) */}
        {!(distBcvaOD || distBcvaOS) && (distUaOD || distUaOS) && (
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">
              {t('遠方裸視', '远方裸视', 'Distance Uncorrected')}
            </span>
            <div className="flex gap-4 text-sm font-medium">
              <span>OD: {formatVA(distUaOD)}</span>
              <span>OS: {formatVA(distUaOS)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
