
-- 1) 安全定義函式：判斷是否為 super_admin
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'super_admin'
  );
$$;

comment on function public.is_super_admin is 'Return true if current auth user is super_admin in public.users';

-- 2) 調整 store_subscriptions RLS：僅 super_admin 允許寫入
-- 目前已有 SELECT true，不變更；新增 super_admin 的 ALL 權限
create policy "super_admins_manage_store_subscriptions"
on public.store_subscriptions
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- 3) 建立匯款末五碼提交表：bank_transfer_submissions
create table if not exists public.bank_transfer_submissions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  submitted_by uuid null, -- 不直接加外鍵到 auth.users，避免耦合；僅存 user id
  transfer_code text not null,
  amount numeric(12,2),
  currency text not null default 'TWD',
  status text not null default 'pending', -- pending | verified | rejected
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfer_code_len check (char_length(transfer_code) = 5),
  constraint transfer_status_valid check (status in ('pending','verified','rejected'))
);

-- 啟用 RLS
alter table public.bank_transfer_submissions enable row level security;

-- 店家只能新增/查看自己的提交（店家為 stores.user_id = auth.uid()）
create policy "owners_insert_own_transfer_submissions"
on public.bank_transfer_submissions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.stores s
    where s.id = bank_transfer_submissions.store_id
      and s.user_id = auth.uid()
  )
);

create policy "owners_select_own_transfer_submissions"
on public.bank_transfer_submissions
for select
to authenticated
using (
  exists (
    select 1
    from public.stores s
    where s.id = bank_transfer_submissions.store_id
      and s.user_id = auth.uid()
  )
);

-- super_admin 擁有完整權限（查看/更新/刪除）
create policy "super_admins_full_access_transfer_submissions"
on public.bank_transfer_submissions
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- 4) updated_at 觸發器（使用專案既有函式 public.update_updated_at_column）
-- 對 bank_transfer_submissions
drop trigger if exists set_timestamp_bank_transfer_submissions on public.bank_transfer_submissions;
create trigger set_timestamp_bank_transfer_submissions
before update on public.bank_transfer_submissions
for each row execute procedure public.update_updated_at_column();

-- 對 store_subscriptions（若尚未建立）
drop trigger if exists set_timestamp_store_subscriptions on public.store_subscriptions;
create trigger set_timestamp_store_subscriptions
before update on public.store_subscriptions
for each row execute procedure public.update_updated_at_column();
