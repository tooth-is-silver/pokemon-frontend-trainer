import { arrowFunctionsBasics } from "./by-page/arrow-functions-basics";
import { asyncAwait } from "./by-page/async-await";
import { asyncIteratorsGenerators } from "./by-page/async-iterators-generators";
import { arrayBasics } from "./by-page/array";
import { arrayMethods } from "./by-page/array-methods";
import { classBasic } from "./by-page/class-basic";
import { classInheritance } from "./by-page/class-inheritance";
import { comparison } from "./by-page/comparison";
import { constructorNew } from "./by-page/constructor-new";
import { dateBasics } from "./by-page/date";
import { destructuringAssignment } from "./by-page/destructuring-assignment";
import { extendNatives } from "./by-page/extend-natives";
import { firstSteps } from "./by-page/first-steps";
import { functionBasics } from "./by-page/function-basics";
import { functionExpressions } from "./by-page/function-expressions";
import { functionPrototype } from "./by-page/function-prototype";
import { garbageCollection } from "./by-page/garbage-collection";
import { generators } from "./by-page/generators";
import { ifElse } from "./by-page/ifelse";
import { importExport } from "./by-page/import-export";
import { instanceOf } from "./by-page/instanceof";
import { iterable } from "./by-page/iterable";
import { jsonBasics } from "./by-page/json";
import { logicalOperators } from "./by-page/logical-operators";
import { mapSet } from "./by-page/map-set";
import { microtaskQueue } from "./by-page/microtask-queue";
import { mixins } from "./by-page/mixins";
import { modulesIntro } from "./by-page/modules-intro";
import { nativePrototypes } from "./by-page/native-prototypes";
import { nullishCoalescing } from "./by-page/nullish-coalescing";
import { objectBasics } from "./by-page/object-basics";
import { objectCopy } from "./by-page/object-copy";
import { objectKeysValuesEntries } from "./by-page/object-keys-values-entries";
import { objectMethods } from "./by-page/object-methods";
import { objectToPrimitive } from "./by-page/object-toprimitive";
import { optionalChaining } from "./by-page/optional-chaining";
import { operators } from "./by-page/operators";
import { privateProtectedPropertiesMethods } from "./by-page/private-protected-properties-methods";
import { promiseApi } from "./by-page/promise-api";
import { promiseBasics } from "./by-page/promise-basics";
import { promiseChaining } from "./by-page/promise-chaining";
import { promiseErrorHandling } from "./by-page/promise-error-handling";
import { promisify } from "./by-page/promisify";
import { propertyAccessors } from "./by-page/property-accessors";
import { propertyDescriptors } from "./by-page/property-descriptors";
import { prototypeInheritance } from "./by-page/prototype-inheritance";
import { prototypeMethods } from "./by-page/prototype-methods";
import { restParametersSpread } from "./by-page/rest-parameters-spread";
import { staticPropertiesMethods } from "./by-page/static-properties-methods";
import { switchStatement } from "./by-page/switch";
import { symbolType } from "./by-page/symbol-type";
import { tryCatch } from "./by-page/try-catch";
import { jsTypes } from "./by-page/types";
import { variables } from "./by-page/variables";
import { weakMapWeakSet } from "./by-page/weakmap-weakset";
import { whileFor } from "./by-page/while-for";
import type { QuestionPage, Question } from "./types";

export const questionPages: QuestionPage[] = [
  variables,
  firstSteps,
  jsTypes,
  asyncAwait,
  asyncIteratorsGenerators,
  classBasic,
  classInheritance,
  arrayBasics,
  arrayMethods,
  operators,
  comparison,
  constructorNew,
  dateBasics,
  destructuringAssignment,
  extendNatives,
  ifElse,
  importExport,
  instanceOf,
  garbageCollection,
  generators,
  iterable,
  jsonBasics,
  functionBasics,
  functionExpressions,
  functionPrototype,
  arrowFunctionsBasics,
  logicalOperators,
  mapSet,
  microtaskQueue,
  mixins,
  modulesIntro,
  nativePrototypes,
  weakMapWeakSet,
  nullishCoalescing,
  optionalChaining,
  privateProtectedPropertiesMethods,
  promiseApi,
  promiseBasics,
  promiseChaining,
  promiseErrorHandling,
  promisify,
  propertyAccessors,
  propertyDescriptors,
  prototypeInheritance,
  prototypeMethods,
  restParametersSpread,
  staticPropertiesMethods,
  whileFor,
  switchStatement,
  symbolType,
  tryCatch,
  objectBasics,
  objectCopy,
  objectKeysValuesEntries,
  objectMethods,
  objectToPrimitive,
];

export function getAllQuestions(): Question[] {
  return questionPages.flatMap((page) => page.questions);
}
