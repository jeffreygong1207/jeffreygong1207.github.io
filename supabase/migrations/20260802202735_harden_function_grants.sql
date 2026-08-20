-- Pin search_path. Lower stakes than is_admin() since this is security
-- invoker, but a trigger function resolving now() through a caller-controlled
-- search_path is not a thing worth leaving open.
create or replace function app_set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Supabase grants EXECUTE to anon and authenticated explicitly, so the
-- earlier "revoke from public" left the anon grant in place. No anon-facing
-- policy calls is_admin(), so anon has no reason to reach it.
revoke execute on function is_admin() from anon;

-- authenticated keeps EXECUTE on purpose: Postgres evaluates RLS policy
-- expressions as the querying role, so revoking this would make every
-- *_admin_all policy raise a permission error instead of granting access.
grant execute on function is_admin() to authenticated;
