-- Create a trigger function to protect whitelist fields from non-admin updates
CREATE OR REPLACE FUNCTION public.protect_whitelist_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user is admin, allow all changes
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  
  -- For non-admin users, prevent changes to whitelist fields
  IF OLD.training_completed IS DISTINCT FROM NEW.training_completed THEN
    NEW.training_completed := OLD.training_completed;
  END IF;
  
  IF OLD.research_consent_signed IS DISTINCT FROM NEW.research_consent_signed THEN
    NEW.research_consent_signed := OLD.research_consent_signed;
  END IF;
  
  IF OLD.research_qualified IS DISTINCT FROM NEW.research_qualified THEN
    NEW.research_qualified := OLD.research_qualified;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS protect_whitelist_fields_trigger ON public.optometrist_profiles;
CREATE TRIGGER protect_whitelist_fields_trigger
  BEFORE UPDATE ON public.optometrist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_whitelist_fields();