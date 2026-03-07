-- ============================================================
-- Glosträning v3 – Supabase setup SQL
-- Kör detta i Supabase > SQL Editor
-- ============================================================

-- ── 1. USER PROFILES (roller, inställningar) ─────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text,
  role text default 'user' check (role in ('sysadmin','group_manager','user')),
  plan text default 'free' check (plan in ('free','paid')),
  is_active boolean default true,
  gdpr_deleted boolean default false,
  last_active timestamptz,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Admins manage all profiles" on public.profiles;
create policy "Admins manage all profiles"
  on public.profiles for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'sysadmin')
  );

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.email);
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. THEMES (globala teman) ────────────────────────────────────
create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text default '📚',
  color text default '#c84b2f',
  is_active boolean default true,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);
alter table public.themes enable row level security;

drop policy if exists "Everyone reads active themes" on public.themes;
create policy "Everyone reads active themes"
  on public.themes for select using (is_active = true or auth.uid() is not null);

drop policy if exists "Admins manage themes" on public.themes;
create policy "Admins manage themes"
  on public.themes for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'sysadmin')
  );

-- ── 3. TAGS (globala taggar) ─────────────────────────────────────
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text default '#6b9bce',
  scope text default 'user' check (scope in ('global','user')),
  is_active boolean default true,
  user_id uuid references auth.users,
  created_at timestamptz default now()
);
alter table public.tags enable row level security;

drop policy if exists "Read active global tags and own tags" on public.tags;
create policy "Read active global tags and own tags"
  on public.tags for select using (
    (scope = 'global' and is_active = true) or auth.uid() = user_id
  );

drop policy if exists "Users manage own tags" on public.tags;
create policy "Users manage own tags"
  on public.tags for all using (auth.uid() = user_id and scope = 'user');

drop policy if exists "Admins manage global tags" on public.tags;
create policy "Admins manage global tags"
  on public.tags for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'sysadmin')
  );

-- ── 4. DECKS (ordlistor) ─────────────────────────────────────────
create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  pair_type text default 'vocabulary' check (pair_type in ('vocabulary','concept')),
  front_lang text default 'en',
  back_lang text default 'sv',
  color text default '#c84b2f',
  theme_icon text default '📚',
  theme_ids uuid[] default '{}',
  tag_ids uuid[] default '{}',
  is_public boolean default false,
  is_active boolean default true,
  use_count integer default 0,
  created_at timestamptz default now()
);
alter table public.decks enable row level security;

drop policy if exists "Users manage own decks" on public.decks;
create policy "Users manage own decks"
  on public.decks for all using (auth.uid() = user_id);

drop policy if exists "Anyone can read public decks" on public.decks;
create policy "Anyone can read public decks"
  on public.decks for select using (is_public = true and is_active = true);

drop policy if exists "Admins manage all decks" on public.decks;
create policy "Admins manage all decks"
  on public.decks for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('sysadmin','group_manager'))
  );

-- ── 5. CARDS (kort/par) ──────────────────────────────────────────
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  deck_id uuid references public.decks on delete cascade not null,
  front text not null,
  back text not null,
  notes text,
  front_emoji text default '',
  back_emoji text default '',
  front_icon text default '',
  back_icon text default '',
  theme_ids uuid[] default '{}',
  tag_ids uuid[] default '{}',
  difficulty integer default 2 check (difficulty between 1 and 5),
  is_active boolean default true,
  is_flagged boolean default false,
  flag_reason text,
  flag_count integer default 0,
  view_count integer default 0,
  created_at timestamptz default now()
);
alter table public.cards enable row level security;

drop policy if exists "Users manage own cards" on public.cards;
create policy "Users manage own cards"
  on public.cards for all using (auth.uid() = user_id);

drop policy if exists "Anyone can read public deck cards" on public.cards;
create policy "Anyone can read public deck cards"
  on public.cards for select using (
    exists (select 1 from public.decks d where d.id = cards.deck_id and d.is_public = true and d.is_active = true)
    and is_active = true
  );

drop policy if exists "Admins manage all cards" on public.cards;
create policy "Admins manage all cards"
  on public.cards for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('sysadmin','group_manager'))
  );

-- ── 6. PROGRESS (spaced repetition per user+card) ────────────────
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  card_id uuid references public.cards on delete cascade not null,
  correct integer default 0,
  wrong integer default 0,
  streak integer default 0,
  last_seen timestamptz,
  next_review timestamptz,
  is_favorite boolean default false,
  unique (user_id, card_id)
);
alter table public.progress enable row level security;

drop policy if exists "Users manage own progress" on public.progress;
create policy "Users manage own progress"
  on public.progress for all using (auth.uid() = user_id);

-- ── 7. USER LOG ───────────────────────────────────────────────────
create table if not exists public.user_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,  -- nullable for anonymized records
  event_type text not null check (event_type in (
    'user_created','data_imported','deck_created','session_ended','card_flagged','account_deleted'
  )),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
alter table public.user_log enable row level security;

drop policy if exists "Admins read log" on public.user_log;
create policy "Admins read log"
  on public.user_log for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'sysadmin')
  );

drop policy if exists "System inserts log" on public.user_log;
create policy "System inserts log"
  on public.user_log for insert with check (true);

-- ── 8. INDEXES ────────────────────────────────────────────────────
create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_decks_user_id on public.decks (user_id);
create index if not exists idx_decks_is_public on public.decks (is_public);
create index if not exists idx_decks_theme_ids on public.decks using gin (theme_ids);
create index if not exists idx_cards_deck_id on public.cards (deck_id);
create index if not exists idx_cards_user_deck on public.cards (user_id, deck_id);
create index if not exists idx_cards_theme_ids on public.cards using gin (theme_ids);
create index if not exists idx_cards_tag_ids on public.cards using gin (tag_ids);
create index if not exists idx_cards_flagged on public.cards (is_flagged) where is_flagged = true;
create index if not exists idx_progress_user_card on public.progress (user_id, card_id);
create index if not exists idx_progress_next_review on public.progress (next_review);
create index if not exists idx_progress_favorite on public.progress (user_id, is_favorite) where is_favorite = true;
create index if not exists idx_user_log_event on public.user_log (event_type, created_at);
create index if not exists idx_user_log_user on public.user_log (user_id);

-- ── 9. SEED DATA ──────────────────────────────────────────────────
-- Globala teman
insert into public.themes (name, icon, color) values
  ('Djur', '🐾', '#8B6914'),
  ('Mat & Dryck', '🍎', '#c84b2f'),
  ('Kropp', '🧍', '#2f7dc8'),
  ('Hem & Hushåll', '🏠', '#5a7a2f'),
  ('Natur', '🌿', '#2a7a4f'),
  ('Transport', '🚗', '#7a2f8f'),
  ('Kläder', '👕', '#c87a2f'),
  ('Skola', '📐', '#2f5ac8'),
  ('IT & Teknik', '💻', '#1a3a5c'),
  ('Hälsa', '💊', '#c82f4b'),
  ('Sport', '⚽', '#2fa87a'),
  ('Musik', '🎵', '#8f2fc8'),
  ('Historia', '🏛️', '#7a5a2f'),
  ('Geografi', '🌍', '#2f7a5a'),
  ('Grammatik', '📖', '#5a2f7a')
on conflict (name) do nothing;

-- Globala taggar
insert into public.tags (name, color, scope) values
  ('Lätt', '#2a7a4f', 'global'),
  ('Medel', '#c87a2f', 'global'),
  ('Svårt', '#c82f2f', 'global'),
  ('Favorit', '#c8a02f', 'global'),
  ('Oregelbunden', '#7a2f8f', 'global'),
  ('Fras', '#2f7dc8', 'global'),
  ('Verb', '#c84b2f', 'global'),
  ('Substantiv', '#2a7a4f', 'global'),
  ('Adjektiv', '#c87a2f', 'global'),
  ('Adverb', '#5a2f7a', 'global')
on conflict do nothing;
