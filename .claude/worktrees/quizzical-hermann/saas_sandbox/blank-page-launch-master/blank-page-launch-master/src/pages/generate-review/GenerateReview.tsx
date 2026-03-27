
import React from 'react';
import { useParams } from 'react-router-dom';
import { SubscriptionGuard } from '@/components/store/SubscriptionGuard';
import { useStoreData } from './useStoreData';
import { GenerateReviewForm } from './GenerateReviewForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const GenerateReview: React.FC = () => {
  const { storeNumber } = useParams<{ storeNumber: string }>();
  const { store, keywords, setKeywords, isLoading, error } = useStoreData(storeNumber);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">載入錯誤</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {error?.message || '無法載入店家資訊，請稍後再試。'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <SubscriptionGuard 
        storeId={store.id} 
        feature="評論生成功能"
      >
        <GenerateReviewForm
          store={store}
          keywords={keywords}
          setKeywords={setKeywords}
        />
      </SubscriptionGuard>
    </div>
  );
};
