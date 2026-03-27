
-- 1) 將新建立的店家預設為可訪問狀態
ALTER TABLE public.stores
  ALTER COLUMN status SET DEFAULT 'active'::store_status;

-- 2) 綁定觸發器：新店建立後自動建立 7 天試用訂閱
DROP TRIGGER IF EXISTS trg_create_initial_trial_subscription ON public.stores;
CREATE TRIGGER trg_create_initial_trial_subscription
AFTER INSERT ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.create_initial_trial_subscription();

-- 3) 一次性資料修正：將 00010 這間店（store_number = 10）啟用，並補 trial（若缺）
DO $$
DECLARE
  s_id uuid;
BEGIN
  SELECT id INTO s_id
  FROM public.stores
  WHERE store_number = 10
  LIMIT 1;

  IF s_id IS NOT NULL THEN
    -- 啟用這間店
    UPDATE public.stores
    SET status = 'active'::store_status
    WHERE id = s_id;

    -- 若尚無訂閱紀錄，補上 7 天試用
    IF NOT EXISTS (
      SELECT 1 FROM public.store_subscriptions WHERE store_id = s_id
    ) THEN
      INSERT INTO public.store_subscriptions (
        store_id, plan_type, status, expires_at, trial_ends_at, auto_renew, payment_source, created_at, updated_at
      ) VALUES (
        s_id,
        'trial',
        'trial',
        timezone('utc', now()) + interval '7 days',
        timezone('utc', now()) + interval '7 days',
        false,
        'trial',
        timezone('utc', now()),
        timezone('utc', now())
      );
    END IF;
  END IF;
END $$;
