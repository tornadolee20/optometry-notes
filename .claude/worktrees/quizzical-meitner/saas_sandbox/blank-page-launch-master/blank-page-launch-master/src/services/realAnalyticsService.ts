import { supabase } from '@/integrations/supabase/client';

export interface RealBusinessMetrics {
  totalStores: number;
  activeStores: number;
  newStoresThisMonth: number;
  newStoresThisWeek: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  keywordUsageToday: number;
  reviewGenerationsToday: number;
  avgKeywordsPerSession: number;
  avgReviewsPerCustomer: number;
}

export interface IndustryBreakdown {
  industry: string;
  count: number;
  percentage: number;
  activeCount: number;
}

export interface CustomerAcquisitionData {
  period: string;
  newStores: number;
  newSubscriptions: number;
  conversionRate: number;
}

export interface TimeSeriesMetrics {
  daily: CustomerAcquisitionData[];
  weekly: CustomerAcquisitionData[];
  monthly: CustomerAcquisitionData[];
  quarterly: CustomerAcquisitionData[];
  yearly: CustomerAcquisitionData[];
}

export class RealAnalyticsService {
  
  // 獲取實時業務指標
  async getBusinessMetrics(): Promise<RealBusinessMetrics> {
    try {
      // 獲取店家統計
      const { data: storeStats, error: storeError } = await supabase
        .from('stores')
        .select('id, status, created_at, industry');

      if (storeError) throw storeError;

      const totalStores = storeStats?.length || 0;
      const activeStores = storeStats?.filter(s => s.status === 'active').length || 0;
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);

      const newStoresThisMonth = storeStats?.filter(s => 
        new Date(s.created_at) >= thisMonth
      ).length || 0;

      const newStoresThisWeek = storeStats?.filter(s => 
        new Date(s.created_at) >= thisWeek
      ).length || 0;

      // 獲取訂閱統計
      const { data: subscriptions, error: subError } = await supabase
        .from('store_subscriptions')
        .select('id, status, created_at');

      if (subError) throw subError;

      const totalSubscriptions = subscriptions?.length || 0;
      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;

      // 獲取今日關鍵字使用統計
      const today = new Date().toISOString().split('T')[0];
      const { data: keywordLogs, error: keywordError } = await supabase
        .from('customer_keyword_logs')
        .select('id, selected_keywords, custom_feelings')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (keywordError) throw keywordError;

      const keywordUsageToday = keywordLogs?.length || 0;
      const reviewGenerationsToday = keywordLogs?.filter(log => 
        log.selected_keywords && log.selected_keywords.length > 0
      ).length || 0;

      // 計算平均值
      const totalKeywordSelections = keywordLogs?.reduce((sum, log) => 
        sum + (log.selected_keywords?.length || 0), 0
      ) || 0;

      const avgKeywordsPerSession = keywordUsageToday > 0 
        ? Math.round((totalKeywordSelections / keywordUsageToday) * 100) / 100
        : 0;

      const avgReviewsPerCustomer = keywordUsageToday > 0 
        ? Math.round((reviewGenerationsToday / keywordUsageToday) * 100) / 100
        : 0;

      return {
        totalStores,
        activeStores,
        newStoresThisMonth,
        newStoresThisWeek,
        totalSubscriptions,
        activeSubscriptions,
        keywordUsageToday,
        reviewGenerationsToday,
        avgKeywordsPerSession,
        avgReviewsPerCustomer
      };

    } catch (error) {
      console.error('Error fetching business metrics:', error);
      throw error;
    }
  }

  // 獲取行業分佈
  async getIndustryBreakdown(): Promise<IndustryBreakdown[]> {
    try {
      const { data: stores, error } = await supabase
        .from('stores')
        .select('industry, status');

      if (error) throw error;

      const industryMap = new Map<string, { total: number; active: number }>();
      const totalStores = stores?.length || 0;

      stores?.forEach(store => {
        const industry = store.industry || '未分類';
        const current = industryMap.get(industry) || { total: 0, active: 0 };
        
        current.total += 1;
        if (store.status === 'active') {
          current.active += 1;
        }
        
        industryMap.set(industry, current);
      });

      return Array.from(industryMap.entries()).map(([industry, stats]) => ({
        industry,
        count: stats.total,
        percentage: Math.round((stats.total / totalStores) * 100),
        activeCount: stats.active
      })).sort((a, b) => b.count - a.count);

    } catch (error) {
      console.error('Error fetching industry breakdown:', error);
      throw error;
    }
  }

  // 獲取新客戶獲取時間序列數據
  async getCustomerAcquisitionTimeSeries(days: number = 30): Promise<CustomerAcquisitionData[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // 獲取店家創建數據
      const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      // 獲取訂閱創建數據
      const { data: subscriptions, error: subError } = await supabase
        .from('store_subscriptions')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      if (storeError) throw storeError;
      if (subError) throw subError;

      // 按日期分組統計
      const dailyStats = new Map<string, { stores: number; subscriptions: number }>();

      // 初始化所有日期
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        dailyStats.set(dateStr, { stores: 0, subscriptions: 0 });
      }

      // 統計店家
      stores?.forEach(store => {
        const dateStr = new Date(store.created_at).toISOString().split('T')[0];
        const current = dailyStats.get(dateStr);
        if (current) {
          current.stores += 1;
        }
      });

      // 統計訂閱
      subscriptions?.forEach(sub => {
        const dateStr = new Date(sub.created_at).toISOString().split('T')[0];
        const current = dailyStats.get(dateStr);
        if (current) {
          current.subscriptions += 1;
        }
      });

      return Array.from(dailyStats.entries()).map(([date, stats]) => ({
        period: new Date(date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
        newStores: stats.stores,
        newSubscriptions: stats.subscriptions,
        conversionRate: stats.stores > 0 ? Math.round((stats.subscriptions / stats.stores) * 100) : 0
      }));

    } catch (error) {
      console.error('Error fetching customer acquisition data:', error);
      throw error;
    }
  }

  // 獲取關鍵字使用統計
  async getKeywordUsageStats(days: number = 7): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: logs, error } = await supabase
        .from('customer_keyword_logs')
        .select('created_at, selected_keywords, custom_feelings, store_id')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // 統計關鍵字使用情況
      const dailyUsage = new Map<string, number>();
      const keywordFrequency = new Map<string, number>();
      let totalSessions = 0;
      let totalKeywords = 0;

      logs?.forEach(log => {
        const dateStr = new Date(log.created_at).toISOString().split('T')[0];
        dailyUsage.set(dateStr, (dailyUsage.get(dateStr) || 0) + 1);
        
        totalSessions++;
        
        if (log.selected_keywords) {
          log.selected_keywords.forEach((keyword: string) => {
            keywordFrequency.set(keyword, (keywordFrequency.get(keyword) || 0) + 1);
            totalKeywords++;
          });
        }
      });

      const avgKeywordsPerSession = totalSessions > 0 ? 
        Math.round((totalKeywords / totalSessions) * 100) / 100 : 0;

      const topKeywords = Array.from(keywordFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));

      return {
        totalSessions,
        totalKeywords,
        avgKeywordsPerSession,
        topKeywords,
        dailyUsage: Array.from(dailyUsage.entries()).map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
          count
        }))
      };

    } catch (error) {
      console.error('Error fetching keyword usage stats:', error);
      throw error;
    }
  }

  // 更新每日指標（可以設定為定時任務）
  async updateDailyMetrics(date?: string): Promise<void> {
    try {
      await supabase.rpc('calculate_daily_metrics', {
        target_date: date || new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error updating daily metrics:', error);
      throw error;
    }
  }
}

export const realAnalyticsService = new RealAnalyticsService();