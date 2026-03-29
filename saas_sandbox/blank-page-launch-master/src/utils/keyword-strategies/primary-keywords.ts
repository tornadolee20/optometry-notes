
import type { Keyword } from "@/types/store";
import { isSimilarToExisting } from "@/utils/keyword-utils";

// 處理主要關鍵字選擇
export const selectPrimaryKeywords = (
  formattedStoreKeywords: Keyword[]
): { selectedKeywords: string[], allKeywords: Keyword[] } => {
  const selectedKeywords: string[] = [];
  const allKeywords: Keyword[] = [];

  const primaryKeywords = formattedStoreKeywords.filter(k => k.is_primary);
  primaryKeywords.forEach(kw => {
    if (!isSimilarToExisting(kw.keyword, selectedKeywords)) {
      allKeywords.push(kw);
      selectedKeywords.push(kw.keyword);
    }
  });

  return { selectedKeywords, allKeywords };
};
