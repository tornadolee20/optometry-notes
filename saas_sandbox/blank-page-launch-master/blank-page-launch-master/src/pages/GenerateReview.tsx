
import { useParams } from "react-router-dom";
import { StoreHeader } from "@/components/review/generate/StoreHeader";
import { StoreNotFound } from "./generate-review/StoreNotFound";
import { Loading } from "./generate-review/Loading";
import { ReviewContent } from "./generate-review/ReviewContent";
import { useStoreData } from "./generate-review/useStoreData";

const GenerateReview = () => {
  const { storeNumber } = useParams();
  const { store, keywords, setKeywords, isLoading } = useStoreData(storeNumber);

  if (isLoading) {
    return <Loading />;
  }

  if (!store) {
    return <StoreNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 手機優化：使用更好的 padding 和 spacing */}
      <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <StoreHeader store={store} />
        <ReviewContent 
          store={store} 
          keywords={keywords} 
          onKeywordsUpdate={setKeywords}
        />
      </div>
    </div>
  );
};

export default GenerateReview;
