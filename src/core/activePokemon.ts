import type { PokemonSpecies } from "@/content/pokemon/types";
import type { PokemonInstance } from "@/core/types";

interface ResolveActivePokemonInput {
  activeInstanceId: string | null;
  instances: PokemonInstance[];
  allSpecies: PokemonSpecies[];
}

export function resolveActivePokemon({
  activeInstanceId,
  instances,
  allSpecies,
}: ResolveActivePokemonInput) {
  const activeInstance =
    instances.find((instance) => instance.instanceId === activeInstanceId) ?? null;
  const activeSpecies = activeInstance
    ? (allSpecies.find((species) => species.speciesId === activeInstance.speciesId) ?? null)
    : null;

  return { activeInstance, activeSpecies };
}
