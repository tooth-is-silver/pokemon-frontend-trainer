import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export function AccountBar() {
  const location = useLocation();
  const authLoading = useAuthStore((state) => state.loading);
  const userId = useAuthStore((state) => state.userId);
  const email = useAuthStore((state) => state.email);
  const signOut = useAuthStore((state) => state.signOut);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  if (authLoading || !userId) return null;

  const learnActive = location.pathname.startsWith("/learn");
  const regionsActive = location.pathname.startsWith("/regions");
  const pokedexActive = location.pathname.startsWith("/pokedex");

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
    } catch (error) {
      console.error("로그아웃 실패:", error);
      setSignOutError("로그아웃하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-500">로그인 중</p>
          <p className="truncate text-sm font-bold text-gray-950">{email ?? "이메일 확인 중"}</p>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <Link
            to="/regions"
            aria-current={regionsActive ? "page" : undefined}
            className="inline-flex min-h-11 items-center rounded-full border border-gray-200 px-3 py-2 text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 aria-[current=page]:border-blue-200 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-700"
          >
            지역
          </Link>
          <Link
            to="/learn"
            aria-current={learnActive ? "page" : undefined}
            className="inline-flex min-h-11 items-center rounded-full border border-gray-200 px-3 py-2 text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 aria-[current=page]:border-blue-200 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-700"
          >
            학습
          </Link>
          <Link
            to="/pokedex"
            aria-current={pokedexActive ? "page" : undefined}
            className="inline-flex min-h-11 items-center rounded-full border border-gray-200 px-3 py-2 text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 aria-[current=page]:border-blue-200 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-700"
          >
            도감
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="min-h-11 rounded-full border border-red-100 px-3 py-2 text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        </nav>

        {signOutError && (
          <div
            className="flex flex-wrap items-center gap-2 text-sm font-semibold text-red-600 sm:basis-full"
            role="alert"
          >
            <span>{signOutError}</span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="min-h-11 rounded-full border border-red-200 px-3 py-1 text-xs transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
