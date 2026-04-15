import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useGameStore } from "@/stores/useGameStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { starters } from "@/content/pokemon/starters";
import { getSpriteUrl } from "@/content/pokemon/types";
import type { PokemonSpecies } from "@/content/pokemon/types";

const starterSpecies = starters.filter((s) => s.isStarter);

export default function StarterPage() {
  const navigate = useNavigate();
  const chooseStarter = useGameStore((s) => s.chooseStarter);
  const starterChosen = useGameStore((s) => s.trainer.starterChosen);
  const userId = useAuthStore((s) => s.userId);
  const [selecting, setSelecting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 이미 스타터를 선택했으면 학습 화면으로
  if (starterChosen) {
    return <Navigate to="/learn" replace />;
  }

  const handleSelect = async (species: PokemonSpecies) => {
    if (selecting || !userId) return;
    setSelecting(true);
    setSelectedId(species.speciesId);

    try {
      await chooseStarter(species.speciesId);
      navigate("/learn");
    } catch (error) {
      console.error("스타터 선택 실패:", error);
      setSelecting(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <h1 className="text-2xl font-bold">첫 포켓몬을 선택하세요!</h1>
      <p className="text-gray-500">함께 자바스크립트를 공부할 포켓몬을 골라주세요</p>

      <div className="flex gap-6">
        {starterSpecies.map((species) => (
          <button
            key={species.speciesId}
            onClick={() => handleSelect(species)}
            disabled={selecting}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all
              ${selectedId === species.speciesId ? "border-blue-500 bg-blue-50 scale-105" : "border-gray-200 hover:border-gray-400 hover:scale-105"}
              ${selecting && selectedId !== species.speciesId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <img
              src={getSpriteUrl(species.dexNumber)}
              alt={species.nameKo}
              className="w-24 h-24 image-rendering-pixelated"
              loading="lazy"
            />
            <span className="text-lg font-semibold">{species.nameKo}</span>
            <span className="text-sm text-gray-400">{species.nameEn}</span>
          </button>
        ))}
      </div>

      {selecting && <p className="text-blue-500 animate-pulse">포켓몬을 등록하는 중...</p>}
    </div>
  );
}
