-- Who may write. A table rather than a hardcoded address in each policy, so
-- adding an author is a row insert instead of a migration.
create table site_admins (
  email text primary key,
  note text,
  created_at timestamptz not null default now(),
  constraint site_admins_email_is_lowercase check (email = lower(email))
);

-- RLS on with ZERO policies: the table is unreachable through PostgREST for
-- every client role. It is read only by is_admin(), which is security definer.
-- Do not add a policy here. A readable allowlist tells an attacker exactly
-- which account to go after; a writable one is game over.
alter table site_admins enable row level security;

comment on table site_admins is
  'Deliberately has no RLS policies. Reached only via is_admin(). Adding any policy exposes or opens the allowlist.';

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from site_admins
    where email = lower(auth.jwt() ->> 'email')
  );
$$;

comment on function is_admin() is
  'search_path is pinned because this is security definer; without it a caller-controlled search_path could shadow site_admins.';

-- Anonymous callers have no email claim, so this returns false rather than
-- erroring. Only the Google provider should be enabled in Auth settings, so
-- every email that reaches here is provider-verified.
revoke execute on function is_admin() from public;
grant execute on function is_admin() to authenticated;


alter table posts enable row level security;
alter table learnings enable row level security;
alter table content_chunks enable row level security;

-- Drafts are invisible to the world. 'unlisted' is readable by direct slug;
-- keeping it out of the feed is the index query's job, not RLS's.
create policy posts_public_read on posts
  for select to anon, authenticated
  using (status in ('published', 'unlisted'));

create policy posts_admin_all on posts
  for all to authenticated
  using (is_admin())
  with check (is_admin());

create policy learnings_public_read on learnings
  for select to anon, authenticated
  using (visibility in ('public', 'unlisted'));

create policy learnings_admin_all on learnings
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- No public policy at all. Retrieval runs server-side under the service role,
-- so exposing raw chunks to the browser would only leak private learnings'
-- text without enabling anything.
create policy content_chunks_admin_all on content_chunks
  for all to authenticated
  using (is_admin())
  with check (is_admin());


insert into site_admins (email, note)
values ('jeffreygong@berkeley.edu', 'primary author');
