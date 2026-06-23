import type { PokemonInstance } from "@/stores/types";
import type { PokemonSpecies } from "@/content/pokemon/types";

const EVOLUTION_FIRST = 50;
const EVOLUTION_SECOND = 85;
const GRADUATION = 100;
const SINGLE_STAGE_THRESHOLD = 50;

// 진화 가능 여부 판정
// 3단 진화: 1차→2차 (EXP 50+), 2차→3차 (EXP 85+)
// 2단 진화: 진화 (EXP 50+)
export function isEvolutionReady(instance: PokemonInstance, species: PokemonSpecies): boolean {
  if (!species.nextEvolutionSpeciesId) return false;
  if (instance.evolutionPending) return false;

  const maxStages = species.evolutionLine.length;

  if (maxStages === 3) {
    if (instance.currentStage === 1) return instance.exp >= EVOLUTION_FIRST;
    if (instance.currentStage === 2) return instance.exp >= EVOLUTION_SECOND;
  }

  if (maxStages === 2 && instance.currentStage === 1) {
    return instance.exp >= EVOLUTION_FIRST;
  }

  return false;
}

// 졸업 가능 여부 판정
// - 다단 진화: 최종 진화체에서 EXP 100
// - 무진화: EXP 50
export function isGraduationReady(instance: PokemonInstance, species: PokemonSpecies): boolean {
  if (instance.graduated) return false;

  const isLastStage = !species.nextEvolutionSpeciesId;
  if (!isLastStage) return false;

  const threshold = species.evolutionLine.length === 1 ? SINGLE_STAGE_THRESHOLD : GRADUATION;
  return instance.exp >= threshold;
}

// 신규 포켓몬 선택 가능 여부
// 졸업 상태에서 다음 정답을 맞히면 선택 UI를 띄운다
// 무진화 포켓몬: EXP 50+ 이면 선택 가능 (졸업 개념 없음)
export function shouldOpenPokemonSelection(
  instance: PokemonInstance,
  species: PokemonSpecies,
  isCorrectAnswer: boolean,
): boolean {
  if (!isCorrectAnswer) return false;

  const isLastStage = !species.nextEvolutionSpeciesId;
  if (!isLastStage) return false;

  // 무진화 포켓몬: graduated 체크 없이 EXP 기준만 적용
  if (species.evolutionLine.length === 1) {
    return instance.exp >= SINGLE_STAGE_THRESHOLD;
  }

  // 다단 진화 포켓몬: 졸업 상태여야 함
  return instance.graduated;
}
