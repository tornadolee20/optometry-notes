-- Update user_roles RLS policy to allow owner to manage roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create new policy that allows owner to manage all roles
CREATE POLICY "Owner can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'owner'::app_role));

-- Also allow admins to view all roles (read-only for admins)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_admin_access(auth.uid()));