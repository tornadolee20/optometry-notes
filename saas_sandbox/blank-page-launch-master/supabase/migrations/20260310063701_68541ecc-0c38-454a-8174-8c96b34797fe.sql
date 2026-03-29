UPDATE industry_templates 
SET keywords = jsonb_set(
  keywords,
  (SELECT CONCAT('{', idx::text, ',keyword}')::text[] 
   FROM jsonb_array_elements(keywords) WITH ORDINALITY AS t(elem, idx) 
   WHERE elem->>'keyword' = '護士親切' LIMIT 1),
  '"護理師親切"'::jsonb
)
WHERE template_id = 'dental' AND keywords::text LIKE '%護士親切%'