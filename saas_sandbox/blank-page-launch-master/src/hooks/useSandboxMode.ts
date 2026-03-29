import { useAuth } from '@/hooks/useAuth';
import { SANDBOX_EMAIL, isSandboxMode } from '@/config/industryTemplates';

export { SANDBOX_EMAIL };

/**
 * Hook to determine if current user is in sandbox mode.
 * Only the designated admin email triggers sandbox mode.
 */
export const useSandboxMode = () => {
  const { user } = useAuth();
  const isSandbox = isSandboxMode(user?.email);
  
  return {
    isSandbox,
    sandboxEmail: SANDBOX_EMAIL,
    userEmail: user?.email ?? null,
  };
};
