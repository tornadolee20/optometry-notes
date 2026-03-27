// Normalizers to convert DB rows to stable frontend types
import type { Store, Keyword } from '@/types/store';
import type { DbStore, DbStoreSubscription, DbStoreKeyword } from '@/types/db';

export interface StoreSubscription {
  id: string;
  plan_type: string;
  status: string;
  expires_at: string;
  trial_ends_at?: string;
  auto_renew: boolean;
  payment_source?: string;
  features?: any;
  created_at: string;
  updated_at: string;
}

export function mapDbStoreToStore(row: DbStore): Store {
  return {
    id: row.id,
    store_name: row.store_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    user_id: row.user_id,
    description: row.description,
    google_review_url: row.google_review_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    store_number: row.store_number,
    industry: row.industry,
    status: row.status ?? 'pending', // Default to 'pending' if null
  };
}

export function mapDbSubscriptionToStoreSubscription(row: DbStoreSubscription): StoreSubscription {
  return {
    id: row.id,
    plan_type: row.plan_type ?? 'trial',
    status: row.status ?? 'trial',
    expires_at: row.expires_at,
    trial_ends_at: row.trial_ends_at ?? undefined,
    auto_renew: row.auto_renew ?? false,
    payment_source: row.payment_source ?? undefined,
    features: row.features ?? {},
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapDbKeywordToKeyword(row: DbStoreKeyword): Keyword {
  // Map legacy category values to new ones
  let mappedCategory: 'service' | 'environment' | 'product' | 'general' | 'area' = 'general';
  if (row.category === 'location') {
    mappedCategory = 'area';
  } else if (row.category === 'experience') {
    mappedCategory = 'environment';
  } else if (row.category && ['service', 'environment', 'product', 'general', 'area'].includes(row.category)) {
    mappedCategory = row.category as 'service' | 'environment' | 'product' | 'general' | 'area';
  }

  return {
    id: row.id,
    keyword: row.keyword,
    category: mappedCategory,
    source: (row.source === 'manual' || row.source === 'ai' || row.source === 'system') ? row.source : 'manual',
    is_primary: row.is_primary ?? false,
    usage_count: row.usage_count ?? 0,
    priority: row.priority ?? 0,
  };
}