-- 🔒 CRITICAL SECURITY FIX: Lock down user_roles table
-- Current policy allows ANY user to give themselves admin rights!

-- Drop the dangerous "allow all" policy
DROP POLICY IF EXISTS "user_roles_policy" ON public.user_roles;

-- Create secure policies for user_roles table
-- Users can only read their own roles
CREATE POLICY "user_roles_select_own" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Only super_admins can insert new roles
CREATE POLICY "user_roles_insert_super_admin" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (is_super_admin());

-- Only super_admins can update roles
CREATE POLICY "user_roles_update_super_admin" 
ON public.user_roles 
FOR UPDATE 
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Only super_admins can delete roles
CREATE POLICY "user_roles_delete_super_admin" 
ON public.user_roles 
FOR DELETE 
USING (is_super_admin());

-- Also fix the users table - currently allows any authenticated user to read ALL user data
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow users to view own data" ON public.users;

-- Create more restrictive policies
-- Users can only read their own profile
CREATE POLICY "users_select_own_profile" 
ON public.users 
FOR SELECT 
USING (id = auth.uid());

-- Super admins can read all profiles for admin purposes
CREATE POLICY "users_select_super_admin" 
ON public.users 
FOR SELECT 
USING (is_super_admin());