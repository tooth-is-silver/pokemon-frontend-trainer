import { pickGraduationCandidates } from "@/core/candidatePicker";
import type { LegendaryStage } from "@/core/candidatePicker";
import type { PokemonSpecies } from "@/content/pokemon/types";
import type { PokemonInstance } from "@/stores/types";

interface ResolveGraduationFlowArgs {
  pendingGraduationInstanceId: string | null;
  instances: PokemonInstance[];
  unlockedSpeciesIds: string[];
  legendaryStage: LegendaryStage;
  allSpecies: PokemonSpecies[];
}

interface GraduationFlow {
  graduatedInstance: PokemonInstance | null;
  graduatedSpecies: PokemonSpecies | null;
  graduatedExp: number | null;
  isMewGraduating: boolean;
  graduationCandidates: PokemonSpecies[];
  autoGraduationCandidate: PokemonSpecies | null;
  showGraduationModal: boolean;
}

export function resolveGraduationFlow({
  pendingGraduationInstanceId,
  instances,
  unlockedSpeciesIds,
  legendaryStage,
  allSpecies,
}: ResolveGraduationFlowArgs): GraduationFlow {
  const graduatedInstance = pendingGraduationInstanceId
    ? (instances.find((i) => i.instanceId === pendingGraduationInstanceId) ?? null)
    : null;
  const graduatedSpecies = graduatedInstance
    ? (allSpecies.find((s) => s.speciesId === graduatedInstance.speciesId) ?? null)
    : null;
  const graduatedExp = graduatedInstance?.exp ?? null;
  const isMewGraduating = graduatedSpecies?.speciesId === "mew";
  const graduatedSpeciesIds = instances.filter((i) => i.graduated).map((i) => i.speciesId);
  const graduationCandidates = graduatedInstance
    ? pickGraduationCandidates({
        unlockedSpeciesIds,
        graduatedSpeciesIds,
        graduatingSpeciesId: graduatedSpecies?.speciesId,
        legendaryStage,
        allSpecies,
      })
    : [];
  const autoGraduationCandidate =
    graduatedSpecies && !isMewGraduating && graduationCandidates.length === 1
      ? graduationCandidates[0]
      : null;
  const showGraduationModal = Boolean(
    graduatedSpecies && graduationCandidates.length > 1 && !isMewGraduating,
  );

  return {
    graduatedInstance,
    graduatedSpecies,
    graduatedExp,
    isMewGraduating,
    graduationCandidates,
    autoGraduationCandidate,
    showGraduationModal,
  };
}
