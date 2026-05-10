-- 전설 wave 트랜지션: start_next_pokemon RPC 안에서 트랜잭션으로 처리
--
-- 트랜지션 룰:
--   none            → legendary-birds : 일반 도감 146종 모두 등록 시
--   legendary-birds → mewtwo          : 프리저/썬더/파이어 모두 졸업 시
--   mewtwo          → mew             : 뮤츠 졸업 시
--   mew             → (유지)          : 뮤 졸업 시 is_ending=true 반환만 (엔딩 UI 는 별도 PR)

create or replace function start_next_pokemon(p_species_id text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_trainer trainers%rowtype;
  v_old_instance_id uuid;
  v_old_species_id text;
  v_new_instance_id uuid;
  v_current_stage text;
  v_next_stage text;
  v_normal_unlocked_count int;
  v_birds_graduated_count int;
  v_is_ending boolean := false;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select * into v_trainer from trainers where user_id = v_user_id;
  if not found then
    raise exception '트레이너를 찾을 수 없습니다.';
  end if;

  v_old_instance_id := v_trainer.active_pokemon_instance_id;

  -- 졸업한 인스턴스의 species 식별 (트랜지션 판정용)
  if v_old_instance_id is not null then
    select species_id into v_old_species_id
      from pokemon_instances
     where id = v_old_instance_id
       and user_id = v_user_id;

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

  update trainers
     set active_pokemon_instance_id = v_new_instance_id
   where user_id = v_user_id;

  -- 도감 등록 (이미 있으면 무시)
  insert into pokedex_entries (user_id, species_id)
    values (v_user_id, p_species_id)
    on conflict (user_id, species_id) do nothing;

  -- wave 트랜지션 판정
  select unlocked_legendary_stage into v_current_stage
    from progression
   where user_id = v_user_id;

  if v_current_stage = 'none' then
    -- 일반 도감 완성 (전설 5종 제외 146종)
    select count(*) into v_normal_unlocked_count
      from pokedex_entries
     where user_id = v_user_id
       and species_id not in ('articuno', 'zapdos', 'moltres', 'mewtwo', 'mew');

    if v_normal_unlocked_count >= 146 then
      v_next_stage := 'legendary-birds';
    end if;
  elsif v_current_stage = 'legendary-birds' then
    -- 프리저/썬더/파이어 모두 졸업
    select count(*) into v_birds_graduated_count
      from pokemon_instances
     where user_id = v_user_id
       and graduated = true
       and species_id in ('articuno', 'zapdos', 'moltres');

    if v_birds_graduated_count >= 3 then
      v_next_stage := 'mewtwo';
    end if;
  elsif v_current_stage = 'mewtwo' then
    if v_old_species_id = 'mewtwo' then
      v_next_stage := 'mew';
    end if;
  elsif v_current_stage = 'mew' then
    if v_old_species_id = 'mew' then
      v_is_ending := true;
    end if;
  end if;

  -- progression 업데이트 (트랜지션 + 리셋)
  update progression
     set streak_correct_count = 0,
         pending_graduation_instance_id = null,
         pending_evolution_instance_id = null,
         unlocked_legendary_stage = coalesce(v_next_stage, unlocked_legendary_stage)
   where user_id = v_user_id;

  return jsonb_build_object(
    'instance_id', v_new_instance_id,
    'unlocked_legendary_stage', coalesce(v_next_stage, v_current_stage),
    'is_ending', v_is_ending
  );
end;
$$;
