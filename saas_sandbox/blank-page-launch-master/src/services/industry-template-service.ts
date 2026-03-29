import { supabase } from "@/integrations/supabase/client";
import { INDUSTRY_TEMPLATES, type IndustryTemplate, type TemplateKeyword } from "@/config/industryTemplates";
import type { Json } from "@/integrations/supabase/types";

// DB template shape
export interface DbIndustryTemplate {
  id: string;
  template_id: string;
  label: string;
  emoji: string;
  keywords: TemplateKeyword[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Helper to convert JSON to TemplateKeyword[]
const parseKeywords = (keywords: Json): TemplateKeyword[] => {
  if (!Array.isArray(keywords)) return [];
  return keywords as unknown as TemplateKeyword[];
};

// Helper to convert TemplateKeyword[] to Json
const keywordsToJson = (keywords: TemplateKeyword[]): Json => {
  return keywords as unknown as Json;
};

// Fetch all active templates from DB, fallback to hardcoded
export const fetchIndustryTemplates = async (): Promise<IndustryTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('industry_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('[TemplateService] DB fetch error, using fallback:', error);
      return INDUSTRY_TEMPLATES;
    }

    if (!data || data.length === 0) {
      
      return INDUSTRY_TEMPLATES;
    }

    // Convert DB format to IndustryTemplate format
    return data.map(t => ({
      id: t.template_id,
      label: t.label,
      emoji: t.emoji,
      keywords: parseKeywords(t.keywords),
    }));
  } catch (err) {
    console.error('[TemplateService] Exception, using fallback:', err);
    return INDUSTRY_TEMPLATES;
  }
};

// Fetch single template by ID
export const fetchTemplateById = async (templateId: string): Promise<IndustryTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('industry_templates')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Fallback to hardcoded
      return INDUSTRY_TEMPLATES.find(t => t.id === templateId) || null;
    }

    return {
      id: data.template_id,
      label: data.label,
      emoji: data.emoji,
      keywords: parseKeywords(data.keywords),
    };
  } catch {
    return INDUSTRY_TEMPLATES.find(t => t.id === templateId) || null;
  }
};

// Admin: Save template to DB
export const saveIndustryTemplate = async (
  template: Omit<IndustryTemplate, 'id'> & { id?: string; templateId: string }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: existing } = await supabase
      .from('industry_templates')
      .select('id')
      .eq('template_id', template.templateId)
      .single();

    if (existing) {
      // Update
      const { error } = await supabase
        .from('industry_templates')
        .update({
          label: template.label,
          emoji: template.emoji,
          keywords: keywordsToJson(template.keywords),
          updated_at: new Date().toISOString(),
        })
        .eq('template_id', template.templateId);

      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase
        .from('industry_templates')
        .insert({
          template_id: template.templateId,
          label: template.label,
          emoji: template.emoji,
          keywords: keywordsToJson(template.keywords),
          sort_order: 0,
        });

      if (error) throw error;
    }

    return { success: true };
  } catch (err: unknown) {
    console.error('[TemplateService] Save error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

// Admin: Delete template
export const deleteIndustryTemplate = async (templateId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('industry_templates')
      .delete()
      .eq('template_id', templateId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

// Admin: Seed DB with hardcoded templates
export const seedTemplatesFromHardcoded = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    for (let i = 0; i < INDUSTRY_TEMPLATES.length; i++) {
      const t = INDUSTRY_TEMPLATES[i];
      const { error } = await supabase
        .from('industry_templates')
        .upsert({
          template_id: t.id,
          label: t.label,
          emoji: t.emoji,
          keywords: keywordsToJson(t.keywords),
          sort_order: i,
          is_active: true,
        }, { onConflict: 'template_id' });
      
      if (error) throw error;
    }

    return { success: true, count: INDUSTRY_TEMPLATES.length };
  } catch (err: unknown) {
    return { success: false, count: 0, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

// Admin: Fetch all templates (including inactive) for management
export const fetchAllTemplatesForAdmin = async (): Promise<DbIndustryTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('industry_templates')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    
    return (data || []).map(t => ({
      ...t,
      keywords: parseKeywords(t.keywords),
    }));
  } catch (err) {
    console.error('[TemplateService] Admin fetch error:', err);
    return [];
  }
};

// Admin: Toggle template active state
export const toggleTemplateActive = async (templateId: string, isActive: boolean): Promise<{ success: boolean }> => {
  try {
    const { error } = await supabase
      .from('industry_templates')
      .update({ is_active: isActive })
      .eq('template_id', templateId);

    if (error) throw error;
    return { success: true };
  } catch {
    return { success: false };
  }
};
