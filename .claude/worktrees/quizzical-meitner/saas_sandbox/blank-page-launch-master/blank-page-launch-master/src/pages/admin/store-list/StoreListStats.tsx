import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Store } from './storeListUtils';

interface StoreListStatsProps {
  stores: Store[];
  filteredCount: number;
}

export const StoreListStats: React.FC<StoreListStatsProps> = ({ stores, filteredCount }) => {
  const activeCount = stores.filter(s => s.status === 'active').length;
  const pendingCount = stores.filter(s => s.status === 'pending').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-gray-900">{stores.length}</div>
          <div className="text-sm text-gray-600">總店家數</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-sm text-gray-600">活躍店家</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-gray-600">待審核</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">{filteredCount}</div>
          <div className="text-sm text-gray-600">篩選結果</div>
        </CardContent>
      </Card>
    </div>
  );
};
