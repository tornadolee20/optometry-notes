-- 簡化的管理員帳號設置腳本
-- 只創建 users 表記錄，認證帳號通過前端註冊

-- 1. 確保 users 表存在
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin', 'super_admin')),
            name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- 2. 創建管理員用戶記錄（等待認證帳號創建後關聯）
-- 注意：你需要先在前端註冊這些帳號，然後這裡會自動關聯角色

INSERT INTO users (
    email,
    role,
    name
) VALUES 
    ('admin@test.com', 'super_admin', 'Test Super Admin'),
    ('manager@test.com', 'admin', 'Test Admin'),
    ('user@test.com', 'manager', 'Test Manager'),
    ('demo@test.com', 'user', 'Test User')
ON CONFLICT (email) DO UPDATE SET 
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    updated_at = NOW();

-- 3. 如果你想使用自己的郵箱作為超級管理員
INSERT INTO users (
    email,
    role,
    name
) VALUES 
    ('tornadolee20@yahoo.com.tw', 'super_admin', 'Personal Admin Account')
ON CONFLICT (email) DO UPDATE SET 
    role = 'super_admin',
    name = 'Personal Admin Account',
    updated_at = NOW();

-- 4. 檢查創建結果
SELECT 
    email,
    role,
    name,
    created_at
FROM users
WHERE email IN ('admin@test.com', 'manager@test.com', 'user@test.com', 'demo@test.com', 'tornadolee20@yahoo.com.tw')
ORDER BY role DESC;

-- 顯示結果
SELECT '✅ 管理員角色設置完成！請使用前端註冊功能創建對應的認證帳號。' as status;