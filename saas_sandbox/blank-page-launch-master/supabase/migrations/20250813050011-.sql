-- Admin account setup: seed roles into public.users without touching auth schema
-- 1) Ensure users table exists (create only if missing) with required columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    CREATE TABLE public.users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin', 'super_admin')),
      name TEXT,
      avatar_url TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 2) Hardcoded seed accounts removed for security.
--    Admin accounts should be created via Supabase Dashboard or a secure setup script.