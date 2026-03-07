import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchPatientHistory } from '@/lib/examRecordService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { InputSection } from '@/components/InputSection';
import { ResultsSection } from '@/components/ResultsSection';
import { ReportView } from '@/components/ReportView';
import { CissQuestionnaireModal } from '@/components/CissQuestionnaireModal';
import { LiteratureReferenceModal } from '@/components/LiteratureReferenceModal';
import { ViewModeSelector, ViewMode } from '@/components/ViewModeSelector';
import { LanguageToggle } from '@/components/LanguageToggle';
import { PatientInfoInput } from '@/components/PatientInfoInput';
import { MedicalHistorySection, MedicalHistoryData, EMPTY_MEDICAL_HISTORY } from '@/components/MedicalHistorySection';
import { SaveReportDialog } from '@/components/SaveReportDialog';
import { DevTestPanel } from '@/components/DevTestPanel';
import { DataQualityPanel } from '@/components/DataQualityPanel';
import { calculateLogic } from '@/lib/calculateLogic';
import { classifyBinocularStatus } from '@/lib/binocularRules';
import { runAllValidations, calculateDataQualityScore, ExamDataForValidation } from '@/lib/dataValidation';
import { MockCaseData } from '@/lib/mockCases';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, ArrowLeft, Brain, Printer, Share2, CheckCircle, AlertCircle, Clock, Save, FolderOpen, LogOut, Shield, Database, BarChart3, Users, Megaphone, UserPlus, BookOpen, User, Pencil, Settings, CreditCard } from 'lucide-react';
import { BackToTop } from '@/components/ui/BackToTop';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { getAgeBasedDefaults, getDefaultResetValues, generateNewPatientCode } from '@/lib/clinicalDefaults';
import { toast } from '@/hooks/use-toast';

const BinocularVisionApp = () => {
  const { t, language } = useLanguage();
  const { profile, signOut, isAdmin, isOwner, hasPaymentAccess, hasSubscriptionAccess, userRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [reportMode, setReportMode] = useState(false);
  const [showCissModal, setShowCissModal] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('basic');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 預設值追蹤狀態
  const [isDefaultValues, setIsDefaultValues] = useState<Record<string, boolean>>({
    distPhoria: true,
    nearPhoria: true,
    npc: true,
    vf: true,
    biB: true,
    biR: true,
    boB: true,
    boR: true,
    distBiB: true,
    distBiR: true,
    distBoB: true,
    distBoR: true,
  });

  // 當欄位被修改時標記為非預設值
  const handleFieldModified = useCallback((fieldName: string) => {
    setIsDefaultValues(prev => ({
      ...prev,
      [fieldName]: false,
    }));
  }, []);

  // Patient info state (persisted)
  const [patientCode, setPatientCode] = usePersistedState('bv_patientCode', '');
  const [patientGender, setPatientGender] = usePersistedState<'male' | 'female' | 'other'>('bv_patientGender', 'male');
  // Local only - not saved to DB
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');

  // State - Basic (persisted)
  const [age, setAge] = usePersistedState('bv_age', 36);
  const [pd, setPd] = usePersistedState('bv_pd', 64);
  const [workDist, setWorkDist] = usePersistedState('bv_workDist', 40);
  const [harmonDist, setHarmonDist] = usePersistedState('bv_harmonDist', 40);
  const [ciss, setCiss] = usePersistedState('bv_ciss', 12);
  const [stereo, setStereo] = usePersistedState('bv_stereo', 40);

  // State - Refraction (persisted)
  const [odSph, setOdSph] = usePersistedState('bv_odSph', -2.0);
  const [odCyl, setOdCyl] = usePersistedState('bv_odCyl', -0.5);
  const [odAx, setOdAx] = usePersistedState('bv_odAx', 180);
  const [osSph, setOsSph] = usePersistedState('bv_osSph', -2.0);
  const [osCyl, setOsCyl] = usePersistedState('bv_osCyl', -0.5);
  const [osAx, setOsAx] = usePersistedState('bv_osAx', 180);
  const [add, setAdd] = usePersistedState('bv_add', 0);

  // State - Accommodation (persisted)
  const [aaOD, setAaOD] = usePersistedState('bv_aaOD', 4.0);
  const [aaOS, setAaOS] = usePersistedState('bv_aaOS', 4.0);
  const [nra, setNra] = usePersistedState('bv_nra', 2.0);
  const [pra, setPra] = usePersistedState('bv_pra', -2.5);
  const [mem, setMem] = usePersistedState('bv_mem', 0.5);
  const [flipper, setFlipper] = usePersistedState('bv_flipper', 10);
  const [npc, setNpc] = usePersistedState('bv_npc', 6);

  // State - Vergence Facility (persisted)
  const [vergenceFacility, setVergenceFacility] = usePersistedState('bv_vergenceFacility', 15);
  const [vergenceFacilityAborted, setVergenceFacilityAborted] = usePersistedState('bv_vergenceFacilityAborted', false);

  // State - Vergence (persisted)
  const [dist, setDist] = usePersistedState('bv_dist', 0);
  const [near, setNear] = usePersistedState('bv_near', -6);
  const [vert, setVert] = usePersistedState('bv_vert', 0);
  const [useGradient, setUseGradient] = usePersistedState('bv_useGradient', false);
  const [gradPhoria, setGradPhoria] = usePersistedState<number | null>('bv_gradPhoria', null);
  const [biB, setBiB] = usePersistedState('bv_biB', 12);
  const [biR, setBiR] = usePersistedState('bv_biR', 12);
  const [boB, setBoB] = usePersistedState('bv_boB', 20);
  const [boR, setBoR] = usePersistedState('bv_boR', 15);
  
  // 模糊點 (Blur points)
  const [biBl, setBiBl] = usePersistedState<number | null>('bv_biBl', null);
  const [boBl, setBoBl] = usePersistedState<number | null>('bv_boBl', 17);

  // ======== Visual Acuity States (階段 6) ========
  // Distance Vision
  const [vaDistanceUaOd, setVaDistanceUaOd] = usePersistedState<string | null>('bv_va_dist_ua_od', null);
  const [vaDistanceUaOs, setVaDistanceUaOs] = usePersistedState<string | null>('bv_va_dist_ua_os', null);
  const [vaDistanceHcOd, setVaDistanceHcOd] = usePersistedState<string | null>('bv_va_dist_hc_od', null);
  const [vaDistanceHcOs, setVaDistanceHcOs] = usePersistedState<string | null>('bv_va_dist_hc_os', null);
  const [vaDistanceBcvaOd, setVaDistanceBcvaOd] = usePersistedState<string | null>('bv_va_dist_bcva_od', null);
  const [vaDistanceBcvaOs, setVaDistanceBcvaOs] = usePersistedState<string | null>('bv_va_dist_bcva_os', null);
  // Near Vision
  const [vaNearUaOd, setVaNearUaOd] = usePersistedState<string | null>('bv_va_near_ua_od', null);
  const [vaNearUaOs, setVaNearUaOs] = usePersistedState<string | null>('bv_va_near_ua_os', null);
  const [vaNearHcOd, setVaNearHcOd] = usePersistedState<string | null>('bv_va_near_hc_od', null);
  const [vaNearHcOs, setVaNearHcOs] = usePersistedState<string | null>('bv_va_near_hc_os', null);
  const [vaNearBcvaOd, setVaNearBcvaOd] = usePersistedState<string | null>('bv_va_near_bcva_od', null);
  const [vaNearBcvaOs, setVaNearBcvaOs] = usePersistedState<string | null>('bv_va_near_bcva_os', null);
  // VA Metadata
  const [vaDistanceTestMeters, setVaDistanceTestMeters] = usePersistedState<number>('bv_va_dist_test_m', 6.0);
  const [vaNearTestCm, setVaNearTestCm] = usePersistedState<number>('bv_va_near_test_cm', 40);
  const [vaCorrectionType, setVaCorrectionType] = usePersistedState<string | null>('bv_va_correction_type', null);
  
  // 遠距融像儲備
  const [distBiB, setDistBiB] = usePersistedState('bv_distBiB', 7);
  const [distBiR, setDistBiR] = usePersistedState('bv_distBiR', 4);
  const [distBoB, setDistBoB] = usePersistedState('bv_distBoB', 20);
  const [distBoR, setDistBoR] = usePersistedState('bv_distBoR', 10);
  
  // 遠距模糊點
  const [distBiBl, setDistBiBl] = usePersistedState<number | null>('bv_distBiBl', null);
  const [distBoBl, setDistBoBl] = usePersistedState<number | null>('bv_distBoBl', null);
  
  // ======== 病理史 (Medical History) ========
  const [medicalHistory, setMedicalHistory] = usePersistedState<MedicalHistoryData>('bv_medical_history', EMPTY_MEDICAL_HISTORY);
  
  // Literature modal
  const [showLiteratureModal, setShowLiteratureModal] = useState(false);

  // Load patient data from URL parameter
  useEffect(() => {
    const patientCodeParam = searchParams.get('patient_code');
    if (!patientCodeParam) return;

    const loadPatientData = async () => {
      try {
        const records = await fetchPatientHistory(patientCodeParam);
        if (records.length === 0) {
          toast({
            title: language === 'zh-TW' ? '找不到記錄' : '找不到记录',
            description: language === 'zh-TW' ? '該顧客編號沒有檢查記錄' : '该客户编号没有检查记录',
            variant: 'destructive',
          });
          return;
        }

        // Load the most recent record
        const latestRecord = records[0];
        const examData = latestRecord.exam_data || {};

        // Set patient info
        setPatientCode(latestRecord.patient_code);
        setPatientGender(latestRecord.gender);
        setAge(latestRecord.age);

        // Set exam data fields
        if (examData.pd !== undefined) setPd(examData.pd);
        if (examData.workDist !== undefined) setWorkDist(examData.workDist);
        if (examData.harmonDist !== undefined) setHarmonDist(examData.harmonDist);
        if (examData.cissScore !== undefined) setCiss(examData.cissScore);
        if (examData.stereo !== undefined) setStereo(examData.stereo);

        // Refraction
        if (examData.odSph !== undefined) setOdSph(examData.odSph);
        if (examData.odCyl !== undefined) setOdCyl(examData.odCyl);
        if (examData.odAx !== undefined) setOdAx(examData.odAx);
        if (examData.osSph !== undefined) setOsSph(examData.osSph);
        if (examData.osCyl !== undefined) setOsCyl(examData.osCyl);
        if (examData.osAx !== undefined) setOsAx(examData.osAx);
        if (examData.add !== undefined) setAdd(examData.add);

        // Accommodation
        if (examData.aaOD !== undefined) setAaOD(examData.aaOD);
        if (examData.aaOS !== undefined) setAaOS(examData.aaOS);
        if (examData.nra !== undefined) setNra(examData.nra);
        if (examData.pra !== undefined) setPra(examData.pra);
        if (examData.mem !== undefined) setMem(examData.mem);
        if (examData.flipper !== undefined) setFlipper(examData.flipper);
        if (examData.npc !== undefined) setNpc(examData.npc);

        // Vergence Facility
        if (examData.vergenceFacilityCpm !== undefined) setVergenceFacility(examData.vergenceFacilityCpm);
        if (examData.vergenceFacilityAborted !== undefined) setVergenceFacilityAborted(examData.vergenceFacilityAborted);

        // Vergence
        if (examData.distPhoria !== undefined) setDist(examData.distPhoria);
        if (examData.nearPhoria !== undefined) setNear(examData.nearPhoria);
        if (examData.vert !== undefined) setVert(examData.vert);
        if (examData.useGradient !== undefined) setUseGradient(examData.useGradient);
        if (examData.gradPhoria !== undefined) setGradPhoria(examData.gradPhoria);
        if (examData.biBreak !== undefined) setBiB(examData.biBreak);
        if (examData.biR !== undefined) setBiR(examData.biR);
        if (examData.boBreak !== undefined) setBoB(examData.boBreak);
        if (examData.boR !== undefined) setBoR(examData.boR);

        // Distance fusion reserves
        if (examData.distBiB !== undefined) setDistBiB(examData.distBiB);
        if (examData.distBoB !== undefined) setDistBoB(examData.distBoB);

        toast({
          title: language === 'zh-TW' ? '已載入檢查記錄' : '已加载检查记录',
          description: `${language === 'zh-TW' ? '顧客編號' : '客户编号'}: ${latestRecord.patient_code}`,
        });
      } catch (error) {
        console.error('Error loading patient data:', error);
        toast({
          title: language === 'zh-TW' ? '載入失敗' : '加载失败',
          description: language === 'zh-TW' ? '無法載入檢查記錄' : '无法加载检查记录',
          variant: 'destructive',
        });
      }
    };

    loadPatientData();
  }, [searchParams, language]);

  // Age-based auto-defaults
  const applyAgeDefaults = useCallback((newAge: number, forceApply: boolean = false) => {
    const defaults = getAgeBasedDefaults(newAge);
    
    // Only auto-fill if values are 0 or on force (new customer)
    if (forceApply || aaOD === 0) setAaOD(defaults.aa);
    if (forceApply || aaOS === 0) setAaOS(defaults.aa);
    if (forceApply || (add === 0 && newAge >= 40)) setAdd(defaults.add);
    if (forceApply || npc === 5) setNpc(defaults.npc);
    if (forceApply || vergenceFacility === 15) setVergenceFacility(defaults.vf);
    if (forceApply || stereo === 70) setStereo(defaults.stereo);
  }, [aaOD, aaOS, add, npc, vergenceFacility, stereo, setAaOD, setAaOS, setAdd, setNpc, setVergenceFacility, setStereo]);

  // Apply age defaults when age changes (skip initial load)
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    applyAgeDefaults(age, false);
  }, [age]);

  // New customer reset function
  const handleNewCustomer = useCallback(() => {
    const defaults = getDefaultResetValues();
    const ageDefaults = getAgeBasedDefaults(defaults.age);
    
    // Reset patient info
    setPatientCode(generateNewPatientCode());
    setPatientGender(defaults.patientGender);
    setPatientName('');
    setPatientPhone('');
    
    // Reset basic
    setAge(defaults.age);
    setPd(defaults.pd);
    setCiss(defaults.ciss);
    setStereo(ageDefaults.stereo);
    setWorkDist(defaults.workDist);
    setHarmonDist(defaults.harmonDist);
    
    // Reset refraction
    setOdSph(defaults.odSph);
    setOdCyl(defaults.odCyl);
    setOdAx(defaults.odAx);
    setOsSph(defaults.osSph);
    setOsCyl(defaults.osCyl);
    setOsAx(defaults.osAx);
    setAdd(ageDefaults.add);
    
    // Reset accommodation
    setAaOD(ageDefaults.aa);
    setAaOS(ageDefaults.aa);
    setNra(defaults.nra);
    setPra(defaults.pra);
    setMem(defaults.mem);
    setFlipper(defaults.flipper);
    setNpc(ageDefaults.npc);
    
    // Reset vergence
    setDist(defaults.dist);
    setNear(defaults.near);
    setVert(defaults.vert);
    setVergenceFacility(ageDefaults.vf);
    setVergenceFacilityAborted(defaults.vergenceFacilityAborted);
    
    // Reset fusion reserves
    setBiB(defaults.biB);
    setBiR(defaults.biR);
    setBoB(defaults.boB);
    setBoR(defaults.boR);
    setBiBl(null);
    setBoBl(17); // Default BO blur per Wajuihian
    setDistBiB(defaults.distBiB);
    setDistBiR(defaults.distBiR);
    setDistBoB(defaults.distBoB);
    setDistBoR(defaults.distBoR);
    setDistBiBl(null);
    setDistBoBl(null);
    
    // Reset gradient
    setUseGradient(defaults.useGradient);
    setGradPhoria(defaults.gradPhoria);
    
    // Reset Visual Acuity fields
    setVaDistanceUaOd(null);
    setVaDistanceUaOs(null);
    setVaDistanceHcOd(null);
    setVaDistanceHcOs(null);
    setVaDistanceBcvaOd(null);
    setVaDistanceBcvaOs(null);
    setVaNearUaOd(null);
    setVaNearUaOs(null);
    setVaNearHcOd(null);
    setVaNearHcOs(null);
    setVaNearBcvaOd(null);
    setVaNearBcvaOs(null);
    setVaDistanceTestMeters(6.0);
    setVaNearTestCm(40);
    setVaCorrectionType(null);
    
    // Reset default value tracking
    setIsDefaultValues({
      distPhoria: true,
      nearPhoria: true,
      npc: true,
      vf: true,
      biB: true,
      biR: true,
      boB: true,
      boR: true,
      distBiB: true,
      distBiR: true,
      distBoB: true,
      distBoR: true,
    });
    
    toast({
      title: language === 'en' ? 'New Customer Added' : language === 'zh-TW' ? '已新增客戶' : '已新增客户',
      description: language === 'en' ? 'All fields have been reset to default values' : language === 'zh-TW' ? '所有欄位已重置為預設值' : '所有字段已重置为默认值',
    });
  }, [language, setPatientCode, setPatientGender, setAge, setPd, setCiss, setStereo, setWorkDist, setHarmonDist,
      setOdSph, setOdCyl, setOdAx, setOsSph, setOsCyl, setOsAx, setAdd, setAaOD, setAaOS, setNra, setPra, setMem,
      setFlipper, setNpc, setDist, setNear, setVert, setVergenceFacility, setVergenceFacilityAborted,
      setBiB, setBiR, setBoB, setBoR, setBiBl, setBoBl, setDistBiB, setDistBiR, setDistBoB, setDistBoR, 
      setDistBiBl, setDistBoBl, setUseGradient, setGradPhoria,
      setVaDistanceUaOd, setVaDistanceUaOs, setVaDistanceHcOd, setVaDistanceHcOs,
      setVaDistanceBcvaOd, setVaDistanceBcvaOs, setVaNearUaOd, setVaNearUaOs,
      setVaNearHcOd, setVaNearHcOs, setVaNearBcvaOd, setVaNearBcvaOs,
      setVaDistanceTestMeters, setVaNearTestCm, setVaCorrectionType]);

  // Load test case data handler
  const handleLoadTestCase = useCallback((data: MockCaseData) => {
    setAge(data.age);
    setPatientGender(data.gender);
    setPd(data.pd);
    setCiss(data.ciss);
    setStereo(data.stereo);
    setNpc(data.npc);
    setNra(data.nra);
    setPra(data.pra);
    setMem(data.mem);
    setAaOD(data.aaOD);
    setAaOS(data.aaOS);
    setFlipper(data.flipper);
    setDist(data.dist_phoria);
    setNear(data.near_phoria);
    setBiB(data.bi_break);
    setBoB(data.bo_break);
    setDistBiB(data.dist_bi_break);
    setDistBoB(data.dist_bo_break);
    setVergenceFacility(data.vergence_facility);

    toast({
      title: '測試資料已載入',
      description: `已載入 ${data.age} 歲 ${data.gender === 'male' ? '男性' : data.gender === 'female' ? '女性' : '其他'} 個案`,
    });
  }, [setAge, setPatientGender, setPd, setCiss, setStereo, setNpc, setNra, setPra, setMem,
      setAaOD, setAaOS, setFlipper, setDist, setNear, setBiB, setBoB, setDistBiB, setDistBoB, setVergenceFacility]);

  // Calculate
  const result = calculateLogic({
    age,
    pd,
    workDist,
    harmonDist,
    cissScore: ciss,
    stereo,
    odSph,
    odCyl,
    odAxis: odAx,
    osSph,
    osCyl,
    osAxis: osAx,
    add,
    aaOD,
    aaOS,
    nra,
    pra,
    mem,
    flipper,
    npc,
    distPhoria: dist,
    nearPhoria: near,
    vertPhoria: vert,
    nearPhoriaGradient: useGradient ? gradPhoria : null,
    biBreak: biB,
    biRec: biR,
    boBreak: boB,
    boRec: boR,
    vergenceFacilityCpm: vergenceFacility,
    vergenceFacilityAborted,
  });

  // Prepare exam data for saving (field names match binocularRules expectations)
  const examData = {
    pd, workDist, harmonDist, cissScore: ciss, stereo,
    odSph, odCyl, odAx, osSph, osCyl, osAx, add,
    aaOD, aaOS, nra, pra, mem, flipper, npc,
    vergenceFacilityCpm: vergenceFacility, vergenceFacilityAborted,
    distPhoria: dist, nearPhoria: near, vert, useGradient, gradPhoria,
    biBreak: biB, biR, boBreak: boB, boR, distBiB, distBoB,
  };
  
  // 使用 binocularRules 計算診斷分類
  const binocularClassification = classifyBinocularStatus(examData, age);

  // 資料品質驗證
  const validationData: ExamDataForValidation = useMemo(() => ({
    age,
    npc,
    ciss,
    distPhoria: dist,
    nearPhoria: near,
    distBiBreak: distBiB,
    distBiRecovery: distBiR,
    distBoBreak: distBoB,
    distBoRecovery: distBoR,
    nearBiBreak: biB,
    nearBiRecovery: biR,
    nearBoBreak: boB,
    nearBoRecovery: boR,
    calculatedACA: result.aca.val,
    gradientACA: useGradient && gradPhoria !== null ? undefined : undefined, // 如需 gradient ACA 可在此計算
    pd,
    workDist,
    amp: Math.min(aaOD, aaOS),
    flipper: String(flipper),
    nra,
    pra,
    stereo,
  }), [age, npc, ciss, dist, near, distBiB, distBiR, distBoB, distBoR, biB, biR, boB, boR, result.aca.val, pd, workDist, aaOD, aaOS, flipper, nra, pra, stereo, useGradient, gradPhoria]);

  const validationResults = useMemo(() => runAllValidations(validationData), [validationData]);
  const qualityScore = useMemo(() => calculateDataQualityScore(validationData), [validationData]);

  const handlePrint = () => window.print();
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '雙眼視覺分析報告',
          text: `視覺健康分數: ${result.healthScore}`,
          url: window.location.href
        });
      } catch {}
    } else {
      alert('請使用截圖功能');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const tLocal = (zhTW: string, zhCN: string, en?: string) => language === 'en' ? (en || zhTW) : language === 'zh-TW' ? zhTW : zhCN;

  // Clinic name state (persisted)
  const [clinicName, setClinicName] = usePersistedState('bv_clinicName', profile?.clinic_name || (language === 'en' ? 'Own Glasses' : '自己的眼鏡'));
  const [isEditingClinicName, setIsEditingClinicName] = useState(false);
  
  // Optometrist name state (persisted)
  const [optometristName, setOptometristName] = usePersistedState('bv_optometristName', profile?.optometrist_name || '');
  const [isEditingOptometrist, setIsEditingOptometrist] = useState(false);

  // Editable Clinic Name Component
  const ClinicNameEditor = () => (
    <div className="flex items-center gap-1">
      {isEditingClinicName ? (
        <Input
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          onBlur={() => setIsEditingClinicName(false)}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditingClinicName(false)}
          autoFocus
          className="h-7 text-lg font-bold bg-transparent border-b border-primary px-1 py-0 rounded-none focus-visible:ring-0 w-auto max-w-[200px]"
        />
      ) : (
        <h1 
          onClick={() => setIsEditingClinicName(true)}
          className="text-lg font-bold text-foreground leading-tight cursor-pointer hover:text-primary transition-colors flex items-center gap-1 group"
        >
          {clinicName || t('appTitle')}
          <Pencil size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
        </h1>
      )}
    </div>
  );

  // Optometrist Name Button Component
  const OptometristNameButton = () => (
    <>
      {isEditingOptometrist ? (
        <div className="flex items-center gap-1 bg-secondary rounded-full px-2 py-1">
          <User size={12} className="text-muted-foreground" />
          <Input
            value={optometristName}
            onChange={(e) => setOptometristName(e.target.value)}
            onBlur={() => setIsEditingOptometrist(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingOptometrist(false)}
            placeholder={tLocal('輸入姓名', '输入姓名')}
            autoFocus
            className="h-6 text-xs bg-transparent border-none px-1 py-0 focus-visible:ring-0 w-[80px]"
          />
        </div>
      ) : (
        <button
          onClick={() => setIsEditingOptometrist(true)}
          className="px-2 py-1 sm:px-3 sm:py-1.5 bg-secondary hover:bg-secondary/80 rounded-full text-xs flex items-center gap-1 transition-colors"
        >
          <User size={12} className="text-muted-foreground" />
          <span className="text-foreground font-medium">
            {optometristName || tLocal('未設定', '未设定')}
          </span>
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-20 print:bg-white print:pb-0">
      {/* CISS Modal */}
      {showCissModal && (
        <CissQuestionnaireModal
          age={age}
          onClose={() => setShowCissModal(false)}
          onSave={(score) => {
            setCiss(score);
            setShowCissModal(false);
          }}
        />
      )}

      {/* Literature Reference Modal */}
      <LiteratureReferenceModal
        open={showLiteratureModal}
        onOpenChange={setShowLiteratureModal}
      />

      {/* Save Report Dialog */}
      <SaveReportDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        patientCode={patientCode}
        patientAge={age}
        patientGender={patientGender}
        examData={examData}
        healthScore={result.healthScore}
        diagnosticClassification={binocularClassification.primary + (binocularClassification.secondary ? `+${binocularClassification.secondary}` : '')}
        reportRef={reportRef}
        patientName={patientName}
        patientPhone={patientPhone}
        isDefaultValues={isDefaultValues}
        // Visual Acuity props
        vaDistanceUaOd={vaDistanceUaOd}
        vaDistanceUaOs={vaDistanceUaOs}
        vaDistanceHcOd={vaDistanceHcOd}
        vaDistanceHcOs={vaDistanceHcOs}
        vaDistanceBcvaOd={vaDistanceBcvaOd}
        vaDistanceBcvaOs={vaDistanceBcvaOs}
        vaNearUaOd={vaNearUaOd}
        vaNearUaOs={vaNearUaOs}
        vaNearHcOd={vaNearHcOd}
        vaNearHcOs={vaNearHcOs}
        vaNearBcvaOd={vaNearBcvaOd}
        vaNearBcvaOs={vaNearBcvaOs}
        vaDistanceTestMeters={vaDistanceTestMeters}
        vaNearTestCm={vaNearTestCm}
        vaCorrectionType={vaCorrectionType}
        medicalHistory={medicalHistory}
      />

      {/* Header - Two Row Navigation */}
      <header className="bg-card border-b border-border sticky top-0 z-20 shadow-sm print:hidden">
        {/* First Row: Brand */}
        <div className="flex justify-between items-center px-4 py-3">
          {/* Left: Logo + Clinic Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              {/* Editable Clinic Name */}
              <ClinicNameEditor />
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                {language === 'en' ? 'Binocular Vision Analysis System V1.0' : language === 'zh-CN' ? '双眼视觉分析系统 V1.0' : '雙眼視覺分析系統 V1.0'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Second Row: Function Buttons */}
        <div className="flex justify-between items-center px-4 pb-3 border-t border-border/50 pt-2">
          {/* Left Side Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <LanguageToggle />
            
            {/* New Customer Button */}
            <Button
              variant="default"
              size="sm"
              onClick={handleNewCustomer}
              className="rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5"
            >
              <UserPlus size={14} />
              <span className="hidden xs:inline">{tLocal('新增客戶', '新增客户', 'New Customer')}</span>
              <span className="xs:hidden">+</span>
            </Button>
          </div>
          
          {/* Right Side Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* User Menu - visible on all screens */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex text-muted-foreground px-2 sm:px-3">
                  <span className="hidden sm:inline">{profile?.optometrist_name || tLocal('帳號', '账号', 'Account')}</span>
                  <Settings className="h-4 w-4 sm:hidden" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border w-56">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  {tLocal('我的資料', '我的资料', 'My Profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/records')}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {tLocal('我的檢查紀錄', '我的检查记录', 'My Records')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {tLocal('統計儀表板', '统计仪表板', 'Dashboard')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/privacy')}>
                  <Shield className="h-4 w-4 mr-2" />
                  {tLocal('資料與隱私說明', '数据与隐私说明', 'Privacy Policy')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/subscription')}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  {tLocal('訂閱與付款', '订阅与付款', 'Subscription')}
                </DropdownMenuItem>
                
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {tLocal('管理員功能', '管理员功能', 'Admin Functions')}
                    </DropdownMenuLabel>
                    {/* Role management - visible to all admins, but only owner can edit */}
                    <DropdownMenuItem onClick={() => navigate('/admin/roles')}>
                      <Users className="h-4 w-4 mr-2" />
                      {tLocal('角色管理', '角色管理', 'Role Management')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/announcements')}>
                      <Megaphone className="h-4 w-4 mr-2" />
                      {tLocal('公告管理', '公告管理', 'Announcements')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/research-export')}>
                      <Database className="h-4 w-4 mr-2" />
                      {tLocal('研究資料匯出', '研究数据导出', 'Research Export')}
                    </DropdownMenuItem>
                    {/* Subscriptions - visible to owner, admin, accountant; support can view */}
                    {(hasSubscriptionAccess || userRole === 'support') && (
                      <DropdownMenuItem onClick={() => navigate('/admin/subscriptions')}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {tLocal('訂閱管理', '订阅管理', 'Subscriptions')}
                      </DropdownMenuItem>
                    )}
                    {/* Payments - only owner and accountant */}
                    {hasPaymentAccess && (
                      <DropdownMenuItem onClick={() => navigate('/admin/payments')}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {tLocal('付款管理', '付款管理', 'Payment Management')}
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  {tLocal('登出', '退出登录', 'Sign Out')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Save Button - Always visible */}
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              className="rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5"
            >
              <Save size={14} />
              <span className="hidden xs:inline">{tLocal('儲存', '保存', 'Save')}</span>
            </Button>

            {reportMode && (
              <>
                <button
                  onClick={handleShare}
                  className="bg-secondary text-secondary-foreground px-3 py-2 rounded-full hover:bg-muted transition-colors"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-bold hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Printer size={16} /> {t('print')}
                </button>
              </>
            )}
            <button
              onClick={() => setReportMode(!reportMode)}
              className={cn(
                "px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 transition-all duration-200",
                "shadow-sm hover:shadow-md active:scale-95",
                reportMode
                  ? "bg-secondary text-secondary-foreground"
                  : "gradient-primary text-primary-foreground"
              )}
            >
              {reportMode ? (
                <>
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{t('back')}</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{t('report')}</span>
                </>
              )}
            </button>
            
            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium flex items-center gap-1 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{tLocal('登出', '退出', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Announcement Banner */}
      <div className="px-4 pt-4 max-w-6xl mx-auto">
        <AnnouncementBanner />
      </div>

      <main className="p-4 max-w-6xl mx-auto print:p-0 print:max-w-none">
        {!reportMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Left: Input */}
            <div className="lg:col-span-5 space-y-5 h-fit">
              {/* Developer Test Panel (Owner or Admin only) */}
              {(userRole === 'owner' || userRole === 'admin') && (
                <DevTestPanel onLoadCase={handleLoadTestCase} />
              )}
              
              {/* Patient Info Input */}
              <PatientInfoInput
                patientCode={patientCode}
                setPatientCode={setPatientCode}
                patientAge={age}
                setPatientAge={setAge}
                patientGender={patientGender}
                setPatientGender={setPatientGender}
              >
                {/* Medical History Section - nested inside PatientInfoInput Card */}
                <MedicalHistorySection
                  value={medicalHistory}
                  onChange={setMedicalHistory}
                />
              </PatientInfoInput>
              
              <InputSection
                age={age} setAge={setAge}
                pd={pd} setPd={setPd}
                ciss={ciss} setCiss={setCiss}
                stereo={stereo} setStereo={setStereo}
                workDist={workDist} setWorkDist={setWorkDist}
                harmonDist={harmonDist} setHarmonDist={setHarmonDist}
                odSph={odSph} setOdSph={setOdSph}
                odCyl={odCyl} setOdCyl={setOdCyl}
                odAx={odAx} setOdAx={setOdAx}
                osSph={osSph} setOsSph={setOsSph}
                osCyl={osCyl} setOsCyl={setOsCyl}
                osAx={osAx} setOsAx={setOsAx}
                add={add} setAdd={setAdd}
                aaOD={aaOD} setAaOD={setAaOD}
                aaOS={aaOS} setAaOS={setAaOS}
                nra={nra} setNra={setNra}
                pra={pra} setPra={setPra}
                mem={mem} setMem={setMem}
                flipper={flipper} setFlipper={setFlipper}
                npc={npc} setNpc={setNpc}
                dist={dist} setDist={setDist}
                near={near} setNear={setNear}
                vert={vert} setVert={setVert}
                biB={biB} setBiB={setBiB}
                biR={biR} setBiR={setBiR}
                boB={boB} setBoB={setBoB}
                boR={boR} setBoR={setBoR}
                biBl={biBl} setBiBl={setBiBl}
                boBl={boBl} setBoBl={setBoBl}
                distBiB={distBiB} setDistBiB={setDistBiB}
                distBiR={distBiR} setDistBiR={setDistBiR}
                distBoB={distBoB} setDistBoB={setDistBoB}
                distBoR={distBoR} setDistBoR={setDistBoR}
                distBiBl={distBiBl} setDistBiBl={setDistBiBl}
                distBoBl={distBoBl} setDistBoBl={setDistBoBl}
                vergenceFacility={vergenceFacility} setVergenceFacility={setVergenceFacility}
                vergenceFacilityAborted={vergenceFacilityAborted} setVergenceFacilityAborted={setVergenceFacilityAborted}
                useGradient={useGradient} setUseGradient={setUseGradient}
                gradPhoria={gradPhoria} setGradPhoria={setGradPhoria}
                isDefaultValues={isDefaultValues}
                onFieldModified={handleFieldModified}
                onOpenCiss={() => setShowCissModal(true)}
                onOpenLiterature={() => setShowLiteratureModal(true)}
                // Visual Acuity props
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
            </div>

            {/* Right: Results */}
            <div className="lg:col-span-7 space-y-6">
              {/* Health Score Card */}
              <div className="bg-gradient-to-r from-foreground to-secondary-foreground rounded-3xl p-6 text-background shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <div className="text-muted text-xs font-bold uppercase tracking-widest mb-1">{t('visualHealthScore')}</div>
                    <div className="text-5xl font-bold tracking-tight">
                      {result.healthScore} <span className="text-xl text-muted-foreground font-normal">/ 100</span>
                    </div>
                    <div className="mt-2 text-sm font-medium flex items-center gap-2 opacity-80">
                      {result.healthScore >= 90 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      {result.healthScore >= 90 ? t('excellentVision') : t('bottleneckDetected')}
                    </div>
                  </div>
                  <div className="h-20 w-20 rounded-full border-4 border-background/20 flex items-center justify-center bg-background/5 backdrop-blur-sm">
                    <span className="text-3xl">👁️</span>
                  </div>
                </div>
              </div>

              {/* View Mode Selector */}
              <div className="flex justify-end">
                <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
              </div>

              {/* Stats Grid - Only show in pro/expert */}
              {(viewMode === 'pro' || viewMode === 'expert') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">AC/A Ratio ({result.aca.method})</div>
                    <div className="text-2xl font-bold text-foreground flex items-baseline gap-1">
                      {result.aca.val} <span className="text-sm font-normal text-muted-foreground">: 1</span>
                    </div>
                    <div className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded inline-block mt-1 w-fit",
                      result.aca.category === 'High' ? 'bg-destructive/10 text-destructive' :
                      result.aca.category === 'Low' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                    )}>
                      {result.aca.category} Category
                    </div>
                  </div>
                  <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-center relative overflow-hidden group">
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                      <Clock size={12} /> {t('functionalAge')}
                    </div>
                    <div className={cn(
                      "text-2xl font-bold",
                      result.accom.functionalAge > age + 5 ? 'text-warning' : 'text-foreground'
                    )}>
                      {result.accom.functionalAge} <span className="text-sm text-muted-foreground">{t('yearsOld')}</span>
                    </div>
                    {result.accom.functionalAge > age + 5 && (
                      <div className="text-[10px] text-warning font-bold mt-1">
                        ⚠️ {t('olderThanActual')} {result.accom.functionalAge - age} {t('yearsOld')}
                      </div>
                    )}
                    <div className="absolute right-0 top-0 w-16 h-16 bg-warning/10 rounded-bl-full -mr-2 -mt-2 opacity-50 group-hover:scale-110 transition-transform"></div>
                  </div>
                </div>
              )}

              {/* Data Quality Panel - Expert mode only */}
              {viewMode === 'expert' && (
                <DataQualityPanel
                  validationResults={validationResults}
                  qualityScore={qualityScore}
                  showDetails={false}
                />
              )}

              {/* Results Section */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <ResultsSection
                  result={result}
                  distPhoria={dist}
                  nearPhoria={near}
                  biBreak={biB}
                  boBreak={boB}
                  distBiBreak={distBiB}
                  distBoBreak={distBoB}
                  biBlur={biBl}
                  boBlur={boBl}
                  distBiBlur={distBiBl}
                  distBoBlur={distBoBl}
                  biRecovery={biR}
                  boRecovery={boR}
                  distBiRecovery={distBiR}
                  distBoRecovery={distBoR}
                  pd={pd}
                  nra={nra}
                  pra={pra}
                  mem={mem}
                  age={age}
                  aaOD={aaOD}
                  aaOS={aaOS}
                  flipper={flipper}
                  npc={npc}
                  viewMode={viewMode}
                  addPower={add}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* View Mode Selector for Report */}
            <div className="flex justify-end mb-4 print:hidden">
              <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
            </div>
            <div ref={reportRef}>
              <ReportView
                result={result}
                distPhoria={dist}
                nearPhoria={near}
                biBreak={biB}
                boBreak={boB}
                distBiBreak={distBiB}
                distBoBreak={distBoB}
                pd={pd}
                nra={nra}
                pra={pra}
                mem={mem}
                age={age}
                aaOD={aaOD}
                aaOS={aaOS}
                flipper={flipper}
                npc={npc}
                cissScore={ciss}
                viewMode={viewMode}
                patientCode={patientCode}
                patientName={patientName}
                workDist={workDist}
              />
            </div>
          </>
        )}
      </main>
      
      {/* 返回頂部按鈕 */}
      <BackToTop threshold={400} />
    </div>
  );
};

const Index = () => (
  <ErrorBoundary>
    <BinocularVisionApp />
  </ErrorBoundary>
);

export default Index;
