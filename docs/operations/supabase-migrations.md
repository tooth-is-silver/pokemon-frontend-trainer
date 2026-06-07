# Supabase Migration Runbook

Supabase DB 변경은 프론트 배포와 별도로 운영 DB에 적용해야 한다.
`supabase/migrations/`에 SQL 파일이 머지되어도 Vercel 배포만으로는 RPC, 컬럼, 정책이 생성되지 않는다.

## 증상

- 프론트에서 `supabase.rpc()` 호출 시 `PGRST202`가 발생한다.
- 예: `Could not find the function public.start_next_pokemon(p_species_id) in the schema cache.`
- 원인: 운영 DB에 해당 RPC 마이그레이션이 적용되지 않았거나, 적용 직후 PostgREST schema cache가 갱신되지 않았다.

## 운영 반영 순서

1. 최신 `main`을 기준으로 작업한다.
2. `supabase/migrations/`의 미적용 SQL을 파일 번호 순서대로 확인한다.
3. Supabase 관리자 권한이 있는 환경에서 마이그레이션을 적용한다.
4. 적용 후 PostgREST schema cache를 갱신한다.
5. 실제 배포 URL에서 문제가 난 RPC 흐름을 다시 확인한다.

## CLI 적용

Supabase access token이 로컬에 있을 때 사용한다.

```bash
npx --yes supabase@latest login
npx --yes supabase@latest link --project-ref dqcbvwiompmtxdqpkkyz
npx --yes supabase@latest db push --linked --include-all
```

DB password를 직접 사용하는 경우:

```bash
npx --yes supabase@latest db push --db-url "$SUPABASE_DB_URL" --include-all
```

## SQL Editor 적용

CLI 인증이 없으면 Supabase Dashboard의 SQL Editor에서 미적용 파일을 순서대로 실행한다.
현재 다음 포켓몬 선택 오류를 복구하려면 아래 파일들이 운영 DB에 적용되어 있어야 한다.

```text
supabase/migrations/007_graduation_flow.sql
supabase/migrations/008_legendary_wave_transition.sql
supabase/migrations/009_complete_ending.sql
```

마지막에 schema cache 갱신을 실행한다.

```sql
notify pgrst, 'reload schema';
```

## 검증

- 졸업 모달에서 다음 포켓몬을 선택했을 때 `start_next_pokemon` RPC 오류가 없어야 한다.
- 뮤 졸업 흐름에서는 `complete_ending` RPC 오류가 없어야 한다.
- 오류가 계속되면 SQL Editor에서 아래 조회로 함수 존재 여부를 확인한다.

```sql
select routine_name, data_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('start_next_pokemon', 'complete_ending')
order by routine_name;
```
