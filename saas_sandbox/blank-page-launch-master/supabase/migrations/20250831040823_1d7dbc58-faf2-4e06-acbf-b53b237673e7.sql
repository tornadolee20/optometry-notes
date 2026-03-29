
-- 1) 將驗證函數改為固定上限 48（保留 3–7 字長度檢查）
CREATE OR REPLACE FUNCTION public.validate_store_keywords()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER := 48; -- 統一固定上限
BEGIN
  -- 長度需在 3 到 7（去除前後空白後）
  IF NEW.keyword IS NULL OR char_length(btrim(NEW.keyword)) < 3 OR char_length(btrim(NEW.keyword)) > 7 THEN
    RAISE EXCEPTION 'Keyword length must be between 3 and 7 characters';
  END IF;

  -- 僅在 INSERT 時檢查數量上限（與原本行為一致）
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

-- 2) 確保觸發器存在（先刪除同名再重建），在 INSERT/UPDATE 觸發
DROP TRIGGER IF EXISTS store_keywords_validate_trigger ON public.store_keywords;

CREATE TRIGGER store_keywords_validate_trigger
BEFORE INSERT OR UPDATE ON public.store_keywords
FOR EACH ROW
EXECUTE FUNCTION public.validate_store_keywords();
