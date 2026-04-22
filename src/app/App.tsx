import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

const Landing = lazy(() => import("../features/landing/LandingPage"));
const Starter = lazy(() => import("../features/starter/StarterPage"));
const Learn = lazy(() => import("../features/learn/LearnPage"));
const Pokedex = lazy(() => import("../features/pokedex/PokedexPage"));
const MyPokemon = lazy(() => import("../features/pokemon/MyPokemonPage"));
// dev 모드 전용 UI 프리뷰 (스크린샷/리뷰용)
const QuizPreview = lazy(() => import("../features/preview/QuizPreviewPage"));

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
          <Route path="/pokemon" element={<MyPokemon />} />
          {import.meta.env.DEV && <Route path="/preview/quiz" element={<QuizPreview />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
