import type { PokemonSpecies } from "./types";

// 전설 5종. 일반 wave 후보에서 항상 제외되며, 일반 도감 완성 후 wave 단계별로 등장한다.
// - wave 1 (legendary-birds): 프리저, 썬더, 파이어 (3 → 2 → 1)
// - wave 2 (mewtwo): 뮤츠 단독 (자동 해금)
// - wave 3 (mew): 뮤 단독 (자동 해금)
export const legendarySpecies: PokemonSpecies[] = [
  {
    speciesId: "articuno",
    dexNumber: 144,
    nameKo: "프리저",
    nameEn: "Articuno",
    category: "legendary",
    isStarter: false,
    evolutionStage: 1,
    evolutionLine: ["articuno"],
    nextEvolutionSpeciesId: null,
    branchEvolutionSpeciesIds: [],
  },
  {
    speciesId: "zapdos",
    dexNumber: 145,
    nameKo: "썬더",
    nameEn: "Zapdos",
    category: "legendary",
    isStarter: false,
    evolutionStage: 1,
    evolutionLine: ["zapdos"],
    nextEvolutionSpeciesId: null,
    branchEvolutionSpeciesIds: [],
  },
  {
    speciesId: "moltres",
    dexNumber: 146,
    nameKo: "파이어",
    nameEn: "Moltres",
    category: "legendary",
    isStarter: false,
    evolutionStage: 1,
    evolutionLine: ["moltres"],
    nextEvolutionSpeciesId: null,
    branchEvolutionSpeciesIds: [],
  },
  {
    speciesId: "mewtwo",
    dexNumber: 150,
    nameKo: "뮤츠",
    nameEn: "Mewtwo",
    category: "legendary",
    isStarter: false,
    evolutionStage: 1,
    evolutionLine: ["mewtwo"],
    nextEvolutionSpeciesId: null,
    branchEvolutionSpeciesIds: [],
  },
  {
    speciesId: "mew",
    dexNumber: 151,
    nameKo: "뮤",
    nameEn: "Mew",
    category: "legendary",
    isStarter: false,
    evolutionStage: 1,
    evolutionLine: ["mew"],
    nextEvolutionSpeciesId: null,
    branchEvolutionSpeciesIds: [],
  },
];
