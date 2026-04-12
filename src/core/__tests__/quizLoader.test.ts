import { describe, it, expect } from "vitest";
import { getNextQuestion } from "@/core/quizLoader";
import { getAllQuestions } from "@/content/questions";

describe("getNextQuestion", () => {
  const allIds = getAllQuestions().map((q) => q.questionId);

  it("안 푼 문제가 있으면 그 중에서 출제", () => {
    const solved = [allIds[0]];
    const result = getNextQuestion(solved, null);
    expect(result).not.toBeNull();
    expect(result!.questionId).not.toBe(allIds[0]);
  });

  it("현재 문제는 다시 출제하지 않음", () => {
    const result = getNextQuestion([], allIds[0]);
    expect(result).not.toBeNull();
    expect(result!.questionId).not.toBe(allIds[0]);
  });

  it("전부 풀어도 재출제", () => {
    const result = getNextQuestion(allIds, null);
    expect(result).not.toBeNull();
  });

  it("전부 풀고 현재 문제 제외하면 다른 문제 출제", () => {
    const result = getNextQuestion(allIds, allIds[0]);
    expect(result).not.toBeNull();
    expect(result!.questionId).not.toBe(allIds[0]);
  });
});
