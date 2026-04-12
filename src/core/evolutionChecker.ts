import type { PokemonInstance } from "@/stores/types";
import type { PokemonSpecies } from "@/content/pokemon/types";

// 진화 가능 여부 판정
// 3단 진화: 1차→2차 (4스탯 50+), 2차→3차 (4스탯 85+)
// 2단 진화: 진화 (4스탯 50+)
export function isEvolutionReady(instance: PokemonInstance, species: PokemonSpecies): boolean {
  if (!species.nextEvolutionSpeciesId) return false;
  if (instance.evolutionPending) return false;

  const { hp, attack, defense, speed } = instance.stats;
  const maxStages = species.evolutionLine.length;

  // 3단 진화 포켓몬
  if (maxStages === 3) {
    if (instance.currentStage === 1) {
      return hp >= 50 && attack >= 50 && defense >= 50 && speed >= 50;
    }
    if (instance.currentStage === 2) {
      return hp >= 85 && attack >= 85 && defense >= 85 && speed >= 85;
    }
  }

  // 2단 진화 포켓몬
  if (maxStages === 2 && instance.currentStage === 1) {
    return hp >= 50 && attack >= 50 && defense >= 50 && speed >= 50;
  }

  return false;
}

// 졸업 가능 여부 판정 (최종 진화체에서 4스탯 모두 100)
export function isGraduationReady(instance: PokemonInstance, species: PokemonSpecies): boolean {
  if (instance.graduated) return false;

  const isLastStage = !species.nextEvolutionSpeciesId;
  if (!isLastStage) return false;

  const { hp, attack, defense, speed } = instance.stats;
  return hp >= 100 && attack >= 100 && defense >= 100 && speed >= 100;
}

// 신규 포켓몬 선택 가능 여부
// 졸업 상태에서 다음 정답을 맞히면 선택 UI를 띄운다
export function shouldOpenPokemonSelection(
  instance: PokemonInstance,
  species: PokemonSpecies,
  isCorrectAnswer: boolean,
): boolean {
  if (!isCorrectAnswer) return false;
  if (!instance.graduated) return false;

  const isLastStage = !species.nextEvolutionSpeciesId;
  if (!isLastStage) return false;

  // 무진화 포켓몬: 4스탯 50+ 이면 선택 가능
  if (species.evolutionLine.length === 1) {
    const { hp, attack, defense, speed } = instance.stats;
    return hp >= 50 && attack >= 50 && defense >= 50 && speed >= 50;
  }

  return true;
}
