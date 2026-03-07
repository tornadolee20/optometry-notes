import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, RotateCcw } from 'lucide-react';

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
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          篩選條件
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋店家名稱、email 或編號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="選擇狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有狀態</SelectItem>
              <SelectItem value="active">活躍</SelectItem>
              <SelectItem value="inactive">未啟用</SelectItem>
              <SelectItem value="pending">待審核</SelectItem>
            </SelectContent>
          </Select>

          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="選擇行業" />
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
            <SelectTrigger>
              <SelectValue placeholder="訂閱狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有狀態</SelectItem>
              <SelectItem value="no-subscription">未訂閱</SelectItem>
              <SelectItem value="trial">免費試用</SelectItem>
              <SelectItem value="active">專業版會員</SelectItem>
              <SelectItem value="expired">已到期</SelectItem>
              <SelectItem value="canceled">已取消</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重設
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
