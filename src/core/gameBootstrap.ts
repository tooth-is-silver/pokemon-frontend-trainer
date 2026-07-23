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

interface PokemonEncounterRow {
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

interface ResolveLoadedGameStateInput {
  trainerRow: TrainerRow;
  instanceRows: PokemonInstanceRow[];
  pokedexEntryRows: PokedexEntryRow[];
  pokemonEncounterRows: PokemonEncounterRow[];
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
  pokemonEncounterRows,
  progressionRow,
  solvedQuestionRows,
  allSpecies,
}: ResolveLoadedGameStateInput): LoadedGameState {
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
  const unlockedSpeciesIds = [...new Set(pokedexEntryRows.map((row) => row.species_id))];
  const encounteredSpeciesIds = [...new Set(pokemonEncounterRows.map((row) => row.species_id))];
  const normalPokedexCompleted = allSpecies
    .filter((species) => species.category === "normal")
    .every((species) => unlockedSpeciesIds.includes(species.speciesId));

  return {
    trainer: {
      starterChosen: trainerRow.starter_chosen,
      activePokemonInstanceId: trainerRow.active_pokemon_instance_id,
    },
    party: { instances },
    pokedex: {
      unlockedSpeciesIds,
      encounteredSpeciesIds,
      normalPokedexCompleted,
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
