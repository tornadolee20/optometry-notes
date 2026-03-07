/**
 * Visual Acuity Converter Utilities
 * 
 * Provides conversion between Snellen decimal and logMAR notation.
 * Low vision values based on Holladay 2004 and Schulze-Bonsel 2006.
 */

// Low vision logMAR equivalents (internationally recognized standards)
export const LOW_VISION_MAP: Record<string, number> = {
  "CF": 2.0,   // Counting Fingers (數指)
  "HM": 2.3,   // Hand Motion (手動)
  "LP": 2.6,   // Light Perception (光感)
  "NLP": 3.0,  // No Light Perception (無光感)
};

/**
 * Convert Snellen decimal notation to logMAR
 * @param snellen - Snellen decimal value (e.g., "1.0", "0.5") or low vision code (e.g., "CF", "HM")
 * @returns logMAR value or null if invalid
 */
export function snellenToLogMAR(snellen: string | null | undefined): number | null {
  if (!snellen || snellen.trim() === '') return null;
  
  const trimmed = snellen.trim().toUpperCase();
  
  // Handle low vision special values
  if (LOW_VISION_MAP[trimmed] !== undefined) {
    return LOW_VISION_MAP[trimmed];
  }
  
  // Handle standard Snellen decimal
  const decimal = parseFloat(snellen);
  if (isNaN(decimal) || decimal <= 0) return null;
  
  // logMAR = -log10(Snellen decimal)
  return parseFloat((-Math.log10(decimal)).toFixed(2));
}

/**
 * Convert logMAR to Snellen decimal notation
 * @param logmar - logMAR value
 * @returns Snellen decimal string or low vision code
 */
export function logMARToSnellen(logmar: number | null | undefined): string | null {
  if (logmar === null || logmar === undefined) return null;
  
  // Low vision range detection
  if (logmar >= 2.9) return "NLP";
  if (logmar >= 2.4) return "LP";
  if (logmar >= 2.1) return "HM";
  if (logmar >= 1.9) return "CF";
  
  // Standard conversion: Snellen = 10^(-logMAR)
  const snellen = Math.pow(10, -logmar);
  return snellen.toFixed(2);
}

/**
 * Visual Acuity data structure for summary generation
 */
export interface VAData {
  va_distance_ua_od_raw?: string | null;
  va_distance_ua_os_raw?: string | null;
  va_distance_hc_od_raw?: string | null;
  va_distance_hc_os_raw?: string | null;
  va_distance_bcva_od_raw?: string | null;
  va_distance_bcva_os_raw?: string | null;
  va_near_ua_od_raw?: string | null;
  va_near_ua_os_raw?: string | null;
  va_near_hc_od_raw?: string | null;
  va_near_hc_os_raw?: string | null;
  va_near_bcva_od_raw?: string | null;
  va_near_bcva_os_raw?: string | null;
}

/**
 * Check if any VA data is present
 */
export function hasVAData(data: VAData): boolean {
  return !!(
    data.va_distance_ua_od_raw ||
    data.va_distance_ua_os_raw ||
    data.va_distance_hc_od_raw ||
    data.va_distance_hc_os_raw ||
    data.va_distance_bcva_od_raw ||
    data.va_distance_bcva_os_raw ||
    data.va_near_ua_od_raw ||
    data.va_near_ua_os_raw ||
    data.va_near_hc_od_raw ||
    data.va_near_hc_os_raw ||
    data.va_near_bcva_od_raw ||
    data.va_near_bcva_os_raw
  );
}

/**
 * Generate a summary string for visual acuity data
 * @param data - VAData object containing all VA fields
 * @param language - Language code ('zh-TW', 'zh-CN', 'en')
 * @returns Formatted summary string
 */
export function formatVASummary(data: VAData, language: string = 'zh-TW'): string {
  const distUaOd = data.va_distance_ua_od_raw;
  const distUaOs = data.va_distance_ua_os_raw;
  const distBcvaOd = data.va_distance_bcva_od_raw || "—";
  const distBcvaOs = data.va_distance_bcva_os_raw || "—";
  const nearBcvaOd = data.va_near_bcva_od_raw || "—";
  const nearBcvaOs = data.va_near_bcva_os_raw || "—";

  // Build distance part
  let distPart = "";
  if (distUaOd || distUaOs) {
    distPart = `UA ${distUaOd || "—"}/${distUaOs || "—"} → BCVA ${distBcvaOd}/${distBcvaOs}`;
  } else if (distBcvaOd !== "—" || distBcvaOs !== "—") {
    distPart = `BCVA ${distBcvaOd}/${distBcvaOs}`;
  }

  // Build near part
  const nearPart = (nearBcvaOd !== "—" || nearBcvaOs !== "—") 
    ? `BCVA ${nearBcvaOd}/${nearBcvaOs}` 
    : "";

  // Language-specific labels
  const labels: Record<string, { dist: string; near: string; noData: string }> = {
    'zh-TW': { dist: '遠', near: '近', noData: '尚未輸入視力數據' },
    'zh-CN': { dist: '远', near: '近', noData: '尚未输入视力数据' },
    'en': { dist: 'Dist', near: 'Near', noData: 'No VA data entered' }
  };

  const l = labels[language] || labels['zh-TW'];
  
  // Return appropriate summary
  if (!distPart && !nearPart) {
    return l.noData;
  }
  
  const parts: string[] = [];
  if (distPart) parts.push(`${l.dist}: ${distPart}`);
  if (nearPart) parts.push(`${l.near}: ${nearPart}`);
  
  return parts.join('; ');
}

/**
 * Get display label for a VA value
 */
export function getVADisplayLabel(value: string | null | undefined): string {
  if (!value || value.trim() === '') return "—";
  return value;
}
