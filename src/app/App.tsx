import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useRef } from "react";
import { devRoutes } from "@/features/preview/routes";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";

const Landing = lazy(() => import("../features/landing/LandingPage"));
const Starter = lazy(() => import("../features/starter/StarterPage"));
const Learn = lazy(() => import("../features/learn/LearnPage"));
const Pokedex = lazy(() => import("../features/pokedex/PokedexPage"));

export function App() {
  const authLoading = useAuthStore((s) => s.loading);
  const userId = useAuthStore((s) => s.userId);
  const loadFromServer = useGameStore((s) => s.loadFromServer);
  const resetGame = useGameStore((s) => s.reset);
  const bootstrappedRef = useRef(false);
  const loadedUserRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    useAuthStore
      .getState()
      .initialize()
      .catch((error) => {
        console.error("인증 초기화 실패:", error);
      });
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      if (loadedUserRef.current === null) return;
      loadedUserRef.current = null;
      resetGame();
      return;
    }

    if (loadedUserRef.current === userId) return;
    loadedUserRef.current = userId;

    loadFromServer(userId).catch((error) => {
      console.error("게임 상태 로드 실패:", error);
      loadedUserRef.current = null;
      resetGame();
    });
  }, [authLoading, userId, loadFromServer, resetGame]);

  return (
    <BrowserRouter>
      <Suspense
        fallback={<div className="flex items-center justify-center h-screen">로딩 중...</div>}
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/starter" element={<Starter />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/pokedex" element={<Pokedex />} />
          {import.meta.env.DEV && devRoutes}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
