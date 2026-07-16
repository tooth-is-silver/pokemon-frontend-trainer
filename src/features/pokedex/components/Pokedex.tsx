import { CurrentPokemonCard } from "@/components/pokedex/CurrentPokemonCard";
import { PokedexGrid } from "@/components/pokedex/PokedexGrid";
import { getAllSpecies } from "@/content/pokemon";
import { TOTAL_DEX } from "@/content/pokemon/types";
import { resolveActivePokemon } from "@/core/activePokemon";
import { useGameStore } from "@/stores/useGameStore";

const LEGENDARY_MESSAGE: Record<"none" | "legendary-birds" | "mewtwo" | "mew", string> = {
  none: "일반 도감을 완성하면 전설이 해금돼요.",
  "legendary-birds": "프리저·썬더·파이어를 만날 수 있어요!",
  mewtwo: "뮤츠가 깨어났어요!",
  mew: "모든 전설이 해금되었어요!",
};

export function Pokedex() {
  const unlockedSpeciesIds = useGameStore((state) => state.pokedex.unlockedSpeciesIds);
  const legendaryStage = useGameStore((state) => state.progression.unlockedLegendaryStage);
  const pendingGraduationInstanceId = useGameStore(
    (state) => state.progression.pendingGraduationInstanceId,
  );
  const activeInstanceId = useGameStore((state) => state.trainer.activePokemonInstanceId);
  const instances = useGameStore((state) => state.party.instances);

  const unlockedCount = unlockedSpeciesIds.length;
  const progressPercent = Math.floor((unlockedCount / TOTAL_DEX) * 100);
  const { activeInstance, activeSpecies } = resolveActivePokemon({
    activeInstanceId,
    instances,
    allSpecies: getAllSpecies(),
  });

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-gray-50 p-6">
      <header className="flex w-full max-w-4xl flex-col gap-3">
        <h1 className="text-2xl font-bold">포켓몬 도감</h1>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
          <span className="tabular-nums">
            {unlockedCount} / {TOTAL_DEX} · {progressPercent}%
          </span>
          <span aria-live="polite">{LEGENDARY_MESSAGE[legendaryStage]}</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`도감 진행률 ${progressPercent}%`}
        >
          <div
            className="h-full bg-blue-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {activeInstance && activeSpecies && (
        <section className="w-full max-w-4xl">
          <CurrentPokemonCard
            instance={activeInstance}
            species={activeSpecies}
            graduationPending={activeInstance.instanceId === pendingGraduationInstanceId}
          />
        </section>
      )}

      <main className="w-full max-w-4xl">
        <PokedexGrid unlockedSpeciesIds={unlockedSpeciesIds} />
      </main>
    </div>
  );
}
