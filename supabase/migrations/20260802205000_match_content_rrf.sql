-- Hybrid retrieval over posts and learnings, ported from smart-docustore's
-- match_memories.
--
-- security invoker on purpose: RLS then scopes retrieval to what the caller
-- may see, so an anonymous reader's search cannot reach a private learning
-- even if a route handler forgets to filter. The visibility rule lives in the
-- policy, once, rather than in every caller.
--
-- search_path includes extensions because pgvector's <=> operator lives there;
-- pinning only public makes the operator unresolvable at runtime.

create function public.match_content(
  query_embedding  extensions.vector(384) default null,
  query_text       text        default null,
  match_count      int         default 10,
  candidate_count  int         default 40,
  filter_kind      content_kind default null,
  filter_topic     text        default null,
  rrf_k            int         default 60,
  recency_weight   double precision default 0.005
)
returns table (
  chunk_id     uuid,
  source_kind  content_kind,
  source_id    uuid,
  slug         text,
  title        text,
  content      text,
  occurred_on  timestamptz,
  score        double precision,
  rrf_score    double precision,
  vector_rank  bigint,
  fts_rank     bigint
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with vec as (
    -- row_number lives in the outer select so the inner `order by ... limit`
    -- can ride the HNSW index; a window function in the same block forces a
    -- full sort instead.
    select s.cid, row_number() over (order by s.dist) as rank
    from (
      select c.id as cid, (c.embedding <=> query_embedding) as dist
      from content_chunks c
      where query_embedding is not null
        and c.embedding is not null
        and (filter_kind is null or c.source_kind = filter_kind)
      order by c.embedding <=> query_embedding
      limit candidate_count
    ) s
  ),
  kw as (
    select s.cid, row_number() over (order by s.rk desc) as rank
    from (
      select c.id as cid,
             ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) as rk
      from content_chunks c
      where query_text is not null
        and btrim(query_text) <> ''
        and c.fts @@ websearch_to_tsquery('english', query_text)
        and (filter_kind is null or c.source_kind = filter_kind)
      order by rk desc
      limit candidate_count
    ) s
  ),
  fused as (
    -- RRF reads rank position, not score: cosine distance and ts_rank_cd sit
    -- on incomparable scales, so fusing by rank needs no normalisation.
    select
      coalesce(v.cid, k.cid) as cid,
      coalesce(1.0 / (rrf_k + v.rank), 0.0)
        + coalesce(1.0 / (rrf_k + k.rank), 0.0) as rrf,
      v.rank as v_rank,
      k.rank as k_rank
    from vec v
    full outer join kw k on k.cid = v.cid
  )
  select
    c.id,
    c.source_kind,
    coalesce(c.post_id, c.learning_id),
    coalesce(p.slug, l.slug),
    coalesce(p.title, l.title),
    c.content,
    coalesce(p.published_at, l.studied_on::timestamptz, l.created_at),
    -- log decay: full nudge today, roughly a quarter of it a month out, never
    -- zero. Study notes age far more slowly than personal memories, so this
    -- only breaks ties rather than reordering on freshness.
    (f.rrf + recency_weight / (1 + ln(1 + greatest(
        extract(epoch from (
          now() - coalesce(p.published_at, l.created_at)
        )) / 86400.0, 0))))::double precision,
    f.rrf::double precision,
    f.v_rank,
    f.k_rank
  from fused f
  join content_chunks c on c.id = f.cid
  left join posts p     on p.id = c.post_id
  left join learnings l on l.id = c.learning_id
  where (filter_topic is null or l.topic = filter_topic)
  order by 8 desc
  limit match_count;
$$;

comment on function public.match_content is
  'Hybrid vector + full-text retrieval fused by Reciprocal Rank Fusion. Ported from smart-docustore match_memories. security invoker so RLS scopes visibility.';
