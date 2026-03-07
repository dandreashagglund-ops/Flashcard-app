-- ============================================================
-- Glosträning – Supabase setup SQL
-- Kör detta i Supabase > SQL Editor
-- ============================================================

-- 1. DECKS (ordlistor)
create table public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  subject text,
  front_lang text default 'en',
  back_lang text default 'sv',
  color text default '#c84b2f',
  created_at timestamptz default now()
);
alter table public.decks enable row level security;
create policy "Users manage own decks"
  on public.decks for all
  using (auth.uid() = user_id);

-- 2. CARDS
create table public.cards (
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
create policy "Users manage own cards"
  on public.cards for all
  using (auth.uid() = user_id);

-- 3. TAGS
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  deck_id uuid references public.decks on delete cascade not null,
  name text not null,
  color text default '#6b9bce',
  created_at timestamptz default now()
);
alter table public.tags enable row level security;
create policy "Users manage own tags"
  on public.tags for all
  using (auth.uid() = user_id);

-- 4. PROGRESS
create table public.progress (
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
create policy "Users manage own progress"
  on public.progress for all
  using (auth.uid() = user_id);

-- 5. Indexes
create index on public.decks (user_id);
create index on public.cards (user_id, deck_id);
create index on public.tags (user_id, deck_id);
create index on public.progress (user_id, card_id);
create index on public.progress (next_review);
