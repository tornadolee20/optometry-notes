-- Drop the existing function and recreate with all required fields
DROP FUNCTION public.get_store_for_review(integer);

CREATE OR REPLACE FUNCTION public.get_store_for_review(store_number_param integer)
 RETURNS TABLE(
   id uuid, 
   store_name text, 
   address text, 
   industry text, 
   store_number integer,
   email text,
   phone text,
   user_id uuid,
   description text,
   google_review_url text,
   created_at timestamp with time zone,
   updated_at timestamp with time zone,
   status store_status
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT s.id, s.store_name, s.address, s.industry, s.store_number, 
         s.email, s.phone, s.user_id, s.description, s.google_review_url,
         s.created_at, s.updated_at, s.status
  FROM public.stores s
  WHERE s.store_number = store_number_param 
    AND s.status = 'active'
    AND is_subscription_active(s.id)
  LIMIT 1;
$function$