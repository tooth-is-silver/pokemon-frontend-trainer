import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { regions, isRegionUnlocked } from "@/content/regions";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";

interface MapPoint {
  positionClassName: string;
  markerClassName: string;
  selectedClassName: string;
  shortLabel: string;
}

type SearchStatus = "idle" | "searching" | "missed";

const initialRegionId = regions[0]?.regionId ?? "";
const SEARCH_RESULT_DELAY_MS = 1400;

const mapPoints: Record<string, MapPoint> = {
  "sprout-field": {
    positionClassName: "left-[50%] top-[47%] sm:left-[48%] sm:top-[48%]",
    markerClassName: "bg-lime-300 text-lime-950",
    selectedClassName: "region-marker-selected-lime",
    shortLabel: "평원",
  },
  "misty-shore": {
    positionClassName: "left-[79%] top-[56%] sm:left-[82%] sm:top-[57%]",
    markerClassName: "bg-cyan-300 text-cyan-950",
    selectedClassName: "region-marker-selected-cyan",
    shortLabel: "해안",
  },
  "ashen-mountain": {
    positionClassName: "left-[65%] top-[23%] sm:left-[69%] sm:top-[21%]",
    markerClassName: "bg-orange-300 text-orange-950",
    selectedClassName: "region-marker-selected-orange",
    shortLabel: "용암",
  },
  "ghost-town": {
    positionClassName: "left-[21%] top-[48%] sm:left-[19%] sm:top-[51%]",
    markerClassName: "bg-violet-300 text-violet-950",
    selectedClassName: "region-marker-selected-violet",
    shortLabel: "폐허",
  },
  "sky-garden": {
    positionClassName: "left-[31%] top-[23%] sm:left-[30%] sm:top-[23%]",
    markerClassName: "bg-sky-200 text-sky-950",
    selectedClassName: "region-marker-selected-sky",
    shortLabel: "궁전",
  },
  "neon-city": {
    positionClassName: "left-[47%] top-[78%] sm:left-[47%] sm:top-[76%]",
    markerClassName: "bg-yellow-300 text-yellow-950",
    selectedClassName: "region-marker-selected-yellow",
    shortLabel: "도시",
  },
};

export default function RegionsPage() {
  const userId = useAuthStore((s) => s.userId);
  const authLoading = useAuthStore((s) => s.loading);
  const loaded = useGameStore((s) => s.loaded);
  const starterChosen = useGameStore((s) => s.trainer.starterChosen);
  const unlockedSpeciesIds = useGameStore((s) => s.pokedex.unlockedSpeciesIds);
  const [selectedRegionId, setSelectedRegionId] = useState(initialRegionId);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [searchTarget, setSearchTarget] = useState<string | null>(null);

  const unlockedPokedexCount = unlockedSpeciesIds.length;
  const selectedRegion = regions.find((region) => region.regionId === selectedRegionId);
  const selectedRegionUnlocked = selectedRegion
    ? isRegionUnlocked(selectedRegion, unlockedPokedexCount)
    : false;
  const isSearchOverlayOpen = searchStatus !== "idle";
  const isSearching = searchStatus === "searching";
  const isSearchMissed = searchStatus === "missed";

  useEffect(() => {
    if (!isSearching) return;

    const timeoutId = window.setTimeout(() => {
      setSearchStatus("missed");
    }, SEARCH_RESULT_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isSearching]);

  if (authLoading || !loaded) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }
  if (!userId) return <Navigate to="/" replace />;
  if (!starterChosen) return <Navigate to="/starter" replace />;

  const handleSelectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    setSearchStatus("idle");
    setSearchTarget(null);
  };

  const handleStartSearch = () => {
    if (!selectedRegion || !selectedRegionUnlocked) return;

    const nextTarget =
      selectedRegion.searchTargets[Math.floor(Math.random() * selectedRegion.searchTargets.length)];

    setSearchTarget(nextTarget);
    setSearchStatus("searching");
  };

  const handleCloseSearch = () => {
    setSearchStatus("idle");
    setSearchTarget(null);
  };

  return (
    <div className="min-h-screen bg-white px-3 py-4 text-gray-950 sm:px-5">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-2">
        <header className="flex justify-center">
          <h1 className="text-center text-xl font-black tracking-[0.45em] text-gray-950 sm:text-2xl">
            탐 험 지 도
          </h1>
        </header>

        <section
          className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-[#015bb9] shadow-lg sm:aspect-[4/3] sm:bg-[#0477c7]"
          aria-label="포켓몬 탐험 지역 지도"
        >
          <div className="absolute inset-0">
            <img
              src="/maps/region-map-mobile.png"
              alt=""
              className="absolute inset-x-0 top-0 block h-[78%] w-full object-cover object-top [image-rendering:pixelated] sm:hidden"
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
                  onClick={() => handleSelectRegion(region.regionId)}
                  aria-pressed={selected}
                  aria-disabled={!unlocked}
                  aria-label={
                    unlocked
                      ? `${region.nameKo} 지역 선택`
                      : `${region.nameKo} 지역 잠김, 도감 ${remainingCount}마리 더 필요`
                  }
                  className={`absolute z-10 flex min-h-10 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-xl border-2 border-white/90 px-2.5 py-1.5 text-[11px] font-black shadow-md transition-colors focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-gray-950 ${mapPoint.positionClassName} ${mapPoint.markerClassName} ${
                    selected
                      ? `region-marker-selected ${mapPoint.selectedClassName} ring-2 ring-white/90`
                      : ""
                  } ${unlocked ? "" : "opacity-65 grayscale"}`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/85 text-xs shadow-inner">
                    {unlocked ? "●" : "×"}
                  </span>
                  <span>{mapPoint.shortLabel}</span>
                </button>
              );
            })}

            {selectedRegion && (
              <div className="absolute inset-x-3 bottom-3 z-10 flex flex-col gap-2 bg-gray-950/75 p-3 text-white shadow-lg backdrop-blur sm:inset-x-auto sm:left-3 sm:right-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  {selectedRegionUnlocked ? (
                    <>
                      <p className="text-[11px] font-bold text-white/70">
                        {selectedRegion.terrainLabel} · 조우 {selectedRegion.encounterRatePercent}%
                      </p>
                      <h2 className="truncate text-lg font-black">{selectedRegion.nameKo}</h2>
                      <p className="sr-only">{selectedRegion.description}</p>
                    </>
                  ) : (
                    <>
                      <h2 className="truncate text-lg font-black">{selectedRegion.nameKo}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-bold">
                        <span
                          className="relative inline-flex h-6 w-6 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm"
                          aria-hidden="true"
                        >
                          <span className="absolute inset-x-0 top-0 h-1/2 bg-red-500" />
                          <span className="absolute left-0 top-1/2 h-[2px] w-full bg-gray-950" />
                          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gray-950 bg-white" />
                        </span>
                        <span className="tabular-nums">{unlockedPokedexCount}마리</span>
                        <span className="text-white/70">
                          도감 {selectedRegion.unlockRequiredPokedexCount}마리 필요
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleStartSearch}
                  disabled={!selectedRegionUnlocked || isSearching}
                  className="min-h-10 rounded-lg bg-white px-4 py-2 text-sm font-black text-gray-950 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isSearching ? "찾는 중" : "탐색하기"}
                </button>
              </div>
            )}
          </div>

          {selectedRegion && isSearchOverlayOpen && (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950/45 p-5 text-white backdrop-blur-[2px]"
              role="status"
              aria-live="polite"
            >
              <div className="flex h-80 w-full max-w-xs flex-col items-center justify-between gap-4 bg-gray-950/80 p-5 text-center shadow-2xl">
                {isSearching && (
                  <>
                    <div>
                      <p className="text-xs font-bold text-white/60">{selectedRegion.nameKo}</p>
                      <img
                        src="/effects/search-magnifier.gif"
                        alt=""
                        className="mx-auto mt-2 h-20 w-20 object-contain [image-rendering:pixelated]"
                        aria-hidden="true"
                        draggable={false}
                      />
                      <h2 className="mt-1 text-2xl font-black tracking-tight">
                        <span>찾는 중</span>
                        <span className="sr-only">...</span>
                        <span className="ml-0.5 inline-flex gap-0.5" aria-hidden="true">
                          <span
                            className="inline-block motion-safe:animate-[search-dot-wave_900ms_ease-in-out_infinite]"
                            style={{ animationDelay: "0ms" }}
                          >
                            .
                          </span>
                          <span
                            className="inline-block motion-safe:animate-[search-dot-wave_900ms_ease-in-out_infinite]"
                            style={{ animationDelay: "160ms" }}
                          >
                            .
                          </span>
                          <span
                            className="inline-block motion-safe:animate-[search-dot-wave_900ms_ease-in-out_infinite]"
                            style={{ animationDelay: "320ms" }}
                          >
                            .
                          </span>
                        </span>
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-white/75">
                        {searchTarget ?? "주변을"} 살펴보는 중이에요.
                        <br />
                        잠깐만 기다려봐요.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseSearch}
                      className="min-h-10 rounded-lg border border-white/30 px-4 py-2 text-sm font-bold text-white/90 transition-colors hover:bg-white/10"
                    >
                      그만 찾기
                    </button>
                  </>
                )}

                {isSearchMissed && (
                  <>
                    <div>
                      <p className="text-xs font-bold text-white/60">{selectedRegion.nameKo}</p>
                      <div className="mx-auto mt-2 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-white/45 bg-white/10 text-4xl">
                        ?
                      </div>
                      <h2 className="mt-3 text-2xl font-black tracking-tight">놓쳤어요</h2>
                      <p className="mt-2 text-sm leading-6 text-white/75">
                        {searchTarget ?? "주변을"} 살펴봤지만
                        <br />
                        흔적을 찾지 못했어요.
                      </p>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleStartSearch}
                        className="min-h-10 rounded-lg bg-white px-3 py-2 text-sm font-black text-gray-950"
                      >
                        다시 탐색
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseSearch}
                        className="min-h-10 rounded-lg border border-white/30 px-3 py-2 text-sm font-bold text-white/90 transition-colors hover:bg-white/10"
                      >
                        지도 보기
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
