import type { Question } from "@/content/questions/types";

interface Props {
  question: Question;
  sourceUrl: string;
  onNext: () => void;
}

function formatAnswer(question: Question): string {
  if (question.type === "yes_no") return question.answer ? "예" : "아니오";
  return question.answer;
}

export function WrongAnswerPanel({ question, sourceUrl, onNext }: Props) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex flex-col gap-3 p-5 rounded-xl border border-rose-200 bg-rose-50"
    >
      <div className="flex items-center gap-2">
        <span className="text-rose-600 font-bold">오답</span>
        <span className="text-sm text-gray-500">정답: {formatAnswer(question)}</span>
      </div>
      <p className="text-sm text-gray-700">{question.explanation}</p>
      <div className="flex items-center justify-between">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center text-sm text-blue-600 hover:underline"
        >
          출처 보기 →
        </a>
        <button
          type="button"
          onClick={onNext}
          className="min-h-11 rounded-lg bg-gray-900 px-5 py-2 font-semibold text-white transition-colors hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
        >
          다음 문제
        </button>
      </div>
    </div>
  );
}
