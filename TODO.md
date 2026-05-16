# Pokemon JS Trainer — 구현 TODO

> 기준 문서: `AGENTS.md`, `docs/specs/game-rules.md`, `docs/specs/screen-flow.md`,
> `docs/specs/content-rules.md`, `docs/specs/data-structures.md`
> 구현 순서 참고: `docs/implementation-roadmap.md`

## 게임 흐름 (정합화 후)

1. 로그인 → 스타터 1마리 선택 (이상해씨/파이리/꼬부기)
2. 학습 화면에서 문제 풀이 → 정답 시 스탯 +5 / 재정답 +1
3. 4스탯 50 이상 → 1차 진화 모달 (진화 또는 보류)
4. 4스탯 85 이상 → 2차 진화 모달 (3단 진화 종)
5. 졸업 트리거
   - 다단 진화 종: 최종 진화체에서 4스탯 100
   - 무진화 종: 4스탯 50
6. **졸업 모달** 표시
   - 졸업 축하 + 진화 라인 회고
   - 후보 카드 (이미지 + 이름) → 1마리 선택
   - 후보가 1마리면 선택창 없이 자동 해금
   - 선택 시 새 인스턴스 생성 + 도감 등록 + 현재 포켓몬 교체
7. 일반 1세대 도감(전설 5종 제외 146마리) 완성 → 전설 wave 1 자동 진입
8. 전설 wave 1 (프리저·썬더·파이어): 후보 3 → 졸업 시 2 → 졸업 시 1(자동 해금)
9. 전설 wave 2: 뮤츠 단독 (자동 해금)
10. 전설 wave 3: 뮤 단독 (자동 해금)
11. 뮤 졸업 → 엔딩

## 핵심 정책 (정합화 후)

- **단일 보유**: 동시에 1마리만. 중간 교체 불가. 졸업 = 그 인스턴스 종료
- **도감은 누적**: 진화·졸업 라인 전체가 즉시 등록되어 1세대 완성을 향해 누적
- **졸업은 모달**: 별도 라우트 신설하지 않고 학습 화면 위에 모달
- **후보 수는 wave 풀이 정함**
  - 일반 wave: 3마리 (랜덤 미등록 1차 진화체 또는 무진화 종)
  - 전설 wave 1: 풀 크기 (3 → 2 → 1)
  - 전설 wave 2: 1마리 (뮤츠 강제)
  - 전설 wave 3: 1마리 (뮤 강제)
- **풀 크기 = 1 → 자동 해금** (선택창 없음, 안내만 표시 후 새 인스턴스 시작)
- **"후보 부족 시 중복 허용" 룰은 폐기**: 일반 풀이 비면 곧 일반 도감 완성 → wave 1 자동 전환 시점이라 fallback 불필요
- **전설은 일반 wave 후보에서 항상 제외**
- **이브이 정책**
  - 분기 진화 시 쥬피썬더/샤미드/부스터 중 직접 선택
  - 도감 등록은 진화체 단위
  - 도감 미완성 분기가 남아 있는 한 졸업 후보 풀에 이브이가 다시 등장 가능

## 기술 스택

- React 19 + TypeScript + Vite
- Zustand, React Router v7, TanStack React Query
- Radix UI headless (Modal, Dialog, ProgressBar 한정), Tailwind CSS v4
- Supabase (PostgreSQL + Auth + RLS)
- ESLint + Prettier + Husky + lint-staged
- Vitest

## 최적화 방침

- 라우트 단위 `React.lazy` + `Suspense`
- 포켓몬 이미지 `loading="lazy"`
- Zustand selector 단위 구독으로 리렌더 최소화
- 정적 데이터(문제, 종)는 TS 모듈로 빌드 타임 포함
- `React.memo` 는 측정 후 필요 컴포넌트에만 적용
- 도감 그리드는 현재 151개 카드 수준이라 가상화 보류

---

## 진행 상태 요약

- ✅ Phase 1 ~ 8: 완료
- ✅ Phase 9 (진화 모달): 완료
- ✅ Phase B (졸업 모달 + 신규 선택): 완료
- ✅ Phase C (도감의 현재 포켓몬 표시): 완료
- ✅ Phase E (전설 wave + 뮤 엔딩 분기): 구현 완료
- ⚠️ 앱 초기화 / 세션 로드 연결: 이번 태스크에서 정합화
- ⚠️ Phase A, D, F, G: 일부 미완

## 공통 앱 부트스트랩

- [x] 앱 진입 시 `useAuthStore.initialize()` 호출
- [x] 로그인 세션 기준 `useGameStore.loadFromServer()` 호출
- [x] 로그아웃/비로그인 상태에서 게임 스토어 게스트 상태로 초기화
- [x] 랜딩에서 로그인 완료 시 `starterChosen` 상태에 따라 `/starter` 또는 `/learn` 으로 분기
- [x] 스타터 페이지에서 인증/로딩 가드 적용

---

## Phase A. 단일 포켓몬 정책 정합화 (정리 작업)

> 잘못된 다중 보유 가정에서 만든 코드/문서를 제거한다.

- [ ] `App.tsx` 에서 `/pokemon` 라우트 + `MyPokemonPage` lazy import 제거
- [ ] `src/features/pokemon/MyPokemonPage.tsx` 삭제 (현재 더미만 있음)
- [ ] `AGENTS.md` 라우트 화이트리스트에서 `/pokemon` 제거 (모달 정책이라 신규 라우트 추가 없음)
- [ ] `docs/specs/screen-flow.md` 정정
  - [ ] 1번 Screen List 에서 `내 포켓몬 화면` 제거, `신규 포켓몬 선택 모달 또는 페이지` → `졸업 모달`
  - [ ] 6번 `New Pokemon Selection Flow` → `Graduation Flow` 로 재구성, 후보 3마리, 모달 단일화
  - [ ] 7번 Legendary Flow 후보 풀 명시 (wave1: 3 → 2 → 1, wave2: 1, wave3: 1)
  - [ ] 9번 Recommended Navigation 에서 `/pokemon` 제거
  - [ ] 10번 컴포넌트 구조에서 `PokemonSelectionModal` → `GraduationModal`
- [ ] `docs/specs/game-rules.md` 5번 `Pokemon Selection`
  - [ ] 후보 수 2 → 3 으로 갱신
  - [ ] "단일 보유 / 중간 교체 불가" 명시
  - [ ] "신규 포켓몬 선택 UI" → "졸업 모달" 명시
  - [ ] "후보 부족 시 중복 허용" 조항 삭제 (정상 진행 시 발생 불가)
  - [ ] 이브이 동일 종 복수 보유 / 분기 진화 항목 유지
- [ ] `docs/implementation-roadmap.md` 의 신규 선택 모달 언급 정정
- [ ] `README.md` 의 "다음 우선순위" 정정 (`내 포켓몬 화면` 제거)
- [ ] `docs/INDEX.md` 정합화 검토

## Phase B. 졸업 모달 + 후보 선택

> 기획 근거: game-rules.md 4 / 5 / 7, screen-flow.md 5 / 6 / 7

### B.1 후보 생성 로직 (순수)

- [ ] `src/core/candidatePicker.ts` 신설
  - [ ] `pickGraduationCandidates({ unlockedSpeciesIds, graduatedSpeciesIds, legendaryStage, allSpecies })` 시그니처
  - [ ] wave 분기
    - 일반 (`legendaryStage === "none"`): 미등록 일반 1세대 1차 진화체 + 무진화 종 중 랜덤 3마리
    - 전설 wave1 (`legendary-birds`): 미졸업 전설 새 (최대 3, 줄어들수록 풀 그대로 노출)
    - 전설 wave2 (`mewtwo`): 뮤츠 단독
    - 전설 wave3 (`mew`): 뮤 단독
  - [ ] 풀 크기보다 후보 수가 작으면 풀 그대로 반환 (중복 생성 금지)
  - [ ] 풀이 비면 `[]` 반환 (호출자가 wave 트랜지션 트리거)
- [ ] `src/core/__tests__/candidatePicker.test.ts`
  - [ ] 일반 wave: 미등록 우선, 졸업 라인 시작점만 후보
  - [ ] 일반 wave 풀이 0 → 빈 배열 (호출자 책임)
  - [ ] 전설 wave1 풀 크기에 따라 1~3장
  - [ ] 전설 wave2/3 단독
  - [ ] 전설은 일반 wave 후보에서 제외

### B.2 졸업 트리거 로직

- [ ] `process_answer` rpc 결과에 `graduated_now: boolean` 추가
  - 4스탯 모두 100 도달 + 최종 진화 단계 + 미졸업
- [ ] 마이그레이션 `supabase/migrations/007_graduation_trigger.sql`
- [ ] `useGameStore.submitAnswer` 결과 반영
  - [ ] `progression.pendingGraduationInstanceId` 세팅
  - [ ] `pokemon_instances.graduated = true` 동기화
- [ ] `data-structures.md` `ProgressionState` 갱신
  - [ ] `pendingPokemonSelection` 제거
  - [ ] `pendingGraduationInstanceId: string | null` 추가
- [ ] `stores/types.ts` 정합화

### B.3 졸업 모달 (UI)

- [ ] `src/components/pokemon/GraduationModal.tsx` (Radix Dialog 기반)
- [ ] 졸업 정보 영역
  - [ ] 졸업 축하 메시지
  - [ ] 졸업한 포켓몬 일러스트 + 진화 라인 (1차 → 2차 → 최종)
  - [ ] 최종 스탯 4종
- [ ] 후보 선택 영역
  - [ ] 후보 카드 (이미지 + 이름만)
  - [ ] 1마리 선택 → `start_next_pokemon` rpc 호출 → 모달 닫고 학습 재개
- [ ] 학습 화면(`LearnPage`) 에서 `pendingGraduationInstanceId` 감지 시 모달 자동 오픈
- [ ] 모달 외부 클릭/ESC 비활성화 (선택은 필수)

### B.4 신규 인스턴스 시작 RPC

- [ ] `supabase/migrations/008_start_next_pokemon.sql`
  - 입력: `p_species_id`
  - 동작: 후보 검증 → 새 `pokemon_instances` 행 생성 → `trainers.active_pokemon_instance_id` 갱신 → 도감 등록 → `pendingGraduationInstanceId` 해제 → 세션 리셋
- [ ] `useGameStore.startNextPokemon(speciesId)` 액션
  - [ ] rpc 호출 + 클라이언트 상태 동기화
  - [ ] 일반 도감 완성 시 `unlockedLegendaryStage` 트랜지션도 같은 트랜잭션에서 처리

## Phase C. 도감에 현재 포켓몬 표시

> 기획 근거: 사용자 지시 ("도감에 현재 포켓몬 표시가 되어있어야 함")

- [ ] `PokedexPage` 헤더 하단에 현재 포켓몬 카드
  - [ ] 스프라이트 이미지 + 이름
  - [ ] 진화 단계 표기 (예: 2 / 3)
  - [ ] 4스탯 진행도 (`PokemonStats` 재사용)
  - [ ] 진화 대기 / 졸업 대기 뱃지
- [ ] 진화 대기 시 `<Link to="/learn">` 안내
- [ ] 졸업 대기 시 안내 문구 (학습 화면에서 모달 자동 오픈됨을 알림)
- [ ] 프리뷰 페이지 갱신 + 스크린샷 재생성

## Phase D. 1세대 포켓몬 데이터 확장

> 기획 근거: game-rules.md 6 / 7, data-structures.md 4

- [ ] 1세대 species 데이터 작성 (단일 `starters.ts` → `species/` 분리 또는 단일 ts 매니페스트 결정)
  - [ ] 일반 1차 진화체부터 라인 단위 정리
  - [ ] 무진화 종 데이터 (예: 잠만보, 라프라스 등)
  - [ ] 전설 5종 (프리저/썬더/파이어/뮤츠/뮤)
  - [ ] 이브이 분기 진화 (쥬피썬더/샤미드/부스터)
- [ ] `pokemon-index.ts` 매니페스트 또는 `getAllSpecies()` 헬퍼
- [ ] 검증 스크립트 (`scripts/validate-pokemon.mjs`)
  - [ ] dexNumber 1~151 빠짐 없음, 중복 없음
  - [ ] 진화 라인 연결 정합 (양방향)
  - [ ] 분기 진화 데이터 (`branchEvolutionSpeciesIds`) 검증

## Phase E. 전설 wave 진행

> 기획 근거: game-rules.md 7, screen-flow.md 7

- [x] 일반 도감 완성 감지 (`unlockedSpeciesIds` 중 일반 146마리 모두 등록)
  - [x] `progression.unlockedLegendaryStage` 트랜지션 `none` → `legendary-birds`
  - [x] 트랜지션은 `start_next_pokemon` rpc 안에서 처리 (트랜잭션)
- [x] wave1 → wave2: 프리저/썬더/파이어 모두 졸업 → `mewtwo`
- [x] wave2 → wave3: 뮤츠 졸업 → `mew`
- [ ] wave3 종료: 뮤 졸업 → 엔딩 처리 (008 RPC 가 `is_ending: true` 반환만, UI 분기는 별도 PR)
- [ ] `PokedexPage` 전설 해금 단계 배너 (이미 메시지 룩업 있음)
- [ ] `candidatePicker` 가 wave 단계에 따라 후보 풀 변경하는지 통합 테스트

## Phase F. 문제 데이터 확장

> 기획 근거: content-rules.md

- [ ] `ko.javascript.info` 주요 챕터별 문제
  - [ ] JavaScript 기초
  - [ ] 객체 (`object-methods` 외 추가)
  - [ ] 자료구조와 자료형
  - [ ] 함수 심화
  - [ ] 프로토타입과 상속
  - [ ] 클래스
  - [ ] 에러 핸들링
  - [ ] 프라미스와 async/await
  - [ ] 제너레이터와 이터러블
  - [ ] 모듈
- [ ] concept pool 확장 (`this-core` 외)
- [ ] 검증 스크립트 (`scripts/validate-questions.mjs`)
  - [ ] `questionId` 중복 없음
  - [ ] `multiple_choice` 보기 5개 + 정답 포함
  - [ ] `fill_blank` `acceptedAnswers.length >= 1`
  - [ ] `sourceExcerptId` 일관성

## Phase G. 마무리

- [ ] 엔딩 화면 (뮤 졸업 후) — 도감 100% + 졸업 명단
- [ ] 모바일 반응형 검수 (학습/도감/졸업 모달)
- [ ] Lighthouse 성능 점검
- [ ] 빌드 결과물 크기 점검
- [ ] README 업데이트 (현재 구현 범위·다음 우선순위 정합)

---

## 범위 제외 (MVP 이후)

- AI 기반 주관식 자유 서술형 판정
- 자동 문제 생성
- 공개 배포용 운영 기능
- 포켓몬별 개별 스탯 규칙 조정
- 친구 공유 / 멀티플레이
- 도감 카드 클릭 상세 뷰
- 도감 그리드 가상화

---

## 부록 A. 운영 자동화 (구현됨)

- [x] AI 자동 PR 리뷰 (`.github/workflows/pr-review.yml`)
  - [x] AGENTS.md / TODO.md 컨텍스트 주입
  - [x] BLOCK 기준 엄격화 + 점진 확장 사안 제외 규칙
- [x] Playwright 기반 UI 프리뷰 스크린샷 (`scripts/capture-preview.mjs`)
  - [x] 학습 / 진화 / 도감 / 오답 패널 섹션 캡처
- [x] Husky pre-commit (`lint-staged` 로 staged 파일 prettier + eslint --fix)
- [x] Husky pre-push (`build` + `lint` + `test`)

## 부록 B. 정합화 필요 (이번 PR 이후)

- [ ] 위 Phase A 항목 모두 (스펙 + 코드)
- [ ] `MyPokemonPage` / `PartyMemberCard` 코드 자체는 main 에 없음 (PR #18 close 됨) — 추가 정리 불필요
