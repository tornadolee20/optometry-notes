import { MemberSummary } from '@/types';
import { getRoleBadge, getAge } from '@/data/mockData';
import { AlertTriangle, Pill, ChevronRight } from 'lucide-react';

interface MemberCardProps {
  member: MemberSummary;
  onTap: () => void;
}

const MemberCard = ({ member, onTap }: MemberCardProps) => {
  const { profile, latestSphere_R, latestSphere_L, latestCylinder_R, prevSphere_R, prevSphere_L, daysSinceLastVisit, isOverdue, hasVisionRiskMeds, nextExamDate } = member;
  const badge = getRoleBadge(profile.role);
  const age = getAge(profile.birth_date);

  const changeR = latestSphere_R !== undefined && prevSphere_R !== undefined
    ? latestSphere_R - prevSphere_R : null;
  const changeL = latestSphere_L !== undefined && prevSphere_L !== undefined
    ? latestSphere_L - prevSphere_L : null;

  const formatDiopter = (val?: number) => val !== undefined ? (val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)) : '—';
  const formatChange = (val: number | null) => {
    if (val === null) return null;
    const abs = Math.abs(val).toFixed(2);
    if (val < 0) return { text: `↓${abs}`, worsening: true };
    if (val > 0) return { text: `↑+${abs}`, worsening: false };
    return { text: '—', worsening: false };
  };

  const changeRDisplay = formatChange(changeR);
  const changeLDisplay = formatChange(changeL);

  const daysUntilExam = nextExamDate
    ? Math.ceil((new Date(nextExamDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <button
      onClick={onTap}
      className="w-full bg-card rounded-lg shadow-card p-4 text-left active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-title">{badge.icon}</span>
          <h3 className="font-semibold text-subtitle text-card-foreground">{profile.name}</h3>
          <span className="text-label text-muted-foreground">{age}歲</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[12px] font-medium">
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isOverdue && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-warning/15 text-warning text-[12px] font-medium">
              <AlertTriangle size={12} /> 逾期
            </span>
          )}
          {hasVisionRiskMeds && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-warning/15 text-warning text-[12px]">
              <Pill size={12} />
            </span>
          )}
          <ChevronRight size={18} className="text-muted-foreground ml-1" />
        </div>
      </div>

      {latestSphere_R !== undefined && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-label text-muted-foreground">右</span>
            <span className="font-semibold text-body text-card-foreground">{formatDiopter(latestSphere_R)}</span>
            {changeRDisplay && (
              <span className={`text-[12px] font-medium ${changeRDisplay.worsening ? 'text-destructive' : 'text-success'}`}>
                {changeRDisplay.text}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-label text-muted-foreground">左</span>
            <span className="font-semibold text-body text-card-foreground">{formatDiopter(latestSphere_L)}</span>
            {changeLDisplay && (
              <span className={`text-[12px] font-medium ${changeLDisplay.worsening ? 'text-destructive' : 'text-success'}`}>
                {changeLDisplay.text}
              </span>
            )}
          </div>
          {latestCylinder_R !== undefined && (
            <div className="flex items-baseline gap-1">
              <span className="text-label text-muted-foreground">散</span>
              <span className="text-body text-card-foreground">{formatDiopter(latestCylinder_R)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-[13px] text-muted-foreground mt-1">
        <span>
          {daysSinceLastVisit !== undefined ? `${daysSinceLastVisit} 天前就診` : '尚無紀錄'}
        </span>
        {daysUntilExam !== null && daysUntilExam > 0 && (
          <span>下次回診：{daysUntilExam} 天後</span>
        )}
      </div>
    </button>
  );
};

export default MemberCard;
