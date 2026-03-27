-- Add country, professional role, and TW license fields to optometrist_profiles
ALTER TABLE public.optometrist_profiles
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS professional_role text,
ADD COLUMN IF NOT EXISTS tw_license_number text;

-- Add comments for clarity
COMMENT ON COLUMN public.optometrist_profiles.country IS 'Country code: TW, CN, or other ISO codes';
COMMENT ON COLUMN public.optometrist_profiles.professional_role IS 'Professional role: optometrist or ophthalmologist';
COMMENT ON COLUMN public.optometrist_profiles.tw_license_number IS 'Taiwan license number (only for country=TW)';