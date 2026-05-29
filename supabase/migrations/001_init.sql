-- Borders table (uses gen_random_uuid() built-in, no extension needed)
create table if not exists public.borders (
  id            uuid default gen_random_uuid() primary key,
  name          text not null,
  image_url     text not null,
  thumbnail_url text,
  category      text default 'general',
  tags          text[] default '{}',
  download_count integer default 0,
  created_at    timestamp with time zone default now() not null
);

alter table public.borders enable row level security;

-- Allow anyone to read borders
create policy "Borders are publicly readable"
  on public.borders for select using (true);

-- Allow anyone to upload new borders
create policy "Anyone can upload borders"
  on public.borders for insert with check (true);

-- NOTE: Create the "borders" storage bucket manually in Supabase Storage UI
-- (Settings -> Storage -> New Bucket -> name: "borders", toggle Public ON)
-- Then add these storage policies in the Storage > Policies tab:

-- Policy 1 (SELECT): bucket_id = 'borders'
-- Policy 2 (INSERT): bucket_id = 'borders'
