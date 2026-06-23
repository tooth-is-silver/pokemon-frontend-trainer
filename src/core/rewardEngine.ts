const MAX_EXP = 100;
const EXP_THRESHOLDS = [50, 85, 100] as const;

interface Berry {
  name: string;
}

const BERRY_POOL: Berry[] = [
  { name: "오랭열매" },
  { name: "무화열매" },
  { name: "나나열매" },
  { name: "배리열매" },
];

function getGrowthTarget(exp: number): number {
  return EXP_THRESHOLDS.find((threshold) => exp < threshold) ?? MAX_EXP;
}

// 정답 보상 계산 (첫 정답 +5, 재정답 +1)
export function applyCorrectAnswerReward(exp: number, isFirstSolve: boolean): number {
  const delta = isFirstSolve ? 5 : 1;
  const target = getGrowthTarget(exp);

  return Math.min(exp + delta, target);
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

// 열매 효과 적용 (EXP +5)
export function applyBerry(exp: number): number {
  return Math.min(exp + 5, MAX_EXP);
}
