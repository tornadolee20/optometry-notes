-- Complete fix for admin_grant_free_subscription function with explicit table references
CREATE OR REPLACE FUNCTION public.admin_grant_free_subscription(_store_id uuid, _duration_days integer, _reason text DEFAULT NULL::text, _notes text DEFAULT NULL::text, _auto_renew boolean DEFAULT false)
 RETURNS TABLE(store_id uuid, plan_type text, status text, expires_at timestamp with time zone, trial_ends_at timestamp with time zone, auto_renew boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _current_expires_at timestamptz;
  _trial_ends_at timestamptz;
  _base_ts timestamptz;
  _new_expires_at timestamptz;
  _plan text;
  _is_admin boolean;
  _subscription_exists boolean;
  _new_status text;
BEGIN
  -- 只有超級管理員或管理員可以執行
  _is_admin := is_super_admin() OR has_role(auth.uid(), 'admin'::app_role);
  IF NOT _is_admin THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF _duration_days IS NULL OR _duration_days <= 0 THEN
    RAISE EXCEPTION 'duration_days must be positive';
  END IF;

  -- 確認店家存在
  IF NOT EXISTS (SELECT 1 FROM public.stores s WHERE s.id = _store_id) THEN
    RAISE EXCEPTION 'Store not found';
  END IF;

  -- 確保店家為 active
  UPDATE public.stores 
     SET status = 'active', updated_at = timezone('utc', now())
   WHERE id = _store_id AND stores.status <> 'active';

  -- 依期間對應方案
  IF _duration_days >= 365 THEN
    _plan := 'yearly';
  ELSIF _duration_days >= 90 THEN
    _plan := 'quarterly';
  ELSIF _duration_days >= 30 THEN
    _plan := 'monthly';
  ELSE
    _plan := 'trial';
  END IF;

  -- 設定狀態
  IF _plan = 'trial' THEN
    _new_status := 'trial';
  ELSE
    _new_status := 'active';
  END IF;

  -- 檢查是否已有訂閱記錄
  SELECT EXISTS(SELECT 1 FROM public.store_subscriptions sub WHERE sub.store_id = _store_id)
  INTO _subscription_exists;

  -- 取得目前訂閱狀態
  SELECT sub.expires_at, sub.trial_ends_at
  INTO _current_expires_at, _trial_ends_at
  FROM public.store_subscriptions sub
  WHERE sub.store_id = _store_id
  LIMIT 1;

  -- 基準時間為：現有 expires_at / trial_ends_at / 現在 的最大值
  _base_ts := GREATEST(
    COALESCE(_current_expires_at, '-infinity'),
    COALESCE(_trial_ends_at, '-infinity'),
    timezone('utc', now())
  );

  _new_expires_at := _base_ts + make_interval(days => _duration_days);

  -- 根據是否存在訂閱記錄來決定操作
  IF _subscription_exists THEN
    -- 更新現有訂閱
    UPDATE public.store_subscriptions 
    SET 
      plan_type = _plan,
      status = _new_status,
      expires_at = _new_expires_at,
      trial_ends_at = CASE 
        WHEN _plan = 'trial' THEN _new_expires_at 
        ELSE store_subscriptions.trial_ends_at 
      END,
      auto_renew = _auto_renew,
      payment_source = 'admin_granted',
      updated_at = timezone('utc', now())
    WHERE store_subscriptions.store_id = _store_id
    RETURNING 
      store_subscriptions.store_id, 
      store_subscriptions.plan_type, 
      store_subscriptions.status, 
      store_subscriptions.expires_at, 
      store_subscriptions.trial_ends_at, 
      store_subscriptions.auto_renew
    INTO store_id, plan_type, status, expires_at, trial_ends_at, auto_renew;
  ELSE
    -- 插入新訂閱
    INSERT INTO public.store_subscriptions (
      store_id, plan_type, status, expires_at, trial_ends_at, auto_renew, payment_source, created_at, updated_at
    ) VALUES (
      _store_id,
      _plan,
      _new_status,
      _new_expires_at,
      CASE WHEN _plan = 'trial' THEN _new_expires_at ELSE NULL END,
      _auto_renew,
      'admin_granted',
      timezone('utc', now()),
      timezone('utc', now())
    )
    RETURNING 
      store_subscriptions.store_id, 
      store_subscriptions.plan_type, 
      store_subscriptions.status, 
      store_subscriptions.expires_at, 
      store_subscriptions.trial_ends_at, 
      store_subscriptions.auto_renew
    INTO store_id, plan_type, status, expires_at, trial_ends_at, auto_renew;
  END IF;

  -- 紀錄操作
  INSERT INTO public.activity_logs (
    entity_type, entity_id, activity_type, description, performed_by, metadata, created_at
  ) VALUES (
    'store',
    _store_id::text,
    'subscription_granted',
    'Admin granted free subscription',
    COALESCE(auth.uid()::text, 'system'),
    jsonb_build_object(
      'duration_days', _duration_days,
      'plan_type', _plan,
      'reason', _reason,
      'notes', _notes,
      'new_expires_at', _new_expires_at,
      'auto_renew', _auto_renew
    ),
    timezone('utc', now())
  );

  RETURN;
END;
$function$;