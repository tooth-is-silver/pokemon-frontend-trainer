const MAX_EXP = 100;
const EXP_THRESHOLDS = [50, 85, 100];

interface Berry {
  name: string;
}

const BERRY_POOL: Berry[] = [
  { name: "오랭열매" },
  { name: "무화열매" },
  { name: "나나열매" },
  { name: "배리열매" },
];

function getGrowthTarget(exp: number) {
  return EXP_THRESHOLDS.find((threshold) => exp < threshold) ?? MAX_EXP;
}

export function applyCorrectAnswerReward(exp: number, isFirstSolve: boolean): number {
  const delta = isFirstSolve ? 5 : 1;
  const target = getGrowthTarget(exp);

  return Math.min(exp + delta, target);
}

export function updateStreak(currentStreak: number, isCorrect: boolean): number {
  return isCorrect ? currentStreak + 1 : 0;
}

export function checkBerryReward(streak: number, random: () => number): Berry | null {
  if (streak > 0 && streak % 10 === 0) {
    return BERRY_POOL[Math.floor(random() * BERRY_POOL.length)] ?? null;
  }
  return null;
}

export function applyBerry(exp: number): number {
  return Math.min(exp + 5, MAX_EXP);
}
