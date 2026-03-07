import { HybridInput } from './HybridInput';
import { FusionalReserveInput } from './FusionalReserveInput';
import { VisionAcuitySection } from './VisionAcuitySection';
import { ClipboardList, Calculator, AlertCircle, Focus, Glasses, Activity, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getValueStatus, getClinicalTooltip, getAgeBasedDefaults } from '@/lib/clinicalDefaults';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { CLINICAL_NORMS } from '@/constants/clinicalNorms';


interface InputSectionProps {
  // Basic
  age: number; setAge: (v: number) => void;
  pd: number; setPd: (v: number) => void;
  ciss: number; setCiss: (v: number) => void;
  stereo: number; setStereo: (v: number) => void;
  workDist: number; setWorkDist: (v: number) => void;
  harmonDist: number; setHarmonDist: (v: number) => void;
  // Refraction
  odSph: number; setOdSph: (v: number) => void;
  odCyl: number; setOdCyl: (v: number) => void;
  odAx: number; setOdAx: (v: number) => void;
  osSph: number; setOsSph: (v: number) => void;
  osCyl: number; setOsCyl: (v: number) => void;
  osAx: number; setOsAx: (v: number) => void;
  add: number; setAdd: (v: number) => void;
  // Accommodation
  aaOD: number; setAaOD: (v: number) => void;
  aaOS: number; setAaOS: (v: number) => void;
  nra: number; setNra: (v: number) => void;
  pra: number; setPra: (v: number) => void;
  mem: number; setMem: (v: number) => void;
  flipper: number; setFlipper: (v: number) => void;
  npc: number; setNpc: (v: number) => void;
  // Vergence
  dist: number; setDist: (v: number) => void;
  near: number; setNear: (v: number) => void;
  vert: number; setVert: (v: number) => void;
  // Fusional reserves - Near
  biB: number; setBiB: (v: number) => void;
  biR: number; setBiR: (v: number) => void;
  boB: number; setBoB: (v: number) => void;
  boR: number; setBoR: (v: number) => void;
  // Fusional reserves - Near Blur (optional)
  biBl?: number | null; setBiBl?: (v: number | null) => void;
  boBl?: number | null; setBoBl?: (v: number | null) => void;
  // Fusional reserves - Distance
  distBiB: number; setDistBiB: (v: number) => void;
  distBiR: number; setDistBiR: (v: number) => void;
  distBoB: number; setDistBoB: (v: number) => void;
  distBoR: number; setDistBoR: (v: number) => void;
  // Fusional reserves - Distance Blur (optional)
  distBiBl?: number | null; setDistBiBl?: (v: number | null) => void;
  distBoBl?: number | null; setDistBoBl?: (v: number | null) => void;
  // Default value tracking (optional)
  isDefaultValues?: Record<string, boolean>;
  onFieldModified?: (fieldName: string) => void;
  // Vergence Facility
  vergenceFacility: number; setVergenceFacility: (v: number) => void;
  vergenceFacilityAborted: boolean; setVergenceFacilityAborted: (v: boolean) => void;
  // Gradient AC/A
  useGradient: boolean; setUseGradient: (v: boolean) => void;
  gradPhoria: number | null; setGradPhoria: (v: number | null) => void;
  // CISS
  onOpenCiss: () => void;
  // Literature reference
  onOpenLiterature?: () => void;
  // Visual Acuity (階段 5)
  vaDistanceUaOd: string | null; setVaDistanceUaOd: (v: string | null) => void;
  vaDistanceUaOs: string | null; setVaDistanceUaOs: (v: string | null) => void;
  vaDistanceHcOd: string | null; setVaDistanceHcOd: (v: string | null) => void;
  vaDistanceHcOs: string | null; setVaDistanceHcOs: (v: string | null) => void;
  vaDistanceBcvaOd: string | null; setVaDistanceBcvaOd: (v: string | null) => void;
  vaDistanceBcvaOs: string | null; setVaDistanceBcvaOs: (v: string | null) => void;
  vaNearUaOd: string | null; setVaNearUaOd: (v: string | null) => void;
  vaNearUaOs: string | null; setVaNearUaOs: (v: string | null) => void;
  vaNearHcOd: string | null; setVaNearHcOd: (v: string | null) => void;
  vaNearHcOs: string | null; setVaNearHcOs: (v: string | null) => void;
  vaNearBcvaOd: string | null; setVaNearBcvaOd: (v: string | null) => void;
  vaNearBcvaOs: string | null; setVaNearBcvaOs: (v: string | null) => void;
  vaDistanceTestMeters: number; setVaDistanceTestMeters: (v: number) => void;
  vaNearTestCm: number; setVaNearTestCm: (v: number) => void;
  vaCorrectionType: string | null; setVaCorrectionType: (v: string | null) => void;
}

export const InputSection = (props: InputSectionProps) => {
  const { t, language } = useLanguage();
  const {
    age, setAge, pd, setPd, ciss, setCiss, stereo, setStereo, workDist, setWorkDist,
    harmonDist, setHarmonDist,
    odSph, setOdSph, odCyl, setOdCyl, odAx, setOdAx,
    osSph, setOsSph, osCyl, setOsCyl, osAx, setOsAx, add, setAdd,
    aaOD, setAaOD, aaOS, setAaOS, nra, setNra, pra, setPra, mem, setMem, flipper, setFlipper, npc, setNpc,
    dist, setDist, near, setNear, vert, setVert,
    biB, setBiB, biR, setBiR, boB, setBoB, boR, setBoR,
    biBl, setBiBl, boBl, setBoBl,
    distBiB, setDistBiB, distBiR, setDistBiR, distBoB, setDistBoB, distBoR, setDistBoR,
    distBiBl, setDistBiBl, distBoBl, setDistBoBl,
    vergenceFacility, setVergenceFacility, vergenceFacilityAborted, setVergenceFacilityAborted,
    useGradient, setUseGradient, gradPhoria, setGradPhoria,
    isDefaultValues: externalIsDefaultValues, onFieldModified,
    onOpenCiss, onOpenLiterature,
    // Visual Acuity
    vaDistanceUaOd, setVaDistanceUaOd, vaDistanceUaOs, setVaDistanceUaOs,
    vaDistanceHcOd, setVaDistanceHcOd, vaDistanceHcOs, setVaDistanceHcOs,
    vaDistanceBcvaOd, setVaDistanceBcvaOd, vaDistanceBcvaOs, setVaDistanceBcvaOs,
    vaNearUaOd, setVaNearUaOd, vaNearUaOs, setVaNearUaOs,
    vaNearHcOd, setVaNearHcOd, vaNearHcOs, setVaNearHcOs,
    vaNearBcvaOd, setVaNearBcvaOd, vaNearBcvaOs, setVaNearBcvaOs,
    vaDistanceTestMeters, setVaDistanceTestMeters, vaNearTestCm, setVaNearTestCm,
    vaCorrectionType, setVaCorrectionType,
  } = props;

  // Local default tracking state (used if external not provided)
  const [localIsDefaultValues, setLocalIsDefaultValues] = useState<Record<string, boolean>>({
    distPhoria: true,
    nearPhoria: true,
    npc: true,
    vf: true,
    biBl: true,
    biB: true,
    biR: true,
    boBl: true,
    boB: true,
    boR: true,
    distBiBl: true,
    distBiB: true,
    distBiR: true,
    distBoBl: true,
    distBoB: true,
    distBoR: true,
  });

  const isDefaultValues = externalIsDefaultValues || localIsDefaultValues;

  // Handle field modification - marks field as no longer default
  const handleFieldChange = useCallback((fieldName: string) => {
    if (onFieldModified) {
      onFieldModified(fieldName);
    } else {
      setLocalIsDefaultValues(prev => ({ ...prev, [fieldName]: false }));
    }
  }, [onFieldModified]);

  // Get age-based expected values
  const ageDefaults = useMemo(() => getAgeBasedDefaults(age), [age]);

  // Helper to get clinical info
  const getClinicalInfo = (key: string) => {
    const tooltip = getClinicalTooltip(key, age);
    return {
      range: tooltip?.range,
      source: tooltip?.source
    };
  };

  // Generate summary text for collapsed sections with status indicators
  const getSummary = {
    symptoms: () => {
      const cissStatus = getValueStatus(ciss, 'ciss', age);
      const stereoStatus = getValueStatus(stereo, 'stereo');
      const cissLabel = cissStatus === 'normal' ? '✓' : '⚠';
      const stereoLabel = stereoStatus === 'normal' ? '✓' : '⚠';
      return `CISS ${ciss}${cissLabel}，${t('stereoVision')} ${stereo}"${stereoLabel}，${t('workDistance')} ${workDist}cm`;
    },
    refraction: () => {
      const odStr = `OD ${odSph >= 0 ? '+' : ''}${odSph.toFixed(2)}/${odCyl.toFixed(2)}`;
      const osStr = `OS ${osSph >= 0 ? '+' : ''}${osSph.toFixed(2)}/${osCyl.toFixed(2)}`;
      const addStr = add > 0 ? `，ADD +${add.toFixed(2)}` : '';
      return `${odStr}，${osStr}${addStr}`;
    },
    accommodation: () => {
      const bccStatus = getValueStatus(mem, 'bcc', age);
      const nraStatus = getValueStatus(nra, 'nra');
      const praStatus = getValueStatus(Math.abs(pra), 'pra');
      const flipperStatus = getValueStatus(flipper, 'flipper');
      
      const abnormalCount = [bccStatus, nraStatus, praStatus, flipperStatus].filter(s => s !== 'normal').length;
      const statusLabel = abnormalCount === 0 ? '✓' : `⚠${abnormalCount}`;
      
      return `AA ${aaOD}/${aaOS}D，BCC ${mem > 0 ? '+' : ''}${mem.toFixed(2)}，NRA/PRA ${nra > 0 ? '+' : ''}${nra.toFixed(2)}/${pra.toFixed(2)}，Flip ${flipper} ${statusLabel}`;
    },
    vergence: () => {
      const distStr = dist > 0 ? `${t('eso')} ${dist}Δ` : dist < 0 ? `${t('exo')} ${Math.abs(dist)}Δ` : t('ortho');
      const nearStr = near > 0 ? `${t('eso')} ${near}Δ` : near < 0 ? `${t('exo')} ${Math.abs(near)}Δ` : t('ortho');
      const vfStr = vergenceFacilityAborted ? t('testAborted') : `${vergenceFacility} cpm`;
      
      const npcStatus = getValueStatus(npc, 'npc');
      const vfStatus = getValueStatus(vergenceFacility, 'vf');
      const distStatus = getValueStatus(dist, 'distPhoria');
      const nearStatus = getValueStatus(near, 'nearPhoria');
      
      const abnormalCount = [npcStatus, vfStatus, distStatus, nearStatus].filter(s => s !== 'normal').length;
      const statusLabel = abnormalCount === 0 ? '✓' : `⚠${abnormalCount}`;
      
      return `${t('summaryFar')} ${distStr}，${t('summaryNear')} ${nearStr}，NPC ${npc}cm，VF ${vfStr} ${statusLabel}`;
    }
  };

  const tLocal = (zhTW: string, zhCN: string, en?: string) => {
    if (language === 'en' && en) return en;
    return language === 'zh-TW' ? zhTW : zhCN;
  };

  return (
    <div className="animate-fade-in">
      <Accordion type="multiple" defaultValue={["symptoms", "refraction"]} className="space-y-3">
        
        {/* 1. 症狀與使用習慣模組 */}
        <AccordionItem value="symptoms" className="border border-primary/20 rounded-xl overflow-hidden bg-primary/5">
          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-primary/10 transition-colors min-h-[60px]">
            <div className="flex items-center gap-3 text-left w-full">
              <ClipboardList className="w-6 h-6 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base text-foreground">{t('symptomsAndHabits')}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate leading-relaxed">
                  {getSummary.symptoms()}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3 pt-2">
              <HybridInput 
                label={t('cissQuestionnaireScore')} 
                value={ciss} 
                setter={setCiss} 
                min={0} 
                max={60} 
                step={1} 
                hint={t('cissHintAdult')}
                onExtraClick={onOpenCiss}
                extraIcon={<ClipboardList size={10} />}
                important
                status={getValueStatus(ciss, 'ciss', age)}
                clinicalTooltipKey="ciss"
                age={age}
                showValidationAlert
              />
              <HybridInput 
                label={t('stereoVision')} 
                value={stereo} 
                setter={setStereo} 
                min={0} 
                max={800} 
                step={10} 
                unit='"' 
                hint={t('stereoHint')}
                status={getValueStatus(stereo, 'stereo')}
                clinicalTooltipKey="stereo"
                showValidationAlert
                autoFillHint={stereo === ageDefaults.stereo ? tLocal('年齡預設', '年龄预设', 'Age default') : undefined}
              />
              
              <div className="pt-3 border-t border-border/50">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('workHabits')}</div>
                <div className="space-y-3">
                  <HybridInput label={t('workDistance')} value={workDist} setter={setWorkDist} min={25} max={60} step={5} unit="cm" clinicalTooltipKey="workingDistance" showValidationAlert />
                  <HybridInput 
                    label={t('harmonDistance')} 
                    value={harmonDist} 
                    setter={setHarmonDist} 
                    min={0} 
                    max={50} 
                    step={1} 
                    unit="cm"
                    hint={t('harmonHint')}
                    extraIcon={<Ruler size={10} />}
                  />
                  <div 
                    className={cn(
                      "text-xs text-warning font-bold flex items-center gap-1 px-1 transition-opacity duration-200 min-h-[20px]",
                      harmonDist > 0 && workDist < harmonDist ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    <AlertCircle size={12}/> {t('workDistanceWarning')}{harmonDist}cm)
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. 屈光與鏡片模組 */}
        <AccordionItem value="refraction" className="border border-border rounded-xl overflow-hidden bg-card">
          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-secondary/50 transition-colors min-h-[60px]">
            <div className="flex items-center gap-3 text-left w-full">
              <Glasses className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base text-foreground">{t('refractionAndLens')}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate leading-relaxed">
                  {getSummary.refraction()}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {/* Visual Acuity Section - 放在屈光區塊最上方 */}
            <VisionAcuitySection
              vaDistanceUaOd={vaDistanceUaOd} setVaDistanceUaOd={setVaDistanceUaOd}
              vaDistanceUaOs={vaDistanceUaOs} setVaDistanceUaOs={setVaDistanceUaOs}
              vaDistanceHcOd={vaDistanceHcOd} setVaDistanceHcOd={setVaDistanceHcOd}
              vaDistanceHcOs={vaDistanceHcOs} setVaDistanceHcOs={setVaDistanceHcOs}
              vaDistanceBcvaOd={vaDistanceBcvaOd} setVaDistanceBcvaOd={setVaDistanceBcvaOd}
              vaDistanceBcvaOs={vaDistanceBcvaOs} setVaDistanceBcvaOs={setVaDistanceBcvaOs}
              vaNearUaOd={vaNearUaOd} setVaNearUaOd={setVaNearUaOd}
              vaNearUaOs={vaNearUaOs} setVaNearUaOs={setVaNearUaOs}
              vaNearHcOd={vaNearHcOd} setVaNearHcOd={setVaNearHcOd}
              vaNearHcOs={vaNearHcOs} setVaNearHcOs={setVaNearHcOs}
              vaNearBcvaOd={vaNearBcvaOd} setVaNearBcvaOd={setVaNearBcvaOd}
              vaNearBcvaOs={vaNearBcvaOs} setVaNearBcvaOs={setVaNearBcvaOs}
              vaDistanceTestMeters={vaDistanceTestMeters} setVaDistanceTestMeters={setVaDistanceTestMeters}
              vaNearTestCm={vaNearTestCm} setVaNearTestCm={setVaNearTestCm}
              vaCorrectionType={vaCorrectionType} setVaCorrectionType={setVaCorrectionType}
            />

            <div className="space-y-4 pt-2">
              {/* 基本資料 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <HybridInput label={t('age')} value={age} setter={setAge} min={1} max={120} step={1} unit={t('yearsOld')} />
                <HybridInput label={t('pdDistance')} value={pd} setter={setPd} min={50} max={75} step={1} unit="mm" />
              </div>

              {/* OD */}
              <div className="bg-secondary/50 p-3 rounded-xl border border-border/30">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('odRightEye')}</div>
                <div className="space-y-3">
                  <HybridInput label="Sphere" value={odSph} setter={setOdSph} min={-12} max={6} step={0.25} unit="D" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <HybridInput label="Cylinder" value={odCyl} setter={setOdCyl} min={-6} max={2} step={0.25} unit="D" />
                    <HybridInput label="Axis" value={odAx} setter={setOdAx} min={0} max={180} step={1} unit="°" />
                  </div>
                </div>
              </div>

              {/* OS */}
              <div className="bg-secondary/50 p-3 rounded-xl border border-border/30">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{t('osLeftEye')}</div>
                <div className="space-y-3">
                  <HybridInput label="Sphere" value={osSph} setter={setOsSph} min={-12} max={6} step={0.25} unit="D" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <HybridInput label="Cylinder" value={osCyl} setter={setOsCyl} min={-6} max={2} step={0.25} unit="D" />
                    <HybridInput label="Axis" value={osAx} setter={setOsAx} min={0} max={180} step={1} unit="°" />
                  </div>
                </div>
              </div>

              {/* ADD & Vertical */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className={cn(
                  "transition-all duration-200",
                  age >= 35 ? "opacity-100 max-h-24" : "opacity-0 max-h-0 overflow-hidden pointer-events-none"
                )}>
                  <HybridInput 
                    label={t('addPower')} 
                    value={add} 
                    setter={setAdd} 
                    min={0} 
                    max={3.0} 
                    step={0.25} 
                    unit="D" 
                    important
                    autoFillHint={add === ageDefaults.add && age >= 40 ? tLocal('年齡預設', '年龄预设', 'Age default') : undefined}
                    clinicalRange={tLocal('依年齡: 40-42→0.75D, 43-45→1.00D...', '依年龄: 40-42→0.75D, 43-45→1.00D...', 'By age: 40-42→0.75D, 43-45→1.00D...')}
                    clinicalSource="Borish 2006"
                  />
                </div>
                <HybridInput label={t('verticalPhoria')} value={vert} setter={setVert} min={-4} max={4} step={0.5} unit="Δ" hint={t('verticalPhoriaHint')} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. 調節模組 */}
        <AccordionItem value="accommodation" className="border border-warning/20 rounded-xl overflow-hidden bg-warning/5">
          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-warning/10 transition-colors min-h-[60px]">
            <div className="flex items-center gap-3 text-left w-full">
              <Focus className="w-6 h-6 text-warning flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base text-foreground">{t('accommodationModule')}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate leading-relaxed">
                  {getSummary.accommodation()}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3 pt-2">
              {/* 調節幅度 */}
              <div className="bg-card/60 p-3 rounded-xl border border-border/30">
                <div className="text-[10px] font-bold text-warning uppercase tracking-wider mb-3">{t('accommodationAmplitude')}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <HybridInput 
                    label="AA (OD)" 
                    value={aaOD} 
                    setter={setAaOD} 
                    min={0} 
                    max={15} 
                    step={0.5} 
                    unit="D" 
                    important
                    clinicalTooltipKey="aa"
                    age={age}
                    showValidationAlert
                    autoFillHint={aaOD === ageDefaults.aa ? `Hofstetter: ${ageDefaults.aa.toFixed(1)}D` : undefined}
                  />
                  <HybridInput 
                    label="AA (OS)" 
                    value={aaOS} 
                    setter={setAaOS} 
                    min={0} 
                    max={15} 
                    step={0.5} 
                    unit="D" 
                    important
                    clinicalTooltipKey="aa"
                    age={age}
                    showValidationAlert
                    autoFillHint={aaOS === ageDefaults.aa ? `Hofstetter: ${ageDefaults.aa.toFixed(1)}D` : undefined}
                  />
                </div>
              </div>

              {/* 調節反應 (BCC) */}
              <div className="bg-card/60 p-3 rounded-xl border border-border/30">
                <div className="text-[10px] font-bold text-warning uppercase tracking-wider mb-3">{t('accommodationResponse')}</div>
                <HybridInput 
                  label="BCC" 
                  value={mem} 
                  setter={setMem} 
                  min={-1} 
                  max={3} 
                  step={0.25} 
                  unit="D" 
                  hint={t('bccHint')}
                  status={getValueStatus(mem, 'bcc', age)}
                  clinicalRange="+0.25 ~ +0.75D"
                  clinicalSource="Scheiman & Wick 2014"
                />
              </div>

              {/* 相對調節 */}
              <div className="bg-card/60 p-3 rounded-xl border border-border/30">
                <div className="text-[10px] font-bold text-warning uppercase tracking-wider mb-3">{t('relativeAccommodation')}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <HybridInput 
                    label="NRA" 
                    value={nra} 
                    setter={setNra} 
                    min={0} 
                    max={3.5} 
                    step={0.25} 
                    unit="D" 
                    hint={t('nraHint')}
                    status={getValueStatus(nra, 'nra')}
                    clinicalRange="+1.75 ~ +2.50D"
                    clinicalSource="Scheiman & Wick 2014"
                  />
                  <HybridInput 
                    label="PRA" 
                    value={pra} 
                    setter={setPra} 
                    min={-6} 
                    max={0} 
                    step={0.25} 
                    unit="D" 
                    hint={t('praHint')}
                    status={getValueStatus(Math.abs(pra), 'pra')}
                    clinicalRange="-2.0 ~ -3.0D"
                    clinicalSource="Scheiman & Wick 2014"
                  />
                </div>
              </div>

              {/* 靈敏度 */}
              <div className="bg-card/60 p-3 rounded-xl border border-border/30">
                <div className="text-[10px] font-bold text-warning uppercase tracking-wider mb-3">{t('accommodationFacility')}</div>
                <HybridInput 
                  label="Flipper" 
                  value={flipper} 
                  setter={setFlipper} 
                  min={0} 
                  max={30} 
                  step={1} 
                  unit="cpm" 
                  hint={t('flipperHint')} 
                  important
                  status={getValueStatus(flipper, 'flipper')}
                  clinicalRange="≥ 11 cpm"
                  clinicalSource="Zellers et al., 1984"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. 眼位與融像模組 */}
        <AccordionItem value="vergence" className="border border-success/20 rounded-xl overflow-hidden bg-success/5">
          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-success/10 transition-colors min-h-[60px]">
            <div className="flex items-center gap-3 text-left w-full">
              <Activity className="w-6 h-6 text-success flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base text-foreground">{t('vergenceAndFusion')}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate leading-relaxed">
                  {getSummary.vergence()}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3 pt-2">
              {/* 隱斜位 */}
              <div className="bg-card/60 p-3 rounded-xl border border-border/30">
                <div className="text-[10px] font-bold text-success uppercase tracking-wider mb-3">{t('phoriaSection')}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <HybridInput 
                    label={t('distancePhoria')} 
                    value={dist} 
                    setter={setDist} 
                    min={-15} 
                    max={15} 
                    step={0.25} 
                    unit="Δ"
                    hint={t('phoriaHint')} 
                    important
                    status={getValueStatus(dist, 'distPhoria')}
                    clinicalRange="Ortho ~ 2Δ exo"
                    clinicalSource="Morgan 1944"
                  />
                  <HybridInput 
                    label={t('nearPhoria')} 
                    value={near} 
                    setter={setNear} 
                    min={-20} 
                    max={20} 
                    step={0.25} 
                    unit="Δ"
                    hint={t('phoriaHint')} 
                    important
                    status={getValueStatus(near, 'nearPhoria')}
                    clinicalRange="3 ~ 6Δ exo"
                    clinicalSource="Morgan 1944"
                  />
                </div>
              </div>

              {/* 集合近點 */}
              <div className="bg-card/60 p-3 rounded-xl border border-border/30">
                <div className="text-[10px] font-bold text-success uppercase tracking-wider mb-3">{t('convergenceNearPoint')}</div>
                <HybridInput 
                  label="NPC" 
                  value={npc} 
                  setter={setNpc} 
                  min={1} 
                  max={20} 
                  step={1} 
                  unit="cm" 
                  hint={t('npcHint')} 
                  important
                  status={getValueStatus(npc, 'npc')}
                  clinicalTooltipKey="npc"
                  showValidationAlert
                  autoFillHint={npc === ageDefaults.npc ? tLocal('年齡預設', '年龄预设', 'Age default') : undefined}
                />
              </div>

              {/* 輻輳靈活度 */}
              <div className="bg-card/60 p-3 rounded-xl border border-border/30">
                <div className="text-[10px] font-bold text-success uppercase tracking-wider mb-3 flex items-center gap-2">
                  {t('vergenceFacility')}
                  <div className="group relative">
                    <AlertCircle size={12} className="text-muted-foreground cursor-help" />
                    <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 text-xs bg-popover text-popover-foreground border border-border rounded shadow-lg z-10">
                      {t('vergenceFacilityHint')}
                    </div>
                  </div>
                </div>
                <HybridInput 
                  label="VF (3BI/12BO)" 
                  value={vergenceFacility} 
                  setter={setVergenceFacility} 
                  min={0} 
                  max={30} 
                  step={1} 
                  unit="cpm" 
                  hint={t('vergenceFacilityHintShort')}
                  important
                  status={getValueStatus(vergenceFacility, 'vf')}
                  clinicalTooltipKey="vf"
                  showValidationAlert
                  autoFillHint={vergenceFacility === ageDefaults.vf ? tLocal('年齡預設', '年龄预设', 'Age default') : undefined}
                />
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={vergenceFacilityAborted}
                    onChange={(e) => setVergenceFacilityAborted(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-muted-foreground">{t('testAborted')}</span>
                </label>
              </div>

              {/* Gradient AC/A Toggle */}
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 transition-all">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Calculator size={12}/> {t('gradientACA')}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={useGradient} 
                      onChange={() => setUseGradient(!useGradient)} 
                    />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {tLocal('使用+1.00D近用測量眼位計算梯度AC/A', '使用+1.00D近用测量眼位计算梯度AC/A', 'Measure near phoria with +1.00D to calculate gradient AC/A')}
                </p>
                {useGradient && (
                  <div className="mt-3">
                    <HybridInput 
                      label={tLocal('梯度眼位', '梯度眼位', 'Gradient Phoria')} 
                      value={gradPhoria ?? 0} 
                      setter={(v) => setGradPhoria(v)} 
                      min={-20} 
                      max={20} 
                      step={0.25} 
                      unit="Δ"
                      hint={tLocal('加+1.00D後的近距眼位', '加+1.00D后的近距眼位', 'Near phoria after +1.00D')}
                    />
                  </div>
                )}
              </div>

              {/* 融像儲備 - 使用新的 3 欄布局元件 */}
              <FusionalReserveInput
                biBl={biBl ?? null}
                setBiBl={setBiBl || (() => {})}
                biB={biB}
                setBiB={setBiB}
                biR={biR}
                setBiR={setBiR}
                boBl={boBl ?? null}
                setBoBl={setBoBl || (() => {})}
                boB={boB}
                setBoB={setBoB}
                boR={boR}
                setBoR={setBoR}
                distBiBl={distBiBl ?? null}
                setDistBiBl={setDistBiBl || (() => {})}
                distBiB={distBiB}
                setDistBiB={setDistBiB}
                distBiR={distBiR}
                setDistBiR={setDistBiR}
                distBoBl={distBoBl ?? null}
                setDistBoBl={setDistBoBl || (() => {})}
                distBoB={distBoB}
                setDistBoB={setDistBoB}
                distBoR={distBoR}
                setDistBoR={setDistBoR}
                isDefaultValues={isDefaultValues}
                onFieldChange={handleFieldChange}
                onOpenLiterature={onOpenLiterature}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
