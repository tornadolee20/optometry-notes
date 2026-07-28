-- ====================================================================
-- Vision Knowledge OS & 視力家家簿 Supabase 初始化 Database Schema
-- 包含家庭帳號、孩子檔案、視力眼軸紀錄、收藏庫與 pgvector 向量檢索表
-- ====================================================================

-- 啟用 pgvector 向量擴充元件 (用於 AI RAG 檢索)
create extension if not exists vector with schema public;

-- 1. 家庭帳號表 (Households)
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  family_name text not null default '自己的家庭',
  contact_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 孩子個人檔案表 (Child Profiles)
create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade not null,
  name_alias text not null, -- 暱稱或代號
  birth_year integer not null,
  gender text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 視力與眼軸紀錄表 (Vision & Axial Records - 雙眼獨立紀錄)
create table if not exists public.vision_records (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.child_profiles(id) on delete cascade not null,
  record_date date not null default current_date,
  
  -- 右眼 (OD) 數據
  axial_length_od numeric(5,2), -- 眼軸長度 (mm)
  sphere_od numeric(5,2),       -- 球面度數 (D)
  cylinder_od numeric(5,2),     -- 散光度數 (D)
  axis_od integer,              -- 散光軸度

  -- 左眼 (OS) 數據
  axial_length_os numeric(5,2),
  sphere_os numeric(5,2),
  cylinder_os numeric(5,2),
  axis_os integer,

  -- 測量品質與可比較性欄位
  is_same_instrument boolean default true,
  instrument_model text,
  is_dilated boolean default false, -- 是否散瞳
  has_full_report boolean default true,
  notes text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. 向量化知識庫檢索表 (Vector Embeddings for RAG)
create table if not exists public.knowledge_embeddings (
  id uuid primary key default gen_random_uuid(),
  object_type text not null, -- 'question', 'article', 'research'
  object_id text not null,
  title text not null,
  content text not null,
  embedding vector(1536), -- OpenAI / Antigravity Embedding 向量
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ====================================================================
-- RLS 行級安全存取控制 (Row Level Security)
-- ====================================================================

alter table public.households enable row level security;
alter table public.child_profiles enable row level security;
alter table public.vision_records enable row level security;
alter table public.knowledge_embeddings enable row level security;

-- Households RLS: 使用者僅能存取屬於自己的家庭帳號
create policy "Users can manage their own household"
  on public.households for all
  using (auth.uid() = auth_user_id);

-- Child Profiles RLS
create policy "Users can manage their children profiles"
  on public.child_profiles for all
  using (
    household_id in (
      select id from public.households where auth_user_id = auth.uid()
    )
  );

-- Vision Records RLS
create policy "Users can manage their vision records"
  on public.vision_records for all
  using (
    child_id in (
      select cp.id from public.child_profiles cp
      join public.households h on cp.household_id = h.id
      where h.auth_user_id = auth.uid()
    )
  );

-- Knowledge Embeddings RLS: 所有人皆可讀取公開知識向量
create policy "Public Knowledge Embeddings are viewable by everyone"
  on public.knowledge_embeddings for select
  using (true);
