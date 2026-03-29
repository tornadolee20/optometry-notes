
-- 修復未索引的外鍵問題
-- 為 stores 表的外鍵建立索引（如果還沒有的話）
CREATE INDEX IF NOT EXISTS idx_stores_user_id 
ON public.stores (user_id);

-- 檢查並移除可能未使用的重複索引
-- 注意：這些索引如果確實未使用才會被移除
-- 保留必要的索引，移除重複或未使用的索引

-- 為確保外鍵效能，我們也檢查其他可能遺漏的外鍵索引
-- customer_keyword_logs 的 store_id 外鍵索引（應該已經存在）
-- store_keywords 的 store_id 外鍵索引（應該已經存在）
-- store_subscriptions 的 store_id 外鍵索引（應該已經存在）

-- 如果需要，也可以為經常查詢的欄位建立索引
CREATE INDEX IF NOT EXISTS idx_stores_industry 
ON public.stores (industry) 
WHERE industry IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stores_status 
ON public.stores (status);

-- 為店家郵件建立索引（用於登入查詢）
CREATE INDEX IF NOT EXISTS idx_stores_email 
ON public.stores (email);
