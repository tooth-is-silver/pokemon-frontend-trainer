# Pokemon JS Trainer Planning Draft

이 문서는 프로젝트의 초기 기획 배경과 큰 방향만 정리한 초안이다.
구현 기준 문서로 사용하지 않는다.

실제 구현 시 우선순위:

1. `AGENTS.md`
2. `docs/specs/*`
3. `TODO.md`
4. `docs/implementation-roadmap.md`
5. 이 문서

## Goal

- `ko.javascript.info` 기반으로 자바스크립트 코어 학습 퀴즈를 제공한다.
- 사용자는 문제를 풀며 포켓몬을 육성하고, 진화와 도감 수집을 진행한다.
- 초기 목적은 개인용 + 제한적 공유다.

## Core Principles

- 답변과 해설은 반드시 `ko.javascript.info` 근거가 있어야 한다.
- 근거가 없으면 추측하지 않는다.
- 학습 엔진과 포켓몬 테마는 분리한다.
- 게임 요소는 학습을 보조해야 하고, 보상을 남발하지 않는다.

## MVP Direction

- 문제 유형: `yes_no`, `multiple_choice`, `fill_blank`
- 스타터: 이상해씨, 파이리, 꼬부기
- 학습 화면에서 문제 1개씩 풀이
- 정답 시 스탯 반영, 진화/도감/선택 플로우 연결
- 장기적으로 1세대 도감 확장

## Architecture Direction

- 도메인 규칙은 `docs/specs/*`를 기준으로 구현한다.
- 구현 순서는 `docs/implementation-roadmap.md`를 기준으로 본다.
- 진행 체크는 `TODO.md`를 기준으로 본다.

## Open Decisions

- 아이템 종류와 획득 확률 상세
- 친구 공유 범위
- 포켓몬별 개별 스탯 규칙 조정
- 오답 보기 개념군 세분화
- 전설 포켓몬 해금/선택/졸업 조건 상세
