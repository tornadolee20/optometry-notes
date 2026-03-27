-- Add privacy consent fields to optometrist_profiles table
ALTER TABLE public.optometrist_profiles 
ADD COLUMN IF NOT EXISTS privacy_agreed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_version TEXT DEFAULT 'v1.0',
ADD COLUMN IF NOT EXISTS research_consent BOOLEAN DEFAULT false;