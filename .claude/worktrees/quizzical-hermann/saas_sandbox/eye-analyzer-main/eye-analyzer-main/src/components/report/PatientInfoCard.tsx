import { User, Calendar, Ruler, Eye, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReportCard } from './ReportCard';
import { cn } from '@/lib/utils';

interface PatientInfoCardProps {
  patientCode: string;
  patientName?: string; // Optional - for display only
  age: number;
  functionalAge: number;
  pd: number;
  workDist: number;
  cissScore: number;
}

export const PatientInfoCard = ({
  patientCode,
  patientName,
  age,
  functionalAge,
  pd,
  workDist,
  cissScore,
}: PatientInfoCardProps) => {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';
  
  const t = (zhTW: string, zhCN: string, en: string) => isEN ? en : isCN ? zhCN : zhTW;

  // Determine functional age status
  const ageDiff = age - functionalAge;
  const ageStatus = ageDiff > 5 ? 'good' : ageDiff < -5 ? 'warning' : 'normal';
  
  // CISS status
  const isChild = age < 18;
  const cissThreshold = isChild ? 16 : 21;
  const cissStatus = cissScore < cissThreshold ? 'good' : 'warning';

  return (
    <ReportCard
      icon={User}
      title={t('顧客基本資訊', '客户基本信息', 'Patient Information')}
      variant="default"
    >
      <div className="grid grid-cols-2 gap-3">
        {/* Customer Code / Name */}
        <div className="col-span-2 list-item flex-col items-start py-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <User size={12} />
            {patientName ? t('顧客', '客户', 'Patient') : t('編號', '编号', 'Code')}
          </div>
          <div className="font-semibold text-base text-foreground">
            {patientName || `#${patientCode}`}
          </div>
          {patientName && (
            <div className="text-xs text-muted-foreground">
              #{patientCode}
            </div>
          )}
        </div>

        {/* Age */}
        <div className="list-item flex-col items-start py-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar size={12} />
            {t('年齡', '年龄', 'Age')}
          </div>
          <div className="font-semibold text-sm text-foreground">
            {age} {t('歲', '岁', 'yrs')}
          </div>
        </div>

        {/* Functional Age */}
        <div className="list-item flex-col items-start py-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Activity size={12} />
            {t('功能年齡', '功能年龄', 'Functional Age')}
          </div>
          <div className={cn(
            "font-semibold text-sm flex items-center gap-1",
            ageStatus === 'good' ? 'text-success' : 
            ageStatus === 'warning' ? 'text-warning' : 'text-foreground'
          )}>
            {functionalAge} {t('歲', '岁', 'yrs')}
            {ageStatus === 'good' && <span className="text-xs">⬇️</span>}
            {ageStatus === 'warning' && <span className="text-xs">⬆️</span>}
          </div>
        </div>

        {/* PD */}
        <div className="list-item flex-col items-start py-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Ruler size={12} />
            PD
          </div>
          <div className="font-semibold text-sm text-foreground">
            {pd} mm
          </div>
        </div>

        {/* Work Distance */}
        <div className="list-item flex-col items-start py-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Eye size={12} />
            {t('工作距離', '工作距离', 'Working Distance')}
          </div>
          <div className="font-semibold text-sm text-foreground">
            {workDist} cm
          </div>
        </div>

        {/* CISS Score */}
        <div className="col-span-2 list-item flex-col items-start py-2">
          <div className="text-xs text-muted-foreground">
            CISS {t('分數', '分数', 'Score')}
          </div>
          <div className={cn(
            "font-semibold text-sm flex items-center gap-2",
            cissStatus === 'good' ? 'text-success' : 'text-warning'
          )}>
            {cissScore} {t('分', '分', 'pts')}
            <span className="text-xs font-normal text-muted-foreground">
              ({cissStatus === 'good' 
                ? t('無症狀', '无症状', 'Asymptomatic') 
                : t('有症狀傾向', '有症状倾向', 'Symptomatic')})
            </span>
          </div>
        </div>
      </div>
    </ReportCard>
  );
};
