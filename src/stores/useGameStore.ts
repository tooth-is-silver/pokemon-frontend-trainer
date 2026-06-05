import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { findSpeciesById } from "../content/pokemon";
import { isGraduationReady } from "../core/evolutionChecker";
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
    correct: boolean,
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
      stats: {
        hp: row.hp,
        attack: row.attack,
        defense: row.defense,
        speed: row.speed,
      },
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
      stats: { hp: 0, attack: 0, defense: 0, speed: 0 },
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

  submitAnswer: async (questionId, correct, isFirstSolve) => {
    const { data, error } = await supabase.rpc("process_answer", {
      p_question_id: questionId,
      p_correct: correct,
      p_is_first_solve: isFirstSolve,
    });

    if (error) throw error;

    const result = data as ProcessAnswerResult;
    const state = get();
    const activeId = state.trainer.activePokemonInstanceId;

    // 정답 반영된 인스턴스로 졸업 가능 여부 판정
    const updatedInstances = state.party.instances.map((inst) =>
      inst.instanceId === activeId
        ? {
            ...inst,
            stats: result.stats,
            totalCorrectCount: inst.totalCorrectCount + (correct ? 1 : 0),
            evolutionPending: result.evolution_pending,
          }
        : inst,
    );
    const updatedActive = updatedInstances.find((i) => i.instanceId === activeId);
    const activeSpecies = updatedActive ? findSpeciesById(updatedActive.speciesId) : null;
    const graduationReady = Boolean(
      correct &&
      activeId &&
      updatedActive &&
      activeSpecies &&
      isGraduationReady(updatedActive, activeSpecies),
    );

    set({
      party: { instances: updatedInstances },
      progression: {
        ...state.progression,
        streakCorrectCount: result.streak,
        pendingEvolutionInstanceId: result.evolution_pending
          ? activeId
          : state.progression.pendingEvolutionInstanceId,
        pendingGraduationInstanceId: graduationReady
          ? activeId
          : state.progression.pendingGraduationInstanceId,
      },
      session: {
        ...state.session,
        lastAnswerCorrect: correct,
        solvedQuestionIds:
          correct && isFirstSolve
            ? [...new Set([...state.session.solvedQuestionIds, questionId])]
            : state.session.solvedQuestionIds,
      },
    });

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

    set({
      party: {
        instances: state.party.instances.map((inst) =>
          inst.instanceId === instanceId
            ? {
                ...inst,
                speciesId: nextSpeciesId,
                currentStage: inst.currentStage + 1,
                evolutionPending: false,
              }
            : inst,
        ),
      },
      pokedex: {
        ...state.pokedex,
        unlockedSpeciesIds: [...new Set([...state.pokedex.unlockedSpeciesIds, nextSpeciesId])],
      },
      progression: {
        ...state.progression,
        pendingEvolutionInstanceId: null,
      },
    });
  },

  startNextPokemon: async (speciesId) => {
    const { data, error } = await supabase.rpc("start_next_pokemon", {
      p_species_id: speciesId,
    });
    if (error) throw error;

    const result = data as StartNextPokemonResult;
    const newInstanceId = result.instance_id;
    const state = get();
    const oldActiveId = state.trainer.activePokemonInstanceId;

    const newInstance: PokemonInstance = {
      instanceId: newInstanceId,
      speciesId,
      currentStage: 1,
      stats: { hp: 0, attack: 0, defense: 0, speed: 0 },
      totalCorrectCount: 0,
      graduated: false,
      evolutionPending: false,
    };

    set({
      trainer: {
        ...state.trainer,
        activePokemonInstanceId: newInstanceId,
      },
      party: {
        instances: [
          ...state.party.instances.map((inst) =>
            inst.instanceId === oldActiveId
              ? { ...inst, graduated: true, evolutionPending: false }
              : inst,
          ),
          newInstance,
        ],
      },
      pokedex: {
        ...state.pokedex,
        unlockedSpeciesIds: [...new Set([...state.pokedex.unlockedSpeciesIds, speciesId])],
      },
      progression: {
        ...state.progression,
        streakCorrectCount: 0,
        pendingEvolutionInstanceId: null,
        pendingGraduationInstanceId: null,
        unlockedLegendaryStage: result.unlocked_legendary_stage,
      },
      session: {
        ...state.session,
        currentQuestionId: null,
        lastAnswerCorrect: null,
      },
    });
  },

  completeEnding: async (instanceId) => {
    const { error } = await supabase.rpc("complete_ending", {
      p_instance_id: instanceId,
    });
    if (error) throw error;

    const state = get();
    set({
      party: {
        instances: state.party.instances.map((inst) =>
          inst.instanceId === instanceId
            ? { ...inst, graduated: true, evolutionPending: false }
            : inst,
        ),
      },
      progression: {
        ...state.progression,
        isEnding: true,
        pendingGraduationInstanceId: null,
        pendingEvolutionInstanceId: null,
      },
    });
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
