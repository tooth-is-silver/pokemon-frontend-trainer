import { starters } from "./starters";
import { nonEvolvingSpecies } from "./non-evolving";
import { pikachuLine } from "./pikachu-line";
import type { PokemonSpecies } from "./types";

// 데이터가 추가되면 아래 배열에 새 모듈을 spread 해서 합친다.
// 사용처는 항상 헬퍼 함수만 호출하므로 import 시그니처는 유지된다.
const allSpecies: PokemonSpecies[] = [...starters, ...nonEvolvingSpecies, ...pikachuLine];

export function getAllSpecies(): PokemonSpecies[] {
  return allSpecies;
}

export function findSpeciesById(speciesId: string): PokemonSpecies | null {
  return allSpecies.find((s) => s.speciesId === speciesId) ?? null;
}

export function findSpeciesByDex(dexNumber: number): PokemonSpecies | null {
  return allSpecies.find((s) => s.dexNumber === dexNumber) ?? null;
}

export function getStarters(): PokemonSpecies[] {
  return allSpecies.filter((s) => s.isStarter);
}
