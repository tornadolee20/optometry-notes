export type SubscriptionPlan = 'trial' | 'monthly' | 'quarterly' | 'yearly';

export const SUBSCRIPTION_LIMITS = {
  trial: {
    maxReviews: 50, // 試用期每日限制
    maxKeywords: 48, // 統一固定上限
    duration: 7, // days
    features: ['basic_reviews', 'analytics', 'industry_awareness']
  },
  monthly: {
    maxReviews: 200, // 每日限制
    maxKeywords: 48, // 統一固定上限
    price: 500, // TWD
    features: ['basic_reviews', 'analytics', 'industry_awareness', 'csv_export']
  },
  quarterly: {
    maxReviews: 1000, // 每日限制
    maxKeywords: 48, // 統一固定上限
    price: 1200, // TWD
    features: ['basic_reviews', 'analytics', 'industry_awareness', 'csv_export', 'advanced_analytics']
  },
  yearly: {
    maxReviews: -1, // unlimited
    maxKeywords: 48, // 統一固定上限
    price: 3600, // TWD
    features: ['basic_reviews', 'analytics', 'industry_awareness', 'csv_export', 'advanced_analytics', 'priority_support']
  }
};

export const PLAN_NAMES = {
  trial: '7天免費試用',
  monthly: '月訂閱',
  quarterly: '季訂閱',
  yearly: '年訂閱'
};

export const PLAN_PRICES = {
  trial: 0,
  monthly: 500,
  quarterly: 1200,
  yearly: 3600
};

export const getCurrentUserPlan = async (_userId: string): Promise<SubscriptionPlan> => {
  // Mock implementation - replace with actual subscription check
  return 'trial';
};

export const validateOperation = async (userId: string, operation: string, currentCount: number): Promise<boolean> => {
  const plan = await getCurrentUserPlan(userId);
  const limits = SUBSCRIPTION_LIMITS[plan];
  
  switch (operation) {
    case 'add_keyword':
      return limits.maxKeywords === -1 || currentCount < limits.maxKeywords;
    case 'generate_review':
      return limits.maxReviews === -1 || currentCount < limits.maxReviews;
    default:
      return true;
  }
};

export const getUsagePercentage = (current: number, max: number): number => {
  if (max === -1) return 0; // unlimited
  return Math.min((current / max) * 100, 100);
};

export const getRemainingCount = (current: number, max: number): number => {
  if (max === -1) return -1; // unlimited
  return Math.max(max - current, 0);
};

export const getSuggestedUpgrade = (currentPlan: SubscriptionPlan): SubscriptionPlan => {
  const plans: SubscriptionPlan[] = ['trial', 'monthly', 'quarterly', 'yearly'];
  const currentIndex = plans.indexOf(currentPlan);
  return plans[Math.min(currentIndex + 1, plans.length - 1)];
};

export const createSubscriptionLimits = () => {
  return SUBSCRIPTION_LIMITS;
};
