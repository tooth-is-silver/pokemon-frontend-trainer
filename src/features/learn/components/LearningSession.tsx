import { useEffect, useRef, useState } from "react";
import { GraduationModal } from "@/components/pokemon/GraduationModal";
import { QuizCard } from "@/components/quiz/QuizCard";
import { WrongAnswerPanel } from "@/components/quiz/WrongAnswerPanel";
import { getAllSpecies } from "@/content/pokemon";
import type { Question } from "@/content/questions/types";
import { evaluateAnswerAttempt } from "@/core/answerChecker";
import { resolveGraduationFlow } from "@/core/graduationFlow";
import { getNextQuestion, getQuestionById, getQuestionSourceUrl } from "@/core/quizLoader";
import { useGameStore } from "@/stores/useGameStore";
import { ActivePokemonStatus } from "./ActivePokemonStatus";
import { EvolutionFlow } from "./EvolutionFlow";

export function LearningSession() {
  const instances = useGameStore((state) => state.party.instances);
  const currentQuestionId = useGameStore((state) => state.session.currentQuestionId);
  const solvedQuestionIds = useGameStore((state) => state.session.solvedQuestionIds);
  const pendingGraduationInstanceId = useGameStore(
    (state) => state.progression.pendingGraduationInstanceId,
  );
  const unlockedSpeciesIds = useGameStore((state) => state.pokedex.unlockedSpeciesIds);
  const legendaryStage = useGameStore((state) => state.progression.unlockedLegendaryStage);
  const isEnding = useGameStore((state) => state.progression.isEnding);
  const setCurrentQuestion = useGameStore((state) => state.setCurrentQuestion);
  const submitAnswer = useGameStore((state) => state.submitAnswer);
  const startNextPokemon = useGameStore((state) => state.startNextPokemon);
  const completeEnding = useGameStore((state) => state.completeEnding);

  const [submitting, setSubmitting] = useState(false);
  const [wrongQuestion, setWrongQuestion] = useState<Question | null>(null);
  const [autoGraduationError, setAutoGraduationError] = useState<string | null>(null);
  const [autoGraduationRetrying, setAutoGraduationRetrying] = useState(false);
  const autoStartAttemptedGraduationIdsRef = useRef<Set<string>>(new Set());

  const currentQuestion = getQuestionById(currentQuestionId);

  useEffect(() => {
    if (currentQuestion) return;

    const nextQuestion = getNextQuestion(solvedQuestionIds, null);
    if (nextQuestion) setCurrentQuestion(nextQuestion.questionId);
  }, [currentQuestion, solvedQuestionIds, setCurrentQuestion]);

  const handleAnswer = async (userAnswer: string) => {
    if (!currentQuestion || submitting || wrongQuestion) return;

    const answerAttempt = evaluateAnswerAttempt({
      question: currentQuestion,
      userAnswer,
      solvedQuestionIds,
    });

    setSubmitting(true);
    try {
      await submitAnswer(
        currentQuestion.questionId,
        answerAttempt.isCorrect,
        answerAttempt.isFirstSolve,
      );

      if (answerAttempt.isCorrect) {
        const nextQuestion = getNextQuestion(
          answerAttempt.solvedQuestionIds,
          currentQuestion.questionId,
        );
        if (nextQuestion) setCurrentQuestion(nextQuestion.questionId);
      } else {
        setWrongQuestion(currentQuestion);
      }
    } catch (error) {
      console.error("정답 처리 실패:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    const skippedQuestionId = wrongQuestion?.questionId ?? currentQuestion?.questionId ?? null;
    const nextQuestion = getNextQuestion(solvedQuestionIds, skippedQuestionId);
    if (nextQuestion) setCurrentQuestion(nextQuestion.questionId);
    setWrongQuestion(null);
  };

  const graduationFlow = resolveGraduationFlow({
    pendingGraduationInstanceId,
    instances,
    unlockedSpeciesIds,
    legendaryStage,
    allSpecies: getAllSpecies(),
  });
  const {
    graduatedSpecies,
    graduatedExp,
    isMewGraduating,
    graduationCandidates,
    autoGraduationCandidate,
    showGraduationModal,
  } = graduationFlow;
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
    if (!pendingGraduationInstanceId || !autoGraduationSpeciesId || autoGraduationRetrying) return;

    setAutoGraduationRetrying(true);
    setAutoGraduationError(null);
    try {
      await startNextPokemon(autoGraduationSpeciesId);
    } catch (error) {
      console.error("단일 후보 자동 해금 재시도 실패:", error);
      setAutoGraduationError("자동 해금에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setAutoGraduationRetrying(false);
    }
  };

  const handleGraduationSelect = async (speciesId: string) => {
    await startNextPokemon(speciesId);
  };

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-gray-50 p-6">
      <ActivePokemonStatus />

      <section className="flex w-full max-w-lg flex-col gap-4">
        {currentQuestion ? (
          <QuizCard
            question={currentQuestion}
            onSubmit={handleAnswer}
            disabled={submitting || wrongQuestion !== null}
          />
        ) : (
          <div className="p-6 text-center text-gray-500">
            {autoGraduationError ? (
              <div className="flex flex-col items-center gap-3">
                <p>{autoGraduationError}</p>
                <button
                  type="button"
                  onClick={handleRetryAutoGraduation}
                  disabled={autoGraduationRetrying}
                  className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {autoGraduationRetrying ? "다시 시도 중..." : "다시 시도"}
                </button>
              </div>
            ) : autoGraduationCandidate ? (
              `${autoGraduationCandidate.nameKo}가 자동으로 해금되고 있어요.`
            ) : (
              "출제할 문제가 없습니다."
            )}
          </div>
        )}

        {wrongQuestion && (
          <WrongAnswerPanel
            question={wrongQuestion}
            sourceUrl={getQuestionSourceUrl(wrongQuestion.questionId)}
            onNext={handleNext}
          />
        )}
      </section>

      <EvolutionFlow />

      {showGraduationModal && graduatedSpecies && graduatedExp !== null && (
        <GraduationModal
          open={true}
          graduatedSpecies={graduatedSpecies}
          graduatedExp={graduatedExp}
          candidates={graduationCandidates}
          onSelect={handleGraduationSelect}
        />
      )}
    </div>
  );
}
