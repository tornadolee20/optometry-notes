-- 1. stores: 移除可能存在的公開存取政策
DROP POLICY IF EXISTS "Public stores access" ON public.stores;

-- 1a. 新增：匿名用戶只能讀取 status = 'active' 的店家
CREATE POLICY "Anon can read active stores"
ON public.stores
FOR SELECT TO anon
USING (status = 'active');

-- 2. admins: 移除可能存在的公開驗證政策
DROP POLICY IF EXISTS "Public admin authentication" ON public.admins;

-- 2a. 新增：只有已登入用戶可讀取（搭配既有 super_admin ALL policy）
CREATE POLICY "Authenticated users can read admins"
ON public.admins
FOR SELECT TO authenticated
USING (true);