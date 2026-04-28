import { getSpriteUrl } from "@/content/pokemon/types";
import type { PokemonSpecies } from "@/content/pokemon/types";

interface Props {
  graduatedSpecies: PokemonSpecies;
  candidates: PokemonSpecies[];
  submitting: boolean;
  selectedSpeciesId: string | null;
  onSelect: (speciesId: string) => void;
}

export function GraduationContent({
  graduatedSpecies,
  candidates,
  submitting,
  selectedSpeciesId,
  onSelect,
}: Props) {
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
                    className="w-16 h-16 image-rendering-pixelated"
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
