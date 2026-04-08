import { getAge } from '@/data/mockData';

/**
 * Queirós 2022 axial length estimation formula
 * AL = 0.019 × Age + 2.271 × Rm − 0.444 × SE + 5.414
 * where Rm = mean corneal radius in mm = 337.5 / Km
 * Km = (K1 + K2) / 2 (in diopters), SE = sphere + cylinder / 2
 */
export const estimateAxialLength = (
  k1: number,
  k2: number,
  sphere: number,
  cylinder: number,
  birthDate: string,
): number => {
  const age = getAge(birthDate);
  const kmD = (k1 + k2) / 2; // mean keratometry in diopters
  const rm = 337.5 / kmD;     // convert to corneal radius in mm
  const se = sphere + cylinder / 2;
  return 0.019 * age + 2.271 * rm - 0.444 * se + 5.414;
};

export interface EstimatedAL {
  right?: number;
  left?: number;
  kmRight?: number;
  kmLeft?: number;
}

export interface ALGrowth {
  eye: 'R' | 'L';
  current: number;
  previous: number;
  annualChange: number;
  isWarning: boolean;
}

/**
 * Calculate annual AL growth rate
 * Only valid when gap >= 300 days
 */
export const calcAnnualGrowth = (
  current: number,
  previous: number,
  daysBetween: number,
): { annualChange: number; isWarning: boolean } | null => {
  if (daysBetween < 300) return null;
  const annualChange = ((current - previous) / daysBetween) * 365;
  return { annualChange, isWarning: annualChange > 0.2 };
};
