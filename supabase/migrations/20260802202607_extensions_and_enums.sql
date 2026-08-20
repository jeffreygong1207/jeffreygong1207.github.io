-- pgvector backs semantic search over the learnings corpus.
create extension if not exists vector with schema extensions;

-- Blog posts move draft -> published. 'unlisted' is reachable by direct link
-- but is never returned by the index listing.
create type post_status as enum ('draft', 'published', 'unlisted');

-- Learnings use a three-state visibility rather than a publish flow: the
-- private tier is the personal study record that never leaves the admin side.
create type content_visibility as enum ('public', 'unlisted', 'private');

create type learning_source_type as enum (
  'paper', 'docs', 'talk', 'book', 'course', 'other'
);

-- Discriminator for the embedding chunk table's exclusive arc.
create type content_kind as enum ('post', 'learning');

-- Shared updated_at trigger. Named app_ to keep it distinct from anything
-- Supabase installs into public.
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
