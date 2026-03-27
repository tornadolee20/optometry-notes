
-- 先刪除重複的關鍵字，只保留最新的一筆
WITH ranked_keywords AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY store_id, keyword 
           ORDER BY created_at DESC
         ) as rn
  FROM public.store_keywords
)
DELETE FROM public.store_keywords 
WHERE id IN (
  SELECT id FROM ranked_keywords WHERE rn > 1
);

-- 檢查並添加主鍵約束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'store_keywords_pkey' 
        AND contype = 'p'
    ) THEN
        ALTER TABLE public.store_keywords 
        ADD CONSTRAINT store_keywords_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- 現在建立唯一索引（防止重複關鍵字）
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_keywords_unique 
ON public.store_keywords (store_id, keyword);
