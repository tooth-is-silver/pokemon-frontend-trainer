import type { Question } from "../content/questions/types";

// 입력 정규화: trim, 소문자 변환, 연속 공백 제거
export function normalizeAnswer(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

// 정답 판정
// yes_no: userAnswer는 버튼 클릭으로 전달되는 "true" | "false"
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

function checkFillBlank(acceptedAnswers: string[], userAnswer: string): boolean {
  const normalized = normalizeAnswer(userAnswer);
  return acceptedAnswers.some((a) => normalizeAnswer(a) === normalized);
}
