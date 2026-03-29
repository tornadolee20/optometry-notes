
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
  _window_start timestamptz;
  _current_count int;
  _reset timestamptz;
  _block_until timestamptz;
BEGIN
  -- Truncate to fixed window boundary so ALL requests in the same
  -- N-minute window share the exact same window_start value.
  -- This prevents the TOCTOU issue where millisecond differences
  -- cause each request to create its own row.
  _window_start := date_trunc('hour', _now)
    + (floor(extract(minute FROM _now) / _window_minutes) * _window_minutes)
      * interval '1 minute';

  -- Advisory lock serializes concurrent requests from the same origin
  PERFORM pg_advisory_xact_lock(
    hashtext(_function_name || '|' || COALESCE(_origin, '') || '|' || COALESCE(_ip_address::text, ''))
  );

  -- Upsert: create the row if it doesn't exist (count=0), or do nothing
  IF _origin IS NOT NULL THEN
    INSERT INTO public.function_usage_logs (
      function_name, origin, ip_address, request_count, window_start, last_request_at
    ) VALUES (
      _function_name, _origin, _ip_address, 0, _window_start, _now
    )
    ON CONFLICT (function_name, origin, window_start) WHERE origin IS NOT NULL
    DO NOTHING;
  ELSE
    INSERT INTO public.function_usage_logs (
      function_name, origin, ip_address, request_count, window_start, last_request_at
    ) VALUES (
      _function_name, NULL, _ip_address, 0, _window_start, _now
    )
    ON CONFLICT (function_name, ip_address, window_start) WHERE ip_address IS NOT NULL
    DO NOTHING;
  END IF;

  -- Read current count (safe under advisory lock, exact window_start match)
  SELECT COALESCE(f.request_count, 0)
  INTO _current_count
  FROM public.function_usage_logs f
  WHERE f.function_name = _function_name
    AND f.window_start = _window_start
    AND (
      (_origin IS NOT NULL AND f.origin = _origin)
      OR (_origin IS NULL AND _ip_address IS NOT NULL AND f.ip_address = _ip_address)
    )
  LIMIT 1;

  _current_count := COALESCE(_current_count, 0);
  _reset := _window_start + make_interval(mins => _window_minutes);

  -- Check if limit exceeded
  IF _current_count >= _max_requests THEN
    _block_until := _now + make_interval(mins => _block_duration_minutes);
    RETURN QUERY SELECT
      false::boolean,
      0::int,
      _block_until,
      format('請求過於頻繁，請等待 %s 分鐘後再試', _block_duration_minutes);
    RETURN;
  END IF;

  -- Increment the counter atomically
  IF _origin IS NOT NULL THEN
    UPDATE public.function_usage_logs
    SET request_count = request_count + 1,
        last_request_at = _now
    WHERE function_name = _function_name
      AND window_start = _window_start
      AND origin = _origin;
  ELSE
    UPDATE public.function_usage_logs
    SET request_count = request_count + 1,
        last_request_at = _now
    WHERE function_name = _function_name
      AND window_start = _window_start
      AND ip_address = _ip_address;
  END IF;

  RETURN QUERY SELECT
    true::boolean,
    (_max_requests - _current_count - 1)::int,
    _reset,
    NULL::text;
END;
$$;

-- Clean up stale test rows with millisecond-varying window_starts
DELETE FROM public.function_usage_logs 
WHERE function_name = 'generate-review' 
  AND origin = 'http://localhost:3000';
