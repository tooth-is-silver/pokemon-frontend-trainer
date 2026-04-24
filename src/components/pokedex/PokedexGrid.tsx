import { starters } from "@/content/pokemon/starters";
import { TOTAL_DEX, type PokemonSpecies } from "@/content/pokemon/types";
import { PokedexCard } from "./PokedexCard";

function findSpeciesByDex(dexNumber: number): PokemonSpecies | null {
  return starters.find((s) => s.dexNumber === dexNumber) ?? null;
}

interface Props {
  unlockedSpeciesIds: string[];
}

export function PokedexGrid({ unlockedSpeciesIds }: Props) {
  const unlockedSet = new Set(unlockedSpeciesIds);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
      {Array.from({ length: TOTAL_DEX }, (_, i) => {
        const dexNumber = i + 1;
        const species = findSpeciesByDex(dexNumber);
        const unlocked = species ? unlockedSet.has(species.speciesId) : false;
        return (
          <PokedexCard
            key={dexNumber}
            dexNumber={dexNumber}
            species={species}
            unlocked={unlocked}
          />
        );
      })}
    </div>
  );
}
