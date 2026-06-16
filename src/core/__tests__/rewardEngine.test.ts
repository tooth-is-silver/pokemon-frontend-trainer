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
  it("첫 정답: 랜덤으로 고른 스탯 1개만 +5", () => {
    const result = applyCorrectAnswerReward(baseStats, true, () => 0);
    expect(result).toEqual({ hp: 5, attack: 0, defense: 0, speed: 0 });
  });

  it("재정답: 랜덤으로 고른 스탯 1개만 +1", () => {
    const result = applyCorrectAnswerReward(baseStats, false, () => 0.99);
    expect(result).toEqual({ hp: 0, attack: 0, defense: 0, speed: 1 });
  });

  it("주입된 random 값이 1이어도 마지막 후보를 선택한다", () => {
    const result = applyCorrectAnswerReward(baseStats, true, () => 1);
    expect(result).toEqual({ hp: 0, attack: 0, defense: 0, speed: 5 });
  });

  it("현재 성장 경계에 도달한 스탯은 후보에서 제외", () => {
    const stats: PokemonStats = { hp: 50, attack: 45, defense: 50, speed: 45 };
    const result = applyCorrectAnswerReward(stats, true, () => 0);
    expect(result).toEqual({ hp: 50, attack: 50, defense: 50, speed: 45 });
  });

  it("50 경계 직전이면 50까지만 오른다", () => {
    const stats: PokemonStats = { hp: 49, attack: 50, defense: 50, speed: 50 };
    const result = applyCorrectAnswerReward(stats, true, () => 0);
    expect(result).toEqual({ hp: 50, attack: 50, defense: 50, speed: 50 });
  });

  it("4스탯 50 이상이면 다음 경계는 85", () => {
    const stats: PokemonStats = { hp: 80, attack: 85, defense: 85, speed: 85 };
    const result = applyCorrectAnswerReward(stats, true, () => 0);
    expect(result).toEqual({ hp: 85, attack: 85, defense: 85, speed: 85 });
  });

  it("4스탯 85 이상이면 다음 경계는 100", () => {
    const stats: PokemonStats = { hp: 99, attack: 100, defense: 100, speed: 100 };
    const result = applyCorrectAnswerReward(stats, true, () => 0);
    expect(result).toEqual({ hp: 100, attack: 100, defense: 100, speed: 100 });
  });

  it("모든 스탯이 100이면 변화 없음", () => {
    const result = applyCorrectAnswerReward(
      { hp: 100, attack: 100, defense: 100, speed: 100 },
      true,
      () => 0,
    );
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
