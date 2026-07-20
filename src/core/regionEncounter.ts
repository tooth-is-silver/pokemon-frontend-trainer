import type { PokemonSpecies } from "@/content/pokemon/types";
import type { FixedRegionEncounter, Region, RegionEncounterPool } from "@/content/regions";

const MAX_RANDOM_VALUE = 1 - Number.EPSILON;
const LEGENDARY_BIRD_IDS = ["articuno", "zapdos", "moltres"];
const TOTAL_PERCENT = 100;

export type RegionSearchStatus = "idle" | "searching" | "missed" | "encountered";

export interface RegionSearchState {
  selectedRegionId: string;
  searchStatus: RegionSearchStatus;
  searchTarget: string | null;
  encounteredSpeciesId: string | null;
}

interface RegionEncounterResult {
  searchStatus: "missed" | "encountered";
  encounteredSpeciesId: string | null;
}

interface ResolveRegionEncounterInput {
  encounterRatePercent: number;
  speciesPool: PokemonSpecies[];
  encounterRandomValue: number;
  speciesRandomValue: number;
}

interface PickRegionEncounterSpeciesInput {
  encounterPool: RegionEncounterPool;
  normalPokedexCompleted: boolean;
  unlockedSpeciesIds: string[];
  randomValue: number;
}

type RegionSearchAction =
  | { type: "regionSelected"; regionId: string }
  | { type: "searchStarted"; searchTarget: string | null }
  | { type: "searchResolved"; result: RegionEncounterResult }
  | { type: "searchClosed" };

export function createRegionSearchState(selectedRegionId: string): RegionSearchState {
  return {
    selectedRegionId,
    searchStatus: "idle",
    searchTarget: null,
    encounteredSpeciesId: null,
  };
}

export function regionSearchReducer(
  state: RegionSearchState,
  action: RegionSearchAction,
): RegionSearchState {
  if (action.type === "regionSelected") {
    return createRegionSearchState(action.regionId);
  }

  if (action.type === "searchStarted") {
    return {
      ...state,
      searchStatus: "searching",
      searchTarget: action.searchTarget,
      encounteredSpeciesId: null,
    };
  }

  if (action.type === "searchResolved") {
    return {
      ...state,
      ...action.result,
    };
  }

  return createRegionSearchState(state.selectedRegionId);
}

export function resolveRegionEncounter({
  encounterRatePercent,
  speciesPool,
  encounterRandomValue,
  speciesRandomValue,
}: ResolveRegionEncounterInput): RegionEncounterResult {
  if (!isEncounterSuccessful(encounterRatePercent, encounterRandomValue)) {
    return { searchStatus: "missed", encounteredSpeciesId: null };
  }

  const encounteredSpecies = pickEncounterSpecies(speciesPool, speciesRandomValue);

  return encounteredSpecies
    ? {
        searchStatus: "encountered",
        encounteredSpeciesId: encounteredSpecies.speciesId,
      }
    : { searchStatus: "missed", encounteredSpeciesId: null };
}

export function isRegionUnlocked(region: Region, unlockedPokedexCount: number) {
  return unlockedPokedexCount >= region.unlockRequiredPokedexCount;
}

export function isEncounterSuccessful(encounterRatePercent: number, randomValue: number): boolean {
  return (
    normalizeRandomValue(randomValue) * TOTAL_PERCENT < clampEncounterRate(encounterRatePercent)
  );
}

export function pickSearchTarget(searchTargets: string[], randomValue: number): string | null {
  return pickRandomItem(searchTargets, randomValue);
}

export function pickEncounterSpecies(
  speciesPool: PokemonSpecies[],
  randomValue: number,
): PokemonSpecies | null {
  return pickRandomItem(speciesPool, randomValue);
}

export function pickRegionEncounterSpeciesId({
  encounterPool,
  normalPokedexCompleted,
  unlockedSpeciesIds,
  randomValue,
}: PickRegionEncounterSpeciesInput): string | null {
  const unlockedSpecies = new Set(unlockedSpeciesIds);
  const lockedRatePercent = encounterPool.fixedEncounters
    .filter(
      (encounter) => !isFixedEncounterUnlocked(encounter, normalPokedexCompleted, unlockedSpecies),
    )
    .reduce((total, encounter) => total + encounter.ratePercent, 0);
  const unlockedFixedEncounters = encounterPool.fixedEncounters.filter((encounter) =>
    isFixedEncounterUnlocked(encounter, normalPokedexCompleted, unlockedSpecies),
  );
  const weightedRandomValue = normalizeRandomValue(randomValue) * TOTAL_PERCENT;
  let cumulativeRatePercent = 0;

  for (const tier of encounterPool.tiers) {
    const tierRatePercent = tier.ratePercent + (tier.rarity === "common" ? lockedRatePercent : 0);
    const nextCumulativeRatePercent = cumulativeRatePercent + tierRatePercent;

    if (weightedRandomValue < nextCumulativeRatePercent) {
      const tierRandomValue = (weightedRandomValue - cumulativeRatePercent) / tierRatePercent;
      return pickRandomItem(tier.speciesIds, tierRandomValue);
    }

    cumulativeRatePercent = nextCumulativeRatePercent;
  }

  for (const encounter of unlockedFixedEncounters) {
    cumulativeRatePercent += encounter.ratePercent;
    if (weightedRandomValue < cumulativeRatePercent) return encounter.speciesId;
  }

  const lastFixedEncounter = unlockedFixedEncounters.at(-1);
  if (lastFixedEncounter) return lastFixedEncounter.speciesId;

  const lastTier = encounterPool.tiers.at(-1);
  return lastTier ? (lastTier.speciesIds.at(-1) ?? null) : null;
}

export function getKoreanSubjectParticle(value: string): "이" | "가" {
  const lastChar = value.at(-1);
  if (!lastChar) return "가";

  const codePoint = lastChar.charCodeAt(0);
  const hangulStart = 0xac00;
  const hangulEnd = 0xd7a3;

  if (codePoint < hangulStart || codePoint > hangulEnd) return "가";

  return (codePoint - hangulStart) % 28 === 0 ? "가" : "이";
}

function pickRandomItem<T>(items: T[], randomValue: number): T | null {
  if (items.length === 0) return null;

  const index = Math.floor(normalizeRandomValue(randomValue) * items.length);

  return items[index] ?? null;
}

function normalizeRandomValue(randomValue: number): number {
  if (randomValue < 0) return 0;
  if (randomValue >= 1) return MAX_RANDOM_VALUE;
  return randomValue;
}

function clampEncounterRate(encounterRatePercent: number): number {
  if (encounterRatePercent < 0) return 0;
  if (encounterRatePercent > TOTAL_PERCENT) return TOTAL_PERCENT;
  return encounterRatePercent;
}

function isFixedEncounterUnlocked(
  encounter: FixedRegionEncounter,
  normalPokedexCompleted: boolean,
  unlockedSpecies: Set<string>,
): boolean {
  if (encounter.unlockCondition === "always") return true;
  if (encounter.unlockCondition === "normal-pokedex-completed") {
    return normalPokedexCompleted;
  }

  return LEGENDARY_BIRD_IDS.every((speciesId) => unlockedSpecies.has(speciesId));
}
