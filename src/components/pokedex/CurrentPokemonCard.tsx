import { Link } from "react-router-dom";
import { getSpriteUrl } from "@/content/pokemon/types";
import type { PokemonSpecies } from "@/content/pokemon/types";
import type { PokemonInstance } from "@/core/types";
import { PokemonExp } from "@/components/pokemon/PokemonExp";

interface Props {
  instance: PokemonInstance;
  species: PokemonSpecies;
  graduationPending?: boolean;
}

export function CurrentPokemonCard({ instance, species, graduationPending = false }: Props) {
  const maxStage = species.evolutionLine.length;

  return (
    <article className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border-2 border-blue-200 bg-white shadow-sm">
      <div className="flex flex-col items-center gap-1 sm:w-32 shrink-0">
        <img
          src={getSpriteUrl(species.dexNumber)}
          alt={species.nameKo}
          className="w-24 h-24 [image-rendering:pixelated]"
          loading="lazy"
        />
        <div className="flex items-center gap-2">
          <span className="font-bold">{species.nameKo}</span>
          <span className="text-xs text-gray-400 tabular-nums">
            {instance.currentStage}/{maxStage}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
            현재 포켓몬
          </span>
          {instance.evolutionPending && (
            <Link
              to="/learn"
              className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full hover:bg-emerald-200 transition-colors"
            >
              ✨ 진화 대기 (학습으로 이동)
            </Link>
          )}
          {instance.graduated && (
            <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              🎓 졸업 완료
            </span>
          )}
          {graduationPending && (
            <Link
              to="/learn"
              className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full hover:bg-amber-200 transition-colors"
            >
              🎓 졸업 대기 (학습에서 선택)
            </Link>
          )}
        </div>
        {graduationPending && (
          <p className="text-xs text-amber-700" aria-live="polite">
            학습 화면으로 이동하면 졸업 모달이 자동으로 열려 다음 포켓몬을 선택할 수 있어요.
          </p>
        )}
        <PokemonExp exp={instance.exp} />
      </div>
    </article>
  );
}
