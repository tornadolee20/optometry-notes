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

-- 2) Upsert admin-related records by email (role mapping). These rows will link by email.
INSERT INTO public.users (email, role, name, is_active)
VALUES
  ('admin@test.com',   'super_admin', 'Test Super Admin', true),
  ('manager@test.com', 'admin',       'Test Admin',       true),
  ('user@test.com',    'manager',     'Test Manager',     true),
  ('demo@test.com',    'user',        'Test User',        true)
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  is_active = true,
  updated_at = now();

-- 3) Optional personal admin account mapping
INSERT INTO public.users (email, role, name, is_active)
VALUES
  ('tornadolee20@yahoo.com.tw', 'super_admin', 'Personal Admin Account', true)
ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  name = 'Personal Admin Account',
  is_active = true,
  updated_at = now();

-- 4) Show results
SELECT email, role, name, is_active, created_at, updated_at
FROM public.users
WHERE email IN (
  'admin@test.com','manager@test.com','user@test.com','demo@test.com','tornadolee20@yahoo.com.tw'
)
ORDER BY role DESC, email ASC;