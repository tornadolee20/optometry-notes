
-- 1. Create pairing_codes table
CREATE TABLE public.pairing_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text NOT NULL,
  code text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pairing_codes ENABLE ROW LEVEL SECURITY;

-- Allow public read (app needs to check existing codes)
CREATE POLICY "Allow read pairing_codes" ON public.pairing_codes
  FOR SELECT TO public USING (true);

-- Allow public insert (parent generates code from client)
CREATE POLICY "Allow insert pairing_codes" ON public.pairing_codes
  FOR INSERT TO public WITH CHECK (true);

-- 2. Rename child_id to member_id in binocular_exams
ALTER TABLE public.binocular_exams RENAME COLUMN child_id TO member_id;
