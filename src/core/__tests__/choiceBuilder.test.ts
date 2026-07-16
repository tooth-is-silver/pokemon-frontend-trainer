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
    const options = buildMultipleChoiceOptions(question, () => 0);
    expect(options).toContain(question.answer);
  });

  it("기존 보기 5개면 5개 반환", () => {
    const options = buildMultipleChoiceOptions(question, () => 0);
    expect(options).toHaveLength(5);
  });

  it("같은 난수 입력에는 같은 보기 순서를 반환", () => {
    const firstOptions = buildMultipleChoiceOptions(question, () => 0);
    const secondOptions = buildMultipleChoiceOptions(question, () => 0);

    expect(secondOptions).toEqual(firstOptions);
  });

  it("다른 난수 입력에는 다른 보기 순서를 반환", () => {
    const firstOptions = buildMultipleChoiceOptions(question, () => 0);
    const secondOptions = buildMultipleChoiceOptions(question, () => 0.999);

    expect(secondOptions).not.toEqual(firstOptions);
  });
});
