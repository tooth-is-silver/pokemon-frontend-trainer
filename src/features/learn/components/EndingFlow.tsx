import { useEffect, useState } from "react";
import { getAllSpecies } from "@/content/pokemon";
import { TOTAL_DEX } from "@/content/pokemon/types";
import { resolveEndingSummary, type EndingStats } from "@/core/endingSummary";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import { EndingScreen } from "./EndingScreen";

export function EndingFlow() {
  const userId = useAuthStore((state) => state.userId);
  const unlockedSpeciesIds = useGameStore((state) => state.pokedex.unlockedSpeciesIds);
  const instances = useGameStore((state) => state.party.instances);
  const loadEndingStats = useGameStore((state) => state.loadEndingStats);
  const [stats, setStats] = useState<EndingStats | null>(null);
  const [hasStatsError, setHasStatsError] = useState(false);

  const summary = resolveEndingSummary({
    unlockedSpeciesIds,
    instances,
    allSpecies: getAllSpecies(),
    totalDex: TOTAL_DEX,
  });

  useEffect(() => {
    if (!userId) return;

    const abortController = new AbortController();

    loadEndingStats(userId, abortController.signal)
      .then((endingStats) => {
        if (!abortController.signal.aborted) {
          setStats(endingStats);
        }
      })
      .catch((error) => {
        if (abortController.signal.aborted) return;

        console.error("엔딩 통계 로드 실패:", error);
        setStats(null);
        setHasStatsError(true);
      });

    return () => {
      abortController.abort();
    };
  }, [userId, loadEndingStats]);

  return <EndingScreen stats={stats} hasStatsError={hasStatsError} summary={summary} />;
}
