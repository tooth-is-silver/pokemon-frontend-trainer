import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { devRoutes } from "@/features/preview/routes";

const Landing = lazy(() => import("../features/landing/LandingPage"));
const Starter = lazy(() => import("../features/starter/StarterPage"));
const Learn = lazy(() => import("../features/learn/LearnPage"));
const Pokedex = lazy(() => import("../features/pokedex/PokedexPage"));

export function App() {
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
