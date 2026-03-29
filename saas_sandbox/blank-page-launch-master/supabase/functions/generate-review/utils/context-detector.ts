// Context detection for maintaining logical consistency in reviews

export interface VisitContext {
  type: 'first' | 'repeat' | 'unknown';
  confidence: number;
  indicators: string[];
}

export interface WeatherContext {
  type: 'rainy' | 'sunny' | 'unknown';
  confidence: number;
  indicators: string[];
}

export interface ReviewContext {
  visit: VisitContext;
  weather: WeatherContext;
}

// First-time visit indicators
const FIRST_VISIT_PATTERNS = [
  '第一次', '初次', '第一回', '頭一次', '首次',
  '沒來過', '初來乍到', '第一次來', '初次體驗',
  '朋友推薦', '聽說', '網路看到', '路過看到',
  '不熟悉', '不太懂', '不知道流程', '有點緊張',
  '找不到路', '電話問路', '導航找很久'
];

// Repeat visit indicators
const REPEAT_VISIT_PATTERNS = [
  '又來', '再次', '回來', '常來', '經常來',
  '老客戶', '熟客', '認識', '習慣',
  '上次', '之前', '以前', '記得我',
  '還是老樣子', '一如既往', '依然',
  '固定來', '定期', '每次都'
];

// Rainy weather indicators
const RAINY_WEATHER_PATTERNS = [
  '下雨', '雨天', '淋雨', '雨傘',
  '濕濕的', '潮濕', '下雨天',
  '撐傘', '沒帶傘', '借傘',
  '雨勢', '陰雨', '毛毛雨'
];

// Sunny weather indicators  
const SUNNY_WEATHER_PATTERNS = [
  '太陽', '陽光', '晴天', '大晴天',
  '艷陽', '曝曬', '熱呼呼',
  '藍天', '好天氣', '天氣好'
];

export function detectVisitContext(text: string): VisitContext {
  const firstIndicators: string[] = [];
  const repeatIndicators: string[] = [];
  
  // Check for first-time indicators
  for (const pattern of FIRST_VISIT_PATTERNS) {
    if (text.includes(pattern)) {
      firstIndicators.push(pattern);
    }
  }
  
  // Check for repeat visit indicators
  for (const pattern of REPEAT_VISIT_PATTERNS) {
    if (text.includes(pattern)) {
      repeatIndicators.push(pattern);
    }
  }
  
  // Determine visit type based on indicators
  if (firstIndicators.length > 0 && repeatIndicators.length === 0) {
    return {
      type: 'first',
      confidence: Math.min(0.9, 0.3 + firstIndicators.length * 0.2),
      indicators: firstIndicators
    };
  }
  
  if (repeatIndicators.length > 0 && firstIndicators.length === 0) {
    return {
      type: 'repeat',
      confidence: Math.min(0.9, 0.3 + repeatIndicators.length * 0.2),
      indicators: repeatIndicators
    };
  }
  
  // Conflicting indicators or no indicators
  return {
    type: 'unknown',
    confidence: 0.1,
    indicators: [...firstIndicators, ...repeatIndicators]
  };
}

export function detectWeatherContext(text: string): WeatherContext {
  const rainyIndicators: string[] = [];
  const sunnyIndicators: string[] = [];
  
  // Check for rainy weather indicators
  for (const pattern of RAINY_WEATHER_PATTERNS) {
    if (text.includes(pattern)) {
      rainyIndicators.push(pattern);
    }
  }
  
  // Check for sunny weather indicators
  for (const pattern of SUNNY_WEATHER_PATTERNS) {
    if (text.includes(pattern)) {
      sunnyIndicators.push(pattern);
    }
  }
  
  // Determine weather type based on indicators
  if (rainyIndicators.length > 0 && sunnyIndicators.length === 0) {
    return {
      type: 'rainy',
      confidence: Math.min(0.9, 0.4 + rainyIndicators.length * 0.2),
      indicators: rainyIndicators
    };
  }
  
  if (sunnyIndicators.length > 0 && rainyIndicators.length === 0) {
    return {
      type: 'sunny',
      confidence: Math.min(0.9, 0.4 + sunnyIndicators.length * 0.2),
      indicators: sunnyIndicators
    };
  }
  
  // No clear weather indicators
  return {
    type: 'unknown',
    confidence: 0.1,
    indicators: [...rainyIndicators, ...sunnyIndicators]
  };
}

export function detectReviewContext(text: string): ReviewContext {
  return {
    visit: detectVisitContext(text),
    weather: detectWeatherContext(text)
  };
}