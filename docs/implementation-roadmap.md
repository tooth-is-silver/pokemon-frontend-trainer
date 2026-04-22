# Implementation Roadmap

## 1. Purpose

이 문서는 구현 순서를 정의한다.  
목표는 다른 모델이나 개발자가 바로 작업을 시작할 수 있게 하는 것이다.

작업 시작 전 확인 순서: `docs/INDEX.md` → `docs/specs/*` → `TODO.md`.

읽기 기준:

- 전체 라우팅: `docs/INDEX.md`
- 데이터 구조: `docs/specs/data-structures.md`
- 게임 규칙: `docs/specs/game-rules.md`
- 콘텐츠 규칙: `docs/specs/content-rules.md`
- 화면 흐름: `docs/specs/screen-flow.md`

## 2. MVP Build Order

권장 순서:

1. 프로젝트 기본 구조 생성
2. 콘텐츠 데이터 구조 생성
3. 포켓몬 데이터 구조 생성
4. 상태 관리 구조 생성
5. 학습 화면 구현
6. 정답 판정 로직 구현
7. 스탯/진화/졸업 로직 구현
8. 신규 포켓몬 선택 로직 구현
9. 도감 화면 구현
10. 데이터 검증 및 시드 추가

## 3. Phase 1: Project Setup

해야 할 일:

- 프론트엔드 프레임워크 구조 결정
- `src` 디렉터리 구성
- 라우팅 구성
- 전역 상태 저장 방식 결정
- 기본 스타일 시스템 결정

추천 초기 폴더:

```text
src/
  app/
  components/
  content/
  core/
  features/
  lib/
  styles/
```

## 4. Phase 2: Static Content Layer

해야 할 일:

- `docs/specs/data-structures.md` 기준으로 문제/포켓몬 데이터 구조 생성
- 스타터 3마리 데이터 우선 작성
- 첫 학습 페이지용 문제 데이터 우선 작성

최소 필요 파일:

```text
src/content/questions/by-page/object-methods.ts
src/content/pokemon/starters.ts
```

## 5. Phase 3: State Layer

해야 할 일:

- `docs/specs/data-structures.md` 기반 타입 정의
- 초기 상태 생성기 작성
- 로컬 저장소 연동
- selector 함수 정의

필수 기능:

- 스타터 선택 저장
- 현재 포켓몬 저장
- 도감 등록 저장
- 연속 정답 수 저장
- 문제 풀이 기록 저장

## 6. Phase 4: Quiz Engine

해야 할 일:

- 문제 로더 구현
- 문제 타입별 렌더러 구현
- 정답 판정 함수 구현
- 빈칸 답 정규화 함수 구현
- 오지선다 보기 생성 함수 구현

필수 함수 예시:

```ts
loadQuestionsBySource(sourceId: string)
getNextQuestion()
checkAnswer(question, userAnswer)
normalizeAnswer(input: string)
buildMultipleChoiceOptions(question, conceptPool)
```

## 7. Phase 5: Learning Loop

해야 할 일:

- 학습 화면 구현
- 정답 시 스탯 즉시 갱신
- 오답 시 하단 해설 표시
- 다음 문제 이동
- 활성 포켓몬 반영

필수 UI:

- 포켓몬 카드
- 스탯 바
- 문제 카드
- 답변 입력/선택 UI
- 하단 해설 영역

## 8. Phase 6: Progression Engine

해야 할 일:

- 첫 정답 `+5` 반영
- 중복 정답 `+1` 반영
- 연속 정답 10개 시 열매 지급
- 열매 즉시 적용
- 진화 가능 여부 계산
- 졸업 가능 여부 계산
- 신규 포켓몬 선택 가능 여부 계산

핵심 함수 예시:

```ts
applyCorrectAnswerReward();
applyRepeatAnswerReward();
applyBerryReward();
isEvolutionReady(instance);
isGraduationReady(instance);
shouldOpenPokemonSelection(state);
```

## 9. Phase 7: Evolution and Selection

해야 할 일:

- 진화 모달 또는 페이지 구현
- 진화 수락/보류 처리
- 신규 포켓몬 선택 후보 2마리 생성
- 선택 후 새 인스턴스 생성

필수 규칙:

- 미등록 일반 포켓몬 우선
- 후보 부족 시에만 중복 허용
- 전설 포켓몬은 별도 wave 규칙 적용

## 10. Phase 8: Pokedex

해야 할 일:

- 도감 화면 구현
- 획득/미획득 표시
- 진화체 등록 반영
- 전설 해금 상태 반영

## 11. Phase 9: Validation

해야 할 일:

- 문제 데이터 모듈 검증 스크립트
- 포켓몬 데이터 모듈 검증 스크립트
- 중복 키 검사
- 잘못된 진화 라인 검사
- 보기 5개 규칙 검사

## 12. First Deliverable Recommendation

가장 먼저 완성할 최소 흐름:

1. 스타터 선택
2. 문제 1개 표시
3. 정답 판정
4. 스탯 증가
5. 진화 조건 표시

이 최소 흐름이 되면 그 다음부터 확장하기 쉽다.

## 13. Suggested Work Split

### Track A: Data

- 문제 데이터
- 포켓몬 데이터
- concept pool

### Track B: Core Logic

- 정답 판정
- 보상 반영
- 진화 계산
- 선택 후보 계산

### Track C: UI

- 스타터 화면
- 학습 화면
- 진화 모달
- 도감 화면

## 14. Out of Scope for MVP

- AI 기반 주관식 판정
- 자동 문제 생성
- 서버 기반 계정 시스템
- 공개 배포용 운영 기능
