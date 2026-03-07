-- Fix: allow bank transfer as a valid payment_source so approval can upsert subscriptions
BEGIN;

-- Drop existing check constraint if present
ALTER TABLE public.store_subscriptions
  DROP CONSTRAINT IF EXISTS store_subscriptions_payment_source_check;

-- Recreate check constraint to include 'bank_transfer' (keep existing 'paid' and 'trial')
-- Use NOT VALID to avoid failing if legacy rows have other values; it will still enforce for new/updated rows
ALTER TABLE public.store_subscriptions
  ADD CONSTRAINT store_subscriptions_payment_source_check
  CHECK (payment_source IN ('paid','trial','bank_transfer')) NOT VALID;

COMMIT;