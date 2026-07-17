import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStarters } from "@/content/pokemon";
import { getSpriteUrl } from "@/content/pokemon/types";
import type { PokemonSpecies } from "@/content/pokemon/types";
import { useGameStore } from "@/stores/useGameStore";

const starterSpecies = getStarters();

export function StarterSelection() {
  const navigate = useNavigate();
  const chooseStarter = useGameStore((state) => state.chooseStarter);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);

  const handleSelect = async (species: PokemonSpecies) => {
    if (isSelecting) return;

    setIsSelecting(true);
    setSelectedSpeciesId(species.speciesId);

    try {
      await chooseStarter(species.speciesId);
      navigate("/regions");
    } catch (error) {
      console.error("스타터 선택 실패:", error);
      setIsSelecting(false);
      setSelectedSpeciesId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-bold">첫 포켓몬을 선택하세요!</h1>
      <p className="text-gray-500">함께 자바스크립트를 공부할 포켓몬을 골라주세요</p>

      <div className="flex flex-wrap justify-center gap-6">
        {starterSpecies.map((species) => (
          <button
            key={species.speciesId}
            type="button"
            onClick={() => handleSelect(species)}
            disabled={isSelecting}
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
              selectedSpeciesId === species.speciesId
                ? "scale-105 border-blue-500 bg-blue-50"
                : "border-gray-200 hover:scale-105 hover:border-gray-400"
            } ${
              isSelecting && selectedSpeciesId !== species.speciesId
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            <img
              src={getSpriteUrl(species.dexNumber)}
              alt={species.nameKo}
              className="h-24 w-24 [image-rendering:pixelated]"
              loading="lazy"
            />
            <span className="text-lg font-semibold">{species.nameKo}</span>
            <span className="text-sm text-gray-400">{species.nameEn}</span>
          </button>
        ))}
      </div>

      {isSelecting && (
        <p className="animate-pulse text-blue-500" role="status">
          포켓몬을 등록하는 중...
        </p>
      )}
    </div>
  );
}
