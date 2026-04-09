import { getAllQuestions, questionPages } from "../content/questions";
import type { Question } from "../content/questions/types";

// 전체 문제 풀에서 다음 문제를 선택한다
// 안 푼 문제 우선, 다 풀었으면 기존 문제 재출제
export function getNextQuestion(
  solvedQuestionIds: string[],
  currentQuestionId: string | null
): Question | null {
  const allQuestions = getAllQuestions();
  if (allQuestions.length === 0) return null;

  const solvedSet = new Set(solvedQuestionIds);

  // 안 푼 문제 필터링 (현재 문제 제외)
  const unsolved = allQuestions.filter(
    (q) => !solvedSet.has(q.questionId) && q.questionId !== currentQuestionId
  );

  if (unsolved.length > 0) {
    return unsolved[Math.floor(Math.random() * unsolved.length)];
  }

  // 모두 풀었으면 현재 문제만 제외하고 랜덤 재출제
  const others = allQuestions.filter(
    (q) => q.questionId !== currentQuestionId
  );

  if (others.length > 0) {
    return others[Math.floor(Math.random() * others.length)];
  }

  // 문제가 1개뿐이고 현재 문제와 같으면 출제 불가
  return null;
}

// 특정 소스 페이지의 문제만 로드
export function loadQuestionsBySource(sourceId: string): Question[] {
  const page = questionPages.find((p) => p.sourceId === sourceId);
  return page?.questions ?? [];
}
