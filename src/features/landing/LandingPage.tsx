import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";

function getErrorText(error: unknown) {
  return error instanceof Error ? error.message : "";
}

function getErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) return "";

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code.toLowerCase() : "";
}

function getLoginErrorMessage(error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorText(error);
  const normalized = message.toLowerCase();

  if (
    code === "email_address_invalid" ||
    (normalized.includes("email address") && normalized.includes("invalid"))
  ) {
    return "이메일 주소를 확인해주세요. 실제로 메일을 받을 수 있는 주소로 다시 시도해주세요.";
  }

  if (code.includes("rate") || normalized.includes("rate") || normalized.includes("too many")) {
    return "짧은 시간에 로그인 메일 요청이 많았어요. 잠시 후 다시 시도해주세요.";
  }

  if (normalized.includes("redirect")) {
    return "로그인 리다이렉트 설정이 맞지 않아요. Supabase Redirect URL에 배포 주소가 등록되어 있는지 확인해주세요.";
  }

  if (normalized.includes("provider") || normalized.includes("disabled")) {
    return "Supabase 이메일 로그인이 꺼져 있어요. Email provider 설정을 확인해주세요.";
  }

  return message
    ? `로그인 메일을 보내지 못했어요. ${message}`
    : "로그인 메일을 보내지 못했어요. 잠시 후 다시 시도해주세요.";
}

function readAuthCallbackError() {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const errorCode = params.get("error_code") ?? hashParams.get("error_code");
  const errorDescription = params.get("error_description") ?? hashParams.get("error_description");

  if (!errorCode && !errorDescription) return null;

  const normalizedCode = errorCode?.toLowerCase() ?? "";
  const normalizedDescription = errorDescription?.toLowerCase() ?? "";

  if (
    normalizedCode.includes("otp") ||
    normalizedDescription.includes("expired") ||
    normalizedDescription.includes("invalid")
  ) {
    return "로그인 링크가 만료됐거나 이미 사용됐어요. 새 로그인 링크를 다시 받아주세요.";
  }

  if (normalizedDescription.includes("redirect")) {
    return "로그인 리다이렉트 설정이 맞지 않아요. Supabase Redirect URL과 이메일 템플릿을 확인해주세요.";
  }

  return errorDescription
    ? `로그인을 완료하지 못했어요. ${errorDescription}`
    : "로그인을 완료하지 못했어요. 새 로그인 링크를 다시 받아주세요.";
}

function clearAuthCallbackErrorParams() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const errorParams = ["error", "error_code", "error_description"];
  let hasErrorParams = false;

  errorParams.forEach((param) => {
    if (!url.searchParams.has(param)) return;
    url.searchParams.delete(param);
    hasErrorParams = true;
  });

  if (url.hash.includes("error")) {
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

    errorParams.forEach((param) => {
      if (!hashParams.has(param)) return;
      hashParams.delete(param);
      hasErrorParams = true;
    });

    if (hasErrorParams) {
      const nextHash = hashParams.toString();
      url.hash = nextHash ? `#${nextHash}` : "";
    }
  }

  if (hasErrorParams) {
    window.history.replaceState(window.history.state, "", url.toString());
  }
}

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

  useEffect(() => {
    const authCallbackError = readAuthCallbackError();

    if (!authCallbackError) return;

    setLoginError(authCallbackError);
    clearAuthCallbackErrorParams();
  }, []);

  if (authLoading || (userId && !loaded)) {
    return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>;
  }

  if (userId && starterChosen) return <Navigate to="/regions" replace />;
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
      setLoginError(getLoginErrorMessage(error));
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 bg-gray-50 px-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-3">
        <span
          className="rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm"
          aria-hidden="true"
        >
          JavaScript Training MVP
        </span>
        <h1 className="text-3xl font-bold text-gray-950">Pokemon JS Trainer</h1>
        <p className="text-sm leading-6 text-gray-500">
          이메일 링크로 접속해서 문제를 풀고, 포켓몬을 키우며 자바스크립트 코어를 복습해요.
        </p>
      </div>

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
            disabled={signingIn}
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:bg-white disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={signingIn}
            className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {signingIn ? "메일 보내는 중..." : "로그인 링크 받기"}
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
    </div>
  );
}
