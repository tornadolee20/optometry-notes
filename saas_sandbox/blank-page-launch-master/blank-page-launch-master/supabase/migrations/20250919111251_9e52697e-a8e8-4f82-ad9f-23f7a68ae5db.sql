-- 修復stores表刪除權限，允許超級管理員刪除店家
CREATE POLICY "Super admins can delete stores" 
ON public.stores 
FOR DELETE 
TO authenticated
USING (is_super_admin());