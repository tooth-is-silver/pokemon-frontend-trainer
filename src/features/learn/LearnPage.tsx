import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import { findSpeciesById, getAllSpecies } from "@/content/pokemon";
import { getNextQuestion, getQuestionById, getQuestionSourceUrl } from "@/core/quizLoader";
import { checkAnswer } from "@/core/answerChecker";
import { EvolutionModal } from "@/components/pokemon/EvolutionModal";
import { GraduationModal } from "@/components/pokemon/GraduationModal";
import { EndingScreen } from "@/components/pokemon/EndingScreen";
import { QuizCard } from "@/components/quiz/QuizCard";
import { WrongAnswerPanel } from "@/components/quiz/WrongAnswerPanel";
import { resolveGraduationFlow } from "@/core/graduationFlow";
import type { Question } from "@/content/questions/types";
import { ActivePokemonStatus } from "./components/ActivePokemonStatus";

export default function LearnPage() {
  const userId = useAuthStore((s) => s.userId);
  const authLoading = useAuthStore((s) => s.loading);
  const loaded = useGameStore((s) => s.loaded);
  const starterChosen = useGameStore((s) => s.trainer.starterChosen);
  const activeInstanceId = useGameStore((s) => s.trainer.activePokemonInstanceId);
  const instances = useGameStore((s) => s.party.instances);
  const currentQuestionId = useGameStore((s) => s.session.currentQuestionId);
  const solvedQuestionIds = useGameStore((s) => s.session.solvedQuestionIds);
  const streak = useGameStore((s) => s.progression.streakCorrectCount);
  const pendingGraduationInstanceId = useGameStore(
    (s) => s.progression.pendingGraduationInstanceId,
  );
  const unlockedSpeciesIds = useGameStore((s) => s.pokedex.unlockedSpeciesIds);
  const legendaryStage = useGameStore((s) => s.progression.unlockedLegendaryStage);
  const isEnding = useGameStore((s) => s.progression.isEnding);
  const setCurrentQuestion = useGameStore((s) => s.setCurrentQuestion);
  const submitAnswer = useGameStore((s) => s.submitAnswer);
  const evolve = useGameStore((s) => s.evolve);
  const startNextPokemon = useGameStore((s) => s.startNextPokemon);
  const completeEnding = useGameStore((s) => s.completeEnding);

  const [submitting, setSubmitting] = useState(false);
  const [wrongQuestion, setWrongQuestion] = useState<Question | null>(null);
  const [autoGraduationError, setAutoGraduationError] = useState<string | null>(null);
  const [autoGraduationRetrying, setAutoGraduationRetrying] = useState(false);
  const autoStartAttemptedGraduationIdsRef = useRef<Set<string>>(new Set());

  const activeInstance = instances.find((i) => i.instanceId === activeInstanceId) ?? null;
  const activeSpecies = activeInstance ? findSpeciesById(activeInstance.speciesId) : null;
  const currentQuestion = getQuestionById(currentQuestionId);

  // 현재 문제가 없으면 다음 문제 로드
  useEffect(() => {
    if (!loaded || !starterChosen || currentQuestion) return;
    const next = getNextQuestion(solvedQuestionIds, null);
    if (next) setCurrentQuestion(next.questionId);
  }, [loaded, starterChosen, currentQuestion, solvedQuestionIds, setCurrentQuestion]);

  const handleAnswer = async (userAnswer: string) => {
    if (!currentQuestion || submitting || wrongQuestion) return;

    const correct = checkAnswer(currentQuestion, userAnswer);
    const alreadySolved = solvedQuestionIds.includes(currentQuestion.questionId);
    const isFirstSolve = correct && !alreadySolved;

    setSubmitting(true);
    try {
      await submitAnswer(currentQuestion.questionId, correct, isFirstSolve);

      if (correct) {
        const updatedSolved = isFirstSolve
          ? [...solvedQuestionIds, currentQuestion.questionId]
          : solvedQuestionIds;
        const next = getNextQuestion(updatedSolved, currentQuestion.questionId);
        if (next) setCurrentQuestion(next.questionId);
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
    const skipId = wrongQuestion?.questionId ?? currentQuestion?.questionId ?? null;
    const next = getNextQuestion(solvedQuestionIds, skipId);
    if (next) setCurrentQuestion(next.questionId);
    setWrongQuestion(null);
  };

  const nextEvolutionSpecies =
    activeSpecies?.nextEvolutionSpeciesId != null
      ? findSpeciesById(activeSpecies.nextEvolutionSpeciesId)
      : null;
  const showEvolutionModal = Boolean(
    activeInstance?.evolutionPending && activeSpecies && nextEvolutionSpecies,
  );

  const handleEvolve = async () => {
    if (!activeInstance || !nextEvolutionSpecies) return;
    await evolve(activeInstance.instanceId, nextEvolutionSpecies.speciesId);
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

  // 뮤 졸업 트리거 → 자동 엔딩 처리
  useEffect(() => {
    if (!pendingGraduationInstanceId || isEnding || !isMewGraduating) return;
    completeEnding(pendingGraduationInstanceId).catch((err) =>
      console.error("엔딩 처리 실패:", err),
    );
  }, [pendingGraduationInstanceId, isEnding, isMewGraduating, completeEnding]);

  // 후보가 1마리뿐이면 정책상 선택 모달 없이 바로 다음 포켓몬을 시작한다.
  useEffect(() => {
    if (!pendingGraduationInstanceId || !autoGraduationSpeciesId) return;
    if (autoStartAttemptedGraduationIdsRef.current.has(pendingGraduationInstanceId)) return;

    autoStartAttemptedGraduationIdsRef.current.add(pendingGraduationInstanceId);
    setAutoGraduationError(null);
    startNextPokemon(autoGraduationSpeciesId).catch((err) => {
      console.error("단일 후보 자동 해금 실패:", err);
      setAutoGraduationError("자동 해금에 실패했어요. 잠시 후 다시 시도해주세요.");
    });
  }, [pendingGraduationInstanceId, autoGraduationSpeciesId, startNextPokemon]);

  const handleRetryAutoGraduation = async () => {
    if (!pendingGraduationInstanceId || !autoGraduationSpeciesId || autoGraduationRetrying) return;

    setAutoGraduationRetrying(true);
    setAutoGraduationError(null);
    try {
      await startNextPokemon(autoGraduationSpeciesId);
    } catch (err) {
      console.error("단일 후보 자동 해금 재시도 실패:", err);
      setAutoGraduationError("자동 해금에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setAutoGraduationRetrying(false);
    }
  };

  if (authLoading || !loaded) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }
  if (!userId) return <Navigate to="/" replace />;
  if (!starterChosen) return <Navigate to="/starter" replace />;
  if (isEnding) return <EndingScreen />;

  const handleGraduationSelect = async (speciesId: string) => {
    await startNextPokemon(speciesId);
  };

  return (
    <div className="flex flex-col items-center gap-6 min-h-screen p-6 bg-gray-50">
      {activeSpecies && activeInstance && (
        <ActivePokemonStatus species={activeSpecies} instance={activeInstance} streak={streak} />
      )}

      <section className="w-full max-w-lg flex flex-col gap-4">
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

      {showEvolutionModal && activeSpecies && nextEvolutionSpecies && (
        <EvolutionModal
          open={true}
          currentSpecies={activeSpecies}
          nextSpecies={nextEvolutionSpecies}
          onEvolve={handleEvolve}
        />
      )}

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
