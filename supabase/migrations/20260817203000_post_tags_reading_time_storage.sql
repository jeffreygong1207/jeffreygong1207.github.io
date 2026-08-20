-- Tags, reading time, and the image bucket the editor uploads into.

-- An array rather than a tags/post_tags pair: a personal blog carries a
-- handful of tags per post, filtering is a single GIN lookup, and there are no
-- orphan rows to garbage-collect when a tag stops being used.
alter table posts
  add column tags text[] not null default '{}';

-- A CHECK constraint cannot contain a subquery, so the per-element test lives
-- in an immutable function the constraint can call.
create function tags_are_kebab(tags text[])
returns boolean
language sql
immutable
set search_path = pg_catalog, pg_temp
as $$
  select bool_and(t ~ '^[a-z0-9]+(-[a-z0-9]+)*$') is not false
  from unnest(tags) t;
$$;

alter table posts
  add constraint posts_tags_are_kebab check (tags_are_kebab(tags));

comment on column posts.tags is
  'Kebab-case slugs. Filtered with tags @> array[...]; the GIN index below makes that an index scan rather than a seq scan.';

create index posts_tags_idx on posts using gin (tags);

-- Derived rather than stored by the application, for the same reason as
-- content_chunks.fts: the number cannot drift away from the text it describes.
-- 200 wpm is the usual reading-speed assumption.
alter table posts
  add column reading_minutes int
  generated always as (
    greatest(
      1,
      ceil(
        coalesce(
          array_length(regexp_split_to_array(btrim(content_text), '\s+'), 1),
          0
        ) / 200.0
      )::int
    )
  ) stored;


-- Cover images and inline editor uploads. Public read because every image in
-- here is attached to something meant to be read; writes are admin-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do nothing;

create policy post_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'post-images');

-- is_admin() rather than a blanket authenticated check: signing in with Google
-- must not by itself grant the ability to write files into the site's bucket.
create policy post_images_admin_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'post-images' and is_admin());

create policy post_images_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'post-images' and is_admin())
  with check (bucket_id = 'post-images' and is_admin());

create policy post_images_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'post-images' and is_admin());
