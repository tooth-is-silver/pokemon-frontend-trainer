import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import { PokedexGrid } from "@/components/pokedex/PokedexGrid";
import { TOTAL_DEX } from "@/content/pokemon/types";

const LEGENDARY_MESSAGE: Record<"none" | "legendary-birds" | "mewtwo" | "mew", string> = {
  none: "일반 도감을 완성하면 전설이 해금돼요.",
  "legendary-birds": "프리저·썬더·파이어를 만날 수 있어요!",
  mewtwo: "뮤츠가 깨어났어요!",
  mew: "모든 전설이 해금되었어요!",
};

export default function PokedexPage() {
  const userId = useAuthStore((s) => s.userId);
  const authLoading = useAuthStore((s) => s.loading);
  const loaded = useGameStore((s) => s.loaded);
  const starterChosen = useGameStore((s) => s.trainer.starterChosen);
  const unlockedSpeciesIds = useGameStore((s) => s.pokedex.unlockedSpeciesIds);
  const legendaryStage = useGameStore((s) => s.progression.unlockedLegendaryStage);

  if (authLoading || !loaded) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }
  if (!userId) return <Navigate to="/" replace />;
  if (!starterChosen) return <Navigate to="/starter" replace />;

  const unlockedCount = unlockedSpeciesIds.length;
  const percent = Math.floor((unlockedCount / TOTAL_DEX) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center gap-6 p-6">
      <header className="w-full max-w-4xl flex flex-col gap-3">
        <h1 className="text-2xl font-bold">포켓몬 도감</h1>
        <div className="flex flex-wrap justify-between items-center gap-2 text-sm text-gray-600">
          <span className="tabular-nums">
            {unlockedCount} / {TOTAL_DEX} · {percent}%
          </span>
          <span aria-live="polite">{LEGENDARY_MESSAGE[legendaryStage]}</span>
        </div>
        <div
          className="h-2 bg-gray-200 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`도감 진행률 ${percent}%`}
        >
          <div
            className="h-full bg-blue-400 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </header>

      <main className="w-full max-w-4xl">
        <PokedexGrid unlockedSpeciesIds={unlockedSpeciesIds} />
      </main>
    </div>
  );
}
