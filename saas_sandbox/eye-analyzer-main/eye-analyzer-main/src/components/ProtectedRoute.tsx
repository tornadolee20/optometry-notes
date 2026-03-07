import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
  skipSubscriptionCheck?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireProfile = true,
  skipSubscriptionCheck = false 
}: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || skipSubscriptionCheck) {
        setCheckingSubscription(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('optometrist_profiles')
          .select('is_active, paid_until')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error || !data) {
          setSubscriptionStatus('not_found');
        } else if (!data.is_active) {
          setSubscriptionStatus('blocked');
        } else if (new Date(data.paid_until) < new Date()) {
          setSubscriptionStatus('expired');
        } else {
          setSubscriptionStatus('active');
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
        setSubscriptionStatus('active'); // Default to active on error
      } finally {
        setCheckingSubscription(false);
      }
    };

    if (!isLoading && user) {
      checkSubscription();
    } else if (!isLoading) {
      setCheckingSubscription(false);
    }
  }, [user, isLoading, skipSubscriptionCheck]);

  if (isLoading || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireProfile && !profile) {
    return <Navigate to="/auth/register" replace />;
  }

  // Check if Taiwan users have complete license info
  const profilePages = ['/profile'];
  if (profile && profile.country === 'TW' && !profile.optometrist_license_number && !profilePages.includes(location.pathname)) {
    return <Navigate to="/profile" replace />;
  }

  // Check if non-TW users have professional role set
  if (profile && profile.country && profile.country !== 'TW' && !profile.professional_role && !profilePages.includes(location.pathname)) {
    return <Navigate to="/profile" replace />;
  }

  // Check subscription status (skip for subscription-related pages)
  const subscriptionPages = ['/subscription', '/subscription-expired', '/account-blocked', '/profile'];
  if (!skipSubscriptionCheck && !subscriptionPages.includes(location.pathname)) {
    if (subscriptionStatus === 'blocked') {
      return <Navigate to="/account-blocked" replace />;
    }
    if (subscriptionStatus === 'expired') {
      return <Navigate to="/subscription-expired" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
