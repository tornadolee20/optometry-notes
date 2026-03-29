
import type { Keyword } from "@/types/store";
import { isSimilarToExisting, getEducationKeywords } from "@/utils/keyword-utils";
import { createKeywordObject } from "@/services/keyword-service";

// 為教育機構選擇關鍵字
export const selectEducationKeywords = async (
  selectedKeywords: string[],
  allKeywords: Keyword[],
  previousKeywordSets: Set<string>
): Promise<{ selectedKeywords: string[], allKeywords: Keyword[] }> => {
  if (allKeywords.length >= 16) {
    return { selectedKeywords, allKeywords };
  }

  // 獲取教育機構關鍵字池
  const educationKeywordPool = getEducationKeywords();
  
  // 需要添加的關鍵字數量
  const neededCount = Math.min(10, 16 - allKeywords.length); // 確保至少保留一些空間給其他類型
  
  // 三重隨機排序確保極高多樣性
  const shuffledEducationKeywords = [...educationKeywordPool]
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5);
    
  // 分為新關鍵字和已使用關鍵字
  const freshKeywords = shuffledEducationKeywords
    .filter(k => !previousKeywordSets.has(k))
    .slice(0, neededCount);
    
  const existingKeywords = new Set(selectedKeywords);
  
  // 添加新關鍵字
  let addedCount = 0;
  for (const keyword of freshKeywords) {
    if (allKeywords.length < 16 && 
        !existingKeywords.has(keyword) && 
        !isSimilarToExisting(keyword, selectedKeywords)) {
      const newKeyword = createKeywordObject(
        keyword, 'general', 'ai', false, 0, allKeywords.length
      );
      allKeywords.push(newKeyword);
      selectedKeywords.push(keyword);
      existingKeywords.add(keyword);
      addedCount++;
    }
    
    if (addedCount >= neededCount) break;
  }
  
  // 如果還需要更多關鍵字，使用已使用過的關鍵字
  if (addedCount < neededCount) {
    const usedKeywords = shuffledEducationKeywords
      .filter(k => previousKeywordSets.has(k) && !existingKeywords.has(k))
      .slice(0, neededCount - addedCount);
      
    for (const keyword of usedKeywords) {
      if (allKeywords.length < 16 && 
          !existingKeywords.has(keyword) && 
          !isSimilarToExisting(keyword, selectedKeywords)) {
        const newKeyword = createKeywordObject(
          keyword, 'general', 'ai', false, 0, allKeywords.length
        );
        allKeywords.push(newKeyword);
        selectedKeywords.push(keyword);
        existingKeywords.add(keyword);
      }
    }
  }

  return { selectedKeywords, allKeywords };
};
