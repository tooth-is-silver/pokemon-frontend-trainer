// 포켓몬 인스턴스
export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface PokemonInstance {
  instanceId: string;
  speciesId: string;
  currentStage: number;
  stats: PokemonStats;
  totalCorrectCount: number;
  graduated: boolean;
  evolutionPending: boolean;
}

// 트레이너
export interface TrainerState {
  starterChosen: boolean;
  activePokemonInstanceId: string | null;
}

// 파티
export interface PartyState {
  instances: PokemonInstance[];
}

// 도감
export interface PokedexState {
  unlockedSpeciesIds: string[];
  normalPokedexCompleted: boolean;
}

// 진행 상태
export interface ProgressionState {
  streakCorrectCount: number;
  pendingEvolutionInstanceId: string | null;
  pendingGraduationInstanceId: string | null;
  unlockedLegendaryStage: "none" | "legendary-birds" | "mewtwo" | "mew";
}

// 세션 (서버 저장 안 함, 프론트 전용)
export interface SessionState {
  currentQuestionId: string | null;
  solvedQuestionIds: string[];
  lastAnswerCorrect: boolean | null;
}

// 인증
export interface AuthState {
  userId: string | null;
  loading: boolean;
}

// 정답 처리 결과 (rpc 반환값)
export interface ProcessAnswerResult {
  correct: boolean;
  stats: PokemonStats;
  streak: number;
  berry_given: string | null;
  evolution_pending: boolean;
}

// 신규 인스턴스 시작 결과 (rpc 반환값)
// unlocked_legendary_stage 는 트랜지션이 일어났든 아니든 갱신 후 최종 단계
// is_ending 은 뮤 졸업 직후에만 true (엔딩 UI 분기용)
export interface StartNextPokemonResult {
  instance_id: string;
  unlocked_legendary_stage: ProgressionState["unlockedLegendaryStage"];
  is_ending: boolean;
}
