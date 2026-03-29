
-- 產業需求申請表
CREATE TABLE public.industry_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  parent_industry_id text NOT NULL,
  requested_name text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_template_id text,
  handled_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.industry_requests ENABLE ROW LEVEL SECURITY;

-- Store owners can view their own requests
CREATE POLICY "industry_requests_select_own" ON public.industry_requests
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    (store_id IN (SELECT s.id FROM stores s WHERE s.user_id = auth.uid()))
  );

-- Store owners can insert their own requests  
CREATE POLICY "industry_requests_insert_own" ON public.industry_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    store_id IN (SELECT s.id FROM stores s WHERE s.user_id = auth.uid())
    OR is_super_admin()
  );

-- Only admins can update
CREATE POLICY "industry_requests_update_admin" ON public.industry_requests
  FOR UPDATE TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Only admins can delete
CREATE POLICY "industry_requests_delete_admin" ON public.industry_requests
  FOR DELETE TO authenticated
  USING (is_super_admin());

-- Updated_at trigger
CREATE TRIGGER update_industry_requests_updated_at
  BEFORE UPDATE ON public.industry_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
