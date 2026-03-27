import { useLanguage } from '@/contexts/LanguageContext';
import { CalculationResult } from '@/lib/calculateLogic';
import { Focus, TrendingDown, TrendingUp, Minus, AlertTriangle } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { cn } from '@/lib/utils';

interface AccommodationAnalysisCardProps {
  result: CalculationResult;
  aaOD: number;
  aaOS: number;
  nra: number;
  pra: number;
  mem: number;
  age: number;
  flipper: number;
}

export const AccommodationAnalysisCard = ({
  result,
  aaOD,
  aaOS,
  nra,
  pra,
  mem,
  age,
  flipper,
}: AccommodationAnalysisCardProps) => {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';

  // Expected values
  const expectedAA = Math.max(0, 15 - 0.25 * age);
  const avgAA = (aaOD + aaOS) / 2;
  
  // Normal ranges
  const nraRange = { min: 2.00, max: 2.50 };
  const praRange = { min: -2.50, max: -2.00 };
  const memRange = { min: 0, max: 0.75 };
  const flipperNormal = 12;

  // Status checks
  const aaStatus = avgAA >= expectedAA ? 'normal' : avgAA >= expectedAA * 0.7 ? 'borderline' : 'low';
  const nraStatus = nra >= nraRange.min ? 'normal' : nra >= nraRange.min * 0.75 ? 'borderline' : 'low';
  const praStatus = pra <= praRange.max ? 'normal' : pra <= praRange.max * 0.75 ? 'borderline' : 'weak';
  const memStatus = mem >= memRange.min && mem <= memRange.max ? 'normal' : mem > memRange.max ? 'lag' : 'lead';
  const flipperStatus = flipper >= flipperNormal ? 'normal' : flipper >= flipperNormal * 0.7 ? 'borderline' : 'low';

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'normal':
        return { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', label: isCN ? '正常' : '正常' };
      case 'borderline':
        return { icon: Minus, color: 'text-warning', bg: 'bg-warning/10', label: isCN ? '边缘' : '邊緣' };
      case 'low':
      case 'weak':
        return { icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10', label: isCN ? '偏低' : '偏低' };
      case 'lag':
        return { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', label: isCN ? '滞后' : '滯後' };
      case 'lead':
        return { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', label: isCN ? '超前' : '超前' };
      default:
        return { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted', label: '-' };
    }
  };

  const metrics = [
    {
      name: isEN ? 'Accommodative Amplitude (AA)' : isCN ? '调节幅度 (AA)' : '調節幅度 (AA)',
      value: `OD ${aaOD.toFixed(1)}D / OS ${aaOS.toFixed(1)}D`,
      expected: `${isEN ? 'Expected' : isCN ? '期望' : '期望'} ≥ ${expectedAA.toFixed(1)}D`,
      status: aaStatus,
      explanation: isEN 
        ? 'Accommodative amplitude is the maximum focusing ability of the eye. Below age-expected values indicates ciliary muscle function decline.'
        : isCN 
        ? '调节幅度是眼睛对焦的最大能力。低于年龄期望值表示睫状肌功能下降。'
        : '調節幅度是眼睛對焦的最大能力。低於年齡期望值表示睫狀肌功能下降。',
      formula: 'Hofstetter: 15 - 0.25 × Age'
    },
    {
      name: isCN ? '正相对调节 (NRA)' : '正相對調節 (NRA)',
      value: `+${nra.toFixed(2)}D`,
      expected: `${isCN ? '正常' : '正常'} +2.00 ~ +2.50D`,
      status: nraStatus,
      explanation: isCN 
        ? 'NRA 反映调节放松的能力。过低可能表示调节过度或睫状肌痉挛。'
        : 'NRA 反映調節放鬆的能力。過低可能表示調節過度或睫狀肌痙攣。',
      formula: isCN ? '测量：加正镜至模糊' : '測量：加正鏡至模糊'
    },
    {
      name: isCN ? '负相对调节 (PRA)' : '負相對調節 (PRA)',
      value: `${pra.toFixed(2)}D`,
      expected: `${isCN ? '正常' : '正常'} -2.50 ~ -2.00D`,
      status: praStatus,
      explanation: isCN 
        ? 'PRA 反映调节刺激的能力。过弱可能表示调节力不足。'
        : 'PRA 反映調節刺激的能力。過弱可能表示調節力不足。',
      formula: isCN ? '测量：加负镜至模糊' : '測量：加負鏡至模糊'
    },
    {
      name: isEN ? 'Accommodative Response (BCC)' : isCN ? '调节反应 (BCC)' : '調節反應 (BCC)',
      value: `${mem >= 0 ? '+' : ''}${mem.toFixed(2)}D`,
      expected: `${isEN ? 'Normal' : isCN ? '正常' : '正常'} +0.25 ~ +0.75D`,
      status: memStatus,
      explanation: isEN 
        ? 'BCC measures accommodative response using cross cylinder. Lead (-) indicates over-accommodation, Lag (+) indicates under-accommodation.'
        : isCN 
        ? 'BCC 使用交叉柱镜测量调节反应。超前(-)表示过度调节，滞后(+)表示调节不足。'
        : 'BCC 使用交叉柱鏡測量調節反應。超前(-)表示過度調節，滯後(+)表示調節不足。',
      formula: 'BCC (Binocular Cross Cylinder)'
    },
    {
      name: isCN ? '调节灵敏度 (Flipper)' : '調節靈敏度 (Flipper)',
      value: `${flipper} cpm`,
      expected: `${isCN ? '正常' : '正常'} ≥ 12 cpm`,
      status: flipperStatus,
      explanation: isCN 
        ? 'Flipper 反映调节切换的速度。过慢会导致远近切换时视力模糊。'
        : 'Flipper 反映調節切換的速度。過慢會導致遠近切換時視力模糊。',
      formula: '±2.00D Flipper / 1 min'
    }
  ];

  // Overall accommodation status
  const getOverallStatus = () => {
    const statuses = [aaStatus, nraStatus, praStatus, memStatus, flipperStatus];
    const abnormalCount = statuses.filter(s => s !== 'normal').length;
    if (abnormalCount === 0) return { label: isEN ? 'Normal Accommodation' : isCN ? '调节功能正常' : '調節功能正常', color: 'text-success' };
    if (abnormalCount <= 2) return { label: isEN ? 'Some Abnormalities' : isCN ? '部分指标异常' : '部分指標異常', color: 'text-warning' };
    return { label: isEN ? 'Accommodation Dysfunction' : isCN ? '调节功能障碍' : '調節功能障礙', color: 'text-destructive' };
  };

  const overall = getOverallStatus();

  return (
    <ReportCard
      icon={Focus}
      title={isEN ? 'Accommodation Function Analysis' : isCN ? '调节功能分析' : '調節功能分析'}
      collapsible
      defaultOpen={result.accom.status !== 'Normal'}
    >
      <div className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 expert-metric-box">
          <span className="text-sm font-medium text-foreground">
            {isEN ? 'Overall Assessment' : isCN ? '整体评估' : '整體評估'}
          </span>
          <span className={cn("font-semibold", overall.color)}>
            {overall.label}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-3">
          {metrics.map((metric, idx) => {
            const config = getStatusConfig(metric.status);
            const StatusIcon = config.icon;
            
            return (
              <div key={idx} className="expert-metric-box !p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="text-sm font-semibold text-foreground">{metric.name}</h5>
                    <span className="text-xs text-muted-foreground">{metric.expected}</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg", config.bg)}>
                    <StatusIcon size={14} className={config.color} />
                    <span className={cn("text-xs font-semibold", config.color)}>{config.label}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">{metric.value}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{metric.formula}</span>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {metric.explanation}
                </p>
              </div>
            );
          })}
        </div>

        {/* Functional Age Note */}
        {result.accom.functionalAge > age + 5 && (
          <div className="flex items-start gap-2 p-3 bg-warning/5 rounded-xl border border-warning/20">
            <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-semibold text-warning">
                {isEN ? 'Functional Age Warning' : isCN ? '机能年龄警示' : '機能年齡警示'}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {isEN 
                  ? `Your biological age is ${age} years old, but your accommodation performance equals ${result.accom.functionalAge} years old.`
                  : isCN 
                  ? `您的生理年龄是 ${age} 岁，但调节力表现相当于 ${result.accom.functionalAge} 岁。`
                  : `您的生理年齡是 ${age} 歲，但調節力表現相當於 ${result.accom.functionalAge} 歲。`}
              </p>
            </div>
          </div>
        )}
      </div>
    </ReportCard>
  );
};
