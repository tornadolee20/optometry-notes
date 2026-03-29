
-- First, let's see what RLS policies exist (if any) and clean them up
DROP POLICY IF EXISTS "Allow admin access to store_subscriptions" ON public.store_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.store_subscriptions;
DROP POLICY IF EXISTS "Store owners can view their subscriptions" ON public.store_subscriptions;

-- Create comprehensive RLS policies for store_subscriptions

-- Allow admins to SELECT all store subscriptions
CREATE POLICY "Admins can view all store_subscriptions"
ON public.store_subscriptions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = (SELECT auth.email())
    )
);

-- Allow admins to INSERT new store subscriptions
CREATE POLICY "Admins can insert store_subscriptions"
ON public.store_subscriptions FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = (SELECT auth.email())
    )
);

-- Allow admins to UPDATE store subscriptions
CREATE POLICY "Admins can update store_subscriptions"
ON public.store_subscriptions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = (SELECT auth.email())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = (SELECT auth.email())
    )
);

-- Allow admins to DELETE store subscriptions
CREATE POLICY "Admins can delete store_subscriptions"
ON public.store_subscriptions FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = (SELECT auth.email())
    )
);

-- Allow store owners to view their own subscriptions
CREATE POLICY "Store owners can view their own subscriptions"
ON public.store_subscriptions FOR SELECT
TO authenticated
USING (
    store_id IN (
        SELECT id FROM public.stores 
        WHERE user_id = (SELECT auth.uid())
    )
);
