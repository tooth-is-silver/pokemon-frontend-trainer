import { EvolutionModal } from "@/components/pokemon/EvolutionModal";
import { findSpeciesById, getAllSpecies } from "@/content/pokemon";
import { resolveActivePokemon } from "@/core/activePokemon";
import { useGameStore } from "@/stores/useGameStore";

export function EvolutionFlow() {
  const activeInstanceId = useGameStore((state) => state.trainer.activePokemonInstanceId);
  const instances = useGameStore((state) => state.party.instances);
  const evolve = useGameStore((state) => state.evolve);

  const { activeInstance, activeSpecies } = resolveActivePokemon({
    activeInstanceId,
    instances,
    allSpecies: getAllSpecies(),
  });
  const nextEvolutionSpeciesId = activeSpecies?.nextEvolutionSpeciesId ?? null;
  const nextEvolutionSpecies = nextEvolutionSpeciesId
    ? findSpeciesById(nextEvolutionSpeciesId)
    : null;

  if (!activeInstance?.evolutionPending || !activeSpecies || !nextEvolutionSpecies) {
    return null;
  }

  const handleEvolve = async () => {
    await evolve(activeInstance.instanceId, nextEvolutionSpecies.speciesId);
  };

  return (
    <EvolutionModal
      open={true}
      currentSpecies={activeSpecies}
      nextSpecies={nextEvolutionSpecies}
      onEvolve={handleEvolve}
    />
  );
}
