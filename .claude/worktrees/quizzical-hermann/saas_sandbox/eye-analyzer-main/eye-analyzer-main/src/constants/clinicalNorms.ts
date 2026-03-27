// Clinical Norms for Binocular Vision Analysis
// Based on Morgan norms, Wajuihian 2018, and other validated research

export interface FusionalReserveNorms {
  blur: number | null;
  break: number;
  recovery: number;
}

export interface FusionalReservesSet {
  bi: FusionalReserveNorms;
  bo: FusionalReserveNorms;
}

export interface ClinicalNormsType {
  phoria: {
    distance: number;
    near: number;
  };
  npc: (age: number) => number;
  vf: (age: number) => number;
  fusionalReserves: {
    near: FusionalReservesSet;
    distance: FusionalReservesSet;
  };
  // Ranges for validation (min-max)
  ranges: {
    near: {
      bi: { blur: [number, number]; break: [number, number]; recovery: [number, number] };
      bo: { blur: [number, number]; break: [number, number]; recovery: [number, number] };
    };
    distance: {
      bi: { blur: [number, number]; break: [number, number]; recovery: [number, number] };
      bo: { blur: [number, number]; break: [number, number]; recovery: [number, number] };
    };
  };
}

export const CLINICAL_NORMS: ClinicalNormsType = {
  // Morgan norms for phoria
  phoria: {
    distance: 0,    // Ortho at distance
    near: -6        // 6Δ exophoria at near (negative = exo)
  },
  
  // NPC based on age (in cm)
  npc: (age: number): number => {
    if (age < 40) return 5;
    if (age < 50) return 6;
    if (age < 60) return 7;
    return 8;
  },
  
  // Vergence Facility based on age (cpm)
  vf: (age: number): number => {
    if (age < 40) return 15;
    if (age < 60) return 12;
    return 9;
  },
  
  // Fusional reserve standard values (Wajuihian 2018 for near, Morgan for distance)
  fusionalReserves: {
    near: {
      bi: { blur: null, break: 21, recovery: 13 },   // Wajuihian 2018: 13/21/13
      bo: { blur: 17, break: 21, recovery: 11 }      // Wajuihian 2018: 17/21/11
    },
    distance: {
      bi: { blur: null, break: 7, recovery: 4 },     // Morgan: X/7/4
      bo: { blur: null, break: 18, recovery: 10 }    // Morgan: 9/18/10 (using break as main)
    }
  },
  
  // Input validation ranges
  ranges: {
    near: {
      bi: { blur: [0, 30], break: [0, 30], recovery: [0, 25] },
      bo: { blur: [0, 45], break: [0, 45], recovery: [0, 35] }
    },
    distance: {
      bi: { blur: [0, 15], break: [0, 15], recovery: [0, 10] },
      bo: { blur: [0, 35], break: [0, 35], recovery: [0, 20] }
    }
  }
};

// Normal ranges with standard deviations for display
export const FUSIONAL_RESERVE_NORMS = {
  near: {
    bi: {
      break: { mean: 21, sd: 4, range: '12-23Δ', source: 'Wajuihian 2018' },
      recovery: { mean: 13, sd: 5, range: '8-17Δ', source: 'Wajuihian 2018' }
    },
    bo: {
      blur: { mean: 17, sd: 5, range: '12-22Δ', source: 'Wajuihian 2018' },
      break: { mean: 21, sd: 6, range: '16-35Δ', source: 'Wajuihian 2018' },
      recovery: { mean: 11, sd: 7, range: '11-24Δ', source: 'Wajuihian 2018' }
    }
  },
  distance: {
    bi: {
      break: { mean: 7, sd: 3, range: '4-10Δ', source: 'Morgan; COMET' },
      recovery: { mean: 4, sd: 2, range: '2-6Δ', source: 'Morgan; COMET' }
    },
    bo: {
      blur: { mean: 9, sd: 4, range: '5-13Δ', source: 'Morgan; COMET' },
      break: { mean: 18, sd: 5, range: '11-27Δ', source: 'Morgan; COMET' },
      recovery: { mean: 10, sd: 4, range: '6-14Δ', source: 'Morgan; COMET' }
    }
  }
};

// Field classification for data quality validation
export type FieldPriority = 'critical' | 'important' | 'optional';

export interface FieldDefinition {
  key: string;
  priority: FieldPriority;
  labelZhTW: string;
  labelZhCN: string;
  labelEn: string;
}

export const FUSIONAL_FIELD_DEFINITIONS: FieldDefinition[] = [
  // Near BI
  { key: 'biBl', priority: 'optional', labelZhTW: '近距 BI 模糊', labelZhCN: '近距 BI 模糊', labelEn: 'Near BI Blur' },
  { key: 'biB', priority: 'critical', labelZhTW: '近距 BI 破裂', labelZhCN: '近距 BI 破裂', labelEn: 'Near BI Break' },
  { key: 'biR', priority: 'important', labelZhTW: '近距 BI 恢復', labelZhCN: '近距 BI 恢复', labelEn: 'Near BI Recovery' },
  // Near BO
  { key: 'boBl', priority: 'optional', labelZhTW: '近距 BO 模糊', labelZhCN: '近距 BO 模糊', labelEn: 'Near BO Blur' },
  { key: 'boB', priority: 'critical', labelZhTW: '近距 BO 破裂', labelZhCN: '近距 BO 破裂', labelEn: 'Near BO Break' },
  { key: 'boR', priority: 'important', labelZhTW: '近距 BO 恢復', labelZhCN: '近距 BO 恢复', labelEn: 'Near BO Recovery' },
  // Distance BI
  { key: 'distBiBl', priority: 'optional', labelZhTW: '遠距 BI 模糊', labelZhCN: '远距 BI 模糊', labelEn: 'Dist BI Blur' },
  { key: 'distBiB', priority: 'important', labelZhTW: '遠距 BI 破裂', labelZhCN: '远距 BI 破裂', labelEn: 'Dist BI Break' },
  { key: 'distBiR', priority: 'optional', labelZhTW: '遠距 BI 恢復', labelZhCN: '远距 BI 恢复', labelEn: 'Dist BI Recovery' },
  // Distance BO
  { key: 'distBoBl', priority: 'optional', labelZhTW: '遠距 BO 模糊', labelZhCN: '远距 BO 模糊', labelEn: 'Dist BO Blur' },
  { key: 'distBoB', priority: 'important', labelZhTW: '遠距 BO 破裂', labelZhCN: '远距 BO 破裂', labelEn: 'Dist BO Break' },
  { key: 'distBoR', priority: 'optional', labelZhTW: '遠距 BO 恢復', labelZhCN: '远距 BO 恢复', labelEn: 'Dist BO Recovery' },
];

// Helper to get default fusional reserve values
export function getDefaultFusionalReserves(distance: 'near' | 'distance', type: 'bi' | 'bo') {
  return CLINICAL_NORMS.fusionalReserves[distance][type];
}

// Helper to get norm display string
export function getNormDisplayString(
  distance: 'near' | 'distance', 
  type: 'bi' | 'bo', 
  field: 'blur' | 'break' | 'recovery'
): string | null {
  const norms = FUSIONAL_RESERVE_NORMS[distance][type] as Record<string, { mean: number; sd: number; range: string } | undefined>;
  const norm = norms[field];
  if (!norm) return null;
  return `${norm.mean}±${norm.sd}`;
}

// Get age-based norms
export function getAgeBasedNorms(age: number) {
  return {
    npc: CLINICAL_NORMS.npc(age),
    vf: CLINICAL_NORMS.vf(age),
    distPhoria: CLINICAL_NORMS.phoria.distance,
    nearPhoria: CLINICAL_NORMS.phoria.near,
    near: CLINICAL_NORMS.fusionalReserves.near,
    distance: CLINICAL_NORMS.fusionalReserves.distance,
  };
}

// Field tiers for data quality
export const FIELD_TIERS = {
  CRITICAL: ['distPhoria', 'nearPhoria', 'npc', 'biB', 'boB'],
  IMPORTANT: ['vf', 'biR', 'boR', 'distBiB', 'distBoB'],
  OPTIONAL: ['biBl', 'boBl', 'distBiBl', 'distBoBl', 'distBiR', 'distBoR'],
} as const;
