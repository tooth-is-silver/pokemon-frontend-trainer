import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export function AccountBar() {
  const location = useLocation();
  const authLoading = useAuthStore((s) => s.loading);
  const userId = useAuthStore((s) => s.userId);
  const email = useAuthStore((s) => s.email);
  const signOut = useAuthStore((s) => s.signOut);
  const [signingOut, setSigningOut] = useState(false);

  if (authLoading || !userId) return null;

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("로그아웃 실패:", error);
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
            to="/learn"
            aria-current={location.pathname === "/learn" ? "page" : undefined}
            className="rounded-full border border-gray-200 px-3 py-2 text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 aria-[current=page]:border-blue-200 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-700"
          >
            학습
          </Link>
          <Link
            to="/pokedex"
            aria-current={location.pathname === "/pokedex" ? "page" : undefined}
            className="rounded-full border border-gray-200 px-3 py-2 text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 aria-[current=page]:border-blue-200 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-700"
          >
            도감
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-full border border-red-100 px-3 py-2 text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        </nav>
      </div>
    </header>
  );
}
