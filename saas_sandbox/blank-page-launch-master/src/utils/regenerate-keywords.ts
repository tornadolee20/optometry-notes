
import { supabase } from "@/integrations/supabase/client";
import type { Keyword } from "@/types/store";
import { createKeywordObject, fetchStoreIndustry, fetchIndustryKeywords } from "@/services/keyword-service";
import { 
  getDefaultKeywords, 
  getEducationKeywords, 
  getOpticalKeywords, 
  isEducationInstitution, 
  isOpticalStore, 
  formatStoreKeywords,
  isFoodRelatedKeyword,
  isKeywordSuitableForIndustry
} from "@/utils/keyword-utils";

export const regenerateKeywords = async (storeId: string): Promise<Keyword[]> => {
  try {
    // 1. 獲取店家資訊
    const { data: storeData } = await supabase
      .from('stores')
      .select('industry, store_name, description')
      .eq('id', storeId)
      .single();
      
    const industry = await fetchStoreIndustry(storeId);
    
    // 檢查店家類型
    const isEducation = isEducationInstitution(storeData?.store_name || '', industry);
    const isOptical = isOpticalStore(storeData?.store_name || '', industry);
    const industryType = isEducation ? 'education' : isOptical ? 'optical' : null;

    // 2. 獲取主要關鍵字 (優先級最高)
    const { data: primaryKeywordsData } = await supabase
      .from('store_keywords')
      .select('id, keyword, category, source, is_primary, usage_count, priority')
      .eq('store_id', storeId)
      .eq('is_primary', true);

    // 3. 如果有足夠的主要關鍵字和行業信息，調用 Edge Function 獲取更智慧的關鍵字
    if ((primaryKeywordsData && primaryKeywordsData.length > 0) || industry) {
      try {
        const formattedPrimaryKeywords = primaryKeywordsData ? 
          formatStoreKeywords(primaryKeywordsData).map(k => k.keyword) : [];
        
        const { data, error } = await supabase.functions.invoke(
          'generate-keywords',
          {
            body: JSON.stringify({
              storeName: storeData?.store_name || '',
              industry: industry,
              description: storeData?.description || '',
              primaryKeywords: formattedPrimaryKeywords,
              isOpticalStore: isOptical,
              isEducationInstitution: isEducation
            }),
          }
        );

        if (!error && data?.keywords && data.keywords.length > 0) {
          // 如果是眼鏡行業，過濾掉食物相關關鍵字
          let filteredKeywords = data.keywords;
          if (isOptical) {
            filteredKeywords = data.keywords.filter((keyword: string) => 
              !isFoodRelatedKeyword(keyword)
            );
            
            if (filteredKeywords.length < 16) {
              const opticalKeywords = getOpticalKeywords();
              const missingCount = 16 - filteredKeywords.length;
              const existingKeywords = new Set(filteredKeywords);
              const additionalKeywords = opticalKeywords
                .filter(k => !existingKeywords.has(k))
                .sort(() => Math.random() - 0.5)
                .slice(0, missingCount);
                
              filteredKeywords = [...filteredKeywords, ...additionalKeywords];
            }
          }
          
          const allKeywords = filteredKeywords.map((keyword: string, index: number) => {
            const isPrimary = formattedPrimaryKeywords.includes(keyword);
            return createKeywordObject(keyword, 'general', 'ai', isPrimary, 0, index);
          });

          const catMap2: Record<string, string> = { area: 'location', environment: 'experience' };
          const { error: upsertError } = await supabase
            .from('store_keywords')
            .upsert(
              allKeywords.map((kw: Keyword, index: number) => ({
                ...kw,
                category: (catMap2[kw.category] || kw.category) as 'general' | 'product' | 'service' | 'location' | 'experience',
                store_id: storeId,
                priority: index
              }))
            );

          if (upsertError) throw upsertError;
          return allKeywords;
        }
      } catch (apiError) {
        console.error('Edge Function 調用錯誤:', apiError);
      }
    }

    // 備用邏輯：使用本地邏輯生成關鍵字
    const industryKeywordsData = industry ? await fetchIndustryKeywords(industry) : [];

    // 構建關鍵字列表
    let allKeywords: Keyword[] = [];

    if (primaryKeywordsData && primaryKeywordsData.length > 0) {
      allKeywords = formatStoreKeywords(primaryKeywordsData);
    }

    // 添加特定行業關鍵字
    if (isOptical && allKeywords.length < 16) {
      const opticalKeywords = getOpticalKeywords();
      const shuffledOpticalKeywords = [...opticalKeywords]
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5);
      
      const existingKeywords = new Set(allKeywords.map(k => k.keyword));
      const opticalCount = Math.min(12, 16 - allKeywords.length);
      
      const selectedOpticalKeywords = shuffledOpticalKeywords
        .filter(k => !existingKeywords.has(k))
        .slice(0, opticalCount)
        .map((keyword, index) => createKeywordObject(keyword, 'general', 'ai', false, 0, allKeywords.length + index));
          
      allKeywords = [...allKeywords, ...selectedOpticalKeywords];
    }
    else if (industryKeywordsData.length > 0) {
      const desiredIndustryKeywordCount = Math.max(8, 16 - allKeywords.length);
      const remainingSlots = 16 - allKeywords.length;
      const industryKeywordCount = Math.min(remainingSlots, desiredIndustryKeywordCount);

      const shuffledIndustryKeywords = [...industryKeywordsData]
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5)
        .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
        .slice(0, industryKeywordCount * 3);
      
      const finalIndustryKeywords = shuffledIndustryKeywords
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5)
        .slice(0, industryKeywordCount);
      
      const additionalKeywords = finalIndustryKeywords
        .map((ik, index) => createKeywordObject(ik.keyword, 'general', 'ai', false, ik.usage_count || 0, allKeywords.length + index));
        
      allKeywords = [...allKeywords, ...additionalKeywords];
    }
    else if (isEducation && allKeywords.length < 16) {
      const educationKeywords = getEducationKeywords();
      const shuffledEducationKeywords = [...educationKeywords]
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5);
      
      const existingKeywords = new Set(allKeywords.map(k => k.keyword));
      const educationCount = Math.min(12, 16 - allKeywords.length);
      
      const selectedEducationKeywords = shuffledEducationKeywords
        .filter(k => !existingKeywords.has(k))
        .slice(0, educationCount)
        .map((keyword, index) => createKeywordObject(keyword, 'general', 'ai', false, 0, allKeywords.length + index));
          
      allKeywords = [...allKeywords, ...selectedEducationKeywords];
    }

    // 使用預設關鍵字填充到 16 個
    if (allKeywords.length < 16) {
      const defaultKeywords = getDefaultKeywords(industryType);
      const shuffledDefaults = [...defaultKeywords]
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5);

      const existingKeywords = new Set(allKeywords.map(k => k.keyword));
      const remainingDefaults = shuffledDefaults
        .filter(dk => !existingKeywords.has(dk))
        .slice(0, 16 - allKeywords.length)
        .map((keyword, index) => createKeywordObject(keyword, 'general', 'ai', false, 0, allKeywords.length + index));
          
      allKeywords = [...allKeywords, ...remainingDefaults];
    }
    
    // 如果是眼鏡行業，過濾掉食物相關關鍵字
    if (isOptical) {
      allKeywords = allKeywords.filter(kw => 
        isKeywordSuitableForIndustry(kw.keyword, 'optical')
      );
      
      if (allKeywords.length < 16) {
        const opticalKeywords = getOpticalKeywords();
        const neededCount = 16 - allKeywords.length;
        const existingKeywords = new Set(allKeywords.map(k => k.keyword));
        const additionalKeywords = opticalKeywords
          .filter(k => !existingKeywords.has(k))
          .sort(() => Math.random() - 0.5)
          .slice(0, neededCount)
          .map((keyword, index) => createKeywordObject(keyword, 'general', 'ai', false, 0, allKeywords.length + index));
          
        allKeywords = [...allKeywords, ...additionalKeywords];
      }
    }

    // 更新關鍵字到數據庫
    const catMap: Record<string, string> = { area: 'location', environment: 'experience' };
    const { error: upsertError } = await supabase
      .from('store_keywords')
      .upsert(
        allKeywords.map((kw: Keyword, index: number) => ({
          ...kw,
          category: (catMap[kw.category] || kw.category) as 'general' | 'product' | 'service' | 'location' | 'experience',
          store_id: storeId,
          priority: index
        }))
      );

    if (upsertError) throw upsertError;

    return allKeywords;
  } catch (error) {
    console.error('Error regenerating keywords:', error);
    throw error;
  }
};