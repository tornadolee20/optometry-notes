import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { mockMembers, getRoleBadge, getAge } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { OphthalmologyRecord, OptometryRecord } from '@/types';
import OphthalmologyForm from './OphthalmologyForm';
import OptometryForm from './OptometryForm';

interface AddVisitWizardProps {
  preselectedMemberId?: string;
  onBack: () => void;
  onComplete: () => void;
}

const AddVisitWizard = ({ preselectedMemberId, onBack, onComplete }: AddVisitWizardProps) => {
  const [step, setStep] = useState(preselectedMemberId ? 1 : 0);
  const [selectedMember, setSelectedMember] = useState(preselectedMemberId || '');
  const [clinicType, setClinicType] = useState<'ophthalmology' | 'optometry' | ''>('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [clinicName, setClinicName] = useState('');
  const [ophData, setOphData] = useState<Partial<OphthalmologyRecord>>({});
  const [optData, setOptData] = useState<Partial<OptometryRecord>>({});
  const [showHardAgeBlock, setShowHardAgeBlock] = useState(false);
  const [showSoftAgeWarning, setShowSoftAgeWarning] = useState(false);
  const [pendingClinicType, setPendingClinicType] = useState<'ophthalmology' | 'optometry' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const member = mockMembers.find(m => m.profile.id === selectedMember);
  const memberAge = member ? getAge(member.profile.birth_date) : 99;

  const hasAcknowledgedWarning = (memberId: string) =>
    localStorage.getItem(`soft_age_ack_${memberId}`) === '1';

  const handleClinicSelect = (type: 'ophthalmology' | 'optometry') => {
    if (type === 'optometry' && memberAge < 6) {
      setShowHardAgeBlock(true);
      return;
    }
    if (type === 'optometry' && memberAge >= 6 && memberAge <= 15 && !hasAcknowledgedWarning(selectedMember)) {
      setPendingClinicType(type);
      setShowSoftAgeWarning(true);
      return;
    }
    setClinicType(type);
    setStep(2);
  };

  const handleSoftWarningConfirm = () => {
    setShowSoftAgeWarning(false);
    if (selectedMember) {
      localStorage.setItem(`soft_age_ack_${selectedMember}`, '1');
    }
    if (pendingClinicType) {
      setClinicType(pendingClinicType);
      setStep(2);
    }
    setPendingClinicType(null);
  };

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => onComplete(), 1500);
  };

  // Build summary items for review
  const getSummaryItems = () => {
    const items: { label: string; value: string }[] = [];
    if (clinicType === 'ophthalmology') {
      const d = ophData;
      if (d.cycloplegic_R_sphere != null || d.cycloplegic_L_sphere != null)
        items.push({ label: '散瞳球面', value: `右 ${d.cycloplegic_R_sphere ?? '—'}D　左 ${d.cycloplegic_L_sphere ?? '—'}D` });
      if (d.cycloplegic_R_cylinder != null || d.cycloplegic_L_cylinder != null)
        items.push({ label: '散瞳散光', value: `右 ${d.cycloplegic_R_cylinder ?? '—'}D　左 ${d.cycloplegic_L_cylinder ?? '—'}D` });
      if (d.axial_length_R != null || d.axial_length_L != null)
        items.push({ label: '眼軸', value: `右 ${d.axial_length_R ?? '—'}mm　左 ${d.axial_length_L ?? '—'}mm` });
      if (d.iop_R != null || d.iop_L != null)
        items.push({ label: '眼壓', value: `右 ${d.iop_R ?? '—'}　左 ${d.iop_L ?? '—'} mmHg` });
      if (d.control_type && d.control_type !== 'none')
        items.push({ label: '近視控制', value: d.control_type });
    } else {
      const d = optData;
      if (d.manifest_R_sphere != null || d.manifest_L_sphere != null)
        items.push({ label: '驗光球面', value: `右 ${d.manifest_R_sphere ?? '—'}D　左 ${d.manifest_L_sphere ?? '—'}D` });
      if (d.manifest_R_cylinder != null || d.manifest_L_cylinder != null)
        items.push({ label: '驗光散光', value: `右 ${d.manifest_R_cylinder ?? '—'}D　左 ${d.manifest_L_cylinder ?? '—'}D` });
      if (d.k1_R != null || d.k1_L != null)
        items.push({ label: '角膜弧度 K1', value: `右 ${d.k1_R ?? '—'}D　左 ${d.k1_L ?? '—'}D` });
    }
    return items;
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-4"
        >
          <Check size={40} className="text-success animate-check-pop" />
        </motion.div>
        <h2 className="text-title font-bold text-foreground">儲存成功！</h2>
      </motion.div>
    );
  }

  const steps = ['選擇類型', '日期與診所', '輸入數值', '確認儲存'];
  const totalSteps = preselectedMemberId ? steps.length : steps.length + 1;
  const displayStep = preselectedMemberId ? step : step;

  const slideVariants = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={step > 0 ? () => setStep(step - 1) : onBack} className="touch-target flex items-center gap-1 text-primary">
            <ArrowLeft size={20} /> {step > 0 ? '上一步' : '返回'}
          </button>
          <span className="text-label text-muted-foreground">步驟 {displayStep + 1} / {totalSteps}</span>
        </div>
        <div className="px-4 pb-3">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${((displayStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-4">
        <AnimatePresence mode="wait">
          {/* Step 0: Select member */}
          {step === 0 && (
            <motion.div key="s0" {...slideVariants}>
              <h2 className="text-title font-bold text-foreground mb-6">選擇家庭成員</h2>
              <div className="space-y-3">
                {mockMembers.map(m => {
                  const badge = getRoleBadge(m.profile.role);
                  return (
                    <button
                      key={m.profile.id}
                      onClick={() => { setSelectedMember(m.profile.id); setStep(1); }}
                      className="w-full bg-card rounded-lg shadow-card p-4 text-left flex items-center gap-3 active:scale-[0.98] transition-transform touch-target"
                    >
                      <span className="text-title">{badge.icon}</span>
                      <div>
                        <div className="font-semibold text-body">{m.profile.name}</div>
                        <div className="text-label text-muted-foreground">{getAge(m.profile.birth_date)}歲 · {badge.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 1: Clinic type */}
          {step === 1 && (
            <motion.div key="s1" {...slideVariants}>
              <h2 className="text-title font-bold text-foreground mb-2">就診類型</h2>
              <p className="text-label text-muted-foreground mb-6">請選擇就診機構</p>
              <div className="space-y-4">
                <button onClick={() => handleClinicSelect('ophthalmology')} className="w-full bg-card rounded-lg shadow-card p-5 text-left active:scale-[0.98] transition-transform touch-target">
                  <div className="text-title mb-1">🏥 眼科診所</div>
                  <div className="text-label text-muted-foreground">散瞳驗光、眼軸測量、眼壓、眼底檢查</div>
                </button>
                <button onClick={() => handleClinicSelect('optometry')} className="w-full bg-card rounded-lg shadow-card p-5 text-left active:scale-[0.98] transition-transform touch-target">
                  <div className="text-title mb-1">👓 驗光所</div>
                  <div className="text-label text-muted-foreground">一般驗光、配鏡處方、角膜弧度、近視控制</div>
                </button>
              </div>
              <AnimatePresence>
                {/* 硬阻擋：6歲以下，法律禁止 */}
                {showHardAgeBlock && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-foreground/40 flex items-end justify-center">
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-card rounded-t-2xl w-full max-w-[430px] p-6 safe-bottom">
                      <div className="text-title font-bold text-destructive mb-3">🚫 法規限制</div>
                      <p className="text-body text-muted-foreground mb-2 leading-relaxed">依《驗光人員法》第 12 條，<strong className="text-foreground">六歲以下兒童</strong>的視力檢查須由眼科醫師親自為之。</p>
                      <p className="text-label text-muted-foreground mb-4 leading-relaxed">請至眼科診所就診，驗光師無法受理此年齡的驗光服務。</p>
                      <button onClick={() => setShowHardAgeBlock(false)} className="w-full py-4 rounded-md bg-destructive text-destructive-foreground font-semibold text-body touch-target active:scale-[0.98] transition-transform">了解，改選眼科</button>
                    </motion.div>
                  </motion.div>
                )}
                {/* 軟提醒：6–15歲首次驗光，需眼科確認非假性近視 */}
                {showSoftAgeWarning && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-foreground/40 flex items-end justify-center">
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-card rounded-t-2xl w-full max-w-[430px] p-6 safe-bottom">
                      <div className="text-title font-bold text-amber-500 mb-3">⚠️ 就診提醒</div>
                      <p className="text-body text-muted-foreground mb-2 leading-relaxed">依《驗光人員法》第 13 條，<strong className="text-foreground">6–15 歲兒童首次驗光</strong>，驗光師須確認當事人已至眼科排除假性近視。</p>
                      <p className="text-label text-muted-foreground mb-4 leading-relaxed">若孩子已有眼科就診紀錄，可繼續記錄驗光所數據。若是首次，建議先至眼科散瞳確認。</p>
                      <div className="flex gap-3">
                        <button onClick={() => { setShowSoftAgeWarning(false); setPendingClinicType(null); }} className="flex-1 py-4 rounded-md border border-border text-body font-semibold touch-target active:scale-[0.98] transition-transform">改選眼科</button>
                        <button onClick={handleSoftWarningConfirm} className="flex-1 py-4 rounded-md bg-primary text-primary-foreground font-semibold text-body touch-target active:scale-[0.98] transition-transform">已有眼科紀錄，繼續</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Step 2: Date + clinic name */}
          {step === 2 && (
            <motion.div key="s2" {...slideVariants}>
              <h2 className="text-title font-bold text-foreground mb-6">就診日期與診所</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-label font-medium text-foreground mb-2 block">就診日期</label>
                  <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="w-full bg-card rounded-md shadow-card px-4 py-4 text-body text-card-foreground touch-target" />
                </div>
                <div>
                  <label className="text-label font-medium text-foreground mb-2 block">診所名稱</label>
                  <input type="text" value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="例：光明眼科" className="w-full bg-card rounded-md shadow-card px-4 py-4 text-body text-card-foreground placeholder:text-muted-foreground touch-target" />
                </div>
              </div>
              <button onClick={() => setStep(3)} disabled={!visitDate} className="mt-8 w-full py-4 rounded-md bg-primary text-primary-foreground font-semibold text-body touch-target active:scale-[0.98] transition-transform disabled:opacity-40">下一步</button>
            </motion.div>
          )}

          {/* Step 3: Enter values */}
          {step === 3 && (
            <motion.div key="s3" {...slideVariants}>
              <h2 className="text-title font-bold text-foreground mb-2">
                {clinicType === 'ophthalmology' ? '🏥 眼科檢查數值' : '👓 驗光所檢查數值'}
              </h2>
              {clinicType === 'ophthalmology' ? (
                <OphthalmologyForm data={ophData} onChange={setOphData} />
              ) : (
                <OptometryForm data={optData} onChange={setOptData} />
              )}
              <button onClick={() => setStep(4)} className="mt-8 mb-8 w-full py-4 rounded-md bg-primary text-primary-foreground font-semibold text-body touch-target active:scale-[0.98] transition-transform">下一步</button>
            </motion.div>
          )}

          {/* Step 4: Review + save */}
          {step === 4 && (
            <motion.div key="s4" {...slideVariants}>
              <h2 className="text-title font-bold text-foreground mb-6">確認紀錄</h2>
              <div className="bg-card rounded-lg shadow-card p-4 space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-label text-muted-foreground">成員</span>
                  <span className="text-body font-medium">{member?.profile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-label text-muted-foreground">類型</span>
                  <span className="text-body font-medium">{clinicType === 'ophthalmology' ? '🏥 眼科' : '👓 驗光所'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-label text-muted-foreground">日期</span>
                  <span className="text-body font-medium">{visitDate}</span>
                </div>
                {clinicName && (
                  <div className="flex justify-between">
                    <span className="text-label text-muted-foreground">診所</span>
                    <span className="text-body font-medium">{clinicName}</span>
                  </div>
                )}
              </div>
              {getSummaryItems().length > 0 && (
                <div className="bg-card rounded-lg shadow-card p-4 space-y-3 mb-6">
                  <div className="text-label font-semibold text-foreground mb-1">檢查數值</div>
                  {getSummaryItems().map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-label text-muted-foreground">{item.label}</span>
                      <span className="text-label font-medium text-card-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {getSummaryItems().length === 0 && (
                <p className="text-label text-muted-foreground text-center mb-4">視力數值可稍後補充</p>
              )}
              <button onClick={handleSave} className="w-full py-4 rounded-md bg-primary text-primary-foreground font-semibold text-body touch-target active:scale-[0.98] transition-transform">確認儲存</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AddVisitWizard;
