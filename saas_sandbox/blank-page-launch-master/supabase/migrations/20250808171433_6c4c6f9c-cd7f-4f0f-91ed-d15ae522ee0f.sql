-- Allow users to insert their own records during registration
CREATE POLICY "Users can insert their own profile during registration" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own records  
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);