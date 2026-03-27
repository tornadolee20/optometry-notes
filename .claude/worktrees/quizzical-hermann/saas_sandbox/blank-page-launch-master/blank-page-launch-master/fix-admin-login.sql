-- 🔧 修復管理員登入問題
-- 更新用戶密碼和確認狀態

-- 1. 確認郵箱並重置密碼（針對 admin@test.com）
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    encrypted_password = crypt('Admin123!', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'admin@test.com';

-- 2. 確認個人管理員帳號（針對 tornadolee20@yahoo.com.tw）
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    encrypted_password = crypt('s122569906', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'tornadolee20@yahoo.com.tw';

-- 3. 檢查用戶狀態
SELECT 
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users 
WHERE email IN ('admin@test.com', 'tornadolee20@yahoo.com.tw');

-- 4. 檢查 users 表中的角色
SELECT 
    email,
    role,
    name,
    is_active
FROM users 
WHERE email IN ('admin@test.com', 'tornadolee20@yahoo.com.tw');

-- 顯示完成訊息
SELECT '✅ 管理員帳號已修復！現在可以嘗試登入了。' as status;