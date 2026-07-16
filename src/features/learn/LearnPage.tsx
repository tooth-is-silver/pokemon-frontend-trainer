import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import { EndingFlow } from "./components/EndingFlow";
import { LearningSession } from "./components/LearningSession";

export default function LearnPage() {
  const userId = useAuthStore((state) => state.userId);
  const authLoading = useAuthStore((state) => state.loading);
  const loaded = useGameStore((state) => state.loaded);
  const starterChosen = useGameStore((state) => state.trainer.starterChosen);
  const isEnding = useGameStore((state) => state.progression.isEnding);

  if (authLoading || !loaded) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  if (!userId) return <Navigate to="/" replace />;
  if (!starterChosen) return <Navigate to="/starter" replace />;
  if (isEnding) return <EndingFlow />;

  return <LearningSession />;
}
