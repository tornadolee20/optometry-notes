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
        console.log('🔍 開始載入店家資料，原始參數:', storeNumber);
        console.log('📱 設備信息:', {
          userAgent: navigator.userAgent,
          isMobile: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent),
          currentURL: window.location.href,
          origin: window.location.origin,
          timestamp: new Date().toISOString(),
          referrer: document.referrer,
          queryParams: window.location.search
        });
        
        // 檢查是否為掃描QR code進入
        const isFromQRScan = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
        if (isFromQRScan) {
          console.log('📲 偵測到移動設備，可能為QR code掃描:', {
            userAgent: navigator.userAgent,
            currentURL: window.location.href
          });
        }
        
        // 智能解析店家編號：支援11和00011兩種格式
        let storeNumberInt: number;
        if (!storeNumber) {
          throw new Error('無效的店家編號');
        }
        
        // 移除前導零並轉換為數字
        const normalizedStoreNumber = storeNumber.replace(/^0+/, '') || '0';
        storeNumberInt = parseInt(normalizedStoreNumber, 10);
        
        console.log('🔢 解析後的店家編號:', storeNumberInt, '(原始:', storeNumber, ')');
        
        if (isNaN(storeNumberInt) || storeNumberInt <= 0) {
          console.error('❌ 店家編號解析失敗:', storeNumber);
          throw new Error('無效的店家編號');
        }

        console.log('🔍 正在查詢店家編號:', storeNumberInt);

        // 使用專門的安全函數查詢店家資料，支援匿名用戶訪問有訂閱的店家
        const { data: storeData, error: storeError } = await supabase
          .rpc('get_store_for_review', { store_number_param: storeNumberInt })
          .maybeSingle();

        console.log('📊 查詢結果:', { 
          found: !!storeData, 
          storeId: storeData?.id, 
          storeName: storeData?.store_name,
          status: storeData?.status 
        });

        if (storeError) {
          console.error('❌ 查詢店家資料錯誤:', storeError);
          console.error('❌ 錯誤詳情:', JSON.stringify(storeError, null, 2));
          if (storeError.code === 'PGRST116') {
            console.error('❌ 店家不存在，編號:', storeNumberInt);
            throw new Error(`找不到編號為 ${storeNumber} 的店家`);
          }
          throw storeError;
        }

        if (!storeData) {
          console.error('❌ 店家資料為空，編號:', storeNumberInt);
          throw new Error(`找不到編號為 ${storeNumber} 的店家`);
        }

        console.log('✅ 成功獲取店家資料:', storeData);
        
        setStore(mapDbStoreToStore(storeData));

        // 獲取店家關鍵字
        console.log('🔍 正在查詢關鍵字，店家UUID:', storeData.id);
        const { data: keywordsData, error: keywordsError } = await supabase
          .from('store_keywords')
          .select('*')
          .eq('store_id', storeData.id)
          .order('priority', { ascending: true });

        if (keywordsError) {
          console.error('❌ 獲取關鍵字錯誤:', keywordsError);
          console.error('❌ 關鍵字錯誤詳情:', JSON.stringify(keywordsError, null, 2));
          // 關鍵字錯誤不應該阻止頁面載入，只是警告
          console.warn('⚠️ 關鍵字載入失敗，但繼續載入頁面');
        }

        if (keywordsData && keywordsData.length > 0 && !keywordsError) {
          console.log('✅ 成功載入關鍵字:', keywordsData.length, '個');
          const mappedKeywords: Keyword[] = keywordsData.map(mapDbKeywordToKeyword);
          setKeywords(mappedKeywords);
        } else {
          console.log('⚠️ 沒有找到關鍵字，使用預設關鍵字');
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
        console.error('💥 獲取店家資料時發生嚴重錯誤:', error);
        console.error('💥 完整錯誤堆疊:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('💥 錯誤類型:', typeof error);
        console.error('💥 錯誤內容:', JSON.stringify(error, null, 2));
        
        setError(error instanceof Error ? error : new Error('無法載入店家資訊'));
        toast({
          variant: "destructive",
          title: "錯誤",
          description: error instanceof Error ? error.message : "無法載入店家資訊",
        });
        
        // 延遲導航，讓用戶看到錯誤訊息
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
