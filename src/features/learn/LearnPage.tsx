import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import { findSpeciesById, getAllSpecies } from "@/content/pokemon";
import { questionPages, getAllQuestions } from "@/content/questions";
import { getNextQuestion } from "@/core/quizLoader";
import { checkAnswer } from "@/core/answerChecker";
import { PokemonCard } from "@/components/pokemon/PokemonCard";
import { PokemonStats } from "@/components/pokemon/PokemonStats";
import { EvolutionModal } from "@/components/pokemon/EvolutionModal";
import { GraduationModal } from "@/components/pokemon/GraduationModal";
import { EndingScreen } from "@/components/pokemon/EndingScreen";
import { QuizCard } from "@/components/quiz/QuizCard";
import { WrongAnswerPanel } from "@/components/quiz/WrongAnswerPanel";
import { pickGraduationCandidates } from "@/core/candidatePicker";
import type { Question } from "@/content/questions/types";

function findSourceUrl(questionId: string): string {
  const page = questionPages.find((p) => p.questions.some((q) => q.questionId === questionId));
  return page?.url ?? "";
}

function findQuestion(questionId: string | null): Question | null {
  if (!questionId) return null;
  return getAllQuestions().find((q) => q.questionId === questionId) ?? null;
}

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
  const autoStartGraduationKeyRef = useRef<string | null>(null);
  const autoStartGraduationInFlightRef = useRef(false);

  const activeInstance = instances.find((i) => i.instanceId === activeInstanceId) ?? null;
  const activeSpecies = activeInstance ? findSpeciesById(activeInstance.speciesId) : null;
  const currentQuestion = findQuestion(currentQuestionId);

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

  const graduatedInstance =
    pendingGraduationInstanceId !== null
      ? (instances.find((i) => i.instanceId === pendingGraduationInstanceId) ?? null)
      : null;
  const graduatedSpecies = graduatedInstance ? findSpeciesById(graduatedInstance.speciesId) : null;
  const graduatedStats = graduatedInstance?.stats ?? null;
  const isMewGraduating = graduatedSpecies?.speciesId === "mew";
  const graduatedSpeciesIds = instances.filter((i) => i.graduated).map((i) => i.speciesId);
  const graduationCandidates = graduatedInstance
    ? pickGraduationCandidates({
        unlockedSpeciesIds,
        graduatedSpeciesIds,
        graduatingSpeciesId: graduatedSpecies?.speciesId,
        legendaryStage,
        allSpecies: getAllSpecies(),
      })
    : [];
  const autoGraduationCandidate =
    graduatedSpecies && !isMewGraduating && graduationCandidates.length === 1
      ? graduationCandidates[0]
      : null;
  const showGraduationModal = Boolean(
    graduatedSpecies && graduationCandidates.length > 1 && !isMewGraduating,
  );

  // 뮤 졸업 트리거 → 자동 엔딩 처리
  useEffect(() => {
    if (!pendingGraduationInstanceId || isEnding || !isMewGraduating) return;
    completeEnding(pendingGraduationInstanceId).catch((err) =>
      console.error("엔딩 처리 실패:", err),
    );
  }, [pendingGraduationInstanceId, isEnding, isMewGraduating, completeEnding]);

  useEffect(() => {
    autoStartGraduationKeyRef.current = null;
    autoStartGraduationInFlightRef.current = false;
  }, [pendingGraduationInstanceId]);

  // 후보가 1마리뿐이면 정책상 선택 모달 없이 바로 다음 포켓몬을 시작한다.
  useEffect(() => {
    if (!pendingGraduationInstanceId || !autoGraduationCandidate) return;

    const autoStartKey = `${pendingGraduationInstanceId}:${autoGraduationCandidate.speciesId}`;
    if (autoStartGraduationKeyRef.current === autoStartKey) return;
    if (autoStartGraduationInFlightRef.current) return;

    autoStartGraduationKeyRef.current = autoStartKey;
    autoStartGraduationInFlightRef.current = true;
    startNextPokemon(autoGraduationCandidate.speciesId).catch((err) => {
      console.error("단일 후보 자동 해금 실패:", err);
      autoStartGraduationKeyRef.current = null;
      autoStartGraduationInFlightRef.current = false;
    });
  }, [pendingGraduationInstanceId, autoGraduationCandidate, startNextPokemon]);

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
        <section className="flex flex-col items-center gap-4 w-full max-w-lg">
          <PokemonCard species={activeSpecies} />
          <PokemonStats stats={activeInstance.stats} />
          {streak > 0 && (
            <p className="text-sm text-gray-500" aria-live="polite">
              연속 정답 <span className="font-bold text-blue-600">{streak}</span>개
            </p>
          )}
        </section>
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
            {autoGraduationCandidate
              ? `${autoGraduationCandidate.nameKo}가 자동으로 해금되고 있어요.`
              : "출제할 문제가 없습니다."}
          </div>
        )}

        {wrongQuestion && (
          <WrongAnswerPanel
            question={wrongQuestion}
            sourceUrl={findSourceUrl(wrongQuestion.questionId)}
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

      {showGraduationModal && graduatedSpecies && graduatedStats && (
        <GraduationModal
          open={true}
          graduatedSpecies={graduatedSpecies}
          graduatedStats={graduatedStats}
          candidates={graduationCandidates}
          onSelect={handleGraduationSelect}
        />
      )}
    </div>
  );
}
