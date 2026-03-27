import { CustomerType, RequestBody, ResponseData } from './types.ts';
import { 
  getCurrentSeason,
  detectUserRole,
  getRandomOpening,
  getRandomCustomerType,
  cleanReviewText,
  countChineseWords,
  enforceProperNounLimits,
  getRandomTone,
  getRandomSentencePattern,
  enforceParagraphLayout
} from './utils/index.ts';
import {
  generateWithPerplexity,
  generateWithOpenAI
} from './ai-generators.ts';
import { adjustParagraphRhythm } from './utils/sentence-diversifier.ts';
import { createSystemPrompt } from './prompt-builder.ts';
import { perplexityApiKey, openAIApiKey } from './config.ts';
import { validateAndFixWordCount } from './review-validator.ts';
import { 
  generateHumanizationElements, 
  applyHumanizationPostProcessing, 
  validateHumanizedReview 
} from './humanization/index.ts';

// 全域變數來追蹤最近使用的開場白類型，避免重複
let recentOpeningTypes: string[] = [];
const MAX_RECENT_TYPES = 5; // 記住最近5種開場白類型

// 追蹤最近使用的語氣與句型
let recentToneKeys: string[] = [];
let recentStructureKeys: string[] = [];
const MAX_RECENT_TONES = 5;
const MAX_RECENT_STRUCTURES = 5;

// Main processing function for review generation
export async function processReviewRequest(requestData: RequestBody): Promise<ResponseData> {
  const { storeName, address, area: providedArea, keywords = [], customFeelings = [], description, reviewStyle, enforceNegativeWhenNeeded, industry } = requestData;

  // Generate humanization elements
  const humanizationResult = generateHumanizationElements({
    industry: industry || 'general',
    storeName,
    area: providedArea || '',
    keywords: keywords || [],
    customFeelings: customFeelings || []
  });

  // 合併關鍵字和自訂感受，確保兩者都被包含在評論生成中
  const effectiveKeywords = [
    ...(keywords || []),
    ...(customFeelings || [])
  ];

  if (!storeName || effectiveKeywords.length === 0) {
    throw new Error('缺少必要參數：請至少提供關鍵字或自訂感受');
  }

  // Get current season
  const currentSeason = getCurrentSeason();
  
  // Process area parameter
  let area = providedArea;
  if (!area || area.trim() === '') {
    area = address?.match(/[^\s]*?(市區|區|鎮|鄉)/)?.[0]?.replace(/(市區|區|鎮|鄉)$/, '') || '本地區';
  }
  
  console.log('處理地區:', area);
  console.log('行業類型:', industry || '未指定');
  
  // Detect user role
  const userRole = detectUserRole(effectiveKeywords);
  console.log('偵測到的使用者角色:', userRole);
  
  // Get opening with anti-repetition mechanism
  let openingResult;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    openingResult = getRandomOpening(area, currentSeason, userRole);
    attempts++;
  } while (
    recentOpeningTypes.includes(openingResult.type) && 
    attempts < maxAttempts
  );
  
  // 更新最近使用的開場白類型記錄
  recentOpeningTypes.push(openingResult.type);
  if (recentOpeningTypes.length > MAX_RECENT_TYPES) {
    recentOpeningTypes.shift(); // 移除最舊的記錄
  }
  
  const { type: openingType, opening } = openingResult;
  console.log('選擇的開場白類型:', openingType);
  console.log('開場白內容:', opening);
  console.log('最近使用的開場白類型:', recentOpeningTypes);
  
  // Get random customer type
  const customerType = await getRandomCustomerType();
  console.log('客戶屬性類型:', customerType.name);

// Reduced logging for production security - only log essential info
const isDev = Deno.env.get('ENVIRONMENT') === 'development';
if (isDev) {
  console.log('生成評論參數:', { 
    storeName, 
    address,
    area,
    industry,
    keywordCount: effectiveKeywords.length,
    season: currentSeason,
    openingType,
    userRole,
    customerType: customerType.name
  });
} else {
  console.log('評論生成請求:', { keywordCount: effectiveKeywords.length, area, industry, userRole });
}

  // Determine if we should use special writing style
  const randomNum = Math.random() * 100;
  let selectedStyle = "";
  
  if (randomNum <= 2) {
    selectedStyle = "周星馳";
  } else if (randomNum <= 4) {
    selectedStyle = "吳念真";
  } else if (randomNum <= 6) {
    selectedStyle = "蔡康永";
  }

// Create system prompt（先挑選語氣與句型並注入）
// 語氣
let toneOption = getRandomTone(recentToneKeys);
let attemptsTone = 0;
while (recentToneKeys.includes(toneOption.key) && attemptsTone < 10) {
  toneOption = getRandomTone(recentToneKeys);
  attemptsTone++;
}
recentToneKeys.push(toneOption.key);
if (recentToneKeys.length > MAX_RECENT_TONES) recentToneKeys.shift();

// 句型
let structureOption = getRandomSentencePattern(recentStructureKeys);
let attemptsStruct = 0;
while (recentStructureKeys.includes(structureOption.key) && attemptsStruct < 10) {
  structureOption = getRandomSentencePattern(recentStructureKeys);
  attemptsStruct++;
}
recentStructureKeys.push(structureOption.key);
if (recentStructureKeys.length > MAX_RECENT_STRUCTURES) recentStructureKeys.shift();

const systemPrompt = createSystemPrompt(
  storeName, 
  area, 
  effectiveKeywords, 
  description, 
  humanizationResult.opening || opening, // Use humanized opening if available
  selectedStyle,
  customerType,
  undefined, // enforcedStyle
  toneOption.label, // tone
  structureOption.label, // sentencePattern
  undefined, // starRating
  customFeelings, // customFeelings
  industry, // industry
  // Humanization parameters
  humanizationResult.microEvent,
  humanizationResult.painPoint,
  humanizationResult.interjections,
  humanizationResult.perspective,
  humanizationResult.isHumanized
);

  // Generate review
  let review = "";
  let originalWordCount = 0;
  
  try {
    // Try to generate review using available APIs
    if (openAIApiKey) {
      console.log('使用 OpenAI API 生成評論');
      review = await generateWithOpenAI(systemPrompt, selectedStyle, customerType, openAIApiKey);
    } 
    else if (perplexityApiKey) {
      console.log('使用 Perplexity API 生成評論');
      review = await generateWithPerplexity(systemPrompt, selectedStyle, customerType, perplexityApiKey);
    } else {
      throw new Error('無可用的 API 金鑰');
    }
    
    // Check paragraph formatting
    if (!review.includes('\n\n') && review.length > 100) {
      console.log('檢測到評論沒有段落分隔，嘗試強制添加段落...');
      review = review
        .replace(/([。！？!?])\s*/g, '$1\n\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }
    
    originalWordCount = review.replace(/\s+/g, '').length;
    
    // 檢查關鍵字包含情況（僅記錄，不進行修正）
    const missingKeywords = effectiveKeywords.filter(keyword => {
      // 直接包含檢查
      if (review.includes(keyword)) return false;
      
      // 同義詞檢查（包含跨行業通用關鍵字）
      const synonyms: Record<string, string[]> = {
        // 眼鏡行專用
        '商務親切': ['親切', '服務好', '態度好', '友善', '熱情', '貼心'],
        '設備專業': ['專業', '設備', '器材', '技術', '精準', '先進'],
        '同理客戶': ['同理', '理解', '體貼', '了解需求', '貼心', '細心'],
        
        // 通用服務關鍵字
        '回頭客多': ['回頭客', '再次光顧', '常客', '熟客', '老顧客', '重複消費'],
        '在地推薦': ['推薦', '在地', '本地', '當地', '口碑好', '鄰居介紹'],
        '服務態度好': ['服務', '態度', '親切', '友善', '熱情'],
        '環境舒適': ['環境', '舒適', '氛圍', '空間', '整潔'],
        '價格合理': ['價格', '合理', '划算', '實惠', '性價比'],
        '交通便利': ['交通', '便利', '方便', '位置', '地點'],
        '停車方便': ['停車', '方便', '車位', '交通'],
        '專業技術': ['專業', '技術', '技巧', '水準'],
        '值得推薦': ['推薦', '值得', '不錯', '優質'],
        
        // 餐飲業關鍵字
        '食物美味': ['美味', '好吃', '味道', '口感', '料理', '餐點', '菜色'],
        '份量充足': ['份量', '充足', '實在', '豐富', '飽足'],
        '衛生乾淨': ['衛生', '乾淨', '整潔', '清潔'],
        '氣氛佳': ['氣氛', '氛圍', '環境', '感覺', '溫馨'],
        '服務迅速': ['迅速', '快速', '效率', '及時', '出餐快'],
        
        // 零售業關鍵字
        '商品齊全': ['商品', '齊全', '選擇多', '種類豐富', '貨品完整'],
        '品質優良': ['品質', '優良', '質量好', '做工精緻'],
        '裝潢優雅': ['裝潢', '優雅', '設計', '佈置', '美觀'],
        
        // 美容美髮關鍵字
        '技術精湛': ['技術', '精湛', '手法', '專業', '技巧好'],
        '產品優質': ['產品', '優質', '用料好', '品牌好'],
        
        // 醫療健康關鍵字
        '醫師專業': ['醫師', '專業', '醫生', '診斷', '經驗豐富'],
        '設備先進': ['設備', '先進', '器材', '儀器', '現代化'],
        
        // 教育關鍵字
        '教學認真': ['教學', '認真', '老師', '用心', '負責'],
        '師資優良': ['師資', '優良', '老師好', '教師專業'],
        
        // 服務業關鍵字
        '服務效率': ['效率', '迅速', '快速', '及時', '準時'],
        '工作仔細': ['仔細', '細心', '用心', '認真', '負責'],
        
        // 娛樂休閒關鍵字
        '設施完善': ['設施', '完善', '設備', '齊全', '功能多'],
        '環境安全': ['安全', '環境', '放心', '可靠'],
        
        // 其他通用
        '老闆很帥': ['老闆', '帥', '外型', '形象', '氣質', '有型'],
        '親子友善': ['親子', '友善', '小孩', '家庭', '適合帶小朋友'],
        '寵物友善': ['寵物', '友善', '毛小孩', '可帶寵物'],
        '無障礙設施': ['無障礙', '設施', '友善', '便利', '輪椅']
      };
      
      const keywordSynonyms = synonyms[keyword] || [];
      return !keywordSynonyms.some(synonym => review.includes(synonym));
    });
    
    if (isDev) {
      if (missingKeywords.length > 0) {
        console.log('評論中未包含的關鍵字:', missingKeywords);
      } else {
        console.log('所有關鍵字都已包含在評論中');
      }
    }
    
    // Validate and fix word count
    review = await validateAndFixWordCount(
      review, 
      systemPrompt, 
      selectedStyle, 
      customerType,
      area,
      storeName,
      effectiveKeywords
    );
    
  } catch (apiError) {
    console.error('API 錯誤:', apiError);
    throw new Error('評論生成失敗：請聯繫管理員設置 OpenAI 或 Perplexity API 金鑰');
  }

// Apply sentence length diversification for more natural flow
review = adjustParagraphRhythm(review);

// Apply humanization post-processing if enabled
if (humanizationResult.isHumanized) {
  review = applyHumanizationPostProcessing(review, humanizationResult);
}

// Apply consistency guard and final cleanup
review = enforceProperNounLimits(review, area, storeName);
let cleanReview = cleanReviewText(review);

// Log context detection results for debugging
const { detectReviewContext } = await import('./utils/context-detector.ts');
const reviewContext = detectReviewContext(cleanReview);
console.log('偵測到的評論情境:', {
  visitType: reviewContext.visit.type,
  visitConfidence: reviewContext.visit.confidence,
  visitIndicators: reviewContext.visit.indicators,
  weatherType: reviewContext.weather.type
});

// Validate with humanization-aware word count checking
const finalWordCount = cleanReview.replace(/\s+/g, '').length;
const isHumanized = humanizationResult.isHumanized;
const minWords = isHumanized ? 190 : 201;
const maxWords = isHumanized ? 240 : 230;

if (finalWordCount < minWords || finalWordCount > maxWords) {
  console.log(`最終字數檢查: ${finalWordCount}，目標範圍: ${minWords}-${maxWords}，需要調整`);
  cleanReview = await validateAndFixWordCount(
    cleanReview, 
    systemPrompt, 
    selectedStyle, 
    customerType,
    area,
    storeName,
    effectiveKeywords
  );
}
  
  // Log final word count
  const updatedWordCount = (cleanReview.replace(/\s+/g, '')).length;
  console.log(`最終評論字數: ${updatedWordCount}`);

  return {
    review: cleanReview,
    style: selectedStyle || '標準',
    season: currentSeason,
    openingType,
    customerType: customerType.name,
    userRole,
    wordCount: updatedWordCount,
    originalWordCount: originalWordCount,
    // Add humanization metadata
    reviewStyleType: isHumanized ? 'humanized' : 'standard',
    tone: toneOption.label,
    starRating: undefined
  };
}