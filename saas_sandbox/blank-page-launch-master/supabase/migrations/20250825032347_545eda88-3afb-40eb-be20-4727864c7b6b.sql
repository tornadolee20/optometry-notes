-- 更新關鍵字驗證函數以支援動態限制
CREATE OR REPLACE FUNCTION public.validate_store_keywords()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER := 500; -- 預設最大限制，會被訂閱方案覆蓋
  store_plan TEXT;
  plan_limits JSONB;
BEGIN
  -- Enforce keyword length between 3 and 7 characters (after trimming)
  IF NEW.keyword IS NULL OR char_length(btrim(NEW.keyword)) < 3 OR char_length(btrim(NEW.keyword)) > 7 THEN
    RAISE EXCEPTION 'Keyword length must be between 3 and 7 characters';
  END IF;

  -- Enforce dynamic keyword limits based on subscription plan on INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.store_id IS NOT NULL THEN
      -- 獲取當前關鍵字數量
      SELECT count(*) INTO current_count 
      FROM public.store_keywords 
      WHERE store_id = NEW.store_id;

      -- 獲取店家的訂閱方案
      SELECT 
        COALESCE(ss.plan_type, 'trial') INTO store_plan
      FROM public.stores s
      LEFT JOIN public.store_subscriptions ss ON s.id = ss.store_id
      WHERE s.id = NEW.store_id;

      -- 根據方案設定限制
      CASE store_plan
        WHEN 'trial' THEN max_allowed := 25;
        WHEN 'monthly' THEN max_allowed := 25;
        WHEN 'quarterly' THEN max_allowed := 100;
        WHEN 'yearly' THEN max_allowed := 500;
        ELSE max_allowed := 25; -- 預設為基礎版限制
      END CASE;

      -- 檢查是否超過限制
      IF current_count >= max_allowed THEN
        RAISE EXCEPTION 'Maximum % keywords per store reached for % plan', max_allowed, store_plan;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;