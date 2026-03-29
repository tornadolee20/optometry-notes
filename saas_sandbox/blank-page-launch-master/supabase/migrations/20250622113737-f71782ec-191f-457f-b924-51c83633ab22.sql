
-- 首先確保 admins 表中有您的管理員 email
INSERT INTO public.admins (email)
VALUES ('tornadolee20@yahoo.com.tw')
ON CONFLICT (email) DO NOTHING;

-- 如果您需要添加更多管理員，可以繼續添加
-- INSERT INTO public.admins (email)
-- VALUES ('another-admin@example.com')
-- ON CONFLICT (email) DO NOTHING;
