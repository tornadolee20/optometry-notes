-- Create auth user for tornadolee20@yahoo.com.tw and link to public.users as super_admin
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Ensure the auth user exists; create if missing with a temporary password and confirmed email
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'tornadolee20@yahoo.com.tw';

  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'tornadolee20@yahoo.com.tw',
      crypt('Temp-Admin-2025!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    ) RETURNING id INTO v_user_id;
  END IF;

  -- Upsert into public.users and ensure role is super_admin and id matches auth user id
  INSERT INTO public.users (id, email, role, name, is_active)
  VALUES (v_user_id, 'tornadolee20@yahoo.com.tw', 'super_admin', 'Personal Admin Account', true)
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    role = 'super_admin',
    name = 'Personal Admin Account',
    is_active = true,
    updated_at = NOW();
END $$;

-- Show result
SELECT u.email, u.role, u.is_active, u.id as public_user_id, au.id as auth_user_id
FROM public.users u
JOIN auth.users au ON au.email = u.email
WHERE u.email = 'tornadolee20@yahoo.com.tw';