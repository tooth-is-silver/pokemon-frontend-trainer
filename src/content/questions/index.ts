import { arrowFunctionsBasics } from "./by-page/arrow-functions-basics";
import { arrayBasics } from "./by-page/array";
import { comparison } from "./by-page/comparison";
import { constructorNew } from "./by-page/constructor-new";
import { firstSteps } from "./by-page/first-steps";
import { functionBasics } from "./by-page/function-basics";
import { functionExpressions } from "./by-page/function-expressions";
import { garbageCollection } from "./by-page/garbage-collection";
import { ifElse } from "./by-page/ifelse";
import { logicalOperators } from "./by-page/logical-operators";
import { nullishCoalescing } from "./by-page/nullish-coalescing";
import { objectBasics } from "./by-page/object-basics";
import { objectCopy } from "./by-page/object-copy";
import { objectMethods } from "./by-page/object-methods";
import { objectToPrimitive } from "./by-page/object-toprimitive";
import { optionalChaining } from "./by-page/optional-chaining";
import { operators } from "./by-page/operators";
import { switchStatement } from "./by-page/switch";
import { symbolType } from "./by-page/symbol-type";
import { jsTypes } from "./by-page/types";
import { variables } from "./by-page/variables";
import { whileFor } from "./by-page/while-for";
import type { QuestionPage, Question } from "./types";

export const questionPages: QuestionPage[] = [
  variables,
  firstSteps,
  jsTypes,
  arrayBasics,
  operators,
  comparison,
  constructorNew,
  ifElse,
  garbageCollection,
  functionBasics,
  functionExpressions,
  arrowFunctionsBasics,
  logicalOperators,
  nullishCoalescing,
  optionalChaining,
  whileFor,
  switchStatement,
  symbolType,
  objectBasics,
  objectCopy,
  objectMethods,
  objectToPrimitive,
];

export function getAllQuestions(): Question[] {
  return questionPages.flatMap((page) => page.questions);
}
