import { useState, useMemo } from 'react';
import { ArrowLeft, AlertTriangle, Maximize2, X } from 'lucide-react';
import { mockMembers, mockVisits, mockCISSScores, mockOptometryRecords, getRoleBadge, getAge } from '@/data/mockData';
import BinocularVisionTab from './BinocularVisionTab';
import { estimateAxialLength } from '@/lib/axialLength';
import { motion, AnimatePresence } from 'framer-motion';


const EstimatedALCard = ({ memberId, birthDate }: { memberId: string; birthDate: string }) => {
  const memberVisits = mockVisits.filter(v => v.profile_id === memberId && v.clinic_type === 'optometry');
  
  // Find optometry records with keratometry data, sorted newest first
  const recordsWithAL = useMemo(() => {
    return memberVisits
      .map(visit => {
        const rec = mockOptometryRecords.find(r => r.clinic_visit_id === visit.id);
        if (!rec) return null;
        const canEstR = rec.k1_R != null && rec.k2_R != null && rec.manifest_R_sphere != null && rec.manifest_R_cylinder != null;
        const canEstL = rec.k1_L != null && rec.k2_L != null && rec.manifest_L_sphere != null && rec.manifest_L_cylinder != null;
        if (!canEstR && !canEstL) return null;
        return {
          visitDate: visit.visit_date,
          estR: canEstR ? estimateAxialLength(rec.k1_R!, rec.k2_R!, rec.manifest_R_sphere!, rec.manifest_R_cylinder!, birthDate) : undefined,
          estL: canEstL ? estimateAxialLength(rec.k1_L!, rec.k2_L!, rec.manifest_L_sphere!, rec.manifest_L_cylinder!, birthDate) : undefined,
          kmR: canEstR ? (rec.k1_R! + rec.k2_R!) / 2 : undefined,
          kmL: canEstL ? (rec.k1_L! + rec.k2_L!) / 2 : undefined,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b!.visitDate).getTime() - new Date(a!.visitDate).getTime()) as {
        visitDate: string; estR?: number; estL?: number; kmR?: number; kmL?: number;
      }[];
  }, [memberId]);

  if (recordsWithAL.length === 0) return null;

  const latest = recordsWithAL[0];
  const prev = recordsWithAL.length > 1 ? recordsWithAL[1] : null;

  // Calculate annual growth if we have two records
  let growthR: { annual: number; warning: boolean } | null = null;
  let growthL: { annual: number; warning: boolean } | null = null;
  if (prev) {
    const daysBetween = (new Date(latest.visitDate).getTime() - new Date(prev.visitDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysBetween >= 300) {
      if (latest.estR != null && prev.estR != null) {
        const annual = ((latest.estR - prev.estR) / daysBetween) * 365;
        growthR = { annual, warning: annual > 0.2 };
      }
      if (latest.estL != null && prev.estL != null) {
        const annual = ((latest.estL - prev.estL) / daysBetween) * 365;
        growthL = { annual, warning: annual > 0.2 };
      }
    }
  }

  return (
    <div className="bg-card rounded-lg shadow-card p-4 mb-4 border-l-4 border-accent">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-label font-semibold text-muted-foreground">估算眼軸（參考）</h3>
        <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">△ 估算值</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-label text-muted-foreground">右眼</span>
          <span className="font-semibold text-body">{latest.estR?.toFixed(2) ?? '—'} mm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-label text-muted-foreground">左眼</span>
          <span className="font-semibold text-body">{latest.estL?.toFixed(2) ?? '—'} mm</span>
        </div>
        {(growthR || growthL) && (
          <div className="pt-2 border-t border-border space-y-1">
            <div className="text-[13px] text-muted-foreground">年增量：</div>
            {growthR && (
              <div className={`flex items-center gap-1 text-[13px] font-medium ${growthR.warning ? 'text-warning' : 'text-success'}`}>
                {growthR.warning && <AlertTriangle size={14} />}
                右 +{growthR.annual.toFixed(2)} mm/年
                {growthR.warning && <span className="text-[11px] text-warning">（建議上限 0.2mm/年）</span>}
              </div>
            )}
            {growthL && (
              <div className={`flex items-center gap-1 text-[13px] font-medium ${growthL.warning ? 'text-warning' : 'text-success'}`}>
                {growthL.warning && <AlertTriangle size={14} />}
                左 +{growthL.annual.toFixed(2)} mm/年
              </div>
            )}
          </div>
        )}
        {(!growthR && !growthL) && (
          <div className="text-[12px] text-muted-foreground pt-1">需兩次以上紀錄（間隔≥300天）才能計算年增量</div>
        )}
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
        △ 估算值，非儀器實測。依 Queirós 2022 公式由角膜弧度與屈光度推算。
      </div>
    </div>
  );
};

interface MemberDetailViewProps {
  memberId: string;
  onBack: () => void;
  onStartCISS: (profileId: string) => void;
}

const MemberDetailView = ({ memberId, onBack, onStartCISS }: MemberDetailViewProps) => {
  const member = mockMembers.find(m => m.profile.id === memberId);
  const visits = mockVisits.filter(v => v.profile_id === memberId);
  const cissScores = mockCISSScores.filter(c => c.profile_id === memberId);
  const [activeTab, setActiveTab] = useState<'records' | 'binocular' | 'health' | 'ciss'>('records');
  const [showPresentation, setShowPresentation] = useState(false);

  if (!member) return null;

  const { profile } = member;
  const badge = getRoleBadge(profile.role);
  const age = getAge(profile.birth_date);

  const tabs = [
    { id: 'records' as const, label: '視力紀錄' },
    { id: 'binocular' as const, label: '雙眼視機能' },
    { id: 'ciss' as const, label: 'CISS問卷' },
    { id: 'health' as const, label: '健康狀況' },
  ];

  // Latest visit data for presentation mode
  const latestVisit = visits.sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())[0];

  const formatDiopter = (val?: number) => val !== undefined ? (val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)) : '—';

  const riskBadge = (level: string) => {
    switch (level) {
      case 'low': return <span className="px-2 py-0.5 rounded-full bg-success/15 text-success text-[12px] font-medium">🟢 低風險</span>;
      case 'moderate': return <span className="px-2 py-0.5 rounded-full bg-warning/15 text-warning text-[12px] font-medium">🟡 中度風險</span>;
      case 'high': return <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-[12px] font-medium">🔴 高風險</span>;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="touch-target flex items-center justify-center">
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-title">{badge.icon}</span>
            <h2 className="font-bold text-title text-foreground">{profile.name}</h2>
            <span className="text-body text-muted-foreground">{age}歲</span>
          </div>
          <button onClick={() => setShowPresentation(true)} className="touch-target flex items-center gap-1 text-primary px-2">
            <Maximize2 size={18} />
            <span className="text-label">展示</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-1 border-b border-border overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-3 text-label font-medium text-center transition-colors relative ${
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="member-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Presentation Mode Overlay */}
      <AnimatePresence>
        {showPresentation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background flex flex-col safe-top safe-bottom"
          >
            {/* Close button */}
            <div className="flex justify-between items-center px-5 py-4">
              <div>
                <div className="text-[22px] font-bold text-foreground">{profile.name}</div>
                <div className="text-[15px] text-muted-foreground">{age}歲・{badge.label}</div>
              </div>
              <button onClick={() => setShowPresentation(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-muted">
                <X size={20} className="text-foreground" />
              </button>
            </div>

            <div className="flex-1 px-5 overflow-y-auto space-y-5">
              {/* 最新度數 */}
              <div className="bg-card rounded-2xl p-5 border-l-4 border-primary shadow-card">
                <div className="text-[13px] font-semibold text-muted-foreground mb-4">
                  最新度數
                  {latestVisit && <span className="ml-2 font-normal text-muted-foreground">（{latestVisit.visit_date}・{latestVisit.clinic_type === 'ophthalmology' ? '眼科' : '驗光所'}）</span>}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[22px] font-bold text-foreground">右眼 OD</span>
                    <span className="text-[28px] font-bold text-primary tabular-nums">
                      {formatDiopter(member.latestSphere_R)}<span className="text-[18px] text-muted-foreground"> D</span>
                    </span>
                  </div>
                  {member.latestCylinder_R !== undefined && member.latestCylinder_R !== 0 && (
                    <div className="flex items-center justify-between pl-4">
                      <span className="text-[16px] text-muted-foreground">散光</span>
                      <span className="text-[20px] font-semibold text-foreground tabular-nums">{formatDiopter(member.latestCylinder_R)} D</span>
                    </div>
                  )}
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-[22px] font-bold text-foreground">左眼 OS</span>
                    <span className="text-[28px] font-bold text-primary tabular-nums">
                      {formatDiopter(member.latestSphere_L)}<span className="text-[18px] text-muted-foreground"> D</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 上次 vs 本次比較 */}
              {member.prevSphere_R !== undefined && member.latestSphere_R !== undefined && (
                <div className="bg-card rounded-2xl p-5 shadow-card">
                  <div className="text-[13px] font-semibold text-muted-foreground mb-3">度數變化（右眼）</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[18px] text-foreground">上次 → 本次</span>
                    <span className={`text-[24px] font-bold tabular-nums ${
                      (member.latestSphere_R - member.prevSphere_R) < 0 ? 'text-destructive' : 'text-success'
                    }`}>
                      {(member.latestSphere_R - member.prevSphere_R) < 0 ? '' : '+'}{(member.latestSphere_R - member.prevSphere_R).toFixed(2)} D
                    </span>
                  </div>
                </div>
              )}

              {/* 上次回診日 */}
              {member.daysSinceLastVisit !== undefined && (
                <div className="bg-card rounded-2xl p-5 shadow-card">
                  <div className="text-[13px] font-semibold text-muted-foreground mb-2">距上次回診</div>
                  <div className="text-[32px] font-bold text-foreground tabular-nums">
                    {member.daysSinceLastVisit} <span className="text-[20px] text-muted-foreground">天</span>
                  </div>
                </div>
              )}

              {/* 用藥提醒 */}
              {member.hasVisionRiskMeds && (
                <div className="bg-destructive/10 rounded-2xl p-5 border border-destructive/30">
                  <div className="text-[16px] font-bold text-destructive">⚠️ 用藥影響視力</div>
                  <div className="text-[14px] text-muted-foreground mt-1">此成員有使用可能影響視力的藥物，請告知驗光師。</div>
                </div>
              )}
            </div>

            {/* Bottom hint */}
            <div className="px-5 py-4 text-center text-[12px] text-muted-foreground">
              展示給醫師或驗光師看・點右上 ✕ 關閉
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab content */}
      <div className="px-4 py-4 pb-28">
        <AnimatePresence mode="wait">
          {activeTab === 'records' && (
            <motion.div key="records" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Latest record card */}
              <div className="bg-card rounded-lg shadow-card p-4 mb-4 border-l-4 border-primary">
                <h3 className="text-label font-semibold text-muted-foreground mb-3">最新紀錄</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-label text-muted-foreground">右眼</span>
                    <span className="font-semibold text-body">{formatDiopter(member.latestSphere_R)}D　散光：{formatDiopter(member.latestCylinder_R)}D</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-label text-muted-foreground">左眼</span>
                    <span className="font-semibold text-body">{formatDiopter(member.latestSphere_L)}D</span>
                  </div>
                  {member.prevSphere_R !== undefined && (
                    <div className="pt-1 border-t border-border">
                      <span className="text-[13px] text-muted-foreground">較上次：</span>
                      {member.latestSphere_R !== undefined && member.prevSphere_R !== undefined && (
                        <span className={`text-[13px] font-medium ${
                          (member.latestSphere_R - member.prevSphere_R) < 0 ? 'text-destructive' : 'text-success'
                        }`}>
                          右 {((member.latestSphere_R - member.prevSphere_R) < 0 ? '' : '+')}{(member.latestSphere_R - member.prevSphere_R).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Estimated Axial Length Card */}
              <EstimatedALCard memberId={memberId} birthDate={profile.birth_date} />

              {/* Visit timeline */}
              <h3 className="text-label font-semibold text-muted-foreground mb-3">就診紀錄</h3>
              <div className="space-y-2">
                {visits.map(visit => (
                  <div key={visit.id} className="bg-card rounded-lg shadow-card p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div>
                        <div className="text-body font-medium text-card-foreground">{visit.visit_date}</div>
                        <div className="text-[13px] text-muted-foreground">{visit.clinic_name}</div>
                      </div>
                    </div>
                    <span className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${
                      visit.clinic_type === 'ophthalmology'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-accent text-accent-foreground'
                    }`}>
                      {visit.clinic_type === 'ophthalmology' ? '眼科' : '驗光所'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'binocular' && (
            <BinocularVisionTab memberId={memberId} />
          )}

          {activeTab === 'health' && (
            <motion.div key="health" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-card rounded-lg shadow-card p-4 mb-4">
                <h3 className="text-label font-semibold text-muted-foreground mb-3">慢性病</h3>
                <p className="text-body text-muted-foreground">尚未記錄慢性病</p>
              </div>
              <div className="bg-card rounded-lg shadow-card p-4">
                <h3 className="text-label font-semibold text-muted-foreground mb-3">用藥紀錄</h3>
                <p className="text-body text-muted-foreground">尚未記錄用藥</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'ciss' && (
            <motion.div key="ciss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {cissScores.length > 0 && (
                <div className="bg-card rounded-lg shadow-card p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-label font-semibold text-muted-foreground">最新評估</h3>
                    {riskBadge(cissScores[0].risk_level)}
                  </div>
                  <div className="text-heading font-bold text-card-foreground">{cissScores[0].total_score} 分</div>
                  <div className="text-[13px] text-muted-foreground mt-1">{cissScores[0].assessment_date}</div>
                </div>
              )}

              {cissScores.length > 1 && (
                <div className="space-y-2 mb-4">
                  <h3 className="text-label font-semibold text-muted-foreground">歷史紀錄</h3>
                  {cissScores.slice(1).map(score => (
                    <div key={score.id} className="bg-card rounded-lg shadow-card p-3 flex items-center justify-between">
                      <span className="text-body">{score.assessment_date}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{score.total_score} 分</span>
                        {riskBadge(score.risk_level)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => onStartCISS(memberId)}
                className="w-full py-4 rounded-md bg-primary text-primary-foreground font-semibold text-body touch-target active:scale-[0.98] transition-transform"
              >
                開始新的問卷
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MemberDetailView;
