-- Borders table
create extension if not exists "uuid-ossp";

create table if not exists public.borders (
  id            uuid default uuid_generate_v4() primary key,
  name          text not null,
  image_url     text not null,
  thumbnail_url text,
  category      text default 'general',
  tags          text[] default '{}',
  download_count integer default 0,
  created_at    timestamp with time zone default timezone('utc', now()) not null
);

alter table public.borders enable row level security;

create policy "Borders are publicly readable"
  on public.borders for select using (true);

create policy "Anyone can upload borders"
  on public.borders for insert with check (true);

-- Storage: create buckets (run in Supabase dashboard Storage tab if this SQL fails)
insert into storage.buckets (id, name, public)
  values ('borders', 'borders', true)
  on conflict do nothing;

create policy "Borders bucket is publicly readable"
  on storage.objects for select using (bucket_id = 'borders');

create policy "Anyone can upload to borders bucket"
  on storage.objects for insert with check (bucket_id = 'borders');
