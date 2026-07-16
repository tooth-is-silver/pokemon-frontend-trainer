import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import { RegionExplorer } from "./components/RegionExplorer";

export default function RegionsPage() {
  const userId = useAuthStore((state) => state.userId);
  const authLoading = useAuthStore((state) => state.loading);
  const loaded = useGameStore((state) => state.loaded);
  const starterChosen = useGameStore((state) => state.trainer.starterChosen);

  if (authLoading || !loaded) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  if (!userId) return <Navigate to="/" replace />;
  if (!starterChosen) return <Navigate to="/starter" replace />;

  return <RegionExplorer />;
}
