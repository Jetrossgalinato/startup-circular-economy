-- Stop mark_chat_read from rewriting last_read_at when nothing is unread.
-- A no-op update was firing Realtime and refetching the inbox in a loop.

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
