import { describe, it, expect } from "vitest";
import { checkAnswer, normalizeAnswer } from "@/core/answerChecker";
import type {
  YesNoQuestion,
  MultipleChoiceQuestion,
  FillBlankQuestion,
} from "@/content/questions/types";

describe("normalizeAnswer", () => {
  it("trim, 소문자, 연속 공백 제거", () => {
    expect(normalizeAnswer("  Hello  World  ")).toBe("hello world");
  });
});

describe("checkAnswer", () => {
  describe("yes_no", () => {
    const question: YesNoQuestion = {
      questionId: "test-yn",
      type: "yes_no",
      prompt: "테스트",
      answer: true,
      conceptGroup: "test",
      explanation: "",
      sourceExcerptId: "test",
    };

    it("정답이 true일 때 'true' → 정답", () => {
      expect(checkAnswer(question, "true")).toBe(true);
    });

    it("정답이 true일 때 'false' → 오답", () => {
      expect(checkAnswer(question, "false")).toBe(false);
    });

    it("정답이 false일 때 'false' → 정답", () => {
      expect(checkAnswer({ ...question, answer: false }, "false")).toBe(true);
    });
  });

  describe("multiple_choice", () => {
    const question: MultipleChoiceQuestion = {
      questionId: "test-mc",
      type: "multiple_choice",
      prompt: "테스트",
      answer: "점 앞의 객체",
      choices: ["전역 객체", "점 앞의 객체", "undefined", "함수 자신", "빈 객체"],
      conceptGroup: "test",
      explanation: "",
      sourceExcerptId: "test",
    };

    it("정확한 답 → 정답", () => {
      expect(checkAnswer(question, "점 앞의 객체")).toBe(true);
    });

    it("대소문자/공백 정규화 후 비교", () => {
      expect(checkAnswer(question, "  점 앞의 객체  ")).toBe(true);
    });

    it("오답 → 오답", () => {
      expect(checkAnswer(question, "전역 객체")).toBe(false);
    });
  });

  describe("fill_blank", () => {
    const question: FillBlankQuestion = {
      questionId: "test-fb",
      type: "fill_blank",
      prompt: "테스트 ____ 문제",
      answer: "this",
      acceptedAnswers: ["this", "디스"],
      conceptGroup: "test",
      explanation: "",
      sourceExcerptId: "test",
    };

    it("acceptedAnswers 중 하나 → 정답", () => {
      expect(checkAnswer(question, "this")).toBe(true);
      expect(checkAnswer(question, "디스")).toBe(true);
    });

    it("대소문자 무관", () => {
      expect(checkAnswer(question, "THIS")).toBe(true);
    });

    it("허용되지 않은 답 → 오답", () => {
      expect(checkAnswer(question, "that")).toBe(false);
    });
  });
});
