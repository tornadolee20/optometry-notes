
export interface Store {
  id: string;
  store_name: string;
  email: string;
  phone: string;
  address: string;
  user_id: string | null;
  description: string | null;
  google_review_url: string | null;
  created_at: string;
  updated_at: string;
  store_number: number;
  industry?: string | null;
  status: "pending" | "active" | "suspended" | "cancelled";
}

export interface StoreInfo {
  id: string;
  store_name: string;
  address: string;
  description: string;
  google_review_url: string;
  phone: string;
  email: string;
  store_number: number;
}

export interface Keyword {
  id: string;
  keyword: string;
  category: 'service' | 'environment' | 'product' | 'general' | 'area';
  source: 'manual' | 'ai' | 'system';
  is_primary?: boolean;
  usage_count?: number;
  priority?: number;
}

export interface KeywordSet {
  id: string;
  store_id: string;
  keywords: Keyword[];
  is_active: boolean;
  created_at: string;
}

export interface IndustryKeyword {
  keyword: string;
  usage_count: number;
}
