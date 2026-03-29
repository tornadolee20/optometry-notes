import React from 'react';
import { Store as StoreIcon, CheckCircle, Clock, Filter } from 'lucide-react';
import { AdminStatsCard, AdminStatsGrid } from '@/components/admin/AdminStatsCard';
import { Store } from './storeListUtils';

interface StoreListStatsProps {
  stores: Store[];
  filteredCount: number;
}

export const StoreListStats: React.FC<StoreListStatsProps> = ({ stores, filteredCount }) => {
  const activeCount = stores.filter(s => s.status === 'active').length;
  const pendingCount = stores.filter(s => s.status === 'pending').length;

  return (
    <AdminStatsGrid columns={4} className="mb-6">
      <AdminStatsCard title="總店家數" value={stores.length} icon={StoreIcon} color="info" compact />
      <AdminStatsCard title="活躍店家" value={activeCount} icon={CheckCircle} color="success" compact />
      <AdminStatsCard title="待審核" value={pendingCount} icon={Clock} color="warning" compact />
      <AdminStatsCard title="篩選結果" value={filteredCount} icon={Filter} color="primary" compact />
    </AdminStatsGrid>
  );
};
