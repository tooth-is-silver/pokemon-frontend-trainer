import { useEffect, useRef, useState } from "react";
import { GraduationModal } from "@/components/pokemon/GraduationModal";
import { getAllSpecies } from "@/content/pokemon";
import { resolveGraduationFlow } from "@/core/graduationFlow";
import { useGameStore } from "@/stores/useGameStore";

export function GraduationFlow() {
  const pendingGraduationInstanceId = useGameStore(
    (state) => state.progression.pendingGraduationInstanceId,
  );
  const instances = useGameStore((state) => state.party.instances);
  const unlockedSpeciesIds = useGameStore((state) => state.pokedex.unlockedSpeciesIds);
  const legendaryStage = useGameStore((state) => state.progression.unlockedLegendaryStage);
  const isEnding = useGameStore((state) => state.progression.isEnding);
  const startNextPokemon = useGameStore((state) => state.startNextPokemon);
  const completeEnding = useGameStore((state) => state.completeEnding);

  const [autoGraduationError, setAutoGraduationError] = useState<string | null>(null);
  const [isAutoGraduationRetrying, setIsAutoGraduationRetrying] = useState(false);
  const autoStartAttemptedGraduationIdsRef = useRef<Set<string>>(new Set());

  const {
    graduatedSpecies,
    graduatedExp,
    isMewGraduating,
    graduationCandidates,
    autoGraduationCandidate,
    showGraduationModal,
  } = resolveGraduationFlow({
    pendingGraduationInstanceId,
    instances,
    unlockedSpeciesIds,
    legendaryStage,
    allSpecies: getAllSpecies(),
  });
  const autoGraduationSpeciesId = autoGraduationCandidate?.speciesId ?? null;

  useEffect(() => {
    if (!pendingGraduationInstanceId || isEnding || !isMewGraduating) return;

    completeEnding(pendingGraduationInstanceId).catch((error) =>
      console.error("엔딩 처리 실패:", error),
    );
  }, [pendingGraduationInstanceId, isEnding, isMewGraduating, completeEnding]);

  useEffect(() => {
    if (!pendingGraduationInstanceId || !autoGraduationSpeciesId) return;
    if (autoStartAttemptedGraduationIdsRef.current.has(pendingGraduationInstanceId)) return;

    autoStartAttemptedGraduationIdsRef.current.add(pendingGraduationInstanceId);
    setAutoGraduationError(null);
    startNextPokemon(autoGraduationSpeciesId).catch((error) => {
      console.error("단일 후보 자동 해금 실패:", error);
      setAutoGraduationError("자동 해금에 실패했어요. 잠시 후 다시 시도해주세요.");
    });
  }, [pendingGraduationInstanceId, autoGraduationSpeciesId, startNextPokemon]);

  const handleRetryAutoGraduation = async () => {
    if (!pendingGraduationInstanceId || !autoGraduationSpeciesId || isAutoGraduationRetrying) {
      return;
    }

    setIsAutoGraduationRetrying(true);
    setAutoGraduationError(null);
    try {
      await startNextPokemon(autoGraduationSpeciesId);
    } catch (error) {
      console.error("단일 후보 자동 해금 재시도 실패:", error);
      setAutoGraduationError("자동 해금에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsAutoGraduationRetrying(false);
    }
  };

  if (autoGraduationCandidate) {
    return (
      <section
        className="flex w-full max-w-lg flex-col items-center gap-3 p-6 text-center text-gray-500"
        aria-live="polite"
      >
        {autoGraduationError ? (
          <>
            <p>{autoGraduationError}</p>
            <button
              type="button"
              onClick={handleRetryAutoGraduation}
              disabled={isAutoGraduationRetrying}
              className="min-h-11 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAutoGraduationRetrying ? "다시 시도 중..." : "다시 시도"}
            </button>
          </>
        ) : (
          <p>{autoGraduationCandidate.nameKo}가 자동으로 해금되고 있어요.</p>
        )}
      </section>
    );
  }

  if (!showGraduationModal || !graduatedSpecies || graduatedExp === null) {
    return null;
  }

  return (
    <GraduationModal
      open={true}
      graduatedSpecies={graduatedSpecies}
      graduatedExp={graduatedExp}
      candidates={graduationCandidates}
      onSelect={startNextPokemon}
    />
  );
}
