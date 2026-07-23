import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { getAllSpecies } from "@/content/pokemon";
import { resolveAnswerProgression } from "@/core/answerProgression";
import { resolveEndingStats, type EndingStats } from "@/core/endingSummary";
import { resolveLoadedGameState } from "@/core/gameBootstrap";
import type {
  PartyState,
  PokedexState,
  ProcessAnswerResult,
  ProgressionState,
  SessionState,
  StartNextPokemonResult,
  TrainerState,
} from "@/core/types";
import {
  resolveEndingState,
  resolveEvolutionState,
  resolveNextPokemonState,
  resolveStarterState,
} from "@/core/pokemonProgression";

interface GameState {
  trainer: TrainerState;
  party: PartyState;
  pokedex: PokedexState;
  progression: ProgressionState;
  session: SessionState;
  loaded: boolean;
}

interface GameStore extends GameState {
  reset: () => void;
  loadFromServer: (userId: string) => Promise<void>;
  loadEndingStats: (userId: string, signal: AbortSignal) => Promise<EndingStats>;
  chooseStarter: (speciesId: string) => Promise<void>;
  submitAnswer: (
    questionId: string,
    isCorrect: boolean,
    isFirstSolve: boolean,
  ) => Promise<ProcessAnswerResult>;
  evolve: (instanceId: string, nextSpeciesId: string) => Promise<void>;
  recordEncounter: (speciesId: string) => Promise<void>;
  startNextPokemon: (speciesId: string) => Promise<void>;
  completeEnding: (instanceId: string) => Promise<void>;
  setCurrentQuestion: (questionId: string) => void;
  addSolvedQuestion: (questionId: string) => void;
}

const initialState: GameState = {
  trainer: { starterChosen: false, activePokemonInstanceId: null },
  party: { instances: [] },
  pokedex: {
    unlockedSpeciesIds: [],
    encounteredSpeciesIds: [],
    normalPokedexCompleted: false,
  },
  progression: {
    streakCorrectCount: 0,
    pendingEvolutionInstanceId: null,
    pendingGraduationInstanceId: null,
    unlockedLegendaryStage: "none",
    isEnding: false,
  },
  session: {
    currentQuestionId: null,
    solvedQuestionIds: [],
    lastAnswerCorrect: null,
  },
  loaded: false,
};

const resetState = {
  ...initialState,
  // 비로그인 상태는 서버에서 더 불러올 데이터가 없으므로 게스트 기본값을 즉시 사용한다.
  loaded: true,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  reset: () => {
    set({ ...resetState });
  },

  loadFromServer: async (userId) => {
    const [
      trainerResponse,
      instancesResponse,
      pokedexResponse,
      encountersResponse,
      progressionResponse,
      solvedQuestionsResponse,
    ] = await Promise.all([
      supabase.from("trainers").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("pokemon_instances").select("*").eq("user_id", userId),
      supabase.from("pokedex_entries").select("species_id").eq("user_id", userId),
      supabase.from("pokemon_encounters").select("species_id").eq("user_id", userId),
      supabase.from("progression").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("solved_questions")
        .select("question_id")
        .eq("user_id", userId)
        .eq("correct", true),
    ]);

    const errors = [
      trainerResponse.error,
      instancesResponse.error,
      pokedexResponse.error,
      progressionResponse.error,
      solvedQuestionsResponse.error,
    ].filter(Boolean);

    if (encountersResponse.error) {
      console.error("조우 기록 로드 실패:", encountersResponse.error);
    }

    if (errors.length > 0) {
      errors.forEach((error) => console.error("상태 로드 실패:", error));
      set({ ...initialState, loaded: true });
      return;
    }

    if (!trainerResponse.data) {
      set({ ...initialState, loaded: true });
      return;
    }

    const loadedState = resolveLoadedGameState({
      trainerRow: trainerResponse.data,
      instanceRows: instancesResponse.data ?? [],
      pokedexEntryRows: pokedexResponse.data ?? [],
      pokemonEncounterRows: encountersResponse.data ?? [],
      progressionRow: progressionResponse.data,
      solvedQuestionRows: solvedQuestionsResponse.data ?? [],
      allSpecies: getAllSpecies(),
    });

    set(loadedState);
  },

  loadEndingStats: async (userId, signal) => {
    const [attemptsResponse, correctResponse] = await Promise.all([
      supabase
        .from("solved_questions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .abortSignal(signal),
      supabase
        .from("solved_questions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("correct", true)
        .abortSignal(signal),
    ]);

    if (attemptsResponse.error) throw attemptsResponse.error;
    if (correctResponse.error) throw correctResponse.error;

    return resolveEndingStats({
      totalAttempts: attemptsResponse.count ?? 0,
      totalCorrect: correctResponse.count ?? 0,
    });
  },

  chooseStarter: async (speciesId) => {
    const { data, error } = await supabase.rpc("choose_starter", {
      p_species_id: speciesId,
    });

    if (error) throw error;

    const instanceId: string = data.instance_id;
    set(resolveStarterState({ speciesId, instanceId }));
  },

  submitAnswer: async (questionId, isCorrect, isFirstSolve) => {
    const { data, error } = await supabase.rpc("process_answer", {
      p_question_id: questionId,
      p_correct: isCorrect,
      p_is_first_solve: isFirstSolve,
    });

    if (error) throw error;

    const result: ProcessAnswerResult = data;
    const state = get();
    const answerProgression = resolveAnswerProgression({
      activeInstanceId: state.trainer.activePokemonInstanceId,
      instances: state.party.instances,
      progression: state.progression,
      session: state.session,
      questionId,
      isCorrect,
      isFirstSolve,
      result,
      allSpecies: getAllSpecies(),
    });

    set(answerProgression);

    return result;
  },

  evolve: async (instanceId, nextSpeciesId) => {
    const state = get();
    const instance = state.party.instances.find(
      (pokemonInstance) => pokemonInstance.instanceId === instanceId,
    );
    if (!instance) throw new Error("포켓몬 인스턴스를 찾을 수 없습니다.");

    const { error } = await supabase.rpc("evolve_pokemon", {
      p_instance_id: instanceId,
      p_next_species_id: nextSpeciesId,
      p_next_stage: instance.currentStage + 1,
    });

    if (error) throw error;

    const evolutionState = resolveEvolutionState({
      instances: state.party.instances,
      pokedex: state.pokedex,
      progression: state.progression,
      instanceId,
      nextSpeciesId,
    });

    set(evolutionState);
  },

  recordEncounter: async (speciesId) => {
    if (get().pokedex.encounteredSpeciesIds.includes(speciesId)) return;

    const { error } = await supabase.rpc("record_pokemon_encounter", {
      p_species_id: speciesId,
    });
    if (error) throw error;

    set((state) => ({
      pokedex: state.pokedex.encounteredSpeciesIds.includes(speciesId)
        ? state.pokedex
        : {
            ...state.pokedex,
            encounteredSpeciesIds: [...state.pokedex.encounteredSpeciesIds, speciesId],
          },
    }));
  },

  startNextPokemon: async (speciesId) => {
    const { data, error } = await supabase.rpc("start_next_pokemon", {
      p_species_id: speciesId,
    });
    if (error) throw error;

    const result: StartNextPokemonResult = data;
    const newInstanceId = result.instance_id;
    const state = get();
    const nextPokemonState = resolveNextPokemonState({
      trainer: state.trainer,
      instances: state.party.instances,
      pokedex: state.pokedex,
      progression: state.progression,
      session: state.session,
      speciesId,
      newInstanceId,
      unlockedLegendaryStage: result.unlocked_legendary_stage,
    });

    set(nextPokemonState);
  },

  completeEnding: async (instanceId) => {
    const { error } = await supabase.rpc("complete_ending", {
      p_instance_id: instanceId,
    });
    if (error) throw error;

    const state = get();
    const endingState = resolveEndingState({
      instances: state.party.instances,
      progression: state.progression,
      instanceId,
    });

    set(endingState);
  },

  setCurrentQuestion: (questionId) => {
    set((state) => ({
      session: { ...state.session, currentQuestionId: questionId },
    }));
  },

  addSolvedQuestion: (questionId) => {
    set((state) => ({
      session: {
        ...state.session,
        solvedQuestionIds: [...new Set([...state.session.solvedQuestionIds, questionId])],
      },
    }));
  },
}));
