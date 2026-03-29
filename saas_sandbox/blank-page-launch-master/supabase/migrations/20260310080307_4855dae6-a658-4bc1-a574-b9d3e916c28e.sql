
-- Drop all existing RESTRICTIVE policies on industry_requests
DROP POLICY IF EXISTS "industry_requests_insert_own" ON public.industry_requests;
DROP POLICY IF EXISTS "industry_requests_select_own" ON public.industry_requests;
DROP POLICY IF EXISTS "industry_requests_update_admin" ON public.industry_requests;
DROP POLICY IF EXISTS "industry_requests_delete_admin" ON public.industry_requests;

-- Recreate as PERMISSIVE policies
CREATE POLICY "industry_requests_insert_own"
  ON public.industry_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    (store_id IN (SELECT s.id FROM stores s WHERE s.user_id = auth.uid()))
    OR is_super_admin()
  );

CREATE POLICY "industry_requests_select_own"
  ON public.industry_requests FOR SELECT
  TO authenticated
  USING (
    is_super_admin()
    OR (store_id IN (SELECT s.id FROM stores s WHERE s.user_id = auth.uid()))
  );

CREATE POLICY "industry_requests_update_admin"
  ON public.industry_requests FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "industry_requests_delete_admin"
  ON public.industry_requests FOR DELETE
  TO authenticated
  USING (is_super_admin());
