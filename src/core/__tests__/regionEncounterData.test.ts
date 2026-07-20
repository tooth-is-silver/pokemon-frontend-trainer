import { describe, expect, it } from "vitest";
import { getAllSpecies } from "@/content/pokemon";
import { regionEncounterPools, regions } from "@/content/regions";

const SHARED_NORMAL_SPECIES_IDS = ["ditto", "eevee"];
const LEGENDARY_SPECIES_IDS = ["articuno", "mewtwo", "moltres", "zapdos"];
const EXPECTED_RARITIES = ["common", "rare", "uncommon", "very-rare"];

describe("regionEncounterData", () => {
  it("모든 지역에 하나의 출현 풀을 정의", () => {
    const regionIds = regions.map((region) => region.regionId).sort();
    const encounterRegionIds = regionEncounterPools.map((pool) => pool.regionId).sort();

    expect(encounterRegionIds).toEqual(regionIds);
  });

  it("지역별 희귀도와 고정 출현 확률의 합이 100", () => {
    regionEncounterPools.forEach((pool) => {
      const rarities = pool.tiers.map((tier) => tier.rarity).sort();
      const tierRateTotal = pool.tiers.reduce((total, tier) => total + tier.ratePercent, 0);
      const fixedRateTotal = pool.fixedEncounters.reduce(
        (total, encounter) => total + encounter.ratePercent,
        0,
      );

      expect(rarities).toEqual(EXPECTED_RARITIES);
      expect(pool.tiers.every((tier) => tier.speciesIds.length > 0)).toBe(true);
      expect(tierRateTotal + fixedRateTotal).toBe(100);
    });
  });

  it("공통 출현종을 제외한 일반 144종을 한 지역에만 배치", () => {
    const expectedSpeciesIds = getAllSpecies()
      .filter(
        (species) =>
          species.category === "normal" && !SHARED_NORMAL_SPECIES_IDS.includes(species.speciesId),
      )
      .map((species) => species.speciesId)
      .sort();
    const actualSpeciesIds = regionEncounterPools
      .flatMap((pool) => pool.tiers)
      .flatMap((tier) => tier.speciesIds)
      .sort();

    expect(new Set(actualSpeciesIds).size).toBe(actualSpeciesIds.length);
    expect(actualSpeciesIds).toEqual(expectedSpeciesIds);
  });

  it("이브이와 메타몽의 지역과 확률을 정책대로 정의", () => {
    const dittoEncounters = regionEncounterPools.flatMap((pool) =>
      pool.fixedEncounters
        .filter((encounter) => encounter.speciesId === "ditto")
        .map((encounter) => ({ ...encounter, regionId: pool.regionId })),
    );
    const eeveeEncounters = regionEncounterPools.flatMap((pool) =>
      pool.fixedEncounters
        .filter((encounter) => encounter.speciesId === "eevee")
        .map((encounter) => ({ ...encounter, regionId: pool.regionId })),
    );

    expect(dittoEncounters).toHaveLength(regions.length);
    expect(
      dittoEncounters.every(
        (encounter) => encounter.ratePercent === 2 && encounter.unlockCondition === "always",
      ),
    ).toBe(true);
    expect(eeveeEncounters.map((encounter) => encounter.regionId).sort()).toEqual([
      "ashen-mountain",
      "neon-city",
      "sky-garden",
    ]);
    expect(
      eeveeEncounters.every(
        (encounter) => encounter.ratePercent === 5 && encounter.unlockCondition === "always",
      ),
    ).toBe(true);
  });

  it("전설 4종의 지역, 확률, 해금 조건을 정의하고 뮤는 제외", () => {
    const legendaryEncounters = regionEncounterPools
      .flatMap((pool) =>
        pool.fixedEncounters.map((encounter) => ({ ...encounter, regionId: pool.regionId })),
      )
      .filter((encounter) => LEGENDARY_SPECIES_IDS.includes(encounter.speciesId));
    const mewEncounter = regionEncounterPools
      .flatMap((pool) => pool.fixedEncounters)
      .find((encounter) => encounter.speciesId === "mew");

    expect(legendaryEncounters).toEqual([
      {
        speciesId: "zapdos",
        ratePercent: 1,
        unlockCondition: "normal-pokedex-completed",
        regionId: "misty-shore",
      },
      {
        speciesId: "moltres",
        ratePercent: 1,
        unlockCondition: "normal-pokedex-completed",
        regionId: "ashen-mountain",
      },
      {
        speciesId: "articuno",
        ratePercent: 1,
        unlockCondition: "normal-pokedex-completed",
        regionId: "sky-garden",
      },
      {
        speciesId: "mewtwo",
        ratePercent: 1,
        unlockCondition: "legendary-birds-completed",
        regionId: "neon-city",
      },
    ]);
    expect(mewEncounter).toBeUndefined();
  });
});
