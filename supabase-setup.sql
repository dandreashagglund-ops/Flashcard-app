-- ============================================================
-- Glosträning – Supabase setup SQL (v2)
-- Kör detta i Supabase > SQL Editor
-- ============================================================

-- 1. DECKS (ordlistor)
create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  subject text,
  front_lang text default 'en',
  back_lang text default 'sv',
  color text default '#c84b2f',
  theme_icon text default '📚',   -- NEW: tema-ikon (emoji)
  is_public boolean default false, -- NEW: dela med andra
  created_at timestamptz default now()
);
alter table public.decks enable row level security;

-- Policy: users manage own decks
drop policy if exists "Users manage own decks" on public.decks;
create policy "Users manage own decks"
  on public.decks for all
  using (auth.uid() = user_id);

-- NEW Policy: anyone can read public decks
drop policy if exists "Anyone can read public decks" on public.decks;
create policy "Anyone can read public decks"
  on public.decks for select
  using (is_public = true);

-- 2. CARDS
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  deck_id uuid references public.decks on delete cascade not null,
  front text not null,
  back text not null,
  notes text,
  image_url text,
  tags uuid[] default '{}',
  created_at timestamptz default now()
);
alter table public.cards enable row level security;

drop policy if exists "Users manage own cards" on public.cards;
create policy "Users manage own cards"
  on public.cards for all
  using (auth.uid() = user_id);

-- NEW Policy: anyone can read cards from public decks
drop policy if exists "Anyone can read public deck cards" on public.cards;
create policy "Anyone can read public deck cards"
  on public.cards for select
  using (
    exists (
      select 1 from public.decks
      where decks.id = cards.deck_id and decks.is_public = true
    )
  );

-- 3. TAGS
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  deck_id uuid references public.decks on delete cascade not null,
  name text not null,
  color text default '#6b9bce',
  created_at timestamptz default now()
);
alter table public.tags enable row level security;

drop policy if exists "Users manage own tags" on public.tags;
create policy "Users manage own tags"
  on public.tags for all
  using (auth.uid() = user_id);

-- 4. PROGRESS
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  card_id uuid references public.cards on delete cascade not null,
  correct integer default 0,
  wrong integer default 0,
  streak integer default 0,
  last_seen timestamptz,
  next_review timestamptz,
  unique (user_id, card_id)
);
alter table public.progress enable row level security;

drop policy if exists "Users manage own progress" on public.progress;
create policy "Users manage own progress"
  on public.progress for all
  using (auth.uid() = user_id);

-- 5. Indexes
create index if not exists idx_decks_user_id on public.decks (user_id);
create index if not exists idx_decks_is_public on public.decks (is_public);
create index if not exists idx_cards_user_deck on public.cards (user_id, deck_id);
create index if not exists idx_tags_user_deck on public.tags (user_id, deck_id);
create index if not exists idx_progress_user_card on public.progress (user_id, card_id);
create index if not exists idx_progress_next_review on public.progress (next_review);

-- ============================================================
-- Migration: if you already have tables, run only this part
-- ============================================================
-- alter table public.decks add column if not exists theme_icon text default '📚';
-- alter table public.decks add column if not exists is_public boolean default false;
-- create index if not exists idx_decks_is_public on public.decks (is_public);
-- create policy "Anyone can read public decks" on public.decks for select using (is_public = true);
-- create policy "Anyone can read public deck cards" on public.cards for select using (
--   exists (select 1 from public.decks where decks.id = cards.deck_id and decks.is_public = true)
-- );
