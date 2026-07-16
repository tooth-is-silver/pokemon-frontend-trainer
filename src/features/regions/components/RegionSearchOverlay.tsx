import { getSpriteUrl } from "@/content/pokemon/types";
import type { PokemonSpecies } from "@/content/pokemon/types";
import type { Region } from "@/content/regions";
import { getKoreanSubjectParticle, type RegionSearchStatus } from "@/core/regionEncounter";

interface Props {
  selectedRegion: Region;
  searchStatus: RegionSearchStatus;
  searchTarget: string | null;
  encounteredSpecies: PokemonSpecies | null;
  onStartSearch: () => void;
  onCloseSearch: () => void;
}

export function RegionSearchOverlay({
  selectedRegion,
  searchStatus,
  searchTarget,
  encounteredSpecies,
  onStartSearch,
  onCloseSearch,
}: Props) {
  const isSearching = searchStatus === "searching";
  const isSearchMissed = searchStatus === "missed";
  const isSearchEncountered = searchStatus === "encountered";

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950/45 p-5 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
    >
      <div className="flex h-80 w-full max-w-xs flex-col items-center justify-between gap-4 bg-white p-5 text-center text-gray-950 shadow-2xl">
        {isSearching && (
          <>
            <div>
              <p className="text-xs font-bold text-gray-500">{selectedRegion.nameKo}</p>
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
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {searchTarget ?? "주변을"} 살펴보는 중이에요.
                <br />
                잠깐만 기다려봐요.
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseSearch}
              className="min-h-10 rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
            >
              그만 찾기
            </button>
          </>
        )}

        {isSearchMissed && (
          <>
            <div>
              <p className="text-xs font-bold text-gray-500">{selectedRegion.nameKo}</p>
              <div className="mx-auto mt-2 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-100 text-4xl text-gray-500">
                ?
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight">포켓몬을 못 찾았어요</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {searchTarget ?? "주변을"} 살펴봤지만
                <br />
                포켓몬은 보이지 않았어요.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onStartSearch}
                className="min-h-10 rounded-lg bg-gray-950 px-3 py-2 text-sm font-black text-white"
              >
                다시 탐색
              </button>
              <button
                type="button"
                onClick={onCloseSearch}
                className="min-h-10 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
              >
                지도 보기
              </button>
            </div>
          </>
        )}

        {isSearchEncountered && (
          <>
            <div>
              <p className="text-xs font-bold text-gray-500">{selectedRegion.nameKo}</p>
              {encounteredSpecies ? (
                <div className="relative mx-auto mt-2 h-20 w-20 overflow-visible">
                  <img
                    src={getSpriteUrl(encounteredSpecies.dexNumber)}
                    alt=""
                    aria-hidden="true"
                    className="encounter-shadow-sprite absolute inset-0 h-full w-full object-contain [image-rendering:pixelated]"
                    draggable={false}
                  />
                  <img
                    src={getSpriteUrl(encounteredSpecies.dexNumber)}
                    alt={encounteredSpecies.nameKo}
                    className="encounter-real-sprite absolute inset-0 h-full w-full object-contain [image-rendering:pixelated]"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="mx-auto mt-2 flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-200 bg-yellow-300 text-4xl text-gray-950 shadow-[0_0_24px_rgba(250,204,21,0.65)]">
                  !
                </div>
              )}
              <h2 className="encounter-reveal mt-3 text-xl font-black leading-7 tracking-tight">
                {encounteredSpecies
                  ? `앗! 야생의 ${encounteredSpecies.nameKo}${getKoreanSubjectParticle(
                      encounteredSpecies.nameKo,
                    )} 나타났다!`
                  : "앗! 야생 포켓몬이 나타났다!"}
              </h2>
              <p className="encounter-reveal mt-2 text-sm leading-6 text-gray-600">
                문제를 맞히면
                <br />
                몬스터볼을 던질 수 있어요.
              </p>
            </div>
            <div className="encounter-reveal grid w-full grid-cols-2 gap-2">
              <button
                type="button"
                disabled
                className="min-h-10 rounded-lg bg-gray-950 px-3 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-55"
              >
                문제 풀기 준비 중
              </button>
              <button
                type="button"
                onClick={onCloseSearch}
                className="min-h-10 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
              >
                지도 보기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
