import type { PokemonStats as Stats } from "@/stores/types";

interface Props {
  stats: Stats;
}

const STAT_LABELS: Array<{ key: keyof Stats; label: string; color: string }> = [
  { key: "hp", label: "HP", color: "bg-rose-400" },
  { key: "attack", label: "공격", color: "bg-orange-400" },
  { key: "defense", label: "방어", color: "bg-sky-400" },
  { key: "speed", label: "스피드", color: "bg-emerald-400" },
];

const STAT_MAX = 100;

export function PokemonStats({ stats }: Props) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      {STAT_LABELS.map(({ key, label, color }) => {
        const value = stats[key];
        const pct = Math.min(100, (value / STAT_MAX) * 100);
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-12 text-sm text-gray-600">{label}</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={STAT_MAX}
                aria-label={`${label} ${value}`}
              />
            </div>
            <span className="w-10 text-right text-sm tabular-nums">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
