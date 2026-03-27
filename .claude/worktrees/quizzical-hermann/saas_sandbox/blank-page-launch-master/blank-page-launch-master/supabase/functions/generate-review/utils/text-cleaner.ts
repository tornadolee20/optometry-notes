// 清理和格式化評論文本
import { optimizeLanguageNaturalness } from './language-linter.ts';

export const cleanReviewText = (text: string): string => {
  if (!text) return '';
  
  let result = text
    .trim()
    // 移除行首空格
    .replace(/^\s+/gm, '')
    // 移除行尾空格
    .replace(/\s+$/gm, '')
    // 確保句號後有適當間距
    .replace(/([。！？])([^\s\n])/g, '$1 $2')
    // 移除重複的標點符號
    .replace(/([。！？]){2,}/g, '$1')
    // 確保段落間有適當的呼吸空間（雙換行）
    .replace(/\n{3,}/g, '\n\n')
    // 確保段落分隔有呼吸感
    .replace(/([。！？])\s*\n\s*([^。！？\n])/g, '$1\n\n$2')
    .trim();

  // 應用語言自然化優化
  result = optimizeLanguageNaturalness(result);

  return result;
};