import type { PokemonSpecies } from "@/content/pokemon/types";

export function resolveGraduationEvolutionLine(
  evolutionLineSpeciesIds: string[],
  resolveSpecies: (speciesId: string) => PokemonSpecies | null,
) {
  const resolved = evolutionLineSpeciesIds.map((speciesId) => ({
    speciesId,
    species: resolveSpecies(speciesId),
  }));

  return {
    missingSpeciesIds: resolved
      .filter(({ species }) => species === null)
      .map(({ speciesId }) => speciesId),
    validSpecies: resolved.flatMap(({ species }) => (species ? [species] : [])),
  };
}
