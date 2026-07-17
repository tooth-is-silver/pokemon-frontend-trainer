import { pickGraduationCandidates } from "@/core/candidatePicker";
import type { LegendaryStage } from "@/core/candidatePicker";
import type { PokemonSpecies } from "@/content/pokemon/types";
import type { PokemonInstance } from "@/core/types";

interface ResolveGraduationFlowInput {
  pendingGraduationInstanceId: string | null;
  instances: PokemonInstance[];
  unlockedSpeciesIds: string[];
  legendaryStage: LegendaryStage;
  allSpecies: PokemonSpecies[];
  random: () => number;
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
  random,
}: ResolveGraduationFlowInput): GraduationFlow {
  const graduatedInstance = pendingGraduationInstanceId
    ? (instances.find((instance) => instance.instanceId === pendingGraduationInstanceId) ?? null)
    : null;
  const graduatedSpecies = graduatedInstance
    ? (allSpecies.find((species) => species.speciesId === graduatedInstance.speciesId) ?? null)
    : null;
  const graduatedExp = graduatedInstance?.exp ?? null;
  const isMewGraduating = graduatedSpecies?.speciesId === "mew";
  const graduatedSpeciesIds = instances
    .filter((instance) => instance.graduated)
    .map((instance) => instance.speciesId);
  const graduationCandidates = graduatedInstance
    ? pickGraduationCandidates({
        unlockedSpeciesIds,
        graduatedSpeciesIds,
        graduatingSpeciesId: graduatedSpecies?.speciesId,
        legendaryStage,
        allSpecies,
        random,
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

export function getGraduationSelectionErrorMessage(error: unknown) {
  const rawMessage = getErrorMessage(error);
  const normalizedMessage = rawMessage.toLowerCase();

  if (normalizedMessage.includes("authentication") || normalizedMessage.includes("jwt")) {
    return "로그인 세션이 만료됐을 수 있어요. 새로고침 후 다시 시도해주세요.";
  }

  if (normalizedMessage.includes("network") || normalizedMessage.includes("fetch")) {
    return "네트워크 연결이 불안정해요. 잠시 후 다시 시도해주세요.";
  }

  return rawMessage
    ? `다음 포켓몬을 시작하지 못했어요. ${rawMessage}`
    : "다음 포켓몬을 시작하지 못했어요. 잠시 후 다시 시도해주세요.";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error !== "object" || error === null || !("message" in error)) return "";

  const message = error.message;
  return typeof message === "string" ? message : "";
}
