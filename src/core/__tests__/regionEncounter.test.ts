import { describe, expect, it } from "vitest";
import {
  getKoreanSubjectParticle,
  isEncounterSuccessful,
  pickEncounterSpecies,
  pickSearchTarget,
} from "@/core/regionEncounter";
import type { PokemonSpecies } from "@/content/pokemon/types";

const speciesPool: PokemonSpecies[] = [
  {
    speciesId: "bulbasaur",
    dexNumber: 1,
    nameKo: "이상해씨",
    nameEn: "Bulbasaur",
    category: "normal",
    isStarter: true,
    evolutionStage: 1,
    evolutionLine: ["bulbasaur", "ivysaur", "venusaur"],
    nextEvolutionSpeciesId: "ivysaur",
    branchEvolutionSpeciesIds: [],
  },
  {
    speciesId: "charizard",
    dexNumber: 6,
    nameKo: "리자몽",
    nameEn: "Charizard",
    category: "normal",
    isStarter: false,
    evolutionStage: 3,
    evolutionLine: ["charmander", "charmeleon", "charizard"],
    nextEvolutionSpeciesId: null,
    branchEvolutionSpeciesIds: [],
  },
];

describe("regionEncounter", () => {
  it("조우 확률과 랜덤 값으로 성공 여부를 판정", () => {
    expect(isEncounterSuccessful(50, 0.49)).toBe(true);
    expect(isEncounterSuccessful(50, 0.5)).toBe(false);
  });

  it("조우 확률을 0~100 사이로 보정", () => {
    expect(isEncounterSuccessful(-10, 0)).toBe(false);
    expect(isEncounterSuccessful(120, 0.999)).toBe(true);
  });

  it("탐색 대상 목록에서 랜덤 값에 맞는 항목을 선택", () => {
    const targets = ["풀숲을", "나무 그늘을", "작은 바위를"];

    expect(pickSearchTarget(targets, 0)).toBe("풀숲을");
    expect(pickSearchTarget(targets, 0.34)).toBe("나무 그늘을");
    expect(pickSearchTarget(targets, 0.99)).toBe("작은 바위를");
  });

  it("탐색 대상 목록이 비어 있으면 null을 반환", () => {
    expect(pickSearchTarget([], 0.5)).toBeNull();
  });

  it("조우 포켓몬 풀에서 랜덤 값에 맞는 포켓몬을 선택", () => {
    expect(pickEncounterSpecies(speciesPool, 0)?.speciesId).toBe("bulbasaur");
    expect(pickEncounterSpecies(speciesPool, 0.5)?.speciesId).toBe("charizard");
  });

  it("포켓몬 풀이 비어 있으면 null을 반환", () => {
    expect(pickEncounterSpecies([], 0.5)).toBeNull();
  });

  it("한글 받침 여부에 따라 주격 조사를 선택", () => {
    expect(getKoreanSubjectParticle("이상해씨")).toBe("가");
    expect(getKoreanSubjectParticle("리자몽")).toBe("이");
  });

  it("비한글 또는 빈 문자열은 가를 반환", () => {
    expect(getKoreanSubjectParticle("Mew")).toBe("가");
    expect(getKoreanSubjectParticle("")).toBe("가");
  });
});
