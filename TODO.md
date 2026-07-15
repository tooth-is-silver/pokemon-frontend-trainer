# Pokemon JS Trainer — 구현 TODO

> 기준 문서: `AGENTS.md`, `docs/specs/game-rules.md`, `docs/specs/screen-flow.md`,
> `docs/specs/content-rules.md`, `docs/specs/data-structures.md`
> 구현 순서 참고: `docs/implementation-roadmap.md`

## 게임 흐름 (정합화 후)

1. 로그인 → 스타터 1마리 선택 (이상해씨/파이리/꼬부기)
2. 학습 화면에서 문제 풀이 → 정답 시 EXP +5 / 재정답 +1
3. EXP 50 이상 → 1차 진화 모달 (진화)
4. EXP 85 이상 → 2차 진화 모달 (3단 진화 종)
5. 졸업 트리거
   - 다단 진화 종: 최종 진화체에서 EXP 100
   - 무진화 종: EXP 50
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
- ✅ 앱 초기화 / 세션 로드 연결: 완료
- ✅ Phase A, C, D, F, G: 완료
- ✅ Phase H (PM/QA 정책 정합화): 완료
- ✅ Capture Phase 1 (지역 화면): 로컬 구현 완료
- 🟡 Capture Phase 2 (탐색/포획 연결): 대기

## Capture Phase 1. 지역 화면

> 포획형 전환의 첫 단계. 배포 없이 로컬 브랜치에서만 진행한다.

- [x] 6개 지역 데이터 정의
  - [x] 새싹 평원
  - [x] 물안개 해안
  - [x] 잿빛 바위산
  - [x] 달그림자 마을
  - [x] 하늘 정원
  - [x] 네온 시티
- [x] 도감 등록 수 기준 지역 해금 조건 정의
- [x] `/regions` 라우트 추가
- [x] 로그인/스타터 선택 이후 기본 진입점을 `/regions`로 변경
- [x] 상단 네비게이션에 `지역` 추가
- [x] 일러스트형 섬 지도 UI 적용
- [x] 데스크톱/모바일 맵 이미지 적용

## Capture Phase 2. 탐색/포획 연결

- [x] 탐색 중 오버레이 표시
- [x] 조우 실패 결과 UI 표시
- [x] 선택한 지역의 `탐색하기` 버튼에 조우 판정 연결
- [x] 조우 성공 결과 UI 표시
- [ ] 조우 성공 시 문제 풀이 진입 연결
- [ ] 몬스터볼 수량과 포획 확률 판정 연결

## 공통 앱 부트스트랩

- [x] 앱 진입 시 `useAuthStore.initialize()` 호출
- [x] 로그인 세션 기준 `useGameStore.loadFromServer()` 호출
- [x] 로그아웃/비로그인 상태에서 게임 스토어 게스트 상태로 초기화
- [x] 랜딩에서 로그인 완료 시 `starterChosen` 상태에 따라 `/starter` 또는 `/learn` 으로 분기
- [x] 스타터 페이지에서 인증/로딩 가드 적용

---

## Phase A. 단일 포켓몬 정책 정합화 (정리 작업)

> 잘못된 다중 보유 가정에서 만든 코드/문서를 제거한다.
> 현재 체크된 항목은 기존 코드와 문서 상태를 재확인해 TODO 상태만 동기화한 것이다.

- [x] `App.tsx` 에서 `/pokemon` 라우트 + `MyPokemonPage` lazy import 제거
- [x] `src/features/pokemon/MyPokemonPage.tsx` 삭제 (현재 더미만 있음)
- [x] `AGENTS.md` 라우트 화이트리스트에서 `/pokemon` 제거 (모달 정책이라 신규 라우트 추가 없음)
- [x] `docs/specs/screen-flow.md` 정정
  - [x] 1번 Screen List 에서 `내 포켓몬 화면` 제거, `신규 포켓몬 선택 모달 또는 페이지` → `졸업 모달`
  - [x] 6번 `New Pokemon Selection Flow` → `Graduation Flow` 로 재구성, 후보 3마리, 모달 단일화
  - [x] 7번 Legendary Flow 후보 풀 명시 (wave1: 3 → 2 → 1, wave2: 1, wave3: 1)
  - [x] 9번 Recommended Navigation 에서 `/pokemon` 제거
  - [x] 10번 컴포넌트 구조에서 `PokemonSelectionModal` → `GraduationModal`
- [x] `docs/specs/game-rules.md` 5번 `Pokemon Selection`
  - [x] 후보 수 2 → 3 으로 갱신
  - [x] "단일 보유 / 중간 교체 불가" 명시
  - [x] "신규 포켓몬 선택 UI" → "졸업 모달" 명시
  - [x] "후보 부족 시 중복 허용" 조항 삭제 (정상 진행 시 발생 불가)
  - [x] 이브이 동일 종 복수 보유 / 분기 진화 항목 유지
- [x] `docs/implementation-roadmap.md` 의 신규 선택 모달 언급 정정
- [x] `README.md` 의 "다음 우선순위" 정정 (`내 포켓몬 화면` 제거)
- [x] `docs/INDEX.md` 정합화 검토

## Phase B. 졸업 모달 + 후보 선택

> 기획 근거: game-rules.md 4 / 5 / 7, screen-flow.md 5 / 6 / 7

### B.1 후보 생성 로직 (순수)

- [x] `src/core/candidatePicker.ts` 신설
  - [x] `pickGraduationCandidates({ unlockedSpeciesIds, graduatedSpeciesIds, legendaryStage, allSpecies })` 시그니처
  - [x] wave 분기
    - 일반 (`legendaryStage === "none"`): 미등록 일반 1세대 1차 진화체 + 무진화 종 중 랜덤 3마리
    - 전설 wave1 (`legendary-birds`): 미졸업 전설 새 (최대 3, 줄어들수록 풀 그대로 노출)
    - 전설 wave2 (`mewtwo`): 뮤츠 단독
    - 전설 wave3 (`mew`): 뮤 단독
  - [x] 풀 크기보다 후보 수가 작으면 풀 그대로 반환 (중복 생성 금지)
  - [x] 풀이 비면 `[]` 반환 (호출자가 wave 트랜지션 트리거)
- [x] `src/core/__tests__/candidatePicker.test.ts`
  - [x] 일반 wave: 미등록 우선, 졸업 라인 시작점만 후보
  - [x] 일반 wave 풀이 0 → 빈 배열 (호출자 책임)
  - [x] 전설 wave1 풀 크기에 따라 1~3장
  - [x] 전설 wave2/3 단독
  - [x] 전설은 일반 wave 후보에서 제외

### B.2 졸업 트리거 로직

- [x] 정답 반영 후 클라이언트에서 졸업 가능 여부 판정
  - EXP 100 도달 + 최종 진화 단계 + 미졸업
- [x] 마이그레이션 `supabase/migrations/007_graduation_flow.sql`
- [x] `useGameStore.submitAnswer` 결과 반영
  - [x] `progression.pendingGraduationInstanceId` 세팅
  - [x] 졸업 완료 마킹은 `start_next_pokemon` RPC에서 트랜잭션 처리
- [x] `data-structures.md` `ProgressionState` 갱신
  - [x] `pendingPokemonSelection` 제거
  - [x] `pendingGraduationInstanceId: string | null` 추가
- [x] `stores/types.ts` 정합화

### B.3 졸업 모달 (UI)

- [x] `src/components/pokemon/GraduationModal.tsx` (Radix Dialog 기반)
- [x] 졸업 정보 영역
  - [x] 졸업 축하 메시지
  - [x] 졸업한 포켓몬 일러스트
  - [x] 진화 라인 (1차 → 2차 → 최종)
  - [x] 최종 EXP
- [x] 후보 선택 영역
  - [x] 후보 카드 (이미지 + 이름만)
  - [x] 1마리 선택 → `start_next_pokemon` rpc 호출 → 모달 닫고 학습 재개
- [x] 학습 화면(`LearnPage`) 에서 `pendingGraduationInstanceId` 감지 시 모달 자동 오픈
- [x] 모달 외부 클릭/ESC 비활성화 (선택은 필수)

### B.4 신규 인스턴스 시작 RPC

- [x] `supabase/migrations/007_graduation_flow.sql` + `008_legendary_wave_transition.sql`
  - 입력: `p_species_id`
  - 동작: 후보 검증 → 새 `pokemon_instances` 행 생성 → `trainers.active_pokemon_instance_id` 갱신 → 도감 등록 → `pendingGraduationInstanceId` 해제 → 세션 리셋
- [x] `useGameStore.startNextPokemon(speciesId)` 액션
  - [x] rpc 호출 + 클라이언트 상태 동기화
  - [x] 일반 도감 완성 시 `unlockedLegendaryStage` 트랜지션도 같은 트랜잭션에서 처리

## Phase C. 도감에 현재 포켓몬 표시

> 기획 근거: 사용자 지시 ("도감에 현재 포켓몬 표시가 되어있어야 함")

- [x] `PokedexPage` 헤더 하단에 현재 포켓몬 카드
  - [x] 스프라이트 이미지 + 이름
  - [x] 진화 단계 표기 (예: 2 / 3)
  - [x] EXP 진행도 (`PokemonExp` 재사용)
  - [x] 진화 대기 뱃지
  - [x] 졸업 대기 뱃지
- [x] 진화 대기 시 `<Link to="/learn">` 안내
- [x] 졸업 대기 시 안내 문구 (학습 화면에서 모달 자동 오픈됨을 알림)
- [x] 로그인 상태 공통 상단바에서 도감 진입점 제공
- [x] 프리뷰 페이지 갱신
- [x] 스크린샷 재생성

## Phase D. 1세대 포켓몬 데이터 확장

> 기획 근거: game-rules.md 6 / 7, data-structures.md 4

- [x] 1세대 species 데이터 작성 (단일 `starters.ts` → `species/` 분리 또는 단일 ts 매니페스트 결정)
  - [x] 일반 1차 진화체부터 라인 단위 정리
  - [x] 무진화 종 데이터 (예: 잠만보, 라프라스 등)
  - [x] 전설 5종 (프리저/썬더/파이어/뮤츠/뮤)
  - [x] 이브이 분기 진화 (쥬피썬더/샤미드/부스터)
- [x] `src/content/pokemon/index.ts` 매니페스트 + 헬퍼
- [x] 검증 스크립트 (`scripts/validate-pokemon.mjs`)
  - [x] dexNumber 1~151 빠짐 없음, 중복 없음
  - [x] 진화 라인 연결 정합 (양방향)
  - [x] 분기 진화 데이터 (`branchEvolutionSpeciesIds`) 검증

## Phase E. 전설 wave 진행

> 기획 근거: game-rules.md 7, screen-flow.md 7

- [x] 일반 도감 완성 감지 (`unlockedSpeciesIds` 중 일반 146마리 모두 등록)
  - [x] `progression.unlockedLegendaryStage` 트랜지션 `none` → `legendary-birds`
  - [x] 트랜지션은 `start_next_pokemon` rpc 안에서 처리 (트랜잭션)
- [x] wave1 → wave2: 프리저/썬더/파이어 모두 졸업 → `mewtwo`
- [x] wave2 → wave3: 뮤츠 졸업 → `mew`
- [x] wave3 종료: 뮤 졸업 → 엔딩 처리 (009 `complete_ending` RPC + LearnPage 자동 분기 + 임시 EndingScreen)
- [x] `PokedexPage` 전설 해금 단계 배너 (4단계 메시지 룩업 + `aria-live` 정합 확인)
- [x] `candidatePicker` 통합 테스트는 단위 테스트 56개로 충분 — wave 분기 / 풀 크기별 수량은 모두 검증됨

## Phase F. 문제 데이터 확장

> 기획 근거: content-rules.md

- [x] `ko.javascript.info` 주요 챕터별 문제
  - [x] JavaScript 기초
  - [x] 객체 (`object-methods` 외 추가)
  - [x] 자료구조와 자료형
  - [x] 함수 심화
  - [x] 프로토타입과 상속
  - [x] 클래스
  - [x] 에러 핸들링
  - [x] 프라미스와 async/await
    - [x] 프라미스 기본 (`promise-basics`)
    - [x] 프라미스 체이닝 (`promise-chaining`)
    - [x] 프라미스 에러 핸들링 (`promise-error-handling`)
    - [x] 프라미스 API (`promise-api`)
    - [x] 프라미스화 (`promisify`)
    - [x] 마이크로태스크 (`microtask-queue`)
    - [x] async와 await (`async-await`)
  - [x] 제너레이터와 이터러블
    - [x] 제너레이터 (`generators`)
    - [x] async 이터레이터와 제너레이터 (`async-iterators-generators`)
  - [x] 모듈
    - [x] 모듈 소개 (`modules-intro`)
    - [x] 모듈 가져오기와 내보내기 (`import-export`)
    - [x] 동적으로 모듈 가져오기 (`modules-dynamic-imports`)
- [x] concept pool 확장 (`this-core` 외)
- [x] 검증 스크립트 (`scripts/validate-questions.mjs`)
  - [x] `questionId` 중복 없음
  - [x] `multiple_choice` 보기 5개 + 정답 포함
  - [x] `fill_blank` `acceptedAnswers.length >= 1`
  - [x] `sourceExcerptId` 일관성

## Phase G. 마무리

- [x] 엔딩 화면 (뮤 졸업 후) — 도감 100% + 졸업 명단
- [x] 모바일 반응형 검수 (학습/도감/졸업 모달)
- [x] README 업데이트 (현재 구현 범위·다음 우선순위 정합)

## Phase H. PM/QA 정책 정합화

- [x] 진화 보류 기능 MVP 제외
- [x] 무진화 포켓몬 졸업 조건을 EXP 50으로 적용
- [x] 전설 wave 후보에서 현재 졸업 중인 포켓몬 제외
- [x] 전설 새 마지막 졸업 → 뮤츠, 뮤츠 졸업 → 뮤 단독 후보 전환
- [x] 후보 1마리 시 선택 모달 없이 자동 해금

---

## 범위 제외 (MVP 이후)

- AI 기반 주관식 자유 서술형 판정
- 자동 문제 생성
- 공개 배포용 운영 기능
- 포켓몬별 개별 성장 규칙 조정
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
- [x] Husky pre-push (`build` + `lint` + `validate:pokemon` + `validate:questions` + `test`)

## 부록 B. 정합화 필요 (완료)

- [x] 위 Phase A 항목 모두 (스펙 + 코드)
- [x] `MyPokemonPage` / `PartyMemberCard` 코드 자체는 main 에 없음 (PR #18 close 됨) — 추가 정리 불필요
