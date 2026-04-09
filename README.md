# pokemon-js-trainer
포켓몬을 키우며 자바스크립트 코어 공부하기

## 기술 스택

| 영역 | 선택 | 비고 |
|------|------|------|
| Framework | React 19 + TypeScript | Vite 빌드 |
| State | Zustand | 프론트 상태 관리, 서버 동기화 레이어와 분리 |
| UI 컴포넌트 | Radix UI (headless) | 모달, 버튼 등 공통 컴포넌트용 |
| Styling | Tailwind CSS v4 | Radix 위에 직접 스타일링 |
| Routing | React Router v7 | lazy + Suspense 코드 스플리팅 |
| Backend/DB | Supabase (PostgreSQL) | 인증 + 정규화 테이블 + RLS |
| Auth | Supabase Auth (OAuth) | Google 등 소셜 로그인 |
| Lint | ESLint + Prettier | |

## 기술 결정 기록

### 상태 관리: Zustand (vs Jotai)

Jotai와 비교 검토 후 Zustand을 선택했다.

- 게임 상태(trainer/party/pokedex/progression/session)가 하나의 트리로 묶여야 하므로, atom 단위보다 단일 스토어 구조가 자연스럽다
- 진화 판정, 보상 계산 등 순수 로직에서 여러 상태를 동시에 읽어야 할 때 `getState()`로 React 외부 접근이 바로 된다

### UI: Radix UI + Tailwind (vs shadcn/ui)

shadcn/ui 대신 Radix를 직접 사용하기로 했다.

- 포켓몬 테마 특성상 shadcn의 기본 디자인을 결국 전부 갈아엎어야 하므로, headless인 Radix에서 동작 로직(a11y, 키보드, 포커스)만 가져오고 직접 스타일링하는 것이 낫다
- Radix가 필요한 컴포넌트는 Modal, Dialog, ProgressBar 등 소수이고, 나머지(PokemonCard, QuizCard, PokedexGrid)는 커스텀 컴포넌트로 구현한다

### 서버/DB: Supabase + 정규화 (vs JSON 통째로 저장)

- 모바일에서도 사용하고 2~3명이 개인화된 상태로 플레이하므로 서버 저장 필수
- 정답 1회마다 스탯/풀이기록/연속정답/진화/도감이 즉시 반영되어야 하므로, 각 데이터를 정규화된 테이블로 분리
- 정답 처리 시 여러 테이블 업데이트를 Supabase `rpc` (PostgreSQL 함수)로 트랜잭션 처리하여 API 호출 1회로 통합
- RLS(Row Level Security)로 유저별 데이터 격리

### DB 테이블 구조

```
users (Supabase Auth)
├── trainers (1:1) — starter_chosen, active_pokemon_instance_id
├── pokemon_instances (1:N) — species_id, stage, hp/atk/def/spd, graduated
├── pokedex_entries (1:N) — species_id, unlocked_at
├── solved_questions (1:N) — question_id, correct, solved_at
└── progression (1:1) — streak, pending_selection, pending_evolution, legendary_stage
```

### 정답 처리 트랜잭션 (rpc 함수 1회 호출)

1. `pokemon_instances` — 스탯 증가
2. `solved_questions` — 풀이 기록 삽입
3. `progression` — 연속 정답 수 갱신
4. (조건부) 열매 효과 적용, 진화 처리, 도감 등록
