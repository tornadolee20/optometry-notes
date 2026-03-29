-- Create rate limiting table for Edge Functions abuse prevention
CREATE TABLE public.function_usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin text,
  ip_address inet,
  user_agent text,
  function_name text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  last_request_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on the rate limiting table
ALTER TABLE public.function_usage_logs ENABLE ROW LEVEL SECURITY;

-- Only system/service role can manage rate limiting data
CREATE POLICY "System can manage function usage logs" 
ON public.function_usage_logs 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Create index for efficient rate limiting queries
CREATE INDEX idx_function_usage_origin_window ON public.function_usage_logs(origin, function_name, window_start);
CREATE INDEX idx_function_usage_ip_window ON public.function_usage_logs(ip_address, function_name, window_start);
CREATE INDEX idx_function_usage_cleanup ON public.function_usage_logs(created_at);

-- Function to clean up old rate limiting records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_function_usage_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.function_usage_logs 
  WHERE created_at < now() - interval '24 hours';
END;
$$;