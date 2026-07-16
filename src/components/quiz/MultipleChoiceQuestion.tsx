interface Props {
  options: string[];
  onSubmit: (userAnswer: string) => void;
  disabled: boolean;
}

export function MultipleChoiceQuestion({ options, onSubmit, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option, index) => (
        <button
          key={`${index}-${option}`}
          type="button"
          onClick={() => onSubmit(option)}
          disabled={disabled}
          className="text-left px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-gray-400 mr-2">{index + 1}.</span>
          {option}
        </button>
      ))}
    </div>
  );
}
