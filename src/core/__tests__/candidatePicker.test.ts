import { describe, it, expect } from "vitest";
import { pickGraduationCandidates } from "@/core/candidatePicker";
import type { PokemonSpecies } from "@/content/pokemon/types";

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

const bulbasaur = species({ speciesId: "bulbasaur", dexNumber: 1 });
const ivysaur = species({ speciesId: "ivysaur", dexNumber: 2, evolutionStage: 2 });
const charmander = species({ speciesId: "charmander", dexNumber: 4 });
const squirtle = species({ speciesId: "squirtle", dexNumber: 7 });
const pidgey = species({ speciesId: "pidgey", dexNumber: 16 });
const rattata = species({ speciesId: "rattata", dexNumber: 19 });
const articuno = species({
  speciesId: "articuno",
  dexNumber: 144,
  category: "legendary",
});
const zapdos = species({ speciesId: "zapdos", dexNumber: 145, category: "legendary" });
const moltres = species({ speciesId: "moltres", dexNumber: 146, category: "legendary" });
const mewtwo = species({ speciesId: "mewtwo", dexNumber: 150, category: "legendary" });
const mew = species({ speciesId: "mew", dexNumber: 151, category: "legendary" });

const allSpecies: PokemonSpecies[] = [
  bulbasaur,
  ivysaur,
  charmander,
  squirtle,
  pidgey,
  rattata,
  articuno,
  zapdos,
  moltres,
  mewtwo,
  mew,
];

// 결정론적 random: i 번째 호출에서 0 반환 → shuffleSlice 가 앞에서부터 차례로 뽑음
const det = () => 0;

describe("pickGraduationCandidates - 일반 wave", () => {
  it("미등록 일반 1차 진화체 중 풀이 충분하면 3마리 반환", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: [],
      legendaryStage: "none",
      allSpecies,
      random: det,
    });
    expect(result).toHaveLength(3);
    result.forEach((s) => {
      expect(s.category).toBe("normal");
      expect(s.evolutionStage).toBe(1);
    });
  });

  it("이미 도감에 등록된 종은 후보에서 제외", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: ["bulbasaur", "charmander", "squirtle"],
      graduatedSpeciesIds: [],
      legendaryStage: "none",
      allSpecies,
      random: det,
    });
    const ids = result.map((s) => s.speciesId);
    expect(ids).not.toContain("bulbasaur");
    expect(ids).not.toContain("charmander");
    expect(ids).not.toContain("squirtle");
  });

  it("진화 중간 단계(evolutionStage > 1)는 후보가 아님", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: [],
      legendaryStage: "none",
      allSpecies,
      random: det,
    });
    const ids = result.map((s) => s.speciesId);
    expect(ids).not.toContain("ivysaur");
  });

  it("전설 5종은 일반 wave 후보에서 항상 제외", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: [],
      legendaryStage: "none",
      allSpecies,
      random: det,
    });
    const ids = result.map((s) => s.speciesId);
    ["articuno", "zapdos", "moltres", "mewtwo", "mew"].forEach((id) => {
      expect(ids).not.toContain(id);
    });
  });

  it("풀 크기가 3 보다 작으면 풀 그대로 반환", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: ["bulbasaur", "charmander", "squirtle", "pidgey"],
      graduatedSpeciesIds: [],
      legendaryStage: "none",
      allSpecies,
      random: det,
    });
    expect(result).toHaveLength(1);
    expect(result[0].speciesId).toBe("rattata");
  });

  it("풀이 비면 빈 배열 반환", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: ["bulbasaur", "charmander", "squirtle", "pidgey", "rattata"],
      graduatedSpeciesIds: [],
      legendaryStage: "none",
      allSpecies,
      random: det,
    });
    expect(result).toEqual([]);
  });

  it("일반 도감이 완성되면 전설 새 후보로 전환", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: ["bulbasaur", "ivysaur", "charmander", "squirtle", "pidgey", "rattata"],
      graduatedSpeciesIds: [],
      legendaryStage: "none",
      allSpecies,
      random: det,
    });
    const ids = result.map((s) => s.speciesId);
    expect(ids.sort()).toEqual(["articuno", "moltres", "zapdos"]);
  });
});

describe("pickGraduationCandidates - 전설 wave 1 (legendary-birds)", () => {
  it("미졸업 전설 새 풀을 그대로 반환 (3마리)", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: [],
      legendaryStage: "legendary-birds",
      allSpecies,
    });
    const ids = result.map((s) => s.speciesId);
    expect(ids.sort()).toEqual(["articuno", "moltres", "zapdos"]);
  });

  it("1마리 졸업 시 풀이 2마리로 줄어듦", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: ["articuno"],
      legendaryStage: "legendary-birds",
      allSpecies,
    });
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.speciesId)).not.toContain("articuno");
  });

  it("현재 졸업 중인 전설 새는 다음 후보에서 제외", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: ["articuno"],
      graduatingSpeciesId: "zapdos",
      legendaryStage: "legendary-birds",
      allSpecies,
    });
    expect(result).toHaveLength(1);
    expect(result[0].speciesId).toBe("moltres");
  });

  it("마지막 전설 새 졸업 시 뮤츠 단독 후보로 전환", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: ["articuno", "zapdos"],
      graduatingSpeciesId: "moltres",
      legendaryStage: "legendary-birds",
      allSpecies,
    });
    expect(result).toHaveLength(1);
    expect(result[0].speciesId).toBe("mewtwo");
  });

  it("3마리 모두 졸업 시 뮤츠 단독 후보로 전환", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: ["articuno", "zapdos", "moltres"],
      legendaryStage: "legendary-birds",
      allSpecies,
    });
    expect(result).toHaveLength(1);
    expect(result[0].speciesId).toBe("mewtwo");
  });
});

describe("pickGraduationCandidates - 전설 wave 2 (mewtwo)", () => {
  it("미졸업 뮤츠 단독 후보", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: [],
      legendaryStage: "mewtwo",
      allSpecies,
    });
    expect(result).toHaveLength(1);
    expect(result[0].speciesId).toBe("mewtwo");
  });

  it("뮤츠 졸업 후 뮤 단독 후보로 전환", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: ["mewtwo"],
      legendaryStage: "mewtwo",
      allSpecies,
    });
    expect(result).toHaveLength(1);
    expect(result[0].speciesId).toBe("mew");
  });

  it("현재 뮤츠가 졸업 중이면 뮤 단독 후보로 전환", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: [],
      graduatingSpeciesId: "mewtwo",
      legendaryStage: "mewtwo",
      allSpecies,
    });
    expect(result).toHaveLength(1);
    expect(result[0].speciesId).toBe("mew");
  });
});

describe("pickGraduationCandidates - 전설 wave 3 (mew)", () => {
  it("미졸업 뮤 단독 후보", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: [],
      legendaryStage: "mew",
      allSpecies,
    });
    expect(result).toHaveLength(1);
    expect(result[0].speciesId).toBe("mew");
  });

  it("뮤 졸업 후 빈 배열 반환 (엔딩 시점)", () => {
    const result = pickGraduationCandidates({
      unlockedSpeciesIds: [],
      graduatedSpeciesIds: ["mew"],
      legendaryStage: "mew",
      allSpecies,
    });
    expect(result).toEqual([]);
  });
});
