// Real Analytics Data Types
export interface RealAnalyticsData {
  storeMetrics: {
    totalStores: number;
    activeStores: number;
    newStoresThisMonth: number;
    storesByIndustry: Array<{ industry: string; count: number }>;
  };
  keywordAnalytics: {
    topKeywords: Array<{
      keyword: string;
      usage_count: number | null;
      industry: string | null;
    }>;
    keywordTrends: Array<{
      keyword: string;
      trend: 'up' | 'down' | 'stable';
    }>;
    industryKeywords: Array<{
      industry: string;
      popular_keywords: string[];
    }>;
  };
  subscriptionMetrics: {
    planDistribution: Array<{
      plan_type: string;
      count: number;
    }>;
    activeSubscriptions: number;
    conversionRate: number;
    churnRate: number;
  };
  userEngagement: {
    totalSessions: number;
    averageSessionDuration: number;
    loginFrequency: Array<{
      date: string;
      count: number;
    }>;
    failedAttempts: number;
  };
}