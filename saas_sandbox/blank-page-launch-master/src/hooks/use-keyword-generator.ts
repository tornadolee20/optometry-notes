
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
    if (initialKeywords.length > 0) {
      const initialKeywordTexts = initialKeywords.map(k => k.keyword);
      setPreviousKeywordSets(new Set(initialKeywordTexts));
      setLastGeneratedSet(initialKeywordTexts);
    }
    
    const getStoreInfo = async () => {
      try {
        const industry = await fetchStoreIndustry(storeId);
        setStoreIndustry(industry);
        
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

      const isEducation = isEducationInstitution(storeName, storeIndustry);
      const isOptical = isOpticalStore(storeName, storeIndustry);
      const industryType = isEducation ? 'education' : isOptical ? 'optical' : null;

      // 1. 獲取店家設定的關鍵字
      const formattedStoreKeywords = await fetchStoreKeywords(storeId);
      const totalStoreKeywords = formattedStoreKeywords.length;
      setOriginalKeywordCount(totalStoreKeywords);

      // 情境一：店家有 48+ 個關鍵字 → 從這些中隨機取 16 個為一組
      if (totalStoreKeywords >= 48) {
        let picked = [...formattedStoreKeywords]
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5)
          .slice(0, 16);

        setKeywords(picked);
        const newKeywordTexts = picked.map(k => k.keyword);
        setLastGeneratedSet(newKeywordTexts);
        const updatedPreviousKeywords = new Set(previousKeywordSets);
        newKeywordTexts.forEach(k => updatedPreviousKeywords.add(k));
        setPreviousKeywordSets(updatedPreviousKeywords);
        setGenerationCount(prev => prev + 1);
        toast({ title: "成功", description: `已從 ${totalStoreKeywords} 個關鍵字中隨機選取 16 個` });
        return picked;
      }

      // 情境二：店家只有 16 個關鍵字 → 直接使用這 16 個關鍵字
      if (totalStoreKeywords === 16) {
        setKeywords(formattedStoreKeywords);
        const newKeywordTexts = formattedStoreKeywords.map(k => k.keyword);
        setLastGeneratedSet(newKeywordTexts);
        const updatedPreviousKeywords = new Set(previousKeywordSets);
        newKeywordTexts.forEach(k => updatedPreviousKeywords.add(k));
        setPreviousKeywordSets(updatedPreviousKeywords);
        setGenerationCount(prev => prev + 1);
        toast({ title: "成功", description: "使用您設定的 16 個關鍵字" });
        return formattedStoreKeywords;
      }

      // 情境三：店家關鍵字介於 17~47 → 直接從店家關鍵字中隨機選取 16 個
      if (totalStoreKeywords > 16 && totalStoreKeywords < 48) {
        const picked = [...formattedStoreKeywords]
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5)
          .slice(0, 16);

        setKeywords(picked);
        const newKeywordTexts = picked.map(k => k.keyword);
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
            let filteredKeywords = data.keywords;
            if (isOptical) {
              filteredKeywords = data.keywords.filter((keyword: string) => 
                !isFoodRelatedKeyword(keyword)
              );
              
              if (filteredKeywords.length < 16) {
                const missingCount = 16 - filteredKeywords.length;
                const { selectedKeywords: opticalKeywords } = await selectOpticalKeywords(
                  filteredKeywords,
                  [],
                  previousKeywordSets
                );
                filteredKeywords = [...filteredKeywords, ...opticalKeywords.slice(0, missingCount)];
              }
            }
            
            const keywordObjects = filteredKeywords.map((keyword: string, index: number) => {
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
            const newKeywordTexts = keywordObjects.map((k: Keyword) => k.keyword);
            setLastGeneratedSet(newKeywordTexts);
            const updatedPreviousKeywords = new Set(previousKeywordSets);
            newKeywordTexts.forEach((k: string) => updatedPreviousKeywords.add(k));
            setPreviousKeywordSets(updatedPreviousKeywords);
            setGenerationCount(prev => prev + 1);
            
            toast({ title: "成功", description: "已更新關鍵字組合" });
            return keywordObjects;
          }
        } catch (apiError) {
          console.error('Edge Function 調用錯誤:', apiError);
        }
      }
      
      // 4. 如果 Edge Function 失敗，使用本地邏輯
      let { selectedKeywords, allKeywords } = selectPrimaryKeywords(formattedStoreKeywords);
      
      const storeKeywordsResult = selectStoreKeywords(
        formattedStoreKeywords, 
        selectedKeywords, 
        allKeywords, 
        previousKeywordSets, 
        generationCount
      );
      selectedKeywords = storeKeywordsResult.selectedKeywords;
      allKeywords = storeKeywordsResult.allKeywords;

      if (isOptical && allKeywords.length < 16) {
        const opticalResult = await selectOpticalKeywords(
          selectedKeywords,
          allKeywords,
          previousKeywordSets
        );
        selectedKeywords = opticalResult.selectedKeywords;
        allKeywords = opticalResult.allKeywords;
      }
      else if (isEducation && allKeywords.length < 16) {
        const educationResult = await selectEducationKeywords(
          selectedKeywords,
          allKeywords,
          previousKeywordSets
        );
        selectedKeywords = educationResult.selectedKeywords;
        allKeywords = educationResult.allKeywords;
      }
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

      const finalResult = fillWithDefaultKeywords(selectedKeywords, allKeywords, industryType);
      allKeywords = finalResult.allKeywords;
      
      if (isOptical) {
        allKeywords = allKeywords.filter(kw => 
          isKeywordSuitableForIndustry(kw.keyword, 'optical')
        );
        
        if (allKeywords.length < 16) {
          const { allKeywords: opticalKeywords } = await selectOpticalKeywords(
            allKeywords.map(k => k.keyword),
            [],
            previousKeywordSets
          );
          const neededCount = 16 - allKeywords.length;
          const supplementaryKeywords = opticalKeywords.slice(0, neededCount);
          allKeywords = [...allKeywords, ...supplementaryKeywords];
        }
      }

      const newKeywordTexts = allKeywords.map(k => k.keyword);
      const lastSetStr = new Set(lastGeneratedSet);
      const overlapCount = newKeywordTexts.filter(k => lastSetStr.has(k)).length;
      
      if (overlapCount > allKeywords.length * 0.5) {
        allKeywords = allKeywords
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5)
          .sort(() => Math.random() - 0.5);
      }
      
      setLastGeneratedSet(newKeywordTexts);
      const updatedPreviousKeywords = new Set(previousKeywordSets);
      newKeywordTexts.forEach(k => updatedPreviousKeywords.add(k));
      setPreviousKeywordSets(updatedPreviousKeywords);
      setGenerationCount(prev => prev + 1);
      setKeywords(allKeywords);

      toast({ title: "成功", description: "已更新關鍵字組合" });
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