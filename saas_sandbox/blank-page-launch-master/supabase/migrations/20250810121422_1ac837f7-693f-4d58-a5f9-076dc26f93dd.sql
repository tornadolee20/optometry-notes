-- Add DELETE policy for store_keywords to allow deletion (consistent with existing open policies)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'store_keywords' AND policyname = 'Allow delete access to store_keywords'
  ) THEN
    CREATE POLICY "Allow delete access to store_keywords"
    ON public.store_keywords
    FOR DELETE
    USING (true);
  END IF;
END $$;

-- Create validation function to enforce keyword length (3-7 chars) and max 48 per store on insert
CREATE OR REPLACE FUNCTION public.validate_store_keywords()
RETURNS TRIGGER AS $$
BEGIN
  -- Enforce keyword length between 3 and 7 characters (after trimming)
  IF NEW.keyword IS NULL OR char_length(btrim(NEW.keyword)) < 3 OR char_length(btrim(NEW.keyword)) > 7 THEN
    RAISE EXCEPTION 'Keyword length must be between 3 and 7 characters';
  END IF;

  -- Enforce max 48 keywords per store on INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.store_id IS NOT NULL THEN
      IF (SELECT count(*) FROM public.store_keywords WHERE store_id = NEW.store_id) >= 48 THEN
        RAISE EXCEPTION 'Maximum 48 keywords per store reached';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for INSERT to enforce count + length
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_validate_store_keywords_ins'
  ) THEN
    CREATE TRIGGER trg_validate_store_keywords_ins
    BEFORE INSERT ON public.store_keywords
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_store_keywords();
  END IF;
END $$;

-- Trigger for UPDATE to enforce length when the keyword text changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_validate_store_keywords_upd'
  ) THEN
    CREATE TRIGGER trg_validate_store_keywords_upd
    BEFORE UPDATE OF keyword ON public.store_keywords
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_store_keywords();
  END IF;
END $$;