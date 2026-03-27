-- 更新訂閱方案架構以對應新的方案類型
-- 修改 store_subscriptions 表的 plan_type 欄位以支援新的方案類型

-- 首先創建新的枚舉類型
DO $$ 
BEGIN
  -- 檢查枚舉類型是否存在，如果不存在則創建
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan_type') THEN
    CREATE TYPE subscription_plan_type AS ENUM ('trial', 'monthly', 'quarterly', 'yearly');
  END IF;
END $$;

-- 更新現有數據以映射到新方案類型
UPDATE public.store_subscriptions 
SET plan_type = CASE 
  WHEN plan_type = 'standard' THEN 'monthly'
  WHEN plan_type = 'basic' THEN 'monthly'
  WHEN plan_type = 'premium' THEN 'quarterly'
  WHEN plan_type = 'enterprise' THEN 'yearly'
  ELSE 'monthly'
END
WHERE plan_type IS NOT NULL;

-- 如果有試用期的記錄，將其設置為 trial
UPDATE public.store_subscriptions 
SET plan_type = 'trial'
WHERE status = 'trial' AND trial_ends_at IS NOT NULL;

-- 確保所有 trial 狀態的記錄都有正確的 plan_type
UPDATE public.store_subscriptions 
SET plan_type = 'trial', payment_source = 'trial'
WHERE status = 'trial' AND plan_type != 'trial';

-- 為新用戶註冊後的試用訂閱更新觸發器函數
CREATE OR REPLACE FUNCTION public.create_initial_trial_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  -- Only insert if no subscription exists yet for this store
  if not exists (
    select 1 from public.store_subscriptions s where s.store_id = new.id
  ) then
    insert into public.store_subscriptions (
      store_id,
      plan_type,
      status,
      expires_at,
      trial_ends_at,
      auto_renew,
      payment_source
    ) values (
      new.id,
      'trial',
      'trial',
      timezone('utc', now()) + interval '7 days',
      timezone('utc', now()) + interval '7 days',
      false,
      'trial'
    );
  end if;
  return new;
end;
$function$;