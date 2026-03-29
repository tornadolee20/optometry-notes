-- Create system_settings table for persistent configuration
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can manage system settings
CREATE POLICY "Only admins can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Only admins can insert system settings" 
ON public.system_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Only admins can update system settings" 
ON public.system_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'super_admin')
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system settings with updated values
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES
-- General settings
('general_config', '{
  "site_name": "Review Quickly",
  "site_description": "智能評論生成系統 - 支援多行業個性化評論",
  "contact_email": "admin@reviewquickly.com",
  "timezone": "Asia/Taipei",
  "language": "zh-TW",
  "maintenance_mode": false
}', 'general', '一般系統設定'),

-- Feature settings with industry support
('features_config', '{
  "allow_registration": true,
  "auto_approve_stores": false,
  "keyword_limit_basic": 25,
  "keyword_limit_premium": 100,
  "keyword_limit_enterprise": 500,
  "enable_industry_awareness": true,
  "supported_industries": [
    "optical", "education", "restaurant", "retail", "beauty", "clinic", "hotel", "fitness"
  ],
  "review_generation_limit_daily": {
    "trial": 50,
    "basic": 200,
    "premium": 1000,
    "enterprise": -1
  }
}', 'features', '功能設定與行業支援'),

-- Security settings
('security_config', '{
  "password_min_length": 8,
  "session_timeout": 24,
  "max_login_attempts": 5,
  "require_2fa": false,
  "ip_whitelist": []
}', 'security', '安全設定'),

-- Notification settings
('notifications_config', '{
  "email_notifications": true,
  "new_store_alert": true,
  "subscription_alert": true,
  "error_alert": true,
  "daily_report": false,
  "industry_performance_reports": true
}', 'notifications', '通知設定'),

-- Email settings
('email_config', '{
  "smtp_host": "",
  "smtp_port": 587,
  "smtp_username": "",
  "smtp_password": "",
  "from_email": "",
  "from_name": "Review Quickly"
}', 'email', '郵件設定'),

-- Industry-specific configurations
('industry_config', '{
  "optical": {
    "name": "眼鏡行業",
    "default_keywords": ["視力檢查", "鏡框選擇", "專業服務", "價格合理"],
    "review_templates": ["專業度", "服務態度", "產品品質", "環境舒適度"],
    "compliance_requirements": ["醫療器材相關法規"]
  },
  "education": {
    "name": "教育培訓",
    "default_keywords": ["教學品質", "師資專業", "學習環境", "課程內容"],
    "review_templates": ["教學效果", "師生互動", "課程安排", "學習氛圍"],
    "compliance_requirements": ["教育法規", "個資保護"]
  },
  "restaurant": {
    "name": "餐飲業",
    "default_keywords": ["食物美味", "服務親切", "環境舒適", "價格合理"],
    "review_templates": ["食物品質", "服務速度", "用餐環境", "性價比"],
    "compliance_requirements": ["食品安全法規"]
  },
  "retail": {
    "name": "零售業",
    "default_keywords": ["商品齊全", "價格優惠", "服務態度", "購物環境"],
    "review_templates": ["商品品質", "價格競爭力", "服務專業度", "購物體驗"],
    "compliance_requirements": ["消費者保護法"]
  }
}', 'industry', '行業特定設定');

-- Create indexes for better performance
CREATE INDEX idx_system_settings_type ON public.system_settings(setting_type);
CREATE INDEX idx_system_settings_key ON public.system_settings(setting_key);