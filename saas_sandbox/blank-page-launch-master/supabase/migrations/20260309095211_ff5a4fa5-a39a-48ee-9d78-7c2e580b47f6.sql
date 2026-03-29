-- 1. Replace has_role with a version that prevents role enumeration
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Prevent role enumeration: non-super-admins can only check their own roles
  IF _user_id IS DISTINCT FROM auth.uid() AND 
     NOT (SELECT EXISTS (
       SELECT 1 FROM public.user_roles 
       WHERE user_id = auth.uid() AND role = 'super_admin'
     )) THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;

-- 2. Tighten customer_keyword_logs INSERT - add daily rate limit for anonymous
DROP POLICY IF EXISTS "customer_keyword_logs_insert_policy" ON public.customer_keyword_logs;
CREATE POLICY "customer_keyword_logs_insert_policy"
  ON public.customer_keyword_logs
  FOR INSERT
  WITH CHECK (
    is_super_admin() OR
    (store_id IN (SELECT stores.id FROM stores WHERE stores.user_id = auth.uid())) OR
    (
      (auth.uid() IS NULL) AND 
      (store_id IS NOT NULL) AND
      is_subscription_active(store_id) AND
      (SELECT count(*) FROM public.customer_keyword_logs ckl 
       WHERE ckl.store_id = customer_keyword_logs.store_id 
       AND ckl.created_at > (now() - interval '1 day')) < 200
    )
  );