# Data Structures

## 1. Purpose

이 문서는 현재 코드 기준의 데이터 구조를 정리한다.
구현 시 이 문서와 실제 타입 정의를 함께 본다.

기준 파일:

- `src/content/questions/types.ts`
- `src/content/pokemon/types.ts`
- `src/stores/types.ts`

## 2. Directory Layout

```text
src/
  app/
  content/
    pokemon/
    questions/
  core/
  features/
  lib/
  stores/
  styles/
```

현재 구현 기준으로는 JSON 파일 중심 구조보다 TypeScript 모듈 기반 정적 데이터 구조를 먼저 사용한다.

## 3. Question Data

### 3.1 Question Page

```ts
type QuestionPage = {
  sourceId: string;
  title: string;
  url: string;
  questions: Question[];
};
```

예시:

```ts
{
  sourceId: "object-methods",
  title: "메서드와 this",
  url: "https://ko.javascript.info/object-methods",
  questions: [...]
}
```

### 3.2 Question Types

```ts
type QuestionType = "yes_no" | "multiple_choice" | "fill_blank";

type QuestionBase = {
  questionId: string;
  type: QuestionType;
  prompt: string;
  answer: string | boolean;
  conceptGroup: string;
  explanation: string;
  sourceExcerptId: string;
};
```

```ts
type YesNoQuestion = QuestionBase & {
  type: "yes_no";
  answer: boolean;
  acceptedAnswers?: string[];
};
```

```ts
type MultipleChoiceQuestion = QuestionBase & {
  type: "multiple_choice";
  answer: string;
  choices: string[];
};
```

```ts
type FillBlankQuestion = QuestionBase & {
  type: "fill_blank";
  answer: string;
  acceptedAnswers: string[];
};
```

```ts
type Question = YesNoQuestion | MultipleChoiceQuestion | FillBlankQuestion;
```

### 3.3 Concept Pool

현재 구현은 문자열 배열 기반 concept pool을 사용한다.

```ts
type ConceptPools = Record<string, string[]>;
```

예시:

```ts
{
  "this-core": ["this", "렉시컬 환경", "클로저", "프로토타입", "스코프", "생성자 함수"]
}
```

### 3.4 Validation Rules

- `questionId` 중복 금지
- `multiple_choice`는 보기 5개 유지
- `multiple_choice.answer`는 보기 안에 포함
- `fill_blank.acceptedAnswers.length >= 1`
- `sourceId`, `conceptGroup`, `sourceExcerptId`는 일관되게 유지

## 4. Pokemon Data

### 4.1 Species Type

```ts
type PokemonSpecies = {
  speciesId: string;
  dexNumber: number;
  nameKo: string;
  nameEn: string;
  category: "normal" | "legendary";
  isStarter: boolean;
  evolutionStage: number;
  evolutionLine: string[];
  nextEvolutionSpeciesId: string | null;
  branchEvolutionSpeciesIds: string[];
};
```

예시:

```ts
{
  speciesId: "charmander",
  dexNumber: 4,
  nameKo: "파이리",
  nameEn: "Charmander",
  category: "normal",
  isStarter: true,
  evolutionStage: 1,
  evolutionLine: ["charmander", "charmeleon", "charizard"],
  nextEvolutionSpeciesId: "charmeleon",
  branchEvolutionSpeciesIds: []
}
```

### 4.2 Sprite Rule

스프라이트 경로는 종 데이터에 직접 저장하지 않고 `dexNumber`로 계산한다.

```ts
getSpriteUrl(dexNumber: number) => `/sprites/${dexNumber}.png`
```

## 5. Region Data

```ts
type Region = {
  regionId: string;
  nameKo: string;
  terrainLabel: string;
  description: string;
  unlockRequiredPokedexCount: number;
  encounterRatePercent: number;
  habitatSummary: string;
  accentClassName: string;
};
```

- 지역 해금은 현재 도감 등록 수(`pokedex.unlockedSpeciesIds.length`)로 계산한다.
- 지역 데이터는 `src/content/regions/index.ts`에서 관리한다.
- 현재 단계에서는 DB에 지역 선택 상태를 저장하지 않는다.

## 6. Game State

### 6.1 Root State

```ts
type AppState = {
  trainer: TrainerState;
  party: PartyState;
  pokedex: PokedexState;
  progression: ProgressionState;
  session: SessionState;
};
```

### 6.2 Trainer

```ts
type TrainerState = {
  starterChosen: boolean;
  activePokemonInstanceId: string | null;
};
```

### 6.3 Party

```ts
type PokemonInstance = {
  instanceId: string;
  speciesId: string;
  currentStage: number;
  exp: number;
  totalCorrectCount: number;
  graduated: boolean;
  evolutionPending: boolean;
};
```

```ts
type PartyState = {
  instances: PokemonInstance[];
};
```

### 6.4 Pokedex

```ts
type PokedexState = {
  unlockedSpeciesIds: string[];
  normalPokedexCompleted: boolean;
};
```

### 6.5 Progression

```ts
type ProgressionState = {
  streakCorrectCount: number;
  pendingEvolutionInstanceId: string | null;
  pendingGraduationInstanceId: string | null;
  unlockedLegendaryStage: "none" | "legendary-birds" | "mewtwo" | "mew";
  isEnding: boolean;
};
```

- `pendingGraduationInstanceId` 가 세팅되면 학습 화면이 졸업 모달을 띄운다. 뮤 졸업 시점에는 모달 대신 엔딩 화면으로 분기한다.
- `isEnding` 은 `complete_ending` RPC 가 갱신한다. 한 번 `true` 가 되면 학습 화면이 엔딩 화면을 표시한다.

### 6.6 Session

`session`은 프론트 전용 상태다.

```ts
type SessionState = {
  currentQuestionId: string | null;
  solvedQuestionIds: string[];
  lastAnswerCorrect: boolean | null;
};
```

### 6.7 Auth

```ts
type AuthState = {
  userId: string | null;
  loading: boolean;
};
```

### 6.8 RPC Result

```ts
type ProcessAnswerResult = {
  correct: boolean;
  exp: number;
  streak: number;
  berry_given: string | null;
  evolution_pending: boolean;
};
```
