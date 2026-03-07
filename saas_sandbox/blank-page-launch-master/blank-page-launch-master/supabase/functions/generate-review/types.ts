// 請求參數類型
export interface RequestBody {
  storeName: string;
  address: string;
  area?: string;
  keywords?: string[];
  description?: string;
  // 新增可選欄位（前端可能會傳遞）
  customFeelings?: string[];
  industry?: string;
  isEducationInstitution?: boolean;
  isOpticalStore?: boolean;
  sentimentAnalysis?: SentimentAnalysisPayload;
  reviewStyle?: ReviewStylePayload;
  guidelines?: unknown;
  complianceMode?: boolean;
  enforceNegativeWhenNeeded?: boolean;
}

// 回應數據類型
export interface ResponseData {
  review: string;
  style: string; // 特殊寫作風格（如「周星馳」），非情緒風格
  season: string;
  openingType: string;
  customerType: string;
  userRole?: string | null;
  wordCount: number;
  originalWordCount?: number;
  // 方便前端檢視本次生成的情緒風格資訊
  reviewStyleType?: 'negative' | 'balanced' | 'positive';
  tone?: string;
  starRating?: number;
}

// 前端傳來的情感分析摘要
export interface SentimentAnalysisPayload {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  negativeCount: number;
  positiveCount: number;
  categories: Record<string, string[]>;
}

// 前端傳來的評論風格建議
export interface ReviewStylePayload {
  style: 'negative' | 'balanced' | 'positive';
  tone: string;
  starRating: number;
  suggestions?: string[];
}

// 客戶類型
export interface CustomerType {
  type: string;
  name: string;
  characteristics: string;
}

// 開場白類型
export type OpeningType = 
  | 'direct' 
  | 'friendRecommendation' 
  | 'accidental' 
  | 'simple'
  | 'discovery'
  | 'experience'
  | 'story'
  | 'comparison'
  | 'seasonal'
  | 'special';

export interface OpeningTemplate {
  type: OpeningType;
  opening: string;
}

// 用戶角色類型
export type UserRole = 
  | 'parent' 
  | 'elder' 
  | 'student' 
  | 'professional' 
  | 'local_resident'
  | null;