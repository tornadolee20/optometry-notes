import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowLeft, ArrowRight, Minus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface EyePositionVisualizerProps {
  distancePhoria: number;
  nearPhoria: number;
  pattern: 'CI' | 'CE' | 'DI' | 'DE' | 'BX' | 'BE' | 'NORMAL';
}

const getPatternInfo = (pattern: string, language: string) => {
  const patterns: Record<string, { nameZhTW: string; nameZhCN: string; nameEN: string; descZhTW: string; descZhCN: string; descEN: string; color: string }> = {
    CI: {
      nameZhTW: '集合不足',
      nameZhCN: '集合不足',
      nameEN: 'Convergence Insufficiency',
      descZhTW: '近距離工作時眼睛聚合困難，導致閱讀時出現症狀',
      descZhCN: '近距离工作时眼睛聚合困难，导致阅读时出现症状',
      descEN: 'Difficulty converging eyes for near tasks, causing symptoms during reading',
      color: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300'
    },
    CE: {
      nameZhTW: '集合過度',
      nameZhCN: '集合过度',
      nameEN: 'Convergence Excess',
      descZhTW: '眼睛近距離時過度內聚，可能導致眼睛疲勞和頭痛',
      descZhCN: '眼睛近距离时过度内聚，可能导致眼睛疲劳和头痛',
      descEN: 'Excessive inward eye movement at near, may cause eye strain and headaches',
      color: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300'
    },
    DI: {
      nameZhTW: '分散不足',
      nameZhCN: '分散不足',
      nameEN: 'Divergence Insufficiency',
      descZhTW: '眼睛向外分散能力不足，遠距離觀看時可能有複視',
      descZhCN: '眼睛向外分散能力不足，远距离观看时可能有复视',
      descEN: 'Insufficient outward eye movement, may cause diplopia at distance viewing',
      color: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300'
    },
    DE: {
      nameZhTW: '分散過度',
      nameZhCN: '分散过度',
      nameEN: 'Divergence Excess',
      descZhTW: '眼睛遠距離時過度向外偏斜',
      descZhCN: '眼睛远距离时过度向外偏斜',
      descEN: 'Excessive outward eye movement at distance viewing',
      color: 'bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-950 dark:border-cyan-800 dark:text-cyan-300'
    },
    BX: {
      nameZhTW: '基本型外斜視',
      nameZhCN: '基本型外斜视',
      nameEN: 'Basic Exophoria',
      descZhTW: '遠近距離皆有向外偏斜傾向',
      descZhCN: '远近距离皆有向外偏斜倾向',
      descEN: 'Outward eye deviation tendency at both far and near distances',
      color: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
    },
    BE: {
      nameZhTW: '基本型內斜視',
      nameZhCN: '基本型内斜视',
      nameEN: 'Basic Esophoria',
      descZhTW: '遠近距離皆有向內偏斜傾向',
      descZhCN: '远近距离皆有向内偏斜倾向',
      descEN: 'Inward eye deviation tendency at both far and near distances',
      color: 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300'
    },
    NORMAL: {
      nameZhTW: '正常雙眼視覺',
      nameZhCN: '正常双眼视觉',
      nameEN: 'Normal Binocular Vision',
      descZhTW: '眼位在正常範圍內',
      descZhCN: '眼位在正常范围内',
      descEN: 'Eye position within normal range',
      color: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300'
    }
  };
  const p = patterns[pattern] || patterns.NORMAL;
  return {
    name: language === 'en' ? p.nameEN : language === 'zh-CN' ? p.nameZhCN : p.nameZhTW,
    description: language === 'en' ? p.descEN : language === 'zh-CN' ? p.descZhCN : p.descZhTW,
    color: p.color
  };
};

const getPhoriaLabel = (value: number, language: string) => {
  if (value < -1) {
    const severity = Math.abs(value) >= 6 
      ? (language === 'en' ? 'Significant' : language === 'zh-CN' ? '明显' : '明顯') 
      : (language === 'en' ? 'Mild' : language === 'zh-CN' ? '轻微' : '輕微');
    const type = language === 'en' ? 'Exophoria' : '外斜';
    return `${severity}${language === 'en' ? ' ' : ''}${type}`;
  }
  if (value > 1) {
    const severity = value >= 6 
      ? (language === 'en' ? 'Significant' : language === 'zh-CN' ? '明显' : '明顯') 
      : (language === 'en' ? 'Mild' : language === 'zh-CN' ? '轻微' : '輕微');
    const type = language === 'en' ? 'Esophoria' : language === 'zh-CN' ? '内斜' : '內斜';
    return `${severity}${language === 'en' ? ' ' : ''}${type}`;
  }
  return language === 'en' ? 'Orthophoria' : '正位';
};

const EyePositionVisualizer: React.FC<EyePositionVisualizerProps> = ({
  distancePhoria,
  nearPhoria,
  pattern
}) => {
  const { language } = useLanguage();
  const patternInfo = getPatternInfo(pattern, language);

  const getLabel = (key: 'title' | 'distance' | 'near' | 'diagnosis') => {
    const labels = {
      title: { 'zh-TW': '眼位偏斜分析', 'zh-CN': '眼位偏斜分析', 'en': 'Eye Position Analysis' },
      distance: { 'zh-TW': '遠距離 (6m)', 'zh-CN': '远距离 (6m)', 'en': 'Distance (6m)' },
      near: { 'zh-TW': '近距離 (40cm)', 'zh-CN': '近距离 (40cm)', 'en': 'Near (40cm)' },
      diagnosis: { 'zh-TW': '診斷', 'zh-CN': '诊断', 'en': 'Diagnosis' },
    };
    return labels[key][language] || labels[key]['zh-TW'];
  };

  const renderEyePosition = (phoria: number, label: string) => {
    const isExo = phoria < -1;
    const isEso = phoria > 1;
    const severity = Math.abs(phoria);
    const arrowOpacity = Math.min(severity / 10, 1);
    
    return (
      <div className="mb-6">
        <div className="text-sm text-muted-foreground mb-2 font-medium">{label}</div>
        <div className={cn(
          "flex items-center justify-center gap-2 p-6 rounded-xl transition-all",
          "bg-gradient-to-b from-muted/30 to-muted/60 border"
        )}>
          {isExo ? (
            <>
              <span className="text-5xl select-none">👁️</span>
              <div className="flex items-center gap-1" style={{ opacity: 0.5 + arrowOpacity * 0.5 }}>
                <ArrowLeft className={cn(
                  "h-6 w-6 text-orange-500 animate-pulse",
                  severity >= 6 && "h-8 w-8"
                )} />
                <Minus className="h-4 w-4 text-muted-foreground" />
                <ArrowRight className={cn(
                  "h-6 w-6 text-orange-500 animate-pulse",
                  severity >= 6 && "h-8 w-8"
                )} />
              </div>
              <span className="text-5xl select-none">👁️</span>
            </>
          ) : isEso ? (
            <>
              <span className="text-5xl select-none">👁️</span>
              <div className="flex items-center gap-1" style={{ opacity: 0.5 + arrowOpacity * 0.5 }}>
                <ArrowRight className={cn(
                  "h-6 w-6 text-purple-500 animate-pulse",
                  severity >= 6 && "h-8 w-8"
                )} />
                <Minus className="h-4 w-4 text-muted-foreground" />
                <ArrowLeft className={cn(
                  "h-6 w-6 text-purple-500 animate-pulse",
                  severity >= 6 && "h-8 w-8"
                )} />
              </div>
              <span className="text-5xl select-none">👁️</span>
            </>
          ) : (
            <>
              <span className="text-5xl select-none">👁️</span>
              <div className="w-12 h-0.5 bg-green-500 rounded-full" />
              <span className="text-5xl select-none">👁️</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge variant="outline" className="font-mono text-sm">
            {phoria > 0 ? '+' : ''}{phoria}Δ
          </Badge>
          <span className="text-sm text-muted-foreground">
            {phoria < 0 ? 'Exo' : phoria > 0 ? 'Eso' : 'Ortho'} 
            {' '}({getPhoriaLabel(phoria, language)})
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="h-5 w-5 text-primary" />
          {getLabel('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {renderEyePosition(distancePhoria, getLabel('distance'))}
          {renderEyePosition(nearPhoria, getLabel('near'))}
        </div>

        <Alert className={cn("mt-4 border", patternInfo.color)}>
          <AlertTitle className="flex items-center gap-2">
            {getLabel('diagnosis')}: {patternInfo.name}
          </AlertTitle>
          <AlertDescription className="mt-1">
            {patternInfo.description}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EyePositionVisualizer;
