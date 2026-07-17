export interface PokemonInstance {
  instanceId: string;
  speciesId: string;
  currentStage: number;
  exp: number;
  totalCorrectCount: number;
  graduated: boolean;
  evolutionPending: boolean;
}

export interface TrainerState {
  starterChosen: boolean;
  activePokemonInstanceId: string | null;
}

export interface PartyState {
  instances: PokemonInstance[];
}

export interface PokedexState {
  unlockedSpeciesIds: string[];
  normalPokedexCompleted: boolean;
}

export interface ProgressionState {
  streakCorrectCount: number;
  pendingEvolutionInstanceId: string | null;
  pendingGraduationInstanceId: string | null;
  unlockedLegendaryStage: "none" | "legendary-birds" | "mewtwo" | "mew";
  isEnding: boolean;
}

export interface SessionState {
  currentQuestionId: string | null;
  solvedQuestionIds: string[];
  lastAnswerCorrect: boolean | null;
}

export interface AuthState {
  userId: string | null;
  email: string | null;
  loading: boolean;
}

export interface ProcessAnswerResult {
  correct: boolean;
  exp: number;
  streak: number;
  berry_given: string | null;
  evolution_pending: boolean;
}

export interface StartNextPokemonResult {
  instance_id: string;
  unlocked_legendary_stage: ProgressionState["unlockedLegendaryStage"];
  is_ending: boolean;
}
