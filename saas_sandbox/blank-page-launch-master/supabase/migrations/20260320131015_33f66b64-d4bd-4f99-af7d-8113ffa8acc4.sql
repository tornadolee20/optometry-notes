
-- ============================================================
-- 店家管理權轉移 (Store Ownership Transfer)
-- ============================================================

-- 1. 建立 store_transfer_requests 表
CREATE TABLE public.store_transfer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  from_owner_email text NOT NULL,
  to_owner_email text NOT NULL,
  transfer_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- 2. 索引
CREATE INDEX idx_transfer_token ON public.store_transfer_requests(transfer_token);
CREATE INDEX idx_transfer_store ON public.store_transfer_requests(store_id);
CREATE INDEX idx_transfer_status ON public.store_transfer_requests(status);

-- 3. RLS
ALTER TABLE public.store_transfer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins full access on transfers"
  ON public.store_transfer_requests
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Users can view own transfer requests"
  ON public.store_transfer_requests
  FOR SELECT
  TO authenticated
  USING (
    from_owner_email = (SELECT email FROM public.users WHERE id = auth.uid())
    OR to_owner_email = (SELECT email FROM public.users WHERE id = auth.uid())
  );

-- 4. accept_store_transfer RPC (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.accept_store_transfer(_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _request record;
  _new_user_id uuid;
  _store_name text;
BEGIN
  -- 取得 transfer request
  SELECT * INTO _request
  FROM public.store_transfer_requests
  WHERE transfer_token = _token
    AND status = 'pending'
  LIMIT 1;

  IF _request IS NULL THEN
    -- 檢查是否已過期
    UPDATE public.store_transfer_requests
    SET status = 'expired'
    WHERE transfer_token = _token
      AND status = 'pending'
      AND expires_at <= now();

    RETURN jsonb_build_object('success', false, 'error', '此轉移連結無效或已被使用');
  END IF;

  -- 檢查是否過期
  IF _request.expires_at <= now() THEN
    UPDATE public.store_transfer_requests
    SET status = 'expired'
    WHERE id = _request.id;

    RETURN jsonb_build_object('success', false, 'error', '此轉移連結已過期');
  END IF;

  -- 查找新老闆的 user_id
  SELECT id INTO _new_user_id
  FROM public.users
  WHERE email = _request.to_owner_email
  LIMIT 1;

  IF _new_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', '新老闆尚未註冊，請先建立帳號再接受轉移');
  END IF;

  -- 取得店名（用於 activity log）
  SELECT store_name INTO _store_name
  FROM public.stores
  WHERE id = _request.store_id;

  -- ============================================================
  -- 【未來重構注意】
  -- 如果改成 store_owners 多對多關聯，把以下 UPDATE 改成：
  --   1. INSERT INTO store_owners (store_id, user_id, is_primary)
  --      VALUES (_request.store_id, _new_user_id, true)
  --      ON CONFLICT (store_id, user_id) DO UPDATE SET is_primary = true;
  --   2. UPDATE store_owners SET is_primary = false
  --      WHERE store_id = _request.store_id AND user_id != _new_user_id;
  -- 其餘驗證（token、過期、activity_logs）都可以原封不動沿用。
  -- ============================================================
  UPDATE public.stores
  SET user_id = _new_user_id,
      updated_at = now()
  WHERE id = _request.store_id;

  -- 標記為已接受
  UPDATE public.store_transfer_requests
  SET status = 'accepted'
  WHERE id = _request.id;

  -- 寫入活動紀錄
  INSERT INTO public.activity_logs (
    entity_type, entity_id, activity_type, description, performed_by, metadata, created_at
  ) VALUES (
    'store',
    _request.store_id::text,
    'ownership_transferred',
    format('店家「%s」管理權已從 %s 轉移至 %s', _store_name, _request.from_owner_email, _request.to_owner_email),
    _new_user_id::text,
    jsonb_build_object(
      'transfer_id', _request.id,
      'from_email', _request.from_owner_email,
      'to_email', _request.to_owner_email,
      'store_name', _store_name
    ),
    now()
  );

  RETURN jsonb_build_object('success', true, 'store_name', _store_name);
END;
$$;
