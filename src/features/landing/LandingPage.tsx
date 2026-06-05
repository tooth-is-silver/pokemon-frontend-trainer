import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";

export default function LandingPage() {
  const authLoading = useAuthStore((s) => s.loading);
  const userId = useAuthStore((s) => s.userId);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const loaded = useGameStore((s) => s.loaded);
  const starterChosen = useGameStore((s) => s.trainer.starterChosen);
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  if (authLoading || (userId && !loaded)) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  if (userId && starterChosen) return <Navigate to="/learn" replace />;
  if (userId) return <Navigate to="/starter" replace />;

  const handleSignIn = async () => {
    if (signingIn) return;
    setSigningIn(true);
    setLoginError(null);

    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("로그인 시작 실패:", error);
      setLoginError("Google 로그인을 시작하지 못했어요. 잠시 후 다시 시도해주세요.");
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-3xl font-bold">Pokemon JS Trainer</h1>
        <p className="text-gray-500">포켓몬을 키우며 자바스크립트 코어 공부하기</p>
      </div>

      <button
        type="button"
        onClick={handleSignIn}
        disabled={signingIn}
        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {signingIn ? "로그인으로 이동하는 중..." : "Google로 시작하기"}
      </button>
      {loginError && (
        <p className="max-w-xs text-sm font-medium text-red-600" role="alert">
          {loginError}
        </p>
      )}
    </div>
  );
}
