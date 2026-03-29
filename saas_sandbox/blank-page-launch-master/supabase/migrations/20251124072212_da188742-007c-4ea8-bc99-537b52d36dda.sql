
-- 刪除不完整的帳號記錄
-- 這樣可以讓您重新註冊

-- 1. 刪除 user_roles 記錄
DELETE FROM public.user_roles 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'tornadolee20@yahoo.com.tw');

-- 2. 刪除 users 記錄  
DELETE FROM public.users 
WHERE email = 'tornadolee20@yahoo.com.tw';

-- 3. 確認刪除結果
SELECT '✅ 已清除不完整的帳號記錄，現在可以重新註冊了！' as status;
