import { describe, expect, it } from "vitest";
import { getAllSpecies } from "@/content/pokemon";
import { resolveLoadedGameState } from "@/core/gameBootstrap";

const trainerRow = {
  starter_chosen: true,
  active_pokemon_instance_id: "active-instance",
};

const instanceRows = [
  {
    id: "active-instance",
    species_id: "charizard",
    current_stage: 3,
    exp: 100,
    total_correct_count: 30,
    graduated: false,
    evolution_pending: false,
  },
];

describe("resolveLoadedGameState", () => {
  it("서버 행을 앱 상태로 매핑하고 해결 문제를 중복 제거한다", () => {
    const state = resolveLoadedGameState({
      trainerRow,
      instanceRows,
      pokedexEntryRows: [{ species_id: "charmander" }, { species_id: "charizard" }],
      progressionRow: {
        streak_correct_count: 4,
        pending_evolution_instance_id: null,
        pending_graduation_instance_id: null,
        unlocked_legendary_stage: "none",
        is_ending: false,
      },
      solvedQuestionRows: [
        { question_id: "question-1" },
        { question_id: "question-1" },
        { question_id: "question-2" },
      ],
      allSpecies: getAllSpecies(),
    });

    expect(state.trainer).toEqual({
      starterChosen: true,
      activePokemonInstanceId: "active-instance",
    });
    expect(state.party.instances[0]).toMatchObject({
      instanceId: "active-instance",
      speciesId: "charizard",
      currentStage: 3,
      exp: 100,
    });
    expect(state.session.solvedQuestionIds).toEqual(["question-1", "question-2"]);
    expect(state.loaded).toBe(true);
  });

  it("졸업 가능한 포켓몬의 대기 상태를 새로고침 후 복원한다", () => {
    const state = resolveLoadedGameState({
      trainerRow,
      instanceRows,
      pokedexEntryRows: [{ species_id: "charizard" }],
      progressionRow: null,
      solvedQuestionRows: [],
      allSpecies: getAllSpecies(),
    });

    expect(state.progression).toMatchObject({
      pendingGraduationInstanceId: "active-instance",
      unlockedLegendaryStage: "none",
      isEnding: false,
    });
  });
});
