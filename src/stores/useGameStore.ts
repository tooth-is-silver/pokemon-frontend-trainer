import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { findSpeciesById, getAllSpecies } from "@/content/pokemon";
import { resolveAnswerProgression } from "@/core/answerProgression";
import { isGraduationReady } from "@/core/evolutionChecker";
import {
  resolveEndingState,
  resolveEvolutionState,
  resolveNextPokemonState,
} from "@/core/pokemonProgression";
import type {
  TrainerState,
  PartyState,
  PokedexState,
  ProgressionState,
  SessionState,
  PokemonInstance,
  ProcessAnswerResult,
  StartNextPokemonResult,
} from "./types";

interface GameStore {
  trainer: TrainerState;
  party: PartyState;
  pokedex: PokedexState;
  progression: ProgressionState;
  session: SessionState;
  loaded: boolean;

  // 상태 초기화 (로그아웃 시)
  reset: () => void;

  // 서버에서 상태 로드
  loadFromServer: (userId: string) => Promise<void>;

  // 스타터 선택
  chooseStarter: (speciesId: string) => Promise<void>;

  // 정답 처리
  submitAnswer: (
    questionId: string,
    isCorrect: boolean,
    isFirstSolve: boolean,
  ) => Promise<ProcessAnswerResult>;

  // 진화 처리
  evolve: (instanceId: string, nextSpeciesId: string) => Promise<void>;

  // 졸업 후 새 인스턴스 시작
  startNextPokemon: (speciesId: string) => Promise<void>;

  // 엔딩 처리 (뮤 졸업 시)
  completeEnding: (instanceId: string) => Promise<void>;

  // 세션 (프론트 전용)
  setCurrentQuestion: (questionId: string) => void;
  addSolvedQuestion: (questionId: string) => void;
}

const initialState = {
  trainer: { starterChosen: false, activePokemonInstanceId: null } as TrainerState,
  party: { instances: [] } as PartyState,
  pokedex: { unlockedSpeciesIds: [], normalPokedexCompleted: false } as PokedexState,
  progression: {
    streakCorrectCount: 0,
    pendingEvolutionInstanceId: null,
    pendingGraduationInstanceId: null,
    unlockedLegendaryStage: "none",
    isEnding: false,
  } as ProgressionState,
  session: {
    currentQuestionId: null,
    solvedQuestionIds: [],
    lastAnswerCorrect: null,
  } as SessionState,
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
    const [trainerRes, instancesRes, pokedexRes, progressionRes, solvedRes] = await Promise.all([
      supabase.from("trainers").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("pokemon_instances").select("*").eq("user_id", userId),
      supabase.from("pokedex_entries").select("species_id").eq("user_id", userId),
      supabase.from("progression").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("solved_questions")
        .select("question_id")
        .eq("user_id", userId)
        .eq("correct", true),
    ]);

    // 서버 에러 시 로드 실패 처리
    const errors = [
      trainerRes.error,
      instancesRes.error,
      pokedexRes.error,
      progressionRes.error,
      solvedRes.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      errors.forEach((err) => console.error("상태 로드 실패:", err));
      set({ ...initialState, loaded: true });
      return;
    }

    // 신규 유저: 데이터 없음
    if (!trainerRes.data) {
      set({ ...initialState, loaded: true });
      return;
    }

    const instances: PokemonInstance[] = (instancesRes.data ?? []).map((row) => ({
      instanceId: row.id,
      speciesId: row.species_id,
      currentStage: row.current_stage,
      exp: row.exp,
      totalCorrectCount: row.total_correct_count,
      graduated: row.graduated,
      evolutionPending: row.evolution_pending,
    }));

    const solvedIds = [...new Set((solvedRes.data ?? []).map((r) => r.question_id))];
    const activeInstanceId = trainerRes.data.active_pokemon_instance_id;
    const activeInstance = instances.find((inst) => inst.instanceId === activeInstanceId);
    const activeSpecies = activeInstance ? findSpeciesById(activeInstance.speciesId) : null;
    const restoredGraduationInstanceId =
      activeInstance && activeSpecies && isGraduationReady(activeInstance, activeSpecies)
        ? activeInstance.instanceId
        : null;
    const serverProgression = progressionRes.data;

    set({
      trainer: {
        starterChosen: trainerRes.data.starter_chosen,
        activePokemonInstanceId: activeInstanceId,
      },
      party: { instances },
      pokedex: {
        unlockedSpeciesIds: (pokedexRes.data ?? []).map((r) => r.species_id),
        normalPokedexCompleted: false,
      },
      progression: serverProgression
        ? {
            streakCorrectCount: serverProgression.streak_correct_count,
            pendingEvolutionInstanceId: serverProgression.pending_evolution_instance_id,
            pendingGraduationInstanceId:
              serverProgression.pending_graduation_instance_id ?? restoredGraduationInstanceId,
            unlockedLegendaryStage: serverProgression.unlocked_legendary_stage,
            isEnding: serverProgression.is_ending ?? false,
          }
        : {
            ...initialState.progression,
            pendingGraduationInstanceId: restoredGraduationInstanceId,
          },
      session: {
        currentQuestionId: null,
        solvedQuestionIds: solvedIds,
        lastAnswerCorrect: null,
      },
      loaded: true,
    });
  },

  chooseStarter: async (speciesId) => {
    const { data, error } = await supabase.rpc("choose_starter", {
      p_species_id: speciesId,
    });

    if (error) throw error;

    const instanceId = data.instance_id as string;

    const newInstance: PokemonInstance = {
      instanceId,
      speciesId,
      currentStage: 1,
      exp: 0,
      totalCorrectCount: 0,
      graduated: false,
      evolutionPending: false,
    };

    set({
      trainer: {
        starterChosen: true,
        activePokemonInstanceId: instanceId,
      },
      party: { instances: [newInstance] },
      pokedex: {
        unlockedSpeciesIds: [speciesId],
        normalPokedexCompleted: false,
      },
    });
  },

  submitAnswer: async (questionId, isCorrect, isFirstSolve) => {
    const { data, error } = await supabase.rpc("process_answer", {
      p_question_id: questionId,
      p_correct: isCorrect,
      p_is_first_solve: isFirstSolve,
    });

    if (error) throw error;

    const result = data as ProcessAnswerResult;
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
    const instance = state.party.instances.find((i) => i.instanceId === instanceId);
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

  startNextPokemon: async (speciesId) => {
    const { data, error } = await supabase.rpc("start_next_pokemon", {
      p_species_id: speciesId,
    });
    if (error) throw error;

    const result = data as StartNextPokemonResult;
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
