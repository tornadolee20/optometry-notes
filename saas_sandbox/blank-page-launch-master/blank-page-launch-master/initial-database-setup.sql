-- 🗄️ Review Quickly 完整資料庫初始化腳本
-- 請在 Supabase SQL Editor 中執行此腳本

-- ========================================
-- 1. 基礎用戶表
-- ========================================

CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin', 'super_admin')),
    name TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. 店家資料表
-- ========================================

CREATE TABLE IF NOT EXISTS stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    store_name TEXT NOT NULL,
    store_number INTEGER,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    google_review_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. 訂閱管理表
-- ========================================

CREATE TABLE IF NOT EXISTS store_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES stores(id),
    plan_type TEXT CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
    status TEXT CHECK (status IN ('active', 'inactive', 'trial', 'past_due', 'canceled')),
    features JSONB,
    auto_renew BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. 關鍵字管理表
-- ========================================

CREATE TABLE IF NOT EXISTS store_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES stores(id),
    keyword TEXT NOT NULL,
    category TEXT CHECK (category IN ('service', 'environment', 'product', 'general', 'area')),
    industry TEXT,
    is_primary BOOLEAN DEFAULT false,
    priority INTEGER,
    source TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS industry_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    industry TEXT NOT NULL,
    keyword TEXT NOT NULL,
    frequency NUMERIC,
    usage_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. 活動日誌表
-- ========================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    performed_by TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level TEXT CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
    message TEXT NOT NULL,
    source TEXT CHECK (source IN ('client', 'server')),
    category TEXT,
    userid TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. 安全相關表
-- ========================================

CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address INET NOT NULL,
    success BOOLEAN NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. 創建管理員用戶記錄
-- ========================================

-- 測試管理員帳號
INSERT INTO users (email, role, name) VALUES 
    ('admin@test.com', 'super_admin', 'Test Super Admin'),
    ('manager@test.com', 'admin', 'Test Admin'),
    ('user@test.com', 'manager', 'Test Manager'),
    ('demo@test.com', 'user', 'Test User')
ON CONFLICT (email) DO UPDATE SET 
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    updated_at = NOW();

-- 你的個人管理員帳號
INSERT INTO users (email, role, name) VALUES 
    ('tornadolee20@yahoo.com.tw', 'super_admin', 'Personal Admin Account')
ON CONFLICT (email) DO UPDATE SET 
    role = 'super_admin',
    name = 'Personal Admin Account',
    updated_at = NOW();

-- ========================================
-- 8. 創建一些範例數據（可選）
-- ========================================

-- 範例店家數據
INSERT INTO stores (store_name, address, phone, email, industry, status, store_number) VALUES
    ('測試咖啡店', '台北市信義區信義路五段7號', '02-1234-5678', 'test@coffee.com', 'food_beverage', 'active', 1001),
    ('範例美髮店', '台北市大安區忠孝東路四段181號', '02-8765-4321', 'test@salon.com', 'beauty', 'active', 1002)
ON CONFLICT DO NOTHING;

-- ========================================
-- 9. 檢查創建結果
-- ========================================

-- 檢查用戶
SELECT 
    '👥 Users' as table_name,
    email,
    role,
    name,
    created_at
FROM users 
ORDER BY role DESC, created_at;

-- 檢查店家
SELECT 
    '🏪 Stores' as table_name,
    store_name,
    industry,
    status,
    created_at
FROM stores
ORDER BY created_at;

-- 顯示完成訊息
SELECT '✅ 資料庫初始化完成！現在你可以註冊帳號並使用管理員功能了。' as status;