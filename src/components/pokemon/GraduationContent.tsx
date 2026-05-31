import { getSpriteUrl } from "@/content/pokemon/types";
import { findSpeciesById } from "@/content/pokemon";
import type { PokemonSpecies } from "@/content/pokemon/types";
import type { PokemonStats as Stats } from "@/stores/types";
import { PokemonStats } from "./PokemonStats";

interface Props {
  graduatedSpecies: PokemonSpecies;
  graduatedStats: Stats;
  candidates: PokemonSpecies[];
  submitting: boolean;
  selectedSpeciesId: string | null;
  onSelect: (speciesId: string) => void;
}

export function GraduationContent({
  graduatedSpecies,
  graduatedStats,
  candidates,
  submitting,
  selectedSpeciesId,
  onSelect,
}: Props) {
  const evolutionLine = graduatedSpecies.evolutionLine
    .map((speciesId) => findSpeciesById(speciesId))
    .filter((species): species is PokemonSpecies => species !== null);

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="text-3xl" aria-hidden="true">
          🎓
        </span>
        <h2 className="text-xl font-bold">{graduatedSpecies.nameKo} 졸업!</h2>
        <p className="text-sm text-gray-500">
          다음으로 함께할 포켓몬을 선택하세요. 한 번 시작하면 이 친구도 끝까지 함께해요.
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex flex-col items-center gap-3">
          <img
            src={getSpriteUrl(graduatedSpecies.dexNumber)}
            alt={graduatedSpecies.nameKo}
            className="w-20 h-20 [image-rendering:pixelated]"
            loading="lazy"
          />
          <div className="text-center">
            <p className="text-xs font-semibold text-amber-700">졸업 포켓몬</p>
            <p className="font-bold text-gray-900">{graduatedSpecies.nameKo}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2" aria-label="진화 라인">
          {evolutionLine.map((species, index) => (
            <div key={species.speciesId} className="flex items-center gap-2">
              {index > 0 && <span className="text-gray-300">→</span>}
              <div
                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
                  species.speciesId === graduatedSpecies.speciesId
                    ? "border-amber-400 bg-white text-amber-800"
                    : "border-gray-200 bg-white/70 text-gray-600"
                }`}
              >
                <img
                  src={getSpriteUrl(species.dexNumber)}
                  alt=""
                  className="w-6 h-6 [image-rendering:pixelated]"
                  loading="lazy"
                />
                {species.nameKo}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold text-gray-500">최종 스탯</p>
          <PokemonStats stats={graduatedStats} />
        </div>
      </section>

      {candidates.length === 0 ? (
        <p className="p-4 text-center text-gray-500">선택 가능한 후보가 없어요.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-3">
          {candidates.map((species) => {
            const selected = selectedSpeciesId === species.speciesId;
            return (
              <li key={species.speciesId}>
                <button
                  type="button"
                  onClick={() => onSelect(species.speciesId)}
                  disabled={submitting}
                  className={`w-full flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed ${
                    selected
                      ? "border-blue-500 bg-blue-50 scale-105"
                      : "border-gray-200 hover:border-gray-400 hover:scale-105"
                  } ${submitting && !selected ? "opacity-40" : ""}`}
                >
                  <img
                    src={getSpriteUrl(species.dexNumber)}
                    alt={species.nameKo}
                    className="w-16 h-16 [image-rendering:pixelated]"
                    loading="lazy"
                  />
                  <span className="text-sm font-semibold">{species.nameKo}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
