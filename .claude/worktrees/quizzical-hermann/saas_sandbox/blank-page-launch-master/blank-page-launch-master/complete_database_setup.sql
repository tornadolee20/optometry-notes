-- 完整資料庫設定 SQL
-- 基於原始專案的資料庫結構建立

-- 首先建立自定義類型
CREATE TYPE public.keyword_category AS ENUM ('general', 'product', 'service', 'location', 'experience');
CREATE TYPE public.store_status AS ENUM ('pending', 'active', 'suspended', 'cancelled');
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'store_owner');

-- 建立序列
CREATE SEQUENCE IF NOT EXISTS stores_store_number_seq;

-- 建立 users 表
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    role text NOT NULL DEFAULT 'user'::text,
    name text,
    avatar_url text,
    is_active boolean DEFAULT true,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);

-- 建立 admins 表
CREATE TABLE IF NOT EXISTS public.admins (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT admins_pkey PRIMARY KEY (id),
    CONSTRAINT admins_email_key UNIQUE (email)
);

-- 建立 user_roles 表
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role public.app_role NOT NULL DEFAULT 'user'::app_role,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT user_roles_pkey PRIMARY KEY (id),
    CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 建立 stores 表
CREATE TABLE IF NOT EXISTS public.stores (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    store_name text NOT NULL,
    email text NOT NULL,
    address text NOT NULL,
    phone text NOT NULL,
    status public.store_status DEFAULT 'pending'::store_status,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    store_number integer NOT NULL DEFAULT nextval('stores_store_number_seq'::regclass),
    description text,
    google_review_url text,
    industry text,
    CONSTRAINT stores_pkey PRIMARY KEY (id),
    CONSTRAINT stores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT stores_email_key UNIQUE (email),
    CONSTRAINT stores_store_number_key UNIQUE (store_number)
);

-- 建立 store_subscriptions 表
CREATE TABLE IF NOT EXISTS public.store_subscriptions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    store_id uuid,
    plan_type text NOT NULL DEFAULT 'standard'::text,
    expires_at timestamp with time zone NOT NULL,
    auto_renew boolean DEFAULT true,
    features jsonb DEFAULT '{"analytics": true, "qr_download": true, "review_generation": true, "review_system_url": true, "keyword_management": true}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    status text DEFAULT 'active'::text,
    trial_ends_at timestamp with time zone,
    CONSTRAINT store_subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT store_subscriptions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE
);

-- 建立 store_keywords 表
CREATE TABLE IF NOT EXISTS public.store_keywords (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    store_id uuid,
    keyword text NOT NULL,
    priority integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    category public.keyword_category DEFAULT 'general'::keyword_category,
    usage_count integer DEFAULT 0,
    source text DEFAULT 'manual'::text,
    industry text,
    is_primary boolean DEFAULT false,
    CONSTRAINT store_keywords_pkey PRIMARY KEY (id),
    CONSTRAINT store_keywords_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE
);

-- 建立 customer_keyword_logs 表
CREATE TABLE IF NOT EXISTS public.customer_keyword_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    store_id uuid,
    selected_keywords text[],
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT customer_keyword_logs_pkey PRIMARY KEY (id),
    CONSTRAINT customer_keyword_logs_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE
);

-- 建立 industry_keywords 表
CREATE TABLE IF NOT EXISTS public.industry_keywords (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    industry text NOT NULL,
    keyword text NOT NULL,
    frequency integer DEFAULT 0,
    last_updated timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    usage_count integer DEFAULT 0,
    CONSTRAINT industry_keywords_pkey PRIMARY KEY (id),
    CONSTRAINT industry_keywords_industry_keyword_key UNIQUE (industry, keyword)
);

-- 建立 activity_logs 表
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    activity_type text NOT NULL,
    description text,
    performed_by text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT activity_logs_pkey PRIMARY KEY (id)
);

-- 建立 login_attempts 表
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    ip_address inet NOT NULL,
    success boolean NOT NULL,
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT login_attempts_pkey PRIMARY KEY (id)
);

-- 建立 system_logs 表
CREATE TABLE IF NOT EXISTS public.system_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    level text,
    message text,
    category text,
    details jsonb DEFAULT '{}'::jsonb,
    userid text,
    sessionid text,
    timestamp timestamp with time zone DEFAULT now(),
    source text,
    useragent text,
    url text,
    stack text,
    CONSTRAINT system_logs_pkey PRIMARY KEY (id)
);

-- 建立索引（基於 migration 檔案）
CREATE INDEX IF NOT EXISTS idx_customer_keyword_logs_store_id ON public.customer_keyword_logs (store_id);
CREATE INDEX IF NOT EXISTS idx_store_keywords_store_id ON public.store_keywords (store_id);
CREATE INDEX IF NOT EXISTS idx_store_subscriptions_store_id ON public.store_subscriptions (store_id);
CREATE INDEX IF NOT EXISTS idx_store_keywords_store_priority ON public.store_keywords (store_id, priority);
CREATE INDEX IF NOT EXISTS idx_customer_keyword_logs_store_created ON public.customer_keyword_logs (store_id, created_at);

-- 建立函數（如果需要）
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為需要的表格建立觸發器
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_subscriptions_updated_at BEFORE UPDATE ON public.store_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_keywords_updated_at BEFORE UPDATE ON public.store_keywords
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 啟用 RLS（Row Level Security）
ALTER TABLE public.customer_keyword_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- 基本的 RLS 政策
CREATE POLICY "Allow read access to customer_keyword_logs" ON public.customer_keyword_logs FOR SELECT USING (true);
CREATE POLICY "Allow insert access to customer_keyword_logs" ON public.customer_keyword_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read access to store_keywords" ON public.store_keywords FOR SELECT USING (true);
CREATE POLICY "Allow insert access to store_keywords" ON public.store_keywords FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to store_keywords" ON public.store_keywords FOR UPDATE USING (true);
CREATE POLICY "Allow read access to store_subscriptions" ON public.store_subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow read access to industry_keywords" ON public.industry_keywords FOR SELECT USING (true);
CREATE POLICY "Allow update access to industry_keywords" ON public.industry_keywords FOR UPDATE USING (true);
CREATE POLICY "Allow read access to stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Allow insert access to stores" ON public.stores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to stores" ON public.stores FOR UPDATE USING (true);

-- 完成資料庫設定