import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle } from '@/components/LanguageToggle';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Download, Shield, AlertTriangle, 
  Database, FileSpreadsheet, Loader2, Info,
  Calendar, MapPin, Filter, UserCheck, Award, FlaskConical
} from 'lucide-react';
import { 
  ResearchTier, 
  TIER_DEFINITIONS, 
  evaluateResearchEligibility,
  getTierSummary 
} from '@/lib/dataQuality/researchTiers';
import { calculateDataQualityScore, ExamDataForValidation } from '@/lib/dataValidation';
import { exportMedicalHistoryToCSV, MedicalHistoryData } from '@/components/MedicalHistorySection';

// 將資料庫 exam_data（可能存在不同欄位命名版本）正規化為：
// 1) dataValidation.ts（品質分數）需要的格式
// 2) researchTiers/coreVariables.ts（完整度/等級）需要的格式
//
// 注意：exam_records 的 age / gender 儲存在資料表欄位，不一定在 exam_data 內。
const mapExamDataForValidation = (
  examData: Record<string, any>,
  meta?: { id?: string; age?: number | null; gender?: string | null }
): (ExamDataForValidation & Record<string, any>) => {
  const age = (meta?.age ?? examData.age) ?? undefined;
  const gender = (meta?.gender ?? examData.gender) ?? undefined;

  // 相容舊/新欄位命名
  const ciss = examData.cissScore ?? examData.ciss;
  const dist = examData.distPhoria ?? examData.dist;
  const near = examData.nearPhoria ?? examData.near;
  const nearBiBreak = examData.biBreak ?? examData.biB;
  const nearBoBreak = examData.boBreak ?? examData.boB;

  const aaOD = examData.aaOD;
  const aaOS = examData.aaOS;

  const ampValue = Math.min(aaOD ?? Infinity, aaOS ?? Infinity) !== Infinity
    ? Math.min(aaOD, aaOS)
    : undefined;

  const vergenceFacilityCpm = examData.vergenceFacilityCpm ?? examData.vergenceFacility;

  return {
    // dataValidation.ts 所需格式
    age,
    npc: examData.npc,
    ciss,
    distPhoria: dist,
    nearPhoria: near,
    distBiBreak: examData.distBiB ?? examData.distBiBreak,
    distBiRecovery: examData.distBiR ?? examData.distBiRecovery,
    distBoBreak: examData.distBoB ?? examData.distBoBreak,
    distBoRecovery: examData.distBoR ?? examData.distBoRecovery,
    nearBiBreak,
    nearBiRecovery: examData.biR ?? examData.nearBiRecovery,
    nearBoBreak,
    nearBoRecovery: examData.boR ?? examData.nearBoRecovery,
    calculatedACA: examData.calculatedACA,
    gradientACA: examData.gradientACA ?? undefined,
    pd: examData.pd,
    workDist: examData.workDist,
    amp: ampValue,
    flipper: examData.flipper?.toString(),
    nra: examData.nra,
    pra: examData.pra,
    stereo: examData.stereo,

    // researchTiers/coreVariables.ts（完整度）所需：使用「canonical key」
    id: meta?.id,
    gender,
    cissScore: ciss, // alias
    dist,
    near,
    biB: nearBiBreak,
    biR: examData.biR,
    boB: nearBoBreak,
    boR: examData.boR,
    distBiB: examData.distBiB,
    distBoB: examData.distBoB,
    vergenceFacilityCpm,
    aaOD,
    aaOS,
    mem: examData.mem,
  };
};

const AdminResearchExport = () => {
  const { language } = useLanguage();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStats, setExportStats] = useState<{
    totalRecords: number;
    totalOptometrists: number;
    filteredRecords: number;
    whitelistOptometrists: number;
    tierCounts: {
      gold: number;
      high: number;
      acceptable: number;
      insufficient: number;
    };
  } | null>(null);

  // Filter states
  const [startYearMonth, setStartYearMonth] = useState('');
  const [endYearMonth, setEndYearMonth] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [onlyWhitelist, setOnlyWhitelist] = useState(true); // Default to true
  const [selectedTier, setSelectedTier] = useState<ResearchTier>('high'); // Default to high

  const t = (zhTW: string, zhCN: string) => language === 'zh-TW' ? zhTW : zhCN;

  // Generate year-month options (last 3 years)
  const yearMonthOptions = useMemo(() => {
    const options: string[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    for (let year = currentYear; year >= currentYear - 3; year--) {
      const maxMonth = year === currentYear ? currentMonth : 12;
      const minMonth = year === currentYear - 3 ? 1 : 1;
      
      for (let month = maxMonth; month >= minMonth; month--) {
        options.push(`${year}-${String(month).padStart(2, '0')}`);
      }
    }
    return options;
  }, []);

  const fetchExportStats = async () => {
    try {
      // Get total records with exam_data for tier calculation
      // NOTE: age/gender 存在 exam_records 欄位，不一定在 exam_data 內，需一併取回才能正確計算核心完整度。
      const { data: records, count: recordCount } = await supabase
        .from('exam_records')
        .select('id, exam_data, age, gender', { count: 'exact' });

      // Get unique optometrists count
      const { data: profiles } = await supabase
        .from('optometrist_profiles')
        .select('id, clinic_region, research_qualified');

      // Get unique regions
      const regions = [...new Set(profiles?.map(p => p.clinic_region).filter(Boolean) || [])];
      setAvailableRegions(regions.sort());

      // Count whitelist optometrists
      const whitelistCount = profiles?.filter(p => p.research_qualified).length || 0;

      // Calculate tier counts
      const tierCounts = { gold: 0, high: 0, acceptable: 0, insufficient: 0 };
      records?.forEach(record => {
        const examData = (record.exam_data as Record<string, any>) || {};
        const validationData = mapExamDataForValidation(examData, {
          id: record.id,
          age: record.age,
          gender: record.gender,
        });

        const qualityScore = calculateDataQualityScore(validationData);
        const eligibility = evaluateResearchEligibility(validationData, qualityScore.overall);
        tierCounts[eligibility.tier]++;

        // Debug（依需求輸出每筆記錄計算細節）
        console.log('[AdminResearchExport][Tiering][stats]', {
          recordId: record.id,
          qualityScore: qualityScore.overall,
          coreCompleteness: eligibility.coreCompleteness,
          totalCompleteness: eligibility.totalCompleteness,
          tier: eligibility.tier,
        });
      });

      setExportStats({
        totalRecords: recordCount || 0,
        totalOptometrists: profiles?.length || 0,
        filteredRecords: recordCount || 0,
        whitelistOptometrists: whitelistCount,
        tierCounts,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Update filtered count when filters change
  const updateFilteredCount = async () => {
    if (!isAdmin) return;

    try {
      // Build profile query with filters
      let profileQuery = supabase
        .from('optometrist_profiles')
        .select('user_id, clinic_region, research_qualified');
      
      // Apply region filter
      if (selectedRegions.length > 0) {
        profileQuery = profileQuery.in('clinic_region', selectedRegions);
      }
      
      // Apply whitelist filter
      if (onlyWhitelist) {
        profileQuery = profileQuery.eq('research_qualified', true);
      }
      
      const { data: profiles } = await profileQuery;
      const userIds = profiles?.map(p => p.user_id) || [];
      
      if (userIds.length === 0) {
        setExportStats(prev => prev ? { ...prev, filteredRecords: 0 } : null);
        return;
      }
      
      // Build records query
      let query = supabase.from('exam_records').select('*', { count: 'exact', head: true });
      
      // Apply date filters
      if (startYearMonth && startYearMonth !== 'all') {
        query = query.gte('exam_date', `${startYearMonth}-01`);
      }
      if (endYearMonth && endYearMonth !== 'all') {
        query = query.lte('exam_date', `${endYearMonth}-31`);
      }
      
      // Apply user filter
      query = query.in('user_id', userIds);

      const { count } = await query;
      setExportStats(prev => prev ? { ...prev, filteredRecords: count || 0 } : null);
    } catch (err) {
      console.error('Error updating filtered count:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchExportStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      updateFilteredCount();
    }
  }, [isAdmin, startYearMonth, endYearMonth, selectedRegions, onlyWhitelist]);

  // Redirect non-admin users - MUST be after all hooks
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t('權限不足', '权限不足')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('此功能僅限系統管理員使用', '此功能仅限系统管理员使用')}
            </p>
            <Button onClick={() => navigate('/analyzer')}>
              {t('返回首頁', '返回首页')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const handleSelectAllRegions = () => {
    if (selectedRegions.length === availableRegions.length) {
      setSelectedRegions([]);
    } else {
      setSelectedRegions([...availableRegions]);
    }
  };

  const handleExportResearchData = async () => {
    setIsExporting(true);

    try {
      // Build base query
      let recordsQuery = supabase
        .from('exam_records')
        .select(`
          id,
          user_id,
          age,
          gender,
          exam_date,
          exam_data,
          health_score,
          diagnostic_classification,
          medical_history_simple,
          va_distance_ua_od_raw,
          va_distance_ua_os_raw,
          va_distance_bcva_od_raw,
          va_distance_bcva_os_raw,
          va_distance_bcva_od_logmar,
          va_distance_bcva_os_logmar,
          va_near_bcva_od_raw,
          va_near_bcva_os_raw,
          va_near_bcva_od_logmar,
          va_near_bcva_os_logmar
        `);

      // Apply date filters
      if (startYearMonth && startYearMonth !== 'all') {
        recordsQuery = recordsQuery.gte('exam_date', `${startYearMonth}-01`);
      }
      if (endYearMonth && endYearMonth !== 'all') {
        recordsQuery = recordsQuery.lte('exam_date', `${endYearMonth}-31`);
      }

      const { data: records, error: recordsError } = await recordsQuery;
      if (recordsError) throw recordsError;

      // Fetch profiles for clinic_region mapping and whitelist status
      const { data: profiles, error: profilesError } = await supabase
        .from('optometrist_profiles')
        .select('user_id, clinic_region, research_qualified');
      if (profilesError) throw profilesError;

      // Create user_id to region mapping and whitelist set
      const regionMap = new Map<string, string>();
      const whitelistSet = new Set<string>();
      profiles?.forEach(p => {
        regionMap.set(p.user_id, p.clinic_region);
        if (p.research_qualified) {
          whitelistSet.add(p.user_id);
        }
      });

      // Filter records
      let filteredRecords = records || [];
      
      // Filter by region if selected
      if (selectedRegions.length > 0) {
        filteredRecords = filteredRecords.filter(r => {
          const region = regionMap.get(r.user_id);
          return region && selectedRegions.includes(region);
        });
      }
      
      // Filter by whitelist if enabled
      if (onlyWhitelist) {
        filteredRecords = filteredRecords.filter(r => whitelistSet.has(r.user_id));
      }

      // Filter by quality tier and add tier info
      const tierPriority: Record<ResearchTier, number> = {
        gold: 3, high: 2, acceptable: 1, insufficient: 0
      };
      const minPriority = tierPriority[selectedTier];

      const recordsWithTier = filteredRecords.map(record => {
        const examData = (record.exam_data as Record<string, any>) || {};
        const validationData = mapExamDataForValidation(examData, {
          id: record.id,
          age: record.age,
          gender: record.gender,
        });

        const qualityScore = calculateDataQualityScore(validationData);
        const eligibility = evaluateResearchEligibility(validationData, qualityScore.overall);

        // Debug（依需求輸出每筆記錄計算細節）
        console.log('[AdminResearchExport][Tiering][export]', {
          recordId: record.id,
          qualityScore: qualityScore.overall,
          coreCompleteness: eligibility.coreCompleteness,
          totalCompleteness: eligibility.totalCompleteness,
          tier: eligibility.tier,
        });

        return { ...record, tier: eligibility.tier, qualityScore: qualityScore.overall, _normalized: validationData };
      }).filter(r => tierPriority[r.tier] >= minPriority);

      // Create anonymous ID mapping
      const userIdMap = new Map<string, string>();
      let anonymousCounter = 1;
      recordsWithTier.forEach(r => {
        if (!userIdMap.has(r.user_id)) {
          userIdMap.set(r.user_id, `ANON_${String(anonymousCounter).padStart(6, '0')}`);
          anonymousCounter++;
        }
      });

      // Build CSV with data_quality_tier column and prefilled tracking
      const csvHeaders = [
        'anonymous_user_id', 'clinic_region', 'exam_year_month', 'age', 'gender',
        'health_score',
        // Medical History (6 fields - placed after health_score)
        'MedHx_HasConditions', 'MedHx_OcularList', 'MedHx_SystemicList',
        'MedHx_HighRisk', 'MedHx_RiskFactors', 'MedHx_Notes',
        'diagnostic_classification', 'data_quality_tier', 'quality_score',
        'prefilled_fields', 'prefilled_field_count', 'actual_measurement_count',
        'pd', 'ciss', 'stereo', 'npc', 'nra', 'pra', 'bcc', 'aaOD', 'aaOS', 'flipper',
        'dist_phoria', 'near_phoria', 'vergence_facility',
        // Visual Acuity fields
        'va_dist_ua_od', 'va_dist_ua_os', 'va_dist_bcva_od', 'va_dist_bcva_os',
        'va_dist_bcva_od_logmar', 'va_dist_bcva_os_logmar',
        'va_near_bcva_od', 'va_near_bcva_os', 'va_near_bcva_od_logmar', 'va_near_bcva_os_logmar',
        // Fusional reserves - Near (blur/break/recovery order)
        'bi_blur', 'bi_break', 'bi_recovery',
        'bo_blur', 'bo_break', 'bo_recovery',
        // Fusional reserves - Distance (blur/break/recovery order)
        'dist_bi_blur', 'dist_bi_break', 'dist_bi_recovery',
        'dist_bo_blur', 'dist_bo_break', 'dist_bo_recovery',
        // Prefilled tracking - individual fields
        'dist_phoria_is_default', 'near_phoria_is_default', 'npc_is_default', 'vf_is_default',
        'bi_blur_is_default', 'bi_break_is_default', 'bi_recovery_is_default',
        'bo_blur_is_default', 'bo_break_is_default', 'bo_recovery_is_default',
        'dist_bi_blur_is_default', 'dist_bi_break_is_default', 'dist_bi_recovery_is_default',
        'dist_bo_blur_is_default', 'dist_bo_break_is_default', 'dist_bo_recovery_is_default',
      ];

      const csvRows = recordsWithTier.map(record => {
        const examData = (record.exam_data as Record<string, any>) || {};
        const yearMonth = record.exam_date ? record.exam_date.substring(0, 7) : '';

        // 若前面已正規化則優先使用，避免 CSV 再次因欄位命名不一致而空白
        const normalized = (record as any)._normalized ||
          mapExamDataForValidation(examData, { id: record.id, age: record.age, gender: record.gender });

        // Extract prefilled tracking info from exam_data
        const isDefaultValues: Record<string, boolean> = examData._isDefaultValues || {};
        const trackedFields = ['distPhoria', 'nearPhoria', 'npc', 'vf', 'biBlur', 'biB', 'biR', 'boBlur', 'boB', 'boR', 'distBiBlur', 'distBiB', 'distBiR', 'distBoBlur', 'distBoB', 'distBoR'];
        const prefilledFields = trackedFields.filter(f => isDefaultValues[f] === true);
        const actualMeasurementCount = trackedFields.filter(f => isDefaultValues[f] === false).length;

        // Extract medical history CSV fields
        const medHx = exportMedicalHistoryToCSV(
          (record as any).medical_history_simple as MedicalHistoryData | null
        );

        const rowValues = [
          userIdMap.get(record.user_id) || '', regionMap.get(record.user_id) || '', yearMonth,
          record.age ?? '', record.gender ?? '', record.health_score ?? '',
          // Medical History (6 fields)
          medHx.MedHx_HasConditions, medHx.MedHx_OcularList, medHx.MedHx_SystemicList,
          medHx.MedHx_HighRisk, medHx.MedHx_RiskFactors, medHx.MedHx_Notes,
          record.diagnostic_classification || '',
          record.tier, record.qualityScore,
          prefilledFields.join(';'), prefilledFields.length, actualMeasurementCount,
          normalized.pd ?? '', normalized.ciss ?? '', normalized.stereo ?? '', normalized.npc ?? '',
          normalized.nra ?? '', normalized.pra ?? '', normalized.mem ?? '', normalized.aaOD ?? '',
          normalized.aaOS ?? '', normalized.flipper ?? '', normalized.dist ?? '', normalized.near ?? '',
          normalized.vergenceFacilityCpm ?? '',
          // Visual Acuity fields
          (record as any).va_distance_ua_od_raw ?? '',
          (record as any).va_distance_ua_os_raw ?? '',
          (record as any).va_distance_bcva_od_raw ?? '',
          (record as any).va_distance_bcva_os_raw ?? '',
          (record as any).va_distance_bcva_od_logmar ?? '',
          (record as any).va_distance_bcva_os_logmar ?? '',
          (record as any).va_near_bcva_od_raw ?? '',
          (record as any).va_near_bcva_os_raw ?? '',
          (record as any).va_near_bcva_od_logmar ?? '',
          (record as any).va_near_bcva_os_logmar ?? '',
          // Fusional reserves - Near
          examData.biBlur ?? '', normalized.biB ?? '', examData.biR ?? '',
          examData.boBlur ?? '', normalized.boB ?? '', examData.boR ?? '',
          // Fusional reserves - Distance
          examData.distBiBlur ?? '', normalized.distBiB ?? '', examData.distBiR ?? '',
          examData.distBoBlur ?? '', normalized.distBoB ?? '', examData.distBoR ?? '',
          // Prefilled tracking - individual fields
          isDefaultValues.distPhoria ?? isDefaultValues.dist ?? '',
          isDefaultValues.nearPhoria ?? isDefaultValues.near ?? '',
          isDefaultValues.npc ?? '',
          isDefaultValues.vf ?? isDefaultValues.vergenceFacility ?? '',
          isDefaultValues.biBlur ?? '',
          isDefaultValues.biB ?? isDefaultValues.biBreak ?? '',
          isDefaultValues.biR ?? isDefaultValues.biRecovery ?? '',
          isDefaultValues.boBlur ?? '',
          isDefaultValues.boB ?? isDefaultValues.boBreak ?? '',
          isDefaultValues.boR ?? isDefaultValues.boRecovery ?? '',
          isDefaultValues.distBiBlur ?? '',
          isDefaultValues.distBiB ?? isDefaultValues.distBiBreak ?? '',
          isDefaultValues.distBiR ?? isDefaultValues.distBiRecovery ?? '',
          isDefaultValues.distBoBlur ?? '',
          isDefaultValues.distBoB ?? isDefaultValues.distBoBreak ?? '',
          isDefaultValues.distBoR ?? isDefaultValues.distBoRecovery ?? '',
        ];
        
        return rowValues.map(val => {
          if (val === null || val === undefined) return '';
          const str = String(val);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',');
      });

      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

      // Download CSV
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `research_data_${selectedTier}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: t('匯出成功', '导出成功'),
        description: t(`已匯出 ${recordsWithTier.length} 筆 ${TIER_DEFINITIONS[selectedTier].labelZh} 級資料`, `已导出 ${recordsWithTier.length} 条 ${TIER_DEFINITIONS[selectedTier].labelZh} 级数据`),
      });
    } catch (err: any) {
      console.error('Export error:', err);
      toast({
        title: t('匯出失敗', '导出失败'),
        description: err.message || t('請稍後再試', '请稍后再试'),
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-card border-b border-border sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/analyzer')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-lg">{t('研究資料匯出', '研究数据导出')}</h1>
          </div>
        </div>
        <LanguageToggle />
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-6">
        {/* Admin Badge */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium text-primary">
                {t('管理員功能', '管理员功能')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('此功能僅限系統管理員使用，用於研究與統計分析', '此功能仅限系统管理员使用，用于研究与统计分析')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        {exportStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {t('資料庫統計', '数据库统计')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">{exportStats.totalRecords}</p>
                  <p className="text-sm text-muted-foreground">{t('檢查紀錄總數', '检查记录总数')}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">{exportStats.totalOptometrists}</p>
                  <p className="text-sm text-muted-foreground">{t('驗光師帳號數', '验光师账号数')}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">{exportStats.whitelistOptometrists}</p>
                  <p className="text-sm text-muted-foreground">{t('研究白名單', '研究白名单')}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-amber-600">{exportStats.filteredRecords}</p>
                  <p className="text-sm text-muted-foreground">{t('篩選後筆數', '筛选后条数')}</p>
                </div>
              </div>

              {/* Tier Distribution Stats */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  {t('品質等級分佈', '品质等级分布')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className={`p-3 rounded-lg border ${TIER_DEFINITIONS.gold.borderColor} ${TIER_DEFINITIONS.gold.bgColor}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Award className={`h-4 w-4 ${TIER_DEFINITIONS.gold.color}`} />
                      <span className={`font-semibold ${TIER_DEFINITIONS.gold.color}`}>{t('金級', '金级')}</span>
                    </div>
                    <p className="text-2xl font-bold">{exportStats.tierCounts.gold}</p>
                    <p className="text-xs text-muted-foreground">
                      {exportStats.totalRecords > 0 
                        ? `${Math.round(exportStats.tierCounts.gold / exportStats.totalRecords * 100)}%` 
                        : '0%'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg border ${TIER_DEFINITIONS.high.borderColor} ${TIER_DEFINITIONS.high.bgColor}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Award className={`h-4 w-4 ${TIER_DEFINITIONS.high.color}`} />
                      <span className={`font-semibold ${TIER_DEFINITIONS.high.color}`}>{t('高品質', '高品质')}</span>
                    </div>
                    <p className="text-2xl font-bold">{exportStats.tierCounts.high}</p>
                    <p className="text-xs text-muted-foreground">
                      {exportStats.totalRecords > 0 
                        ? `${Math.round(exportStats.tierCounts.high / exportStats.totalRecords * 100)}%` 
                        : '0%'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg border ${TIER_DEFINITIONS.acceptable.borderColor} ${TIER_DEFINITIONS.acceptable.bgColor}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Award className={`h-4 w-4 ${TIER_DEFINITIONS.acceptable.color}`} />
                      <span className={`font-semibold ${TIER_DEFINITIONS.acceptable.color}`}>{t('可接受', '可接受')}</span>
                    </div>
                    <p className="text-2xl font-bold">{exportStats.tierCounts.acceptable}</p>
                    <p className="text-xs text-muted-foreground">
                      {exportStats.totalRecords > 0 
                        ? `${Math.round(exportStats.tierCounts.acceptable / exportStats.totalRecords * 100)}%` 
                        : '0%'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-gray-300 bg-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-gray-500">{t('不符合', '不符合')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-600">{exportStats.tierCounts.insufficient}</p>
                    <p className="text-xs text-muted-foreground">
                      {exportStats.totalRecords > 0 
                        ? `${Math.round(exportStats.tierCounts.insufficient / exportStats.totalRecords * 100)}%` 
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('篩選條件', '筛选条件')}
            </CardTitle>
            <CardDescription>
              {t('設定匯出資料的時間與地區範圍', '设置导出数据的时间与地区范围')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                {t('時間區間（年-月）', '时间区间（年-月）')}
              </Label>
              <div className="flex items-center gap-3">
                <Select value={startYearMonth} onValueChange={setStartYearMonth}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={t('開始月份', '开始月份')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border max-h-[300px]">
                    <SelectItem value="all">{t('不限', '不限')}</SelectItem>
                    {yearMonthOptions.map(ym => (
                      <SelectItem key={ym} value={ym}>{ym}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">~</span>
                <Select value={endYearMonth} onValueChange={setEndYearMonth}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={t('結束月份', '结束月份')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border max-h-[300px]">
                    <SelectItem value="all">{t('不限', '不限')}</SelectItem>
                    {yearMonthOptions.map(ym => (
                      <SelectItem key={ym} value={ym}>{ym}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Region Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  {t('執業地區', '执业地区')}
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSelectAllRegions}
                  className="text-xs"
                >
                  {selectedRegions.length === availableRegions.length 
                    ? t('取消全選', '取消全选') 
                    : t('全選', '全选')}
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-2 bg-muted/30 rounded-lg">
                {availableRegions.length > 0 ? (
                  availableRegions.map(region => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={`region-${region}`}
                        checked={selectedRegions.includes(region)}
                        onCheckedChange={() => handleRegionToggle(region)}
                      />
                      <label
                        htmlFor={`region-${region}`}
                        className="text-sm cursor-pointer truncate"
                      >
                        {region}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                    {t('載入中...', '加载中...')}
                  </p>
                )}
              </div>
              {selectedRegions.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t(`已選擇 ${selectedRegions.length} 個地區`, `已选择 ${selectedRegions.length} 个地区`)}
                </p>
              )}
            </div>

            {/* Whitelist Filter */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="whitelist-filter"
                  checked={onlyWhitelist}
                  onCheckedChange={(checked) => setOnlyWhitelist(!!checked)}
                />
                <Label htmlFor="whitelist-filter" className="flex items-center gap-2 cursor-pointer">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{t('僅包含研究合作驗光師資料', '仅包含研究合作验光师数据')}</span>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                {onlyWhitelist 
                  ? t('只會匯出已標記為研究白名單的驗光師資料', '只会导出已标记为研究白名单的验光师数据')
                  : t('將匯出所有驗光師的資料（不限白名單）', '将导出所有验光师的数据（不限白名单）')}
              </p>
            </div>

            {/* Quality Tier Selector */}
            <div className="space-y-4 pt-4 border-t">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <FlaskConical className="h-4 w-4" />
                {t('資料品質等級', '数据品质等级')}
              </Label>
              <RadioGroup 
                value={selectedTier} 
                onValueChange={(value) => setSelectedTier(value as ResearchTier)}
                className="space-y-3"
              >
                {/* Gold Tier */}
                <div className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  selectedTier === 'gold' 
                    ? `${TIER_DEFINITIONS.gold.borderColor} ${TIER_DEFINITIONS.gold.bgColor}` 
                    : 'border-border hover:bg-muted/50'
                }`}>
                  <RadioGroupItem value="gold" id="tier-gold" className="mt-1" />
                  <Label htmlFor="tier-gold" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Award className={`h-4 w-4 ${TIER_DEFINITIONS.gold.color}`} />
                      <span className={`font-semibold ${TIER_DEFINITIONS.gold.color}`}>
                        {t('金級 (Gold)', '金级 (Gold)')}
                      </span>
                      {exportStats && (
                        <Badge variant="outline" className="ml-auto">
                          {exportStats.tierCounts.gold} {t('筆', '条')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('完整度 100% + 品質 ≥85 — 適合主要統計分析、AI 模型訓練', '完整度 100% + 品质 ≥85 — 适合主要统计分析、AI 模型训练')}
                    </p>
                  </Label>
                </div>

                {/* High Tier */}
                <div className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  selectedTier === 'high' 
                    ? `${TIER_DEFINITIONS.high.borderColor} ${TIER_DEFINITIONS.high.bgColor}` 
                    : 'border-border hover:bg-muted/50'
                }`}>
                  <RadioGroupItem value="high" id="tier-high" className="mt-1" />
                  <Label htmlFor="tier-high" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Award className={`h-4 w-4 ${TIER_DEFINITIONS.high.color}`} />
                      <span className={`font-semibold ${TIER_DEFINITIONS.high.color}`}>
                        {t('高品質 (High)', '高品质 (High)')}
                      </span>
                      <Badge variant="secondary" className="text-xs">{t('推薦', '推荐')}</Badge>
                      {exportStats && (
                        <Badge variant="outline" className="ml-auto">
                          {exportStats.tierCounts.gold + exportStats.tierCounts.high} {t('筆', '条')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('核心 100% + 總完整度 ≥95% + 品質 ≥70 — 適合多數臨床研究', '核心 100% + 总完整度 ≥95% + 品质 ≥70 — 适合多数临床研究')}
                    </p>
                  </Label>
                </div>

                {/* Acceptable Tier */}
                <div className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  selectedTier === 'acceptable' 
                    ? `${TIER_DEFINITIONS.acceptable.borderColor} ${TIER_DEFINITIONS.acceptable.bgColor}` 
                    : 'border-border hover:bg-muted/50'
                }`}>
                  <RadioGroupItem value="acceptable" id="tier-acceptable" className="mt-1" />
                  <Label htmlFor="tier-acceptable" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Award className={`h-4 w-4 ${TIER_DEFINITIONS.acceptable.color}`} />
                      <span className={`font-semibold ${TIER_DEFINITIONS.acceptable.color}`}>
                        {t('可接受 (Acceptable)', '可接受 (Acceptable)')}
                      </span>
                      {exportStats && (
                        <Badge variant="outline" className="ml-auto">
                          {exportStats.tierCounts.gold + exportStats.tierCounts.high + exportStats.tierCounts.acceptable} {t('筆', '条')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('核心 ≥90% + 總完整度 ≥90% + 品質 ≥60 — 適合描述性統計、探索性分析', '核心 ≥90% + 总完整度 ≥90% + 品质 ≥60 — 适合描述性统计、探索性分析')}
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Export Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              {t('匯出去識別化資料', '导出去标识化数据')}
            </CardTitle>
            <CardDescription>
              {t(
                '匯出所有驗光師的去識別化檢查資料，用於研究與統計分析',
                '导出所有验光师的去标识化检查数据，用于研究与统计分析'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                {t('匯出欄位說明', '导出字段说明')}
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• <code>anonymous_user_id</code> - {t('匿名驗光師 ID（取代真實 user_id）', '匿名验光师 ID（替代真实 user_id）')}</li>
                <li>• <code>clinic_region</code> - {t('執業地區', '执业地区')}</li>
                <li>• <code>exam_year_month</code> - {t('檢查年月（已粗化）', '检查年月（已粗化）')}</li>
                <li>• <code>age</code>, <code>gender</code> - {t('年齡、性別', '年龄、性别')}</li>
                <li>• <code>health_score</code>, <code>diagnostic_classification</code> - {t('健康分數、診斷分類', '健康分数、诊断分类')}</li>
                <li>• {t('基本檢查數值：pd, ciss, stereo, npc, nra, pra, mem, aaOD, aaOS, flipper, dist_phoria, near_phoria, vergence_facility', '基本检查数值：pd, ciss, stereo, npc, nra, pra, mem, aaOD, aaOS, flipper, dist_phoria, near_phoria, vergence_facility')}</li>
                <li>• {t('近距融像儲備：bi_blur, bi_break, bi_recovery, bo_blur, bo_break, bo_recovery', '近距融像储备：bi_blur, bi_break, bi_recovery, bo_blur, bo_break, bo_recovery')}</li>
                <li>• {t('遠距融像儲備：dist_bi_blur, dist_bi_break, dist_bi_recovery, dist_bo_blur, dist_bo_break, dist_bo_recovery', '远距融像储备：dist_bi_blur, dist_bi_break, dist_bi_recovery, dist_bo_blur, dist_bo_break, dist_bo_recovery')}</li>
                <li>• {t('預填值追蹤欄位（16個）：[欄位名]_is_default（true=預填值, false=實測值, 空=未記錄）', '预填值追踪栏位（16个）：[栏位名]_is_default（true=预填值, false=实测值, 空=未记录）')}</li>
              </ul>
            </div>

            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {t('不包含的欄位', '不包含的字段')}
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• {t('驗光師真實帳號資訊、驗光師證號', '验光师真实账号信息、验光师证号')}</li>
                <li>• {t('驗光所名稱、地址、聯絡方式', '验光所名称、地址、联系方式')}</li>
                <li>• {t('顧客編號（patient_code）', '客户编号（patient_code）')}</li>
                <li>• {t('任何可識別個人的資訊', '任何可识别个人的信息')}</li>
              </ul>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{t('使用說明', '使用说明')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• {t('此功能僅供系統管理者使用', '此功能仅供系统管理者使用')}</li>
                <li>• {t('資料用於系統優化、統計分析、學術研究、教育用途', '数据用于系统优化、统计分析、学术研究、教育用途')}</li>
                <li>• {t('不嘗試反向識別個人', '不尝试反向识别个人')}</li>
                <li>• {t('不提供給第三方作為直接行銷用途', '不提供给第三方作为直接营销用途')}</li>
              </ul>
            </div>

            <Button 
              onClick={handleExportResearchData} 
              disabled={isExporting}
              className="w-full"
              size="lg"
            >
              {isExporting ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Download className="h-5 w-5 mr-2" />
              )}
              {t('匯出去識別化研究資料', '导出去标识化研究数据')}
              {exportStats && ` (${exportStats.filteredRecords} ${t('筆', '条')})`}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminResearchExport;
