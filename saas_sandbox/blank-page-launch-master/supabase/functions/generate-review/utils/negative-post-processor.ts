/**
 * Post-processor for negative reviews: strips sentences containing positive phrases
 * that contradict the negative tone.
 */

// Positive phrases that should NEVER appear in a negative review
const POSITIVE_DENY_LIST = [
  '還不錯', '還算不錯', '算不錯', '口味不錯', '味道不錯',
  '環境不錯', '氣氛不錯', '還算可以', '可以接受',
  '價格合理', '價錢合理', '價錢也在可以', '價格也在可以',
  '還好啦', '整體還好', '整體還算',
  '小小的優點', '唯一的優點', '優點是',
  '環境舒適', '設計很美', '裝潢不錯', '裝潢很美',
  '手法專業', '技術不錯', '態度還可以', '態度其實還',
  '值得再來', '下次還會', '還是會再來', '給機會',
  '可能會考慮', '再來的話',
  '期望.*進步', '如果能改善', '希望.*改善',
  '服務不錯', '品質不錯', '蠻好的', '挺好的',
];

// Compile patterns once
const POSITIVE_PATTERNS = POSITIVE_DENY_LIST.map(p => new RegExp(p));

/**
 * Check if a sentence contains positive phrases
 */
function containsPositive(sentence: string): boolean {
  return POSITIVE_PATTERNS.some(pattern => pattern.test(sentence));
}

/**
 * Strip sentences with positive content from a negative review.
 * Operates on sentence level (split by 。！？) to preserve coherent text.
 */
export function stripPositiveFromNegativeReview(text: string): string {
  // Split into paragraphs first
  const paragraphs = text.split(/\n\n/);
  const cleanedParagraphs: string[] = [];

  for (const para of paragraphs) {
    // Split paragraph into sentences
    const sentences = para.split(/(?<=[。！？])\s*/);
    const cleanedSentences = sentences.filter(s => {
      if (!s.trim()) return false;
      if (containsPositive(s)) {
        console.log(`[Negative post-processor] Stripped positive sentence: "${s.slice(0, 30)}..."`);
        return false;
      }
      return true;
    });

    if (cleanedSentences.length > 0) {
      cleanedParagraphs.push(cleanedSentences.join(' '));
    }
  }

  const result = cleanedParagraphs.join('\n\n');
  
  // If we stripped too much (>50%), return original with a warning
  if (result.replace(/\s+/g, '').length < text.replace(/\s+/g, '').length * 0.5) {
    console.warn('[Negative post-processor] Stripped >50% of content, returning original');
    return text;
  }

  return result;
}
