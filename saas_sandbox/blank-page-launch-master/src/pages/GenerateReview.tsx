
import { useState } from "react";
import { useParams } from "react-router-dom";
import { StoreHeader } from "@/components/review/generate/StoreHeader";
import { QRConsentGate } from "@/components/review/generate/QRConsentGate";
import { StoreNotFound } from "./generate-review/StoreNotFound";
import { Loading } from "./generate-review/Loading";
import { ReviewContent } from "./generate-review/ReviewContent";
import { useStoreData } from "./generate-review/useStoreData";

const GenerateReview = () => {
  const { storeNumber } = useParams();
  const { store, keywords, setKeywords, isLoading } = useStoreData(storeNumber);
  const [consented, setConsented] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  if (!store) {
    return <StoreNotFound />;
  }

  if (!consented) {
    return <QRConsentGate storeName={store.store_name} onAgree={() => setConsented(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
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
