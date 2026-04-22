/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { Route } from "react-router-dom";

const QuizPreview = lazy(() => import("./QuizPreviewPage"));

// dev 전용 라우트. src/app 의 라우트 목록은 AGENTS.md 화이트리스트만 유지하고,
// 개발용 라우트는 여기서만 선언한다.
export const devRoutes = [
  <Route key="preview-quiz" path="/preview/quiz" element={<QuizPreview />} />,
];
