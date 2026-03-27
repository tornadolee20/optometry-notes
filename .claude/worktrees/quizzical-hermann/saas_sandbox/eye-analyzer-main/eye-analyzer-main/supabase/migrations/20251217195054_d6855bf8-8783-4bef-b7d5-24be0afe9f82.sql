-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.optometrist_profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));