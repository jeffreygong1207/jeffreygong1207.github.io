-- Realign the corpus index with the retrieval stack already proven in
-- smart-docustore: Supabase.ai gte-small at 384 dimensions, computed in-process
-- in an Edge Function, fused with full-text via RRF.
--
-- Pure cosine search misses exact terms, and a corpus of CS study notes is
-- mostly exact terms -- HNSW, MVCC, Raft, SIGCOMM. The full-text half is not
-- an optimisation here, it is the half that finds those.
--
-- Safe as a straight ALTER because content_chunks is still empty.

drop index content_chunks_embedding_idx;

alter table content_chunks
  alter column embedding type extensions.vector(384);

comment on column content_chunks.embedding is
  'gte-small, 384-dim, generated in-process by a Supabase Edge Function. embedding_model records which model produced each row so the corpus can be re-embedded incrementally.';

create index content_chunks_embedding_idx
  on content_chunks using hnsw (embedding extensions.vector_cosine_ops);

-- Generated rather than maintained by the application: a chunk's text and its
-- search vector cannot drift apart if Postgres derives one from the other.
alter table content_chunks
  add column fts tsvector
  generated always as (to_tsvector('english', content)) stored;

create index content_chunks_fts_idx on content_chunks using gin (fts);


-- Chunks of already-public content are a redundant copy of already-public
-- text, so exposing them leaks nothing -- and letting RLS scope retrieval
-- means the visibility rule lives in one place instead of being reimplemented
-- in whichever route handler happens to call search.
create policy content_chunks_public_read on content_chunks
  for select to anon, authenticated
  using (
    (
      post_id is not null and exists (
        select 1 from posts p
        where p.id = content_chunks.post_id
          and p.status in ('published', 'unlisted')
      )
    )
    or (
      learning_id is not null and exists (
        select 1 from learnings l
        where l.id = content_chunks.learning_id
          and l.visibility in ('public', 'unlisted')
      )
    )
  );
