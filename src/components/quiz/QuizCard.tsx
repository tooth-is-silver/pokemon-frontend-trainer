import { useMemo } from "react";
import { buildMultipleChoiceOptions } from "@/core/choiceBuilder";
import type { Question } from "@/content/questions/types";
import { YesNoQuestion } from "./YesNoQuestion";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { FillBlankQuestion } from "./FillBlankQuestion";

interface Props {
  question: Question;
  onSubmit: (userAnswer: string) => void;
  disabled: boolean;
}

export function QuizCard({ question, onSubmit, disabled }: Props) {
  // 문제가 바뀔 때만 보기 재생성
  const multipleChoiceOptions = useMemo(
    () =>
      question.type === "multiple_choice" ? buildMultipleChoiceOptions(question, Math.random) : [],
    [question],
  );

  return (
    <div className="flex flex-col gap-5 p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <p className="text-lg font-medium whitespace-pre-line">{question.prompt}</p>

      {question.type === "yes_no" && <YesNoQuestion onSubmit={onSubmit} disabled={disabled} />}

      {question.type === "multiple_choice" && (
        <MultipleChoiceQuestion
          options={multipleChoiceOptions}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )}

      {question.type === "fill_blank" && (
        <FillBlankQuestion onSubmit={onSubmit} disabled={disabled} />
      )}
    </div>
  );
}
