import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Store } from './storeListUtils';

export const useStoreListData = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  
  // Selection state
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  // Realtime sync
  const { isConnected, syncPendingChanges } = useRealtimeSync({
    table: 'stores',
    onUpdate: () => fetchStores()
  });

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id, store_name, email, store_number, status, industry, created_at')
        .order('created_at', { ascending: false });

      if (storesError) throw storesError;

      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('store_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionsError) {
        console.warn('無法獲取訂閱資料:', subscriptionsError);
      }

      const storesWithSubscriptions = (storesData || []).map(store => {
        const subscription = subscriptionsData?.find(sub => sub.store_id === store.id);
        
        if (subscription) {
          const expiresAt = subscription.expires_at || subscription.trial_ends_at;
          const daysLeft = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
          
          return {
            ...store,
            subscription: {
              ...subscription,
              days_left: Math.max(0, daysLeft)
            }
          };
        }
        
        return store;
      });

      setStores(storesWithSubscriptions as Store[]);
      setFilteredStores(storesWithSubscriptions as Store[]);
    } catch (err: any) {
      console.error('Error fetching stores:', err);
      setError(err.message || 'Failed to fetch stores.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: '無法載入店家資料',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = stores;

    if (searchTerm) {
      filtered = filtered.filter(store =>
        store.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.store_number.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(store => store.status === statusFilter);
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(store => store.industry === industryFilter);
    }

    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(store => {
        if (subscriptionFilter === 'no-subscription') {
          return !store.subscription;
        }
        return store.subscription?.status === subscriptionFilter;
      });
    }

    setFilteredStores(filtered);
  }, [stores, searchTerm, statusFilter, industryFilter, subscriptionFilter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setIndustryFilter('all');
    setSubscriptionFilter('all');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStores(filteredStores.map(store => store.id));
    } else {
      setSelectedStores([]);
    }
  };

  const handleSelectStore = (storeId: string, checked: boolean) => {
    if (checked) {
      setSelectedStores(prev => [...prev, storeId]);
    } else {
      setSelectedStores(prev => prev.filter(id => id !== storeId));
    }
  };

  const handleBatchStatusUpdate = async (newStatus: "pending" | "active" | "inactive" | "suspended" | "cancelled") => {
    if (!selectedStores.length) return;

    try {
      const { error } = await supabase
        .from('stores')
        .update({ status: newStatus as any })
        .in('id', selectedStores);

      if (error) throw error;

      toast({
        title: '成功',
        description: `已更新 ${selectedStores.length} 個店家的狀態`
      });

      setSelectedStores([]);
      fetchStores();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: err.message || '批量更新失敗'
      });
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedStores.length) return;
    if (!confirm(`確定要刪除 ${selectedStores.length} 個店家嗎？此操作無法復原。`)) return;

    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .in('id', selectedStores);

      if (error) throw error;

      toast({
        title: '成功',
        description: `已刪除 ${selectedStores.length} 個店家`
      });

      setSelectedStores([]);
      fetchStores();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: err.message || '批量刪除失敗'
      });
    }
  };

  const handleDeleteStore = async (store: Store) => {
    if (!confirm(`確定要刪除店家「${store.store_name}」嗎？此操作無法復原。`)) return;
    
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', store.id);

      if (error) throw error;

      toast({
        title: '成功',
        description: `已刪除店家「${store.store_name}」`
      });

      fetchStores();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: err.message || '刪除失敗'
      });
    }
  };

  const handleSingleStatusUpdate = async (storeId: string, newStatus: "pending" | "active" | "inactive") => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ status: newStatus as any })
        .eq('id', storeId);

      if (error) throw error;

      toast({ title: '成功', description: '狀態已更新' });
      fetchStores();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: '錯誤',
        description: err.message || '更新失敗'
      });
    }
  };

  const uniqueIndustries = Array.from(new Set(stores.map(store => store.industry).filter(Boolean))) as string[];

  return {
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
  };
};
