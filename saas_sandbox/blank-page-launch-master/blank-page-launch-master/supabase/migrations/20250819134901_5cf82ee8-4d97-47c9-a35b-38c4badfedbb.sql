-- 允許匿名用戶查詢店家基本資訊（用於評論生成）
CREATE POLICY "Anyone can view stores for review generation" 
ON public.stores 
FOR SELECT 
USING (true);

-- 允許匿名用戶查詢店家關鍵字（用於評論生成）
CREATE POLICY "Anyone can view store keywords for review generation" 
ON public.store_keywords 
FOR SELECT 
USING (true);