import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import { starters } from "@/content/pokemon/starters";
import { PartyMemberCard } from "@/components/pokemon/PartyMemberCard";

export default function MyPokemonPage() {
  const userId = useAuthStore((s) => s.userId);
  const authLoading = useAuthStore((s) => s.loading);
  const loaded = useGameStore((s) => s.loaded);
  const starterChosen = useGameStore((s) => s.trainer.starterChosen);
  const activeInstanceId = useGameStore((s) => s.trainer.activePokemonInstanceId);
  const instances = useGameStore((s) => s.party.instances);
  const setActivePokemon = useGameStore((s) => s.setActivePokemon);

  const [switchingId, setSwitchingId] = useState<string | null>(null);

  if (authLoading || !loaded) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }
  if (!userId) return <Navigate to="/" replace />;
  if (!starterChosen) return <Navigate to="/starter" replace />;

  const handleSetActive = async (instanceId: string) => {
    if (switchingId || instanceId === activeInstanceId) return;
    setSwitchingId(instanceId);
    try {
      await setActivePokemon(instanceId);
    } catch (error) {
      console.error("활성 포켓몬 전환 실패:", error);
    } finally {
      setSwitchingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center gap-6 p-6">
      <header className="w-full max-w-3xl flex flex-col gap-1">
        <h1 className="text-2xl font-bold">내 포켓몬</h1>
        <p className="text-sm text-gray-500">
          파티 {instances.length}마리 · 학습할 포켓몬을 선택하세요
        </p>
      </header>

      <main className="w-full max-w-3xl grid gap-4 sm:grid-cols-2">
        {instances.length === 0 && (
          <div className="col-span-full p-6 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
            아직 파티가 비어있어요.
          </div>
        )}
        {instances.map((instance) => {
          const species = starters.find((s) => s.speciesId === instance.speciesId) ?? null;
          return (
            <PartyMemberCard
              key={instance.instanceId}
              instance={instance}
              species={species}
              isActive={instance.instanceId === activeInstanceId}
              switching={switchingId === instance.instanceId}
              onSetActive={() => handleSetActive(instance.instanceId)}
            />
          );
        })}
      </main>
    </div>
  );
}
