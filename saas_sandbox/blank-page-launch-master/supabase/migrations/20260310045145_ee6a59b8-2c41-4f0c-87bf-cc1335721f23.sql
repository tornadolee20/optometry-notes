
-- Add parent_id column to industry_templates
ALTER TABLE public.industry_templates 
ADD COLUMN IF NOT EXISTS parent_id text DEFAULT NULL;

-- Create parent categories (no keywords, parent_id = null)
INSERT INTO public.industry_templates (template_id, label, emoji, keywords, sort_order, is_active, parent_id)
VALUES
  ('cat_healthcare', '醫療保健', '🏥', '[]'::jsonb, 0, true, NULL),
  ('cat_beauty', '美容美體', '💅', '[]'::jsonb, 1, true, NULL),
  ('cat_automotive', '汽車服務', '🚗', '[]'::jsonb, 2, true, NULL),
  ('cat_pet', '寵物服務', '🐶', '[]'::jsonb, 3, true, NULL),
  ('cat_religion', '宗教文化', '🙏', '[]'::jsonb, 4, true, NULL),
  ('cat_organization', '社團組織', '🏢', '[]'::jsonb, 5, true, NULL)
ON CONFLICT (template_id) DO NOTHING;

-- Set existing templates as children of their parent categories
UPDATE public.industry_templates SET parent_id = 'cat_healthcare', sort_order = 0 WHERE template_id = 'optical';
UPDATE public.industry_templates SET parent_id = 'cat_healthcare', sort_order = 1 WHERE template_id = 'dental';
UPDATE public.industry_templates SET parent_id = 'cat_beauty', sort_order = 0 WHERE template_id = 'hair_salon';
UPDATE public.industry_templates SET parent_id = 'cat_automotive', sort_order = 0 WHERE template_id = 'auto_service';
UPDATE public.industry_templates SET parent_id = 'cat_pet', sort_order = 0 WHERE template_id = 'pet_hospital';
UPDATE public.industry_templates SET parent_id = 'cat_religion', sort_order = 0 WHERE template_id = 'temple';
UPDATE public.industry_templates SET parent_id = 'cat_organization', sort_order = 0 WHERE template_id = 'association';
