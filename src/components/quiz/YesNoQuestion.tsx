interface Props {
  onSubmit: (userAnswer: string) => void;
  disabled: boolean;
}

export function YesNoQuestion({ onSubmit, disabled }: Props) {
  return (
    <div className="flex gap-4 justify-center">
      <button
        type="button"
        onClick={() => onSubmit("true")}
        disabled={disabled}
        className="px-8 py-3 rounded-xl border-2 border-gray-200 font-semibold hover:border-blue-400 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        예
      </button>
      <button
        type="button"
        onClick={() => onSubmit("false")}
        disabled={disabled}
        className="px-8 py-3 rounded-xl border-2 border-gray-200 font-semibold hover:border-blue-400 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        아니오
      </button>
    </div>
  );
}
