
-- Atomic rate limit check-and-increment function
-- Returns: allowed (boolean), remaining (int), reset_time (timestamptz), error_message (text)
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  _function_name text,
  _origin text DEFAULT NULL,
  _ip_address inet DEFAULT NULL,
  _max_requests int DEFAULT 20,
  _window_minutes int DEFAULT 15,
  _block_duration_minutes int DEFAULT 60
)
RETURNS TABLE(
  allowed boolean,
  remaining int,
  reset_time timestamptz,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _now timestamptz := timezone('utc', now());
  _window_start timestamptz := _now - make_interval(mins => _window_minutes);
  _total int;
  _last_request timestamptz;
  _block_until timestamptz;
  _reset timestamptz;
BEGIN
  -- Lock relevant rows to prevent TOCTOU race
  -- Sum all request counts in the current window for this origin/ip+function
  SELECT COALESCE(SUM(f.request_count), 0), MAX(f.last_request_at)
  INTO _total, _last_request
  FROM public.function_usage_logs f
  WHERE f.function_name = _function_name
    AND f.window_start >= _window_start
    AND (
      (_origin IS NOT NULL AND f.origin = _origin)
      OR (_origin IS NULL AND _ip_address IS NOT NULL AND f.ip_address = _ip_address)
    )
  FOR UPDATE;

  -- Check if currently blocked
  IF _total >= _max_requests AND _last_request IS NOT NULL THEN
    _block_until := _last_request + make_interval(mins => _block_duration_minutes);
    IF _now < _block_until THEN
      RETURN QUERY SELECT
        false::boolean,
        0::int,
        _block_until,
        format('請求過於頻繁，請等待 %s 分鐘後再試',
               CEIL(EXTRACT(EPOCH FROM (_block_until - _now)) / 60)::int);
      RETURN;
    END IF;
  END IF;

  -- Allowed: atomically upsert the count
  INSERT INTO public.function_usage_logs (
    function_name, origin, ip_address, request_count, window_start, last_request_at
  ) VALUES (
    _function_name, _origin, _ip_address, 1, _window_start, _now
  )
  ON CONFLICT (function_name, origin, window_start)
    WHERE origin IS NOT NULL
  DO UPDATE SET
    request_count = function_usage_logs.request_count + 1,
    last_request_at = _now;

  -- If origin is null, try ip-based conflict
  -- (the above INSERT handles origin-based; for IP we need a separate path)
  -- Actually, since most traffic uses origin, handle ip fallback:
  IF _origin IS NULL AND _ip_address IS NOT NULL THEN
    -- Delete the row we just inserted (it used NULL origin)
    DELETE FROM public.function_usage_logs
    WHERE function_name = _function_name
      AND origin IS NULL
      AND ip_address = _ip_address
      AND window_start = _window_start;

    INSERT INTO public.function_usage_logs (
      function_name, origin, ip_address, request_count, window_start, last_request_at
    ) VALUES (
      _function_name, NULL, _ip_address, _total + 1, _window_start, _now
    )
    ON CONFLICT (function_name, ip_address, window_start)
      WHERE ip_address IS NOT NULL
    DO UPDATE SET
      request_count = function_usage_logs.request_count + 1,
      last_request_at = _now;
  END IF;

  _reset := _window_start + make_interval(mins => _window_minutes);

  -- Re-check total after increment
  IF _total + 1 > _max_requests THEN
    _block_until := _now + make_interval(mins => _block_duration_minutes);
    RETURN QUERY SELECT
      false::boolean,
      0::int,
      _block_until,
      format('請求過於頻繁，請等待 %s 分鐘後再試',
             CEIL(EXTRACT(EPOCH FROM (_block_until - _now)) / 60)::int);
    RETURN;
  END IF;

  RETURN QUERY SELECT
    true::boolean,
    (_max_requests - _total - 1)::int,
    _reset,
    NULL::text;
END;
$$;

-- Create partial unique indexes for atomic upsert conflict targets
-- Origin-based uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_function_usage_origin_unique
  ON public.function_usage_logs (function_name, origin, window_start)
  WHERE origin IS NOT NULL;

-- IP-based uniqueness  
CREATE UNIQUE INDEX IF NOT EXISTS idx_function_usage_ip_unique
  ON public.function_usage_logs (function_name, ip_address, window_start)
  WHERE ip_address IS NOT NULL;
