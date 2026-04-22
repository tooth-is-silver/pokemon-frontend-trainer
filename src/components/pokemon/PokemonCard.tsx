import { getSpriteUrl } from "@/content/pokemon/types";
import type { PokemonSpecies } from "@/content/pokemon/types";

interface Props {
  species: PokemonSpecies;
}

export function PokemonCard({ species }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={getSpriteUrl(species.dexNumber)}
        alt={species.nameKo}
        className="w-32 h-32 image-rendering-pixelated"
        loading="lazy"
      />
      <span className="text-xl font-bold">{species.nameKo}</span>
      <span className="text-xs text-gray-400">{species.nameEn}</span>
    </div>
  );
}
