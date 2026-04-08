export type Role = 'child' | 'self' | 'elderly';
export type ClinicType = 'ophthalmology' | 'optometry';
export type ControlType = 'none' | 'atropine_001' | 'atropine_005' | 'orthokeratology' | 'myopia_control_lens';
export type LensType = 'single_vision' | 'bifocal' | 'progressive' | 'DIMS' | 'HAL' | 'peripheral_defocus' | 'orthokeratology_lens' | 'other';
export type NotificationType = 'exam_due' | 'lens_check' | 'medication_check';
export type NotificationStatus = 'pending' | 'sent' | 'skipped';
export type CataractGrade = 'none' | 'mild' | 'observe' | 'operable';
export type RetinalExam = 'normal' | 'follow_up' | 'abnormal';
export type RiskLevel = 'low' | 'moderate' | 'high';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  gender: 'male' | 'female';
  role: Role;
  height_cm?: number;
}

export interface ClinicVisit {
  id: string;
  profile_id: string;
  visit_date: string;
  clinic_type: ClinicType;
  clinic_name: string;
  notes?: string;
}

export interface OphthalmologyRecord {
  id: string;
  clinic_visit_id: string;
  cycloplegic_R_sphere?: number;
  cycloplegic_L_sphere?: number;
  cycloplegic_R_cylinder?: number;
  cycloplegic_L_cylinder?: number;
  cycloplegic_R_axis?: number;
  cycloplegic_L_axis?: number;
  axial_length_R?: number;
  axial_length_L?: number;
  iop_R?: number;
  iop_L?: number;
  cataract_R?: CataractGrade;
  cataract_L?: CataractGrade;
  retinal_exam?: RetinalExam;
  amd_grade?: string;
  dr_grade?: string;
  control_type?: ControlType;
  atropine_frequency?: string;
  follow_up_interval_days?: number; // 醫師建議回診間隔（天）
  doctor_notes?: string;            // 醫師備註
}

export interface OptometryRecord {
  id: string;
  clinic_visit_id: string;
  manifest_R_sphere?: number;
  manifest_L_sphere?: number;
  manifest_R_cylinder?: number;
  manifest_L_cylinder?: number;
  manifest_R_axis?: number;
  manifest_L_axis?: number;
  rx_R_sphere?: number;
  rx_L_sphere?: number;
  rx_R_cylinder?: number;
  rx_L_cylinder?: number;
  rx_R_axis?: number;
  rx_L_axis?: number;
  pd_distance?: number;
  pd_near?: number;
  lens_type?: LensType;             // 強化型別，含 DIMS/HAL
  k1_R?: number;
  k2_R?: number;
  k1_L?: number;
  k2_L?: number;
  km_R?: number;
  km_L?: number;
  est_al_R?: number;
  est_al_L?: number;
  tbut?: number;
  schirmer_test?: number;
  follow_up_interval_days?: number; // 驗光師建議回診間隔（天）
}

export interface CISSAssessment {
  id: string;
  profile_id: string;
  assessment_date: string;
  scores: number[];
  total_score: number;
  risk_level: RiskLevel;
}

export interface ChronicCondition {
  id: string;
  profile_id: string;
  condition: string;
  other_description?: string;
  diagnosed_year?: number;
}

export interface Medication {
  id: string;
  profile_id: string;
  drug_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  vision_risk: boolean;
}

export interface MemberSummary {
  profile: Profile;
  latestSphere_R?: number;
  latestSphere_L?: number;
  latestCylinder_R?: number;
  prevSphere_R?: number;
  prevSphere_L?: number;
  daysSinceLastVisit?: number;
  // 雙軌各自獨立追蹤，未使用的軌道不顯示
  nextOphthalmologyDate?: string;
  nextOptometryDate?: string;
  isOphthalmologyOverdue: boolean;
  isOptometryOverdue: boolean;
  hasVisionRiskMeds: boolean;
  latestClinicType?: ClinicType;
}

export interface FollowUpNotification {
  id: string;
  profile_id: string;
  clinic_visit_id: string;
  trigger_date: string;
  notification_type: NotificationType;
  source_track: ClinicType;
  status: NotificationStatus;
  sent_at?: string;
  created_at: string;
}
