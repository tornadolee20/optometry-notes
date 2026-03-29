-- 清除路易莎咖啡連鎖模板的錯誤關鍵字（這些是從火鍋模板錯誤複製來的）
UPDATE industry_templates 
SET keywords = '[]'::jsonb, updated_at = now()
WHERE template_id = 'custom_208459_mmvr9wd9';