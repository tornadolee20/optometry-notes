
import type { Keyword } from "@/types/store";
import { isSimilarToExisting, isInPreviousKeywords } from "@/utils/keyword-utils";
import { createKeywordObject, fetchIndustryKeywords } from "@/services/keyword-service";

// 選擇行業關鍵字
export const selectIndustryKeywords = async (
  industry: string | undefined,
  selectedKeywords: string[],
  allKeywords: Keyword[],
  previousKeywordSets: Set<string>
): Promise<{ selectedKeywords: string[], allKeywords: Keyword[] }> => {
  if (allKeywords.length >= 16 || !industry) {
    return { selectedKeywords, allKeywords };
  }

  const industryKeywordsData = await fetchIndustryKeywords(industry);

  // 分為新關鍵字和舊關鍵字，增加新舊分組的極度差異化
  const freshIndustryKeywords = industryKeywordsData
    .filter(ik => !isInPreviousKeywords(ik.keyword, previousKeywordSets))
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5); // 三重洗牌
  
  const usedIndustryKeywords = industryKeywordsData
    .filter(ik => isInPreviousKeywords(ik.keyword, previousKeywordSets))
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5); // 三重洗牌

  // 最大化行業關鍵字使用數量，確保行業關鍵字充分被使用
  const neededCount = 16 - allKeywords.length;
  const maxFreshToUse = Math.min(neededCount, freshIndustryKeywords.length);
  const maxUsedToUse = Math.min(neededCount - maxFreshToUse, usedIndustryKeywords.length);
  
  // 優先使用全新的行業關鍵字
  freshIndustryKeywords.slice(0, maxFreshToUse).forEach(ik => {
    if (allKeywords.length < 16 && 
        !selectedKeywords.includes(ik.keyword) && 
        !isSimilarToExisting(ik.keyword, selectedKeywords)) {
      const newKeyword = createKeywordObject(
        ik.keyword, 'general', 'ai', false, ik.usage_count || 0, allKeywords.length
      );
      allKeywords.push(newKeyword);
      selectedKeywords.push(ik.keyword);
    }
  });
  
  // 然後才使用之前使用過的關鍵字
  usedIndustryKeywords.slice(0, maxUsedToUse).forEach(ik => {
    if (allKeywords.length < 16 && 
        !selectedKeywords.includes(ik.keyword) && 
        !isSimilarToExisting(ik.keyword, selectedKeywords)) {
      const newKeyword = createKeywordObject(
        ik.keyword, 'general', 'ai', false, ik.usage_count || 0, allKeywords.length
      );
      allKeywords.push(newKeyword);
      selectedKeywords.push(ik.keyword);
    }
  });

  return { selectedKeywords, allKeywords };
};
