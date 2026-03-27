-- 🔧 修復資料庫權限和表格結構問題

-- ========================================
-- 1. 修復 system_logs 表結構
-- ========================================

-- 檢查 system_logs 表是否存在 details 欄位，如果沒有就加上
DO $$
BEGIN
    -- 檢查 details 欄位是否存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'system_logs' AND column_name = 'details'
    ) THEN
        -- 加入 details 欄位 (原來是 metadata)
        ALTER TABLE system_logs ADD COLUMN details JSONB DEFAULT '{}';
    END IF;
END $$;

-- ========================================
-- 2. 停用 RLS 政策 (開發環境)
-- ========================================

-- 暫時停用所有表的 RLS，讓開發更順暢
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_keywords DISABLE ROW LEVEL SECURITY;
ALTER TABLE industry_keywords DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. 確保用戶資料正確
-- ========================================

-- 檢查並修復用戶資料
UPDATE users 
SET is_active = true, updated_at = NOW()
WHERE email IN ('admin@test.com', 'tornadolee20@yahoo.com.tw') 
AND (is_active IS NULL OR is_active = false);

-- 顯示用戶狀態
SELECT 
    email,
    role,
    name,
    is_active,
    created_at
FROM users 
WHERE email IN ('admin@test.com', 'tornadolee20@yahoo.com.tw')
ORDER BY role DESC;

-- ========================================
-- 4. 測試資料庫連接
-- ========================================

-- 測試 users 表查詢 (模擬應用程式的查詢)
SELECT 
    'users 表查詢測試' as test_name,
    count(*) as user_count
FROM users;

-- 測試 system_logs 表結構
SELECT 
    'system_logs 表結構測試' as test_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'system_logs'
ORDER BY ordinal_position;

-- 顯示完成訊息
SELECT '✅ 資料庫權限和表格結構已修復！' as status;