import { describe, expect, it } from "vitest";
import { getAllSpecies } from "@/content/pokemon";
import { resolveEndingStats, resolveEndingSummary } from "@/core/endingSummary";
import type { PokemonInstance } from "@/stores/types";

const instances: PokemonInstance[] = [
  {
    instanceId: "charizard-instance",
    speciesId: "charizard",
    currentStage: 3,
    exp: 100,
    totalCorrectCount: 30,
    graduated: true,
    evolutionPending: false,
  },
  {
    instanceId: "bulbasaur-instance",
    speciesId: "bulbasaur",
    currentStage: 1,
    exp: 100,
    totalCorrectCount: 20,
    graduated: true,
    evolutionPending: false,
  },
  {
    instanceId: "active-instance",
    speciesId: "pikachu",
    currentStage: 1,
    exp: 50,
    totalCorrectCount: 10,
    graduated: false,
    evolutionPending: false,
  },
];

describe("resolveEndingStats", () => {
  it("전체 시도와 정답 수로 오답 수를 계산한다", () => {
    expect(resolveEndingStats({ totalAttempts: 12, totalCorrect: 8 })).toEqual({
      totalAttempts: 12,
      totalCorrect: 8,
      totalWrong: 4,
    });
  });

  it("정답 수가 전체 시도보다 크면 통계 범위 안으로 보정한다", () => {
    expect(resolveEndingStats({ totalAttempts: 3, totalCorrect: 5 })).toEqual({
      totalAttempts: 3,
      totalCorrect: 3,
      totalWrong: 0,
    });
  });
});

describe("resolveEndingSummary", () => {
  it("도감 중복을 제거하고 졸업 포켓몬을 도감 번호순으로 정렬한다", () => {
    const summary = resolveEndingSummary({
      unlockedSpeciesIds: ["bulbasaur", "bulbasaur", "charizard"],
      instances,
      allSpecies: getAllSpecies(),
      totalDex: 151,
    });

    expect(summary.unlockedCount).toBe(2);
    expect(summary.pokedexPercent).toBe(1);
    expect(summary.isPokedexComplete).toBe(false);
    expect(summary.graduatedSpecies.map((species) => species.speciesId)).toEqual([
      "bulbasaur",
      "charizard",
    ]);
  });

  it("전체 도감 수 이상을 해금하면 진행률을 100으로 제한한다", () => {
    const summary = resolveEndingSummary({
      unlockedSpeciesIds: ["bulbasaur", "ivysaur", "venusaur"],
      instances: [],
      allSpecies: getAllSpecies(),
      totalDex: 2,
    });

    expect(summary.pokedexPercent).toBe(100);
    expect(summary.isPokedexComplete).toBe(true);
  });
});
