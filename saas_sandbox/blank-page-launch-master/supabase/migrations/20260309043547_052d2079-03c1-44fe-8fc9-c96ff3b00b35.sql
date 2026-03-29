-- Industry Templates table for database-driven template management
CREATE TABLE public.industry_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id text NOT NULL UNIQUE,
  label text NOT NULL,
  emoji text NOT NULL DEFAULT '📦',
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.industry_templates ENABLE ROW LEVEL SECURITY;

-- Public read access for all (for onboarding)
CREATE POLICY "Anyone can read active templates"
ON public.industry_templates
FOR SELECT
USING (is_active = true);

-- Super admins can manage all templates
CREATE POLICY "Super admins can manage templates"
ON public.industry_templates
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Create index for performance
CREATE INDEX idx_industry_templates_active ON public.industry_templates(is_active, sort_order);

-- Add updated_at trigger
CREATE TRIGGER update_industry_templates_updated_at
  BEFORE UPDATE ON public.industry_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();