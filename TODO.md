# Pokemon JS Trainer — 구현 TODO

> React 기반 MVP 구현 태스크 리스트  
> 참조: `docs/implementation-roadmap.md`, `docs/specs/*`

## 기술 스택

- **Framework**: React 19 + TypeScript
- **Build**: Vite
- **Routing**: React Router v7
- **State**: Zustand (프론트 상태 관리)
- **Backend/DB**: Supabase (PostgreSQL, Auth, RLS)
- **UI Components**: Radix UI (headless) — 모달, 버튼 등 공통 컴포넌트
- **Styling**: Tailwind CSS v4
- **Lint/Format**: ESLint + Prettier

## 최적화 방침

- 라우트 단위 `React.lazy` + `Suspense` 코드 스플리팅
- 포켓몬 이미지 lazy loading (`loading="lazy"`)
- Zustand selector로 불필요한 리렌더 방지
- 문제/포켓몬 JSON은 static import (빌드 타임 포함)
- `React.memo` 는 측정 후 필요한 컴포넌트에만 적용
- 도감 그리드는 `CSS contain` + 가상화 검토 (151마리 수준이면 불필요할 수 있음)

---

## Phase 1. 프로젝트 셋업

- [x] Vite + React + TypeScript 프로젝트 생성
- [x] Tailwind CSS v4 설치 및 설정
- [x] ESLint + Prettier 설정
- [x] `src/` 디렉토리 구조 생성
  ```
  src/
    app/          # 라우터, 레이아웃
    components/   # 공통 UI
    features/     # 기능별 컴포넌트 (quiz, pokemon, pokedex)
    content/      # 정적 데이터 (questions, pokemon, sources)
    core/         # 순수 로직 (판정, 보상, 진화 계산)
    stores/       # Zustand 스토어
    lib/          # 유틸리티
    styles/       # 글로벌 스타일
  ```
- [x] React Router 라우트 구성 (`/starter`, `/learn`, `/pokedex`, `/pokemon`)
- [x] 라우트별 `React.lazy` + `Suspense` 적용
- [ ] 기본 레이아웃 컴포넌트 생성

## Phase 2. 정적 데이터 레이어

- [ ] `source-index.json` 작성 (ko.javascript.info 페이지 목록)
- [x] 문제 JSON 작성 — 최소 1개 페이지분 (`object-methods`)
  - [x] `yes_no` 문제 3개 이상
  - [x] `multiple_choice` 문제 3개 이상 (보기 5개 검증)
  - [x] `fill_blank` 문제 3개 이상 (acceptedAnswers 포함)
- [ ] `question-index.json` 작성
- [x] concept pool JSON 작성 (`this-core` 등)
- [x] 스타터 3마리 포켓몬 종 데이터 작성
  - [x] `bulbasaur.json` (이상해씨 → 이상해풀 → 이상해꽃)
  - [x] `charmander.json` (파이리 → 리자드 → 리자몽)
  - [x] `squirtle.json` (꼬부기 → 어니부기 → 거북왕)
- [ ] `pokemon-index.json` 작성
- [ ] 전설 포켓몬 wave 데이터 작성 (`legendary-order.json`)
- [x] 포켓몬 이미지 에셋 준비 (스타터 라인 우선)
- [ ] JSON 검증 스크립트 작성 (questionId 중복, choices 5개, answer 포함 등)

## Phase 3. Supabase 셋업 및 DB 스키마

- [ ] Supabase 프로젝트 생성
- [x] 테이블 생성 (마이그레이션 SQL)
  - [x] `trainers` — user_id, starter_chosen, active_pokemon_instance_id, created_at
  - [x] `pokemon_instances` — id, user_id, species_id, current_stage, hp, attack, defense, speed, total_correct_count, graduated, evolution_pending, created_at
  - [x] `pokedex_entries` — user_id, species_id, unlocked_at
  - [x] `solved_questions` — user_id, question_id, correct, solved_at
  - [x] `progression` — user_id, streak_correct_count, pending_pokemon_selection, pending_evolution_instance_id, unlocked_legendary_stage
- [x] RLS 정책 설정 (각 테이블 `user_id = auth.uid()`)
- [x] `process_answer` rpc 함수 작성 (정답 처리 트랜잭션)
  - [x] 스탯 증가 (첫 정답 +5 / 재정답 +1)
  - [x] 풀이 기록 삽입
  - [x] 연속 정답 수 갱신
  - [x] 열매 지급 조건 체크 및 적용
  - [x] 진화 가능 여부 플래그 갱신
  - [ ] 졸업 가능 여부 플래그 갱신
- [ ] Supabase Auth 설정 (OAuth — Google 등)
- [x] 프론트에 `@supabase/supabase-js` 설치 및 클라이언트 초기화

## Phase 4. 상태 관리 레이어

- [x] Zustand 설치
- [x] `useGameStore` 루트 스토어 생성
  - [x] `trainer` 슬라이스 (starterChosen, activePokemonInstanceId)
  - [x] `party` 슬라이스 (instances: PokemonInstance[])
  - [x] `pokedex` 슬라이스 (unlockedSpeciesIds, normalPokedexCompleted 등)
  - [x] `progression` 슬라이스 (streakCorrectCount, pendingEvolution 등)
  - [ ] `session` 슬라이스 (currentSourceId, currentQuestionId 등)
- [x] TypeScript 타입 정의 (`data-structures.md` 기준)
- [x] Supabase ↔ Zustand 동기화 레이어 구현
  - [ ] 로그인 시 서버에서 상태 로드 → Zustand 초기화
  - [x] 상태 변경 시 Supabase에 저장 (rpc 호출)
- [x] selector 함수 정의 (리렌더 최적화용)

## Phase 5. 퀴즈 엔진 (순수 로직)

- [x] `loadQuestionsBySource(sourceId)` — 페이지별 문제 로드
- [x] `getNextQuestion(solvedIds, sourceId)` — 다음 문제 선택
- [x] `checkAnswer(question, userAnswer)` — 정답 판정
  - [x] `yes_no`: boolean 비교
  - [x] `multiple_choice`: 문자열 일치
  - [x] `fill_blank`: trim + 소문자 변환 후 acceptedAnswers 배열 비교
- [x] `normalizeAnswer(input)` — 입력 정규화 (trim, lowercase, 공백 정리)
- [x] `buildMultipleChoiceOptions(question, conceptPool)` — 오답 보기 생성
  - [x] 같은 conceptGroup 내에서 추출
  - [x] 정답 포함 5개 셔플

## Phase 5.5. 테스트 프레임워크 셋업 및 순수 로직 테스트

- [x] Vitest 설치 및 설정
- [x] npm scripts 추가 (`test`, `test:watch`)
- [x] `src/core/answerChecker` 테스트
  - [x] yes_no: true/false 판정
  - [x] multiple_choice: 정규화 후 일치
  - [x] fill_blank: acceptedAnswers 매칭, 대소문자/공백 무관
  - [ ] default: 알 수 없는 타입 → false
- [x] `src/core/quizLoader` 테스트
  - [x] 안 푼 문제 우선 출제
  - [x] 전부 풀면 재출제
  - [x] 현재 문제 중복 방지
  - [x] 문제 1개뿐이면 null
- [x] `src/core/choiceBuilder` 테스트
  - [x] 보기에 정답 포함
  - [x] 기존 보기 5개면 셔플만
- [x] `src/core/rewardEngine` 테스트
  - [x] 첫 정답 +5, 재정답 +1
  - [x] 스탯 100 캡
  - [x] 연속 10개 열매 지급, 오답 시 리셋
  - [x] 열매 적용 스탯 +5
- [x] `src/core/evolutionChecker` 테스트
  - [x] 3단 진화: 49/50, 84/85 경계
  - [x] 졸업: 99/100 경계
  - [x] 무진화 포켓몬: graduated 없이 50+ 선택 가능
  - [x] 오답 시 선택 UI 안 열림

## Phase 6. 학습 화면

- [ ] `/learn` 페이지 컴포넌트
- [ ] `PokemonCard` — 현재 포켓몬 이미지 + 이름
- [ ] `PokemonStats` — 4스탯 프로그레스 바
- [ ] `QuizCard` — 문제 표시 래퍼
- [ ] `YesNoQuestion` — 예/아니오 버튼 UI
- [ ] `MultipleChoiceQuestion` — 5개 보기 UI
- [ ] `FillBlankQuestion` — 입력창 UI
- [ ] `WrongAnswerPanel` — 오답 시 하단 해설 (정답, 해설, 출처 링크)
- [ ] 정답 시 스탯 즉시 갱신 애니메이션
- [ ] 다음 문제 자동 이동

## Phase 7. 보상/진행 엔진 (순수 로직)

- [ ] `applyCorrectAnswerReward(instance, questionId, solvedIds)` — 첫 정답 +5 / 재정답 +1
- [ ] `updateStreak(streak, isCorrect)` — 연속 정답 관리
- [ ] `checkBerryReward(streak)` — 연속 10개 달성 시 열매 지급
- [ ] `applyBerry(instance)` — 랜덤 열매 즉시 적용 (스탯 +5)
- [ ] `isEvolutionReady(instance, speciesData)` — 진화 가능 여부
- [ ] `isGraduationReady(instance, speciesData)` — 졸업 가능 여부
- [ ] `shouldOpenPokemonSelection(state)` — 신규 포켓몬 선택 트리거

## Phase 8. 스타터 선택 화면

- [x] `/starter` 페이지 컴포넌트
- [x] 이상해씨 / 파이리 / 꼬부기 카드 3개 표시
- [x] 선택 시 첫 PokemonInstance 생성
- [x] 도감 등록
- [x] `/learn`으로 이동
- [x] 이미 선택한 경우 `/learn`으로 리다이렉트

## Phase 9. 진화 및 신규 포켓몬 선택

- [ ] `EvolutionModal` — 진화 연출 모달
  - [ ] 진화 전/후 이미지 표시
  - [ ] "진화한다" / "보류" 선택
  - [ ] 진화 시 species 데이터 갱신 + 도감 등록
- [ ] `PokemonSelectionModal` — 신규 포켓몬 선택 모달
  - [ ] `generateCandidates(pokedex, 2)` — 미등록 일반 포켓몬 중 랜덤 2마리
  - [ ] 전설 포켓몬 제외 규칙 적용
  - [ ] 후보 부족 시 중복 허용
  - [ ] 선택 후 새 instance 생성 + 도감 등록 + active 전환

## Phase 10. 도감 화면

- [ ] `/pokedex` 페이지 컴포넌트
- [ ] `PokedexGrid` — 1세대 151마리 그리드
- [ ] `PokedexCard` — 획득/미획득 표시, 이미지 or 실루엣
- [ ] 전설 해금 상태 표시
- [ ] 일반 도감 완성률 표시

## Phase 11. 내 포켓몬 화면

- [ ] `/pokemon` 페이지 컴포넌트
- [ ] 현재 파티 포켓몬 목록
- [ ] 각 포켓몬 스탯, 진화 단계, 졸업 여부 표시
- [ ] active 포켓몬 전환 기능

## Phase 12. 전설 포켓몬 플로우

- [ ] 일반 도감 완성 감지
- [ ] 전설 wave 1 해금 (프리저/썬더/파이어)
- [ ] wave 1 전원 졸업 → 뮤츠 해금
- [ ] 뮤츠 졸업 → 뮤 해금

## Phase 13. 1세대 포켓몬 데이터 확장

- [ ] 1세대 151마리 종 데이터 JSON 작성
- [ ] 진화 라인 연결 검증
- [ ] 이미지 에셋 전체 준비
- [ ] 이브이 분기 진화 처리

## Phase 14. 문제 데이터 확장

- [ ] ko.javascript.info 주요 챕터별 문제 작성
  - [ ] JavaScript 기초
  - [ ] 객체
  - [ ] 자료구조와 자료형
  - [ ] 함수 심화
  - [ ] 프로토타입과 상속
  - [ ] 클래스
  - [ ] 에러 핸들링
  - [ ] 프라미스와 async/await
  - [ ] 제너레이터와 이터러블
  - [ ] 모듈
- [ ] concept pool 확장
- [ ] JSON 검증 스크립트 전체 통과 확인

## Phase 15. 마무리 및 검증

- [ ] 전체 플로우 E2E 테스트 (스타터 → 학습 → 진화 → 졸업 → 신규 선택)
- [ ] 모바일 반응형 대응
- [ ] Lighthouse 성능 점검
- [ ] 빌드 결과물 크기 점검
- [ ] README 업데이트

---

## 범위 제외 (MVP 이후)

- AI 기반 주관식 판정
- 자동 문제 생성
- 공개 배포용 운영 기능
- 포켓몬별 개별 스탯 규칙 조정
