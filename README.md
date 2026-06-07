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
npm run validate:pokemon
npm run validate:questions
npm test
```

## 문서 기준

- 프로젝트 규칙: `AGENTS.md`
- 도메인 스펙: `docs/specs/*`
- 운영 DB 마이그레이션 절차: `docs/operations/supabase-migrations.md`
- 진행 관리: `TODO.md`
- 구현 순서 참고: `docs/implementation-roadmap.md`
- 초기 기획 배경: `docs/planning-draft.md`

자세한 문서 진입점은 `docs/INDEX.md`를 따른다.

## 현재 구현 범위

- 프로젝트 셋업, 라우팅, 개발 도구 세팅
- Supabase 마이그레이션과 RPC 기반 게임 상태 동기화
- Zustand 스토어와 순수 로직
- 스타터 선택 / 학습 / 진화 / 졸업 / 도감 / 엔딩 화면
- 1세대 포켓몬 151종 데이터와 전설 wave 진행
- `ko.javascript.info` 주요 챕터 기반 문제 데이터 57개 페이지 / 513문항
- 포켓몬/문제 데이터 검증 스크립트와 순수 로직 테스트 통과 기준 유지

실제 진행 상태는 `TODO.md`를 기준으로 본다.

## 다음 우선순위

- 현재 1차 MVP 기준 필수 구현 태스크는 완료
- README / TODO / 스펙 문서 기준으로 후속 개선은 MVP 이후 범위에서 별도 태스크화
- MVP 이후 후보: 주관식 자유 서술형 판정, 자동 문제 생성, 도감 상세 뷰, 친구 공유 / 멀티플레이
