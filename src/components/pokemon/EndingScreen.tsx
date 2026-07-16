import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllSpecies } from "@/content/pokemon";
import { getSpriteUrl, TOTAL_DEX } from "@/content/pokemon/types";
import { resolveEndingStats, resolveEndingSummary, type EndingStats } from "@/core/endingSummary";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";

export function EndingScreen() {
  const userId = useAuthStore((state) => state.userId);
  const unlockedSpeciesIds = useGameStore((state) => state.pokedex.unlockedSpeciesIds);
  const instances = useGameStore((state) => state.party.instances);
  const [stats, setStats] = useState<EndingStats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const { unlockedCount, pokedexPercent, isPokedexComplete, graduatedSpecies } =
    resolveEndingSummary({
      unlockedSpeciesIds,
      instances,
      allSpecies: getAllSpecies(),
      totalDex: TOTAL_DEX,
    });

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function loadStats() {
      try {
        if (!cancelled) {
          setStatsError(false);
        }

        const statsRes = await supabase
          .from("solved_questions")
          .select("correct", { count: "exact" })
          .eq("user_id", userId);

        if (statsRes.error) {
          console.error("엔딩 통계 로드 실패:", statsRes.error);
          if (!cancelled) {
            setStats(null);
            setStatsError(true);
          }
          return;
        }

        const totalAttempts = statsRes.count ?? 0;
        const totalCorrect = statsRes.data?.filter((row) => row.correct).length ?? 0;

        if (!cancelled) {
          setStats(resolveEndingStats({ totalAttempts, totalCorrect }));
        }
      } catch (error) {
        console.error("엔딩 통계 로드 실패:", error);
        if (!cancelled) {
          setStats(null);
          setStatsError(true);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-yellow-50 to-blue-50 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ending-title"
    >
      <div className="mx-auto my-6 flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl bg-white/80 p-5 text-center shadow-xl ring-1 ring-blue-100 backdrop-blur sm:my-10 sm:p-8">
        <div className="flex flex-col items-center gap-3">
          <p className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700">
            JAVASCRIPT TRAINING COMPLETE
          </p>
          <h1 id="ending-title" className="text-3xl font-bold text-blue-900">
            끝까지 해냈어요
          </h1>
          <p className="max-w-lg leading-relaxed text-gray-700">
            여기까지 온 것만으로도 정말 대단해요. 문제를 하나씩 풀고, 틀려도 다시 확인하고, 끝까지
            포기하지 않고 자바스크립트 훈련을 이어온 시간이 분명히 남아 있을 거예요.
          </p>
          {isPokedexComplete && (
            <p className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-800 ring-1 ring-yellow-200">
              1세대 도감 100% 완성
            </p>
          )}
        </div>

        <section className="grid w-full gap-3 sm:grid-cols-3" aria-label="학습 통계">
          <StatCard
            label="푼 문제"
            value={stats?.totalAttempts}
            loading={stats === null}
            tone="blue"
          />
          <StatCard
            label="맞춘 문제"
            value={stats?.totalCorrect}
            loading={stats === null}
            tone="emerald"
          />
          <StatCard
            label="틀린 문제"
            value={stats?.totalWrong}
            loading={stats === null}
            tone="amber"
          />
        </section>

        {statsError && (
          <p
            className="w-full rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800 ring-1 ring-amber-200"
            role="status"
          >
            학습 통계를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.
          </p>
        )}

        <section className="flex w-full flex-col gap-3 rounded-2xl bg-slate-50 p-5 text-left ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">도감 진행</h2>
            <span className="text-sm font-medium text-slate-600 tabular-nums">
              {unlockedCount} / {TOTAL_DEX} · {pokedexPercent}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${pokedexPercent}%` }}
            />
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {isPokedexComplete
              ? "일반 포켓몬부터 전설 포켓몬까지 모두 도감에 남았어요. 긴 훈련의 끝을 숫자로도 확인할 수 있어요."
              : "지금까지 함께한 포켓몬들이 차곡차곡 도감에 남아 있어요. 완주까지 이어온 흐름이 한눈에 보이도록 정리했어요."}
          </p>
        </section>

        <section className="flex w-full flex-col gap-3 text-left">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">졸업한 포켓몬</h2>
            <span className="text-sm text-slate-500 tabular-nums">
              {graduatedSpecies.length}마리
            </span>
          </div>
          {graduatedSpecies.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              아직 졸업 명단을 불러오지 못했어요.
            </p>
          ) : (
            <div className="max-h-[22rem] overflow-y-auto rounded-2xl pr-1">
              <div className="grid gap-3 sm:grid-cols-2">
                {graduatedSpecies.map((species) => (
                  <div
                    key={species.speciesId}
                    className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200"
                  >
                    <img
                      src={getSpriteUrl(species.dexNumber)}
                      alt={species.nameKo}
                      className="h-14 w-14 [image-rendering:pixelated]"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{species.nameKo}</p>
                      <p className="text-sm text-slate-500">
                        #{String(species.dexNumber).padStart(3, "0")} · {species.nameEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <p className="text-sm leading-relaxed text-gray-500">
          정답 수만큼 쌓인 자신감도, 오답을 다시 확인하며 다져진 감각도 전부 이번 훈련의 일부예요.
        </p>

        <Link
          to="/pokedex"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        >
          도감 보러 가기
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  tone,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  tone: "blue" | "emerald" | "amber";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-900 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-900 ring-emerald-100",
    amber: "bg-amber-50 text-amber-900 ring-amber-100",
  }[tone];

  return (
    <div className={`rounded-2xl px-4 py-5 ring-1 ${toneClass}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums">{loading ? "..." : value}</p>
    </div>
  );
}
