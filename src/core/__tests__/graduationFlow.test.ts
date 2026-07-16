import { describe, expect, it } from "vitest";
import { resolveGraduationFlow } from "@/core/graduationFlow";
import type { PokemonSpecies } from "@/content/pokemon/types";
import type { PokemonInstance } from "@/stores/types";

function species(overrides: Partial<PokemonSpecies>): PokemonSpecies {
  return {
    speciesId: "filler",
    dexNumber: 0,
    nameKo: "더미",
    nameEn: "Dummy",
    category: "normal",
    isStarter: false,
    evolutionStage: 1,
    evolutionLine: ["filler"],
    nextEvolutionSpeciesId: null,
    branchEvolutionSpeciesIds: [],
    ...overrides,
  };
}

function instance(overrides: Partial<PokemonInstance>): PokemonInstance {
  return {
    instanceId: "instance-1",
    speciesId: "rattata",
    currentStage: 1,
    exp: 50,
    totalCorrectCount: 10,
    graduated: false,
    evolutionPending: false,
    ...overrides,
  };
}

const rattata = species({ speciesId: "rattata", nameKo: "꼬렛", dexNumber: 19 });
const pidgey = species({ speciesId: "pidgey", nameKo: "구구", dexNumber: 16 });
const spearow = species({ speciesId: "spearow", nameKo: "깨비참", dexNumber: 21 });
const mew = species({
  speciesId: "mew",
  nameKo: "뮤",
  dexNumber: 151,
  category: "legendary",
});

const allSpecies = [rattata, pidgey, spearow, mew];

describe("resolveGraduationFlow", () => {
  it("대기 중인 졸업 인스턴스가 없으면 빈 졸업 상태 반환", () => {
    const result = resolveGraduationFlow({
      pendingGraduationInstanceId: null,
      instances: [instance({})],
      unlockedSpeciesIds: [],
      legendaryStage: "none",
      allSpecies,
    });

    expect(result.graduatedInstance).toBeNull();
    expect(result.graduatedSpecies).toBeNull();
    expect(result.graduationCandidates).toEqual([]);
    expect(result.autoGraduationCandidate).toBeNull();
    expect(result.showGraduationModal).toBe(false);
  });

  it("후보가 1마리면 자동 해금 후보로 반환하고 모달은 열지 않음", () => {
    const result = resolveGraduationFlow({
      pendingGraduationInstanceId: "instance-1",
      instances: [instance({})],
      unlockedSpeciesIds: ["rattata", "pidgey"],
      legendaryStage: "none",
      allSpecies,
    });

    expect(result.graduatedSpecies?.speciesId).toBe("rattata");
    expect(result.autoGraduationCandidate?.speciesId).toBe("spearow");
    expect(result.showGraduationModal).toBe(false);
  });

  it("후보가 여러 마리면 선택 모달 대상 상태를 반환", () => {
    const result = resolveGraduationFlow({
      pendingGraduationInstanceId: "instance-1",
      instances: [instance({})],
      unlockedSpeciesIds: ["rattata"],
      legendaryStage: "none",
      allSpecies,
    });

    expect(result.graduationCandidates.map((s) => s.speciesId).sort()).toEqual([
      "pidgey",
      "spearow",
    ]);
    expect(result.autoGraduationCandidate).toBeNull();
    expect(result.showGraduationModal).toBe(true);
  });

  it("뮤 졸업은 자동 해금이나 후보 모달을 띄우지 않음", () => {
    const result = resolveGraduationFlow({
      pendingGraduationInstanceId: "mew-instance",
      instances: [instance({ instanceId: "mew-instance", speciesId: "mew", exp: 100 })],
      unlockedSpeciesIds: ["rattata", "pidgey", "spearow", "mew"],
      legendaryStage: "mew",
      allSpecies,
    });

    expect(result.isMewGraduating).toBe(true);
    expect(result.autoGraduationCandidate).toBeNull();
    expect(result.showGraduationModal).toBe(false);
  });
});
