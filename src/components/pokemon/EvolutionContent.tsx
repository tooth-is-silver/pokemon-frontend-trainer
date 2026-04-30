import { getSpriteUrl } from "@/content/pokemon/types";
import type { PokemonSpecies } from "@/content/pokemon/types";

interface Props {
  currentSpecies: PokemonSpecies;
  nextSpecies: PokemonSpecies;
  submitting: boolean;
  onEvolve: () => void;
  onSkip: () => void;
}

export function EvolutionContent({
  currentSpecies,
  nextSpecies,
  submitting,
  onEvolve,
  onSkip,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-xl font-bold">진화할 수 있어요!</h2>
      <p className="text-sm text-gray-500">
        다음 단계로 진화할지 선택하세요. 보류해도 조건이 유지되면 다시 안내돼요.
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

      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={onSkip}
          disabled={submitting}
          className="flex-1 px-5 py-3 rounded-xl border-2 border-gray-200 font-semibold hover:border-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          보류
        </button>
        <button
          type="button"
          onClick={onEvolve}
          disabled={submitting}
          className="flex-1 px-5 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          진화한다
        </button>
      </div>
    </div>
  );
}
