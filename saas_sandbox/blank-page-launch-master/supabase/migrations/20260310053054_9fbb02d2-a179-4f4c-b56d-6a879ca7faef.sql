CREATE OR REPLACE FUNCTION public.validate_store_keywords()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER := 48;
BEGIN
  -- Enforce 3-7 character limit for ALL keywords (sandbox and production)
  IF NEW.keyword IS NULL OR char_length(btrim(NEW.keyword)) < 3 OR char_length(btrim(NEW.keyword)) > 7 THEN
    RAISE EXCEPTION 'Keyword length must be between 3 and 7 characters (got %)', char_length(btrim(COALESCE(NEW.keyword, '')));
  END IF;

  -- Count limit check on INSERT only
  IF TG_OP = 'INSERT' THEN
    IF NEW.store_id IS NOT NULL THEN
      SELECT count(*) INTO current_count
      FROM public.store_keywords
      WHERE store_id = NEW.store_id;

      IF current_count >= max_allowed THEN
        RAISE EXCEPTION 'Maximum % keywords per store reached', max_allowed;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;