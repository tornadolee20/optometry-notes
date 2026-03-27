
-- 修正資料庫函數的搜尋路徑安全性
-- 為現有的函數設定安全的搜尋路徑
ALTER FUNCTION public.increment_keyword_usage(uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_keyword_frequencies() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;

-- 啟用密碼洩漏保護 (需要超級用戶權限，但我們可以設定相關配置)
-- 注意：某些設定可能需要在 Supabase 管理面板中手動啟用
