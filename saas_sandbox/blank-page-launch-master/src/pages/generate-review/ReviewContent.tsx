
import { useState } from "react";
import type { Store } from "@/types/store";
import { KeywordSelectorImproved } from "@/components/review/improved/KeywordSelectorImproved";
import { GeneratedReview } from "@/components/review/GeneratedReview";
import { QuickGuide } from "@/components/review/generate/QuickGuide";
import { ReviewGenerateButtonImproved } from "@/components/review/improved/ReviewGenerateButtonImproved";
import { useReviewGenerator } from "./useReviewGenerator";
import { MultiToneToggle } from "@/components/store/MultiToneToggle";
import { isSandboxStore } from "@/config/sandbox";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import type { Keyword } from "@/types/store";

interface ReviewContentProps {
  store: Store;
  keywords: Keyword[];
  onKeywordsUpdate: (keywords: Keyword[]) => void;
}

export const ReviewContent = ({ store, keywords, onKeywordsUpdate }: ReviewContentProps) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [customFeelings, setCustomFeelings] = useState<string[]>([]);
  const [multiToneEnabled, setMultiToneEnabled] = useState(false);
  const { generatedReview, isGenerating, generateReview, cancelGeneration } = useReviewGenerator(store);
  const [toneVariations, setToneVariations] = useState<{ label: string; review: string }[]>([]);
  const [isGeneratingTones, setIsGeneratingTones] = useState(false);

  const isSandbox = isSandboxStore(store.email);

  const generateMultiTone = async () => {
    setIsGeneratingTones(true);
    setToneVariations([]);
    
    const tones = [
      { label: '🎭 感性風格', instruction: '請用感性、溫暖、充滿情感的語氣撰寫，多用感受性詞彙和個人體驗描述' },
      { label: '⚡ 簡短有力', instruction: '請用簡潔有力的語氣撰寫，控制在80字以內，直接點出重點，不囉嗦' },
      { label: '🔬 專業嚴謹', instruction: '請用專業、客觀、嚴謹的語氣撰寫，像是業界人士的評價，著重細節與專業度' },
    ];

    try {
      const results: { label: string; review: string }[] = [];
      for (const tone of tones) {
        const { data } = await supabase.functions.invoke('generate-review', {
          body: JSON.stringify({
            storeName: store.store_name,
            address: store.address,
            keywords: selectedKeywords,
            customFeelings: customFeelings,
            description: store.description,
            industry: store.industry,
            makeMoreNatural: true,
            avoidListStyle: true,
            avoidSummaryEnding: true,
            useRandomTemperature: true,
            toneInstruction: tone.instruction,
          }),
        });
        if (data?.review) {
          results.push({ label: tone.label, review: data.review });
        }
      }
      setToneVariations(results);
    } catch (e) {
      console.error('多語氣生成失敗:', e);
    } finally {
      setIsGeneratingTones(false);
    }
  };

  const handleGenerateReview = () => {
    if (isSandbox && multiToneEnabled) {
      generateMultiTone();
    } else {
      generateReview(selectedKeywords, customFeelings);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-center leading-tight">
          分享您的真實體驗<br />
          幫助下一位好朋友
        </h2>
      </div>

      <QuickGuide />

      <KeywordSelectorImproved
        keywords={keywords}
        selectedKeywords={selectedKeywords}
        onKeywordSelect={setSelectedKeywords}
        storeId={store.id}
        storeName={store.store_name}
        onKeywordsUpdate={onKeywordsUpdate}
        onCustomFeelingsChange={setCustomFeelings}
      />

      {isSandbox && (
        <MultiToneToggle
          enabled={multiToneEnabled}
          onToggle={setMultiToneEnabled}
        />
      )}

      <ReviewGenerateButtonImproved
        isGenerating={isGenerating || isGeneratingTones}
        hasGeneratedReview={!!generatedReview || toneVariations.length > 0}
        onGenerate={handleGenerateReview}
        onCancel={cancelGeneration}
        disabled={(selectedKeywords.length + customFeelings.length) < 3}
      />

      {/* Multi-tone results */}
      {toneVariations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">🧪 多語氣對比結果</h3>
          {toneVariations.map((v, i) => (
            <div key={i} className="border rounded-xl p-4 space-y-2">
              <Badge className="bg-[hsl(var(--brand-violet)/0.15)] text-[hsl(var(--brand-violet))] border-[hsl(var(--brand-violet)/0.3)]">{v.label}</Badge>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{v.review}</p>
            </div>
          ))}
        </div>
      )}

      {generatedReview && !multiToneEnabled && (
        <GeneratedReview 
          review={generatedReview} 
          store={store} 
          onRegenerate={handleGenerateReview}
        />
      )}

      {/* 合規提示 */}
      <p className="text-xs text-muted-foreground/70 text-center pt-2 border-t border-border/50 leading-relaxed">
        請根據您今天的真實體驗選擇感受並撰寫內容，本系統僅協助整理語句，不會修改您的真實想法。
      </p>
    </div>
  );
};
