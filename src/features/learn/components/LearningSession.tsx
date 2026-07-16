import { ActivePokemonStatus } from "./ActivePokemonStatus";
import { EvolutionFlow } from "./EvolutionFlow";
import { GraduationFlow } from "./GraduationFlow";
import { QuizSession } from "./QuizSession";

export function LearningSession() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-gray-50 p-6">
      <ActivePokemonStatus />
      <GraduationFlow />
      <QuizSession />
      <EvolutionFlow />
    </div>
  );
}
