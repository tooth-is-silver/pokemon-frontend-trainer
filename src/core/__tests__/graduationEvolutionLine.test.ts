import { describe, expect, it } from "vitest";
import type { PokemonSpecies } from "@/content/pokemon/types";
import { resolveGraduationEvolutionLine } from "@/core/graduationEvolutionLine";

function createSpecies(speciesId: string): PokemonSpecies {
  return {
    speciesId,
    dexNumber: 1,
    nameKo: speciesId,
    nameEn: speciesId,
    category: "normal",
    isStarter: false,
    evolutionStage: 1,
    evolutionLine: [speciesId],
    nextEvolutionSpeciesId: null,
    branchEvolutionSpeciesIds: [],
  };
}

describe("resolveGraduationEvolutionLine", () => {
  it("유효한 진화 라인은 순서를 유지해 반환", () => {
    const speciesMap = new Map([
      ["charmander", createSpecies("charmander")],
      ["charmeleon", createSpecies("charmeleon")],
      ["charizard", createSpecies("charizard")],
    ]);

    const result = resolveGraduationEvolutionLine(
      ["charmander", "charmeleon", "charizard"],
      (speciesId) => speciesMap.get(speciesId) ?? null,
    );

    expect(result.missingSpeciesIds).toEqual([]);
    expect(result.validSpecies.map((species) => species.speciesId)).toEqual([
      "charmander",
      "charmeleon",
      "charizard",
    ]);
  });

  it("누락된 speciesId는 숨기지 않고 별도 목록으로 반환", () => {
    const result = resolveGraduationEvolutionLine(
      ["charmander", "missingno", "charizard"],
      (speciesId) => (speciesId === "missingno" ? null : createSpecies(speciesId)),
    );

    expect(result.missingSpeciesIds).toEqual(["missingno"]);
    expect(result.validSpecies.map((species) => species.speciesId)).toEqual([
      "charmander",
      "charizard",
    ]);
  });
});
