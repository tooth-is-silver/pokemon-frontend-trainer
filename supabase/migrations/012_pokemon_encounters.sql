-- 사용자별 최초 조우 기록과 저장 RPC

create table if not exists public.pokemon_encounters (
  user_id uuid not null references auth.users(id) on delete cascade,
  species_id text not null check (btrim(species_id) <> ''),
  first_encountered_at timestamptz not null default now(),
  primary key (user_id, species_id)
);

insert into public.pokemon_encounters (user_id, species_id, first_encountered_at)
select user_id, species_id, unlocked_at
from public.pokedex_entries
on conflict (user_id, species_id) do nothing;

alter table public.pokemon_encounters enable row level security;

drop policy if exists "pokemon_encounters_select" on public.pokemon_encounters;
create policy "pokemon_encounters_select"
  on public.pokemon_encounters
  for select
  using (auth.uid() = user_id);

grant select on public.pokemon_encounters to authenticated;

create or replace function public.record_pokemon_encounter(p_species_id text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_species_id is null or btrim(p_species_id) = '' then
    raise exception 'species id is required';
  end if;

  insert into public.pokemon_encounters (user_id, species_id)
  values (v_user_id, p_species_id)
  on conflict (user_id, species_id) do nothing;

  return p_species_id;
end;
$$;

revoke all on function public.record_pokemon_encounter(text) from public;
grant execute on function public.record_pokemon_encounter(text) to authenticated;

notify pgrst, 'reload schema';
