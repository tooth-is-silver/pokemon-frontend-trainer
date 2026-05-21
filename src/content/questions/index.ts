import { arrowFunctionsBasics } from "./by-page/arrow-functions-basics";
import { comparison } from "./by-page/comparison";
import { firstSteps } from "./by-page/first-steps";
import { functionBasics } from "./by-page/function-basics";
import { functionExpressions } from "./by-page/function-expressions";
import { ifElse } from "./by-page/ifelse";
import { logicalOperators } from "./by-page/logical-operators";
import { nullishCoalescing } from "./by-page/nullish-coalescing";
import { objectBasics } from "./by-page/object-basics";
import { objectMethods } from "./by-page/object-methods";
import { operators } from "./by-page/operators";
import { switchStatement } from "./by-page/switch";
import { jsTypes } from "./by-page/types";
import { variables } from "./by-page/variables";
import { whileFor } from "./by-page/while-for";
import type { QuestionPage, Question } from "./types";

export const questionPages: QuestionPage[] = [
  variables,
  firstSteps,
  jsTypes,
  operators,
  comparison,
  ifElse,
  functionBasics,
  functionExpressions,
  arrowFunctionsBasics,
  logicalOperators,
  nullishCoalescing,
  whileFor,
  switchStatement,
  objectBasics,
  objectMethods,
];

export function getAllQuestions(): Question[] {
  return questionPages.flatMap((page) => page.questions);
}
