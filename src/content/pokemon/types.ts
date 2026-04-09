export type PokemonSpecies = {
  speciesId: string;
  dexNumber: number;
  nameKo: string;
  nameEn: string;
  category: "normal" | "legendary";
  isStarter: boolean;
  evolutionStage: number;
  evolutionLine: string[];
  nextEvolutionSpeciesId: string | null;
  branchEvolutionSpeciesIds: string[];
};

export function getSpriteUrl(dexNumber: number): string {
  return `/sprites/${dexNumber}.png`;
}
