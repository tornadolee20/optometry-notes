import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { AdminButton } from '@/components/admin/AdminButton';

interface StoreListFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  industryFilter: string;
  setIndustryFilter: (value: string) => void;
  subscriptionFilter: string;
  setSubscriptionFilter: (value: string) => void;
  uniqueIndustries: string[];
  onReset: () => void;
}

export const StoreListFilters: React.FC<StoreListFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  industryFilter,
  setIndustryFilter,
  subscriptionFilter,
  setSubscriptionFilter,
  uniqueIndustries,
  onReset
}) => {
  const hasFilters = searchTerm || statusFilter !== 'all' || industryFilter !== 'all' || subscriptionFilter !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="搜尋店家..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-8 text-sm"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue placeholder="狀態" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">所有狀態</SelectItem>
          <SelectItem value="active">活躍</SelectItem>
          <SelectItem value="inactive">未啟用</SelectItem>
          <SelectItem value="pending">待審核</SelectItem>
        </SelectContent>
      </Select>

      <Select value={industryFilter} onValueChange={setIndustryFilter}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue placeholder="行業" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">所有行業</SelectItem>
          {uniqueIndustries.map(industry => (
            <SelectItem key={industry} value={industry || ''}>
              {industry || '未分類'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue placeholder="訂閱" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">所有訂閱</SelectItem>
          <SelectItem value="no-subscription">未訂閱</SelectItem>
          <SelectItem value="trial">試用中</SelectItem>
          <SelectItem value="active">專業版</SelectItem>
          <SelectItem value="expired">已到期</SelectItem>
          <SelectItem value="canceled">已取消</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <AdminButton variant="ghost" size="sm" onClick={onReset} icon={X} className="h-8 text-xs text-muted-foreground">
          清除
        </AdminButton>
      )}
    </div>
  );
};
