import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getLoginErrorMessage, resolveAuthCallbackUrl } from "@/core/authError";
import { useAuthStore } from "@/stores/useAuthStore";

export function EmailLoginForm() {
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { errorMessage, sanitizedUrl } = resolveAuthCallbackUrl(window.location.href);

    if (errorMessage) setLoginError(errorMessage);
    if (sanitizedUrl) {
      window.history.replaceState(window.history.state, "", sanitizedUrl);
    }
  }, []);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSigningIn) return;

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setLoginError("로그인할 이메일을 입력해주세요.");
      return;
    }

    setIsSigningIn(true);
    setLoginError(null);
    setSentEmail(null);

    try {
      await signInWithEmail(normalizedEmail);
      setSentEmail(normalizedEmail);
    } catch (error) {
      console.error("로그인 시작 실패:", error);
      setLoginError(getLoginErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <form
      onSubmit={handleSignIn}
      className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 text-left shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-semibold text-gray-900">
          이메일 로그인
        </label>
        <p className="text-xs leading-5 text-gray-500">
          비밀번호 없이 로그인 링크를 보내드려요. 모바일에서는 같은 브라우저로 링크를 열어주세요.
        </p>
        <p className="text-xs leading-5 text-gray-400">
          이미 로그인한 브라우저라면 자동으로 이어서 시작돼요.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
          disabled={isSigningIn}
          className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:bg-white disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={isSigningIn}
          className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSigningIn ? "메일 보내는 중..." : "로그인 링크 받기"}
        </button>
      </div>

      {loginError && (
        <p
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {loginError}
        </p>
      )}
      {sentEmail && (
        <div
          className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium leading-6 text-blue-800"
          role="status"
        >
          <p>{sentEmail}로 로그인 링크를 보냈어요.</p>
          <p className="text-xs text-blue-700">메일이 안 보이면 스팸함도 확인해주세요.</p>
        </div>
      )}
    </form>
  );
}
