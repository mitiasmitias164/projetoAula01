-- Grant basic permissions to the table
grant select on table public.class_speakers to anon;
grant select, insert, update, delete on table public.class_speakers to authenticated;
grant all on table public.class_speakers to service_role;

-- Ensure RLS is enabled
alter table public.class_speakers enable row level security;

-- Re-apply policies just to be safe (idempotent)
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
