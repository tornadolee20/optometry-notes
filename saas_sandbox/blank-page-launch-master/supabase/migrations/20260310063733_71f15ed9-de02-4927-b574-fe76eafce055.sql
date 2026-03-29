UPDATE industry_templates 
SET keywords = jsonb_set(keywords, '{3,keyword}', '"護理師親切"'::jsonb)
WHERE template_id = 'dental'