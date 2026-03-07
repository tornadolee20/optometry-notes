// Subscription utility functions

export type SubscriptionStatus = 'active' | 'expired' | 'blocked' | 'not_found';
export type PlanType = 'trial' | 'monthly' | 'yearly';

export interface SubscriptionInfo {
  planType: PlanType;
  paidUntil: Date;
  isActive: boolean;
  paymentMethod: string;
}

export function getSubscriptionStatus(subscriptionInfo: SubscriptionInfo | null): SubscriptionStatus {
  if (!subscriptionInfo) {
    return 'not_found';
  }

  if (!subscriptionInfo.isActive) {
    return 'blocked';
  }

  const now = new Date();
  const paidUntil = new Date(subscriptionInfo.paidUntil);

  if (paidUntil >= now) {
    return 'active';
  }

  return 'expired';
}

export function formatPlanType(planType: PlanType, lang: 'zh-TW' | 'zh-CN' = 'zh-TW'): string {
  const labels = {
    'zh-TW': {
      trial: '試用',
      monthly: '月繳',
      yearly: '年繳'
    },
    'zh-CN': {
      trial: '试用',
      monthly: '月缴',
      yearly: '年缴'
    }
  };
  return labels[lang][planType] || planType;
}

export function formatSubscriptionStatus(status: SubscriptionStatus, lang: 'zh-TW' | 'zh-CN' = 'zh-TW'): string {
  const labels = {
    'zh-TW': {
      active: '使用中',
      expired: '已到期',
      blocked: '已停用',
      not_found: '未找到'
    },
    'zh-CN': {
      active: '使用中',
      expired: '已到期',
      blocked: '已停用',
      not_found: '未找到'
    }
  };
  return labels[lang][status] || status;
}

export function calculateNewPaidUntil(currentPaidUntil: Date | string, planType: 'monthly' | 'yearly'): Date {
  const now = new Date();
  const baseDate = new Date(currentPaidUntil);
  
  // If current paid_until is in the future, extend from that date
  // Otherwise, extend from today
  const startDate = baseDate >= now ? baseDate : now;
  
  const newDate = new Date(startDate);
  if (planType === 'monthly') {
    newDate.setMonth(newDate.getMonth() + 1);
  } else {
    newDate.setFullYear(newDate.getFullYear() + 1);
  }
  
  return newDate;
}

export const BANK_TRANSFER_INFO = {
  bankCode: '822',
  bankName: '中國信託商業銀行 中崙分行',
  accountNumber: '093534050601'
};

export const PRICING = {
  monthly: 500,
  yearly: 3600
};
