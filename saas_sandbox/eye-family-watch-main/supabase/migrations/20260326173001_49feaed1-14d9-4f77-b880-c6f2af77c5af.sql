-- Create binocular_exams table
CREATE TABLE public.binocular_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id TEXT NOT NULL,
  exam_date DATE NOT NULL,
  clinic_name TEXT NOT NULL,
  overall_level INT CHECK (overall_level >= 0 AND overall_level <= 5),
  overall_color TEXT CHECK (overall_color IN ('green', 'yellow', 'red')),
  convergence TEXT,
  accommodation TEXT,
  stereopsis TEXT,
  short_conclusion TEXT,
  report_url TEXT,
  source_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.binocular_exams ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow read binocular_exams" ON public.binocular_exams
  FOR SELECT USING (true);

-- Allow insert via service role
CREATE POLICY "Allow service insert binocular_exams" ON public.binocular_exams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service update binocular_exams" ON public.binocular_exams
  FOR UPDATE USING (true);

-- Index for quick lookup by child
CREATE INDEX idx_binocular_exams_child_id ON public.binocular_exams (child_id);

-- Unique constraint on source_id for upsert
CREATE UNIQUE INDEX idx_binocular_exams_source_id ON public.binocular_exams (source_id) WHERE source_id IS NOT NULL;