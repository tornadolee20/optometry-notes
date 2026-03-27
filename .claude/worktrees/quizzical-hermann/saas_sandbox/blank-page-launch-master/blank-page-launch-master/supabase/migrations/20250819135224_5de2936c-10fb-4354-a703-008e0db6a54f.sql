-- Clean up previously added permissive policies if present
DROP POLICY IF EXISTS "Anyone can view stores for review generation" ON public.stores;
DROP POLICY IF EXISTS "Anyone can view store keywords for review generation" ON public.store_keywords;

-- Relax SELECT on stores for public review generation
DROP POLICY IF EXISTS stores_select_policy ON public.stores;
CREATE POLICY stores_select_public
ON public.stores
AS PERMISSIVE
FOR SELECT
USING (true);

-- Rebuild store_keywords RLS: public can SELECT; only owners/admins can modify
DROP POLICY IF EXISTS store_keywords_policy ON public.store_keywords;

-- Allow public read
CREATE POLICY store_keywords_select_public
ON public.store_keywords
AS PERMISSIVE
FOR SELECT
USING (true);

-- Allow owners and super_admin to insert
CREATE POLICY store_keywords_insert_owner_or_admin
ON public.store_keywords
AS PERMISSIVE
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = store_keywords.store_id
      AND (s.user_id = auth.uid() OR is_super_admin())
  )
);

-- Allow owners and super_admin to update
CREATE POLICY store_keywords_update_owner_or_admin
ON public.store_keywords
AS PERMISSIVE
FOR UPDATE
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

-- Allow owners and super_admin to delete
CREATE POLICY store_keywords_delete_owner_or_admin
ON public.store_keywords
AS PERMISSIVE
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = store_keywords.store_id
      AND (s.user_id = auth.uid() OR is_super_admin())
  )
);