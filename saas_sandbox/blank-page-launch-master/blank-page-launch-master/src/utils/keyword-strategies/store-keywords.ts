
import type { Keyword } from "@/types/store";
import { 
  isSimilarToExisting, 
  isInPreviousKeywords,
  calculateFreshRatio
} from "@/utils/keyword-utils";

// 從店家關鍵字中選擇非主要關鍵字
export const selectStoreKeywords = (
  formattedStoreKeywords: Keyword[],
  selectedKeywords: string[],
  allKeywords: Keyword[],
  previousKeywordSets: Set<string>,
  generationCount: number
): { selectedKeywords: string[], allKeywords: Keyword[] } => {
  const remainingNeeded = 16 - allKeywords.length;
  
  // 從非主要店家關鍵字中選擇，極度確保每次都有足夠不同的關鍵字
  const nonPrimaryStoreKeywords = formattedStoreKeywords
    .filter(k => !k.is_primary)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5); // 三重隨機排序
  
  // 進一步提高多樣性，強調選擇從未使用過的關鍵字
  const freshRatio = calculateFreshRatio(generationCount);
  
  // 將非主要關鍵字分為兩組：從未使用過的和之前使用過的
  const freshKeywords = nonPrimaryStoreKeywords.filter(k => !isInPreviousKeywords(k.keyword, previousKeywordSets));
  const usedKeywords = nonPrimaryStoreKeywords.filter(k => isInPreviousKeywords(k.keyword, previousKeywordSets));
  
  // 決定從新關鍵字中選擇多少個
  const freshCount = Math.min(freshKeywords.length, Math.ceil(remainingNeeded * freshRatio));
  const usedCount = Math.min(usedKeywords.length, remainingNeeded - freshCount);
  
  // 極致增強多樣性：使用三重隨機排序
  const shuffledFresh = [...freshKeywords]
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5); // 三重洗牌
  
  const shuffledUsed = [...usedKeywords]
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5); // 三重洗牌

  // 優先添加新的關鍵字
  shuffledFresh.slice(0, freshCount).forEach(kw => {
    if (allKeywords.length < 16 && !isSimilarToExisting(kw.keyword, selectedKeywords)) {
      allKeywords.push(kw);
      selectedKeywords.push(kw.keyword);
    }
  });
  
  // 只在必要時添加之前使用過的關鍵字，避免重複
  shuffledUsed.slice(0, usedCount).forEach(kw => {
    if (allKeywords.length < 16 && !isSimilarToExisting(kw.keyword, selectedKeywords)) {
      allKeywords.push(kw);
      selectedKeywords.push(kw.keyword);
    }
  });

  return { selectedKeywords, allKeywords };
};
