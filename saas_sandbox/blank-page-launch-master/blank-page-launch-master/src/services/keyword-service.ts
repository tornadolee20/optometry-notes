
import { supabase } from "@/integrations/supabase/client";
import type { Keyword } from "@/types/store";
import { formatStoreKeywords, isEducationInstitution } from "@/utils/keyword-utils";

// 獲取店家設定的關鍵字
export const fetchStoreKeywords = async (storeId: string) => {
  const { data: storeKeywords, error: keywordsError } = await supabase
    .from('store_keywords')
    .select('*')
    .eq('store_id', storeId)
    .order('priority');

  if (keywordsError) {
    console.error('Error fetching store keywords:', keywordsError);
    throw keywordsError;
  }

  return formatStoreKeywords(storeKeywords || []);
};

// 獲取店家行業信息
export const fetchStoreIndustry = async (storeId: string) => {
  const { data: storeData, error: storeError } = await supabase
    .from('stores')
    .select('industry, store_name')
    .eq('id', storeId)
    .single();

  if (storeError) {
    console.error('Failed to fetch store data:', storeError);
    console.log('Store ID causing error:', storeId);
    return null; // 返回 null 而不是拋出異常，避免中斷流程
  }

  console.log('Store industry data:', storeData);
  
  // 智能判斷行業: 如果沒有明確行業但店名包含教育關鍵字，則設定為education
  if (!storeData?.industry && storeData?.store_name && isEducationInstitution(storeData.store_name)) {
    console.log('Detected education institution from store name:', storeData.store_name);
    return 'education';
  }
  
  return storeData?.industry;
};

// 獲取行業關鍵字
export const fetchIndustryKeywords = async (industry: string) => {
  console.log('Fetching industry keywords for:', industry);
  
  const { data: industryKeywordsData, error } = await supabase
    .from('industry_keywords')
    .select('keyword, usage_count')
    .eq('industry', industry)
    .order('usage_count', { ascending: false });

  if (error) {
    console.error('Error fetching industry keywords:', error);
    return [];
  }

  console.log(`Found ${industryKeywordsData?.length || 0} keywords for industry ${industry}`);
  return industryKeywordsData || [];
};

// 創建新的關鍵字對象
export const createKeywordObject = (
  keyword: string, 
  category: 'general' | 'service' | 'environment' | 'product' | 'area' = 'general', 
  source: 'manual' | 'ai' = 'ai', 
  isPrimary: boolean = false,
  usageCount: number = 0,
  priority: number = 0
): Keyword => {
  return {
    id: crypto.randomUUID(),
    keyword,
    category,
    source,
    is_primary: isPrimary,
    usage_count: usageCount,
    priority
  };
};
