import { describe, it, expect } from "vitest";
import {
  findQuestionById,
  findQuestionSourceUrl,
  getNextQuestion,
  pickNextQuestion,
} from "@/core/quizLoader";
import type { Question, QuestionPage } from "@/content/questions/types";

const questions: Question[] = [
  {
    questionId: "q1",
    type: "yes_no",
    prompt: "첫 번째 문제",
    answer: true,
    conceptGroup: "sample",
    explanation: "",
    sourceExcerptId: "sample-001",
  },
  {
    questionId: "q2",
    type: "yes_no",
    prompt: "두 번째 문제",
    answer: false,
    conceptGroup: "sample",
    explanation: "",
    sourceExcerptId: "sample-002",
  },
  {
    questionId: "q3",
    type: "yes_no",
    prompt: "세 번째 문제",
    answer: true,
    conceptGroup: "sample",
    explanation: "",
    sourceExcerptId: "sample-003",
  },
];

const questionPages: QuestionPage[] = [
  {
    sourceId: "sample",
    title: "샘플",
    url: "https://example.com/sample",
    questions: [questions[0], questions[1]],
  },
];

describe("getNextQuestion", () => {
  it("정적 문제 목록에서도 다음 문제를 반환", () => {
    const result = getNextQuestion([], null, () => 0);
    expect(result).not.toBeNull();
  });
});

describe("pickNextQuestion", () => {
  it("안 푼 문제가 있으면 그 중에서 출제", () => {
    const result = pickNextQuestion(questions, ["q1"], null, () => 0);
    expect(result?.questionId).toBe("q2");
  });

  it("현재 문제는 다시 출제하지 않음", () => {
    const result = pickNextQuestion(questions, [], "q1", () => 0);
    expect(result?.questionId).toBe("q2");
  });

  it("전부 풀어도 재출제", () => {
    const result = pickNextQuestion(questions, ["q1", "q2", "q3"], null, () => 0.7);
    expect(result?.questionId).toBe("q3");
  });

  it("전부 풀고 현재 문제 제외하면 다른 문제 출제", () => {
    const result = pickNextQuestion(questions, ["q1", "q2", "q3"], "q1", () => 0);
    expect(result?.questionId).toBe("q2");
  });

  it("문제가 1개뿐이고 현재 문제와 같으면 null 반환", () => {
    const result = pickNextQuestion([questions[0]], [], "q1", () => 0);
    expect(result).toBeNull();
  });

  it("문제가 없으면 null 반환", () => {
    const result = pickNextQuestion([], [], null, () => 0);
    expect(result).toBeNull();
  });
});

describe("question lookup", () => {
  it("문제 ID로 문제를 찾음", () => {
    const result = findQuestionById(questions, "q2");
    expect(result?.prompt).toBe("두 번째 문제");
  });

  it("문제 ID가 없거나 매칭되지 않으면 null 반환", () => {
    expect(findQuestionById(questions, null)).toBeNull();
    expect(findQuestionById(questions, "missing")).toBeNull();
  });

  it("문제가 속한 출처 URL을 찾음", () => {
    expect(findQuestionSourceUrl(questionPages, "q1")).toBe("https://example.com/sample");
  });

  it("출처가 없으면 빈 문자열 반환", () => {
    expect(findQuestionSourceUrl(questionPages, "missing")).toBe("");
  });
});
