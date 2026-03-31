// Flexible word count management for humanized reviews

// Base ranges by keyword count
export function getBaseWordCountRange(keywordCount: number): { min: number; max: number } {
  switch (keywordCount) {
    case 3: return { min: 80,  max: 130 };  // concise：略放寬上限，避免截斷
    case 4: return { min: 120, max: 180 };  // narrative：對齊 ~150字目標
    case 5: return { min: 150, max: 200 };  // narrative：同上
    default: return { min: 200, max: 260 }; // detailed：6+ keywords
  }
}

// Soft range with random offset for natural distribution
export function getSoftWordCountRange(keywordCount: number): { min: number; max: number; hint: string } {
  const base = getBaseWordCountRange(keywordCount);
  const offset = Math.floor(Math.random() * 15) - 7; // approx +-7

  const softMin = Math.max(60, base.min + offset);
  const softMax = Math.min(280, base.max + offset);

  return {
    min: softMin,
    max: softMax,
    hint: `大約 ${softMin}-${softMax} 字左右就好，不必追求精準字數，自然即可`
  };
}

// Validation range: generous tolerance so we don't over-correct
export function getValidationWordCountRange(keywordCount: number): { min: number; max: number } {
  const base = getBaseWordCountRange(keywordCount);
  const midpoint = Math.round((base.min + base.max) / 2);
  // 6+ keywords: tighter ±30% to avoid 280+ long reviews; others: ±35%
  const tolerance = keywordCount >= 6 ? 0.30 : 0.35;
  const halfWidth = Math.round(midpoint * tolerance);
  return {
    min: Math.max(50, midpoint - halfWidth),
    max: midpoint + halfWidth
  };
}

export function getFlexibleWordCountRange(isHumanized: boolean): { min: number; max: number } {
  if (isHumanized) {
    return { min: 190, max: 240 }; // legacy fallback
  }
  return { min: 201, max: 230 };
}

export function isWithinFlexibleRange(wordCount: number, isHumanized: boolean, keywordCount?: number): boolean {
  if (keywordCount !== undefined) {
    const { min, max } = getValidationWordCountRange(keywordCount);
    return wordCount >= min && wordCount <= max;
  }
  const { min, max } = getFlexibleWordCountRange(isHumanized);
  return wordCount >= min && wordCount <= max;
}
