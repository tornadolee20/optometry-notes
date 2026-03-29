import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Store, Keyword } from "@/types/store";
import { mapDbStoreToStore, mapDbKeywordToKeyword } from "@/utils/normalizers";
import { defaultKeywords } from "./constants";

// Utility function to extract area keywords from address
const extractAreaKeywords = (address: string): string[] => {
  const keywords: string[] = [];
  const fullAreaMatch = address.match(/[^\s]*?(市區|區|鎮|鄉)/);
  if (fullAreaMatch) {
    keywords.push(fullAreaMatch[0]);
    const areaName = fullAreaMatch[0].replace(/(市區|區|鎮|鄉)$/, '');
    if (areaName) {
      keywords.push(areaName);
    }
  }
  return [...new Set(keywords)];
};

export const useStoreData = (storeNumber: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>(defaultKeywords);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        
        // 智能解析店家編號：支援11和00011兩種格式
        let storeNumberInt: number;
        if (!storeNumber) {
          throw new Error('無效的店家編號');
        }
        
        const normalizedStoreNumber = storeNumber.replace(/^0+/, '') || '0';
        storeNumberInt = parseInt(normalizedStoreNumber, 10);
        
        if (isNaN(storeNumberInt) || storeNumberInt <= 0) {
          throw new Error('無效的店家編號');
        }

        // 使用專門的安全函數查詢店家資料
        const { data: storeData, error: storeError } = await supabase
          .rpc('get_store_for_review', { store_number_param: storeNumberInt })
          .maybeSingle();

        if (storeError) {
          console.error('查詢店家資料錯誤:', storeError);
          if (storeError.code === 'PGRST116') {
            throw new Error(`找不到編號為 ${storeNumber} 的店家`);
          }
          throw storeError;
        }

        if (!storeData) {
          throw new Error(`找不到編號為 ${storeNumber} 的店家`);
        }

        setStore(mapDbStoreToStore(storeData));

        // 獲取店家關鍵字
        const { data: keywordsData, error: keywordsError } = await supabase
          .from('store_keywords')
          .select('*')
          .eq('store_id', storeData.id)
          .order('priority', { ascending: true });

        if (keywordsError) {
          console.error('獲取關鍵字錯誤:', keywordsError);
          console.warn('關鍵字載入失敗，但繼續載入頁面');
        }

        if (keywordsData && keywordsData.length > 0 && !keywordsError) {
          const mappedKeywords: Keyword[] = keywordsData.map(mapDbKeywordToKeyword);
          setKeywords(mappedKeywords);
        } else {
          const areaKeywords = extractAreaKeywords(storeData.address)
            .map(keyword => ({
              id: crypto.randomUUID(),
              keyword,
              category: 'area' as const,
              source: 'ai' as const,
              is_primary: true,
              usage_count: 0,
              priority: 0
            }));

          const defaultWithArea = [...areaKeywords, ...defaultKeywords.slice(areaKeywords.length)]
            .map((kw, index) => ({ ...kw, priority: index }));

          setKeywords(defaultWithArea);
        }
      } catch (error) {
        console.error('獲取店家資料時發生錯誤:', error);
        
        setError(error instanceof Error ? error : new Error('無法載入店家資訊'));
        toast({
          variant: "destructive",
          title: "錯誤",
          description: error instanceof Error ? error.message : "無法載入店家資訊",
        });
        
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    if (storeNumber) {
      fetchStoreData();
    }
  }, [storeNumber, toast, navigate]);

  return { store, keywords, setKeywords, isLoading, error };
};