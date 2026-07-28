/**
 * Vision Knowledge OS - 13 大核心資料物件 TypeScript 型別定義
 * 適用於：Next.js 前台、Sanity CMS、Supabase 資料庫與 AI RAG 檢索
 */

/** 1. Person: 人物與權威來源 */
export interface Person {
  id: string;
  name: string;
  display_name: string;
  role: string[];
  credentials: string[];
  organization?: string;
  bio_short: string;
  bio_long?: string;
  avatar?: string;
  expertise_topics: string[];
  social_links?: Record<string, string>;
  updated_at: string;
}

/** 2. Audience: 適用族群 */
export interface Audience {
  id: string;
  name: string;
  description: string;
  age_range?: string;
  life_stage?: string;
  needs: string[];
}

/** 3. Journey / Situation: 使用者情境與旅程階段 */
export interface Journey {
  id: string;
  name: string;
  description: string;
  audiences: string[]; // Audience IDs
  entry_questions: string[]; // Question IDs
  priority: number;
}

/** 4. Topic: 核心知識主題 */
export interface Topic {
  id: string;
  name: string;
  slug: string;
  aliases?: string[];
  definition_short: string;
  definition_long?: string;
  parent_topics?: string[]; // Topic IDs
  related_topics?: string[]; // Topic IDs
  audiences: string[]; // Audience IDs
  journeys: string[]; // Journey IDs
  hero_message?: string;
  persona_note?: string;
  status: 'draft' | 'published' | 'archived';
  reviewed_by: string; // Person ID
  updated_at: string;
}

/** 5. Question: 自然語言提問與 30 秒答案 */
export interface Question {
  id: string;
  question: string;
  slug: string;
  short_answer: string;
  long_answer?: string;
  why_people_ask?: string;
  emotional_context?: string; // 家長/使用者焦慮脈絡
  topics: string[]; // Topic IDs
  audiences: string[]; // Audience IDs
  journeys: string[]; // Journey IDs
  related_questions?: string[]; // Question IDs
  supported_by_research?: string[]; // Research IDs
  related_articles?: string[]; // Article IDs
  related_tools?: string[]; // Tool IDs
  risk_level: 'low' | 'medium' | 'high_consult_doctor';
  cta_type?: 'tool' | 'service' | 'article' | 'booking';
  updated_at: string;
}

/** 6. Article: 完整文章 */
export type ArticleType =
  | 'guide'
  | 'explainer'
  | 'comparison'
  | 'myth_busting'
  | 'case_story'
  | 'research_interpretation'
  | 'local_service'
  | 'policy_commentary';

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // Markdown / PortableText
  article_type: ArticleType;
  primary_question?: string; // Question ID
  topics: string[]; // Topic IDs
  series?: string; // Series ID
  categories?: string[];
  audiences: string[]; // Audience IDs
  journeys: string[]; // Journey IDs
  research_refs?: string[]; // Research IDs
  case_refs?: string[]; // Case IDs
  tool_refs?: string[]; // Tool IDs
  author: string; // Person ID
  reviewer?: string; // Person ID
  published_at: string;
  updated_at: string;
  medical_disclaimer: boolean;
  seo?: {
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
  };
  schema_types?: string[];
  status: 'draft' | 'published' | 'archived';
}

/** 7. Series: 有順序的主題學習路徑 */
export interface Series {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_message?: string;
  audiences: string[];
  journeys: string[];
  topics: string[];
  articles_ordered: string[]; // Ordered Article IDs
  tools?: string[];
  entry_question?: string;
  completion_message?: string;
  status: 'draft' | 'published';
}

/** 8. Research: 研究證據物件 */
export interface Research {
  id: string;
  title: string;
  citation: string;
  doi?: string;
  url?: string;
  publication?: string;
  publication_year: number;
  study_type?: string;
  population?: string;
  sample_size?: number;
  intervention?: string;
  comparison?: string;
  outcomes?: string;
  key_findings: string[];
  limitations: string[]; // 研究限制（重要邊界）
  clinical_interpretation: string; // 目鏡大叔臨床解讀
  what_it_can_answer: string[]; // 這篇研究可以回答什麼
  what_it_cannot_answer: string[]; // 這篇研究不能回答什麼
  topics: string[];
  questions_supported: string[];
  evidence_level: 'RCT' | 'Cohort' | 'CaseControl' | 'Review' | 'ExpertOpinion';
  reviewed_at: string;
}

/** 9. Case: 匿名臨床故事與真實決策 */
export interface Case {
  id: string;
  title: string;
  summary: string;
  situation: string;
  initial_belief: string; // 家長/患者原本的誤解
  observations: string; // 驗光師臨床觀察
  decision_process: string; // 決策與溝通過程
  outcome: string; // 結果
  lesson: string; // 大叔筆記與給讀者的建議
  topics: string[];
  questions: string[];
  audiences: string[];
  privacy_level: 'anonymized' | 'fictionalized_composite';
  consent_status: boolean;
  fictionalized: boolean;
}

/** 10. Tool: 互動計算與追蹤工具 */
export type ToolType =
  | 'calculator'
  | 'checklist'
  | 'tracker'
  | 'comparison'
  | 'decision_support'
  | 'report_reader'
  | 'questionnaire';

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  tool_type: ToolType;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  calculation_logic?: string;
  limitations: string[];
  risk_notice: string;
  topics: string[];
  questions: string[];
  audiences: string[];
  journeys: string[];
  requires_login: boolean;
  stores_user_data: boolean;
  version: string;
  updated_at: string;
}

/** 11. Service: 門市與專業服務 */
export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  who_is_it_for: string[];
  problems_addressed: string[];
  process: string[];
  duration?: string;
  price_display?: string;
  location?: string;
  booking_url?: string;
  topics: string[];
  questions: string[];
  tools?: string[];
  limitations?: string[];
  cta_text: string;
}

/** 12. Location: 地區與在地服務頁 */
export interface Location {
  id: string;
  name: string;
  slug: string;
  type: string;
  address: string;
  service_area: string[];
  transportation?: string[];
  parking?: string;
  nearby_landmarks?: string[];
  services: string[]; // Service IDs
  local_topics: string[];
  seo?: Record<string, string>;
}

/** 13. Media: 影音、Podcast、圖卡與音訊 */
export interface Media {
  id: string;
  title: string;
  media_type: 'video' | 'podcast' | 'infographic' | 'audio';
  url: string;
  transcript?: string;
  summary?: string;
  topics: string[];
  questions?: string[];
  articles?: string[];
  duration?: number; // seconds
  published_at: string;
}

/** 核心人設層 (Persona Layer) 共通欄位介面 */
export interface PersonaContext {
  hero_message: string;
  persona_note: string;
  common_emotion: string;
  clinical_observation: string;
  what_i_would_check_next: string;
}
