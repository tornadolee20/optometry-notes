-- Step 2: Create helper functions and update RLS policies

-- 1. Create helper function to get user's role (returns the role or NULL for regular users)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 2. Create helper function to check if user has payment access (owner or accountant)
CREATE OR REPLACE FUNCTION public.has_payment_access(_user_id uuid)
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
      AND role IN ('owner', 'accountant')
  )
$$;

-- 3. Create helper function to check if user has admin-level access (owner, admin, accountant, support)
CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id uuid)
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
      AND role IN ('owner', 'admin', 'accountant', 'support')
  )
$$;

-- 4. Create helper function to check if user has subscription management access (owner, admin, accountant)
CREATE OR REPLACE FUNCTION public.has_subscription_access(_user_id uuid)
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
      AND role IN ('owner', 'admin', 'accountant')
  )
$$;

-- 5. Update payments table RLS policies for owner/accountant only access
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;

CREATE POLICY "Payment access can view all payments"
ON public.payments
FOR SELECT
USING (public.has_payment_access(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Payment access can update payments"
ON public.payments
FOR UPDATE
USING (public.has_payment_access(auth.uid()));

CREATE POLICY "Payment access can insert payments"
ON public.payments
FOR INSERT
WITH CHECK (public.has_payment_access(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Payment access can delete payments"
ON public.payments
FOR DELETE
USING (public.has_payment_access(auth.uid()));

-- 6. Update optometrist_profiles policies to allow subscription management access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.optometrist_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.optometrist_profiles;

CREATE POLICY "Admin access can view all profiles"
ON public.optometrist_profiles
FOR SELECT
USING (public.has_admin_access(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Admin access can update all profiles"
ON public.optometrist_profiles
FOR UPDATE
USING (public.has_admin_access(auth.uid()) OR user_id = auth.uid());