-- Blog: things Jeffrey writes. Chronological, authored, opinion.
create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,

  -- Rich-text editor document (ProseMirror/TipTap JSON). Rendered on the
  -- client; never trusted as HTML.
  content jsonb not null default '{}'::jsonb,
  -- Flattened plaintext, derived from content on write. Feeds search,
  -- embeddings, and meta descriptions.
  content_text text not null default '',

  cover_image_url text,
  status post_status not null default 'draft',
  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint posts_slug_is_kebab check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint posts_published_needs_date
    check (status <> 'published' or published_at is not null)
);

comment on constraint posts_published_needs_date on posts is
  'A published post must carry a date; the index sorts on it and a null would silently drop the post from the feed.';

create index posts_published_at_idx
  on posts (published_at desc)
  where status = 'published';

create trigger posts_set_updated_at
  before update on posts
  for each row execute function app_set_updated_at();


-- Learnings: study artifacts. Topic-organized, evergreen, AI-assisted.
create table learnings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  topic text,

  -- Provenance. Rendered as a visible line on every learning page so the
  -- reader knows what they are looking at and where it came from.
  source_title text,
  source_url text,
  source_type learning_source_type not null default 'other',
  generated_with text,
  studied_on date,

  -- The artifact exactly as generated. Rendered inside a sandboxed iframe
  -- via srcdoc, so its scripts and styles cannot reach this origin.
  html_raw text not null,
  -- Text extracted from html_raw. Feeds embeddings, the retrieval context,
  -- and a server-rendered fallback for crawlers, which do not read srcdoc.
  text_content text not null default '',

  visibility content_visibility not null default 'private',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint learnings_slug_is_kebab check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint learnings_html_not_blank check (length(btrim(html_raw)) > 0)
);

comment on column learnings.html_raw is
  'Rendered only inside an iframe with sandbox="allow-scripts" and WITHOUT allow-same-origin. Never inject this into the page DOM.';

comment on column learnings.text_content is
  'Crawlers do not execute srcdoc, so this is what makes a learning page indexable. Keep it in sync with html_raw on every write.';

create index learnings_visibility_created_idx
  on learnings (created_at desc)
  where visibility = 'public';

create index learnings_topic_idx on learnings (topic)
  where visibility = 'public';

create trigger learnings_set_updated_at
  before update on learnings
  for each row execute function app_set_updated_at();


-- Embedding chunks for both content types. Exclusive arc rather than a
-- polymorphic (kind, id) pair, so deletes cascade for real.
create table content_chunks (
  id uuid primary key default gen_random_uuid(),

  source_kind content_kind not null,
  post_id uuid references posts (id) on delete cascade,
  learning_id uuid references learnings (id) on delete cascade,

  chunk_index int not null,
  content text not null,

  embedding extensions.vector(1536),
  -- Stored per row so the corpus can be re-embedded incrementally when the
  -- provider or model changes, instead of all at once.
  embedding_model text not null,

  created_at timestamptz not null default now(),

  constraint content_chunks_exactly_one_parent
    check (num_nonnulls(post_id, learning_id) = 1),
  constraint content_chunks_kind_matches_parent check (
    (source_kind = 'post' and post_id is not null)
    or (source_kind = 'learning' and learning_id is not null)
  ),
  constraint content_chunks_index_non_negative check (chunk_index >= 0)
);

comment on constraint content_chunks_exactly_one_parent on content_chunks is
  'Exclusive arc: a chunk belongs to exactly one post or one learning, never both and never neither.';

create unique index content_chunks_post_chunk_idx
  on content_chunks (post_id, chunk_index) where post_id is not null;

create unique index content_chunks_learning_chunk_idx
  on content_chunks (learning_id, chunk_index) where learning_id is not null;

-- HNSW over cosine distance: the corpus is small enough that build cost is
-- irrelevant and recall matters more than index size.
create index content_chunks_embedding_idx
  on content_chunks using hnsw (embedding extensions.vector_cosine_ops);
