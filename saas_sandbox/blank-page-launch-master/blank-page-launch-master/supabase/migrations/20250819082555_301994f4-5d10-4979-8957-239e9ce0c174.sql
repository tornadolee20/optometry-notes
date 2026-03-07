-- 創建真實數據分析表
-- 1. 每日業務統計表
CREATE TABLE public.daily_business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  new_stores_count INTEGER DEFAULT 0,
  new_subscriptions_count INTEGER DEFAULT 0,
  total_active_stores INTEGER DEFAULT 0,
  total_keyword_selections INTEGER DEFAULT 0,
  total_review_generations INTEGER DEFAULT 0,
  average_keywords_per_session DECIMAL(10,2) DEFAULT 0,
  average_reviews_per_customer DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. 客戶行為分析表  
CREATE TABLE public.customer_behavior_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  store_id UUID REFERENCES public.stores(id),
  session_id TEXT,
  keywords_selected INTEGER DEFAULT 0,
  reviews_generated INTEGER DEFAULT 0,
  time_spent_minutes DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. 新客戶獲取漏斗表
CREATE TABLE public.customer_acquisition_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  visitors INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  trial_starts INTEGER DEFAULT 0,
  paid_conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. 店家行業分析表
CREATE TABLE public.industry_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  total_stores INTEGER DEFAULT 0,
  active_stores INTEGER DEFAULT 0,
  avg_subscription_duration DECIMAL(10,2) DEFAULT 0,
  avg_keyword_usage DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 啟用 RLS
ALTER TABLE public.daily_business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_behavior_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_acquisition_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_analytics ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 策略 (只有超級管理員可以訪問)
CREATE POLICY "Super admins can manage daily_business_metrics" ON public.daily_business_metrics
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can manage customer_behavior_metrics" ON public.customer_behavior_metrics
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can manage customer_acquisition_funnel" ON public.customer_acquisition_funnel
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can manage industry_analytics" ON public.industry_analytics
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- 創建索引優化查詢性能
CREATE INDEX idx_daily_business_metrics_date ON public.daily_business_metrics(date);
CREATE INDEX idx_customer_behavior_metrics_date ON public.customer_behavior_metrics(date);
CREATE INDEX idx_customer_behavior_metrics_store_id ON public.customer_behavior_metrics(store_id);
CREATE INDEX idx_customer_acquisition_funnel_date_period ON public.customer_acquisition_funnel(date, period_type);

-- 創建更新時間觸發器
CREATE TRIGGER update_daily_business_metrics_updated_at
  BEFORE UPDATE ON public.daily_business_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 創建數據聚合函數
CREATE OR REPLACE FUNCTION public.calculate_daily_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.daily_business_metrics (
    date,
    new_stores_count,
    new_subscriptions_count,
    total_active_stores,
    total_keyword_selections,
    total_review_generations
  ) VALUES (
    target_date,
    (SELECT COUNT(*) FROM public.stores WHERE DATE(created_at) = target_date),
    (SELECT COUNT(*) FROM public.store_subscriptions WHERE DATE(created_at) = target_date),
    (SELECT COUNT(*) FROM public.stores WHERE status = 'active'),
    (SELECT COUNT(*) FROM public.customer_keyword_logs WHERE DATE(created_at) = target_date),
    (SELECT COUNT(*) FROM public.customer_keyword_logs WHERE DATE(created_at) = target_date AND selected_keywords IS NOT NULL)
  )
  ON CONFLICT (date) DO UPDATE SET
    new_stores_count = EXCLUDED.new_stores_count,
    new_subscriptions_count = EXCLUDED.new_subscriptions_count,
    total_active_stores = EXCLUDED.total_active_stores,
    total_keyword_selections = EXCLUDED.total_keyword_selections,
    total_review_generations = EXCLUDED.total_review_generations,
    updated_at = now();
END;
$$;