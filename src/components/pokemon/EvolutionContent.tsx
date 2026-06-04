import { getSpriteUrl } from "@/content/pokemon/types";
import type { PokemonSpecies } from "@/content/pokemon/types";

interface Props {
  currentSpecies: PokemonSpecies;
  nextSpecies: PokemonSpecies;
  submitting: boolean;
  onEvolve: () => void;
}

export function EvolutionContent({ currentSpecies, nextSpecies, submitting, onEvolve }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-xl font-bold">진화할 수 있어요!</h2>
      <p className="text-sm text-gray-500">
        다음 단계로 진화하면 도감에 새 포켓몬이 등록되고 학습을 이어갈 수 있어요.
      </p>

      <div className="flex items-center gap-3">
        <figure className="flex flex-col items-center gap-1">
          <img
            src={getSpriteUrl(currentSpecies.dexNumber)}
            alt={currentSpecies.nameKo}
            className="w-24 h-24 [image-rendering:pixelated] opacity-60"
            loading="lazy"
          />
          <figcaption className="text-sm text-gray-500">{currentSpecies.nameKo}</figcaption>
        </figure>
        <span aria-hidden="true" className="text-3xl text-gray-400">
          →
        </span>
        <figure className="flex flex-col items-center gap-1">
          <img
            src={getSpriteUrl(nextSpecies.dexNumber)}
            alt={nextSpecies.nameKo}
            className="w-28 h-28 [image-rendering:pixelated] drop-shadow-md"
            loading="lazy"
          />
          <figcaption className="text-sm font-bold text-gray-800">{nextSpecies.nameKo}</figcaption>
        </figure>
      </div>

      <div className="w-full">
        <button
          type="button"
          onClick={onEvolve}
          disabled={submitting}
          className="w-full px-5 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          진화한다
        </button>
      </div>
    </div>
  );
}
