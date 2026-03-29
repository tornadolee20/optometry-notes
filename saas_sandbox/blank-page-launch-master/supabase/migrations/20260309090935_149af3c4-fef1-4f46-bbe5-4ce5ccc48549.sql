
-- Revoke direct EXECUTE on has_role from authenticated/anon to prevent role enumeration
-- It will still work inside RLS policies (which run as policy definer context)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
