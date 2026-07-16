import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import { Landing } from "./components/Landing";

export default function LandingPage() {
  const authLoading = useAuthStore((state) => state.loading);
  const userId = useAuthStore((state) => state.userId);
  const loaded = useGameStore((state) => state.loaded);
  const starterChosen = useGameStore((state) => state.trainer.starterChosen);

  if (authLoading || (userId && !loaded)) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  if (userId && starterChosen) return <Navigate to="/regions" replace />;
  if (userId) return <Navigate to="/starter" replace />;

  return <Landing />;
}
