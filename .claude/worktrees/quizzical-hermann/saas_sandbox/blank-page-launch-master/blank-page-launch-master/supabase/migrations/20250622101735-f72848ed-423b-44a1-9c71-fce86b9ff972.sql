
-- 完全清理所有現有的 RLS 政策
-- 清理 admins 表的所有政策
DROP POLICY IF EXISTS "Admins can manage all data" ON public.admins;
DROP POLICY IF EXISTS "Allow admin authentication checks" ON public.admins;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.admins;
DROP POLICY IF EXISTS "允許匿名用戶進行管理員驗證" ON public.admins;
DROP POLICY IF EXISTS "管理員可以檢視所有管理員" ON public.admins;
DROP POLICY IF EXISTS "管理員可以編輯管理員" ON public.admins;
DROP POLICY IF EXISTS "允許已認證用戶驗證管理員身份" ON public.admins;
DROP POLICY IF EXISTS "啟用管理員表的認證查詢權限" ON public.admins;
DROP POLICY IF EXISTS "Enable read access for authenticated admins" ON public.admins;
DROP POLICY IF EXISTS "允許管理員存取所有資料" ON public.admins;
DROP POLICY IF EXISTS "Optimized admin access" ON public.admins;
DROP POLICY IF EXISTS "Public admin authentication" ON public.admins;

-- 清理 customer_keyword_logs 表的所有政策
DROP POLICY IF EXISTS "Allow anonymous keyword logging" ON public.customer_keyword_logs;
DROP POLICY IF EXISTS "Allow insert access to customer_keyword_logs" ON public.customer_keyword_logs;
DROP POLICY IF EXISTS "允許匿名新增關鍵字使用記錄" ON public.customer_keyword_logs;
DROP POLICY IF EXISTS "Anonymous keyword logging" ON public.customer_keyword_logs;

-- 清理 store_keywords 表的所有政策
DROP POLICY IF EXISTS "Allow public access to store keywords" ON public.store_keywords;
DROP POLICY IF EXISTS "Allow read access to store_keywords" ON public.store_keywords;
DROP POLICY IF EXISTS "允許匿名讀取店家關鍵字" ON public.store_keywords;
DROP POLICY IF EXISTS "Public store keywords access" ON public.store_keywords;

-- 清理 stores 表的所有政策
DROP POLICY IF EXISTS "Allow public store access" ON public.stores;
DROP POLICY IF EXISTS "Users can manage their stores" ON public.stores;
DROP POLICY IF EXISTS "Anyone can create a store" ON public.stores;
DROP POLICY IF EXISTS "Users can view their own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can update their own stores" ON public.stores;
DROP POLICY IF EXISTS "允許匿名讀取店家資訊" ON public.stores;
DROP POLICY IF EXISTS "Public stores access" ON public.stores;
DROP POLICY IF EXISTS "Owner stores management" ON public.stores;

-- 重新創建優化的 RLS 政策（使用 SELECT 包裝 auth 函數以提升效能）
-- Admins 表政策（優化版本）
CREATE POLICY "Optimized admin access" 
ON public.admins FOR ALL
TO authenticated
USING ((SELECT auth.uid()) IN (SELECT id FROM public.admins WHERE email = (SELECT auth.email())));

CREATE POLICY "Public admin authentication" 
ON public.admins FOR SELECT
TO anon, authenticated
USING (true);

-- Customer keyword logs 政策
CREATE POLICY "Anonymous keyword logging" 
ON public.customer_keyword_logs FOR INSERT
TO anon
WITH CHECK (true);

-- Store keywords 政策
CREATE POLICY "Public store keywords access" 
ON public.store_keywords FOR SELECT
TO anon, authenticated
USING (true);

-- Stores 政策
CREATE POLICY "Public stores access" 
ON public.stores FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Owner stores management" 
ON public.stores FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()));
