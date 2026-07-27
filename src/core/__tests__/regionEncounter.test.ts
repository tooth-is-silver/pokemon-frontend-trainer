import { describe, expect, it } from "vitest";
import {
  createRegionSearchState,
  getKoreanSubjectParticle,
  isEncounterSuccessful,
  isRegionUnlocked,
  isSpeciesInRegionEncounterPool,
  pickEncounterSpecies,
  pickRegionEncounterSpeciesId,
  pickSearchTarget,
  regionSearchReducer,
  resolveRegionEncounter,
  resolveRegionPokedexProgress,
} from "@/core/regionEncounter";
import type { PokemonSpecies } from "@/content/pokemon/types";
import { regionEncounterPools, regions } from "@/content/regions";

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
const sproutEncounterPool = regionEncounterPools.find((pool) => pool.regionId === "sprout-field");
if (!sproutEncounterPool) throw new Error("초록 평원 출현 풀이 필요합니다.");

describe("regionEncounter", () => {
  it("선택, 탐색, 조우, 닫기 상태를 일관된 형태로 전환", () => {
    const initialState = createRegionSearchState("sprout-field");
    const searchingState = regionSearchReducer(initialState, {
      type: "searchStarted",
      searchTarget: "풀숲을",
    });
    const encounteredState = regionSearchReducer(searchingState, {
      type: "searchResolved",
      result: {
        searchStatus: "encountered",
        encounteredSpeciesId: "bulbasaur",
      },
    });

    expect(searchingState).toEqual({
      selectedRegionId: "sprout-field",
      searchStatus: "searching",
      searchTarget: "풀숲을",
      encounteredSpeciesId: null,
    });
    expect(encounteredState).toMatchObject({
      searchStatus: "encountered",
      encounteredSpeciesId: "bulbasaur",
    });
    expect(regionSearchReducer(encounteredState, { type: "searchClosed" })).toEqual(initialState);
  });

  it("지역을 바꾸면 이전 탐색 결과를 초기화", () => {
    const previousState = {
      selectedRegionId: "sprout-field",
      searchStatus: "missed" as const,
      searchTarget: "풀숲을",
      encounteredSpeciesId: null,
    };

    expect(
      regionSearchReducer(previousState, {
        type: "regionSelected",
        regionId: "misty-shore",
      }),
    ).toEqual(createRegionSearchState("misty-shore"));
  });

  it("확률 판정과 포켓몬 선택 결과를 하나의 조우 결과로 반환", () => {
    expect(
      resolveRegionEncounter({
        encounterRatePercent: 50,
        encounterPool: sproutEncounterPool,
        normalPokedexCompleted: false,
        unlockedSpeciesIds: [],
        encounterRandomValue: 0.49,
        speciesRandomValue: 0,
      }),
    ).toEqual({
      searchStatus: "encountered",
      encounteredSpeciesId: "bulbasaur",
    });

    expect(
      resolveRegionEncounter({
        encounterRatePercent: 50,
        encounterPool: sproutEncounterPool,
        normalPokedexCompleted: false,
        unlockedSpeciesIds: [],
        encounterRandomValue: 0.5,
        speciesRandomValue: 0,
      }),
    ).toEqual({
      searchStatus: "missed",
      encounteredSpeciesId: null,
    });
  });

  it("조우 성공이어도 포켓몬 풀이 비어 있으면 실패로 처리", () => {
    expect(
      resolveRegionEncounter({
        encounterRatePercent: 100,
        encounterPool: null,
        normalPokedexCompleted: false,
        unlockedSpeciesIds: [],
        encounterRandomValue: 0,
        speciesRandomValue: 0,
      }),
    ).toEqual({
      searchStatus: "missed",
      encounteredSpeciesId: null,
    });
  });

  it("조우 확률과 랜덤 값으로 성공 여부를 판정", () => {
    expect(isEncounterSuccessful(50, 0.49)).toBe(true);
    expect(isEncounterSuccessful(50, 0.5)).toBe(false);
  });

  it("각 지역은 요구 도감 수에 도달한 시점부터 해금", () => {
    regions.forEach((region) => {
      expect(isRegionUnlocked(region, region.unlockRequiredPokedexCount)).toBe(true);
      expect(isRegionUnlocked(region, region.unlockRequiredPokedexCount - 1)).toBe(false);
    });
  });

  it("지역 출현 목록과 조우 기록의 교집합으로 지역 도감 진행률을 계산", () => {
    expect(
      resolveRegionPokedexProgress(sproutEncounterPool, ["bulbasaur", "ditto", "pikachu"]),
    ).toEqual({
      encounteredCount: 2,
      totalCount: 24,
    });
    expect(resolveRegionPokedexProgress(null, ["ditto"])).toEqual({
      encounteredCount: 0,
      totalCount: 0,
    });
  });

  it("공통 출현 포켓몬은 한 번의 조우 기록으로 각 지역 도감에 반영", () => {
    const volcanoPool = regionEncounterPools.find((pool) => pool.regionId === "ashen-mountain");
    const icePalacePool = regionEncounterPools.find((pool) => pool.regionId === "sky-garden");
    if (!volcanoPool || !icePalacePool) throw new Error("공통 출현 지역 풀이 필요합니다.");

    expect(resolveRegionPokedexProgress(volcanoPool, ["eevee", "ditto"]).encounteredCount).toBe(2);
    expect(resolveRegionPokedexProgress(icePalacePool, ["eevee", "ditto"]).encounteredCount).toBe(
      2,
    );
  });

  it("지역 출현 목록에 포함된 포켓몬만 조우 문제 대상으로 인정", () => {
    expect(isSpeciesInRegionEncounterPool(sproutEncounterPool, "bulbasaur")).toBe(true);
    expect(isSpeciesInRegionEncounterPool(sproutEncounterPool, "ditto")).toBe(true);
    expect(isSpeciesInRegionEncounterPool(sproutEncounterPool, "pikachu")).toBe(false);
    expect(isSpeciesInRegionEncounterPool(null, "bulbasaur")).toBe(false);
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

  it("지역 희귀도 구간과 고정 출현 확률에 따라 포켓몬을 선택", () => {
    const encounterPool = regionEncounterPools.find((pool) => pool.regionId === "sprout-field");
    if (!encounterPool) throw new Error("초록 평원 출현 풀이 필요합니다.");

    const pickSpecies = (randomValue: number) =>
      pickRegionEncounterSpeciesId({
        encounterPool,
        normalPokedexCompleted: false,
        unlockedSpeciesIds: [],
        randomValue,
      });

    expect(pickSpecies(0)).toBe("bulbasaur");
    expect(pickSpecies(0.64)).toBe("tangela");
    expect(pickSpecies(0.84)).toBe("ivysaur");
    expect(pickSpecies(0.94)).toBe("venusaur");
    expect(pickSpecies(0.98)).toBe("ditto");
  });

  it("일반 도감 완성 전에는 전설 확률을 일반 슬롯에 합산", () => {
    const encounterPool = regionEncounterPools.find((pool) => pool.regionId === "misty-shore");
    if (!encounterPool) throw new Error("물안개 해안 출현 풀이 필요합니다.");

    const lockedResult = pickRegionEncounterSpeciesId({
      encounterPool,
      normalPokedexCompleted: false,
      unlockedSpeciesIds: [],
      randomValue: 0.995,
    });
    const unlockedResult = pickRegionEncounterSpeciesId({
      encounterPool,
      normalPokedexCompleted: true,
      unlockedSpeciesIds: [],
      randomValue: 0.995,
    });

    expect(lockedResult).toBe("ditto");
    expect(unlockedResult).toBe("zapdos");
  });

  it("전설의 새 3종 등록 후에만 뮤츠를 출현 대상에 포함", () => {
    const encounterPool = regionEncounterPools.find((pool) => pool.regionId === "neon-city");
    if (!encounterPool) throw new Error("현대 도시 출현 풀이 필요합니다.");

    const lockedResult = pickRegionEncounterSpeciesId({
      encounterPool,
      normalPokedexCompleted: true,
      unlockedSpeciesIds: ["articuno", "zapdos"],
      randomValue: 0.995,
    });
    const unlockedResult = pickRegionEncounterSpeciesId({
      encounterPool,
      normalPokedexCompleted: true,
      unlockedSpeciesIds: ["articuno", "zapdos", "moltres"],
      randomValue: 0.995,
    });

    expect(lockedResult).toBe("ditto");
    expect(unlockedResult).toBe("mewtwo");
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
