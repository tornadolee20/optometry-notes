/**
 * Visual Acuity Options Constants
 * 
 * Standard Snellen decimal values and correction type options
 * for clinical visual acuity measurements.
 */

export interface VAOption {
  label: string;
  value: string;
  labelEn?: string;
}

/**
 * Standard visual acuity options in Snellen decimal notation
 * Ranges from 1.5 (excellent) to NLP (no light perception)
 */
export const VA_OPTIONS: VAOption[] = [
  { label: "未測", value: "", labelEn: "Not tested" },
  { label: "1.5", value: "1.5" },
  { label: "1.2", value: "1.2" },
  { label: "1.0", value: "1.0" },
  { label: "0.9", value: "0.9" },
  { label: "0.8", value: "0.8" },
  { label: "0.7", value: "0.7" },
  { label: "0.6", value: "0.6" },
  { label: "0.5", value: "0.5" },
  { label: "0.4", value: "0.4" },
  { label: "0.3", value: "0.3" },
  { label: "0.2", value: "0.2" },
  { label: "0.15", value: "0.15" },
  { label: "0.1", value: "0.1" },
  { label: "<0.1", value: "0.05", labelEn: "<0.1" },
  { label: "數指 (CF)", value: "CF", labelEn: "Counting Fingers" },
  { label: "手動 (HM)", value: "HM", labelEn: "Hand Motion" },
  { label: "光感 (LP)", value: "LP", labelEn: "Light Perception" },
  { label: "無光感 (NLP)", value: "NLP", labelEn: "No Light Perception" },
];

/**
 * Correction type options for visual acuity testing
 */
export const CORRECTION_TYPE_OPTIONS: VAOption[] = [
  { label: "試鏡架", value: "trial_frame", labelEn: "Trial Frame" },
  { label: "原本眼鏡", value: "spectacles", labelEn: "Spectacles" },
  { label: "隱形眼鏡", value: "contact_lens", labelEn: "Contact Lens" },
];

/**
 * Get the display label for a VA value based on language
 */
export function getVALabel(value: string | null | undefined, language: string = 'zh-TW'): string {
  if (!value || value === '') return "—";
  
  const option = VA_OPTIONS.find(o => o.value === value);
  if (!option) return value;
  
  if (language === 'en' && option.labelEn) {
    return option.labelEn;
  }
  
  return option.label;
}

/**
 * Get the display label for a correction type based on language
 */
export function getCorrectionTypeLabel(value: string | null | undefined, language: string = 'zh-TW'): string {
  if (!value || value === '') return "—";
  
  const option = CORRECTION_TYPE_OPTIONS.find(o => o.value === value);
  if (!option) return value;
  
  if (language === 'en' && option.labelEn) {
    return option.labelEn;
  }
  
  return option.label;
}

/**
 * Get localized VA options for Select component
 */
export function getLocalizedVAOptions(language: string = 'zh-TW'): VAOption[] {
  return VA_OPTIONS.map(option => ({
    ...option,
    label: language === 'en' && option.labelEn ? option.labelEn : option.label
  }));
}

/**
 * Get localized correction type options for RadioGroup
 */
export function getLocalizedCorrectionTypeOptions(language: string = 'zh-TW'): VAOption[] {
  return CORRECTION_TYPE_OPTIONS.map(option => ({
    ...option,
    label: language === 'en' && option.labelEn ? option.labelEn : option.label
  }));
}
