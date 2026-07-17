import { EmailLoginForm } from "./EmailLoginForm";

export function Landing() {
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

      <EmailLoginForm />
    </div>
  );
}
