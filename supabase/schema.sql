create table if not exists public.dino_leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  score integer not null,
  created_at timestamptz not null default now()
);

alter table public.dino_leaderboard enable row level security;

create policy "Public read leaderboard"
on public.dino_leaderboard
for select
to anon
using (true);

create policy "Public insert leaderboard"
on public.dino_leaderboard
for insert
to anon
with check (true);

create table if not exists public.site_counters (
  counter_key text primary key,
  counter_value bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.site_counters enable row level security;

create policy "Public read site counters"
on public.site_counters
for select
to anon
using (true);

create policy "Public insert site counters"
on public.site_counters
for insert
to anon
with check (true);

create policy "Public update site counters"
on public.site_counters
for update
to anon
using (true)
with check (true);

create or replace function public.increment_site_counter(target_key text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_value bigint;
begin
  insert into public.site_counters (counter_key, counter_value, updated_at)
  values (target_key, 1, now())
  on conflict (counter_key)
  do update set
    counter_value = public.site_counters.counter_value + 1,
    updated_at = now()
  returning counter_value into next_value;

  return next_value;
end;
$$;

grant execute on function public.increment_site_counter(text) to anon;
