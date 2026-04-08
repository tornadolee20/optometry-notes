import { MemberSummary, ClinicVisit, CISSAssessment, OptometryRecord, OphthalmologyRecord } from '@/types';

export const mockMembers: MemberSummary[] = [
  {
    profile: {
      id: '1',
      user_id: 'u1',
      name: '小明',
      birth_date: '2016-03-15',
      gender: 'male',
      role: 'child',
    },
    latestSphere_R: -2.75,
    latestSphere_L: -2.50,
    latestCylinder_R: -0.75,
    prevSphere_R: -2.50,
    prevSphere_L: -2.25,
    daysSinceLastVisit: 45,
    nextExamDate: '2026-05-01',
    isOverdue: false,
    hasVisionRiskMeds: false,
    latestClinicType: 'ophthalmology',
  },
  {
    profile: {
      id: '2',
      user_id: 'u1',
      name: '媽媽',
      birth_date: '1988-07-20',
      gender: 'female',
      role: 'self',
    },
    latestSphere_R: -4.50,
    latestSphere_L: -4.25,
    latestCylinder_R: -1.00,
    prevSphere_R: -4.50,
    prevSphere_L: -4.25,
    daysSinceLastVisit: 200,
    isOverdue: false,
    hasVisionRiskMeds: false,
    latestClinicType: 'optometry',
  },
  {
    profile: {
      id: '3',
      user_id: 'u1',
      name: '阿嬤',
      birth_date: '1955-11-08',
      gender: 'female',
      role: 'elderly',
      height_cm: 155,
    },
    latestSphere_R: -1.25,
    latestSphere_L: -1.50,
    latestCylinder_R: -0.50,
    prevSphere_R: -1.00,
    prevSphere_L: -1.25,
    daysSinceLastVisit: 200,
    isOverdue: true,
    hasVisionRiskMeds: true,
    latestClinicType: 'ophthalmology',
  },
];

export const mockVisits: ClinicVisit[] = [
  // 小明
  { id: 'v1', profile_id: '1', visit_date: '2026-02-10', clinic_type: 'ophthalmology', clinic_name: '光明眼科' },
  { id: 'v2', profile_id: '1', visit_date: '2025-11-05', clinic_type: 'ophthalmology', clinic_name: '光明眼科' },
  { id: 'v3', profile_id: '1', visit_date: '2025-08-01', clinic_type: 'optometry', clinic_name: '明視驗光所' },
  { id: 'v6', profile_id: '1', visit_date: '2025-05-10', clinic_type: 'ophthalmology', clinic_name: '光明眼科' },
  { id: 'v7', profile_id: '1', visit_date: '2025-02-15', clinic_type: 'ophthalmology', clinic_name: '光明眼科' },
  // 媽媽
  { id: 'v4', profile_id: '2', visit_date: '2025-09-15', clinic_type: 'optometry', clinic_name: '清晰驗光所' },
  { id: 'v8', profile_id: '2', visit_date: '2025-03-10', clinic_type: 'optometry', clinic_name: '清晰驗光所' },
  { id: 'v9', profile_id: '2', visit_date: '2024-09-20', clinic_type: 'ophthalmology', clinic_name: '台大眼科' },
  // 阿嬤
  { id: 'v5', profile_id: '3', visit_date: '2025-09-20', clinic_type: 'ophthalmology', clinic_name: '大學眼科' },
  { id: 'v10', profile_id: '3', visit_date: '2025-03-15', clinic_type: 'ophthalmology', clinic_name: '大學眼科' },
  { id: 'v11', profile_id: '3', visit_date: '2024-09-10', clinic_type: 'ophthalmology', clinic_name: '大學眼科' },
];

export const mockOptometryRecords: Partial<OptometryRecord & { clinic_visit_id: string }>[] = [
  {
    id: 'opt1', clinic_visit_id: 'v3',
    manifest_R_sphere: -2.50, manifest_L_sphere: -2.25,
    manifest_R_cylinder: -0.75, manifest_L_cylinder: -0.50,
    manifest_R_axis: 180, manifest_L_axis: 175,
    k1_R: 43.25, k2_R: 44.50, k1_L: 43.00, k2_L: 44.25,
    
  },
  {
    id: 'opt2', clinic_visit_id: 'v4',
    manifest_R_sphere: -4.25, manifest_L_sphere: -4.00,
    manifest_R_cylinder: -1.00, manifest_L_cylinder: -0.75,
    k1_R: 42.50, k2_R: 43.75, k1_L: 42.75, k2_L: 43.50,
  },
  {
    id: 'opt3', clinic_visit_id: 'v8',
    manifest_R_sphere: -4.25, manifest_L_sphere: -4.00,
    manifest_R_cylinder: -1.00, manifest_L_cylinder: -0.75,
    k1_R: 42.50, k2_R: 43.75, k1_L: 42.75, k2_L: 43.50,
  },
];

// Ophthalmology records with cycloplegic refraction sphere data
export const mockOphthalmologyRecords: Partial<OphthalmologyRecord & { clinic_visit_id: string }>[] = [
  // 小明
  { id: 'oph1', clinic_visit_id: 'v1', cycloplegic_R_sphere: -2.75, cycloplegic_L_sphere: -2.50, cycloplegic_R_cylinder: -0.75, cycloplegic_L_cylinder: -0.50 },
  { id: 'oph2', clinic_visit_id: 'v2', cycloplegic_R_sphere: -2.50, cycloplegic_L_sphere: -2.25, cycloplegic_R_cylinder: -0.75, cycloplegic_L_cylinder: -0.50 },
  { id: 'oph3', clinic_visit_id: 'v6', cycloplegic_R_sphere: -2.25, cycloplegic_L_sphere: -2.00, cycloplegic_R_cylinder: -0.50, cycloplegic_L_cylinder: -0.50 },
  { id: 'oph4', clinic_visit_id: 'v7', cycloplegic_R_sphere: -2.00, cycloplegic_L_sphere: -1.75, cycloplegic_R_cylinder: -0.50, cycloplegic_L_cylinder: -0.25 },
  // 媽媽
  { id: 'oph5', clinic_visit_id: 'v9', cycloplegic_R_sphere: -4.50, cycloplegic_L_sphere: -4.25, cycloplegic_R_cylinder: -1.00, cycloplegic_L_cylinder: -0.75 },
  // 阿嬤
  { id: 'oph6', clinic_visit_id: 'v5', cycloplegic_R_sphere: -1.25, cycloplegic_L_sphere: -1.50, cycloplegic_R_cylinder: -0.50, cycloplegic_L_cylinder: -0.50 },
  { id: 'oph7', clinic_visit_id: 'v10', cycloplegic_R_sphere: -1.00, cycloplegic_L_sphere: -1.25, cycloplegic_R_cylinder: -0.50, cycloplegic_L_cylinder: -0.50 },
  { id: 'oph8', clinic_visit_id: 'v11', cycloplegic_R_sphere: -0.75, cycloplegic_L_sphere: -1.00, cycloplegic_R_cylinder: -0.25, cycloplegic_L_cylinder: -0.25 },
];

export const mockCISSScores: CISSAssessment[] = [
  { id: 'c1', profile_id: '1', assessment_date: '2026-01-15', scores: [2,1,1,2,1,2,1,1,0,2,2,1,1,1,1], total_score: 19, risk_level: 'moderate' },
  { id: 'c2', profile_id: '1', assessment_date: '2025-07-10', scores: [1,1,0,1,0,1,1,0,0,1,1,0,1,0,1], total_score: 9, risk_level: 'low' },
];

export const cissQuestions = [
  '閱讀或近距離工作時，眼睛會疲勞嗎？',
  '閱讀或近距離工作時，眼睛會不舒服嗎？',
  '閱讀或近距離工作時，會頭痛嗎？',
  '閱讀或近距離工作時，字會變模糊嗎？',
  '閱讀或近距離工作時，字會移動、跳動或飄浮嗎？',
  '閱讀時感覺困倦嗎？',
  '閱讀時注意力難以集中嗎？',
  '閱讀時難以記住剛剛讀過的內容嗎？',
  '閱讀時會有重影嗎？',
  '從書本抬頭看遠處時，需要很久才能對焦清楚嗎？',
  '從遠處改看近處時，需要很久才能對焦清楚嗎？',
  '近距離工作時，眼睛或眼皮有痠痛感嗎？',
  '近距離工作時，視覺感覺不舒服嗎？',
  '讀完書後感覺眼睛緊繃嗎？',
  '讀完書後視力變模糊嗎？',
];

export const getRoleBadge = (role: string) => {
  switch (role) {
    case 'child': return { icon: '👶', label: '孩子' };
    case 'self': return { icon: '🧑', label: '自己' };
    case 'elderly': return { icon: '👴', label: '長輩' };
    default: return { icon: '👤', label: '成員' };
  }
};

export const getAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const getOverdueThreshold = (role: string) => {
  switch (role) {
    case 'child': return 90;
    case 'elderly': return 180;
    default: return 365;
  }
};
