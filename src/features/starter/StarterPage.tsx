import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import { StarterSelection } from "./components/StarterSelection";

export default function StarterPage() {
  const authLoading = useAuthStore((state) => state.loading);
  const userId = useAuthStore((state) => state.userId);
  const loaded = useGameStore((state) => state.loaded);
  const starterChosen = useGameStore((state) => state.trainer.starterChosen);

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  if (!userId) return <Navigate to="/" replace />;

  if (!loaded) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  if (starterChosen) return <Navigate to="/regions" replace />;

  return <StarterSelection />;
}
