-- 엔딩 처리: 뮤 졸업 시 인스턴스 마킹 + progression.is_ending 갱신
--
-- 흐름:
--   mew 학습 → 4스탯 100 도달 → graduationReady → pendingGraduationInstanceId 세팅
--   LearnPage 가 mew 졸업 감지 → complete_ending(instance_id) 호출
--   더 이상 새 인스턴스를 시작하지 않으므로 start_next_pokemon 대신 별도 RPC 사용

alter table progression
  add column if not exists is_ending boolean not null default false;

create or replace function complete_ending(p_instance_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  -- 뮤 인스턴스 졸업 마킹
  update pokemon_instances
     set graduated = true,
         evolution_pending = false
   where id = p_instance_id
     and user_id = v_user_id
     and species_id = 'mew';

  if not found then
    raise exception '뮤 인스턴스를 찾을 수 없습니다.';
  end if;

  -- 엔딩 시그널 + 대기 상태 해제
  update progression
     set is_ending = true,
         pending_graduation_instance_id = null,
         pending_evolution_instance_id = null
   where user_id = v_user_id;
end;
$$;
