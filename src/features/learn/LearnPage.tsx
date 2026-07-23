import { Navigate, useSearchParams } from "react-router-dom";
import { findSpeciesById } from "@/content/pokemon";
import { regionEncounterPools, regions } from "@/content/regions";
import { isSpeciesInRegionEncounterPool } from "@/core/regionEncounter";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import { EndingFlow } from "./components/EndingFlow";
import { EncounterLearningSession } from "./components/EncounterLearningSession";
import { LearningSession } from "./components/LearningSession";

export default function LearnPage() {
  const [searchParams] = useSearchParams();
  const userId = useAuthStore((state) => state.userId);
  const authLoading = useAuthStore((state) => state.loading);
  const loaded = useGameStore((state) => state.loaded);
  const starterChosen = useGameStore((state) => state.trainer.starterChosen);
  const isEnding = useGameStore((state) => state.progression.isEnding);
  const encounterRegionId = searchParams.get("region");
  const encounteredSpeciesId = searchParams.get("species");
  const hasEncounterParams = encounterRegionId !== null || encounteredSpeciesId !== null;
  const encounterRegion = regions.find((region) => region.regionId === encounterRegionId) ?? null;
  const encounterPool =
    regionEncounterPools.find((pool) => pool.regionId === encounterRegionId) ?? null;
  const encounteredSpecies = encounteredSpeciesId ? findSpeciesById(encounteredSpeciesId) : null;
  const isValidEncounter =
    encounteredSpecies !== null &&
    isSpeciesInRegionEncounterPool(encounterPool, encounteredSpecies.speciesId);

  if (authLoading || !loaded) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  if (!userId) return <Navigate to="/" replace />;
  if (!starterChosen) return <Navigate to="/starter" replace />;
  if (isEnding) return <EndingFlow />;
  if (hasEncounterParams && (!encounterRegion || !isValidEncounter)) {
    return <Navigate to="/regions" replace />;
  }
  if (encounterRegion && encounteredSpecies) {
    return <EncounterLearningSession region={encounterRegion} species={encounteredSpecies} />;
  }

  return <LearningSession />;
}
