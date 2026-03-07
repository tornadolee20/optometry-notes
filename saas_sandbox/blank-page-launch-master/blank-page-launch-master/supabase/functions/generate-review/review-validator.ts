import { CustomerType } from './types.ts';
import { generateWithOpenAI, generateWithPerplexity } from './ai-generators.ts';
import { openAIApiKey, perplexityApiKey } from './config.ts';

export async function validateAndFixWordCount(
  review: string,
  systemPrompt: string,
  selectedStyle: string,
  customerType: CustomerType,
  area: string,
  storeName: string,
  keywords: string[]
): Promise<string> {
  const wordCount = review.replace(/\s+/g, '').length;
  
  console.log(`檢查評論字數: ${wordCount}`);
  
  // 如果字數在合理範圍內，直接返回
  if (wordCount >= 201 && wordCount <= 230) {
    console.log('評論字數符合要求');
    return review;
  }
  
  // 如果字數不足，嘗試擴展
  if (wordCount < 201) {
    console.log(`評論字數不足(${wordCount})，嘗試擴展...`);
    
    const expandPrompt = `以下是一篇評論，但字數不足201字，請幫忙擴展到201-230字之間，保持原有的語氣和風格，不要改變核心內容：

原評論：
${review}

擴展要求：
1. 保持原有語氣和風格
2. 字數必須在201-230字之間
3. 包含這些關鍵字：${keywords.join('、')}
4. 地區：${area}
5. 店名：${storeName}
6. 不要重複原有內容，而是添加更多細節或感受`;

    try {
      let expandedReview = '';
      
      if (openAIApiKey) {
        expandedReview = await generateWithOpenAI(expandPrompt, selectedStyle, customerType, openAIApiKey);
      } else if (perplexityApiKey) {
        expandedReview = await generateWithPerplexity(expandPrompt, selectedStyle, customerType, perplexityApiKey);
      }
      
      if (expandedReview && expandedReview.replace(/\s+/g, '').length >= 201) {
        console.log(`成功擴展評論，新字數: ${expandedReview.replace(/\s+/g, '').length}`);
        return expandedReview;
      }
    } catch (error) {
      console.error('擴展評論失敗:', error);
    }
    
    // 如果AI擴展失敗，手動添加內容
    console.log('AI擴展失敗，使用手動擴展');
    let extendedReview = review;
    
    while (extendedReview.replace(/\s+/g, '').length < 201) {
      const additions = [
        `\n\n整體來說，服務品質與細節都很到位，讓人感到放心。`,
        `人員專業親切，過程中說明清楚，體驗很順暢。`,
        `環境整潔舒適，動線規劃也貼心。`,
        `價格透明合理，選擇多且不會有過度推銷。`,
        `若朋友詢問，我會樂意分享這次的好經驗！`
      ];
      
      const randomAddition = additions[Math.floor(Math.random() * additions.length)];
      extendedReview += randomAddition;
      
      // 防止無限循環
      if (extendedReview.length > review.length + 200) break;
    }
    
    return extendedReview;
  }
  
  // 如果字數過多，嘗試精簡
  if (wordCount > 230) {
    console.log(`評論字數過多(${wordCount})，嘗試精簡...`);
    
    const trimPrompt = `以下是一篇評論，但字數超過230字，請幫忙精簡到201-230字之間，保持核心內容和關鍵字：

原評論：
${review}

精簡要求：
1. 保持核心內容和語氣
2. 字數必須在201-230字之間
3. 保留這些關鍵字：${keywords.join('、')}
4. 地區：${area}
5. 店名：${storeName}`;

    try {
      let trimmedReview = '';
      
      if (openAIApiKey) {
        trimmedReview = await generateWithOpenAI(trimPrompt, selectedStyle, customerType, openAIApiKey);
      } else if (perplexityApiKey) {
        trimmedReview = await generateWithPerplexity(trimPrompt, selectedStyle, customerType, perplexityApiKey);
      }
      
      if (trimmedReview && trimmedReview.replace(/\s+/g, '').length <= 230) {
        console.log(`成功精簡評論，新字數: ${trimmedReview.replace(/\s+/g, '').length}`);
        return trimmedReview;
      }
    } catch (error) {
      console.error('精簡評論失敗:', error);
    }
    
    // 如果AI精簡失敗，手動截斷
    console.log('AI精簡失敗，使用手動截斷');
    const sentences = review.split(/[。！？]/);
    let trimmedReview = '';
    
    for (const sentence of sentences) {
      const testReview = trimmedReview + sentence + '。';
      if (testReview.replace(/\s+/g, '').length <= 230) {
        trimmedReview = testReview;
      } else {
        break;
      }
    }
    
    return trimmedReview || review.substring(0, 200) + '。';
  }
  
  return review;
}