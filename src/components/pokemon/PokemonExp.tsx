interface Props {
  exp: number;
}

const EXP_MAX = 100;

export function PokemonExp({ exp }: Props) {
  const percent = Math.min(100, (exp / EXP_MAX) * 100);

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-700">EXP</span>
        <span className="font-bold tabular-nums text-blue-600">
          {exp}/{EXP_MAX}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={exp}
          aria-valuemin={0}
          aria-valuemax={EXP_MAX}
          aria-label={`EXP ${exp}`}
        />
      </div>
    </div>
  );
}
