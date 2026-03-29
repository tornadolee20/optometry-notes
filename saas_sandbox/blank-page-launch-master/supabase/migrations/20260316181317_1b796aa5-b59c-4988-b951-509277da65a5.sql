
-- Fix: prevent users from self-assigning privileged roles during registration
DROP POLICY IF EXISTS "Users can insert their own profile during registration" ON public.users;

CREATE POLICY "Users can insert their own profile during registration"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'user');
