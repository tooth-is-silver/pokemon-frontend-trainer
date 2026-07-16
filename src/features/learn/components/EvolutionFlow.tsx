import { EvolutionModal } from "@/components/pokemon/EvolutionModal";
import { findSpeciesById } from "@/content/pokemon";
import { useGameStore } from "@/stores/useGameStore";

export function EvolutionFlow() {
  const activeInstanceId = useGameStore((state) => state.trainer.activePokemonInstanceId);
  const instances = useGameStore((state) => state.party.instances);
  const evolve = useGameStore((state) => state.evolve);

  const activeInstance =
    instances.find((instance) => instance.instanceId === activeInstanceId) ?? null;
  const activeSpecies = activeInstance ? findSpeciesById(activeInstance.speciesId) : null;
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
