import { useLanguage } from '@/contexts/LanguageContext';
import { CalculationResult } from '@/lib/calculateLogic';
import { ClipboardCheck, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { cn } from '@/lib/utils';

interface CissAnalysisCardProps {
  result: CalculationResult;
  cissScore: number;
  age: number;
}

export const CissAnalysisCard = ({
  result,
  cissScore,
  age,
}: CissAnalysisCardProps) => {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';

  // CISS thresholds by age
  const isChild = age < 18;
  const threshold = isChild ? 16 : 21;
  const isSymptomatic = cissScore >= threshold;
  
  // Severity levels
  const getSeverity = () => {
    if (cissScore < threshold * 0.5) return 'minimal';
    if (cissScore < threshold * 0.75) return 'mild';
    if (cissScore < threshold) return 'moderate';
    if (cissScore < threshold * 1.5) return 'significant';
    return 'severe';
  };
  
  const severity = getSeverity();
  
  const severityConfig = {
    minimal: {
      label: isEN ? 'Minimal' : isCN ? '极轻微' : '極輕微',
      color: 'text-success',
      bgColor: 'bg-success/10',
      desc: isEN ? 'Almost no visual fatigue symptoms' : isCN ? '几乎没有视觉疲劳症状' : '幾乎沒有視覺疲勞症狀'
    },
    mild: {
      label: isEN ? 'Mild' : isCN ? '轻微' : '輕微',
      color: 'text-success',
      bgColor: 'bg-success/10',
      desc: isEN ? 'Occasional mild discomfort, does not affect daily life' : isCN ? '偶尔有轻微不适，不影响日常' : '偶爾有輕微不適，不影響日常'
    },
    moderate: {
      label: isEN ? 'Moderate' : isCN ? '中等' : '中等',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      desc: isEN ? 'Noticeable symptoms but below clinical threshold' : isCN ? '有明显症状但未达临床阈值' : '有明顯症狀但未達臨床閾值'
    },
    significant: {
      label: isEN ? 'Significant' : isCN ? '显著' : '顯著',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      desc: isEN ? 'Exceeds clinical threshold, active treatment recommended' : isCN ? '超过临床阈值，建议积极处理' : '超過臨床閾值，建議積極處理'
    },
    severe: {
      label: isEN ? 'Severe' : isCN ? '严重' : '嚴重',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      desc: isEN ? 'Obvious symptoms, priority treatment needed' : isCN ? '症状明显，需优先处理' : '症狀明顯，需優先處理'
    }
  };

  const config = severityConfig[severity];

  // Symptom categories explanation
  const symptomCategories = [
    {
      name: isEN ? 'Eye Discomfort' : isCN ? '眼睛不适' : '眼睛不適',
      items: isEN 
        ? ['Eye pain', 'Eye fatigue', 'Dry eyes'] 
        : isCN 
        ? ['眼睛酸痛', '眼睛疲劳', '眼睛干涩'] 
        : ['眼睛痠痛', '眼睛疲勞', '眼睛乾澀'],
      range: '1-5'
    },
    {
      name: isEN ? 'Head Symptoms' : isCN ? '头部症状' : '頭部症狀',
      items: isEN 
        ? ['Headache', 'Brow tension'] 
        : isCN 
        ? ['头痛', '眉心紧绷'] 
        : ['頭痛', '眉心緊繃'],
      range: '6-8'
    },
    {
      name: isEN ? 'Visual Symptoms' : isCN ? '视觉症状' : '視覺症狀',
      items: isEN 
        ? ['Blurry vision', 'Double vision', 'Moving text'] 
        : isCN 
        ? ['视线模糊', '重影', '字体移动'] 
        : ['視線模糊', '重影', '字體移動'],
      range: '9-12'
    },
    {
      name: isEN ? 'Attention Issues' : isCN ? '注意力问题' : '注意力問題',
      items: isEN 
        ? ['Reading difficulty', 'Poor concentration', 'Need re-reading'] 
        : isCN 
        ? ['阅读困难', '专注力下降', '需重读'] 
        : ['閱讀困難', '專注力下降', '需重讀'],
      range: '13-15'
    }
  ];

  return (
    <ReportCard
      icon={ClipboardCheck}
      title={isEN ? 'CISS Questionnaire Analysis' : isCN ? 'CISS 问卷分析' : 'CISS 問卷分析'}
      collapsible
      defaultOpen={isSymptomatic}
    >
      <div className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-20 h-20 rounded-2xl flex flex-col items-center justify-center",
            config.bgColor
          )}>
            <span className={cn("text-3xl font-bold", config.color)}>
              {cissScore}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              / 60
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isSymptomatic ? (
                <AlertCircle size={16} className="text-destructive" />
              ) : (
                <CheckCircle size={16} className="text-success" />
              )}
              <span className={cn("font-semibold", config.color)}>
                {config.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {config.desc}
            </p>
          </div>
        </div>

        {/* Threshold Info */}
        <div className="expert-metric-box">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {isEN ? 'Clinical Threshold' : isCN ? '临床阈值' : '臨床閾值'}
            </span>
            <span className="text-sm font-bold text-primary">
              {threshold} {isEN ? 'pts' : isCN ? '分' : '分'} ({isChild ? (isEN ? 'Child' : isCN ? '儿童' : '兒童') : (isEN ? 'Adult' : isCN ? '成人' : '成人')})
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "absolute left-0 top-0 h-full rounded-full transition-all",
                isSymptomatic ? "bg-destructive" : "bg-success"
              )}
              style={{ width: `${Math.min(100, (cissScore / 60) * 100)}%` }}
            />
            {/* Threshold marker */}
            <div 
              className="absolute top-0 h-full w-0.5 bg-foreground/50"
              style={{ left: `${(threshold / 60) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>0</span>
            <span className="relative" style={{ left: `${(threshold / 60) * 50 - 10}%` }}>
              {isEN ? 'Threshold' : isCN ? '阈值' : '閾值'} ({threshold})
            </span>
            <span>60</span>
          </div>
        </div>

        {/* Symptom Categories */}
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-2">
            {isEN ? 'Symptom Categories' : isCN ? '症状分类说明' : '症狀分類說明'}
          </h5>
          <div className="grid grid-cols-2 gap-2">
            {symptomCategories.map((cat, idx) => (
              <div key={idx} className="expert-metric-box !p-2.5">
                <div className="text-xs font-semibold text-foreground mb-1">
                  {cat.name}
                </div>
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  {cat.items.join('、')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Note */}
        <div className="flex items-start gap-2 pt-2 border-t border-expert-border">
          <TrendingUp size={14} className="text-expert flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isEN 
              ? 'CISS (Convergence Insufficiency Symptom Survey) is a standardized questionnaire for assessing binocular vision-related symptoms. Higher scores indicate more obvious symptoms. Can be retested after treatment to track improvement.'
              : isCN 
              ? 'CISS (Convergence Insufficiency Symptom Survey) 是评估双眼视觉相关症状的标准化问卷。分数越高代表症状越明显。治疗后可重测追踪改善程度。'
              : 'CISS (Convergence Insufficiency Symptom Survey) 是評估雙眼視覺相關症狀的標準化問卷。分數越高代表症狀越明顯。治療後可重測追蹤改善程度。'}
          </p>
        </div>
      </div>
    </ReportCard>
  );
};
