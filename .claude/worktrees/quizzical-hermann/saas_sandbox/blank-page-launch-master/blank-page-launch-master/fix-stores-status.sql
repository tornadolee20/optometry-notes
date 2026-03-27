-- Fix stores status constraint to match admin interface usage
-- The initial schema allows 'pending' but the constraints migration only allows 'suspended'

-- Drop the incorrect constraint
ALTER TABLE stores DROP CONSTRAINT IF EXISTS stores_status_check;

-- Add the correct constraint that matches our admin interface
ALTER TABLE stores
ADD CONSTRAINT stores_status_check 
CHECK (status IN ('active', 'inactive', 'pending', 'suspended'));

-- Also ensure the default is still 'active'
ALTER TABLE stores 
ALTER COLUMN status SET DEFAULT 'active';