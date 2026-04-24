-- 현재 활성 포켓몬 교체
-- 본인 소유 인스턴스만 지정 가능 (RLS 와 WHERE 조건으로 이중 보호)
create or replace function set_active_pokemon(p_instance_id uuid)
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

  if not exists (
    select 1 from pokemon_instances
     where id = p_instance_id
       and user_id = v_user_id
  ) then
    raise exception 'pokemon instance not found';
  end if;

  update trainers
     set active_pokemon_instance_id = p_instance_id
   where user_id = v_user_id;
end;
$$;
