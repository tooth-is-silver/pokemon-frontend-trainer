import { firstSteps } from "./by-page/first-steps";
import { objectMethods } from "./by-page/object-methods";
import type { QuestionPage, Question } from "./types";

export const questionPages: QuestionPage[] = [firstSteps, objectMethods];

export function getAllQuestions(): Question[] {
  return questionPages.flatMap((page) => page.questions);
}
