import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Plus, Zap, FileText, FileSpreadsheet } from 'lucide-react';
import { FreeSubscriptionGrantModal } from '@/components/admin/FreeSubscriptionGrantModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import {
  Store,
  formatTimeLeft,
  getStatusText,
  useStoreListData,
  StoreListFilters,
  StoreListStats,
  StoreListBatchActions,
  StoreListItem
} from './store-list';

const StoreList: React.FC = () => {
  const {
    stores,
    filteredStores,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    industryFilter,
    setIndustryFilter,
    subscriptionFilter,
    setSubscriptionFilter,
    selectedStores,
    setSelectedStores,
    uniqueIndustries,
    isConnected,
    syncPendingChanges,
    fetchStores,
    handleReset,
    handleSelectAll,
    handleSelectStore,
    handleBatchStatusUpdate,
    handleBatchDelete,
    handleDeleteStore,
    handleSingleStatusUpdate
  } = useStoreListData();

  const [freeSubscriptionModal, setFreeSubscriptionModal] = useState({
    isOpen: false,
    store: null as Store | null
  });

  // Download handlers
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text('店家清單', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`生成日期: ${new Date().toLocaleDateString('zh-TW')}`, 20, 30);
    
    const tableColumns = ['店家名稱', 'Email', '編號', '建立日期', '剩餘時間', '狀態'];
    const tableRows = filteredStores.map(store => [
      store.store_name,
      store.email,
      String(store.store_number).padStart(5, '0'),
      new Date(store.created_at).toLocaleDateString('zh-TW'),
      store.subscription ? formatTimeLeft(store.subscription.days_left) : '無訂閱',
      getStatusText(store.status)
    ]);

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 40,
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [64, 64, 64], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    doc.save(`店家清單_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDownloadExcel = () => {
    const wsData = [
      ['店家名稱', 'Email', '編號', '建立日期', '剩餘時間', '狀態', '行業'],
      ...filteredStores.map(store => [
        store.store_name,
        store.email,
        String(store.store_number).padStart(5, '0'),
        new Date(store.created_at).toLocaleDateString('zh-TW'),
        store.subscription ? formatTimeLeft(store.subscription.days_left) : '無訂閱',
        getStatusText(store.status),
        store.industry || '未分類'
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '店家清單');
    ws['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];
    XLSX.writeFile(wb, `店家清單_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">店家管理</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">錯誤: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">店家管理</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600">管理所有註冊的店家資訊</p>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {isConnected ? '即時同步中' : '連接中斷'}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  下載清單
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  下載 PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  下載 Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={() => syncPendingChanges()} disabled={!isConnected}>
              <Zap className="h-4 w-4 mr-2" />
              手動同步
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增店家
            </Button>
          </div>
        </div>

        <StoreListFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          industryFilter={industryFilter}
          setIndustryFilter={setIndustryFilter}
          subscriptionFilter={subscriptionFilter}
          setSubscriptionFilter={setSubscriptionFilter}
          uniqueIndustries={uniqueIndustries}
          onReset={handleReset}
        />

        <StoreListBatchActions
          selectedCount={selectedStores.length}
          onClearSelection={() => setSelectedStores([])}
          onBatchStatusUpdate={handleBatchStatusUpdate}
          onBatchDelete={handleBatchDelete}
        />

        <StoreListStats stores={stores} filteredCount={filteredStores.length} />
      </div>

      {/* Store List */}
      {filteredStores.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">沒有找到符合條件的店家</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedStores.length === filteredStores.length && filteredStores.length > 0}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
                <span className="text-sm font-medium">
                  {selectedStores.length > 0 ? `已選擇 ${selectedStores.length} / ${filteredStores.length}` : '全選'}
                </span>
              </div>
            </CardContent>
          </Card>

          {filteredStores.map((store) => (
            <StoreListItem
              key={store.id}
              store={store}
              isSelected={selectedStores.includes(store.id)}
              onSelect={(checked) => handleSelectStore(store.id, checked)}
              onStatusUpdate={(status) => handleSingleStatusUpdate(store.id, status)}
              onDelete={() => handleDeleteStore(store)}
              onGrantSubscription={() => setFreeSubscriptionModal({ isOpen: true, store })}
            />
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
    </div>
  );
};

export default StoreList;
