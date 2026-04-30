import { getSpriteUrl } from "@/content/pokemon/types";
import type { PokemonSpecies } from "@/content/pokemon/types";

interface Props {
  dexNumber: number;
  species: PokemonSpecies | null;
  unlocked: boolean;
}

export function PokedexCard({ dexNumber, species, unlocked }: Props) {
  const showMeta = unlocked && species;
  const label = showMeta ? species.nameKo : `미획득 #${dexNumber}`;

  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 bg-white">
      <span className="text-[10px] text-gray-400 tabular-nums">
        #{String(dexNumber).padStart(3, "0")}
      </span>
      <img
        src={getSpriteUrl(dexNumber)}
        alt={label}
        loading="lazy"
        className={`w-14 h-14 [image-rendering:pixelated] ${
          unlocked ? "" : "brightness-0 opacity-20"
        }`}
      />
      <span className="text-[11px] text-center line-clamp-1 w-full">
        {showMeta ? species.nameKo : "???"}
      </span>
    </div>
  );
}
