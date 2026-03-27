-- 在 exam_records 資料表新增病理史欄位
ALTER TABLE exam_records 
ADD COLUMN IF NOT EXISTS medical_history_simple JSONB DEFAULT '{
  "conditions": [],
  "cataract_surgery": null,
  "diabetes_control": null,
  "notes": "",
  "none_checked": false
}'::JSONB;

-- 建立GIN索引加速查詢
CREATE INDEX IF NOT EXISTS idx_exam_records_medical_history 
ON exam_records USING GIN (medical_history_simple);