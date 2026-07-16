import type { PokemonSpecies } from "@/content/pokemon/types";
import { isGraduationReady } from "@/core/evolutionChecker";
import type {
  PartyState,
  PokemonInstance,
  ProcessAnswerResult,
  ProgressionState,
  SessionState,
} from "@/core/types";

interface ResolveAnswerProgressionArgs {
  activeInstanceId: string | null;
  instances: PokemonInstance[];
  progression: ProgressionState;
  session: SessionState;
  questionId: string;
  isCorrect: boolean;
  isFirstSolve: boolean;
  result: ProcessAnswerResult;
  allSpecies: PokemonSpecies[];
}

interface AnswerProgression {
  party: PartyState;
  progression: ProgressionState;
  session: SessionState;
}

export function resolveAnswerProgression({
  activeInstanceId,
  instances,
  progression,
  session,
  questionId,
  isCorrect,
  isFirstSolve,
  result,
  allSpecies,
}: ResolveAnswerProgressionArgs): AnswerProgression {
  const updatedInstances = instances.map((instance) =>
    instance.instanceId === activeInstanceId
      ? {
          ...instance,
          exp: result.exp,
          totalCorrectCount: instance.totalCorrectCount + (isCorrect ? 1 : 0),
          evolutionPending: result.evolution_pending,
        }
      : instance,
  );
  const updatedActiveInstance =
    updatedInstances.find((instance) => instance.instanceId === activeInstanceId) ?? null;
  const activeSpecies = updatedActiveInstance
    ? (allSpecies.find((species) => species.speciesId === updatedActiveInstance.speciesId) ?? null)
    : null;
  const isGraduationPending = Boolean(
    isCorrect &&
    activeInstanceId &&
    updatedActiveInstance &&
    activeSpecies &&
    isGraduationReady(updatedActiveInstance, activeSpecies),
  );

  return {
    party: { instances: updatedInstances },
    progression: {
      ...progression,
      streakCorrectCount: result.streak,
      pendingEvolutionInstanceId: result.evolution_pending
        ? activeInstanceId
        : progression.pendingEvolutionInstanceId,
      pendingGraduationInstanceId: isGraduationPending
        ? activeInstanceId
        : progression.pendingGraduationInstanceId,
    },
    session: {
      ...session,
      lastAnswerCorrect: isCorrect,
      solvedQuestionIds:
        isCorrect && isFirstSolve
          ? [...new Set([...session.solvedQuestionIds, questionId])]
          : session.solvedQuestionIds,
    },
  };
}
