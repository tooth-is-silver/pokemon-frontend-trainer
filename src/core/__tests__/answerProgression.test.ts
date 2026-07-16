import { describe, expect, it } from "vitest";
import { getAllSpecies } from "@/content/pokemon";
import { resolveAnswerProgression } from "@/core/answerProgression";
import type {
  PokemonInstance,
  ProcessAnswerResult,
  ProgressionState,
  SessionState,
} from "@/core/types";

const activeInstance: PokemonInstance = {
  instanceId: "active-instance",
  speciesId: "charizard",
  currentStage: 3,
  exp: 95,
  totalCorrectCount: 20,
  graduated: false,
  evolutionPending: false,
};

const progression: ProgressionState = {
  streakCorrectCount: 2,
  pendingEvolutionInstanceId: null,
  pendingGraduationInstanceId: null,
  unlockedLegendaryStage: "none",
  isEnding: false,
};

const session: SessionState = {
  currentQuestionId: "question-1",
  solvedQuestionIds: ["solved-question"],
  lastAnswerCorrect: null,
};

function result(overrides: Partial<ProcessAnswerResult> = {}): ProcessAnswerResult {
  return {
    correct: true,
    exp: 100,
    streak: 3,
    berry_given: null,
    evolution_pending: false,
    ...overrides,
  };
}

describe("resolveAnswerProgression", () => {
  it("첫 정답 보상과 졸업 대기 상태를 함께 반영한다", () => {
    const nextState = resolveAnswerProgression({
      activeInstanceId: activeInstance.instanceId,
      instances: [activeInstance],
      progression,
      session,
      questionId: "question-1",
      isCorrect: true,
      isFirstSolve: true,
      result: result(),
      allSpecies: getAllSpecies(),
    });

    expect(nextState.party.instances[0]).toMatchObject({
      exp: 100,
      totalCorrectCount: 21,
    });
    expect(nextState.progression).toMatchObject({
      streakCorrectCount: 3,
      pendingGraduationInstanceId: activeInstance.instanceId,
    });
    expect(nextState.session).toMatchObject({
      lastAnswerCorrect: true,
      solvedQuestionIds: ["solved-question", "question-1"],
    });
  });

  it("오답이면 정답 수와 해결 문제 목록을 변경하지 않는다", () => {
    const nextState = resolveAnswerProgression({
      activeInstanceId: activeInstance.instanceId,
      instances: [activeInstance],
      progression,
      session,
      questionId: "question-1",
      isCorrect: false,
      isFirstSolve: false,
      result: result({ correct: false, exp: 95, streak: 0 }),
      allSpecies: getAllSpecies(),
    });

    expect(nextState.party.instances[0]?.totalCorrectCount).toBe(20);
    expect(nextState.progression.pendingGraduationInstanceId).toBeNull();
    expect(nextState.session.lastAnswerCorrect).toBe(false);
    expect(nextState.session.solvedQuestionIds).toEqual(["solved-question"]);
  });

  it("진화 대기 결과는 활성 인스턴스에 연결한다", () => {
    const evolvingInstance = {
      ...activeInstance,
      speciesId: "charmander",
      currentStage: 1,
      exp: 45,
    };

    const nextState = resolveAnswerProgression({
      activeInstanceId: evolvingInstance.instanceId,
      instances: [evolvingInstance],
      progression,
      session,
      questionId: "question-1",
      isCorrect: true,
      isFirstSolve: false,
      result: result({ exp: 50, evolution_pending: true }),
      allSpecies: getAllSpecies(),
    });

    expect(nextState.party.instances[0]?.evolutionPending).toBe(true);
    expect(nextState.progression.pendingEvolutionInstanceId).toBe(evolvingInstance.instanceId);
    expect(nextState.session.solvedQuestionIds).toEqual(["solved-question"]);
  });
});
