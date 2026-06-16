import type { PokemonStats } from "@/stores/types";

const MAX_STAT = 100;
const STAT_THRESHOLDS = [50, 85, 100] as const;
const STAT_KEYS = ["hp", "attack", "defense", "speed"] as const;

type PokemonStatKey = keyof PokemonStats;

interface Berry {
  name: string;
  stat: PokemonStatKey;
}

const BERRY_POOL: Berry[] = [
  { name: "오랭열매", stat: "hp" },
  { name: "무화열매", stat: "attack" },
  { name: "나나열매", stat: "defense" },
  { name: "배리열매", stat: "speed" },
];

function getGrowthTarget(stats: PokemonStats): number {
  return (
    STAT_THRESHOLDS.find((threshold) => STAT_KEYS.some((stat) => stats[stat] < threshold)) ??
    MAX_STAT
  );
}

function pickGrowthStat(
  stats: PokemonStats,
  target: number,
  random: () => number,
): PokemonStatKey | null {
  const candidates = STAT_KEYS.filter((stat) => stats[stat] < target);
  if (candidates.length === 0) return null;

  const index = Math.min(Math.floor(random() * candidates.length), candidates.length - 1);
  return candidates[index] ?? null;
}

// 정답 보상 계산 (첫 정답 +5, 재정답 +1)
export function applyCorrectAnswerReward(
  stats: PokemonStats,
  isFirstSolve: boolean,
  random = Math.random,
): PokemonStats {
  const delta = isFirstSolve ? 5 : 1;
  const target = getGrowthTarget(stats);
  const stat = pickGrowthStat(stats, target, random);
  if (!stat) return stats;

  return {
    ...stats,
    [stat]: Math.min(stats[stat] + delta, target),
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
