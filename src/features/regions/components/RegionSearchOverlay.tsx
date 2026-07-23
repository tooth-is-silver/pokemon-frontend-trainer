import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { getSpriteUrl } from "@/content/pokemon/types";
import type { PokemonSpecies } from "@/content/pokemon/types";
import type { Region } from "@/content/regions";
import { getKoreanSubjectParticle, type RegionSearchStatus } from "@/core/regionEncounter";

interface Props {
  selectedRegion: Region;
  searchStatus: RegionSearchStatus;
  encounterRecordStatus: EncounterRecordStatus;
  searchTarget: string | null;
  encounteredSpecies: PokemonSpecies | null;
  onStartSearch: () => void;
  onRetryEncounterRecord: () => void;
  onCloseSearch: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

export type EncounterRecordStatus = "idle" | "saving" | "saved" | "error";

const DIALOG_TITLE: Record<RegionSearchStatus, string> = {
  idle: "포켓몬 탐색",
  searching: "포켓몬 탐색 중",
  missed: "포켓몬 탐색 실패",
  encountered: "야생 포켓몬 발견",
};

export function RegionSearchOverlay({
  selectedRegion,
  searchStatus,
  encounterRecordStatus,
  searchTarget,
  encounteredSpecies,
  onStartSearch,
  onRetryEncounterRecord,
  onCloseSearch,
  returnFocusRef,
}: Props) {
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const isSearching = searchStatus === "searching";
  const isSearchMissed = searchStatus === "missed";
  const isSearchEncountered = searchStatus === "encountered";
  const encounterRecordFailed = encounterRecordStatus === "error";
  const dialogTitle = `${selectedRegion.nameKo}: ${DIALOG_TITLE[searchStatus]}`;

  useEffect(() => {
    primaryActionRef.current?.focus();
  }, [encounterRecordStatus, searchStatus]);

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onCloseSearch();
      }}
    >
      <Dialog.Overlay className="absolute inset-0 z-20 bg-gray-950/45 backdrop-blur-[2px]" />
      <Dialog.Content
        className="absolute inset-0 z-20 flex items-center justify-center p-5 focus:outline-none"
        onPointerDownOutside={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <Dialog.Title className="sr-only">{dialogTitle}</Dialog.Title>
        <Dialog.Description className="sr-only">
          탐색 결과를 확인하거나 지역 지도로 돌아갈 수 있습니다.
        </Dialog.Description>
        <div
          className="flex h-80 w-full max-w-xs flex-col items-center justify-between gap-4 bg-white p-5 text-center text-gray-950 shadow-2xl"
          aria-live="polite"
        >
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
                ref={primaryActionRef}
                type="button"
                onClick={onCloseSearch}
                className="min-h-11 rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
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
                  ref={primaryActionRef}
                  type="button"
                  onClick={onStartSearch}
                  className="min-h-11 rounded-lg bg-gray-950 px-3 py-2 text-sm font-black text-white"
                >
                  다시 탐색
                </button>
                <button
                  type="button"
                  onClick={onCloseSearch}
                  className="min-h-11 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
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
                {encounterRecordFailed && (
                  <p className="mt-1 text-xs font-bold text-red-700" role="alert">
                    도감 기록을 저장하지 못했어요.
                  </p>
                )}
              </div>
              <div className="encounter-reveal grid w-full grid-cols-2 gap-2">
                {encounterRecordFailed ? (
                  <button
                    ref={primaryActionRef}
                    type="button"
                    onClick={onRetryEncounterRecord}
                    className="min-h-11 rounded-lg bg-red-700 px-3 py-2 text-sm font-black text-white"
                  >
                    기록 다시 저장
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="min-h-11 rounded-lg bg-gray-950 px-3 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {encounterRecordStatus === "saving" ? "기록 저장 중" : "문제 풀기 준비 중"}
                  </button>
                )}
                <button
                  ref={encounterRecordFailed ? undefined : primaryActionRef}
                  type="button"
                  onClick={onCloseSearch}
                  className="min-h-11 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
                >
                  지도 보기
                </button>
              </div>
            </>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
