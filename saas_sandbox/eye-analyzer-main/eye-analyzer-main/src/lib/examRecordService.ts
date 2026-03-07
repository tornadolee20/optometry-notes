import { supabase } from '@/integrations/supabase/client';
import { evaluateBinocularVision, ExamDataForScore } from './binocularRules';
import { Language } from './translations';
import { snellenToLogMAR } from './vaConverter';

export interface ExamRecord {
  id: string;
  user_id: string;
  patient_code: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  exam_date: string;
  exam_data: Record<string, any>;
  health_score: number | null;
  diagnostic_classification: string | null;
  treatment_plan: string | null;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Visual Acuity fields
  va_distance_ua_od_raw: string | null;
  va_distance_ua_od_logmar: number | null;
  va_distance_hc_od_raw: string | null;
  va_distance_hc_od_logmar: number | null;
  va_distance_bcva_od_raw: string | null;
  va_distance_bcva_od_logmar: number | null;
  va_distance_ua_os_raw: string | null;
  va_distance_ua_os_logmar: number | null;
  va_distance_hc_os_raw: string | null;
  va_distance_hc_os_logmar: number | null;
  va_distance_bcva_os_raw: string | null;
  va_distance_bcva_os_logmar: number | null;
  va_near_ua_od_raw: string | null;
  va_near_ua_od_logmar: number | null;
  va_near_hc_od_raw: string | null;
  va_near_hc_od_logmar: number | null;
  va_near_bcva_od_raw: string | null;
  va_near_bcva_od_logmar: number | null;
  va_near_ua_os_raw: string | null;
  va_near_ua_os_logmar: number | null;
  va_near_hc_os_raw: string | null;
  va_near_hc_os_logmar: number | null;
  va_near_bcva_os_raw: string | null;
  va_near_bcva_os_logmar: number | null;
  va_distance_test_meters: number | null;
  va_near_test_cm: number | null;
  va_correction_type: string | null;
  va_notes: string | null;
}

export interface ExamRecordInput {
  patient_code: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  exam_date?: string;
  exam_data: Record<string, any>;
  health_score?: number;
  diagnostic_classification?: string;
  treatment_plan?: string;
  follow_up_date?: string;
  notes?: string;
  // Visual Acuity fields
  va_distance_ua_od_raw?: string | null;
  va_distance_hc_od_raw?: string | null;
  va_distance_bcva_od_raw?: string | null;
  va_distance_ua_os_raw?: string | null;
  va_distance_hc_os_raw?: string | null;
  va_distance_bcva_os_raw?: string | null;
  va_near_ua_od_raw?: string | null;
  va_near_hc_od_raw?: string | null;
  va_near_bcva_od_raw?: string | null;
  va_near_ua_os_raw?: string | null;
  va_near_hc_os_raw?: string | null;
  va_near_bcva_os_raw?: string | null;
  va_distance_test_meters?: number | null;
  va_near_test_cm?: number | null;
  va_correction_type?: string | null;
  va_notes?: string | null;
}

// 從 exam_data 提取評估所需欄位
const extractExamDataForScore = (examData: Record<string, any>): ExamDataForScore => ({
  npc: examData.npc,
  cissScore: examData.cissScore,
  distPhoria: examData.distPhoria,
  nearPhoria: examData.nearPhoria,
  biBreak: examData.biBreak,
  boBreak: examData.boBreak,
  aaOD: examData.aaOD,
  aaOS: examData.aaOS,
  flipper: examData.flipper,
  mem: examData.mem,
  stereo: examData.stereo,
  vergenceFacilityCpm: examData.vergenceFacilityCpm,
  vergenceFacilityAborted: examData.vergenceFacilityAborted,
});

// 自動計算健康分數與診斷分類
const calculateScoreAndClassification = (
  examData: Record<string, any>,
  age: number,
  providedHealthScore?: number,
  providedClassification?: string
): { health_score: number; diagnostic_classification: string } => {
  // 如果已提供，優先使用提供的值
  if (providedHealthScore !== undefined && providedClassification !== undefined) {
    return {
      health_score: providedHealthScore,
      diagnostic_classification: providedClassification,
    };
  }
  
  const scoreData = extractExamDataForScore(examData);
  const evaluation = evaluateBinocularVision(scoreData, age);
  
  return {
    health_score: providedHealthScore ?? evaluation.healthScore,
    diagnostic_classification: providedClassification ?? evaluation.diagnosticCode,
  };
};

// Fetch all exam records for current user
export const fetchExamRecords = async (): Promise<ExamRecord[]> => {
  const { data, error } = await supabase
    .from('exam_records')
    .select('*')
    .order('exam_date', { ascending: false });

  if (error) {
    console.error('Error fetching exam records:', error);
    throw error;
  }

  return (data || []) as ExamRecord[];
};

// Fetch exam records for a specific patient (by patient_code)
export const fetchPatientHistory = async (patientCode: string): Promise<ExamRecord[]> => {
  const { data, error } = await supabase
    .from('exam_records')
    .select('*')
    .eq('patient_code', patientCode)
    .order('exam_date', { ascending: false });

  if (error) {
    console.error('Error fetching patient history:', error);
    throw error;
  }

  return (data || []) as ExamRecord[];
};

// Helper to build VA fields with auto-calculated logMAR
// Changed: Use hasValue check to handle null, undefined, and empty strings properly
const hasValue = (v: string | null | undefined): v is string => 
  v !== null && v !== undefined && v.trim() !== '';

const buildVAFields = (record: Partial<ExamRecordInput>) => {
  const vaFields: Record<string, any> = {};
  
  // Distance Vision - Only include fields that have actual values
  if (hasValue(record.va_distance_ua_od_raw)) {
    vaFields.va_distance_ua_od_raw = record.va_distance_ua_od_raw;
    vaFields.va_distance_ua_od_logmar = snellenToLogMAR(record.va_distance_ua_od_raw);
  }
  if (hasValue(record.va_distance_hc_od_raw)) {
    vaFields.va_distance_hc_od_raw = record.va_distance_hc_od_raw;
    vaFields.va_distance_hc_od_logmar = snellenToLogMAR(record.va_distance_hc_od_raw);
  }
  if (hasValue(record.va_distance_bcva_od_raw)) {
    vaFields.va_distance_bcva_od_raw = record.va_distance_bcva_od_raw;
    vaFields.va_distance_bcva_od_logmar = snellenToLogMAR(record.va_distance_bcva_od_raw);
  }
  if (hasValue(record.va_distance_ua_os_raw)) {
    vaFields.va_distance_ua_os_raw = record.va_distance_ua_os_raw;
    vaFields.va_distance_ua_os_logmar = snellenToLogMAR(record.va_distance_ua_os_raw);
  }
  if (hasValue(record.va_distance_hc_os_raw)) {
    vaFields.va_distance_hc_os_raw = record.va_distance_hc_os_raw;
    vaFields.va_distance_hc_os_logmar = snellenToLogMAR(record.va_distance_hc_os_raw);
  }
  if (hasValue(record.va_distance_bcva_os_raw)) {
    vaFields.va_distance_bcva_os_raw = record.va_distance_bcva_os_raw;
    vaFields.va_distance_bcva_os_logmar = snellenToLogMAR(record.va_distance_bcva_os_raw);
  }
  
  // Near Vision
  if (hasValue(record.va_near_ua_od_raw)) {
    vaFields.va_near_ua_od_raw = record.va_near_ua_od_raw;
    vaFields.va_near_ua_od_logmar = snellenToLogMAR(record.va_near_ua_od_raw);
  }
  if (hasValue(record.va_near_hc_od_raw)) {
    vaFields.va_near_hc_od_raw = record.va_near_hc_od_raw;
    vaFields.va_near_hc_od_logmar = snellenToLogMAR(record.va_near_hc_od_raw);
  }
  if (hasValue(record.va_near_bcva_od_raw)) {
    vaFields.va_near_bcva_od_raw = record.va_near_bcva_od_raw;
    vaFields.va_near_bcva_od_logmar = snellenToLogMAR(record.va_near_bcva_od_raw);
  }
  if (hasValue(record.va_near_ua_os_raw)) {
    vaFields.va_near_ua_os_raw = record.va_near_ua_os_raw;
    vaFields.va_near_ua_os_logmar = snellenToLogMAR(record.va_near_ua_os_raw);
  }
  if (hasValue(record.va_near_hc_os_raw)) {
    vaFields.va_near_hc_os_raw = record.va_near_hc_os_raw;
    vaFields.va_near_hc_os_logmar = snellenToLogMAR(record.va_near_hc_os_raw);
  }
  if (hasValue(record.va_near_bcva_os_raw)) {
    vaFields.va_near_bcva_os_raw = record.va_near_bcva_os_raw;
    vaFields.va_near_bcva_os_logmar = snellenToLogMAR(record.va_near_bcva_os_raw);
  }
  
  // Metadata - these use different checks
  if (record.va_distance_test_meters !== undefined && record.va_distance_test_meters !== null) {
    vaFields.va_distance_test_meters = record.va_distance_test_meters;
  }
  if (record.va_near_test_cm !== undefined && record.va_near_test_cm !== null) {
    vaFields.va_near_test_cm = record.va_near_test_cm;
  }
  if (hasValue(record.va_correction_type)) {
    vaFields.va_correction_type = record.va_correction_type;
  }
  if (hasValue(record.va_notes)) {
    vaFields.va_notes = record.va_notes;
  }
  
  return vaFields;
};

// Create a new exam record
export const createExamRecord = async (record: ExamRecordInput): Promise<ExamRecord> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // 自動計算健康分數與診斷分類
  const { health_score, diagnostic_classification } = calculateScoreAndClassification(
    record.exam_data,
    record.age,
    record.health_score,
    record.diagnostic_classification
  );

  // Build VA fields with auto-calculated logMAR
  const vaFields = buildVAFields(record);
  
  // Debug: Log VA fields being saved
  console.log('[examRecordService] VA fields received:', {
    va_distance_ua_od_raw: record.va_distance_ua_od_raw,
    va_distance_bcva_od_raw: record.va_distance_bcva_od_raw,
    va_distance_bcva_os_raw: record.va_distance_bcva_os_raw,
    va_near_bcva_od_raw: record.va_near_bcva_od_raw,
  });
  console.log('[examRecordService] VA fields to save:', vaFields);

  const insertData = {
    user_id: user.id,
    patient_code: record.patient_code,
    age: record.age,
    gender: record.gender,
    exam_date: record.exam_date || new Date().toISOString().split('T')[0],
    exam_data: record.exam_data,
    health_score,
    diagnostic_classification,
    treatment_plan: record.treatment_plan || null,
    follow_up_date: record.follow_up_date || null,
    notes: record.notes || null,
    // Medical history simple - extract from exam_data if present
    medical_history_simple: record.exam_data?.medical_history_simple || null,
    ...vaFields,
  };
  
  console.log('[examRecordService] Full insert data keys:', Object.keys(insertData));

  const { data, error } = await supabase
    .from('exam_records')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating exam record:', error);
    throw error;
  }

  return data as ExamRecord;
};

// Update an exam record
export const updateExamRecord = async (id: string, record: Partial<ExamRecordInput>): Promise<ExamRecord> => {
  // Build VA fields with auto-calculated logMAR
  const vaFields = buildVAFields(record);
  
  let updateData: Record<string, any> = {
    ...record,
    ...vaFields,
    updated_at: new Date().toISOString(),
  };

  // Remove raw VA fields from base record since we handle them separately
  const vaRawFields = [
    'va_distance_ua_od_raw', 'va_distance_hc_od_raw', 'va_distance_bcva_od_raw',
    'va_distance_ua_os_raw', 'va_distance_hc_os_raw', 'va_distance_bcva_os_raw',
    'va_near_ua_od_raw', 'va_near_hc_od_raw', 'va_near_bcva_od_raw',
    'va_near_ua_os_raw', 'va_near_hc_os_raw', 'va_near_bcva_os_raw',
    'va_distance_test_meters', 'va_near_test_cm', 'va_correction_type', 'va_notes'
  ];
  vaRawFields.forEach(field => {
    if (field in updateData && field in vaFields) {
      // Already handled in vaFields, no need to duplicate
    }
  });

  // 如果更新了 exam_data 或 age，重新計算健康分數與診斷
  if (record.exam_data && record.age !== undefined) {
    const { health_score, diagnostic_classification } = calculateScoreAndClassification(
      record.exam_data,
      record.age,
      record.health_score,
      record.diagnostic_classification
    );
    updateData.health_score = health_score;
    updateData.diagnostic_classification = diagnostic_classification;
  }

  const { data, error } = await supabase
    .from('exam_records')
    .update(updateData as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating exam record:', error);
    throw error;
  }

  return data as ExamRecord;
};

// Delete an exam record
export const deleteExamRecord = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('exam_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting exam record:', error);
    throw error;
  }
};

// Batch delete exam records
export const batchDeleteExamRecords = async (ids: string[]): Promise<void> => {
  const { error } = await supabase
    .from('exam_records')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('Error batch deleting exam records:', error);
    throw error;
  }
};

// Export to CSV
export const exportToCSV = (records: ExamRecord[], language: Language): string => {
  const headers = language === 'en' 
    ? [
        'Patient Code', 'Age', 'Gender', 'Exam Date', 'Health Score', 'Diagnosis',
        'Dist UA OD', 'Dist UA OS', 'Dist HC OD', 'Dist HC OS', 'Dist BCVA OD', 'Dist BCVA OS',
        'Near UA OD', 'Near UA OS', 'Near HC OD', 'Near HC OS', 'Near BCVA OD', 'Near BCVA OS',
        'Dist Test (m)', 'Near Test (cm)', 'Correction Type', 'VA Notes', 'Exam Data'
      ]
    : language === 'zh-CN' 
      ? [
          '客户编号', '年龄', '性别', '检查日期', '健康分数', '诊断分类',
          '远UA右眼', '远UA左眼', '远HC右眼', '远HC左眼', '远BCVA右眼', '远BCVA左眼',
          '近UA右眼', '近UA左眼', '近HC右眼', '近HC左眼', '近BCVA右眼', '近BCVA左眼',
          '远测距(m)', '近测距(cm)', '矫正方式', 'VA备注', '检查数据'
        ]
      : [
          '顧客編號', '年齡', '性別', '檢查日期', '健康分數', '診斷分類',
          '遠UA右眼', '遠UA左眼', '遠HC右眼', '遠HC左眼', '遠BCVA右眼', '遠BCVA左眼',
          '近UA右眼', '近UA左眼', '近HC右眼', '近HC左眼', '近BCVA右眼', '近BCVA左眼',
          '遠測距(m)', '近測距(cm)', '矯正方式', 'VA備註', '檢查數據'
        ];
  
  const genderMap = {
    male: language === 'en' ? 'Male' : '男',
    female: language === 'en' ? 'Female' : '女',
    other: language === 'en' ? 'Other' : '其他',
  };

  const rows = records.map(record => [
    record.patient_code,
    record.age.toString(),
    genderMap[record.gender] || record.gender,
    record.exam_date,
    record.health_score?.toString() || '',
    record.diagnostic_classification || '',
    // Visual Acuity fields
    record.va_distance_ua_od_raw || '',
    record.va_distance_ua_os_raw || '',
    record.va_distance_hc_od_raw || '',
    record.va_distance_hc_os_raw || '',
    record.va_distance_bcva_od_raw || '',
    record.va_distance_bcva_os_raw || '',
    record.va_near_ua_od_raw || '',
    record.va_near_ua_os_raw || '',
    record.va_near_hc_od_raw || '',
    record.va_near_hc_os_raw || '',
    record.va_near_bcva_od_raw || '',
    record.va_near_bcva_os_raw || '',
    record.va_distance_test_meters?.toString() || '',
    record.va_near_test_cm?.toString() || '',
    record.va_correction_type || '',
    record.va_notes || '',
    JSON.stringify(record.exam_data),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return '\ufeff' + csvContent; // Add BOM for Excel UTF-8 compatibility
};

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Parse CSV file
export const parseCSV = (csvText: string): string[][] => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  const result: string[][] = [];
  
  for (const line of lines) {
    const row: string[] = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          cell += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          cell += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          row.push(cell.trim());
          cell = '';
        } else {
          cell += char;
        }
      }
    }
    row.push(cell.trim());
    result.push(row);
  }
  
  return result;
};

// Import from CSV
export const importFromCSV = async (csvText: string): Promise<number> => {
  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  // Map headers to field indices
  const patientCodeIdx = headers.findIndex(h => 
    h.includes('顧客編號') || h.includes('客户编号') || h.toLowerCase().includes('patient_code')
  );
  const ageIdx = headers.findIndex(h => 
    h.includes('年齡') || h.includes('年龄') || h.toLowerCase().includes('age')
  );
  const genderIdx = headers.findIndex(h => 
    h.includes('性別') || h.includes('性别') || h.toLowerCase().includes('gender')
  );
  const dateIdx = headers.findIndex(h => 
    h.includes('檢查日期') || h.includes('检查日期') || h.toLowerCase().includes('exam_date')
  );
  const scoreIdx = headers.findIndex(h => 
    h.includes('健康分數') || h.includes('健康分数') || h.toLowerCase().includes('health_score')
  );
  const diagIdx = headers.findIndex(h => 
    h.includes('診斷') || h.includes('诊断') || h.toLowerCase().includes('diagnostic')
  );
  const dataIdx = headers.findIndex(h => 
    h.includes('檢查數據') || h.includes('检查数据') || h.toLowerCase().includes('exam_data')
  );

  if (patientCodeIdx === -1 || ageIdx === -1 || genderIdx === -1) {
    throw new Error('Required columns not found: patient_code, age, gender');
  }

  const genderMap: Record<string, 'male' | 'female' | 'other'> = {
    '男': 'male',
    '女': 'female',
    '其他': 'other',
    'male': 'male',
    'female': 'female',
    'other': 'other',
  };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let importedCount = 0;
  
  for (const row of dataRows) {
    if (row.length < 3) continue;
    
    const patientCode = row[patientCodeIdx];
    const age = parseInt(row[ageIdx], 10);
    const genderRaw = row[genderIdx];
    const gender = genderMap[genderRaw] || 'other';
    const examDate = dateIdx >= 0 && row[dateIdx] ? row[dateIdx] : new Date().toISOString().split('T')[0];
    const healthScore = scoreIdx >= 0 && row[scoreIdx] ? parseInt(row[scoreIdx], 10) : null;
    const diagnostic = diagIdx >= 0 ? row[diagIdx] : null;
    
    let examData = {};
    if (dataIdx >= 0 && row[dataIdx]) {
      try {
        examData = JSON.parse(row[dataIdx]);
      } catch {
        examData = {};
      }
    }

    if (!patientCode || isNaN(age)) continue;

    try {
      await supabase.from('exam_records').insert({
        user_id: user.id,
        patient_code: patientCode,
        age,
        gender,
        exam_date: examDate,
        exam_data: examData,
        health_score: healthScore,
        diagnostic_classification: diagnostic,
      } as any);
      importedCount++;
    } catch (err) {
      console.error('Error importing row:', err);
    }
  }

  return importedCount;
};
