-- 진화 처리 트랜잭션
create or replace function evolve_pokemon(
  p_instance_id uuid,
  p_next_species_id text,
  p_next_stage int
)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
begin
  -- 포켓몬 인스턴스 업데이트
  update pokemon_instances set
    species_id = p_next_species_id,
    current_stage = p_next_stage,
    evolution_pending = false
  where id = p_instance_id
    and user_id = v_user_id
    and evolution_pending = true;

  if not found then
    raise exception '진화 대기 상태인 포켓몬을 찾을 수 없습니다.';
  end if;

  -- 도감 등록
  insert into pokedex_entries (user_id, species_id)
    values (v_user_id, p_next_species_id)
    on conflict (user_id, species_id) do nothing;

  -- 진화 대기 해제
  update progression set pending_evolution_instance_id = null
    where user_id = v_user_id;
end;
$$;

-- 진화 보류 처리
create or replace function skip_evolution(p_instance_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
begin
  update pokemon_instances set evolution_pending = false
    where id = p_instance_id
      and user_id = v_user_id
      and evolution_pending = true;

  if not found then
    raise exception '진화 대기 상태인 포켓몬을 찾을 수 없습니다.';
  end if;

  update progression set pending_evolution_instance_id = null
    where user_id = v_user_id;
end;
$$;
