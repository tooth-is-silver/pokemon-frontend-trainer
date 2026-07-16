import type {
  PartyState,
  PokedexState,
  PokemonInstance,
  ProgressionState,
  SessionState,
  TrainerState,
} from "@/core/types";

interface ResolveStarterStateInput {
  speciesId: string;
  instanceId: string;
}

interface StarterState {
  trainer: TrainerState;
  party: PartyState;
  pokedex: PokedexState;
}

interface ResolveEvolutionStateInput {
  instances: PokemonInstance[];
  pokedex: PokedexState;
  progression: ProgressionState;
  instanceId: string;
  nextSpeciesId: string;
}

interface EvolutionState {
  party: PartyState;
  pokedex: PokedexState;
  progression: ProgressionState;
}

interface ResolveNextPokemonStateInput {
  trainer: TrainerState;
  instances: PokemonInstance[];
  pokedex: PokedexState;
  progression: ProgressionState;
  session: SessionState;
  speciesId: string;
  newInstanceId: string;
  unlockedLegendaryStage: ProgressionState["unlockedLegendaryStage"];
}

interface NextPokemonState {
  trainer: TrainerState;
  party: PartyState;
  pokedex: PokedexState;
  progression: ProgressionState;
  session: SessionState;
}

interface ResolveEndingStateInput {
  instances: PokemonInstance[];
  progression: ProgressionState;
  instanceId: string;
}

interface EndingState {
  party: PartyState;
  progression: ProgressionState;
}

export function resolveStarterState({
  speciesId,
  instanceId,
}: ResolveStarterStateInput): StarterState {
  return {
    trainer: {
      starterChosen: true,
      activePokemonInstanceId: instanceId,
    },
    party: {
      instances: [
        {
          instanceId,
          speciesId,
          currentStage: 1,
          exp: 0,
          totalCorrectCount: 0,
          graduated: false,
          evolutionPending: false,
        },
      ],
    },
    pokedex: {
      unlockedSpeciesIds: [speciesId],
      normalPokedexCompleted: false,
    },
  };
}

export function resolveEvolutionState({
  instances,
  pokedex,
  progression,
  instanceId,
  nextSpeciesId,
}: ResolveEvolutionStateInput): EvolutionState {
  return {
    party: {
      instances: instances.map((instance) =>
        instance.instanceId === instanceId
          ? {
              ...instance,
              speciesId: nextSpeciesId,
              currentStage: instance.currentStage + 1,
              evolutionPending: false,
            }
          : instance,
      ),
    },
    pokedex: {
      ...pokedex,
      unlockedSpeciesIds: [...new Set([...pokedex.unlockedSpeciesIds, nextSpeciesId])],
    },
    progression: {
      ...progression,
      pendingEvolutionInstanceId: null,
    },
  };
}

export function resolveNextPokemonState({
  trainer,
  instances,
  pokedex,
  progression,
  session,
  speciesId,
  newInstanceId,
  unlockedLegendaryStage,
}: ResolveNextPokemonStateInput): NextPokemonState {
  const newInstance: PokemonInstance = {
    instanceId: newInstanceId,
    speciesId,
    currentStage: 1,
    exp: 0,
    totalCorrectCount: 0,
    graduated: false,
    evolutionPending: false,
  };

  return {
    trainer: {
      ...trainer,
      activePokemonInstanceId: newInstanceId,
    },
    party: {
      instances: [
        ...instances.map((instance) =>
          instance.instanceId === trainer.activePokemonInstanceId
            ? { ...instance, graduated: true, evolutionPending: false }
            : instance,
        ),
        newInstance,
      ],
    },
    pokedex: {
      ...pokedex,
      unlockedSpeciesIds: [...new Set([...pokedex.unlockedSpeciesIds, speciesId])],
    },
    progression: {
      ...progression,
      streakCorrectCount: 0,
      pendingEvolutionInstanceId: null,
      pendingGraduationInstanceId: null,
      unlockedLegendaryStage,
    },
    session: {
      ...session,
      currentQuestionId: null,
      lastAnswerCorrect: null,
    },
  };
}

export function resolveEndingState({
  instances,
  progression,
  instanceId,
}: ResolveEndingStateInput): EndingState {
  return {
    party: {
      instances: instances.map((instance) =>
        instance.instanceId === instanceId
          ? { ...instance, graduated: true, evolutionPending: false }
          : instance,
      ),
    },
    progression: {
      ...progression,
      isEnding: true,
      pendingGraduationInstanceId: null,
      pendingEvolutionInstanceId: null,
    },
  };
}
