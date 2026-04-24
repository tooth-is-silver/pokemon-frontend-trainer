import { getSpriteUrl } from "@/content/pokemon/types";
import type { PokemonSpecies } from "@/content/pokemon/types";
import type { PokemonInstance } from "@/stores/types";
import { PokemonStats } from "./PokemonStats";

interface Props {
  instance: PokemonInstance;
  species: PokemonSpecies | null;
  isActive: boolean;
  switching: boolean;
  onSetActive: () => void;
}

export function PartyMemberCard({ instance, species, isActive, switching, onSetActive }: Props) {
  const displayName = species?.nameKo ?? `#${instance.speciesId}`;
  const maxStage = species?.evolutionLine.length ?? instance.currentStage;

  return (
    <article
      className={`flex flex-col gap-3 p-5 rounded-2xl border bg-white transition-all ${
        isActive
          ? "border-blue-400 shadow-md ring-2 ring-blue-100"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <header className="flex items-center gap-3">
        {species && (
          <img
            src={getSpriteUrl(species.dexNumber)}
            alt={displayName}
            className="w-16 h-16 image-rendering-pixelated"
            loading="lazy"
          />
        )}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{displayName}</h3>
            {isActive && (
              <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                활성
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>
              진화 {instance.currentStage} / {maxStage}
            </span>
            {instance.graduated && <span className="font-bold text-amber-600">🎓 졸업</span>}
            {instance.evolutionPending && (
              <span className="font-bold text-emerald-600">✨ 진화 대기</span>
            )}
          </div>
        </div>
      </header>

      <PokemonStats stats={instance.stats} />

      <button
        type="button"
        onClick={onSetActive}
        disabled={isActive || switching}
        className="self-end px-4 py-2 rounded-lg text-sm font-semibold border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isActive ? "현재 활성" : "이 포켓몬으로 학습"}
      </button>
    </article>
  );
}
