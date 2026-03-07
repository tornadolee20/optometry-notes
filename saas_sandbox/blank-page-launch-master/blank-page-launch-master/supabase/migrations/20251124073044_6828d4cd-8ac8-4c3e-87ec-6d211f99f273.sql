-- 清除 auth.users 中的不完整記錄
-- 這樣才能讓用戶重新註冊

DELETE FROM auth.users 
WHERE email = 'tornadolee20@yahoo.com.tw';