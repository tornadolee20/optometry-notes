-- Phase 2: Implement stricter RLS policies for business data
-- Focus on user-owned data and admin access

-- 1. Update stores table RLS policies
DROP POLICY IF EXISTS "Allow insert access to stores" ON public.stores;
DROP POLICY IF EXISTS "Allow read access to stores" ON public.stores;
DROP POLICY IF EXISTS "Allow update access to stores" ON public.stores;

CREATE POLICY "Users can view their own stores"
ON public.stores
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Users can create their own stores"
ON public.stores
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own stores"
ON public.stores
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR is_super_admin())
WITH CHECK (user_id = auth.uid() OR is_super_admin());

-- 2. Update store_keywords table RLS policies
DROP POLICY IF EXISTS "Allow delete access to store_keywords" ON public.store_keywords;
DROP POLICY IF EXISTS "Allow insert access to store_keywords" ON public.store_keywords;
DROP POLICY IF EXISTS "Allow read access to store_keywords" ON public.store_keywords;
DROP POLICY IF EXISTS "Allow update access to store_keywords" ON public.store_keywords;

CREATE POLICY "Users can view keywords for their stores"
ON public.store_keywords
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stores s 
    WHERE s.id = store_keywords.store_id 
    AND (s.user_id = auth.uid() OR is_super_admin())
  )
);

CREATE POLICY "Users can manage keywords for their stores"
ON public.store_keywords
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stores s 
    WHERE s.id = store_keywords.store_id 
    AND (s.user_id = auth.uid() OR is_super_admin())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores s 
    WHERE s.id = store_keywords.store_id 
    AND (s.user_id = auth.uid() OR is_super_admin())
  )
);

-- 3. Update store_subscriptions table RLS policies
DROP POLICY IF EXISTS "Allow read access to store_subscriptions" ON public.store_subscriptions;
DROP POLICY IF EXISTS "super_admins_manage_store_subscriptions" ON public.store_subscriptions;

CREATE POLICY "Users can view subscriptions for their stores"
ON public.store_subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stores s 
    WHERE s.id = store_subscriptions.store_id 
    AND (s.user_id = auth.uid() OR is_super_admin())
  )
);

CREATE POLICY "Super admins can manage all subscriptions"
ON public.store_subscriptions
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());