import type { PokemonSpecies } from "./types";

// 피카츄 → 라이츄 (2단 진화)
export const pikachuLine: PokemonSpecies[] = [
  {
    speciesId: "pikachu",
    dexNumber: 25,
    nameKo: "피카츄",
    nameEn: "Pikachu",
    category: "normal",
    isStarter: false,
    evolutionStage: 1,
    evolutionLine: ["pikachu", "raichu"],
    nextEvolutionSpeciesId: "raichu",
    branchEvolutionSpeciesIds: [],
  },
  {
    speciesId: "raichu",
    dexNumber: 26,
    nameKo: "라이츄",
    nameEn: "Raichu",
    category: "normal",
    isStarter: false,
    evolutionStage: 2,
    evolutionLine: ["pikachu", "raichu"],
    nextEvolutionSpeciesId: null,
    branchEvolutionSpeciesIds: [],
  },
];
