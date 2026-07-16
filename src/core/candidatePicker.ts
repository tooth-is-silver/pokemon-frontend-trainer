import type { PokemonSpecies } from "@/content/pokemon/types";

// 졸업 모달의 후보 풀을 결정하는 단계
// none = 일반 wave, legendary-birds = wave 1, mewtwo = wave 2, mew = wave 3
export type LegendaryStage = "none" | "legendary-birds" | "mewtwo" | "mew";

const NORMAL_WAVE_SIZE = 3;
const LEGENDARY_BIRD_IDS = ["articuno", "zapdos", "moltres"];

interface PickArgs {
  unlockedSpeciesIds: string[];
  graduatedSpeciesIds: string[];
  // 졸업 모달을 띄운 현재 포켓몬은 아직 서버상 graduated가 아니므로 후보 계산에서 함께 제외한다.
  graduatingSpeciesId?: string;
  legendaryStage: LegendaryStage;
  allSpecies: PokemonSpecies[];
  random?: () => number;
}

// 졸업 후 다음 포켓몬 후보를 결정한다.
// - 일반 wave: 미등록 일반 1세대 1차 진화체 중 랜덤 3마리
// - 전설 wave: wave 별 정해진 종 중 미졸업 항목을 풀 그대로 노출
// - 풀이 비면 빈 배열을 반환한다 (호출자가 wave 트랜지션 트리거)
export function pickGraduationCandidates({
  unlockedSpeciesIds,
  graduatedSpeciesIds,
  graduatingSpeciesId,
  legendaryStage,
  allSpecies,
  random = Math.random,
}: PickArgs): PokemonSpecies[] {
  const pool = buildPool({
    unlockedSpeciesIds,
    graduatedSpeciesIds,
    graduatingSpeciesId,
    legendaryStage,
    allSpecies,
  });

  if (pool.length === 0) return [];

  const targetCount = legendaryStage === "none" ? NORMAL_WAVE_SIZE : pool.length;

  if (pool.length <= targetCount) return [...pool];

  return shuffleSlice(pool, targetCount, random);
}

function buildPool({
  unlockedSpeciesIds,
  graduatedSpeciesIds,
  graduatingSpeciesId,
  legendaryStage,
  allSpecies,
}: Omit<PickArgs, "random">): PokemonSpecies[] {
  const unlocked = new Set(unlockedSpeciesIds);
  const graduated = new Set([
    ...graduatedSpeciesIds,
    ...(graduatingSpeciesId ? [graduatingSpeciesId] : []),
  ]);

  if (legendaryStage === "none") {
    const normalPool = allSpecies.filter(
      (species) =>
        species.category === "normal" &&
        species.evolutionStage === 1 &&
        !unlocked.has(species.speciesId),
    );

    if (normalPool.length > 0) return normalPool;
    if (isNormalPokedexCompleted(unlocked, allSpecies)) {
      return pickLegendaryBirdPool(allSpecies, graduated);
    }

    return [];
  }

  if (legendaryStage === "legendary-birds") {
    const birdPool = pickLegendaryBirdPool(allSpecies, graduated);
    if (birdPool.length > 0) return birdPool;
    return pickSingleLegendary(allSpecies, graduated, "mewtwo");
  }

  if (legendaryStage === "mewtwo") {
    if (graduated.has("mewtwo")) return pickSingleLegendary(allSpecies, graduated, "mew");
    return pickSingleLegendary(allSpecies, graduated, "mewtwo");
  }

  return pickSingleLegendary(allSpecies, graduated, "mew");
}

function isNormalPokedexCompleted(unlocked: Set<string>, allSpecies: PokemonSpecies[]): boolean {
  return allSpecies
    .filter((species) => species.category === "normal")
    .every((species) => unlocked.has(species.speciesId));
}

function pickLegendaryBirdPool(
  allSpecies: PokemonSpecies[],
  graduated: Set<string>,
): PokemonSpecies[] {
  return allSpecies.filter(
    (species) =>
      LEGENDARY_BIRD_IDS.includes(species.speciesId) && !graduated.has(species.speciesId),
  );
}

function pickSingleLegendary(
  allSpecies: PokemonSpecies[],
  graduated: Set<string>,
  speciesId: string,
): PokemonSpecies[] {
  return allSpecies.filter(
    (species) => species.speciesId === speciesId && !graduated.has(species.speciesId),
  );
}

function shuffleSlice<T>(arr: T[], n: number, random: () => number): T[] {
  const copy = [...arr];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
