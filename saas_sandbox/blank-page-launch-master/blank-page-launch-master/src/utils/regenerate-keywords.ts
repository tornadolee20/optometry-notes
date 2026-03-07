
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
    const { data: storeData } = await (supabase as any)
      .from('stores')
      .select('industry, store_name, description')
      .eq('id', storeId)
      .single();
      
    const industry = await fetchStoreIndustry(storeId);
    console.log("獲取到店家行業:", industry);
    
    // 檢查店家類型
    const isEducation = isEducationInstitution(storeData?.store_name || '', industry);
    const isOptical = isOpticalStore(storeData?.store_name || '', industry);
    const industryType = isEducation ? 'education' : isOptical ? 'optical' : null;
    
    console.log("店家類型檢測:", 
      isEducation ? "教育機構" : 
      isOptical ? "眼鏡行業" : 
      "一般商家", 
      storeData?.store_name || ''
    );

    // 2. 獲取主要關鍵字 (優先級最高)
    const { data: primaryKeywordsData } = await (supabase as any)
      .from('store_keywords')
      .select('id, keyword, category, source, is_primary, usage_count, priority')
      .eq('store_id', storeId)
      .eq('is_primary', true);

    // 3. 如果有足夠的主要關鍵字和行業信息，調用 Edge Function 獲取更智慧的關鍵字
    if ((primaryKeywordsData && primaryKeywordsData.length > 0) || industry) {
      try {
        const formattedPrimaryKeywords = primaryKeywordsData ? 
          formatStoreKeywords(primaryKeywordsData).map(k => k.keyword) : [];
        
        console.log("調用 Edge Function 生成關鍵字");
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
          console.log("Edge Function 成功生成關鍵字:", data.keywords);
          
          // 如果是眼鏡行業，過濾掉食物相關關鍵字
          let filteredKeywords = data.keywords;
          if (isOptical) {
            filteredKeywords = data.keywords.filter((keyword: string) => 
              !isFoodRelatedKeyword(keyword)
            );
            
            // 如果過濾後關鍵字不足，從眼鏡行業關鍵字庫中補充
            if (filteredKeywords.length < 16) {
              const opticalKeywords = getOpticalKeywords();
              const missingCount = 16 - filteredKeywords.length;
              
              // 確保不重複
              const existingKeywords = new Set(filteredKeywords);
              const additionalKeywords = opticalKeywords
                .filter(k => !existingKeywords.has(k))
                .sort(() => Math.random() - 0.5)
                .slice(0, missingCount);
                
              filteredKeywords = [...filteredKeywords, ...additionalKeywords];
            }
            
            console.log("最終眼鏡行業關鍵字:", filteredKeywords);
          }
          
          // 將回傳的關鍵字轉換為 Keyword 對象
          const allKeywords = filteredKeywords.map((keyword: string, index: number) => {
            // 檢查是否為主要關鍵字
            const isPrimary = formattedPrimaryKeywords.includes(keyword);
            return createKeywordObject(
              keyword,
              'general',
              'ai',
              isPrimary,
              0,
              index
            );
          });

          // 更新關鍵字到數據庫
          const { error: upsertError } = await (supabase as any)
            .from('store_keywords')
            .upsert(
              allKeywords.map((kw: Keyword, index: number) => ({
                ...kw,
                store_id: storeId,
                priority: index
              })),
              { onConflict: 'id' } as any
            );

          if (upsertError) throw upsertError;
          return allKeywords;
        }
      } catch (apiError) {
        console.error('Edge Function 調用錯誤:', apiError);
        // 發生錯誤時繼續執行下面的備用邏輯
      }
    }

    // 備用邏輯：如果 Edge Function 調用失敗，使用本地邏輯生成關鍵字
    console.log("使用備用邏輯生成關鍵字");

    // 3. 獲取行業關鍵字 (用於補充)
    const industryKeywordsData = industry ? await fetchIndustryKeywords(industry) : [];
    console.log("獲取到行業關鍵字數量:", industryKeywordsData.length);

    // 4. 構建關鍵字列表
    let allKeywords: Keyword[] = [];

    // 添加主要關鍵字 (必須包含)
    if (primaryKeywordsData && primaryKeywordsData.length > 0) {
      allKeywords = formatStoreKeywords(primaryKeywordsData);
      console.log("添加主要關鍵字:", allKeywords.map(k => k.keyword));
    }

    // 添加特定行業關鍵字
    if (isOptical && allKeywords.length < 16) {
      console.log("添加眼鏡行業專用關鍵字");
      const opticalKeywords = getOpticalKeywords();
      
      // 打亂眼鏡關鍵字順序
      const shuffledOpticalKeywords = [...opticalKeywords]
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5);
      
      // 確保不重複
      const existingKeywords = new Set(allKeywords.map(k => k.keyword));
      const opticalCount = Math.min(12, 16 - allKeywords.length);
      
      const selectedOpticalKeywords = shuffledOpticalKeywords
        .filter(k => !existingKeywords.has(k))
        .slice(0, opticalCount)
        .map((keyword, index) => createKeywordObject(
          keyword,
          'general',
          'ai',
          false,
          0,
          allKeywords.length + index
        ));
          
      allKeywords = [...allKeywords, ...selectedOpticalKeywords];
      console.log("添加眼鏡專用關鍵字後總數:", allKeywords.length, "新添加:", selectedOpticalKeywords.map(k => k.keyword));
    }
    // 添加行業關鍵字 (確保至少有一半的關鍵字來自行業)
    else if (industryKeywordsData.length > 0) {
      // 計算需要的行業關鍵字數量，確保至少有8個來自行業
      const desiredIndustryKeywordCount = Math.max(8, 16 - allKeywords.length);
      const remainingSlots = 16 - allKeywords.length;
      const industryKeywordCount = Math.min(remainingSlots, desiredIndustryKeywordCount);
      
      console.log("計劃添加行業關鍵字數量:", industryKeywordCount);

      // 按使用次數排序，先隨機打亂然後再根據使用頻率選擇，增加每次變化的可能性
      const shuffledIndustryKeywords = [...industryKeywordsData]
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5)
        .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
        .slice(0, industryKeywordCount * 3); // 取出更多候選詞，大幅增加隨機性
      
      // 再隨機洗牌，保持更高的多樣性
      const finalIndustryKeywords = shuffledIndustryKeywords
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5)
        .slice(0, industryKeywordCount);
      
      const additionalKeywords = finalIndustryKeywords
        .map((ik, index) => createKeywordObject(
          ik.keyword,
          'general',
          'ai',
          false,
          ik.usage_count || 0,
          allKeywords.length + index
        ));
        
      allKeywords = [...allKeywords, ...additionalKeywords];
      console.log("添加行業關鍵字後總數:", allKeywords.length, "新添加:", additionalKeywords.map(k => k.keyword));
    }
    // 如果是教育機構且沒有足夠的行業關鍵字, 添加教育專用關鍵字
    else if (isEducation && allKeywords.length < 16) {
      console.log("添加教育專用關鍵字");
      const educationKeywords = getEducationKeywords();
      
      // 三重隨機打亂教育關鍵字
      const shuffledEducationKeywords = [...educationKeywords]
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5);
      
      // 確保不重複
      const existingKeywords = new Set(allKeywords.map(k => k.keyword));
      const educationCount = Math.min(12, 16 - allKeywords.length); // 盡量使用更多教育關鍵字
      
      const selectedEducationKeywords = shuffledEducationKeywords
        .filter(k => !existingKeywords.has(k))
        .slice(0, educationCount)
        .map((keyword, index) => createKeywordObject(
          keyword,
          'general',
          'ai',
          false,
          0,
          allKeywords.length + index
        ));
          
      allKeywords = [...allKeywords, ...selectedEducationKeywords];
      console.log("添加教育專用關鍵字後總數:", allKeywords.length, "新添加:", selectedEducationKeywords.map(k => k.keyword));
    }

    // 使用預設關鍵字填充到 16 個，同樣增加隨機性
    if (allKeywords.length < 16) {
      // 為教育機構或眼鏡行業使用專門的默認關鍵字
      const defaultKeywords = getDefaultKeywords(industryType);
      
      // 每次徹底打亂預設關鍵字，確保高度隨機性
      const shuffledDefaults = [...defaultKeywords]
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5); // 三重洗牌

      console.log("需要補充預設關鍵字數量:", 16 - allKeywords.length);

      // 確保不重複
      const existingKeywords = new Set(allKeywords.map(k => k.keyword));
      const remainingDefaults = shuffledDefaults
        .filter(dk => !existingKeywords.has(dk))
        .slice(0, 16 - allKeywords.length)
        .map((keyword, index) => createKeywordObject(
          keyword,
          'general',
          'ai',
          false,
          0,
          allKeywords.length + index
        ));
          
      allKeywords = [...allKeywords, ...remainingDefaults];
      console.log("添加預設關鍵字後總數:", allKeywords.length, "新添加:", remainingDefaults.map(k => k.keyword));
    }
    
    // 如果是眼鏡行業，過濾掉食物相關關鍵字
    if (isOptical) {
      const beforeCount = allKeywords.length;
      allKeywords = allKeywords.filter(kw => 
        isKeywordSuitableForIndustry(kw.keyword, 'optical')
      );
      
      // 如果過濾後關鍵字不足，從眼鏡行業關鍵字庫中補充
      if (allKeywords.length < 16) {
        console.log(`過濾後關鍵字數量不足，從 ${beforeCount} 減少到 ${allKeywords.length}，需要補充`);
        
        const opticalKeywords = getOpticalKeywords();
        const neededCount = 16 - allKeywords.length;
        
        // 確保不重複
        const existingKeywords = new Set(allKeywords.map(k => k.keyword));
        const additionalKeywords = opticalKeywords
          .filter(k => !existingKeywords.has(k))
          .sort(() => Math.random() - 0.5)
          .slice(0, neededCount)
          .map((keyword, index) => createKeywordObject(
            keyword,
            'general',
            'ai',
            false,
            0,
            allKeywords.length + index
          ));
          
        allKeywords = [...allKeywords, ...additionalKeywords];
        console.log("補充眼鏡關鍵字後總數:", allKeywords.length);
      }
    }

    // 更新關鍵字到數據庫
  const { error: upsertError } = await (supabase as any)
    .from('store_keywords')
    .upsert(
      allKeywords.map((kw: Keyword, index: number) => ({
        ...kw,
        store_id: storeId,
        priority: index
      })),
      { onConflict: 'id' } as any
    );

    if (upsertError) throw upsertError;

    console.log("最終關鍵字列表:", allKeywords.map(k => k.keyword));
    return allKeywords;
  } catch (error) {
    console.error('Error regenerating keywords:', error);
    throw error;
  }
};
