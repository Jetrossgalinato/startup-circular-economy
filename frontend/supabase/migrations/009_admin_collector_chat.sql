-- Admin ↔ collector helpdesk chat. One thread per collector; all admins share it.
-- Residents have no policies on these tables.

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  collector_id uuid not null unique references public.profiles (id) on delete cascade,
  last_message_at timestamptz,
  last_message_body text,
  last_sender_id uuid references public.profiles (id),
  admin_last_read_at timestamptz,
  collector_last_read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  collector_id uuid not null references public.profiles (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_body_len check (char_length(body) between 1 and 2000)
);

create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at);

create index conversations_last_message_at_idx
  on public.conversations (last_message_at desc nulls last);

alter table public.conversations replica identity full;
alter table public.messages replica identity full;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Keep collector_id in sync and reject conversations that are not collectors.
create or replace function public.conversations_require_collector()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = new.collector_id
      and role = 'collector'
  ) then
    raise exception 'collector_id must belong to a collector';
  end if;
  return new;
end;
$$;

create trigger conversations_require_collector
  before insert or update of collector_id on public.conversations
  for each row
  execute function public.conversations_require_collector();

create or replace function public.messages_set_collector_id()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  select collector_id
  into new.collector_id
  from public.conversations
  where id = new.conversation_id;

  if new.collector_id is null then
    raise exception 'conversation not found';
  end if;

  new.body := trim(new.body);
  if new.body = '' then
    raise exception 'message body cannot be empty';
  end if;

  return new;
end;
$$;

create trigger messages_set_collector_id
  before insert on public.messages
  for each row
  execute function public.messages_set_collector_id();

create or replace function public.on_chat_message_inserted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_role public.user_role;
begin
  select role into sender_role
  from public.profiles
  where id = new.sender_id;

  update public.conversations
  set
    last_message_at = new.created_at,
    last_message_body = new.body,
    last_sender_id = new.sender_id,
    collector_last_read_at = case
      when sender_role = 'collector' then new.created_at
      else collector_last_read_at
    end,
    admin_last_read_at = case
      when sender_role = 'admin' then new.created_at
      else admin_last_read_at
    end
  where id = new.conversation_id;

  return new;
end;
$$;

create trigger on_chat_message_inserted
  after insert on public.messages
  for each row
  execute function public.on_chat_message_inserted();

create or replace function public.mark_chat_read(p_conversation_id uuid)
returns public.conversations
language plpgsql
security definer
set search_path = public
as $$
declare
  conv public.conversations;
begin
  if public.is_admin() then
    update public.conversations
    set admin_last_read_at = now()
    where id = p_conversation_id
      and last_message_at is not null
      and (admin_last_read_at is null or admin_last_read_at < last_message_at)
    returning * into conv;
    if conv is null then
      select * into conv from public.conversations where id = p_conversation_id;
    end if;
  elsif public.is_collector() then
    update public.conversations
    set collector_last_read_at = now()
    where id = p_conversation_id
      and collector_id = auth.uid()
      and last_message_at is not null
      and (collector_last_read_at is null or collector_last_read_at < last_message_at)
    returning * into conv;
    if conv is null then
      select * into conv
      from public.conversations
      where id = p_conversation_id
        and collector_id = auth.uid();
    end if;
  else
    raise exception 'not allowed';
  end if;

  return conv;
end;
$$;

revoke all on function public.mark_chat_read(uuid) from public;
grant execute on function public.mark_chat_read(uuid) to authenticated;

create policy "Collectors can read own conversation"
  on public.conversations
  for select
  to authenticated
  using (
    public.is_collector()
    and collector_id = auth.uid()
  );

create policy "Collectors can start own conversation"
  on public.conversations
  for insert
  to authenticated
  with check (
    public.is_collector()
    and collector_id = auth.uid()
  );

create policy "Admins can read all conversations"
  on public.conversations
  for select
  to authenticated
  using (public.is_admin());

create policy "Collectors can read own messages"
  on public.messages
  for select
  to authenticated
  using (
    public.is_collector()
    and collector_id = auth.uid()
  );

create policy "Collectors can send in own conversation"
  on public.messages
  for insert
  to authenticated
  with check (
    public.is_collector()
    and sender_id = auth.uid()
    and collector_id = auth.uid()
    and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and c.collector_id = auth.uid()
    )
  );

create policy "Admins can read all messages"
  on public.messages
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can send in any conversation"
  on public.messages
  for insert
  to authenticated
  with check (
    public.is_admin()
    and sender_id = auth.uid()
    and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
    )
  );

grant select, insert on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;

do $pub$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.conversations;
    exception
      when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.messages;
    exception
      when duplicate_object then null;
    end;
  end if;
end
$pub$;
