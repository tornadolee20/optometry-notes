// Database row types - mirrors actual Supabase schema with nullable fields
export interface DbStore {
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
  status: "pending" | "active" | "suspended" | "cancelled" | null;
}

export interface DbStoreSubscription {
  id: string;
  store_id: string | null;
  plan_type: string | null;
  status: string | null;
  expires_at: string;
  trial_ends_at: string | null;
  auto_renew: boolean | null;
  payment_source: string | null;
  features: any;
  created_at: string;
  updated_at: string;
}

export interface DbStoreKeyword {
  id: string;
  store_id: string | null;
  keyword: string;
  category: 'service' | 'environment' | 'product' | 'general' | 'area' | 'location' | 'experience' | null;
  source: string | null; // Allow any string value from DB
  is_primary?: boolean | null;
  usage_count?: number | null;
  priority?: number | null;
  industry: string | null;
  created_at: string;
  updated_at: string;
}