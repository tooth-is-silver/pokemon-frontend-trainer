import { objectMethods } from "./by-page/object-methods";
import type { QuestionPage, Question } from "./types";

export const questionPages: QuestionPage[] = [objectMethods];

export function getAllQuestions(): Question[] {
  return questionPages.flatMap((page) => page.questions);
}
