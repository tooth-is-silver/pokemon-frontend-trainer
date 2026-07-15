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
    positionClassName: "left-[43%] top-[62%]",
    markerClassName: "bg-lime-300 text-lime-950",
    shortLabel: "평원",
  },
  "misty-shore": {
    positionClassName: "left-[74%] top-[65%]",
    markerClassName: "bg-cyan-300 text-cyan-950",
    shortLabel: "해안",
  },
  "ashen-mountain": {
    positionClassName: "left-[50%] top-[36%]",
    markerClassName: "bg-orange-300 text-orange-950",
    shortLabel: "바위산",
  },
  "ghost-town": {
    positionClassName: "left-[24%] top-[52%]",
    markerClassName: "bg-violet-300 text-violet-950",
    shortLabel: "마을",
  },
  "sky-garden": {
    positionClassName: "left-[73%] top-[24%]",
    markerClassName: "bg-sky-200 text-sky-950",
    shortLabel: "하늘",
  },
  "neon-city": {
    positionClassName: "left-[18%] top-[29%]",
    markerClassName: "bg-yellow-300 text-yellow-950",
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
    <div className="min-h-screen bg-[#d7f4f0] px-4 py-6 text-gray-950 sm:px-6">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex max-w-2xl flex-col gap-3">
              <span className="w-fit rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-xs font-bold text-teal-700">
                탐험 지도
              </span>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">어디로 탐색할까요?</h1>
              <p className="text-sm leading-6 text-gray-600">
                섬 지도를 눌러 탐험할 지역을 골라요. 도감에 등록한 포켓몬이 늘어날수록 새로운 지역이
                열리고, 다음 단계에서 탐색과 포획을 연결할 거예요.
              </p>
            </div>
            <div className="rounded-3xl border border-teal-100 bg-white/80 p-4 text-sm font-semibold text-gray-700">
              <p className="text-xs text-gray-500">현재 도감</p>
              <p className="text-2xl font-black tabular-nums text-gray-950">
                {unlockedPokedexCount}마리
              </p>
            </div>
          </div>
        </header>

        <section
          className="relative aspect-[1/1.05] min-h-[540px] overflow-hidden rounded-[2.5rem] border-[10px] border-white bg-[#25cfe3] shadow-2xl sm:aspect-[4/3] sm:min-h-[620px]"
          aria-label="포켓몬 탐험 지역 지도"
        >
          <div className="absolute inset-x-0 top-0 h-[32%] bg-gradient-to-b from-[#06283a] via-[#075b74] to-[#25cfe3]" />
          <div className="absolute left-[7%] top-[7%] h-14 w-14 rounded-full bg-stone-300 shadow-inner">
            <span className="absolute left-3 top-4 h-3 w-3 rounded-full bg-stone-400" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-stone-400" />
            <span className="absolute bottom-3 left-6 h-2.5 w-2.5 rounded-full bg-stone-400" />
          </div>
          <div className="absolute left-[30%] top-[8%] h-10 w-10 rounded-full bg-yellow-300 shadow-[0_0_18px_rgba(253,224,71,0.55)]" />
          <div className="absolute right-[14%] top-[9%] h-11 w-11 rounded-full bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.5)]" />
          <div className="absolute left-[58%] top-[8%] flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-100/80 bg-emerald-300 shadow-lg">
            <div className="h-9 w-9 rounded-full border-4 border-white bg-lime-400" />
          </div>
          <div className="absolute left-[4%] top-[5%] text-2xl font-black text-white">✦</div>
          <div className="absolute right-[7%] top-[17%] text-3xl font-black text-white">✦</div>
          <div className="absolute left-[74%] top-[4%] text-xl font-black text-white">✦</div>

          <svg
            viewBox="0 0 1000 760"
            className="absolute inset-x-0 bottom-0 h-[88%] w-full"
            aria-hidden="true"
          >
            <path
              d="M93 316c61-85 155-74 211-112 84-57 196-87 292-24 63 41 85 101 162 99 94-2 170 57 159 144-12 97-119 111-137 184-24 96-122 116-211 80-81-32-117 16-194 13-88-3-135-61-184-65-73-6-129-42-125-106 3-50 55-70 48-114-5-35-47-48-21-99Z"
              fill="#ffffff"
            />
            <path
              d="M125 323c52-72 137-61 189-97 78-54 179-80 267-22 60 39 79 97 151 94 86-3 153 51 143 127-10 81-105 98-124 165-23 81-108 99-188 66-74-30-105 14-175 11-79-3-122-54-169-59-63-6-111-36-107-88 3-44 51-61 43-103-6-31-51-44-30-94Z"
              fill="#7edb3f"
            />
            <path
              d="M161 404c74 16 126 12 165-12 30-19 61-25 102-19 69 11 100 58 162 51 50-6 82-43 150-31 45 8 77 33 107 66-24 50-83 69-96 131-23 81-108 99-188 66-74-30-105 14-175 11-79-3-122-54-169-59-63-6-111-36-107-88 2-35 34-53 49-80Z"
              fill="#9bed45"
            />
            <path
              d="M384 680c32-47 62-87 96-119 45-44 95-73 157-96"
              fill="none"
              stroke="#f7d66d"
              strokeLinecap="round"
              strokeWidth="35"
            />
            <path
              d="M166 560c69-16 110-53 128-111 16-51 53-74 106-78"
              fill="none"
              stroke="#42c7ff"
              strokeLinecap="round"
              strokeWidth="26"
            />
            <path
              d="M166 560c69-16 110-53 128-111 16-51 53-74 106-78"
              fill="none"
              stroke="#bff4ff"
              strokeLinecap="round"
              strokeWidth="12"
            />
            <ellipse cx="375" cy="610" fill="#facc15" rx="34" ry="13" />
            <ellipse cx="618" cy="502" fill="#facc15" rx="31" ry="12" />
            <ellipse cx="223" cy="569" fill="#facc15" rx="29" ry="11" />
            <ellipse cx="801" cy="386" fill="#d1d5db" rx="27" ry="11" />
            <ellipse cx="667" cy="267" fill="#d1d5db" rx="28" ry="11" />
            <ellipse cx="256" cy="288" fill="#d1d5db" rx="28" ry="11" />

            <g transform="translate(455 200)">
              <path d="M90 14 166 166H20Z" fill="#7c2d12" />
              <path d="M90 14 123 166H55Z" fill="#b45309" />
              <path d="M77 54c8 18 28 15 35 0l19 38H58Z" fill="#fb923c" />
              <path d="M70 40c9 11 31 12 42 0 0 19-12 35-22 35S70 59 70 40Z" fill="#fef08a" />
              <ellipse cx="92" cy="168" fill="#5b3418" rx="91" ry="21" />
            </g>

            <g transform="translate(145 360)">
              <path d="M0 116 59 10l42 106Z" fill="#64748b" />
              <path d="M63 116 117 30l50 86Z" fill="#475569" />
              <rect x="62" y="84" width="78" height="64" rx="10" fill="#334155" />
              <path d="M80 148c6-28 41-28 47 0Z" fill="#111827" />
            </g>

            <g transform="translate(145 180)">
              <rect x="41" y="40" width="32" height="123" rx="10" fill="#f8fafc" />
              <rect x="41" y="62" width="32" height="22" fill="#ef4444" />
              <rect x="35" y="23" width="45" height="28" rx="9" fill="#f8fafc" />
              <rect x="42" y="14" width="31" height="14" rx="6" fill="#ef4444" />
              <path d="M25 164h66l16 24H9Z" fill="#16a34a" />
            </g>

            <g transform="translate(655 176)">
              <path d="M0 93c50-59 133-58 190 0Z" fill="#f8fafc" />
              <rect x="63" y="45" width="68" height="57" rx="6" fill="#e0f2fe" />
              <path d="M63 45c12-50 56-50 68 0Z" fill="#bae6fd" />
              <path d="M89 102c0-34 30-34 30 0Z" fill="#38bdf8" />
            </g>

            <g transform="translate(362 498)">
              <path d="M0 76c25-50 93-50 119 0Z" fill="#a16207" />
              <rect x="15" y="62" width="89" height="62" rx="10" fill="#ca8a04" />
              <path d="M37 124c0-43 45-43 45 0Z" fill="#422006" />
              <rect x="23" y="42" width="72" height="16" rx="8" fill="#facc15" />
            </g>

            <g transform="translate(760 495)">
              <path d="M3 73c51 19 108 6 151-39-33 76-96 111-151 39Z" fill="#f8fafc" />
              <path d="M77 2v95" stroke="#0f172a" strokeLinecap="round" strokeWidth="8" />
              <path d="M77 9 136 42H77Z" fill="#f8fafc" />
              <path d="M77 50 20 78h57Z" fill="#e0f2fe" />
            </g>

            <g transform="translate(402 370)" fill="#15803d">
              <circle cx="23" cy="35" r="26" />
              <circle cx="70" cy="22" r="28" />
              <circle cx="112" cy="42" r="24" />
              <rect x="22" y="47" width="18" height="54" rx="8" fill="#7c2d12" />
              <rect x="69" y="42" width="18" height="56" rx="8" fill="#7c2d12" />
              <rect x="110" y="57" width="16" height="42" rx="8" fill="#7c2d12" />
            </g>
          </svg>

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
                className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border-4 border-white px-3 py-2 text-xs font-black shadow-xl transition-transform hover:scale-110 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-gray-950 disabled:cursor-not-allowed disabled:opacity-55 ${mapPoint.positionClassName} ${mapPoint.markerClassName} ${
                  selected ? "scale-110 ring-4 ring-gray-950/70" : ""
                } ${unlocked ? "" : "grayscale"}`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-sm shadow-inner">
                  {unlocked ? "●" : "×"}
                </span>
                <span>{mapPoint.shortLabel}</span>
              </button>
            );
          })}
        </section>

        {selectedRegion && (
          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500">
                  {selectedRegion.terrainLabel} · 조우 {selectedRegion.encounterRatePercent}%
                </p>
                <h2 className="mt-1 text-2xl font-black">{selectedRegion.nameKo}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{selectedRegion.description}</p>
                <p className="mt-2 text-sm font-semibold text-gray-700">
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
                className="min-h-11 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-bold text-white opacity-40"
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
