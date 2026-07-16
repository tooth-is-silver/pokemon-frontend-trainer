import { describe, expect, it } from "vitest";
import {
  resolveEndingState,
  resolveEvolutionState,
  resolveNextPokemonState,
  resolveStarterState,
} from "@/core/pokemonProgression";
import type {
  PokedexState,
  PokemonInstance,
  ProgressionState,
  SessionState,
  TrainerState,
} from "@/stores/types";

const activeInstance: PokemonInstance = {
  instanceId: "active-instance",
  speciesId: "charmander",
  currentStage: 1,
  exp: 50,
  totalCorrectCount: 10,
  graduated: false,
  evolutionPending: true,
};

const trainer: TrainerState = {
  starterChosen: true,
  activePokemonInstanceId: activeInstance.instanceId,
};

const pokedex: PokedexState = {
  unlockedSpeciesIds: [activeInstance.speciesId],
  normalPokedexCompleted: false,
};

const progression: ProgressionState = {
  streakCorrectCount: 4,
  pendingEvolutionInstanceId: activeInstance.instanceId,
  pendingGraduationInstanceId: activeInstance.instanceId,
  unlockedLegendaryStage: "none",
  isEnding: false,
};

const session: SessionState = {
  currentQuestionId: "question-1",
  solvedQuestionIds: ["question-1"],
  lastAnswerCorrect: true,
};

describe("resolveStarterState", () => {
  it("선택한 스타터를 활성 포켓몬과 첫 도감 항목으로 등록한다", () => {
    const nextState = resolveStarterState({
      speciesId: "bulbasaur",
      instanceId: "starter-instance",
    });

    expect(nextState.trainer).toEqual({
      starterChosen: true,
      activePokemonInstanceId: "starter-instance",
    });
    expect(nextState.party.instances).toEqual([
      {
        instanceId: "starter-instance",
        speciesId: "bulbasaur",
        currentStage: 1,
        exp: 0,
        totalCorrectCount: 0,
        graduated: false,
        evolutionPending: false,
      },
    ]);
    expect(nextState.pokedex).toEqual({
      unlockedSpeciesIds: ["bulbasaur"],
      normalPokedexCompleted: false,
    });
  });
});

describe("resolveEvolutionState", () => {
  it("진화체와 도감 등록 상태를 함께 반영한다", () => {
    const nextState = resolveEvolutionState({
      instances: [activeInstance],
      pokedex,
      progression,
      instanceId: activeInstance.instanceId,
      nextSpeciesId: "charmeleon",
    });

    expect(nextState.party.instances[0]).toMatchObject({
      speciesId: "charmeleon",
      currentStage: 2,
      evolutionPending: false,
    });
    expect(nextState.pokedex.unlockedSpeciesIds).toEqual(["charmander", "charmeleon"]);
    expect(nextState.progression.pendingEvolutionInstanceId).toBeNull();
  });
});

describe("resolveNextPokemonState", () => {
  it("기존 포켓몬을 졸업시키고 새 포켓몬을 활성화한다", () => {
    const nextState = resolveNextPokemonState({
      trainer,
      instances: [activeInstance],
      pokedex,
      progression,
      session,
      speciesId: "squirtle",
      newInstanceId: "next-instance",
      unlockedLegendaryStage: "legendary-birds",
    });

    expect(nextState.trainer.activePokemonInstanceId).toBe("next-instance");
    expect(nextState.party.instances).toHaveLength(2);
    expect(nextState.party.instances[0]?.graduated).toBe(true);
    expect(nextState.party.instances[1]).toMatchObject({
      instanceId: "next-instance",
      speciesId: "squirtle",
      exp: 0,
    });
    expect(nextState.pokedex.unlockedSpeciesIds).toEqual(["charmander", "squirtle"]);
    expect(nextState.progression).toMatchObject({
      streakCorrectCount: 0,
      pendingEvolutionInstanceId: null,
      pendingGraduationInstanceId: null,
      unlockedLegendaryStage: "legendary-birds",
    });
    expect(nextState.session).toMatchObject({
      currentQuestionId: null,
      lastAnswerCorrect: null,
      solvedQuestionIds: ["question-1"],
    });
  });
});

describe("resolveEndingState", () => {
  it("졸업 인스턴스와 엔딩 상태를 함께 반영한다", () => {
    const nextState = resolveEndingState({
      instances: [activeInstance],
      progression,
      instanceId: activeInstance.instanceId,
    });

    expect(nextState.party.instances[0]).toMatchObject({
      graduated: true,
      evolutionPending: false,
    });
    expect(nextState.progression).toMatchObject({
      isEnding: true,
      pendingEvolutionInstanceId: null,
      pendingGraduationInstanceId: null,
    });
  });
});
