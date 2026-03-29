-- Fix the invalid keyword in dental template (8 chars -> 7 chars)
UPDATE industry_templates 
SET keywords = (
  SELECT jsonb_agg(
    CASE 
      WHEN elem->>'keyword' = '不推銷不必要項目' 
      THEN jsonb_set(elem, '{keyword}', '"不強迫推銷"')
      ELSE elem 
    END
  )
  FROM jsonb_array_elements(keywords) elem
)
WHERE template_id = 'dental';