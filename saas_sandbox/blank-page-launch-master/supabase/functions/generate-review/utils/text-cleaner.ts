// Clean and format review text
import { optimizeLanguageNaturalness } from './language-linter.ts';

/**
 * Conservative fix for a handful of known weird phrases produced by the AI.
 * Only targets patterns we've actually seen and are confident about.
 * Runs LAST to avoid interfering with other cleaning rules.
 */
export const fixCommonWeirdPhrases = (text: string): string => {
  let result = text;

  // "朋友一直可以試試XXX" → "朋友一直推薦XXX，今天終於來試試了"
  result = result.replace(/朋友一直可以試試/g, '朋友一直推薦');

  // "朋友一直說可以試試XXX" → "朋友一直說要來試試XXX"
  result = result.replace(/朋友一直說可以試試/g, '朋友一直說要來試試');

  // "朋友可以試試我來XXX" → "朋友可以試試看，我覺得"
  result = result.replace(/朋友可以試試我來/g, '朋友可以試試看，我覺得');

  // "推薦大家我來" → "推薦大家來"
  result = result.replace(/推薦大家我來/g, '推薦大家來');

  // "可以來試試我去的" → "可以來試試我去的這間"
  result = result.replace(/可以來試試我去的([^這])/g, '可以來試試我去的這間$1');

  // "值得試試我來的" → "值得試試我來的這間"
  result = result.replace(/值得試試我來的([^這])/g, '值得試試我來的這間$1');

  // "朋友值得去來XXX" → "朋友值得來XXX"
  result = result.replace(/值得去來/g, '值得來');

  // "朋友可以試試來XXX" → "朋友可以來試試XXX"
  result = result.replace(/可以試試來/g, '可以來試試');

  return result;
};

export const cleanReviewText = (text: string, industry?: string, maxChars?: number, isNegative?: boolean): string => {
  if (!text) return '';
  
  let result = text
    .trim()
    .replace(/^\s+/gm, '')
    .replace(/\s+$/gm, '')
    // --- Punctuation & whitespace fixes ---
    // 1. Remove spaces BEFORE Chinese punctuation: "好 。" → "好。"
    .replace(/ +([。！？，、；：])/g, '$1')
    // 2. Collapse consecutive end-punctuation (with or without spaces): "。。" "。 。" "！？" → single
    .replace(/([。！？])[\s]*[。！？]+/g, '$1')
    // 3. Collapse 2+ spaces after punctuation into exactly one
    .replace(/([。！？])\s{2,}/g, '$1 ')
    // 4. Normal sentence boundary: punctuation followed by non-space char
    .replace(/([。！？])([^\s\n"」』）])/g, '$1 $2')
    // 5. Collapse 3+ newlines
    .replace(/\n{3,}/g, '\n\n')
    // 6. Normalize punctuation-then-newline into paragraph break
    .replace(/([。！？])\s*\n\s*([^。！？\n])/g, '$1\n\n$2')
    .trim();

  // Remove list markers (- • ・ ● ◆ ▪ etc.) at the start of lines
  result = result.replace(/^[\s]*[-•・●◆▪▸►]\s*/gm, '');

  // Also remove numbered list markers like "1. ", "2. ", "(1) ", etc.
  result = result.replace(/^[\s]*\(?[0-9]+[.)]\s*/gm, '');

  // Apply language optimization with industry awareness and char budget
  // Skip positive-oriented linting for negative reviews
  if (!isNegative) {
    result = optimizeLanguageNaturalness(result, industry, maxChars);
  }

  // Post-linter punctuation cleanup (linter may re-introduce 。。 etc.)
  result = result
    .replace(/([。！？])[\s]*[。！？]+/g, '$1')
    .replace(/([。！？])([^\s\n"」』）])/g, '$1 $2');

  // Remove isolated short fragments: "可以。" "好。" "對。" etc.
  // Matches 1-2 Chinese chars followed by 。！？ standing alone (after sentence boundary or start)
  result = result.replace(/(?:^|(?<=[。！？]\s?))[^\S\n]*[\u4e00-\u9fff]{1,2}[。！？][\s]*/gm, '');

  // Conservative weird-phrase fixes (last step)
  result = fixCommonWeirdPhrases(result);

  return result;
};
