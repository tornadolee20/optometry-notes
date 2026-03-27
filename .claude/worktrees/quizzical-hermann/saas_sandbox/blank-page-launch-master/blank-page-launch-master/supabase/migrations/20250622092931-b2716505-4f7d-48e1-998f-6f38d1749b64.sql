
-- 為 customer_keyword_logs 表的 store_id 外鍵建立索引
CREATE INDEX IF NOT EXISTS idx_customer_keyword_logs_store_id 
ON public.customer_keyword_logs (store_id);

-- 為 store_keywords 表的 store_id 外鍵建立索引
CREATE INDEX IF NOT EXISTS idx_store_keywords_store_id 
ON public.store_keywords (store_id);

-- 為 store_subscriptions 表的 store_id 外鍵建立索引
CREATE INDEX IF NOT EXISTS idx_store_subscriptions_store_id 
ON public.store_subscriptions (store_id);

-- 額外優化：為常用查詢建立複合索引
-- 為 store_keywords 建立複合索引（store_id + priority）用於排序查詢
CREATE INDEX IF NOT EXISTS idx_store_keywords_store_priority 
ON public.store_keywords (store_id, priority);

-- 為 customer_keyword_logs 建立複合索引（store_id + created_at）用於時間範圍查詢
CREATE INDEX IF NOT EXISTS idx_customer_keyword_logs_store_created 
ON public.customer_keyword_logs (store_id, created_at);
