import { describe, it, expect } from "vitest";
import {
  isEvolutionReady,
  isGraduationReady,
  shouldOpenPokemonSelection,
} from "@/core/evolutionChecker";
import type { PokemonInstance } from "@/stores/types";
import type { PokemonSpecies } from "@/content/pokemon/types";

function makeInstance(overrides: Partial<PokemonInstance> = {}): PokemonInstance {
  return {
    instanceId: "test",
    speciesId: "charmander",
    currentStage: 1,
    exp: 0,
    totalCorrectCount: 0,
    graduated: false,
    evolutionPending: false,
    ...overrides,
  };
}

const threeStageSpecies: PokemonSpecies = {
  speciesId: "charmander",
  dexNumber: 4,
  nameKo: "파이리",
  nameEn: "Charmander",
  category: "normal",
  isStarter: true,
  evolutionStage: 1,
  evolutionLine: ["charmander", "charmeleon", "charizard"],
  nextEvolutionSpeciesId: "charmeleon",
  branchEvolutionSpeciesIds: [],
};

const finalStageSpecies: PokemonSpecies = {
  ...threeStageSpecies,
  speciesId: "charizard",
  nextEvolutionSpeciesId: null,
  evolutionStage: 3,
};

const singleStageSpecies: PokemonSpecies = {
  speciesId: "pinsir",
  dexNumber: 127,
  nameKo: "쁘사이저",
  nameEn: "Pinsir",
  category: "normal",
  isStarter: false,
  evolutionStage: 1,
  evolutionLine: ["pinsir"],
  nextEvolutionSpeciesId: null,
  branchEvolutionSpeciesIds: [],
};

describe("isEvolutionReady", () => {
  it("3단 진화 stage 1: EXP 50+ → true", () => {
    const inst = makeInstance({ exp: 50 });
    expect(isEvolutionReady(inst, threeStageSpecies)).toBe(true);
  });

  it("3단 진화 stage 1: EXP 49 → false", () => {
    const inst = makeInstance({ exp: 49 });
    expect(isEvolutionReady(inst, threeStageSpecies)).toBe(false);
  });

  it("3단 진화 stage 2: EXP 85+ → true", () => {
    const stage2Species = {
      ...threeStageSpecies,
      speciesId: "charmeleon",
      nextEvolutionSpeciesId: "charizard",
    };
    const inst = makeInstance({
      currentStage: 2,
      exp: 85,
    });
    expect(isEvolutionReady(inst, stage2Species)).toBe(true);
  });

  it("3단 진화 stage 2: EXP 84 → false", () => {
    const stage2Species = {
      ...threeStageSpecies,
      speciesId: "charmeleon",
      nextEvolutionSpeciesId: "charizard",
    };
    const inst = makeInstance({
      currentStage: 2,
      exp: 84,
    });
    expect(isEvolutionReady(inst, stage2Species)).toBe(false);
  });

  it("최종 진화체 → false", () => {
    const inst = makeInstance({ exp: 100 });
    expect(isEvolutionReady(inst, finalStageSpecies)).toBe(false);
  });

  it("이미 진화 대기 중 → false", () => {
    const inst = makeInstance({
      evolutionPending: true,
      exp: 50,
    });
    expect(isEvolutionReady(inst, threeStageSpecies)).toBe(false);
  });
});

describe("isGraduationReady", () => {
  it("최종 진화체 + EXP 100 → true", () => {
    const inst = makeInstance({ exp: 100 });
    expect(isGraduationReady(inst, finalStageSpecies)).toBe(true);
  });

  it("최종 진화체 + EXP 99 → false", () => {
    const inst = makeInstance({ exp: 99 });
    expect(isGraduationReady(inst, finalStageSpecies)).toBe(false);
  });

  it("무진화 포켓몬 + EXP 50 → true", () => {
    const inst = makeInstance({ exp: 50 });
    expect(isGraduationReady(inst, singleStageSpecies)).toBe(true);
  });

  it("무진화 포켓몬 + EXP 49 → false", () => {
    const inst = makeInstance({ exp: 49 });
    expect(isGraduationReady(inst, singleStageSpecies)).toBe(false);
  });

  it("이미 졸업 → false", () => {
    const inst = makeInstance({
      graduated: true,
      exp: 100,
    });
    expect(isGraduationReady(inst, finalStageSpecies)).toBe(false);
  });

  it("최종 진화체가 아님 → false", () => {
    const inst = makeInstance({ exp: 100 });
    expect(isGraduationReady(inst, threeStageSpecies)).toBe(false);
  });
});

describe("shouldOpenPokemonSelection", () => {
  it("졸업 + 정답 → true", () => {
    const inst = makeInstance({
      graduated: true,
      exp: 100,
    });
    expect(shouldOpenPokemonSelection(inst, finalStageSpecies, true)).toBe(true);
  });

  it("졸업 + 오답 → false", () => {
    const inst = makeInstance({
      graduated: true,
      exp: 100,
    });
    expect(shouldOpenPokemonSelection(inst, finalStageSpecies, false)).toBe(false);
  });

  it("미졸업 → false", () => {
    const inst = makeInstance({ exp: 100 });
    expect(shouldOpenPokemonSelection(inst, finalStageSpecies, true)).toBe(false);
  });

  it("무진화 포켓몬: graduated 없이 EXP 50+ + 정답 → true", () => {
    const inst = makeInstance({ exp: 50 });
    expect(shouldOpenPokemonSelection(inst, singleStageSpecies, true)).toBe(true);
  });

  it("무진화 포켓몬: EXP 49 → false", () => {
    const inst = makeInstance({ exp: 49 });
    expect(shouldOpenPokemonSelection(inst, singleStageSpecies, true)).toBe(false);
  });
});
