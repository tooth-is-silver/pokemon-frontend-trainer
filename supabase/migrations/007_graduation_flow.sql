-- 졸업 흐름: 졸업 대기 인스턴스 추적 컬럼 + 신규 인스턴스 시작 RPC

-- 1. progression 에 졸업 대기 인스턴스 ID 저장 컬럼 추가
alter table progression
  add column if not exists pending_graduation_instance_id uuid;

-- 2. 졸업 후 다음 인스턴스 시작
-- 입력: p_species_id (졸업 모달에서 선택한 종)
-- 동작:
--   현재 활성 인스턴스를 graduated = true 로 마킹하고
--   새 인스턴스를 생성해 active 로 전환한다. 도감 등록과 진행 상태 리셋도 함께.
create or replace function start_next_pokemon(p_species_id text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_trainer trainers%rowtype;
  v_old_instance_id uuid;
  v_new_instance_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select * into v_trainer from trainers where user_id = v_user_id;
  if not found then
    raise exception '트레이너를 찾을 수 없습니다.';
  end if;

  v_old_instance_id := v_trainer.active_pokemon_instance_id;

  -- 현재 인스턴스 졸업 마킹 (이미 graduated 면 그대로 유지)
  if v_old_instance_id is not null then
    update pokemon_instances
       set graduated = true,
           evolution_pending = false
     where id = v_old_instance_id
       and user_id = v_user_id;
  end if;

  -- 새 인스턴스 생성
  insert into pokemon_instances (user_id, species_id, current_stage)
    values (v_user_id, p_species_id, 1)
    returning id into v_new_instance_id;

  -- active 전환
  update trainers
     set active_pokemon_instance_id = v_new_instance_id
   where user_id = v_user_id;

  -- 도감 등록 (이미 있으면 무시)
  insert into pokedex_entries (user_id, species_id)
    values (v_user_id, p_species_id)
    on conflict (user_id, species_id) do nothing;

  -- 진행 상태 리셋
  update progression
     set streak_correct_count = 0,
         pending_graduation_instance_id = null,
         pending_evolution_instance_id = null
   where user_id = v_user_id;

  return jsonb_build_object('instance_id', v_new_instance_id);
end;
$$;
