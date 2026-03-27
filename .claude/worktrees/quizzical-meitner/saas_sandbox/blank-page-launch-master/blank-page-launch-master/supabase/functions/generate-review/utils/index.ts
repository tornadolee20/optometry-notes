// 導出所有實用函數
export { getCurrentSeason } from './season.ts';
export { detectUserRole } from './user-role.ts';
export { getRandomOpening } from './opening-templates.ts';
export { getRandomCustomerType } from './customer-type.ts';
export { cleanReviewText } from './text-cleaner.ts';
export { enforceProperNounLimits } from './repetition-guard.ts';
export { getRandomTone, getRandomSentencePattern } from './tone-structure.ts';
export { enforceParagraphLayout } from './paragraphs.ts';
export { optimizeLanguageNaturalness } from './language-linter.ts';
export { detectReviewContext } from './context-detector.ts';

// 計算中文字數的函數
export const countChineseWords = (text: string): number => {
  if (!text) return 0;
  // 移除所有空白字符和標點符號
  return text.replace(/\s+/g, '').length;
};