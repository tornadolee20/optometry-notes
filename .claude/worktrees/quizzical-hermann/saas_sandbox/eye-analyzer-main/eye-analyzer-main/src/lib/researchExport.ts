// Research Data Export Service
// Provides de-identification and export functions for research data

import { supabase } from '@/integrations/supabase/client';
import { calculateDataQualityScore } from './dataValidation';
import { exportMedicalHistoryToCSV, MedicalHistoryCSVFields, MedicalHistoryData } from '@/components/MedicalHistorySection';

// ============================================
// Types
// ============================================

export interface DeidentifiedRecord {
  anonymous_user_id: string;
  clinic_region: string;
  exam_year_month: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  
  // Clinical measurements
  pd: number | null;
  ciss: number | null;
  stereo: number | null;
  npc: number | null;
  nra: number | null;
  pra: number | null;
  mem: number | null;
  aaOD: number | null;
  aaOS: number | null;
  flipper: number | null;
  dist_phoria: number | null;
  near_phoria: number | null;
  vergence_facility: number | null;
  
  // Fusional reserves - Near (blur/break/recovery)
  bi_blur: number | null;
  bi_break: number | null;
  bi_recovery: number | null;
  bo_blur: number | null;
  bo_break: number | null;
  bo_recovery: number | null;
  
  // Fusional reserves - Distance (blur/break/recovery)
  dist_bi_blur: number | null;
  dist_bi_break: number | null;
  dist_bi_recovery: number | null;
  dist_bo_blur: number | null;
  dist_bo_break: number | null;
  dist_bo_recovery: number | null;
  
  // Analysis results
  health_score: number | null;
  diagnostic_classification: string | null;
  
  // Quality metrics
  data_quality_score: number | null;
  completeness_score: number | null;
  
  // Pre-filled value tracking (Phase 4 enhancement)
  prefilled_fields: string; // Comma-separated list of fields using default values
  prefilled_field_count: number;
  actual_measurement_count: number;
  
  // Individual prefilled tracking for fusional reserve fields
  dist_phoria_is_default: boolean | null;
  near_phoria_is_default: boolean | null;
  npc_is_default: boolean | null;
  vf_is_default: boolean | null;
  bi_blur_is_default: boolean | null;
  bi_break_is_default: boolean | null;
  bi_recovery_is_default: boolean | null;
  bo_blur_is_default: boolean | null;
  bo_break_is_default: boolean | null;
  bo_recovery_is_default: boolean | null;
  dist_bi_blur_is_default: boolean | null;
  dist_bi_break_is_default: boolean | null;
  dist_bi_recovery_is_default: boolean | null;
  dist_bo_blur_is_default: boolean | null;
  dist_bo_break_is_default: boolean | null;
  dist_bo_recovery_is_default: boolean | null;
  
  // Medical History (6 CSV fields)
  MedHx_HasConditions: 0 | 1;
  MedHx_OcularList: string;
  MedHx_SystemicList: string;
  MedHx_HighRisk: 0 | 1;
  MedHx_RiskFactors: string;
  MedHx_Notes: string;
}

export interface ResearchExportFilters {
  startDate?: string; // YYYY-MM format
  endDate?: string; // YYYY-MM format
  minQualityScore?: number;
  minCompletenessScore?: number;
  includeOnlyWhitelisted?: boolean;
  regions?: string[];
  diagnosticTypes?: string[];
}

export interface ExportResult {
  success: boolean;
  recordCount: number;
  data: DeidentifiedRecord[];
  error?: string;
}

// ============================================
// De-identification Functions
// ============================================

/**
 * Generate anonymous ID from user_id using a consistent mapping
 * The mapping is session-specific and not stored
 */
function generateAnonymousId(userId: string, userIdMap: Map<string, string>): string {
  if (userIdMap.has(userId)) {
    return userIdMap.get(userId)!;
  }
  const anonymousId = `ANON_${String(userIdMap.size + 1).padStart(6, '0')}`;
  userIdMap.set(userId, anonymousId);
  return anonymousId;
}

/**
 * Coarsen date to year-month for privacy protection
 */
function coarsenDate(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.substring(0, 7); // YYYY-MM
}

/**
 * Calculate quality scores for a record
 */
function calculateQualityScores(examData: Record<string, any>): { 
  qualityScore: number; 
  completenessScore: number; 
} {
  try {
    const validationData = {
      npc: examData.npc,
      ciss: examData.ciss,
      dist: examData.dist,
      near: examData.near,
      boB: examData.boB,
      biB: examData.biB,
      boR: examData.boR,
      biR: examData.biR,
      distBoB: examData.distBoB,
      distBiB: examData.distBiB,
      aaOD: examData.aaOD,
      aaOS: examData.aaOS,
      nra: examData.nra,
      pra: examData.pra,
      mem: examData.mem,
      stereo: examData.stereo,
      age: examData.age,
    };
    
    const qualityResult = calculateDataQualityScore(validationData);
    
    return {
      qualityScore: qualityResult.overall,
      completenessScore: qualityResult.completeness,
    };
  } catch {
    return { qualityScore: 0, completenessScore: 0 };
  }
}

/**
 * Detect pre-filled values based on stored tracking or heuristics
 */
function detectPrefilledFields(examData: Record<string, any>): {
  prefilledFields: string[];
  actualMeasurementCount: number;
} {
  const isDefaultValues: Record<string, boolean> = examData._isDefaultValues || {};
  
  // Fields to check for pre-filled status
  const trackedFields = [
    { key: 'distPhoria', aliases: ['dist'] },
    { key: 'nearPhoria', aliases: ['near'] },
    { key: 'npc', aliases: [] },
    { key: 'vf', aliases: ['vergenceFacilityCpm', 'vergenceFacility'] },
    { key: 'biB', aliases: ['biBreak', 'nearBiBreak'] },
    { key: 'biR', aliases: ['nearBiRecovery'] },
    { key: 'boB', aliases: ['boBreak', 'nearBoBreak'] },
    { key: 'boR', aliases: ['nearBoRecovery'] },
    { key: 'distBiB', aliases: ['distBiBreak'] },
    { key: 'distBiR', aliases: ['distBiRecovery'] },
    { key: 'distBoB', aliases: ['distBoBreak'] },
    { key: 'distBoR', aliases: ['distBoRecovery'] },
  ];
  
  const prefilledFields: string[] = [];
  let actualMeasurementCount = 0;
  
  trackedFields.forEach(({ key, aliases }) => {
    // Check if this field has explicit tracking
    if (isDefaultValues[key] !== undefined) {
      if (isDefaultValues[key]) {
        prefilledFields.push(key);
      } else {
        actualMeasurementCount++;
      }
      return;
    }
    
    // Check aliases
    for (const alias of aliases) {
      if (isDefaultValues[alias] !== undefined) {
        if (isDefaultValues[alias]) {
          prefilledFields.push(key);
        } else {
          actualMeasurementCount++;
        }
        return;
      }
    }
    
    // If no explicit tracking, check if value exists and is non-null
    const value = examData[key] ?? examData[aliases[0]];
    if (value !== null && value !== undefined) {
      // Assume it's actual measurement if present without explicit tracking
      actualMeasurementCount++;
    }
  });
  
  return { prefilledFields, actualMeasurementCount };
}

/**
 * De-identify a single exam record
 */
export function deidentifyRecord(
  record: any,
  regionMap: Map<string, string>,
  userIdMap: Map<string, string>
): DeidentifiedRecord {
  const examData = (record.exam_data as Record<string, any>) || {};
  const { qualityScore, completenessScore } = calculateQualityScores({
    ...examData,
    age: record.age,
  });
  
  // Detect pre-filled fields
  const { prefilledFields, actualMeasurementCount } = detectPrefilledFields(examData);
  
  // Extract isDefaultValues tracking
  const isDefaultValues: Record<string, boolean> = examData._isDefaultValues || {};
  
  return {
    anonymous_user_id: generateAnonymousId(record.user_id, userIdMap),
    clinic_region: regionMap.get(record.user_id) || '',
    exam_year_month: coarsenDate(record.exam_date),
    age: record.age,
    gender: record.gender,
    
    // Clinical measurements from exam_data
    pd: examData.pd ?? null,
    ciss: examData.ciss ?? null,
    stereo: examData.stereo ?? null,
    npc: examData.npc ?? null,
    nra: examData.nra ?? null,
    pra: examData.pra ?? null,
    mem: examData.mem ?? null,
    aaOD: examData.aaOD ?? null,
    aaOS: examData.aaOS ?? null,
    flipper: examData.flipper ?? null,
    dist_phoria: examData.dist ?? examData.distPhoria ?? null,
    near_phoria: examData.near ?? examData.nearPhoria ?? null,
    vergence_facility: examData.vergenceFacility ?? examData.vf ?? null,
    
    // Fusional reserves - Near (blur/break/recovery)
    bi_blur: examData.biBlur ?? null,
    bi_break: examData.biB ?? examData.biBreak ?? null,
    bi_recovery: examData.biR ?? examData.biRecovery ?? null,
    bo_blur: examData.boBlur ?? null,
    bo_break: examData.boB ?? examData.boBreak ?? null,
    bo_recovery: examData.boR ?? examData.boRecovery ?? null,
    
    // Fusional reserves - Distance (blur/break/recovery)
    dist_bi_blur: examData.distBiBlur ?? null,
    dist_bi_break: examData.distBiB ?? examData.distBiBreak ?? null,
    dist_bi_recovery: examData.distBiR ?? examData.distBiRecovery ?? null,
    dist_bo_blur: examData.distBoBlur ?? null,
    dist_bo_break: examData.distBoB ?? examData.distBoBreak ?? null,
    dist_bo_recovery: examData.distBoR ?? examData.distBoRecovery ?? null,
    
    // Analysis results
    health_score: record.health_score ?? null,
    diagnostic_classification: record.diagnostic_classification ?? null,
    
    // Quality metrics
    data_quality_score: qualityScore,
    completeness_score: completenessScore,
    
    // Pre-filled value tracking
    prefilled_fields: prefilledFields.join(','),
    prefilled_field_count: prefilledFields.length,
    actual_measurement_count: actualMeasurementCount,
    
    // Individual prefilled tracking
    dist_phoria_is_default: isDefaultValues.distPhoria ?? isDefaultValues.dist ?? null,
    near_phoria_is_default: isDefaultValues.nearPhoria ?? isDefaultValues.near ?? null,
    npc_is_default: isDefaultValues.npc ?? null,
    vf_is_default: isDefaultValues.vf ?? isDefaultValues.vergenceFacility ?? null,
    bi_blur_is_default: isDefaultValues.biBlur ?? null,
    bi_break_is_default: isDefaultValues.biB ?? isDefaultValues.biBreak ?? null,
    bi_recovery_is_default: isDefaultValues.biR ?? isDefaultValues.biRecovery ?? null,
    bo_blur_is_default: isDefaultValues.boBlur ?? null,
    bo_break_is_default: isDefaultValues.boB ?? isDefaultValues.boBreak ?? null,
    bo_recovery_is_default: isDefaultValues.boR ?? isDefaultValues.boRecovery ?? null,
    dist_bi_blur_is_default: isDefaultValues.distBiBlur ?? null,
    dist_bi_break_is_default: isDefaultValues.distBiB ?? isDefaultValues.distBiBreak ?? null,
    dist_bi_recovery_is_default: isDefaultValues.distBiR ?? isDefaultValues.distBiRecovery ?? null,
    dist_bo_blur_is_default: isDefaultValues.distBoBlur ?? null,
    dist_bo_break_is_default: isDefaultValues.distBoB ?? isDefaultValues.distBoBreak ?? null,
    dist_bo_recovery_is_default: isDefaultValues.distBoR ?? isDefaultValues.distBoRecovery ?? null,
    
    // Medical History (6 CSV fields)
    ...exportMedicalHistoryToCSV(
      record.medical_history_simple as MedicalHistoryData | null
    ),
  };
}

// ============================================
// Export Functions
// ============================================

/**
 * Export research data with filters applied
 */
export async function exportResearchData(
  filters: ResearchExportFilters
): Promise<ExportResult> {
  try {
    // Step 1: Fetch profiles to build region map and whitelist set
    const { data: profiles, error: profilesError } = await supabase
      .from('optometrist_profiles')
      .select('user_id, clinic_region, research_qualified');
    
    if (profilesError) throw profilesError;
    
    // Build mappings
    const regionMap = new Map<string, string>();
    const whitelistSet = new Set<string>();
    
    profiles?.forEach(p => {
      regionMap.set(p.user_id, p.clinic_region);
      if (p.research_qualified) {
        whitelistSet.add(p.user_id);
      }
    });
    
    // Step 2: Determine which user_ids to include
    let eligibleUserIds: string[] = Array.from(regionMap.keys());
    
    // Apply whitelist filter
    if (filters.includeOnlyWhitelisted) {
      eligibleUserIds = eligibleUserIds.filter(uid => whitelistSet.has(uid));
    }
    
    // Apply region filter
    if (filters.regions && filters.regions.length > 0) {
      eligibleUserIds = eligibleUserIds.filter(uid => {
        const region = regionMap.get(uid);
        return region && filters.regions!.includes(region);
      });
    }
    
    if (eligibleUserIds.length === 0) {
      return { success: true, recordCount: 0, data: [] };
    }
    
    // Step 3: Build records query
    let query = supabase
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
        medical_history_simple
      `)
      .in('user_id', eligibleUserIds);
    
    // Apply date filters
    if (filters.startDate) {
      query = query.gte('exam_date', `${filters.startDate}-01`);
    }
    if (filters.endDate) {
      query = query.lte('exam_date', `${filters.endDate}-31`);
    }
    
    const { data: records, error: recordsError } = await query;
    if (recordsError) throw recordsError;
    
    // Step 4: De-identify records and apply quality filters
    const userIdMap = new Map<string, string>();
    let deidentifiedRecords = (records || []).map(record => 
      deidentifyRecord(record, regionMap, userIdMap)
    );
    
    // Apply quality score filter
    if (filters.minQualityScore && filters.minQualityScore > 0) {
      deidentifiedRecords = deidentifiedRecords.filter(
        r => (r.data_quality_score ?? 0) >= filters.minQualityScore!
      );
    }
    
    // Apply completeness score filter
    if (filters.minCompletenessScore && filters.minCompletenessScore > 0) {
      deidentifiedRecords = deidentifiedRecords.filter(
        r => (r.completeness_score ?? 0) >= filters.minCompletenessScore!
      );
    }
    
    // Apply diagnostic type filter
    if (filters.diagnosticTypes && filters.diagnosticTypes.length > 0) {
      deidentifiedRecords = deidentifiedRecords.filter(r => {
        const diagnosis = r.diagnostic_classification?.toUpperCase() || '';
        return filters.diagnosticTypes!.some(dt => 
          diagnosis.includes(dt.toUpperCase())
        );
      });
    }
    
    return {
      success: true,
      recordCount: deidentifiedRecords.length,
      data: deidentifiedRecords,
    };
  } catch (error: any) {
    console.error('Export research data error:', error);
    return {
      success: false,
      recordCount: 0,
      data: [],
      error: error.message || 'Export failed',
    };
  }
}

/**
 * Convert deidentified records to CSV format
 */
export function exportToCSV(records: DeidentifiedRecord[]): string {
  const headers = [
    'anonymous_user_id',
    'clinic_region',
    'exam_year_month',
    'age',
    'gender',
    'health_score',
    // Medical History (6 fields - placed after health_score for logical grouping)
    'MedHx_HasConditions',
    'MedHx_OcularList',
    'MedHx_SystemicList',
    'MedHx_HighRisk',
    'MedHx_RiskFactors',
    'MedHx_Notes',
    'diagnostic_classification',
    'data_quality_score',
    'completeness_score',
    'prefilled_fields',
    'prefilled_field_count',
    'actual_measurement_count',
    'pd',
    'ciss',
    'stereo',
    'npc',
    'nra',
    'pra',
    'mem',
    'aaOD',
    'aaOS',
    'flipper',
    'dist_phoria',
    'near_phoria',
    'vergence_facility',
    // Fusional reserves - Near (blur/break/recovery order)
    'bi_blur',
    'bi_break',
    'bi_recovery',
    'bo_blur',
    'bo_break',
    'bo_recovery',
    // Fusional reserves - Distance (blur/break/recovery order)
    'dist_bi_blur',
    'dist_bi_break',
    'dist_bi_recovery',
    'dist_bo_blur',
    'dist_bo_break',
    'dist_bo_recovery',
    // Prefilled tracking - individual fields
    'dist_phoria_is_default',
    'near_phoria_is_default',
    'npc_is_default',
    'vf_is_default',
    'bi_blur_is_default',
    'bi_break_is_default',
    'bi_recovery_is_default',
    'bo_blur_is_default',
    'bo_break_is_default',
    'bo_recovery_is_default',
    'dist_bi_blur_is_default',
    'dist_bi_break_is_default',
    'dist_bi_recovery_is_default',
    'dist_bo_blur_is_default',
    'dist_bo_break_is_default',
    'dist_bo_recovery_is_default',
  ];
  
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const rows = records.map(record => 
    headers.map(header => escapeCSV(record[header as keyof DeidentifiedRecord])).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Convert deidentified records to JSON format
 */
export function exportToJSON(records: DeidentifiedRecord[]): string {
  return JSON.stringify(records, null, 2);
}

/**
 * Trigger CSV download in browser
 */
export function downloadCSV(csvContent: string, filename?: string): void {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `research_data_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Trigger JSON download in browser
 */
export function downloadJSON(jsonContent: string, filename?: string): void {
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `research_data_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get available filter options from database
 */
export async function getFilterOptions(): Promise<{
  regions: string[];
  diagnosticTypes: string[];
  whitelistCount: number;
}> {
  try {
    const { data: profiles } = await supabase
      .from('optometrist_profiles')
      .select('clinic_region, research_qualified');
    
    const regions = [...new Set(profiles?.map(p => p.clinic_region).filter(Boolean) || [])].sort();
    const whitelistCount = profiles?.filter(p => p.research_qualified).length || 0;
    
    // Get unique diagnostic classifications
    const { data: records } = await supabase
      .from('exam_records')
      .select('diagnostic_classification')
      .not('diagnostic_classification', 'is', null);
    
    const diagnosticTypes = [...new Set(
      records?.map(r => r.diagnostic_classification).filter(Boolean) || []
    )].sort();
    
    return { regions, diagnosticTypes, whitelistCount };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return { regions: [], diagnosticTypes: [], whitelistCount: 0 };
  }
}

/**
 * Get record count for given filters (for preview)
 */
export async function getFilteredRecordCount(
  filters: ResearchExportFilters
): Promise<number> {
  const result = await exportResearchData(filters);
  return result.recordCount;
}
