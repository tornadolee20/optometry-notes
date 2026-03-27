-- 確保 store_subscriptions 表啟用實時更新
ALTER TABLE public.store_subscriptions REPLICA IDENTITY FULL;

-- 將 store_subscriptions 表添加到實時發布
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_subscriptions;