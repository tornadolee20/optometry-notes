import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Plus, Zap, FileText, FileSpreadsheet, Store as StoreIcon, Upload } from 'lucide-react';
import { FreeSubscriptionGrantModal } from '@/components/admin/FreeSubscriptionGrantModal';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { StoreTransferModal } from './store-list/StoreTransferModal';
import { AdminButton } from '@/components/admin/AdminButton';
import { AdminLoadingState } from '@/components/admin/AdminLoadingState';
import ExcelJS from 'exceljs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

import {
  Store,
  formatTimeLeft,
  getStatusText,
  useStoreListData,
  StoreListFilters,
  StoreListStats,
  StoreListBatchActions,
  StoreListItem,
  CustomerImportModal
} from './store-list';

const StoreList: React.FC = () => {
  const {
    stores, filteredStores, isLoading, error,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    industryFilter, setIndustryFilter, subscriptionFilter, setSubscriptionFilter,
    selectedStores, setSelectedStores, uniqueIndustries, isConnected,
    syncPendingChanges, fetchStores, handleReset, handleSelectAll,
    handleSelectStore, handleBatchStatusUpdate, handleBatchDelete,
    handleDeleteStore, handleSingleStatusUpdate
  } = useStoreListData();

  const [freeSubscriptionModal, setFreeSubscriptionModal] = useState({
    isOpen: false,
    store: null as Store | null
  });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [transferModal, setTransferModal] = useState<{ isOpen: boolean; store: Store | null }>({ isOpen: false, store: null });

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const fetchKeywordsMap = async (): Promise<Record<string, string>> => {
    const storeIds = filteredStores.map(s => s.id);
    if (!storeIds.length) return {};

    // Paginated fetch to handle >1000 keywords
    const allRows: { store_id: string | null; keyword: string }[] = [];
    const PAGE_SIZE = 1000;
    let from = 0;
    let hasMore = true;
    while (hasMore) {
      const { data } = await supabase
        .from('store_keywords')
        .select('store_id, keyword')
        .in('store_id', storeIds)
        .range(from, from + PAGE_SIZE - 1);
      const rows = data || [];
      allRows.push(...rows);
      hasMore = rows.length === PAGE_SIZE;
      from += PAGE_SIZE;
    }

    const map: Record<string, string[]> = {};
    allRows.forEach(row => {
      if (!row.store_id) return;
      if (!map[row.store_id]) map[row.store_id] = [];
      map[row.store_id].push(row.keyword);
    });
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.join('、')]));
  };

  const handleDownloadPDF = async () => {
    try {
      const kwMap = await fetchKeywordsMap();
      const tableColumns = ['店家名稱', 'Email', '編號', '建立日期', '剩餘時間', '狀態', '關鍵字'];
      const tableRows = filteredStores.map(store => [
        store.store_name, store.email,
        `#${String(store.store_number).padStart(5, '0')}`,
        new Date(store.created_at).toLocaleDateString('zh-TW'),
        store.subscription ? formatTimeLeft(store.subscription.days_left) : '無訂閱',
        getStatusText(store.status),
        kwMap[store.id] || ''
      ]);

      const csvContent = [
        tableColumns.join(','),
        ...tableRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\r\n');

      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
      triggerDownload(blob, `店家清單_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('CSV 匯出成功');
    } catch (e) {
      toast.error('匯出失敗，請重試');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const kwMap = await fetchKeywordsMap();
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('客戶清單');
      
      ws.columns = [
        { header: '店家名稱', width: 20 }, { header: 'Email', width: 25 },
        { header: '電話', width: 15 }, { header: '地址', width: 30 },
        { header: '編號', width: 8 }, { header: '建立日期', width: 12 },
        { header: '剩餘時間', width: 15 }, { header: '狀態', width: 10 },
        { header: '行業', width: 15 }, { header: 'LINE ID', width: 15 },
        { header: '備註', width: 30 }, { header: '標籤', width: 20 },
        { header: '付款來源', width: 12 }, { header: '關鍵字', width: 60 },
      ];
      
      filteredStores.forEach(store => {
        ws.addRow([
          store.store_name, store.email,
          store.phone || '', store.address || '',
          String(store.store_number).padStart(5, '0'),
          new Date(store.created_at).toLocaleDateString('zh-TW'),
          store.subscription ? formatTimeLeft(store.subscription.days_left) : '無訂閱',
          getStatusText(store.status), store.industry || '未分類',
          store.line_id || '', store.notes || '',
          (store.tags || []).join('、'),
          store.subscription?.payment_source || '',
          kwMap[store.id] || ''
        ]);
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      triggerDownload(blob, `客戶清單_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel 匯出成功');
    } catch (e) {
      toast.error('匯出失敗，請重試');
    }
  };

  if (isLoading) {
    return <AdminLoadingState fullPage message="正在載入店家資料" description="獲取最新數據中..." size="lg" />;
  }

  if (error) {
    return (
      <AdminPageWrapper>
        <div className="text-center py-16">
          <p className="text-destructive text-sm">錯誤: {error}</p>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">店家管理</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-muted-foreground">管理所有註冊的店家</p>
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
              isConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} />
              {isConnected ? '同步中' : '離線'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <AdminButton variant="outline" size="sm" icon={Download}>導出</AdminButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <FileText className="h-3.5 w-3.5 mr-2" />CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadExcel}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-2" />Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AdminButton variant="outline" size="sm" onClick={() => setImportModalOpen(true)} icon={Upload}>匯入</AdminButton>
          <AdminButton variant="outline" size="sm" onClick={() => syncPendingChanges()} icon={Zap}>同步</AdminButton>
          <AdminButton size="sm" icon={Plus}>新增店家</AdminButton>
        </div>
      </div>

      {/* Filters */}
      <StoreListFilters
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        industryFilter={industryFilter} setIndustryFilter={setIndustryFilter}
        subscriptionFilter={subscriptionFilter} setSubscriptionFilter={setSubscriptionFilter}
        uniqueIndustries={uniqueIndustries} onReset={handleReset}
      />

      <StoreListBatchActions
        selectedCount={selectedStores.length}
        onClearSelection={() => setSelectedStores([])}
        onBatchStatusUpdate={handleBatchStatusUpdate}
        onBatchDelete={handleBatchDelete}
      />

      <StoreListStats stores={stores} filteredCount={filteredStores.length} />

      {/* Store List */}
      {filteredStores.length === 0 ? (
        <div className="text-center py-16">
          <StoreIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">沒有找到符合條件的店家</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Select all bar */}
          <div className="flex items-center gap-3 px-4 py-2">
            <Checkbox
              checked={selectedStores.length === filteredStores.length && filteredStores.length > 0}
              onCheckedChange={(checked) => handleSelectAll(!!checked)}
            />
            <span className="text-xs text-muted-foreground">
              {selectedStores.length > 0 ? `已選 ${selectedStores.length} / ${filteredStores.length}` : `共 ${filteredStores.length} 家`}
            </span>
          </div>

          {filteredStores.map((store, index) => (
            <div key={store.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(index * 30, 300)}ms`, animationFillMode: 'both' }}>
              <StoreListItem
                store={store}
                isSelected={selectedStores.includes(store.id)}
                onSelect={(checked) => handleSelectStore(store.id, checked)}
                onStatusUpdate={(status) => handleSingleStatusUpdate(store.id, status)}
                onDelete={() => handleDeleteStore(store)}
                onGrantSubscription={() => setFreeSubscriptionModal({ isOpen: true, store })}
                onTransferOwnership={() => setTransferModal({ isOpen: true, store })}
              />
            </div>
          ))}
        </div>
      )}

      <FreeSubscriptionGrantModal
        isOpen={freeSubscriptionModal.isOpen}
        onClose={() => setFreeSubscriptionModal({ isOpen: false, store: null })}
        storeId={freeSubscriptionModal.store?.id || ''}
        storeName={freeSubscriptionModal.store?.store_name || ''}
        onSuccess={fetchStores}
      />

      <CustomerImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={fetchStores}
      />

      <StoreTransferModal
        isOpen={transferModal.isOpen}
        onClose={() => setTransferModal({ isOpen: false, store: null })}
        storeId={transferModal.store?.id || ''}
        storeName={transferModal.store?.store_name || ''}
        currentOwnerEmail={transferModal.store?.email || ''}
      />
    </AdminPageWrapper>
  );
};

export default StoreList;
