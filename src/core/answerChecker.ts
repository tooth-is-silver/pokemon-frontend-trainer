import type { Question } from "../content/questions/types";

// 입력 정규화: trim, 소문자 변환, 연속 공백 제거
export function normalizeAnswer(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

// 정답 판정
export function checkAnswer(question: Question, userAnswer: string): boolean {
  switch (question.type) {
    case "yes_no":
      return checkYesNo(question.answer, userAnswer);
    case "multiple_choice":
      return normalizeAnswer(userAnswer) === normalizeAnswer(question.answer);
    case "fill_blank":
      return checkFillBlank(question.acceptedAnswers, userAnswer);
  }
}

function checkYesNo(answer: boolean, userAnswer: string): boolean {
  const normalized = normalizeAnswer(userAnswer);
  if (answer) {
    return ["예", "yes", "true", "o", "맞다"].includes(normalized);
  }
  return ["아니오", "아니요", "no", "false", "x", "틀리다"].includes(normalized);
}

function checkFillBlank(acceptedAnswers: string[], userAnswer: string): boolean {
  const normalized = normalizeAnswer(userAnswer);
  return acceptedAnswers.some((a) => normalizeAnswer(a) === normalized);
}
