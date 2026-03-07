-- Add tracking fields to exam_records table
ALTER TABLE public.exam_records 
ADD COLUMN IF NOT EXISTS treatment_plan text,
ADD COLUMN IF NOT EXISTS follow_up_date date,
ADD COLUMN IF NOT EXISTS notes text;

-- Add comments for clarity
COMMENT ON COLUMN public.exam_records.treatment_plan IS 'Treatment scenario: A/B/C or training/prism/observation';
COMMENT ON COLUMN public.exam_records.follow_up_date IS 'Recommended follow-up date';
COMMENT ON COLUMN public.exam_records.notes IS 'Additional notes for this exam record';