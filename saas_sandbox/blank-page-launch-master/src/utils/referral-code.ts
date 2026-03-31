/** Convert store_number to human-readable referral code */
export function storeNumberToCode(storeNumber: number): string {
  return `STORE${String(storeNumber).padStart(6, '0')}`;
}

/** Parse referral code back to store_number, returns null if invalid */
export function codeToStoreNumber(code: string): number | null {
  const match = code.trim().toUpperCase().match(/^STORE(\d{1,6})$/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return n > 0 ? n : null;
}

export function isValidReferralCode(code: string): boolean {
  return codeToStoreNumber(code) !== null;
}
