import { CustomerType } from './types.ts';
import { generateWithOpenAI, generateWithPerplexity } from './ai-generators.ts';
import { openAIApiKey, perplexityApiKey } from './config.ts';

/**
 * 驗證評論是否包含所有必要的關鍵字，如果缺少則嘗試修正
 */
export async function validateAndFixKeywords(
  review: string,
  requiredKeywords: string[],
  storeName: string,
  area: string,
  selectedStyle: string,
  customerType: CustomerType
): Promise<string> {
  
  console.log('開始關鍵字驗證:', requiredKeywords);
  
  // 檢查哪些關鍵字缺失
  const missingKeywords = findMissingKeywords(review, requiredKeywords);
  
  if (missingKeywords.length === 0) {
    console.log('所有關鍵字都已包含在評論中');
    return review;
  }
  
  console.log('缺失的關鍵字:', missingKeywords);
  
  // 嘗試修正評論以包含缺失的關鍵字
  const fixedReview = await fixMissingKeywords(
    review, 
    missingKeywords, 
    storeName, 
    area, 
    selectedStyle, 
    customerType
  );
  
  return fixedReview;
}

/**
 * 檢查評論中缺失的關鍵字
 */
function findMissingKeywords(review: string, keywords: string[]): string[] {
  const missing: string[] = [];
  
  for (const keyword of keywords) {
    if (!isKeywordIncluded(review, keyword)) {
      missing.push(keyword);
    }
  }
  
  return missing;
}

/**
 * 檢查單個關鍵字是否包含在評論中（包括同義詞檢查）
 */
function isKeywordIncluded(review: string, keyword: string): boolean {
  // 直接包含檢查
  if (review.includes(keyword)) {
    return true;
  }
  
  // 同義詞映射
  const synonyms: Record<string, string[]> = {
    '商務親切': ['親切', '服務好', '態度好', '友善', '熱情', '貼心'],
    '設備專業': ['專業', '設備', '器材', '技術', '精準', '先進'],
    '同理客戶': ['同理', '理解', '體貼', '了解需求', '貼心', '細心'],
    '在地推薦': ['推薦', '在地', '本地', '當地', '口碑', '值得'],
    '老闆很帥': ['老闆', '帥', '外型', '形象', '氣質', '有型'],
    '服務態度好': ['服務', '態度', '親切', '友善', '熱情'],
    '環境舒適': ['環境', '舒適', '氛圍', '空間', '整潔'],
    '價格合理': ['價格', '合理', '划算', '實惠', '性價比'],
    '食物美味': ['美味', '好吃', '味道', '口感', '料理'],
    '停車方便': ['停車', '方便', '車位', '交通'],
    '交通便利': ['交通', '便利', '方便', '位置', '地點'],
    '氣氛佳': ['氣氛', '氛圍', '環境', '感覺'],
    '衛生乾淨': ['衛生', '乾淨', '整潔', '清潔'],
    '份量充足': ['份量', '充足', '實在', '豐富'],
    '服務迅速': ['迅速', '快速', '效率', '及時'],
    '裝潢優雅': ['裝潢', '優雅', '設計', '佈置'],
    '親子友善': ['親子', '友善', '小孩', '家庭'],
    '寵物友善': ['寵物', '友善', '毛小孩'],
    '無障礙設施': ['無障礙', '設施', '友善', '便利'],
    '專業技術': ['專業', '技術', '技巧', '水準'],
    '值得推薦': ['推薦', '值得', '不錯', '優質']
  };
  
  // 檢查同義詞
  const keywordSynonyms = synonyms[keyword] || [];
  for (const synonym of keywordSynonyms) {
    if (review.includes(synonym)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 修正評論以包含缺失的關鍵字
 */
async function fixMissingKeywords(
  review: string,
  missingKeywords: string[],
  storeName: string,
  area: string,
  selectedStyle: string,
  customerType: CustomerType
): Promise<string> {
  
  const fixPrompt = `請修改以下評論，確保包含所有缺失的關鍵字，但要保持自然流暢：

原評論：
${review}

必須包含的缺失關鍵字：${missingKeywords.join('、')}

修改要求：
1. 保持原評論的語氣和風格
2. 自然地融入缺失的關鍵字或其同義表達
3. 字數控制在201-230字之間
4. 保持評論的真實性和可信度
5. 店名：${storeName}，地區：${area}
6. 每個缺失的關鍵字都必須以某種形式出現在修改後的評論中

請直接回覆修改後的完整評論內容。`;

  try {
    let fixedReview = '';
    
    if (openAIApiKey) {
      console.log('使用 OpenAI 修正關鍵字');
      fixedReview = await generateWithOpenAI(fixPrompt, selectedStyle, customerType, openAIApiKey);
    } else if (perplexityApiKey) {
      console.log('使用 Perplexity 修正關鍵字');
      fixedReview = await generateWithPerplexity(fixPrompt, selectedStyle, customerType, perplexityApiKey);
    } else {
      console.log('無可用 AI，使用手動修正');
      return manualFixKeywords(review, missingKeywords);
    }
    
    // 驗證修正結果
    const stillMissing = findMissingKeywords(fixedReview, missingKeywords);
    if (stillMissing.length === 0) {
      console.log('成功修正所有缺失關鍵字');
      return fixedReview;
    } else {
      console.log('AI修正後仍有缺失關鍵字，使用手動修正:', stillMissing);
      return manualFixKeywords(fixedReview, stillMissing);
    }
    
  } catch (error) {
    console.error('關鍵字修正失敗:', error);
    return manualFixKeywords(review, missingKeywords);
  }
}

/**
 * 手動修正缺失的關鍵字
 */
function manualFixKeywords(review: string, missingKeywords: string[]): string {
  let fixedReview = review;
  
  // 為每個缺失關鍵字添加相應的句子
  const keywordSentences: Record<string, string> = {
    '商務親切': '服務人員的親切態度讓人印象深刻。',
    '設備專業': '這裡的設備相當專業。',
    '同理客戶': '店家很能理解客戶的需求。',
    '在地推薦': '這是當地值得推薦的好店。',
    '老闆很帥': '老闆的形象很不錯。',
    '服務態度好': '整體服務態度都很好。',
    '環境舒適': '店內環境讓人感到舒適。',
    '價格合理': '價格設定很合理。',
    '食物美味': '餐點味道相當不錯。',
    '停車方便': '停車相當方便。',
    '交通便利': '交通位置很便利。',
    '氣氛佳': '整體氛圍很棒。',
    '衛生乾淨': '環境維持得很乾淨。',
    '份量充足': '份量給得很實在。',
    '服務迅速': '服務效率很高。',
    '裝潢優雅': '店內裝潢很有質感。',
    '親子友善': '很適合帶小朋友來。',
    '寵物友善': '對寵物很友善。',
    '無障礙設施': '無障礙設施很完善。',
    '專業技術': '技術水準很專業。',
    '值得推薦': '真的值得推薦給大家。'
  };
  
  // 在評論末尾添加缺失關鍵字的描述
  for (const keyword of missingKeywords) {
    const sentence = keywordSentences[keyword] || `${keyword}的表現很不錯。`;
    if (!fixedReview.endsWith('。') && !fixedReview.endsWith('！') && !fixedReview.endsWith('？')) {
      fixedReview += '。';
    }
    fixedReview += sentence;
  }
  
  return fixedReview;
}