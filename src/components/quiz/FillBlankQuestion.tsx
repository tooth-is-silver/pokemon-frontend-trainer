import { useState, type FormEvent } from "react";

interface Props {
  onSubmit: (userAnswer: string) => void;
  disabled: boolean;
}

export function FillBlankQuestion({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled || !value.trim()) return;
    onSubmit(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder="답을 입력하세요"
        autoFocus
        className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus-visible:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        제출
      </button>
    </form>
  );
}
