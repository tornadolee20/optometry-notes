
-- 移除 admins 表的 RLS，因為管理員表不需要 RLS 保護
-- 管理員驗證透過應用程式邏輯來處理即可
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- 移除任何可能存在的 RLS 政策
DROP POLICY IF EXISTS "Enable read access for all users" ON public.admins;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.admins;
DROP POLICY IF EXISTS "Enable update for all users" ON public.admins;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.admins;
