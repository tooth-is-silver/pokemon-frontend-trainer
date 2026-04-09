# Data Structures

## 1. Purpose

이 문서는 MVP 구현에 필요한 데이터 구조를 정의한다.

- 문제 데이터
- 포켓몬 데이터
- 게임 상태 데이터

## 2. Directory Layout

```text
src/
  content/
    sources/
      source-index.json
      pages/
    questions/
      question-index.json
      by-page/
      pools/
    pokemon/
      pokemon-index.json
      species/
      groups/
```

## 3. Question Data

### 3.1 Question File Example

```json
{
  "sourceId": "object-methods",
  "title": "메서드와 this",
  "url": "https://ko.javascript.info/object-methods",
  "questions": [
    {
      "questionId": "object-methods-yes-no-001",
      "type": "yes_no",
      "prompt": "화살표 함수는 자신만의 this를 가진다.",
      "answer": false,
      "acceptedAnswers": ["아니오", "false"],
      "conceptGroup": "this-core",
      "explanation": "화살표 함수는 자신만의 this를 가지지 않는다.",
      "sourceExcerptId": "object-methods-001"
    },
    {
      "questionId": "object-methods-choice-001",
      "type": "multiple_choice",
      "prompt": "메서드 안의 this는 보통 무엇을 가리키나?",
      "answer": "점 앞의 객체",
      "choices": [
        "전역 객체",
        "점 앞의 객체",
        "항상 undefined",
        "항상 함수 자신",
        "새로 생성된 빈 객체"
      ],
      "conceptGroup": "this-core",
      "explanation": "메서드 호출에서 this는 점 앞의 객체를 가리킨다.",
      "sourceExcerptId": "object-methods-002"
    },
    {
      "questionId": "object-methods-blank-001",
      "type": "fill_blank",
      "prompt": "화살표 함수는 자신만의 ____ 를 가지지 않는다.",
      "answer": "this",
      "acceptedAnswers": ["this", "디스"],
      "conceptGroup": "this-core",
      "explanation": "화살표 함수는 자신만의 this를 가지지 않는다.",
      "sourceExcerptId": "object-methods-001"
    }
  ]
}
```

### 3.2 Concept Pool Example

```json
{
  "this-core": [
    "this",
    "lexical environment",
    "closure",
    "prototype",
    "scope",
    "constructor"
  ]
}
```

### 3.3 Question Types

```ts
type QuestionBase = {
  questionId: string;
  type: "yes_no" | "multiple_choice" | "fill_blank";
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

### 3.4 Validation

- `questionId` 중복 금지
- `multiple_choice.choices.length === 5`
- `answer`가 보기 안에 포함되어야 함
- `fill_blank.acceptedAnswers.length >= 1`
- `sourceExcerptId`는 실제 source excerpt와 연결되어야 함

## 4. Pokemon Data

### 4.1 Species Example

```json
{
  "speciesId": "charmander",
  "dexNumber": 4,
  "nameKo": "파이리",
  "nameEn": "Charmander",
  "category": "normal",
  "isStarter": true,
  "canRepeat": true,
  "imageKey": "charmander",
  "evolutionStage": 1,
  "evolutionLine": ["charmander", "charmeleon", "charizard"],
  "nextEvolutionSpeciesId": "charmeleon",
  "branchEvolutionSpeciesIds": [],
  "statRuleId": "three-stage-default",
  "graduationRuleId": "final-all-100",
  "unlockRuleId": "normal-default"
}
```

### 4.2 Legendary Order Example

```json
{
  "excludedFromNormalSelection": [
    "articuno",
    "zapdos",
    "moltres",
    "mewtwo",
    "mew"
  ],
  "waves": [
    {
      "waveId": "legendary-birds",
      "speciesIds": ["articuno", "zapdos", "moltres"],
      "unlockCondition": "complete-normal-pokedex"
    },
    {
      "waveId": "mewtwo",
      "speciesIds": ["mewtwo"],
      "unlockCondition": "graduate-legendary-birds"
    },
    {
      "waveId": "mew",
      "speciesIds": ["mew"],
      "unlockCondition": "graduate-mewtwo"
    }
  ]
}
```

### 4.3 Species Type

```ts
type PokemonSpecies = {
  speciesId: string;
  dexNumber: number;
  nameKo: string;
  nameEn: string;
  category: "normal" | "legendary";
  isStarter: boolean;
  canRepeat: boolean;
  imageKey: string;
  evolutionStage: number;
  evolutionLine: string[];
  nextEvolutionSpeciesId: string | null;
  branchEvolutionSpeciesIds: string[];
  statRuleId: string;
  graduationRuleId: string;
  unlockRuleId: string;
};
```

## 5. Game State

### 5.1 Root State

```ts
type AppState = {
  trainer: TrainerState;
  party: PartyState;
  pokedex: PokedexState;
  progression: ProgressionState;
  session: SessionState;
};
```

### 5.2 Trainer

```ts
type TrainerState = {
  trainerId: string;
  createdAt: string;
  starterChosen: boolean;
  activePokemonInstanceId: string | null;
};
```

### 5.3 Party

```ts
type PartyState = {
  instances: PokemonInstance[];
};

type PokemonInstance = {
  instanceId: string;
  speciesId: string;
  currentStage: number;
  stats: PokemonStats;
  totalCorrectCount: number;
  graduated: boolean;
  evolutionPending: boolean;
  createdAt: string;
};

type PokemonStats = {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
};
```

### 5.4 Pokedex

```ts
type PokedexState = {
  unlockedSpeciesIds: string[];
  completedDexNumbers: number[];
  normalPokedexCompleted: boolean;
  legendaryWaveUnlocked: string[];
};
```

### 5.5 Progression

```ts
type ProgressionState = {
  unlockedLegendaryStage:
    | "none"
    | "legendary-birds"
    | "mewtwo"
    | "mew";
  streakCorrectCount: number;
  pendingPokemonSelection: boolean;
  pendingEvolutionInstanceId: string | null;
};
```

### 5.6 Session

```ts
type SessionState = {
  currentSourceId: string | null;
  currentQuestionId: string | null;
  solvedQuestionIds: string[];
  repeatedSolvedQuestionIds: string[];
  lastAnswerCorrect: boolean | null;
};
```
