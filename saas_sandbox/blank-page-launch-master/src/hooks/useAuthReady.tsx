import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to determine when authentication state is fully loaded and ready for queries
 * This prevents making database queries before we know if user is authenticated
 */
export const useAuthReady = () => {
  const { loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Small delay to ensure auth state is fully settled
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return { isAuthReady: isReady };
};