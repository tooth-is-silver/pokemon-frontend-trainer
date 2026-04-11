import { useGameStore } from "./useGameStore";

// 현재 활성 포켓몬 인스턴스
export const useActivePokemon = () =>
  useGameStore((state) => {
    const id = state.trainer.activePokemonInstanceId;
    return state.party.instances.find((i) => i.instanceId === id) ?? null;
  });

// 스타터 선택 여부
export const useStarterChosen = () => useGameStore((state) => state.trainer.starterChosen);

// 현재 스탯
export const useActiveStats = () =>
  useGameStore((state) => {
    const id = state.trainer.activePokemonInstanceId;
    return state.party.instances.find((i) => i.instanceId === id)?.stats ?? null;
  });

// 연속 정답 수
export const useStreak = () => useGameStore((state) => state.progression.streakCorrectCount);

// 진화 대기 중인 인스턴스 ID (string | null)
export const usePendingEvolutionInstanceId = () =>
  useGameStore((state) => state.progression.pendingEvolutionInstanceId);

// 진화 대기 여부 (boolean)
export const useIsEvolutionPending = () =>
  useGameStore((state) => state.progression.pendingEvolutionInstanceId !== null);

// 풀이 완료 문제 ID 목록
export const useSolvedQuestionIds = () => useGameStore((state) => state.session.solvedQuestionIds);

// 데이터 로드 완료 여부
export const useGameLoaded = () => useGameStore((state) => state.loaded);
