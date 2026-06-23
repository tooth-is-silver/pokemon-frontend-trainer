-- 포켓몬 진행도를 4스탯에서 단일 EXP로 통합
-- - 기존 데이터는 hp/attack/defense/speed 중 가장 높은 값을 exp로 마이그레이션
-- - 이후 정답 보상, 열매 보상, 진화 판정은 exp 하나만 사용

alter table public.pokemon_instances
  add column if not exists exp int not null default 0;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'pokemon_instances'
      and column_name = 'hp'
  ) then
    execute '
      update public.pokemon_instances
      set exp = least(
        100,
        greatest(
          coalesce(exp, 0),
          coalesce(hp, 0),
          coalesce(attack, 0),
          coalesce(defense, 0),
          coalesce(speed, 0)
        )
      )
    ';
  end if;
end $$;

create or replace function public.process_answer(
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
  v_exp_delta int;
  v_growth_target int;
  v_berry_given text := null;
  v_result jsonb;
begin
  select * into v_trainer from public.trainers where user_id = v_user_id;
  if not found then
    raise exception '트레이너를 찾을 수 없습니다.';
  end if;

  select * into v_instance from public.pokemon_instances
    where id = v_trainer.active_pokemon_instance_id;
  if not found then
    raise exception '활성 포켓몬을 찾을 수 없습니다.';
  end if;

  select * into v_progression from public.progression where user_id = v_user_id;

  insert into public.solved_questions (user_id, question_id, correct)
    values (v_user_id, p_question_id, p_correct);

  if p_correct then
    v_exp_delta := case when p_is_first_solve then 5 else 1 end;

    v_growth_target := case
      when v_instance.exp >= 85 then 100
      when v_instance.exp >= 50 then 85
      else 50
    end;

    update public.pokemon_instances set
      exp = least(exp + v_exp_delta, v_growth_target),
      total_correct_count = total_correct_count + 1
    where id = v_instance.id
    returning * into v_instance;

    update public.progression set
      streak_correct_count = streak_correct_count + 1
    where user_id = v_user_id
    returning * into v_progression;

    if v_progression.streak_correct_count % 10 = 0 then
      select berry_name into v_berry_given
      from (
        values
          ('오랭열매'::text),
          ('무화열매'::text),
          ('나나열매'::text),
          ('배리열매'::text)
      ) as berries(berry_name)
      order by random()
      limit 1;

      update public.pokemon_instances set
        exp = least(exp + 5, 100)
      where id = v_instance.id
      returning * into v_instance;
    end if;

    if not v_instance.evolution_pending then
      if (v_instance.exp >= 50 and v_instance.current_stage = 1)
        or (v_instance.exp >= 85 and v_instance.current_stage = 2)
      then
        update public.pokemon_instances set evolution_pending = true
          where id = v_instance.id;
        update public.progression set pending_evolution_instance_id = v_instance.id
          where user_id = v_user_id;
        v_instance.evolution_pending := true;
      end if;
    end if;
  else
    update public.progression set streak_correct_count = 0
      where user_id = v_user_id
    returning * into v_progression;
  end if;

  v_result := jsonb_build_object(
    'correct', p_correct,
    'exp', v_instance.exp,
    'streak', v_progression.streak_correct_count,
    'berry_given', v_berry_given,
    'evolution_pending', v_instance.evolution_pending
  );

  return v_result;
end;
$$;

alter table public.pokemon_instances
  drop column if exists hp,
  drop column if exists attack,
  drop column if exists defense,
  drop column if exists speed;
