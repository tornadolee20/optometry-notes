
-- 允許匿名使用者讀取「已啟用且訂閱有效」的店家資料（公開評論頁需求）
-- 先移除同名舊政策（若已存在）
DROP POLICY IF EXISTS stores_select_public_active_subscription ON public.stores;

-- 新增匿名讀取政策：
-- 條件：訪客未登入 AND 店家狀態為 active AND 訂閱有效
CREATE POLICY stores_select_public_active_subscription
ON public.stores
FOR SELECT
USING (
  auth.uid() IS NULL
  AND status = 'active'::store_status
  AND is_subscription_active(id)
);
