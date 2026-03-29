
-- 啟用所有相關資料表的 Row Level Security (RLS)
ALTER TABLE public.customer_keyword_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_keywords ENABLE ROW LEVEL SECURITY;

-- 為 customer_keyword_logs 建立基本的 RLS 政策
-- 允許所有人讀取 (因為這是用於分析的匿名數據)
CREATE POLICY "Allow read access to customer_keyword_logs" 
ON public.customer_keyword_logs FOR SELECT 
USING (true);

-- 允許所有人插入 (因為客戶不需要登入就能使用評論系統)
CREATE POLICY "Allow insert access to customer_keyword_logs" 
ON public.customer_keyword_logs FOR INSERT 
WITH CHECK (true);

-- 為 store_keywords 建立 RLS 政策
-- 允許所有人讀取店家關鍵字 (因為評論系統需要公開存取)
CREATE POLICY "Allow read access to store_keywords" 
ON public.store_keywords FOR SELECT 
USING (true);

-- 只允許管理員或店家修改關鍵字 (暫時允許所有插入/更新)
CREATE POLICY "Allow insert access to store_keywords" 
ON public.store_keywords FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update access to store_keywords" 
ON public.store_keywords FOR UPDATE 
USING (true);

-- 為 store_subscriptions 建立 RLS 政策
-- 允許讀取訂閱資訊 (用於顯示店家狀態)
CREATE POLICY "Allow read access to store_subscriptions" 
ON public.store_subscriptions FOR SELECT 
USING (true);

-- 為 industry_keywords 建立 RLS 政策
-- 允許所有人讀取行業關鍵字
CREATE POLICY "Allow read access to industry_keywords" 
ON public.industry_keywords FOR SELECT 
USING (true);

-- 允許系統更新行業關鍵字統計
CREATE POLICY "Allow update access to industry_keywords" 
ON public.industry_keywords FOR UPDATE 
USING (true);

CREATE POLICY "Allow insert access to industry_keywords" 
ON public.industry_keywords FOR INSERT 
WITH CHECK (true);
