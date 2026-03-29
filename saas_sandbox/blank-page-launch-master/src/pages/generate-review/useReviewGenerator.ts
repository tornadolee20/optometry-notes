
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Store } from "@/types/store";
import { isEducationInstitution, isOpticalStore } from "@/utils/keyword-utils";
import { SentimentAnalyzer, type SentimentResult, type ReviewStyleResult, type ComplianceResult, type GuidelinesResult } from "@/utils/sentiment-analyzer";
import { generateShortNegativeReview } from "@/utils/short-negative-review";

export const useReviewGenerator = (store: Store | null) => {
  const { toast } = useToast();
  const [generatedReview, setGeneratedReview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      const isEducation = isEducationInstitution(store.store_name, store.industry);
      const isOptical = isOpticalStore(store.store_name, store.industry);
      
      const allUserInput = [...selectedKeywords, ...customFeelings];
      
      const sentimentAnalysisPromise = new Promise((resolve) => {
        setTimeout(() => {
          const sentimentAnalysis = SentimentAnalyzer.analyzeSentiment(allUserInput);
          const reviewStyle = SentimentAnalyzer.determineReviewStyle(sentimentAnalysis);
          const complianceCheck = SentimentAnalyzer.validateGoogleCompliance(allUserInput, sentimentAnalysis);
          const guidelines = SentimentAnalyzer.generateReviewGuidelines(sentimentAnalysis, reviewStyle);
          
          resolve({ sentimentAnalysis, reviewStyle, complianceCheck, guidelines });
        }, 0);
      });

      const analysisResult = await sentimentAnalysisPromise as {
        sentimentAnalysis: SentimentResult;
        reviewStyle: ReviewStyleResult;
        complianceCheck: ComplianceResult;
        guidelines: GuidelinesResult;
      };

      const { sentimentAnalysis, reviewStyle, complianceCheck, guidelines } = analysisResult;
      
      // 短評負面模式：僅針對自訂感受且負面數量 ≤ 2
      // 當自訂感受 ≥ 3 個時，無論情緒分析結果如何，一律送 AI 生成完整負面評論
      const customAnalysis = SentimentAnalyzer.analyzeSentiment(customFeelings);
      const customNegCount = customAnalysis.negativeCount + (customAnalysis.categories?.negative?.length ?? 0);
      const hasNegativeCustom = customNegCount > 0;
      
      // ≤2 個自訂感受且包含負面 → 本地短評模板；≥3 個自訂感受 → 送 AI 生成完整評論
      if (customFeelings.length > 0 && customFeelings.length <= 2 && hasNegativeCustom) {
        const shortReview = generateShortNegativeReview(customFeelings);
        setGeneratedReview(shortReview);

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

      // 提取區域名稱
      let area = '';
      const addressMatch = store.address.match(/([^\s]*?市)?([^\s]*?區|[^\s]*?鎮|[^\s]*?鄉)/);
      
      if (addressMatch) {
        if (addressMatch[1] && addressMatch[2]) {
          area = `${addressMatch[1]}${addressMatch[2]}`;
        } else if (addressMatch[2]) {
          area = addressMatch[2];
        }
      } else {
        const cityMatch = store.address.match(/[^\s]*?市/);
        if (cityMatch) {
          area = cityMatch[0];
        } else {
          area = store.address.split(' ')[0]?.substring(0, 3) || '';
        }
      }
      
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
            complianceMode: complianceCheck.isCompliant,
            enforceNegativeWhenNeeded: sentimentAnalysis.negativeCount >= 3 || customFeelings.length >= 3,
            keywordCount: allUserInput.length
          }),
        }
      );

      if (reviewError) throw reviewError;
      if (!reviewResponse?.review) throw new Error('無法生成評論');

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
      toast({ title: "成功", description: "已生成評論" });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
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
      toast({ title: "已取消", description: "評論生成已停止" });
    }
  };

  return {
    generatedReview,
    isGenerating,
    generateReview,
    cancelGeneration,
    setGeneratedReview,
    isZongxianStyle: false
  };
};