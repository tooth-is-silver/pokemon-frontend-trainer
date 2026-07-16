import type { Question } from "@/content/questions/types";

interface EvaluateAnswerAttemptArgs {
  question: Question;
  userAnswer: string;
  solvedQuestionIds: string[];
}

interface AnswerAttempt {
  isCorrect: boolean;
  isFirstSolve: boolean;
  solvedQuestionIds: string[];
}

export function normalizeAnswer(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export function checkAnswer(question: Question, userAnswer: string): boolean {
  switch (question.type) {
    case "yes_no":
      return question.answer === (userAnswer === "true");
    case "multiple_choice":
      return normalizeAnswer(userAnswer) === normalizeAnswer(question.answer);
    case "fill_blank":
      return checkFillBlank(question.acceptedAnswers, userAnswer);
    default:
      return false;
  }
}

export function evaluateAnswerAttempt({
  question,
  userAnswer,
  solvedQuestionIds,
}: EvaluateAnswerAttemptArgs): AnswerAttempt {
  const isCorrect = checkAnswer(question, userAnswer);
  const isFirstSolve = isCorrect && !solvedQuestionIds.includes(question.questionId);

  return {
    isCorrect,
    isFirstSolve,
    solvedQuestionIds: isFirstSolve
      ? [...solvedQuestionIds, question.questionId]
      : solvedQuestionIds,
  };
}

function checkFillBlank(acceptedAnswers: string[], userAnswer: string): boolean {
  const normalized = normalizeAnswer(userAnswer);
  return acceptedAnswers.some((acceptedAnswer) => normalizeAnswer(acceptedAnswer) === normalized);
}
