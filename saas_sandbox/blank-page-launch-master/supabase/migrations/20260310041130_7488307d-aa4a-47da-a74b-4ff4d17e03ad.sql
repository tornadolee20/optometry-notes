
-- Add is_sandbox column to stores
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS is_sandbox boolean NOT NULL DEFAULT false;

-- Add is_sandbox column to store_keywords
ALTER TABLE public.store_keywords ADD COLUMN IF NOT EXISTS is_sandbox boolean NOT NULL DEFAULT false;

-- Add is_sandbox column to customer_keyword_logs
ALTER TABLE public.customer_keyword_logs ADD COLUMN IF NOT EXISTS is_sandbox boolean NOT NULL DEFAULT false;

-- Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_stores_is_sandbox ON public.stores(is_sandbox);
CREATE INDEX IF NOT EXISTS idx_store_keywords_is_sandbox ON public.store_keywords(is_sandbox);
CREATE INDEX IF NOT EXISTS idx_customer_keyword_logs_is_sandbox ON public.customer_keyword_logs(is_sandbox);

-- Add onboarding_completed to stores to track wizard completion
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
