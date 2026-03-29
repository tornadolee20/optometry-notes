
CREATE OR REPLACE FUNCTION public.validate_store_keywords()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER := 48;
  _is_sandbox BOOLEAN := false;
BEGIN
  -- Check if this keyword belongs to a sandbox store
  IF NEW.store_id IS NOT NULL THEN
    SELECT s.is_sandbox INTO _is_sandbox
    FROM public.stores s
    WHERE s.id = NEW.store_id;
  END IF;

  -- Only enforce 3-7 char limit for non-sandbox keywords
  IF NOT COALESCE(_is_sandbox, false) THEN
    IF NEW.keyword IS NULL OR char_length(btrim(NEW.keyword)) < 3 OR char_length(btrim(NEW.keyword)) > 7 THEN
      RAISE EXCEPTION 'Keyword length must be between 3 and 7 characters';
    END IF;
  ELSE
    -- Sandbox: just ensure keyword is not empty and not absurdly long
    IF NEW.keyword IS NULL OR char_length(btrim(NEW.keyword)) < 1 OR char_length(btrim(NEW.keyword)) > 50 THEN
      RAISE EXCEPTION 'Keyword length must be between 1 and 50 characters (sandbox)';
    END IF;
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
