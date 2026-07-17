import { getAllQuestions } from "@/content/questions";
import type { MultipleChoiceQuestion } from "@/content/questions/types";

function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffledItems = [...items];
  for (let index = shuffledItems.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffledItems[index], shuffledItems[swapIndex]] = [
      shuffledItems[swapIndex],
      shuffledItems[index],
    ];
  }
  return shuffledItems;
}

export function buildMultipleChoiceOptions(
  question: MultipleChoiceQuestion,
  random: () => number,
): string[] {
  if (question.choices.length === 5) {
    return shuffle(question.choices, random);
  }

  const allQuestions = getAllQuestions();
  const candidates = allQuestions
    .filter(
      (candidateQuestion): candidateQuestion is MultipleChoiceQuestion =>
        candidateQuestion.type === "multiple_choice" &&
        candidateQuestion.conceptGroup === question.conceptGroup &&
        candidateQuestion.questionId !== question.questionId,
    )
    .map((candidateQuestion) => candidateQuestion.answer)
    .filter((answer) => answer !== question.answer);

  const uniqueCandidates = [...new Set(candidates)];
  const wrongAnswers = shuffle(uniqueCandidates, random).slice(0, 4);

  return shuffle([question.answer, ...wrongAnswers], random);
}
