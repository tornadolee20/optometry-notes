-- Phase 1b: Create functions and policies using new enum values
-- Now that enum values are committed, we can use them

-- 1. Create secure role checking function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 2. Update is_super_admin function to use new role system
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.has_role(auth.uid(), 'super_admin'::app_role), false);
$$;

-- 3. Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2  
      WHEN 'manager' THEN 3
      WHEN 'store_owner' THEN 4
      WHEN 'user' THEN 5
    END
  LIMIT 1;
$$;

-- 4. Update RLS policies for user_roles table
DROP POLICY IF EXISTS "Allow role assignment" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can insert own basic role on signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND role = 'user'::app_role);

-- 5. Migrate existing users table roles to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT 
    id,
    CASE 
        WHEN users.role = 'super_admin' THEN 'super_admin'::app_role
        WHEN users.role = 'admin' THEN 'admin'::app_role
        WHEN users.role = 'manager' THEN 'manager'::app_role
        WHEN users.role = 'store_owner' THEN 'store_owner'::app_role
        ELSE 'user'::app_role
    END
FROM public.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = users.id
) AND id IS NOT NULL;

-- 6. Update users table RLS to prevent role column updates by non-super admins
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can update user profiles" ON public.users;

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    (OLD.role = NEW.role OR public.is_super_admin())
);

CREATE POLICY "Super admins can update user profiles"
ON public.users
FOR UPDATE
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());