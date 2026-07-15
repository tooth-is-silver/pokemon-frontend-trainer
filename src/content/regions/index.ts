export interface Region {
  regionId: string;
  nameKo: string;
  terrainLabel: string;
  description: string;
  unlockRequiredPokedexCount: number;
  encounterRatePercent: number;
  habitatSummary: string;
  accentClassName: string;
}

export const regions: Region[] = [
  {
    regionId: "sprout-field",
    nameKo: "초록 평원",
    terrainLabel: "평원",
    description: "처음 탐험을 시작하는 넓은 들판이에요. 낯익은 포켓몬을 만나기 좋아요.",
    unlockRequiredPokedexCount: 0,
    encounterRatePercent: 50,
    habitatSummary: "풀숲, 들판, 초반 포켓몬",
    accentClassName: "from-lime-200 via-emerald-100 to-sky-100 border-lime-200",
  },
  {
    regionId: "misty-shore",
    nameKo: "물안개 해안",
    terrainLabel: "해안",
    description: "잔잔한 파도와 물안개가 깔린 해안이에요. 물가 포켓몬이 자주 보여요.",
    unlockRequiredPokedexCount: 5,
    encounterRatePercent: 50,
    habitatSummary: "해안, 강가, 물 타입 포켓몬",
    accentClassName: "from-cyan-200 via-blue-100 to-white border-cyan-200",
  },
  {
    regionId: "ashen-mountain",
    nameKo: "용암 동굴",
    terrainLabel: "화산",
    description: "뜨거운 용암과 동굴 입구가 이어진 지역이에요. 강한 포켓몬이 숨어 있어요.",
    unlockRequiredPokedexCount: 12,
    encounterRatePercent: 50,
    habitatSummary: "화산, 용암 동굴, 불꽃·바위 포켓몬",
    accentClassName: "from-stone-300 via-orange-100 to-amber-50 border-stone-300",
  },
  {
    regionId: "ghost-town",
    nameKo: "달그림자 폐허",
    terrainLabel: "폐허",
    description: "무너진 저택과 오래된 묘지가 남은 폐허예요. 조용히 탐색해야 해요.",
    unlockRequiredPokedexCount: 20,
    encounterRatePercent: 50,
    habitatSummary: "폐건물, 묘지, 고스트 포켓몬",
    accentClassName: "from-violet-200 via-slate-200 to-indigo-100 border-violet-200",
  },
  {
    regionId: "sky-garden",
    nameKo: "얼음 궁전",
    terrainLabel: "얼음 궁전",
    description: "구름과 눈 사이에 세워진 차가운 궁전이에요. 신비한 포켓몬이 머물러요.",
    unlockRequiredPokedexCount: 35,
    encounterRatePercent: 50,
    habitatSummary: "설원, 얼음 성, 수정 동굴",
    accentClassName: "from-sky-200 via-indigo-100 to-white border-sky-200",
  },
  {
    regionId: "neon-city",
    nameKo: "현대 도시",
    terrainLabel: "현대 도시",
    description: "전기와 네온이 반짝이는 현대 도시예요. 특이한 포켓몬이 골목마다 나타나요.",
    unlockRequiredPokedexCount: 50,
    encounterRatePercent: 50,
    habitatSummary: "도로, 연구소, 전기·도시형 포켓몬",
    accentClassName: "from-yellow-200 via-rose-100 to-blue-100 border-yellow-200",
  },
];

export function isRegionUnlocked(region: Region, unlockedPokedexCount: number) {
  return unlockedPokedexCount >= region.unlockRequiredPokedexCount;
}
