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
  const selectedRegionUnlocked = selectedRegion
    ? isRegionUnlocked(selectedRegion, unlockedPokedexCount)
    : false;

  return (
    <div className="min-h-screen bg-[#d7f4f0] px-3 py-4 text-gray-950 sm:px-5">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-3">
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
          <picture>
            <source media="(max-width: 639px)" srcSet="/maps/region-map-mobile.png" />
            <img
              src="/maps/region-map-desktop.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover [image-rendering:pixelated]"
              draggable={false}
            />
          </picture>
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
                className={`absolute z-10 flex min-h-12 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border-4 border-white px-3 py-2 text-xs font-black shadow-xl transition-transform hover:scale-110 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-gray-950 disabled:cursor-not-allowed disabled:opacity-60 ${mapPoint.positionClassName} ${mapPoint.markerClassName} ${
                  selected ? "scale-110 ring-4 ring-gray-950/70" : ""
                } ${unlocked ? "" : "grayscale"}`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-sm shadow-inner">
                  {unlocked ? "●" : "×"}
                </span>
                <span>{mapPoint.shortLabel}</span>
              </button>
            );
          })}
        </section>

        {selectedRegion && (
          <section className="border-t border-white/70 bg-white/55 px-1 py-3 backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500">
                  {selectedRegion.terrainLabel} · 조우 {selectedRegion.encounterRatePercent}%
                </p>
                <h2 className="mt-0.5 text-xl font-black">{selectedRegion.nameKo}</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">{selectedRegion.description}</p>
                <p className="mt-1 text-sm font-semibold text-gray-700">
                  예상 서식지: {selectedRegion.habitatSummary}
                </p>
                {!selectedRegionUnlocked && (
                  <p className="mt-2 text-sm font-bold text-rose-600">
                    도감 {selectedRegion.unlockRequiredPokedexCount}마리부터 열려요.
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled
                className="min-h-11 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white opacity-40"
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
