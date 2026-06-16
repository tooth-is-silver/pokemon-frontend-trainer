-- 정답 보상 스탯 성장 규칙 변경
-- - 정답 1회마다 4스탯 중 1개만 랜덤 성장
-- - 현재 성장 경계(50 → 85 → 100)보다 작은 스탯만 후보에 포함

create or replace function process_answer(
  p_question_id text,
  p_correct boolean,
  p_is_first_solve boolean
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_trainer trainers%rowtype;
  v_instance pokemon_instances%rowtype;
  v_progression progression%rowtype;
  v_stat_delta int;
  v_growth_target int;
  v_growth_stat text := null;
  v_berry_given text := null;
  v_berry_stat text := null;
  v_result jsonb;
begin
  -- 트레이너 조회
  select * into v_trainer from trainers where user_id = v_user_id;
  if not found then
    raise exception '트레이너를 찾을 수 없습니다.';
  end if;

  -- 활성 포켓몬 조회
  select * into v_instance from pokemon_instances
    where id = v_trainer.active_pokemon_instance_id;
  if not found then
    raise exception '활성 포켓몬을 찾을 수 없습니다.';
  end if;

  -- 진행 상태 조회
  select * into v_progression from progression where user_id = v_user_id;

  -- 1. 풀이 기록 삽입
  insert into solved_questions (user_id, question_id, correct)
    values (v_user_id, p_question_id, p_correct);

  if p_correct then
    -- 2. 스탯 증가 (첫 정답 +5, 재정답 +1)
    v_stat_delta := case when p_is_first_solve then 5 else 1 end;

    v_growth_target := case
      when v_instance.hp >= 85
        and v_instance.attack >= 85
        and v_instance.defense >= 85
        and v_instance.speed >= 85 then 100
      when v_instance.hp >= 50
        and v_instance.attack >= 50
        and v_instance.defense >= 50
        and v_instance.speed >= 50 then 85
      else 50
    end;

    select stat_name into v_growth_stat
    from (
      values
        ('hp'::text, v_instance.hp),
        ('attack'::text, v_instance.attack),
        ('defense'::text, v_instance.defense),
        ('speed'::text, v_instance.speed)
    ) as stats(stat_name, stat_value)
    where stat_value < v_growth_target
    order by random()
    limit 1;

    -- v_growth_stat 은 현재 성장 경계보다 작은 스탯 중에서만 선택된다.
    update pokemon_instances set
      hp = case
        when v_growth_stat = 'hp' then least(hp + v_stat_delta, v_growth_target)
        else hp
      end,
      attack = case
        when v_growth_stat = 'attack' then least(attack + v_stat_delta, v_growth_target)
        else attack
      end,
      defense = case
        when v_growth_stat = 'defense' then least(defense + v_stat_delta, v_growth_target)
        else defense
      end,
      speed = case
        when v_growth_stat = 'speed' then least(speed + v_stat_delta, v_growth_target)
        else speed
      end,
      total_correct_count = total_correct_count + 1
    where id = v_instance.id
    returning * into v_instance;

    -- 3. 연속 정답 수 갱신
    update progression set
      streak_correct_count = streak_correct_count + 1
    where user_id = v_user_id
    returning * into v_progression;

    -- 4. 열매 지급 (연속 10개마다)
    if v_progression.streak_correct_count % 10 = 0 then
      -- 랜덤 열매 선택
      select berry_stat, berry_name into v_berry_stat, v_berry_given
      from (
        values
          ('hp'::text, '오랭열매'::text),
          ('attack'::text, '무화열매'::text),
          ('defense'::text, '나나열매'::text),
          ('speed'::text, '배리열매'::text)
      ) as berries(berry_stat, berry_name)
      order by random()
      limit 1;

      -- 열매 효과 적용
      update pokemon_instances set
        hp = case when v_berry_stat = 'hp' then least(hp + 5, 100) else hp end,
        attack = case when v_berry_stat = 'attack' then least(attack + 5, 100) else attack end,
        defense = case when v_berry_stat = 'defense' then least(defense + 5, 100) else defense end,
        speed = case when v_berry_stat = 'speed' then least(speed + 5, 100) else speed end
      where id = v_instance.id
      returning * into v_instance;
    end if;

    -- 5. 진화 가능 여부 체크
    if not v_instance.evolution_pending then
      -- 1차 진화: 4스탯 모두 50 이상
      -- 2차 진화: 4스탯 모두 85 이상
      if (v_instance.hp >= 50 and v_instance.attack >= 50
          and v_instance.defense >= 50 and v_instance.speed >= 50
          and v_instance.current_stage = 1)
        or (v_instance.hp >= 85 and v_instance.attack >= 85
            and v_instance.defense >= 85 and v_instance.speed >= 85
            and v_instance.current_stage = 2)
      then
        update pokemon_instances set evolution_pending = true
          where id = v_instance.id;
        update progression set pending_evolution_instance_id = v_instance.id
          where user_id = v_user_id;
        v_instance.evolution_pending := true;
      end if;
    end if;

  else
    -- 오답: 연속 정답 리셋
    update progression set streak_correct_count = 0
      where user_id = v_user_id
    returning * into v_progression;
  end if;

  -- 결과 반환
  v_result := jsonb_build_object(
    'correct', p_correct,
    'stats', jsonb_build_object(
      'hp', v_instance.hp,
      'attack', v_instance.attack,
      'defense', v_instance.defense,
      'speed', v_instance.speed
    ),
    'streak', v_progression.streak_correct_count,
    'berry_given', v_berry_given,
    'evolution_pending', v_instance.evolution_pending
  );

  return v_result;
end;
$$;
