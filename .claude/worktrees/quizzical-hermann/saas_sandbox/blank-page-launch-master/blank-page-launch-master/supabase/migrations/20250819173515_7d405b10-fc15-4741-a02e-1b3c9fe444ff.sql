
-- 1) 判斷訂閱是否有效（trial/active 且未過期）
create or replace function public.is_subscription_active(_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.store_subscriptions s
    where s.store_id = _store_id
      and s.expires_at > timezone('utc', now())
      and s.status in ('active','trial')
  );
$$;

-- 2) 啟用店家時自動建立 7 天試用（僅在該 store 尚無任何訂閱紀錄時）
create or replace function public.create_trial_on_activation()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  if new.status = 'active' then
    if not exists (select 1 from public.store_subscriptions where store_id = new.id) then
      insert into public.store_subscriptions (
        store_id, plan_type, status, expires_at, trial_ends_at, auto_renew, payment_source, created_at, updated_at
      ) values (
        new.id,
        'trial',
        'trial',
        timezone('utc', now()) + interval '7 days',
        timezone('utc', now()) + interval '7 days',
        false,
        'trial',
        timezone('utc', now()),
        timezone('utc', now())
      );
    end if;
  end if;

  return new;
end;
$function$;

-- 安全建立 triggers：先刪後建，避免重複
drop trigger if exists create_trial_on_store_insert on public.stores;
create trigger create_trial_on_store_insert
after insert on public.stores
for each row
execute function public.create_trial_on_activation();

drop trigger if exists create_trial_on_store_status_update on public.stores;
create trigger create_trial_on_store_status_update
after update of status on public.stores
for each row
when (old.status is distinct from new.status)
execute function public.create_trial_on_activation();

-- 3) 匯款審核核可時自動延長訂閱（掛上既有 handle_transfer_approval 函式）
drop trigger if exists bank_transfer_on_verified on public.bank_transfer_submissions;
create trigger bank_transfer_on_verified
after update of status on public.bank_transfer_submissions
for each row
execute function public.handle_transfer_approval();

-- 4) RLS：收緊 stores 可見性（從「公開可讀」改為「僅本人或超管」）
drop policy if exists "stores_select_public" on public.stores;

create policy "stores_select_owner_or_admin"
on public.stores
for select
using ((user_id = auth.uid()) or is_super_admin());

-- 5) RLS：鎖定 store_keywords（需訂閱有效）
-- 先移除舊 policy，改為加入訂閱狀態判斷（或超管）
drop policy if exists "store_keywords_insert_owner_or_admin" on public.store_keywords;
drop policy if exists "store_keywords_update_owner_or_admin" on public.store_keywords;
drop policy if exists "store_keywords_delete_owner_or_admin" on public.store_keywords;

create policy "store_keywords_insert_owner_with_active_subscription_or_admin"
on public.store_keywords
for insert
with check (
  (
    exists (
      select 1 from public.stores s
      where s.id = store_keywords.store_id
        and s.user_id = auth.uid()
    )
    and public.is_subscription_active(store_keywords.store_id)
  )
  or is_super_admin()
);

create policy "store_keywords_update_owner_with_active_subscription_or_admin"
on public.store_keywords
for update
using (
  (
    exists (
      select 1 from public.stores s
      where s.id = store_keywords.store_id
        and s.user_id = auth.uid()
    )
    and public.is_subscription_active(store_keywords.store_id)
  )
  or is_super_admin()
)
with check (
  (
    exists (
      select 1 from public.stores s
      where s.id = store_keywords.store_id
        and s.user_id = auth.uid()
    )
    and public.is_subscription_active(store_keywords.store_id)
  )
  or is_super_admin()
);

create policy "store_keywords_delete_owner_with_active_subscription_or_admin"
on public.store_keywords
for delete
using (
  (
    exists (
      select 1 from public.stores s
      where s.id = store_keywords.store_id
        and s.user_id = auth.uid()
    )
    and public.is_subscription_active(store_keywords.store_id)
  )
  or is_super_admin()
);
