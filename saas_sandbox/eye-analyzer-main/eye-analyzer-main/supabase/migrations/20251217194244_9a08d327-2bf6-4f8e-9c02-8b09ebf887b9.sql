-- Add research whitelist fields to optometrist_profiles
ALTER TABLE public.optometrist_profiles 
  ADD COLUMN IF NOT EXISTS training_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS research_consent_signed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS research_qualified boolean NOT NULL DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.optometrist_profiles.training_completed IS 'Whether the optometrist has completed required training';
COMMENT ON COLUMN public.optometrist_profiles.research_consent_signed IS 'Whether the optometrist has signed research cooperation agreement';
COMMENT ON COLUMN public.optometrist_profiles.research_qualified IS 'Whether the optometrist is qualified for research data export (whitelist)';