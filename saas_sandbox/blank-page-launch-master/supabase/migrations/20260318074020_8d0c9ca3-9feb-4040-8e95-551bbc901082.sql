ALTER TABLE public.industry_templates 
  ADD COLUMN IF NOT EXISTS is_brand_template boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS brand_name text,
  ADD COLUMN IF NOT EXISTS brand_style_hint text;