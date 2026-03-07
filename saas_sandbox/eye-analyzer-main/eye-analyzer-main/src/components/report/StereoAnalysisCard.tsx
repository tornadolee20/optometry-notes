import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { cn } from '@/lib/utils';

interface StereoAnalysisCardProps {
  stereo: number;
  age: number;
}

export const StereoAnalysisCard = ({
  stereo,
  age,
}: StereoAnalysisCardProps) => {
  const { language } = useLanguage();
  const t = (zhTW: string, zhCN: string, en: string) => {
    if (language === 'en') return en;
    return language === 'zh-CN' ? zhCN : zhTW;
  };

  // Stereo vision grading
  const getGrade = () => {
    if (stereo <= 20) return { 
      grade: 'excellent', 
      label: t('優秀', '优秀', 'Excellent'),
      color: 'text-success',
      bg: 'bg-success/10',
      icon: CheckCircle,
      desc: t('立體視覺非常敏銳，具備精細深度感知能力。', '立体视觉非常敏锐，具备精细深度感知能力。', 'Excellent stereopsis with fine depth perception.')
    };
    if (stereo <= 40) return { 
      grade: 'good', 
      label: t('良好', '良好', 'Good'),
      color: 'text-success',
      bg: 'bg-success/10',
      icon: CheckCircle,
      desc: t('立體視覺正常，日常深度判斷無障礙。', '立体视觉正常，日常深度判断无障碍。', 'Normal stereopsis, no difficulty with daily depth judgment.')
    };
    if (stereo <= 60) return { 
      grade: 'normal', 
      label: t('正常', '正常', 'Normal'),
      color: 'text-success',
      bg: 'bg-success/10',
      icon: CheckCircle,
      desc: t('立體視覺在正常範圍內。', '立体视觉在正常范围内。', 'Stereopsis within normal range.')
    };
    if (stereo <= 100) return { 
      grade: 'reduced', 
      label: t('輕度下降', '轻度下降', 'Mildly Reduced'),
      color: 'text-warning',
      bg: 'bg-warning/10',
      icon: AlertTriangle,
      desc: t('立體視覺輕度下降，精細深度感知可能受影響。', '立体视觉轻度下降，精细深度感知可能受影响。', 'Mildly reduced stereopsis, fine depth perception may be affected.')
    };
    if (stereo <= 200) return { 
      grade: 'moderate', 
      label: t('中度下降', '中度下降', 'Moderately Reduced'),
      color: 'text-warning',
      bg: 'bg-warning/10',
      icon: AlertTriangle,
      desc: t('立體視覺中度下降，建議進一步評估雙眼融像功能。', '立体视觉中度下降，建议进一步评估双眼融像功能。', 'Moderately reduced, recommend further binocular fusion evaluation.')
    };
    if (stereo <= 400) return { 
      grade: 'poor', 
      label: t('明顯下降', '明显下降', 'Significantly Reduced'),
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      icon: XCircle,
      desc: t('立體視覺明顯下降，可能影響駕駛、運動等活動。', '立体视觉明显下降，可能影响驾驶、运动等活动。', 'Significantly reduced, may affect driving and sports.')
    };
    return { 
      grade: 'absent', 
      label: t('缺失', '缺失', 'Absent'),
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      icon: XCircle,
      desc: t('立體視覺嚴重受損或缺失，需詳細檢查雙眼視功能。', '立体视觉严重受损或缺失，需详细检查双眼视功能。', 'Severely impaired or absent, detailed binocular exam needed.')
    };
  };

  const gradeInfo = getGrade();
  const GradeIcon = gradeInfo.icon;

  // Reference values
  const referenceValues = [
    { threshold: 20, label: t('優秀 (≤20")', '优秀 (≤20")', 'Excellent (≤20")') },
    { threshold: 40, label: t('良好 (≤40")', '良好 (≤40")', 'Good (≤40")') },
    { threshold: 60, label: t('正常 (≤60")', '正常 (≤60")', 'Normal (≤60")') },
    { threshold: 100, label: t('輕度下降 (≤100")', '轻度下降 (≤100")', 'Mildly Reduced (≤100")') },
    { threshold: 200, label: t('中度下降 (≤200")', '中度下降 (≤200")', 'Moderately Reduced (≤200")') },
    { threshold: 400, label: t('明顯下降 (≤400")', '明显下降 (≤400")', 'Significantly Reduced (≤400")') },
  ];

  // Clinical implications
  const clinicalImplications = [
    {
      activity: t('精密工作', '精密工作', 'Precision Work'),
      requirement: '≤ 40"',
      suitable: stereo <= 40
    },
    {
      activity: t('駕駛安全', '驾驶安全', 'Safe Driving'),
      requirement: '≤ 100"',
      suitable: stereo <= 100
    },
    {
      activity: t('球類運動', '球类运动', 'Ball Sports'),
      requirement: '≤ 60"',
      suitable: stereo <= 60
    },
    {
      activity: t('3D電影', '3D电影', '3D Movies'),
      requirement: '≤ 200"',
      suitable: stereo <= 200
    }
  ];

  return (
    <ReportCard
      icon={Eye}
      title={t('立體視分析', '立体视分析', 'Stereopsis Analysis')}
      collapsible
      defaultOpen={stereo > 60}
    >
      <div className="space-y-4">
        {/* Main Score Display */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-20 h-20 rounded-2xl flex flex-col items-center justify-center",
            gradeInfo.bg
          )}>
            <span className={cn("text-2xl font-bold", gradeInfo.color)}>
              {stereo}"
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              arc sec
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <GradeIcon size={16} className={gradeInfo.color} />
              <span className={cn("font-semibold", gradeInfo.color)}>
                {gradeInfo.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {gradeInfo.desc}
            </p>
          </div>
        </div>

        {/* Reference Scale */}
        <div className="expert-metric-box">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t('參考標準', '参考标准', 'Reference Standard')}
          </h5>
          
          <div className="relative h-4 bg-gradient-to-r from-success via-warning to-destructive rounded-full overflow-hidden">
            {/* Current value marker */}
            <div 
              className="absolute top-0 h-full w-1 bg-foreground rounded-full shadow-lg"
              style={{ left: `${Math.min(95, (Math.log10(stereo + 1) / Math.log10(500)) * 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
            <span>20"</span>
            <span>60"</span>
            <span>100"</span>
            <span>400"</span>
          </div>
        </div>

        {/* Clinical Implications */}
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-2">
            {t('活動適合度評估', '活动适合度评估', 'Activity Suitability')}
          </h5>
          <div className="grid grid-cols-2 gap-2">
            {clinicalImplications.map((item, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "p-2.5 rounded-lg border flex items-center justify-between",
                  item.suitable 
                    ? "bg-success/5 border-success/20" 
                    : "bg-destructive/5 border-destructive/20"
                )}
              >
                <div>
                  <div className="text-xs font-semibold text-foreground">{item.activity}</div>
                  <div className="text-[10px] text-muted-foreground">{item.requirement}</div>
                </div>
                {item.suitable ? (
                  <CheckCircle size={16} className="text-success" />
                ) : (
                  <XCircle size={16} className="text-destructive" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-2 pt-2 border-t border-expert-border">
          <Info size={14} className="text-expert flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t(
              '立體視 (Stereopsis) 是雙眼融像的最高階功能，以秒角 (arc seconds) 為單位。數值越小代表立體視越敏銳。',
              '立体视 (Stereopsis) 是双眼融像的最高阶功能，以秒角 (arc seconds) 为单位。数值越小代表立体视越敏锐。',
              'Stereopsis is the highest level of binocular fusion, measured in arc seconds. Lower values indicate sharper stereopsis.'
            )}
          </p>
        </div>
      </div>
    </ReportCard>
  );
};
