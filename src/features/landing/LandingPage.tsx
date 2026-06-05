import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";

export default function LandingPage() {
  const authLoading = useAuthStore((s) => s.loading);
  const userId = useAuthStore((s) => s.userId);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const loaded = useGameStore((s) => s.loaded);
  const starterChosen = useGameStore((s) => s.trainer.starterChosen);
  const [signingIn, setSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  if (authLoading || (userId && !loaded)) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  if (userId && starterChosen) return <Navigate to="/learn" replace />;
  if (userId) return <Navigate to="/starter" replace />;

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (signingIn) return;

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setLoginError("로그인할 이메일을 입력해주세요.");
      return;
    }

    setSigningIn(true);
    setLoginError(null);
    setSentEmail(null);

    try {
      await signInWithEmail(normalizedEmail);
      setSentEmail(normalizedEmail);
    } catch (error) {
      console.error("로그인 시작 실패:", error);
      setLoginError("로그인 메일을 보내지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-3xl font-bold">Pokemon JS Trainer</h1>
        <p className="text-gray-500">포켓몬을 키우며 자바스크립트 코어 공부하기</p>
      </div>

      <form onSubmit={handleSignIn} className="flex w-full max-w-sm flex-col gap-3">
        <label htmlFor="email" className="sr-only">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="이메일을 입력하세요"
          autoComplete="email"
          disabled={signingIn}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={signingIn}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {signingIn ? "로그인 메일 보내는 중..." : "이메일로 시작하기"}
        </button>
      </form>
      {loginError && (
        <p className="max-w-xs text-sm font-medium text-red-600" role="alert">
          {loginError}
        </p>
      )}
      {sentEmail && (
        <p className="max-w-xs text-sm font-medium text-blue-700" role="status">
          {sentEmail}로 로그인 링크를 보냈어요. 메일에서 링크를 열어주세요.
        </p>
      )}
    </div>
  );
}
