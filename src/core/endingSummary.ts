import type { PokemonSpecies } from "@/content/pokemon/types";
import type { PokemonInstance } from "@/stores/types";

export interface EndingStats {
  totalAttempts: number;
  totalCorrect: number;
  totalWrong: number;
}

export interface EndingSummary {
  unlockedCount: number;
  pokedexPercent: number;
  isPokedexComplete: boolean;
  graduatedSpecies: PokemonSpecies[];
}

interface ResolveEndingStatsArgs {
  totalAttempts: number;
  totalCorrect: number;
}

interface ResolveEndingSummaryArgs {
  unlockedSpeciesIds: string[];
  instances: PokemonInstance[];
  allSpecies: PokemonSpecies[];
  totalDex: number;
}

export function resolveEndingStats({
  totalAttempts,
  totalCorrect,
}: ResolveEndingStatsArgs): EndingStats {
  const normalizedAttempts = Math.max(totalAttempts, 0);
  const normalizedCorrect = Math.min(Math.max(totalCorrect, 0), normalizedAttempts);

  return {
    totalAttempts: normalizedAttempts,
    totalCorrect: normalizedCorrect,
    totalWrong: normalizedAttempts - normalizedCorrect,
  };
}

export function resolveEndingSummary({
  unlockedSpeciesIds,
  instances,
  allSpecies,
  totalDex,
}: ResolveEndingSummaryArgs): EndingSummary {
  const unlockedCount = new Set(unlockedSpeciesIds).size;
  const graduatedSpeciesIds = new Set(
    instances.filter((instance) => instance.graduated).map((instance) => instance.speciesId),
  );
  const graduatedSpecies = allSpecies
    .filter((species) => graduatedSpeciesIds.has(species.speciesId))
    .sort((firstSpecies, secondSpecies) => firstSpecies.dexNumber - secondSpecies.dexNumber);

  return {
    unlockedCount,
    pokedexPercent: Math.min(Math.floor((unlockedCount / totalDex) * 100), 100),
    isPokedexComplete: unlockedCount >= totalDex,
    graduatedSpecies,
  };
}
