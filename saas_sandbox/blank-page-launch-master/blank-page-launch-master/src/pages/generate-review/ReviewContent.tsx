
import { useState } from "react";
import type { Store } from "@/types/store";
import { KeywordSelectorImproved } from "@/components/review/improved/KeywordSelectorImproved";
import { GeneratedReview } from "@/components/review/GeneratedReview";
import { QuickGuide } from "@/components/review/generate/QuickGuide";
import { ReviewGenerateButtonImproved } from "@/components/review/improved/ReviewGenerateButtonImproved";
import { useReviewGenerator } from "./useReviewGenerator";
import type { Keyword } from "@/types/store";

interface ReviewContentProps {
  store: Store;
  keywords: Keyword[];
  onKeywordsUpdate: (keywords: Keyword[]) => void;
}

export const ReviewContent = ({ store, keywords, onKeywordsUpdate }: ReviewContentProps) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [customFeelings, setCustomFeelings] = useState<string[]>([]);
  const { generatedReview, isGenerating, generateReview, cancelGeneration } = useReviewGenerator(store);

  const handleGenerateReview = () => {
    generateReview(selectedKeywords, customFeelings);
  };


  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
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


      <ReviewGenerateButtonImproved
        isGenerating={isGenerating}
        hasGeneratedReview={!!generatedReview}
        onGenerate={handleGenerateReview}
        onCancel={cancelGeneration}
        disabled={(selectedKeywords.length + customFeelings.length) < 3}
      />

      

      {generatedReview && (
        <GeneratedReview 
          review={generatedReview} 
          store={store} 
          onRegenerate={handleGenerateReview}
        />
      )}
    </div>
  );
};
