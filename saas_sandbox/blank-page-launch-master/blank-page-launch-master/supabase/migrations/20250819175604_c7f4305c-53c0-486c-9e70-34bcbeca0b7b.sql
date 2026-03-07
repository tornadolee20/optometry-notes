
-- 1) Add covering indexes for foreign keys

-- Stores: FK stores.user_id -> (likely auth.users or public.users)
-- Adding an index on the referencing column prevents table scans on updates/deletes of the parent row
CREATE INDEX IF NOT EXISTS idx_stores_user_id
  ON public.stores(user_id);

-- User roles: FK user_roles.user_id -> auth.users(id)
-- Indexing user_id speeds up role lookups and FK maintenance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
  ON public.user_roles(user_id);
