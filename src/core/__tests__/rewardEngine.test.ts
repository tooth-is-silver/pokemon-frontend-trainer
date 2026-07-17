import { describe, it, expect } from "vitest";
import {
  applyCorrectAnswerReward,
  updateStreak,
  checkBerryReward,
  applyBerry,
} from "@/core/rewardEngine";

describe("applyCorrectAnswerReward", () => {
  it("첫 정답: EXP +5", () => {
    expect(applyCorrectAnswerReward(0, true)).toBe(5);
  });

  it("재정답: EXP +1", () => {
    expect(applyCorrectAnswerReward(0, false)).toBe(1);
  });

  it("50 경계 직전이면 50까지만 오른다", () => {
    expect(applyCorrectAnswerReward(49, true)).toBe(50);
  });

  it("50 이상이면 다음 경계는 85", () => {
    expect(applyCorrectAnswerReward(80, true)).toBe(85);
  });

  it("85 이상이면 다음 경계는 100", () => {
    expect(applyCorrectAnswerReward(99, true)).toBe(100);
  });

  it("EXP 100이면 변화 없음", () => {
    expect(applyCorrectAnswerReward(100, true)).toBe(100);
  });
});

describe("updateStreak", () => {
  it("정답 시 +1", () => {
    expect(updateStreak(5, true)).toBe(6);
  });

  it("오답 시 0 리셋", () => {
    expect(updateStreak(9, false)).toBe(0);
  });
});

describe("checkBerryReward", () => {
  it("연속 10개 → 열매 지급", () => {
    expect(checkBerryReward(10, () => 0)).toEqual({ name: "오랭열매" });
  });

  it("연속 20개 → 열매 지급", () => {
    expect(checkBerryReward(20, () => 0.999)).toEqual({ name: "배리열매" });
  });

  it("연속 11개 → 미지급", () => {
    expect(checkBerryReward(11, () => 0)).toBeNull();
  });

  it("연속 0개 → 미지급", () => {
    expect(checkBerryReward(0, () => 0)).toBeNull();
  });
});

describe("applyBerry", () => {
  it("EXP +5", () => {
    expect(applyBerry(0)).toBe(5);
  });

  it("EXP 100 캡", () => {
    expect(applyBerry(97)).toBe(100);
  });
});
