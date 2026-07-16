import { useEffect, useState } from "react";
import { QuizCard } from "@/components/quiz/QuizCard";
import { WrongAnswerPanel } from "@/components/quiz/WrongAnswerPanel";
import type { Question } from "@/content/questions/types";
import { evaluateAnswerAttempt } from "@/core/answerChecker";
import { getNextQuestion, getQuestionById, getQuestionSourceUrl } from "@/core/quizLoader";
import { useGameStore } from "@/stores/useGameStore";
import { ActivePokemonStatus } from "./ActivePokemonStatus";
import { EvolutionFlow } from "./EvolutionFlow";
import { GraduationFlow } from "./GraduationFlow";

export function LearningSession() {
  const currentQuestionId = useGameStore((state) => state.session.currentQuestionId);
  const solvedQuestionIds = useGameStore((state) => state.session.solvedQuestionIds);
  const isGraduationPending = useGameStore(
    (state) => state.progression.pendingGraduationInstanceId !== null,
  );
  const setCurrentQuestion = useGameStore((state) => state.setCurrentQuestion);
  const submitAnswer = useGameStore((state) => state.submitAnswer);

  const [submitting, setSubmitting] = useState(false);
  const [wrongQuestion, setWrongQuestion] = useState<Question | null>(null);

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

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-gray-50 p-6">
      <ActivePokemonStatus />

      <GraduationFlow />

      <section className="flex w-full max-w-lg flex-col gap-4">
        {currentQuestion ? (
          <QuizCard
            question={currentQuestion}
            onSubmit={handleAnswer}
            disabled={submitting || wrongQuestion !== null || isGraduationPending}
          />
        ) : isGraduationPending ? null : (
          <div className="p-6 text-center text-gray-500">출제할 문제가 없습니다.</div>
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
    </div>
  );
}
