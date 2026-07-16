import { getAllQuestions, questionPages } from "@/content/questions";
import type { Question, QuestionPage } from "@/content/questions/types";

export function getNextQuestion(
  solvedQuestionIds: string[],
  currentQuestionId: string | null,
): Question | null {
  return pickNextQuestion(getAllQuestions(), solvedQuestionIds, currentQuestionId);
}

export function pickNextQuestion(
  questions: Question[],
  solvedQuestionIds: string[],
  currentQuestionId: string | null,
  random = Math.random,
): Question | null {
  if (questions.length === 0) return null;
  const solvedSet = new Set(solvedQuestionIds);

  const unsolved = questions.filter(
    (q) => !solvedSet.has(q.questionId) && q.questionId !== currentQuestionId,
  );

  if (unsolved.length > 0) {
    return pickRandomQuestion(unsolved, random);
  }

  const others = questions.filter((q) => q.questionId !== currentQuestionId);

  if (others.length > 0) {
    return pickRandomQuestion(others, random);
  }

  return null;
}

export function getQuestionById(questionId: string | null): Question | null {
  return findQuestionById(getAllQuestions(), questionId);
}

export function findQuestionById(
  questions: Question[],
  questionId: string | null,
): Question | null {
  if (!questionId) return null;
  return questions.find((q) => q.questionId === questionId) ?? null;
}

export function getQuestionSourceUrl(questionId: string): string {
  return findQuestionSourceUrl(questionPages, questionId);
}

export function findQuestionSourceUrl(pages: QuestionPage[], questionId: string): string {
  const page = pages.find((p) => p.questions.some((q) => q.questionId === questionId));
  return page?.url ?? "";
}

export function loadQuestionsBySource(sourceId: string): Question[] {
  const page = questionPages.find((p) => p.sourceId === sourceId);
  return page?.questions ?? [];
}

function pickRandomQuestion(questions: Question[], random: () => number): Question | null {
  if (questions.length === 0) return null;
  const randomValue = random();
  const normalizedRandomValue = randomValue >= 1 ? 1 - Number.EPSILON : Math.max(randomValue, 0);
  const index = Math.floor(normalizedRandomValue * questions.length);

  return questions[index] ?? null;
}
