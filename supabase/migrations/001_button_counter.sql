create table if not exists public.button_counter (
  id integer primary key,
  count bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.button_counter (id, count)
values (1, 0)
on conflict (id) do nothing;

create or replace function public.increment_counter()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  update public.button_counter
  set
    count = count + 1,
    updated_at = now()
  where id = 1
  returning count into new_count;

  if new_count is null then
    raise exception 'button_counter row id=1 not found';
  end if;

  return new_count;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select on table public.button_counter to anon, authenticated;
grant execute on function public.increment_counter() to anon, authenticated;
