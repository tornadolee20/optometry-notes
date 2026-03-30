
-- 1. Fix: Restrict anon access to stores - only expose non-sensitive columns via a view
-- Drop existing overly-permissive anon policy
DROP POLICY IF EXISTS "Anon can read active stores" ON public.stores;

-- Create a view with only non-sensitive columns for public/anon access
CREATE OR REPLACE VIEW public.stores_public
WITH (security_invoker = on) AS
SELECT 
  id, 
  store_name, 
  description, 
  google_review_url, 
  industry, 
  store_number, 
  status, 
  created_at
FROM public.stores
WHERE status = 'active';

-- Re-create anon policy that only allows access through the view pattern
-- Anon users must use get_store_for_review() or the public view
CREATE POLICY "Anon can read active stores limited"
ON public.stores
FOR SELECT
TO anon
USING (false);

-- 2. Fix: Restrict admins table SELECT to super_admin only
DROP POLICY IF EXISTS "Authenticated users can read admins" ON public.admins;

CREATE POLICY "Only super admins can read admins"
ON public.admins
FOR SELECT
TO authenticated
USING (is_super_admin());
