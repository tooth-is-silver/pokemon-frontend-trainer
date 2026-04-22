# pokemon-js-trainer

포켓몬을 키우며 자바스크립트 코어 공부하기

## 개요

- `ko.javascript.info` 기반 문제를 풀며 포켓몬을 육성하는 학습용 웹앱
- 프론트는 React + TypeScript + Zustand
- 백엔드는 Supabase Auth + PostgreSQL + RLS

## 실행

필수 환경변수:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

주요 명령어:

```bash
npm run dev
npm run build
npm run lint
npm test
```

## 문서 기준

- 프로젝트 규칙: `AGENTS.md`
- 도메인 스펙: `docs/specs/*`
- 진행 관리: `TODO.md`
- 구현 순서 참고: `docs/implementation-roadmap.md`
- 초기 기획 배경: `docs/planning-draft.md`

자세한 문서 진입점은 `docs/INDEX.md`를 따른다.

## 현재 구현 범위

- 프로젝트 셋업, 라우팅, 개발 도구 세팅
- Supabase 마이그레이션과 RPC 초안
- Zustand 스토어와 순수 로직 일부
- 스타터 선택 화면
- 순수 로직 테스트 통과 기준 유지

실제 진행 상태는 `TODO.md`를 기준으로 본다.

## 다음 우선순위

- 앱 초기화 / 인증 연결
- 학습 화면 최소 루프 구현
- 도감 / 내 포켓몬 화면 구현
