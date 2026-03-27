
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Keyword } from "@/types/store";
import { supabase } from "@/integrations/supabase/client";
import { fetchStoreKeywords, fetchStoreIndustry } from "@/services/keyword-service";
import { 
  selectPrimaryKeywords, 
  selectStoreKeywords, 
  selectIndustryKeywords,
  selectEducationKeywords,
  selectOpticalKeywords,
  fillWithDefaultKeywords
} from "@/utils/keyword-strategies";
import { 
  isEducationInstitution, 
  isOpticalStore, 
  isKeywordSuitableForIndustry,
  isFoodRelatedKeyword
} from "@/utils/keyword-utils";

export const useKeywordGenerator = (storeId: string, initialKeywords: Keyword[] = []) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords);
  const [previousKeywordSets, setPreviousKeywordSets] = useState<Set<string>>(new Set());
  const [generationCount, setGenerationCount] = useState(0);
  const [lastGeneratedSet, setLastGeneratedSet] = useState<string[]>([]);
  const [storeIndustry, setStoreIndustry] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('');
  const [storeDescription, setStoreDescription] = useState<string>('');
  const [originalKeywordCount, setOriginalKeywordCount] = useState<number>(0);

  useEffect(() => {
    setKeywords(initialKeywords);
    // 初始化時記錄當前關鍵字
    if (initialKeywords.length > 0) {
      const initialKeywordTexts = initialKeywords.map(k => k.keyword);
      setPreviousKeywordSets(new Set(initialKeywordTexts));
      setLastGeneratedSet(initialKeywordTexts);
    }
    
    // 獲取店家資訊
    const getStoreInfo = async () => {
      try {
        const industry = await fetchStoreIndustry(storeId);
        setStoreIndustry(industry);
        
        // 獲取店家名稱和描述
        const { data } = await supabase
          .from('stores')
          .select('store_name, description')
          .eq('id', storeId)
          .single();
          
        if (data) {
          setStoreName(data.store_name || '');
          setStoreDescription(data.description || '');
        }
      } catch (error) {
        console.error('Error fetching store info:', error);
      }
    };
    
    getStoreInfo();
  }, [initialKeywords, storeId]);

  const regenerateKeywords = async () => {
    try {
      setIsGenerating(true);
      console.log("開始生成新關鍵字組合", generationCount + 1);

      // 檢查店家類型
      const isEducation = isEducationInstitution(storeName, storeIndustry);
      const isOptical = isOpticalStore(storeName, storeIndustry);
      const industryType = isEducation ? 'education' : isOptical ? 'optical' : null;
      
      console.log("店家類型檢測:", 
        isEducation ? "教育機構" : 
        isOptical ? "眼鏡行業" : 
        "一般商家", storeName);

      // 1. 獲取店家設定的關鍵字
      const formattedStoreKeywords = await fetchStoreKeywords(storeId);

      // 依據店家已設定關鍵字數量套用分組規則
      const totalStoreKeywords = formattedStoreKeywords.length;
      setOriginalKeywordCount(totalStoreKeywords);

      // 情境一：店家有 48+ 個關鍵字 → 從這些中隨機取 16 個為一組
      if (totalStoreKeywords >= 48) { // 固定上限 48
        console.log(`店家共有 ${totalStoreKeywords} 個關鍵字，從中隨機選取 16 個`);
        
        // 三重洗牌確保充分隨機化
        let picked = [...formattedStoreKeywords]
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5)
          .slice(0, 16);

        setKeywords(picked);

        const newKeywordTexts = picked.map(k => k.keyword);
        console.log('本次選中的關鍵字:', newKeywordTexts);
        
        setLastGeneratedSet(newKeywordTexts);
        const updatedPreviousKeywords = new Set(previousKeywordSets);
        newKeywordTexts.forEach(k => updatedPreviousKeywords.add(k));
        setPreviousKeywordSets(updatedPreviousKeywords);
        setGenerationCount(prev => prev + 1);

        toast({ title: "成功", description: `已從 ${totalStoreKeywords} 個關鍵字中隨機選取 16 個` });
        return picked;
      }

      // 情境二：店家只有 16 個關鍵字 → 直接使用這 16 個關鍵字，火力集中
      if (totalStoreKeywords === 16) {
        console.log(`店家設定了 ${totalStoreKeywords} 個關鍵字，直接使用全部 16 個`);
        
        // 直接使用店家設定的 16 個關鍵字，不做任何更改
        setKeywords(formattedStoreKeywords);

        const newKeywordTexts = formattedStoreKeywords.map(k => k.keyword);
        console.log('使用店家設定的關鍵字:', newKeywordTexts);
        
        setLastGeneratedSet(newKeywordTexts);
        const updatedPreviousKeywords = new Set(previousKeywordSets);
        newKeywordTexts.forEach(k => updatedPreviousKeywords.add(k));
        setPreviousKeywordSets(updatedPreviousKeywords);
        setGenerationCount(prev => prev + 1);

        toast({ title: "成功", description: "使用您設定的 16 個關鍵字" });
        return formattedStoreKeywords;
      }

      // 情境三：店家關鍵字介於 17~47 → 直接從店家關鍵字中隨機選取 16 個
      if (totalStoreKeywords > 16 && totalStoreKeywords < 48) { // 固定範圍
        console.log(`店家有 ${totalStoreKeywords} 個關鍵字，直接從中隨機選取 16 個`);
        
        // 直接從店家關鍵字中隨機選16個，不補足
        const picked = [...formattedStoreKeywords]
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5)
          .slice(0, 16);

        setKeywords(picked);

        const newKeywordTexts = picked.map(k => k.keyword);
        console.log('本次選中的關鍵字:', newKeywordTexts);
        
        setLastGeneratedSet(newKeywordTexts);
        const updatedPreviousKeywords = new Set(previousKeywordSets);
        newKeywordTexts.forEach(k => updatedPreviousKeywords.add(k));
        setPreviousKeywordSets(updatedPreviousKeywords);
        setGenerationCount(prev => prev + 1);

        toast({ title: "成功", description: `已從您的 ${totalStoreKeywords} 個關鍵字中隨機選取 16 個` });
        return picked;
      }

      // 2. 首先檢查主要關鍵字
      const primaryKeywords = formattedStoreKeywords
        .filter(k => k.is_primary)
        .map(k => k.keyword);
        
      // 3. 嘗試使用 Edge Function 生成更智慧的關鍵字
      if (storeName && (primaryKeywords.length > 0 || storeIndustry)) {
        try {
          console.log("調用 Edge Function 生成關鍵字");
          const { data, error } = await supabase.functions.invoke(
            'generate-keywords',
            {
              body: JSON.stringify({
                storeName: storeName,
                industry: storeIndustry,
                description: storeDescription,
                primaryKeywords: primaryKeywords,
                isOpticalStore: isOptical,
                isEducationInstitution: isEducation
              }),
            }
          );

          if (!error && data?.keywords && data.keywords.length > 0) {
            console.log("Edge Function 成功生成關鍵字:", data.keywords);
            
            // 如果是眼鏡行業，確保排除食物相關關鍵字
            let filteredKeywords = data.keywords;
            if (isOptical) {
              filteredKeywords = data.keywords.filter((keyword: string) => 
                !isFoodRelatedKeyword(keyword)
              );
              console.log("過濾後的眼鏡行業關鍵字:", filteredKeywords);
              
              // 如果過濾後關鍵字不足，從眼鏡行業關鍵字庫中補充
              if (filteredKeywords.length < 16) {
                const missingCount = 16 - filteredKeywords.length;
                const { selectedKeywords: opticalKeywords } = await selectOpticalKeywords(
                  filteredKeywords,
                  [],
                  previousKeywordSets
                );
                filteredKeywords = [...filteredKeywords, ...opticalKeywords.slice(0, missingCount)];
                console.log("補充後的眼鏡行業關鍵字:", filteredKeywords);
              }
            }
            
            // 將回傳的關鍵字轉換為 Keyword 對象
            const keywordObjects = filteredKeywords.map((keyword: string, index: number) => {
              // 檢查是否為主要關鍵字
              const isPrimary = primaryKeywords.includes(keyword);
              return {
                id: crypto.randomUUID(),
                keyword,
                category: 'general',
                source: 'ai',
                is_primary: isPrimary,
                usage_count: 0,
                priority: index
              } as Keyword;
            });

            setKeywords(keywordObjects);
            
            // 更新最後一次生成的關鍵字集
            const newKeywordTexts = keywordObjects.map((k: Keyword) => k.keyword);
            setLastGeneratedSet(newKeywordTexts);
            
            // 追蹤所有曾經出現過的關鍵字
            const updatedPreviousKeywords = new Set(previousKeywordSets);
            newKeywordTexts.forEach((k: string) => updatedPreviousKeywords.add(k));
            setPreviousKeywordSets(updatedPreviousKeywords);
            
            // 增加生成計數，用於控制多樣性比例
            setGenerationCount(prev => prev + 1);
            
            toast({
              title: "成功",
              description: "已更新關鍵字組合",
            });
            
            return keywordObjects;
          }
        } catch (apiError) {
          console.error('Edge Function 調用錯誤:', apiError);
          // 發生錯誤時繼續執行下面的備用邏輯
        }
      }
      
      // 4. 如果 Edge Function 失敗，使用本地邏輯
      console.log("使用本地邏輯生成關鍵字");
      
      // 首先添加主要關鍵字 (這些通常是必須包含的，例如地區名稱)
      let { selectedKeywords, allKeywords } = selectPrimaryKeywords(formattedStoreKeywords);
      
      // 從非主要店家關鍵字中選擇，確保最大多樣性
      const storeKeywordsResult = selectStoreKeywords(
        formattedStoreKeywords, 
        selectedKeywords, 
        allKeywords, 
        previousKeywordSets, 
        generationCount
      );
      selectedKeywords = storeKeywordsResult.selectedKeywords;
      allKeywords = storeKeywordsResult.allKeywords;

      // 如果是眼鏡行業，優先使用眼鏡行業關鍵字
      if (isOptical && allKeywords.length < 16) {
        console.log("使用眼鏡行業專用關鍵字");
        const opticalResult = await selectOpticalKeywords(
          selectedKeywords,
          allKeywords,
          previousKeywordSets
        );
        selectedKeywords = opticalResult.selectedKeywords;
        allKeywords = opticalResult.allKeywords;
      }
      // 如果是教育機構，優先使用教育關鍵字
      else if (isEducation && allKeywords.length < 16) {
        console.log("使用教育機構專用關鍵字");
        const educationResult = await selectEducationKeywords(
          selectedKeywords,
          allKeywords,
          previousKeywordSets
        );
        selectedKeywords = educationResult.selectedKeywords;
        allKeywords = educationResult.allKeywords;
      }
      // 如果還不夠 16 個，從行業關鍵字中補充
      else if (allKeywords.length < 16 && storeIndustry) {
        const industryKeywordsResult = await selectIndustryKeywords(
          storeIndustry, 
          selectedKeywords, 
          allKeywords, 
          previousKeywordSets
        );
        selectedKeywords = industryKeywordsResult.selectedKeywords;
        allKeywords = industryKeywordsResult.allKeywords;
      }

      // 如果還不夠 16 個，添加預設關鍵字
      const finalResult = fillWithDefaultKeywords(selectedKeywords, allKeywords, industryType);
      allKeywords = finalResult.allKeywords;
      
      // 如果是眼鏡行業，確保排除食物相關的關鍵字
      if (isOptical) {
        allKeywords = allKeywords.filter(kw => 
          isKeywordSuitableForIndustry(kw.keyword, 'optical')
        );
        
        // 如果過濾後關鍵字不足，從眼鏡行業關鍵字庫中補充
        if (allKeywords.length < 16) {
          const { allKeywords: opticalKeywords } = await selectOpticalKeywords(
            allKeywords.map(k => k.keyword),
            [],
            previousKeywordSets
          );
          
          // 只取需要的數量補充到16個
          const neededCount = 16 - allKeywords.length;
          const supplementaryKeywords = opticalKeywords.slice(0, neededCount);
          
          allKeywords = [...allKeywords, ...supplementaryKeywords];
        }
      }

      // 確保當前生成的關鍵字集與上一次有顯著差異
      const newKeywordTexts = allKeywords.map(k => k.keyword);
      const lastSetStr = new Set(lastGeneratedSet);
      const overlapCount = newKeywordTexts.filter(k => lastSetStr.has(k)).length;
      
      // 如果重疊度高於50%，重新整理順序以增加差異感
      if (overlapCount > allKeywords.length * 0.5) {
        // 徹底打亂順序，確保顯示的順序完全不同
        allKeywords = allKeywords
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5);
      }
      
      // 更新已使用的關鍵字集合
      console.log('生成前關鍵字:', Array.from(previousKeywordSets));
      console.log('本次生成關鍵字:', newKeywordTexts);
      
      // 更新最後一次生成的關鍵字集
      setLastGeneratedSet(newKeywordTexts);
      
      // 追蹤所有曾經出現過的關鍵字
      const updatedPreviousKeywords = new Set(previousKeywordSets);
      newKeywordTexts.forEach(k => updatedPreviousKeywords.add(k));
      setPreviousKeywordSets(updatedPreviousKeywords);
      
      // 增加生成計數，用於控制多樣性比例
      setGenerationCount(prev => prev + 1);
      
      setKeywords(allKeywords);

      toast({
        title: "成功",
        description: "已更新關鍵字組合",
      });

      return allKeywords;
    } catch (error) {
      console.error('Error regenerating keywords:', error);
      toast({
        variant: "destructive",
        title: "錯誤",
        description: "無法更新關鍵字組合",
      });
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    keywords,
    isGenerating,
    regenerateKeywords,
    originalKeywordCount
  };
};
