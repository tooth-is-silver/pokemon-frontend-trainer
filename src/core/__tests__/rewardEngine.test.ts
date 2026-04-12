import { describe, it, expect } from "vitest";
import {
  applyCorrectAnswerReward,
  updateStreak,
  checkBerryReward,
  applyBerry,
} from "@/core/rewardEngine";
import type { PokemonStats } from "@/stores/types";

const baseStats: PokemonStats = { hp: 0, attack: 0, defense: 0, speed: 0 };

describe("applyCorrectAnswerReward", () => {
  it("첫 정답: 모든 스탯 +5", () => {
    const result = applyCorrectAnswerReward(baseStats, true);
    expect(result).toEqual({ hp: 5, attack: 5, defense: 5, speed: 5 });
  });

  it("재정답: 모든 스탯 +1", () => {
    const result = applyCorrectAnswerReward(baseStats, false);
    expect(result).toEqual({ hp: 1, attack: 1, defense: 1, speed: 1 });
  });

  it("스탯 100 캡: 98 + 5 = 100", () => {
    const high: PokemonStats = { hp: 98, attack: 98, defense: 98, speed: 98 };
    const result = applyCorrectAnswerReward(high, true);
    expect(result).toEqual({ hp: 100, attack: 100, defense: 100, speed: 100 });
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
    expect(checkBerryReward(10)).not.toBeNull();
  });

  it("연속 20개 → 열매 지급", () => {
    expect(checkBerryReward(20)).not.toBeNull();
  });

  it("연속 11개 → 미지급", () => {
    expect(checkBerryReward(11)).toBeNull();
  });

  it("연속 0개 → 미지급", () => {
    expect(checkBerryReward(0)).toBeNull();
  });
});

describe("applyBerry", () => {
  it("해당 스탯 +5", () => {
    const result = applyBerry(baseStats, { name: "오랭열매", stat: "hp" });
    expect(result.hp).toBe(5);
    expect(result.attack).toBe(0);
  });

  it("스탯 100 캡", () => {
    const high: PokemonStats = { hp: 97, attack: 0, defense: 0, speed: 0 };
    const result = applyBerry(high, { name: "오랭열매", stat: "hp" });
    expect(result.hp).toBe(100);
  });
});
