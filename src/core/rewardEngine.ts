import type { PokemonStats } from "@/stores/types";

const MAX_STAT = 100;

interface Berry {
  name: string;
  stat: keyof PokemonStats;
}

const BERRY_POOL: Berry[] = [
  { name: "오랭열매", stat: "hp" },
  { name: "무화열매", stat: "attack" },
  { name: "나나열매", stat: "defense" },
  { name: "배리열매", stat: "speed" },
];

// 정답 보상 계산 (첫 정답 +5, 재정답 +1)
export function applyCorrectAnswerReward(stats: PokemonStats, isFirstSolve: boolean): PokemonStats {
  const delta = isFirstSolve ? 5 : 1;
  return {
    hp: Math.min(stats.hp + delta, MAX_STAT),
    attack: Math.min(stats.attack + delta, MAX_STAT),
    defense: Math.min(stats.defense + delta, MAX_STAT),
    speed: Math.min(stats.speed + delta, MAX_STAT),
  };
}

// 연속 정답 갱신
export function updateStreak(currentStreak: number, isCorrect: boolean): number {
  return isCorrect ? currentStreak + 1 : 0;
}

// 열매 지급 여부 (연속 10개마다)
export function checkBerryReward(streak: number): Berry | null {
  if (streak > 0 && streak % 10 === 0) {
    return BERRY_POOL[Math.floor(Math.random() * BERRY_POOL.length)];
  }
  return null;
}

// 열매 효과 적용 (해당 스탯 +5)
export function applyBerry(stats: PokemonStats, berry: Berry): PokemonStats {
  return {
    ...stats,
    [berry.stat]: Math.min(stats[berry.stat] + 5, MAX_STAT),
  };
}
