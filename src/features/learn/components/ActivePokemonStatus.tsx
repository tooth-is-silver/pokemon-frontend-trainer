import { PokemonCard } from "@/components/pokemon/PokemonCard";
import { PokemonExp } from "@/components/pokemon/PokemonExp";
import { findSpeciesById } from "@/content/pokemon";
import { useGameStore } from "@/stores/useGameStore";

export function ActivePokemonStatus() {
  const activeInstanceId = useGameStore((state) => state.trainer.activePokemonInstanceId);
  const instances = useGameStore((state) => state.party.instances);
  const streak = useGameStore((state) => state.progression.streakCorrectCount);

  const activeInstance =
    instances.find((instance) => instance.instanceId === activeInstanceId) ?? null;
  const activeSpecies = activeInstance ? findSpeciesById(activeInstance.speciesId) : null;

  if (!activeInstance || !activeSpecies) return null;

  return (
    <section className="flex w-full max-w-lg flex-col items-center gap-4">
      <PokemonCard species={activeSpecies} />
      <PokemonExp exp={activeInstance.exp} />
      {streak > 0 && (
        <p className="text-sm text-gray-500" aria-live="polite">
          연속 정답 <span className="font-bold text-blue-600">{streak}</span>개
        </p>
      )}
    </section>
  );
}
