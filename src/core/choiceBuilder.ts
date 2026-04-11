import { getAllQuestions } from "../content/questions";
import type { MultipleChoiceQuestion } from "../content/questions/types";

// 배열 셔플 (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 오지선다 보기 생성
// 같은 conceptGroup 내 다른 문제의 정답에서 오답 후보를 추출하고,
// 정답 포함 5개로 셔플하여 반환
export function buildMultipleChoiceOptions(question: MultipleChoiceQuestion): string[] {
  // 이미 보기가 5개 있으면 셔플만
  if (question.choices.length === 5) {
    return shuffle(question.choices);
  }

  const allQuestions = getAllQuestions();

  // 같은 conceptGroup의 다른 multiple_choice 문제에서 오답 후보 수집
  const candidates = allQuestions
    .filter(
      (q) =>
        q.type === "multiple_choice" &&
        q.conceptGroup === question.conceptGroup &&
        q.questionId !== question.questionId,
    )
    .map((q) => (q as MultipleChoiceQuestion).answer)
    .filter((answer) => answer !== question.answer);

  // 중복 제거
  const uniqueCandidates = [...new Set(candidates)];

  // 오답 4개 선택 (부족하면 있는 만큼만)
  const wrongAnswers = shuffle(uniqueCandidates).slice(0, 4);

  // 정답 포함하여 셔플
  return shuffle([question.answer, ...wrongAnswers]);
}
