
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Store } from "@/types/store";
import { isEducationInstitution, isOpticalStore } from "@/utils/keyword-utils";
import { SentimentAnalyzer } from "@/utils/sentiment-analyzer";
import { generateShortNegativeReview } from "@/utils/short-negative-review";

export const useReviewGenerator = (store: Store | null) => {
  const { toast } = useToast();
  const [generatedReview, setGeneratedReview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 清理函數，在組件卸載時取消請求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const generateReview = async (selectedKeywords: string[], customFeelings: string[] = []) => {
    if (!store) return;
    
    if (selectedKeywords.length < 3 && customFeelings.length < 3) {
      toast({
        variant: "destructive",
        title: "提醒",
        description: "請至少選擇 3 個關鍵字或輸入 3 個自訂感受",
      });
      return;
    }

    setIsGenerating(true);
    
    // 取消之前的請求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 創建新的 AbortController
    abortControllerRef.current = new AbortController();
    
    try {
      // 檢測店家類型
      const isEducation = isEducationInstitution(store.store_name, store.industry);
      const isOptical = isOpticalStore(store.store_name, store.industry);
      
      // 將情感分析移到 Web Worker 或延遲執行
      const allUserInput = [...selectedKeywords, ...customFeelings];
      
      // 使用 Promise 包裝情感分析，避免阻塞主線程
      const sentimentAnalysisPromise = new Promise((resolve) => {
        // 使用 setTimeout 讓其他任務有機會執行
        setTimeout(() => {
          const sentimentAnalysis = SentimentAnalyzer.analyzeSentiment(allUserInput);
          const reviewStyle = SentimentAnalyzer.determineReviewStyle(sentimentAnalysis);
          const complianceCheck = SentimentAnalyzer.validateGoogleCompliance(allUserInput, sentimentAnalysis);
          const guidelines = SentimentAnalyzer.generateReviewGuidelines(sentimentAnalysis, reviewStyle);
          
          resolve({
            sentimentAnalysis,
            reviewStyle,
            complianceCheck,
            guidelines
          });
        }, 0);
      });

      const analysisResult = await sentimentAnalysisPromise as {
        sentimentAnalysis: any;
        reviewStyle: any;
        complianceCheck: any;
        guidelines: any;
      };

      const { sentimentAnalysis, reviewStyle, complianceCheck, guidelines } = analysisResult;
      
      console.log("情感分析結果:", sentimentAnalysis);
      console.log("評論風格:", reviewStyle);
      console.log("合規性檢查:", complianceCheck);
      
      // 短評負面模式：僅針對自訂感受
      const customAnalysis = SentimentAnalyzer.analyzeSentiment(customFeelings);
      const hasNegativeCustom = customAnalysis.negativeCount > 0 || (customAnalysis.categories?.negative?.length ?? 0) > 0;
      if (customFeelings.length > 0 && hasNegativeCustom) {
        const shortReview = generateShortNegativeReview(customFeelings);

        setGeneratedReview(shortReview);

        // 記錄關鍵字使用（短評模式）
        const { error: shortLogError } = await supabase
          .from('customer_keyword_logs')
          .insert({
            store_id: store.id,
            selected_keywords: selectedKeywords,
            custom_feelings: customFeelings
          });
        if (shortLogError) {
          console.error('記錄關鍵字使用錯誤(短評模式):', shortLogError);
        }

        toast({ title: "成功", description: "已生成短評（負面）" });
        return;
      }

      // 提取區域名稱，確保格式正確
      let area = '';
      
      // 嘗試匹配完整的區域格式（包括市區、縣鎮鄉等）
      const addressMatch = store.address.match(/([^\s]*?市)?([^\s]*?區|[^\s]*?鎮|[^\s]*?鄉)/);
      
      if (addressMatch) {
        if (addressMatch[1] && addressMatch[2]) {
          // 如同時有市和區，使用完整格式，例如"新竹市東區"
          area = `${addressMatch[1]}${addressMatch[2]}`;
        } else if (addressMatch[2]) {
          // 如果只有區/鎮/鄉，則使用該名稱
          area = addressMatch[2];
        }
      } else {
        // 嘗試至少獲取城市名稱
        const cityMatch = store.address.match(/[^\s]*?市/);
        if (cityMatch) {
          area = cityMatch[0];
        } else {
          // 如果都無法匹配，使用地址的前幾個字符
          area = store.address.split(' ')[0]?.substring(0, 3) || '';
        }
      }
      
      console.log("=== 前端評論生成參數 ===");
      console.log("提取的區域名稱:", area);
      console.log("店家類型:", isEducation ? "教育機構" : isOptical ? "眼鏡行業" : store.industry || "一般商家");
      console.log("選擇的關鍵字:", selectedKeywords);
      console.log("自訂感受:", customFeelings);
      console.log("情感分析結果:", sentimentAnalysis);
      console.log("評論風格:", reviewStyle);
      console.log("合規性檢查:", complianceCheck);
      console.log("========================");
      
      // 將請求傳給後端，添加行業類型參數
      const { data: reviewResponse, error: reviewError } = await supabase.functions.invoke(
        'generate-review',
        {
          body: JSON.stringify({
            storeName: store.store_name,
            address: store.address,
            area: area,
            keywords: selectedKeywords,
            customFeelings: customFeelings,
            description: store.description,
            industry: store.industry,
            isEducationInstitution: isEducation,
            isOpticalStore: isOptical,
            // 情感分析結果
            sentimentAnalysis: {
              sentiment: sentimentAnalysis.sentiment,
              score: sentimentAnalysis.score,
              negativeCount: sentimentAnalysis.negativeCount,
              positiveCount: sentimentAnalysis.positiveCount,
              categories: sentimentAnalysis.categories
            },
            reviewStyle: {
              style: reviewStyle.style,
              tone: reviewStyle.tone,
              starRating: reviewStyle.starRating,
              suggestions: reviewStyle.suggestions
            },
            guidelines: guidelines,
            makeMoreNatural: true,
            avoidListStyle: true,
            avoidSummaryEnding: true,
            useRandomTemperature: true,
            // Google政策合規
            complianceMode: complianceCheck.isCompliant,
            enforceNegativeWhenNeeded: sentimentAnalysis.negativeCount >= 3
          }),
        }
      );

      if (reviewError) throw reviewError;
      if (!reviewResponse?.review) throw new Error('無法生成評論');

      // 記錄關鍵字使用情況
      const { error: logError } = await supabase
        .from('customer_keyword_logs')
        .insert({
          store_id: store.id,
          selected_keywords: selectedKeywords,
          custom_feelings: customFeelings
        });

      if (logError) {
        console.error('記錄關鍵字使用錯誤:', logError);
      }

      setGeneratedReview(reviewResponse.review);
      toast({
        title: "成功",
        description: "已生成評論",
      });
    } catch (error) {
      // 檢查是否是由於請求被取消
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('請求已取消');
        return;
      }
      
      console.error('生成評論錯誤:', error);
      toast({
        variant: "destructive",
        title: "錯誤",
        description: "生成評論時發生錯誤",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      toast({
        title: "已取消",
        description: "評論生成已停止",
      });
    }
  };

  return {
    generatedReview,
    isGenerating,
    generateReview,
    cancelGeneration,
    setGeneratedReview,
    isZongxianStyle: false // 維持為false，完全移除吳宗憲風格
  };
};
