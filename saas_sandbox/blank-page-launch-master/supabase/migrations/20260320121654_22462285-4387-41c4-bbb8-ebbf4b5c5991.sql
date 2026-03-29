
-- Expand get_critical_backup_data to include store_keywords and industry_templates
CREATE OR REPLACE FUNCTION public.get_critical_backup_data()
 RETURNS TABLE(table_name text, row_count bigint, data_json jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Stores data
  RETURN QUERY
  SELECT 
    'stores'::text,
    count(*)::bigint,
    COALESCE(jsonb_agg(to_jsonb(s.*)), '[]'::jsonb)
  FROM public.stores s;
  
  -- Store subscriptions data
  RETURN QUERY
  SELECT 
    'store_subscriptions'::text,
    count(*)::bigint,
    COALESCE(jsonb_agg(to_jsonb(ss.*)), '[]'::jsonb)
  FROM public.store_subscriptions ss;
  
  -- Payment transactions data
  RETURN QUERY
  SELECT 
    'payment_transactions'::text,
    count(*)::bigint,
    COALESCE(jsonb_agg(to_jsonb(pt.*)), '[]'::jsonb)
  FROM public.payment_transactions pt;
  
  -- Bank transfer submissions data
  RETURN QUERY
  SELECT 
    'bank_transfer_submissions'::text,
    count(*)::bigint,
    COALESCE(jsonb_agg(to_jsonb(bts.*)), '[]'::jsonb)
  FROM public.bank_transfer_submissions bts;

  -- Store keywords data
  RETURN QUERY
  SELECT 
    'store_keywords'::text,
    count(*)::bigint,
    COALESCE(jsonb_agg(to_jsonb(sk.*)), '[]'::jsonb)
  FROM public.store_keywords sk;

  -- Industry templates data
  RETURN QUERY
  SELECT 
    'industry_templates'::text,
    count(*)::bigint,
    COALESCE(jsonb_agg(to_jsonb(it.*)), '[]'::jsonb)
  FROM public.industry_templates it;
END;
$$;
