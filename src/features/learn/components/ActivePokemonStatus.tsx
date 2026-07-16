import { PokemonCard } from "@/components/pokemon/PokemonCard";
import { PokemonExp } from "@/components/pokemon/PokemonExp";
import type { PokemonSpecies } from "@/content/pokemon/types";
import type { PokemonInstance } from "@/stores/types";

interface Props {
  species: PokemonSpecies;
  instance: PokemonInstance;
  streak: number;
}

export function ActivePokemonStatus({ species, instance, streak }: Props) {
  return (
    <section className="flex w-full max-w-lg flex-col items-center gap-4">
      <PokemonCard species={species} />
      <PokemonExp exp={instance.exp} />
      {streak > 0 && (
        <p className="text-sm text-gray-500" aria-live="polite">
          연속 정답 <span className="font-bold text-blue-600">{streak}</span>개
        </p>
      )}
    </section>
  );
}
