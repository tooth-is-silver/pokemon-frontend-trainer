import { comparison } from "./by-page/comparison";
import { firstSteps } from "./by-page/first-steps";
import { ifElse } from "./by-page/ifelse";
import { objectMethods } from "./by-page/object-methods";
import { operators } from "./by-page/operators";
import { jsTypes } from "./by-page/types";
import { variables } from "./by-page/variables";
import type { QuestionPage, Question } from "./types";

export const questionPages: QuestionPage[] = [
  firstSteps,
  variables,
  jsTypes,
  operators,
  comparison,
  ifElse,
  objectMethods,
];

export function getAllQuestions(): Question[] {
  return questionPages.flatMap((page) => page.questions);
}
