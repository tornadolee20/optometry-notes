-- 給 store owner 用的：允許店家擁有者為自己的店建立轉移請求
-- 【未來重構注意】改成 store_owners 多對多時，改查 store_owners.user_id + is_primary
CREATE POLICY "Store owners can create transfer requests"
ON public.store_transfer_requests
FOR INSERT TO authenticated
WITH CHECK (
  store_id IN (
    SELECT id FROM public.stores WHERE user_id = auth.uid()
  )
);