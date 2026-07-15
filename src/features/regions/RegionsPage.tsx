import { useState } from "react";
import { Navigate } from "react-router-dom";
import { regions, isRegionUnlocked } from "@/content/regions";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";

interface MapPoint {
  positionClassName: string;
  markerClassName: string;
  shortLabel: string;
}

const initialRegionId = regions[0]?.regionId ?? "";

const mapPoints: Record<string, MapPoint> = {
  "sprout-field": {
    positionClassName: "left-[50%] top-[47%] sm:left-[48%] sm:top-[48%]",
    markerClassName: "bg-lime-300 text-lime-950",
    shortLabel: "평원",
  },
  "misty-shore": {
    positionClassName: "left-[79%] top-[56%] sm:left-[82%] sm:top-[57%]",
    markerClassName: "bg-cyan-300 text-cyan-950",
    shortLabel: "해안",
  },
  "ashen-mountain": {
    positionClassName: "left-[65%] top-[23%] sm:left-[69%] sm:top-[21%]",
    markerClassName: "bg-orange-300 text-orange-950",
    shortLabel: "용암",
  },
  "ghost-town": {
    positionClassName: "left-[21%] top-[48%] sm:left-[19%] sm:top-[51%]",
    markerClassName: "bg-violet-300 text-violet-950",
    shortLabel: "폐허",
  },
  "sky-garden": {
    positionClassName: "left-[31%] top-[23%] sm:left-[30%] sm:top-[23%]",
    markerClassName: "bg-sky-200 text-sky-950",
    shortLabel: "궁전",
  },
  "neon-city": {
    positionClassName: "left-[47%] top-[78%] sm:left-[47%] sm:top-[76%]",
    markerClassName: "bg-yellow-300 text-yellow-950",
    shortLabel: "현대",
  },
};

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
    <div className="min-h-screen bg-[#d7f4f0] px-3 py-4 text-gray-950 sm:px-5">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-2">
        <header className="flex flex-col gap-2 px-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-teal-700">
              탐험 지도
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              어디로 탐색할까요?
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-600 sm:text-sm">
              섬 지도를 눌러 지역을 골라요. 도감이 늘어날수록 새로운 지역이 열려요.
            </p>
          </div>
          <p className="w-fit rounded-full bg-white/75 px-3 py-1.5 text-xs font-black text-gray-700 shadow-sm">
            현재 도감 <span className="tabular-nums text-gray-950">{unlockedPokedexCount}</span>마리
          </p>
        </header>

        <section
          className="relative aspect-[1161/1355] overflow-hidden rounded-2xl bg-[#0477c7] shadow-lg sm:aspect-[4/3]"
          aria-label="포켓몬 탐험 지역 지도"
        >
          <img
            src="/maps/region-map-mobile.png"
            alt=""
            className="absolute inset-0 block h-full w-full object-cover [image-rendering:pixelated] sm:hidden"
            draggable={false}
            loading="eager"
            decoding="async"
          />
          <img
            src="/maps/region-map-desktop.png"
            alt=""
            className="absolute inset-0 hidden h-full w-full object-cover [image-rendering:pixelated] sm:block"
            draggable={false}
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/10" />

          {regions.map((region) => {
            const unlocked = isRegionUnlocked(region, unlockedPokedexCount);
            const selected = selectedRegionId === region.regionId;
            const mapPoint = mapPoints[region.regionId];
            const remainingCount = Math.max(
              region.unlockRequiredPokedexCount - unlockedPokedexCount,
              0,
            );

            return (
              <button
                key={region.regionId}
                type="button"
                onClick={() => setSelectedRegionId(region.regionId)}
                disabled={!unlocked}
                aria-pressed={selected}
                aria-label={
                  unlocked
                    ? `${region.nameKo} 지역 선택`
                    : `${region.nameKo} 지역 잠김, 도감 ${remainingCount}마리 더 필요`
                }
                className={`absolute z-10 flex min-h-10 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-xl border-2 border-white/90 px-2.5 py-1.5 text-[11px] font-black shadow-md transition-colors focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-gray-950 disabled:cursor-not-allowed disabled:opacity-60 ${mapPoint.positionClassName} ${mapPoint.markerClassName} ${
                  selected ? "ring-2 ring-gray-950/70" : ""
                } ${unlocked ? "" : "grayscale"}`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/85 text-xs shadow-inner">
                  {unlocked ? "●" : "×"}
                </span>
                <span>{mapPoint.shortLabel}</span>
              </button>
            );
          })}

          {selectedRegion && (
            <div className="absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2 bg-gray-950/75 p-3 text-white shadow-lg backdrop-blur sm:inset-x-auto sm:left-3 sm:right-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white/70">
                  {selectedRegion.terrainLabel} · 조우 {selectedRegion.encounterRatePercent}%
                </p>
                <h2 className="truncate text-lg font-black">{selectedRegion.nameKo}</h2>
                <p className="sr-only">{selectedRegion.description}</p>
              </div>
              <button
                type="button"
                disabled
                className="min-h-10 rounded-lg bg-white px-4 py-2 text-sm font-black text-gray-950 opacity-45"
              >
                탐색하기 준비 중
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
