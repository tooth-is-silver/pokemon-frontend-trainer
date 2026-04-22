/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { Route } from "react-router-dom";

const QuizPreview = lazy(() => import("@/features/preview/QuizPreviewPage"));

// dev 전용 라우트. App.tsx는 AGENTS.md에 명시된 프로덕션 라우트만 유지하고,
// 개발용 라우트는 여기서만 선언한다.
export const devRoutes = [
  <Route key="preview-quiz" path="/preview/quiz" element={<QuizPreview />} />,
];
