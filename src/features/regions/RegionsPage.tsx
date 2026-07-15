import { useState } from "react";
import { Navigate } from "react-router-dom";
import { regions, isRegionUnlocked } from "@/content/regions";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";

const initialRegionId = regions[0]?.regionId ?? "";

export default function RegionsPage() {
  const userId = useAuthStore((s) => s.userId);
  const authLoading = useAuthStore((s) => s.loading);
  const loaded = useGameStore((s) => s.loaded);
  const starterChosen = useGameStore((s) => s.trainer.starterChosen);
  const unlockedSpeciesIds = useGameStore((s) => s.pokedex.unlockedSpeciesIds);
  const [selectedRegionId, setSelectedRegionId] = useState(initialRegionId);

  if (authLoading || !loaded) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }
  if (!userId) return <Navigate to="/" replace />;
  if (!starterChosen) return <Navigate to="/starter" replace />;

  const unlockedPokedexCount = unlockedSpeciesIds.length;
  const selectedRegion = regions.find((region) => region.regionId === selectedRegionId);

  return (
    <div className="min-h-screen bg-[#f4f0df] px-5 py-7 text-gray-950">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="overflow-hidden rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex max-w-2xl flex-col gap-3">
              <span className="w-fit rounded-full border border-amber-300 bg-white/70 px-3 py-1 text-xs font-bold text-amber-700">
                탐험 지도
              </span>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">어디로 탐색할까요?</h1>
              <p className="text-sm leading-6 text-gray-600">
                도감에 등록한 포켓몬이 늘어날수록 새로운 지역이 열려요. 지금은 지역을 고르고, 다음
                단계에서 탐색과 포획을 연결할 거예요.
              </p>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-white/70 p-4 text-sm font-semibold text-gray-700">
              <p className="text-xs text-gray-500">현재 도감</p>
              <p className="text-2xl font-black tabular-nums text-gray-950">
                {unlockedPokedexCount}마리
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="지역 목록">
          {regions.map((region) => {
            const unlocked = isRegionUnlocked(region, unlockedPokedexCount);
            const selected = selectedRegionId === region.regionId;
            const remainingCount = Math.max(
              region.unlockRequiredPokedexCount - unlockedPokedexCount,
              0,
            );

            return (
              <article
                key={region.regionId}
                className={`flex min-h-72 flex-col justify-between rounded-[2rem] border bg-gradient-to-br p-5 shadow-sm transition-transform ${region.accentClassName} ${
                  selected ? "scale-[1.02] ring-2 ring-gray-950/70" : ""
                } ${unlocked ? "" : "opacity-60 grayscale"}`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                        {region.terrainLabel}
                      </p>
                      <h2 className="mt-1 text-2xl font-black">{region.nameKo}</h2>
                    </div>
                    <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-gray-700">
                      조우 {region.encounterRatePercent}%
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-gray-700">{region.description}</p>

                  <div className="rounded-2xl bg-white/65 p-3 text-sm text-gray-700">
                    <p className="text-xs font-bold text-gray-500">예상 서식지</p>
                    <p className="mt-1 font-semibold">{region.habitatSummary}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRegionId(region.regionId)}
                  disabled={!unlocked}
                  aria-pressed={selected}
                  className="mt-5 min-h-11 rounded-2xl bg-gray-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-white/80 disabled:text-gray-500"
                >
                  {unlocked ? "지역 선택" : `${remainingCount}마리 더 등록하면 해금`}
                </button>
              </article>
            );
          })}
        </section>

        {selectedRegion && (
          <section className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500">선택한 지역</p>
                <h2 className="mt-1 text-2xl font-black">{selectedRegion.nameKo}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  다음 작업에서 이 지역의 `탐색하기` 버튼에 조우 판정과 문제 풀이 진입을 연결하면
                  돼요.
                </p>
              </div>
              <button
                type="button"
                disabled
                className="min-h-11 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-400"
              >
                탐색하기 준비 중
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
