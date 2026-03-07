-- Fix unique constraint issue by making the constraint deferrable and handling conflicts better
ALTER TABLE store_subscriptions DROP CONSTRAINT IF EXISTS uq_store_subscriptions_store_id;

-- Add a unique constraint that allows for better conflict handling
ALTER TABLE store_subscriptions ADD CONSTRAINT uq_store_subscriptions_store_id UNIQUE (store_id) DEFERRABLE INITIALLY IMMEDIATE;