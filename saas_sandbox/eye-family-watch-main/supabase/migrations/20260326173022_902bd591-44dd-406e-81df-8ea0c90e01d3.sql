-- Fix overly permissive INSERT/UPDATE policies
-- Service role bypasses RLS, so regular users should not insert/update directly
DROP POLICY "Allow service insert binocular_exams" ON public.binocular_exams;
DROP POLICY "Allow service update binocular_exams" ON public.binocular_exams;

-- Only authenticated users can insert their own children's records (future use)
CREATE POLICY "Restrict insert binocular_exams" ON public.binocular_exams
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Restrict update binocular_exams" ON public.binocular_exams
  FOR UPDATE USING (false);