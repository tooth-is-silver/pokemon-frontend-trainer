import { Link } from "react-router-dom";
import { getSpriteUrl } from "@/content/pokemon/types";
import type { PokemonSpecies } from "@/content/pokemon/types";
import type { Region } from "@/content/regions";
import { QuizSession } from "./QuizSession";

interface Props {
  region: Region;
  species: PokemonSpecies;
}

export function EncounterLearningSession({ region, species }: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-gray-50 p-6">
      <header className="flex w-full max-w-lg items-center gap-4 border-b-2 border-gray-950 bg-white p-4">
        <img
          src={getSpriteUrl(species.dexNumber)}
          alt={species.nameKo}
          className="h-20 w-20 shrink-0 object-contain [image-rendering:pixelated]"
          draggable={false}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gray-500">{region.nameKo}</p>
          <h1 className="text-lg font-black leading-6 sm:text-xl">
            야생의 {species.nameKo}와 대결 중
          </h1>
          <p className="mt-1 text-sm text-gray-600">문제를 맞히고 포획 기회를 만들어요.</p>
        </div>
        <Link
          to="/regions"
          className="flex min-h-11 shrink-0 items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
        >
          도망가기
        </Link>
      </header>
      <QuizSession />
    </main>
  );
}
