-- Create class_speakers table
create table if not exists public.class_speakers (
  id uuid default gen_random_uuid() primary key,
  turma_id uuid references public.turmas(id) on delete cascade not null,
  name text not null,
  bio text,
  avatar_url text,
  linkedin_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.class_speakers enable row level security;

-- Policies (Drop first to avoid errors on re-run)
drop policy if exists "Public speakers are viewable by everyone" on public.class_speakers;
create policy "Public speakers are viewable by everyone"
  on public.class_speakers for select
  using ( true );

drop policy if exists "Managers can insert class_speakers" on public.class_speakers;
create policy "Managers can insert class_speakers"
  on public.class_speakers for insert
  with check ( auth.uid() in (select id from public.users where role = 'GESTOR') );

drop policy if exists "Managers can update class_speakers" on public.class_speakers;
create policy "Managers can update class_speakers"
  on public.class_speakers for update
  using ( auth.uid() in (select id from public.users where role = 'GESTOR') );

drop policy if exists "Managers can delete class_speakers" on public.class_speakers;
create policy "Managers can delete class_speakers"
  on public.class_speakers for delete
  using ( auth.uid() in (select id from public.users where role = 'GESTOR') );
