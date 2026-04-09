-- 스타터 선택 트랜잭션 (원자적 처리)
create or replace function choose_starter(p_species_id text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_instance_id uuid;
begin
  -- 트레이너 생성
  insert into trainers (user_id, starter_chosen)
    values (v_user_id, true)
    on conflict (user_id) do update set starter_chosen = true;

  -- 포켓몬 인스턴스 생성
  insert into pokemon_instances (user_id, species_id, current_stage)
    values (v_user_id, p_species_id, 1)
    returning id into v_instance_id;

  -- 활성 포켓몬 설정
  update trainers set active_pokemon_instance_id = v_instance_id
    where user_id = v_user_id;

  -- 도감 등록
  insert into pokedex_entries (user_id, species_id)
    values (v_user_id, p_species_id)
    on conflict do nothing;

  -- 진행 상태 생성
  insert into progression (user_id)
    values (v_user_id)
    on conflict (user_id) do nothing;

  return jsonb_build_object('instance_id', v_instance_id);
end;
$$;
