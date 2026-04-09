import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type {
  TrainerState,
  PartyState,
  PokedexState,
  ProgressionState,
  SessionState,
  PokemonInstance,
  ProcessAnswerResult,
} from "./types";

interface GameStore {
  trainer: TrainerState;
  party: PartyState;
  pokedex: PokedexState;
  progression: ProgressionState;
  session: SessionState;
  loaded: boolean;

  // 서버에서 상태 로드
  loadFromServer: (userId: string) => Promise<void>;

  // 스타터 선택
  chooseStarter: (userId: string, speciesId: string) => Promise<void>;

  // 정답 처리
  submitAnswer: (
    questionId: string,
    correct: boolean,
    isFirstSolve: boolean
  ) => Promise<ProcessAnswerResult>;

  // 진화 처리
  evolve: (instanceId: string, nextSpeciesId: string) => Promise<void>;
  skipEvolution: (instanceId: string) => Promise<void>;

  // 세션 (프론트 전용)
  setCurrentQuestion: (questionId: string) => void;
  addSolvedQuestion: (questionId: string) => void;
}

const initialState = {
  trainer: { starterChosen: false, activePokemonInstanceId: null },
  party: { instances: [] },
  pokedex: { unlockedSpeciesIds: [], normalPokedexCompleted: false },
  progression: {
    streakCorrectCount: 0,
    pendingPokemonSelection: false,
    pendingEvolutionInstanceId: null,
    unlockedLegendaryStage: "none" as const,
  },
  session: {
    currentQuestionId: null,
    solvedQuestionIds: [],
    lastAnswerCorrect: null,
  },
  loaded: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  loadFromServer: async (userId) => {
    const [trainerRes, instancesRes, pokedexRes, progressionRes, solvedRes] =
      await Promise.all([
        supabase.from("trainers").select("*").eq("user_id", userId).single(),
        supabase.from("pokemon_instances").select("*").eq("user_id", userId),
        supabase.from("pokedex_entries").select("species_id").eq("user_id", userId),
        supabase.from("progression").select("*").eq("user_id", userId).single(),
        supabase
          .from("solved_questions")
          .select("question_id")
          .eq("user_id", userId)
          .eq("correct", true),
      ]);

    // 신규 유저: 트레이너 레코드가 없으면 초기 상태 유지
    if (trainerRes.error || !trainerRes.data) {
      set({ loaded: true });
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

    const solvedIds = [
      ...new Set((solvedRes.data ?? []).map((r) => r.question_id)),
    ];

    set({
      trainer: {
        starterChosen: trainerRes.data.starter_chosen,
        activePokemonInstanceId: trainerRes.data.active_pokemon_instance_id,
      },
      party: { instances },
      pokedex: {
        unlockedSpeciesIds: (pokedexRes.data ?? []).map((r) => r.species_id),
        normalPokedexCompleted: false,
      },
      progression: progressionRes.data
        ? {
            streakCorrectCount: progressionRes.data.streak_correct_count,
            pendingPokemonSelection: progressionRes.data.pending_pokemon_selection,
            pendingEvolutionInstanceId: progressionRes.data.pending_evolution_instance_id,
            unlockedLegendaryStage: progressionRes.data.unlocked_legendary_stage,
          }
        : initialState.progression,
      session: {
        currentQuestionId: null,
        solvedQuestionIds: solvedIds,
        lastAnswerCorrect: null,
      },
      loaded: true,
    });
  },

  chooseStarter: async (userId, speciesId) => {
    // 트레이너 생성
    await supabase.from("trainers").upsert({
      user_id: userId,
      starter_chosen: true,
    });

    // 포켓몬 인스턴스 생성
    const { data: instance } = await supabase
      .from("pokemon_instances")
      .insert({
        user_id: userId,
        species_id: speciesId,
        current_stage: 1,
      })
      .select()
      .single();

    if (!instance) return;

    // 트레이너에 활성 포켓몬 설정
    await supabase
      .from("trainers")
      .update({ active_pokemon_instance_id: instance.id })
      .eq("user_id", userId);

    // 도감 등록
    await supabase.from("pokedex_entries").insert({
      user_id: userId,
      species_id: speciesId,
    });

    // 진행 상태 생성
    await supabase.from("progression").upsert({
      user_id: userId,
    });

    const newInstance: PokemonInstance = {
      instanceId: instance.id,
      speciesId: instance.species_id,
      currentStage: 1,
      stats: { hp: 0, attack: 0, defense: 0, speed: 0 },
      totalCorrectCount: 0,
      graduated: false,
      evolutionPending: false,
    };

    set({
      trainer: {
        starterChosen: true,
        activePokemonInstanceId: instance.id,
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

    // 프론트 상태 동기화
    set({
      party: {
        instances: state.party.instances.map((inst) =>
          inst.instanceId === activeId
            ? {
                ...inst,
                stats: result.stats,
                totalCorrectCount: inst.totalCorrectCount + (correct ? 1 : 0),
                evolutionPending: result.evolution_pending,
              }
            : inst
        ),
      },
      progression: {
        ...state.progression,
        streakCorrectCount: result.streak,
        pendingEvolutionInstanceId: result.evolution_pending
          ? activeId
          : state.progression.pendingEvolutionInstanceId,
      },
      session: {
        ...state.session,
        lastAnswerCorrect: correct,
      },
    });

    return result;
  },

  evolve: async (instanceId, nextSpeciesId) => {
    const state = get();

    await supabase
      .from("pokemon_instances")
      .update({
        species_id: nextSpeciesId,
        current_stage: state.party.instances.find(
          (i) => i.instanceId === instanceId
        )!.currentStage + 1,
        evolution_pending: false,
      })
      .eq("id", instanceId);

    await supabase.from("pokedex_entries").upsert({
      user_id: (await supabase.auth.getUser()).data.user!.id,
      species_id: nextSpeciesId,
    });

    await supabase
      .from("progression")
      .update({ pending_evolution_instance_id: null })
      .eq(
        "user_id",
        (await supabase.auth.getUser()).data.user!.id
      );

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
            : inst
        ),
      },
      pokedex: {
        ...state.pokedex,
        unlockedSpeciesIds: [
          ...new Set([...state.pokedex.unlockedSpeciesIds, nextSpeciesId]),
        ],
      },
      progression: {
        ...state.progression,
        pendingEvolutionInstanceId: null,
      },
    });
  },

  skipEvolution: async (instanceId) => {
    await supabase
      .from("pokemon_instances")
      .update({ evolution_pending: false })
      .eq("id", instanceId);

    await supabase
      .from("progression")
      .update({ pending_evolution_instance_id: null })
      .eq(
        "user_id",
        (await supabase.auth.getUser()).data.user!.id
      );

    const state = get();
    set({
      party: {
        instances: state.party.instances.map((inst) =>
          inst.instanceId === instanceId
            ? { ...inst, evolutionPending: false }
            : inst
        ),
      },
      progression: {
        ...state.progression,
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
        solvedQuestionIds: [
          ...new Set([...state.session.solvedQuestionIds, questionId]),
        ],
      },
    }));
  },
}));
