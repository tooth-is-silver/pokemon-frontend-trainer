import { arrowFunctionsBasics } from "./by-page/arrow-functions-basics";
import { arrayBasics } from "./by-page/array";
import { arrayMethods } from "./by-page/array-methods";
import { comparison } from "./by-page/comparison";
import { constructorNew } from "./by-page/constructor-new";
import { dateBasics } from "./by-page/date";
import { destructuringAssignment } from "./by-page/destructuring-assignment";
import { firstSteps } from "./by-page/first-steps";
import { functionBasics } from "./by-page/function-basics";
import { functionExpressions } from "./by-page/function-expressions";
import { garbageCollection } from "./by-page/garbage-collection";
import { ifElse } from "./by-page/ifelse";
import { iterable } from "./by-page/iterable";
import { logicalOperators } from "./by-page/logical-operators";
import { mapSet } from "./by-page/map-set";
import { nullishCoalescing } from "./by-page/nullish-coalescing";
import { objectBasics } from "./by-page/object-basics";
import { objectCopy } from "./by-page/object-copy";
import { objectKeysValuesEntries } from "./by-page/object-keys-values-entries";
import { objectMethods } from "./by-page/object-methods";
import { objectToPrimitive } from "./by-page/object-toprimitive";
import { optionalChaining } from "./by-page/optional-chaining";
import { operators } from "./by-page/operators";
import { switchStatement } from "./by-page/switch";
import { symbolType } from "./by-page/symbol-type";
import { jsTypes } from "./by-page/types";
import { variables } from "./by-page/variables";
import { weakMapWeakSet } from "./by-page/weakmap-weakset";
import { whileFor } from "./by-page/while-for";
import type { QuestionPage, Question } from "./types";

export const questionPages: QuestionPage[] = [
  variables,
  firstSteps,
  jsTypes,
  arrayBasics,
  arrayMethods,
  operators,
  comparison,
  constructorNew,
  dateBasics,
  destructuringAssignment,
  ifElse,
  garbageCollection,
  iterable,
  functionBasics,
  functionExpressions,
  arrowFunctionsBasics,
  logicalOperators,
  mapSet,
  weakMapWeakSet,
  nullishCoalescing,
  optionalChaining,
  whileFor,
  switchStatement,
  symbolType,
  objectBasics,
  objectCopy,
  objectKeysValuesEntries,
  objectMethods,
  objectToPrimitive,
];

export function getAllQuestions(): Question[] {
  return questionPages.flatMap((page) => page.questions);
}
