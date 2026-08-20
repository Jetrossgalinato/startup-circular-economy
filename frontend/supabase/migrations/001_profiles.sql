-- Run this in Supabase SQL Editor after enabling Email auth provider.
--
-- Dashboard checklist:
-- 1. Authentication -> Providers -> Email: enabled
-- 2. Authentication -> Email: choose whether "Confirm email" is required
--    (the app handles both session-on-signup and check-your-email flows)

create type public.user_role as enum ('resident', 'admin', 'collector');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.user_role not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own full_name"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role_value public.user_role;
begin
  user_role_value := (new.raw_user_meta_data ->> 'role')::public.user_role;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    user_role_value
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
