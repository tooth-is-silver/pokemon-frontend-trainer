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
    nameKo: "새싹 평원",
    terrainLabel: "초원",
    description: "처음 탐험을 시작하는 넓은 들판이에요. 낯익은 포켓몬을 만나기 좋아요.",
    unlockRequiredPokedexCount: 0,
    encounterRatePercent: 50,
    habitatSummary: "풀숲, 작은 숲, 초반 포켓몬",
    accentClassName: "from-lime-200 via-emerald-100 to-sky-100 border-lime-200",
  },
  {
    regionId: "misty-shore",
    nameKo: "물안개 해안",
    terrainLabel: "물",
    description: "잔잔한 파도와 물안개가 깔린 해안이에요. 물가 포켓몬이 자주 보여요.",
    unlockRequiredPokedexCount: 5,
    encounterRatePercent: 50,
    habitatSummary: "해안, 강가, 물 타입 포켓몬",
    accentClassName: "from-cyan-200 via-blue-100 to-white border-cyan-200",
  },
  {
    regionId: "ashen-mountain",
    nameKo: "잿빛 바위산",
    terrainLabel: "산",
    description: "바위길과 동굴이 이어진 산악 지역이에요. 단단한 포켓몬이 숨어 있어요.",
    unlockRequiredPokedexCount: 12,
    encounterRatePercent: 50,
    habitatSummary: "동굴, 절벽, 바위·땅 타입 포켓몬",
    accentClassName: "from-stone-300 via-orange-100 to-amber-50 border-stone-300",
  },
  {
    regionId: "ghost-town",
    nameKo: "달그림자 마을",
    terrainLabel: "고스트타운",
    description: "밤마다 불빛이 흔들리는 오래된 마을이에요. 조용히 탐색해야 해요.",
    unlockRequiredPokedexCount: 20,
    encounterRatePercent: 50,
    habitatSummary: "폐건물, 묘지, 고스트 포켓몬",
    accentClassName: "from-violet-200 via-slate-200 to-indigo-100 border-violet-200",
  },
  {
    regionId: "sky-garden",
    nameKo: "하늘 정원",
    terrainLabel: "하늘",
    description: "구름 위로 이어진 높은 정원이에요. 날개 달린 포켓몬을 노릴 수 있어요.",
    unlockRequiredPokedexCount: 35,
    encounterRatePercent: 50,
    habitatSummary: "구름길, 높은 탑, 비행 포켓몬",
    accentClassName: "from-sky-200 via-indigo-100 to-white border-sky-200",
  },
  {
    regionId: "neon-city",
    nameKo: "네온 시티",
    terrainLabel: "도시",
    description: "간판과 전기가 반짝이는 도시예요. 특이한 포켓몬이 골목마다 나타나요.",
    unlockRequiredPokedexCount: 50,
    encounterRatePercent: 50,
    habitatSummary: "골목, 발전소, 전기·도시형 포켓몬",
    accentClassName: "from-yellow-200 via-rose-100 to-blue-100 border-yellow-200",
  },
];

export function isRegionUnlocked(region: Region, unlockedPokedexCount: number) {
  return unlockedPokedexCount >= region.unlockRequiredPokedexCount;
}
