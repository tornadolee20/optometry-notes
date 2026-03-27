
-- 首先刪除重複的 RLS 政策
-- 清理 admins 表的重複政策
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.admins;
DROP POLICY IF EXISTS "允許匿名用戶進行管理員驗證" ON public.admins;
DROP POLICY IF EXISTS "管理員可以檢視所有管理員" ON public.admins;
DROP POLICY IF EXISTS "管理員可以編輯管理員" ON public.admins;
DROP POLICY IF EXISTS "允許已認證用戶驗證管理員身份" ON public.admins;
DROP POLICY IF EXISTS "啟用管理員表的認證查詢權限" ON public.admins;

-- 清理其他表的重複政策
DROP POLICY IF EXISTS "允許匿名新增關鍵字使用記錄" ON public.customer_keyword_logs;
DROP POLICY IF EXISTS "允許匿名讀取店家關鍵字" ON public.store_keywords;
DROP POLICY IF EXISTS "允許匿名讀取店家資訊" ON public.stores;
DROP POLICY IF EXISTS "Users can update their own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can view their own stores" ON public.stores;

-- 創建優化的 RLS 政策（使用 SELECT 包裝 auth 函數以提升效能）
-- Admins 表政策
CREATE POLICY "Admins can manage all data" 
ON public.admins FOR ALL
TO authenticated
USING ((SELECT auth.uid()) IN (SELECT auth.uid() FROM public.admins WHERE email = (SELECT auth.email())));

CREATE POLICY "Allow admin authentication checks" 
ON public.admins FOR SELECT
TO anon, authenticated
USING (true);

-- Customer keyword logs 政策
CREATE POLICY "Allow anonymous keyword logging" 
ON public.customer_keyword_logs FOR INSERT
TO anon
WITH CHECK (true);

-- Store keywords 政策
CREATE POLICY "Allow public access to store keywords" 
ON public.store_keywords FOR SELECT
TO anon, authenticated
USING (true);

-- Stores 政策
CREATE POLICY "Allow public store access" 
ON public.stores FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Users can manage their stores" 
ON public.stores FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()));
