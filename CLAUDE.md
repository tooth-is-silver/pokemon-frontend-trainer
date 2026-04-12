# CLAUDE.md

포켓몬을 키우며 자바스크립트를 공부하는 사이드 프로젝트.
2~3명이 개인화된 상태로 플레이하는 소규모 웹앱이다.

## 행동 원칙

### 불확실하면 멈추고 물어라

- 스펙이 불분명하면 추측해서 구현하지 말고 질문하라
- 모호한 요청은 해석을 2~3가지 제시하고 선택을 받아라
- `docs/specs/` 폴더에 게임 규칙, 데이터 구조, 화면 흐름, 콘텐츠 규칙 스펙이 있다. 관련 기능 작업 전에 반드시 참조하라
- 새 라이브러리를 도입하기 전에 기존 스택으로 해결 가능한지 먼저 확인하라

### 단순하게 작성하라

- 요청된 것만 구현하라. 요청되지 않은 에러 핸들링, 추상화, 유틸리티 함수를 추가하지 마라
- 한 번만 쓰이는 것을 추상화하지 마라
- 설정 가능하게 만들지 마라 — 하드코딩이 맞으면 하드코딩하라

### 요청된 부분만 수정하라

- 요청된 파일/함수만 변경하라. 인접 코드를 "개선"하지 마라
- 관련 없는 리팩토링, 변수명 변경, 주석 추가를 하지 마라
- 데드 코드를 발견하면 삭제하지 말고 보고만 하라

### 성공 기준을 확인하라

- 코드 변경 후 `npm run build` (= `tsc -b && vite build`)가 통과해야 완료다
- lint 에러가 없어야 한다: `npm run lint`
- `src/core/` 아래의 순수 함수는 입출력 예시로 동작을 검증하라

## 기술 스택

- React 19 + TypeScript, Vite 빌드
- Zustand (상태 관리), React Router v7 (라우팅), TanStack React Query (서버 상태 캐싱)
- Radix UI headless (Modal, Dialog, ProgressBar만), Tailwind CSS v4
- Supabase (PostgreSQL + Auth + RLS)
- ESLint + Prettier + Husky (pre-commit)

## 프로젝트 구조

```
src/
  app/          # 라우터, 레이아웃
  components/   # 공통 UI 컴포넌트
  features/     # 페이지별 컴포넌트 (landing, starter, learn, pokedex, pokemon)
  content/      # 정적 데이터 (questions, pokemon JSON)
  core/         # 순수 로직 — React/Supabase 의존 없음 (answerChecker, rewardEngine 등)
  stores/       # Zustand 스토어 (useGameStore, useAuthStore)
  lib/          # Supabase 클라이언트 등 외부 연동
  styles/       # 글로벌 CSS
```

## 핵심 규칙

### 상태 흐름

Supabase(서버) → Zustand(프론트 상태) → React 컴포넌트. 단방향이다.

- 서버 상태 변경은 반드시 `supabase.rpc()` 호출로 처리하라 (직접 insert/update 금지)
- rpc 결과로 프론트 상태를 동기화하라 (`useGameStore` 액션 참고)
- `session` 슬라이스만 프론트 전용이다. 나머지는 서버 데이터를 반영한다

### 스토어

- `useGameStore`에 5개 슬라이스가 있다: trainer, party, pokedex, progression, session
- 새 슬라이스를 임의로 추가하지 마라. 필요하면 먼저 제안하라
- selector로 필요한 상태만 구독하라 (리렌더 최적화)

### 순수 로직 (src/core/)

- React, Supabase 등 외부 의존 없이 순수 함수로 작성하라
- 입력과 출력이 명확해야 한다
- 정답 판정(`answerChecker`), 보상 계산(`rewardEngine`), 문제 로드(`quizLoader`), 보기 생성(`choiceBuilder`), 진화/졸업 판정(`evolutionChecker`)이 여기에 있다

### 스타일링

- Tailwind CSS v4 유틸리티 클래스를 직접 사용하라
- 별도 CSS 파일을 만들지 마라 (글로벌 `styles/index.css` 제외)
- Radix UI는 Modal, Dialog, ProgressBar에만 사용한다. 나머지 UI는 직접 구현하라

### 라우팅

- 모든 페이지는 `React.lazy` + `Suspense`로 코드 스플리팅한다
- 라우트: `/` (랜딩), `/starter` (스타터 선택), `/learn` (학습), `/pokedex` (도감), `/pokemon` (내 포켓몬)

### DB 변경

- 테이블 구조를 변경할 때는 `supabase/migrations/` 에 마이그레이션 SQL 파일을 작성하라
- RLS 정책은 항상 `user_id = auth.uid()` 기준

### import

- path alias `@/`를 사용하라 (`@/stores/types`, `@/core/answerChecker` 등)
- 상대 경로는 같은 폴더 내 파일 간에만 허용한다. 폴더를 넘어가는 import는 `@/`를 사용하라
- 기존 코드에 상대 경로로 된 cross-folder import가 일부 있다. 새 코드에서는 `@/`로 작성하라

## 환경변수

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

`.env` 파일은 커밋하지 않는다.

## 커맨드

- `npm run dev` — 개발 서버
- `npm run build` — 타입 체크 + 빌드
- `npm run lint` — ESLint
- `npm run format` — Prettier 포맷팅
