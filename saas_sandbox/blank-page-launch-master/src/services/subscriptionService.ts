import { supabase } from '@/integrations/supabase/client';

/**
 * Canonical subscription-active check.
 *
 * Priority: status field first, expires_at as secondary guard.
 *
 * Status mapping:
 *   active   → true  (warn if expires_at is > 7 days in the past)
 *   trial    → true only if expires_at is in the future
 *   past_due → false
 *   canceled → false
 *   expired  → false
 *   null/unknown → false (warn: data inconsistency)
 */
export async function isStoreSubscriptionActive(storeId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('store_subscriptions')
    .select('status, expires_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[subscriptionService] Failed to fetch subscription:', error);
    return false;
  }

  if (!data) {
    return false;
  }

  return evaluateSubscriptionStatus(data.status, data.expires_at);
}

/**
 * Pure logic – no I/O.  Exported for unit testing.
 */
export function evaluateSubscriptionStatus(
  status: string | null | undefined,
  expiresAt: string | null | undefined,
): boolean {
  const now = new Date();
  const expires = expiresAt ? new Date(expiresAt) : null;
  const isExpiredByDate = !expires || expires.getTime() < now.getTime();

  switch (status) {
    case 'active': {
      // Active status is the primary truth.
      // Warn if expires_at is > 7 days in the past – likely stale data.
      if (expires && expires.getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000) {
        console.warn(
          `[subscriptionService] status=active but expires_at is >7 days past (${expiresAt}). Treating as active.`,
        );
      }
      return true;
    }

    case 'trial': {
      // Trial relies on expires_at to determine validity.
      return !isExpiredByDate;
    }

    case 'past_due':
    case 'canceled':
    case 'expired':
      return false;

    default: {
      // null or unknown status
      if (!isExpiredByDate) {
        console.warn(
          `[subscriptionService] Unknown status "${status}" with future expires_at (${expiresAt}). Treating as inactive – data inconsistency.`,
        );
      }
      return false;
    }
  }
}
