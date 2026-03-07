// Flexible word count management for humanized reviews

export function getFlexibleWordCountRange(isHumanized: boolean): { min: number; max: number } {
  if (isHumanized) {
    return { min: 190, max: 240 }; // ±15% flexibility from 201-230
  }
  return { min: 201, max: 230 }; // Original strict range
}

export function isWithinFlexibleRange(wordCount: number, isHumanized: boolean): boolean {
  const { min, max } = getFlexibleWordCountRange(isHumanized);
  return wordCount >= min && wordCount <= max;
}

export function calculateWordCountTolerance(wordCount: number, isHumanized: boolean): {
  isAcceptable: boolean;
  adjustmentNeeded: number;
  targetRange: { min: number; max: number };
} {
  const { min, max } = getFlexibleWordCountRange(isHumanized);
  
  if (wordCount >= min && wordCount <= max) {
    return {
      isAcceptable: true,
      adjustmentNeeded: 0,
      targetRange: { min, max }
    };
  }
  
  let adjustmentNeeded = 0;
  if (wordCount < min) {
    adjustmentNeeded = min - wordCount;
  } else if (wordCount > max) {
    adjustmentNeeded = max - wordCount; // negative value
  }
  
  return {
    isAcceptable: false,
    adjustmentNeeded,
    targetRange: { min, max }
  };
}