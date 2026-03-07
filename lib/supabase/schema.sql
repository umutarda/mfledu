-- ============================================================
-- EAFLEdu – Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique not null,
  full_name   text,
  avatar_url  text,
  grade       smallint check (grade between 9 and 12),
  bio         text,
  points      integer default 0,
  badge       text,
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone"  on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. QUESTIONS
create table if not exists public.questions (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  author_id    uuid references public.profiles (id) on delete set null,
  subject      text,
  grade        smallint,
  unit         text,
  tags         text[] default '{}',
  youtube_url  text,
  pdf_url      text,
  image_url    text,
  is_off_topic boolean default false,
  upvotes      integer default 0,
  downvotes    integer default 0,
  answer_count integer default 0,
  view_count   integer default 0,
  created_at   timestamptz default now()
);
alter table public.questions enable row level security;
create policy "Questions viewable by everyone"   on public.questions for select using (true);
create policy "Auth users can post questions"    on public.questions for insert with check (auth.uid() = author_id);
create policy "Authors can update own questions" on public.questions for update using (auth.uid() = author_id);
create policy "Authors can delete own questions" on public.questions for delete using (auth.uid() = author_id);

-- 3. ANSWERS
create table if not exists public.answers (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  author_id   uuid references public.profiles (id) on delete set null,
  body        text not null,
  upvotes     integer default 0,
  is_accepted boolean default false,
  created_at  timestamptz default now()
);
alter table public.answers enable row level security;
create policy "Answers viewable by everyone"   on public.answers for select using (true);
create policy "Auth users can post answers"    on public.answers for insert with check (auth.uid() = author_id);
create policy "Authors can update own answers" on public.answers for update using (auth.uid() = author_id);
create policy "Authors can delete own answers" on public.answers for delete using (auth.uid() = author_id);

-- 4. ANSWER REPLIES
create table if not exists public.answer_replies (
  id        uuid primary key default gen_random_uuid(),
  answer_id uuid not null references public.answers (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body      text not null,
  created_at timestamptz default now()
);
alter table public.answer_replies enable row level security;
create policy "Replies viewable by everyone"  on public.answer_replies for select using (true);
create policy "Auth users can post replies"   on public.answer_replies for insert with check (auth.uid() = author_id);
create policy "Authors can delete own replies" on public.answer_replies for delete using (auth.uid() = author_id);

-- 5. NOTES (uploaded files)
create table if not exists public.notes (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  author_id    uuid references public.profiles (id) on delete set null,
  subject      text,
  grade        smallint,
  unit         text,
  note_type    text, -- 'note','summary','formula','solved','video'
  tags         text[] default '{}',
  file_url     text,  -- Supabase Storage URL
  youtube_url  text,
  likes        integer default 0,
  downloads    integer default 0,
  created_at   timestamptz default now()
);
alter table public.notes enable row level security;
create policy "Notes viewable by everyone"   on public.notes for select using (true);
create policy "Auth users can post notes"    on public.notes for insert with check (auth.uid() = author_id);
create policy "Authors can update own notes" on public.notes for update using (auth.uid() = author_id);
create policy "Authors can delete own notes" on public.notes for delete using (auth.uid() = author_id);

-- 5.1 NOTE COMMENTS
create table if not exists public.note_comments (
  id          uuid primary key default gen_random_uuid(),
  note_id     uuid not null references public.notes (id) on delete cascade,
  author_id   uuid references public.profiles (id) on delete set null,
  content     text not null,
  created_at  timestamptz default now()
);
alter table public.note_comments enable row level security;
create policy "Note comments are viewable by everyone" on public.note_comments for select using (true);
create policy "Auth users can post note comments" on public.note_comments for insert with check (auth.uid() = author_id);
create policy "Authors can delete own note comments" on public.note_comments for delete using (auth.uid() = author_id);

-- 6. VOTES
create table if not exists public.votes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  target_id   uuid not null,  -- question or answer id
  target_type text not null check (target_type in ('question', 'answer')),
  direction   text not null check (direction in ('up', 'down')),
  created_at  timestamptz default now(),
  unique (user_id, target_id, target_type)
);
alter table public.votes enable row level security;
create policy "Users can see all votes"      on public.votes for select using (true);
create policy "Users can manage own votes"   on public.votes for all using (auth.uid() = user_id);

-- 7. NOTIFICATIONS
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  type        text not null, -- 'answer','mention','accepted','vote'
  message     text not null,
  link        text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "Users see own notifications"   on public.notifications for select using (auth.uid() = user_id);
create policy "Users can mark read"           on public.notifications for update using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS POLICIES
-- ============================================================

-- 1. NOTES Bucket Policies
-- Allow public select
create policy "Public Access" on storage.objects for select using ( bucket_id = 'notes' );

-- Allow authenticated users to upload to their own folder
create policy "User can upload to own folder" on storage.objects for insert with check (
  bucket_id = 'notes' AND (auth.uid()::text = (storage.foldername(name))[1])
);

-- Allow authors to delete their own files
create policy "User can delete own folder files" on storage.objects for delete using (
  bucket_id = 'notes' AND (auth.uid()::text = (storage.foldername(name))[1])
);

-- 2. IMAGES Bucket Policies
create policy "Public Access Images" on storage.objects for select using ( bucket_id = 'images' );
create policy "User can upload images" on storage.objects for insert with check (
  bucket_id = 'images' AND (auth.uid()::text = (storage.foldername(name))[1])
);

