# pokemon-frontend-trainer — Agent Configuration

포켓몬을 키우며 자바스크립트를 공부하는 사이드 프로젝트.
2~3명이 개인화된 상태로 플레이하는 소규모 웹앱이다.

> 작업 시작 전: `docs/INDEX.md`, `docs/specs/` 아래 관련 스펙을 먼저 확인한다.

## 행동 원칙

### 불확실하면 멈추고 물어라

- 스펙이 불분명하면 추측해서 구현하지 않는다.
- 모호한 요청은 해석을 2~3가지로 좁혀 확인한다.
- 관련 기능 작업 전에 `docs/specs/`의 게임 규칙, 데이터 구조, 화면 흐름, 콘텐츠 규칙을 참조한다.
- 새 라이브러리 도입 전 기존 스택으로 해결 가능한지 먼저 확인한다.

### 단순하게 작성하라

- 요청된 것만 구현한다.
- 요청되지 않은 에러 핸들링, 추상화, 유틸리티 함수는 추가하지 않는다.
- 한 번만 쓰이는 로직은 추상화하지 않는다.
- 설정 가능성보다 단순한 하드코딩이 맞으면 하드코딩을 선택한다.

### 요청된 부분만 수정하라

- 요청된 파일과 함수만 수정한다.
- 인접 코드를 개선 목적으로 건드리지 않는다.
- 관련 없는 리팩토링, 변수명 변경, 주석 추가를 하지 않는다.
- 데드 코드는 삭제하지 말고 보고만 한다.

### 성공 기준을 확인하라

- 코드 변경 후 `npm run build`가 통과해야 한다.
- `npm run lint`가 통과해야 한다.
- `src/core/` 아래 순수 함수는 입출력 기준으로 검증한다.

## 기술 스택

- React 19 + TypeScript + Vite
- Zustand, React Router v7, TanStack React Query
- Radix UI headless, Tailwind CSS v4
- Supabase (PostgreSQL + Auth + RLS)
- ESLint + Prettier + Husky

## 프로젝트 구조

```text
src/
  app/          # 라우터, 레이아웃
  components/   # 공통 UI 컴포넌트
  features/     # 페이지별 컴포넌트 (landing, starter, learn, pokedex, pokemon)
  content/      # 정적 데이터
  core/         # 순수 로직
  stores/       # Zustand 스토어
  lib/          # Supabase 클라이언트 등 외부 연동
  styles/       # 글로벌 CSS
```

## 핵심 규칙

### 상태 흐름

- 상태 흐름은 `Supabase -> Zustand -> React` 단방향이다.
- 서버 상태 변경은 반드시 `supabase.rpc()`로 처리한다.
- rpc 결과로 프론트 상태를 동기화한다.
- `session` 슬라이스만 프론트 전용이다.

### 스토어

- `useGameStore`의 슬라이스는 `trainer`, `party`, `pokedex`, `progression`, `session`만 사용한다.
- 새 슬라이스는 임의로 추가하지 않는다.
- 필요한 상태만 selector로 구독한다.

### 순수 로직

- `src/core/`는 React, Supabase 등 외부 의존 없이 작성한다.
- 입력과 출력이 명확해야 한다.
- 정답 판정, 보상 계산, 문제 로드, 보기 생성, 진화/졸업 판정 로직은 이 폴더에 둔다.

### 스타일링

- Tailwind CSS v4 유틸리티를 직접 사용한다.
- 별도 CSS 파일은 만들지 않는다. 예외는 글로벌 `src/styles/index.css`.
- Radix UI는 Modal, Dialog, ProgressBar 정도로 제한한다.

### 라우팅

- 모든 페이지는 `React.lazy` + `Suspense`를 사용한다.
- 라우트는 `/`, `/starter`, `/learn`, `/pokedex`, `/pokemon`.

### DB 변경

- DB 구조 변경 시 `supabase/migrations/`에 SQL 마이그레이션을 추가한다.
- RLS 정책은 `user_id = auth.uid()` 기준을 유지한다.

### Import

- 폴더를 넘는 import는 `@/` path alias를 사용한다.
- 같은 폴더 내 파일 간에만 상대 경로를 허용한다.

## 환경변수

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

- `.env` 파일은 커밋하지 않는다.

## 커맨드

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run format`
