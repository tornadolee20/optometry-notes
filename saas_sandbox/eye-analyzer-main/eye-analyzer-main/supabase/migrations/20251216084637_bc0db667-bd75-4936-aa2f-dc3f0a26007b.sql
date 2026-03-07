-- ==============================================
-- MYOWN Vision Multi-Tenant SaaS Database Schema
-- ==============================================

-- 1. Create Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.professional_type AS ENUM ('optometrist', 'ophthalmologist', 'optical_technician', 'other');
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');

-- 2. Create optometrist profiles table
CREATE TABLE public.optometrist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Basic info
  optometrist_name TEXT NOT NULL,
  professional_type professional_type,
  
  -- Taiwan license verification (required for zh-TW)
  optometrist_license_number TEXT UNIQUE,
  
  -- Experience (optional)
  years_of_experience TEXT,
  
  -- Clinic info
  clinic_name TEXT NOT NULL,
  clinic_address TEXT NOT NULL,
  clinic_phone TEXT NOT NULL,
  clinic_line_id TEXT,
  clinic_wechat_id TEXT,
  clinic_email TEXT,
  clinic_region TEXT NOT NULL,
  
  -- System language at registration
  registration_language TEXT DEFAULT 'zh-TW',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 4. Create exam_records table (de-identified)
CREATE TABLE public.exam_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Patient de-identified info
  patient_code TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender gender_type NOT NULL,
  exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- All examination values (JSONB for flexibility)
  exam_data JSONB NOT NULL DEFAULT '{}',
  
  -- Calculated results
  health_score INTEGER,
  diagnostic_classification TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Enable RLS on all tables
ALTER TABLE public.optometrist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_records ENABLE ROW LEVEL SECURITY;

-- 6. Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 7. RLS Policies for optometrist_profiles
CREATE POLICY "Users can view their own profile"
ON public.optometrist_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.optometrist_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.optometrist_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.optometrist_profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9. RLS Policies for exam_records
CREATE POLICY "Users can view their own exam records"
ON public.exam_records
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own exam records"
ON public.exam_records
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own exam records"
ON public.exam_records
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own exam records"
ON public.exam_records
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all exam records"
ON public.exam_records
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 11. Apply updated_at triggers
CREATE TRIGGER update_optometrist_profiles_updated_at
BEFORE UPDATE ON public.optometrist_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exam_records_updated_at
BEFORE UPDATE ON public.exam_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Create function to check license uniqueness
CREATE OR REPLACE FUNCTION public.check_license_unique(license_number TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.optometrist_profiles
    WHERE optometrist_license_number = license_number
  )
$$;

-- 13. Create index for better query performance
CREATE INDEX idx_exam_records_user_id ON public.exam_records(user_id);
CREATE INDEX idx_exam_records_exam_date ON public.exam_records(exam_date);
CREATE INDEX idx_exam_records_patient_code ON public.exam_records(patient_code);
CREATE INDEX idx_optometrist_profiles_user_id ON public.optometrist_profiles(user_id);
CREATE INDEX idx_optometrist_profiles_license ON public.optometrist_profiles(optometrist_license_number);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);