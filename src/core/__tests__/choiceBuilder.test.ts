import { describe, it, expect } from "vitest";
import { buildMultipleChoiceOptions } from "@/core/choiceBuilder";
import type { MultipleChoiceQuestion } from "@/content/questions/types";

const question: MultipleChoiceQuestion = {
  questionId: "object-methods-mc-001",
  type: "multiple_choice",
  prompt: "메서드 안의 this는 보통 무엇을 가리키나?",
  answer: "점 앞의 객체",
  choices: ["전역 객체", "점 앞의 객체", "항상 undefined", "항상 함수 자신", "새로 생성된 빈 객체"],
  conceptGroup: "this-core",
  explanation: "",
  sourceExcerptId: "object-methods-004",
};

describe("buildMultipleChoiceOptions", () => {
  it("보기에 정답이 항상 포함", () => {
    const options = buildMultipleChoiceOptions(question);
    expect(options).toContain(question.answer);
  });

  it("기존 보기 5개면 5개 반환", () => {
    const options = buildMultipleChoiceOptions(question);
    expect(options).toHaveLength(5);
  });

  it("셔플되어 순서가 달라질 수 있음 (10회 중 한 번이라도 다르면 통과)", () => {
    const results = Array.from({ length: 10 }, () => buildMultipleChoiceOptions(question));
    const firstOrder = JSON.stringify(results[0]);
    const hasDifferentOrder = results.some((r) => JSON.stringify(r) !== firstOrder);
    expect(hasDifferentOrder).toBe(true);
  });
});
