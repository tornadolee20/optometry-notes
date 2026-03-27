
import type { Keyword } from "@/types/store";
import { isSimilarToExisting, getDefaultKeywords } from "@/utils/keyword-utils";
import { createKeywordObject } from "@/services/keyword-service";

// 使用預設關鍵字填充到 16 個（保持默認關鍵字不變）
export const fillWithDefaultKeywords = (
  selectedKeywords: string[],
  allKeywords: Keyword[],
  industry?: string | null
): { selectedKeywords: string[], allKeywords: Keyword[] } => {
  // 如果還不夠 16 個，添加預設關鍵字
  const defaultKeywords = getDefaultKeywords(industry);

  // 每次使用完全不同的默認關鍵字順序，最大化實現多樣性
  const shuffledDefaults = [...defaultKeywords]
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5); // 三重洗牌
    
  for (const keyword of shuffledDefaults) {
    if (allKeywords.length >= 16) break;
    if (!selectedKeywords.includes(keyword) && !isSimilarToExisting(keyword, selectedKeywords)) {
      const newKeyword = createKeywordObject(
        keyword, 'general', 'ai', false, 0, allKeywords.length
      );
      allKeywords.push(newKeyword);
      selectedKeywords.push(keyword);
    }
  }

  // 確保只保留 16 個關鍵字
  allKeywords = allKeywords.slice(0, 16);
  return { selectedKeywords, allKeywords };
};
