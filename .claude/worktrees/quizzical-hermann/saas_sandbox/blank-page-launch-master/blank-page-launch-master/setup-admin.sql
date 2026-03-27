-- 設置管理員帳號的 SQL 腳本
-- 請在 Supabase Dashboard 的 SQL Editor 中執行

-- 1. 首先確保 users 表存在並有正確的結構
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

-- 2. 創建測試管理員帳號
-- 注意：這些是測試帳號，請在生產環境中更改密碼

-- Super Admin 帳號
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@test.com',
    crypt('Admin123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- 在 users 表中創建對應的用戶記錄
INSERT INTO users (
    id,
    email,
    role,
    name
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@test.com'),
    'admin@test.com',
    'super_admin',
    'Test Super Admin'
) ON CONFLICT (email) DO UPDATE SET 
    role = 'super_admin',
    name = 'Test Super Admin';

-- Admin 帳號
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'manager@test.com',
    crypt('Manager123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (
    id,
    email,
    role,
    name
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'manager@test.com'),
    'manager@test.com',
    'admin',
    'Test Admin'
) ON CONFLICT (email) DO UPDATE SET 
    role = 'admin',
    name = 'Test Admin';

-- Manager 帳號
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'user@test.com',
    crypt('User123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (
    id,
    email,
    role,
    name
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'user@test.com'),
    'user@test.com',
    'manager',
    'Test Manager'
) ON CONFLICT (email) DO UPDATE SET 
    role = 'manager',
    name = 'Test Manager';

-- 3. 確認創建的帳號
SELECT 
    u.email,
    u.role,
    u.name,
    au.email_confirmed_at
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.email IN ('admin@test.com', 'manager@test.com', 'user@test.com');

-- 顯示創建結果
SELECT 'Test accounts created successfully!' as status;