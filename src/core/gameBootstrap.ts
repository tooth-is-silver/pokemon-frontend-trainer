import type { PokemonSpecies } from "@/content/pokemon/types";
import { isGraduationReady } from "@/core/evolutionChecker";
import type {
  PartyState,
  PokedexState,
  PokemonInstance,
  ProgressionState,
  SessionState,
  TrainerState,
} from "@/core/types";

interface TrainerRow {
  starter_chosen: boolean;
  active_pokemon_instance_id: string | null;
}

interface PokemonInstanceRow {
  id: string;
  species_id: string;
  current_stage: number;
  exp: number;
  total_correct_count: number;
  graduated: boolean;
  evolution_pending: boolean;
}

interface PokedexEntryRow {
  species_id: string;
}

interface ProgressionRow {
  streak_correct_count: number;
  pending_evolution_instance_id: string | null;
  pending_graduation_instance_id?: string | null;
  unlocked_legendary_stage: ProgressionState["unlockedLegendaryStage"];
  is_ending?: boolean | null;
}

interface SolvedQuestionRow {
  question_id: string;
}

interface ResolveLoadedGameStateArgs {
  trainerRow: TrainerRow;
  instanceRows: PokemonInstanceRow[];
  pokedexEntryRows: PokedexEntryRow[];
  progressionRow: ProgressionRow | null;
  solvedQuestionRows: SolvedQuestionRow[];
  allSpecies: PokemonSpecies[];
}

interface LoadedGameState {
  trainer: TrainerState;
  party: PartyState;
  pokedex: PokedexState;
  progression: ProgressionState;
  session: SessionState;
  loaded: true;
}

export function resolveLoadedGameState({
  trainerRow,
  instanceRows,
  pokedexEntryRows,
  progressionRow,
  solvedQuestionRows,
  allSpecies,
}: ResolveLoadedGameStateArgs): LoadedGameState {
  const instances = instanceRows.map(mapPokemonInstance);
  const activeInstance = instances.find(
    (instance) => instance.instanceId === trainerRow.active_pokemon_instance_id,
  );
  const activeSpecies = activeInstance
    ? (allSpecies.find((species) => species.speciesId === activeInstance.speciesId) ?? null)
    : null;
  const restoredGraduationInstanceId =
    activeInstance && activeSpecies && isGraduationReady(activeInstance, activeSpecies)
      ? activeInstance.instanceId
      : null;
  const solvedQuestionIds = [...new Set(solvedQuestionRows.map((row) => row.question_id))];

  return {
    trainer: {
      starterChosen: trainerRow.starter_chosen,
      activePokemonInstanceId: trainerRow.active_pokemon_instance_id,
    },
    party: { instances },
    pokedex: {
      unlockedSpeciesIds: pokedexEntryRows.map((row) => row.species_id),
      normalPokedexCompleted: false,
    },
    progression: progressionRow
      ? {
          streakCorrectCount: progressionRow.streak_correct_count,
          pendingEvolutionInstanceId: progressionRow.pending_evolution_instance_id,
          pendingGraduationInstanceId:
            progressionRow.pending_graduation_instance_id ?? restoredGraduationInstanceId,
          unlockedLegendaryStage: progressionRow.unlocked_legendary_stage,
          isEnding: progressionRow.is_ending ?? false,
        }
      : {
          streakCorrectCount: 0,
          pendingEvolutionInstanceId: null,
          pendingGraduationInstanceId: restoredGraduationInstanceId,
          unlockedLegendaryStage: "none",
          isEnding: false,
        },
    session: {
      currentQuestionId: null,
      solvedQuestionIds,
      lastAnswerCorrect: null,
    },
    loaded: true,
  };
}

function mapPokemonInstance(row: PokemonInstanceRow): PokemonInstance {
  return {
    instanceId: row.id,
    speciesId: row.species_id,
    currentStage: row.current_stage,
    exp: row.exp,
    totalCorrectCount: row.total_correct_count,
    graduated: row.graduated,
    evolutionPending: row.evolution_pending,
  };
}
