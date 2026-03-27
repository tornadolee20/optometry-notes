
// 關鍵字工具函數
import type { Keyword } from "@/types/store";

// 眼鏡行業關鍵字池
export const getOpticalKeywords = () => [
  // 專業服務
  "專業驗光", "精準驗光", "眼睛檢查", "視力檢測", "角膜測量", "散光評估", 
  "細心服務", "耐心解說", "專業調整", "視力保健", "眼科合作", "配鏡建議",
  
  // 產品相關
  "防藍光鏡片", "高透光鏡片", "抗UV鏡片", "漸進多焦鏡片", "超薄鏡片", "抗反光鏡片", 
  "抗刮鏡片", "光變鏡片", "偏光鏡片", "隱形眼鏡", "高階鏡片", "品牌鏡片",
  
  // 鏡框特性
  "超輕鏡架", "鈦金屬鏡框", "記憶鏡架", "彈性鏡框", "舒適鼻墊", "時尚款式", 
  "多款選擇", "進口鏡框", "品牌鏡框", "流行設計", "經典款式", "客製化鏡框",
  
  // 店家特色
  "CP值高", "價格合理", "快速取件", "保固完善", "售後服務好", "店內環境舒適", 
  "交通便利", "停車方便", "專業設備", "新款上市快", "品牌齊全", "適合全家",
  
  // 顧客體驗
  "視野清晰", "戴起來舒適", "輕盈無負擔", "高清視覺", "眼睛不疲勞", "長時間配戴舒適", 
  "解決視力問題", "改善用眼體驗", "眼鏡不下滑", "配戴感提升", "不壓鼻樑", "解決霧氣問題",
  
  // 年輕人常用詞
  "高CP值", "質感一流", "顏值很高", "小資首選", "文青風格", "潮流款式", 
  "網美最愛", "曬照必備", "低調奢華", "高顏值選擇", "百搭設計", "一秒變型男正妹"
];

// 明確定義食物餐廳相關關鍵字 - 用於過濾排除
export const getFoodKeywords = [
  "食材新鮮", "口感特色", "份量足", "菜色多樣", "特色菜品", "招牌必點",
  "限量商品", "季節限定", "獨家配方", "手工製作", "上菜速度", "餐點呈現", 
  "食物溫度", "調味恰當", "早餐供應", "深夜營業", "用餐氛圍"
];

// 預設關鍵字集合
export const getDefaultKeywords = (industry: string | null = null) => {
  // 如果是教育行業，返回教育關鍵字
  if (industry === 'education') {
    return getEducationKeywords();
  }
  
  // 如果是眼鏡行業，返回眼鏡關鍵字
  if (industry === 'optical') {
    return getOpticalKeywords();
  }
  
  // 默認通用關鍵字 - 移除了與餐飲相關的關鍵字
  return [
    // 服務/體驗相關
    "服務親切", "服務專業", "服務迅速", "服務到位", "體驗良好", "氣氛佳", 
    "舒適環境", "乾淨整潔", "設備新穎", "品質穩定", "細節講究", "用心經營",
    // 價值相關
    "CP值高", "價格合理", "性價比高", "物超所值", "划算", "優惠多", 
    "免費贈品", "會員優惠", "折扣多", "超值套餐", "附加價值高",
    // 產品描述
    "品質優良", "種類多樣", "選擇多元", "新鮮", "用料實在", 
    "獨特風格", "特色商品", "精緻做工", "品質保證", "客製化服務",
    // 位置/交通
    "位置便利", "交通方便", "好停車", "鄰近捷運", "鄰近學校", "社區內", 
    "市中心", "地標旁", "購物中心", "商圈內", "路口顯眼", "人潮聚集",
    // 店家特色
    "老字號", "新開幕", "網美店", "文青風", "復古風", "網路人氣", 
    "在地推薦", "評價優良", "回頭客多", "全天候營業",
    // 感受描述
    "令人放鬆", "賓至如歸", "回訪率高", "超乎預期", "值得推薦", "令人驚艷", 
    "驚喜不斷", "回憶滿滿", "感動服務", "治癒系", "療癒", "溫馨感受"
  ];
};

// 檢查是否為眼鏡行
export const isOpticalStore = (storeName: string, industry?: string | null): boolean => {
  // 檢查行業類別
  if (industry) {
    const opticalIndustries = ['眼鏡', '配鏡', '視光', '隱形眼鏡', '鏡框', '鏡片'];
    if (opticalIndustries.some(keyword => industry.includes(keyword))) {
      return true;
    }
  }
  
  // 檢查店名中的眼鏡相關詞彙
  const opticalKeywords = [
    '眼鏡', '配鏡', '光學', '視光', '隱形', '鏡框', '鏡片', '視力', 
    'optical', 'eyewear', 'glasses', 'lens', 'optometry'
  ];
  
  return opticalKeywords.some(keyword => storeName.toLowerCase().includes(keyword.toLowerCase()));
};

// 檢查關鍵字是否為食物/餐廳相關 - 用於眼鏡行業排除
export const isFoodRelatedKeyword = (keyword: string): boolean => {
  const foodKeywords = getFoodKeywords;
  return foodKeywords.includes(keyword);
};

// 教育機構常見關鍵字
export const getEducationKeywords = () => [
  // 教學相關
  "教學專業", "師資優良", "教學生動", "教學有耐心", "易懂講解", "內容充實", 
  "實例教學", "實務操作", "理論結合實務", "小班制", "課程豐富", "學習氛圍好",
  
  // 教學品質
  "課程設計完整", "教材優質", "講義清晰", "作業實用", "測驗全面", "考題實用",
  "證照輔導完善", "證照高通過率", "就業輔導好", "業界資源豐富", "業界講師",
  
  // 環境設備
  "教室舒適", "設備新穎", "器材齊全", "環境安靜", "交通便利", "位置好找",
  "停車方便", "冷氣舒適", "座位舒適", "休息空間大", "教學設備齊全",
  
  // 行政服務
  "行政人員親切", "報名程序簡便", "課程諮詢詳細", "服務態度好", "問題解決快",
  "收費透明", "費用合理", "學費優惠", "教學資源豐富", "課後輔導佳",
  
  // 學習體驗/感受
  "學習有成就感", "收穫滿滿", "進步很多", "值得推薦", "CP值高", "時間運用有效",
  "同學互動好", "課堂氣氛佳", "學習壓力適中", "考試順利", "就業率高",
  
  // 年輕人用語
  "神課", "超讚", "很有料", "大推", "必修", "超優質", "超值得", "讚爆",
  "學會超多", "超有感", "很可", "無痛學習", "輕鬆上手", "考取證照沒問題"
];

// 檢查是否為教育機構
export const isEducationInstitution = (storeName: string, industry?: string | null): boolean => {
  // 檢查行業類別
  if (industry) {
    const educationIndustries = ['教育', '學校', '補習班', '補教', '培訓', '教學', '才藝', '學院', '課程'];
    if (educationIndustries.some(keyword => industry.includes(keyword))) {
      return true;
    }
  }
  
  // 檢查店名中的教育相關詞彙
  const educationKeywords = [
    '學校', '補習班', '安親班', '才藝班', '教室', '學院', '課程', '教育', 
    '培訓', '進修', '文理', '語言', '教學', '美術班', '音樂班', '舞蹈班',
    '升學', '家教', '輔導', '補教', '幼稚園', '幼兒園', '托兒所', '大學',
    '高中', '國中', '國小', '研究所', '教練', '學堂', '講堂', '學苑',
    '補習', '文教', '職訓', '補習'
  ];
  
  return educationKeywords.some(keyword => storeName.includes(keyword));
};

// 檢查關鍵字是否與現有選擇相似
export const isSimilarToExisting = (keyword: string, selectedKeywords: string[]): boolean => {
  const lowerKeyword = keyword.toLowerCase();
  return selectedKeywords.some(selectedKeyword => {
    const lowerSelectedKeyword = selectedKeyword.toLowerCase();
    // 簡單檢查是否包含相同的字詞
    return lowerSelectedKeyword.includes(lowerKeyword) || lowerKeyword.includes(lowerSelectedKeyword);
  });
};

// 格式化店家關鍵字
export const formatStoreKeywords = (storeKeywords: any[]): Keyword[] => {
  return storeKeywords.map(kw => ({
    id: kw.id,
    keyword: kw.keyword,
    category: kw.category || 'general',
    source: kw.source || 'manual',
    is_primary: kw.is_primary || false,
    usage_count: kw.usage_count || 0,
    priority: kw.priority || 0
  }));
};

// 檢查關鍵字是否曾經在之前的關鍵字組中出現過
export const isInPreviousKeywords = (keyword: string, previousKeywordSets: Set<string>): boolean => {
  return previousKeywordSets.has(keyword);
};

// 計算新鮮關鍵字比例 (根據生成次數調整)
export const calculateFreshRatio = (generationCount: number): number => {
  // 前幾次生成使用更多新鮮關鍵字，之後逐漸降低比例
  if (generationCount < 3) return 0.8;
  if (generationCount < 5) return 0.7;
  if (generationCount < 8) return 0.6;
  if (generationCount < 12) return 0.5;
  return 0.4; // 多次生成後，確保至少40%是新鮮關鍵字
};

// 檢查關鍵字是否適合該行業（排除非相關行業關鍵字）
export const isKeywordSuitableForIndustry = (keyword: string, industryType: 'optical' | 'education' | null): boolean => {
  // 如果是眼鏡行業，排除食物相關關鍵字
  if (industryType === 'optical') {
    return !isFoodRelatedKeyword(keyword);
  }
  
  // 未來可以加入更多行業的排除邏輯
  
  // 默認認為適合
  return true;
};

