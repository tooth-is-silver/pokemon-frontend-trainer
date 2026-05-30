import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const rootDir = process.cwd();
const questionsDir = path.join(rootDir, "src/content/questions/by-page");
const conceptPoolsPath = path.join(rootDir, "src/content/questions/concept-pools.ts");

function parseSource(filePath, sourceText) {
  return ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function getPropertyName(node) {
  if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
    return node.name.text;
  }

  return null;
}

function toValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }

  if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }

  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map(toValue);
  }

  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(
      node.properties
        .filter(ts.isPropertyAssignment)
        .map((property) => [getPropertyName(property), toValue(property.initializer)])
        .filter(([name]) => name !== null),
    );
  }

  return undefined;
}

function findExportedObject(sourceFile) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
        return toValue(declaration.initializer);
      }
    }
  }

  return null;
}

function findConceptPoolKeys(sourceFile) {
  const conceptPools = findExportedObject(sourceFile);

  if (!conceptPools) {
    return new Set();
  }

  return new Set(Object.keys(conceptPools));
}

function formatQuestionLabel(page, question) {
  return `${page.sourceId}:${question.questionId ?? "(missing questionId)"}`;
}

function validatePage(page, filePath, conceptGroups, seenQuestionIds, seenSourceIds) {
  const errors = [];
  const fileLabel = path.relative(rootDir, filePath);

  if (!page || typeof page !== "object") {
    return [`${fileLabel}: QuestionPage 객체를 찾을 수 없습니다.`];
  }

  if (typeof page.sourceId !== "string" || page.sourceId.length === 0) {
    errors.push(`${fileLabel}: sourceId가 비어 있습니다.`);
  } else if (seenSourceIds.has(page.sourceId)) {
    errors.push(`${fileLabel}: sourceId '${page.sourceId}'가 중복됩니다.`);
  } else {
    seenSourceIds.add(page.sourceId);
  }

  if (!Array.isArray(page.questions) || page.questions.length === 0) {
    errors.push(`${fileLabel}: questions 배열이 비어 있습니다.`);
    return errors;
  }

  for (const question of page.questions) {
    const label = formatQuestionLabel(page, question);

    if (typeof question.questionId !== "string" || question.questionId.length === 0) {
      errors.push(`${fileLabel}: questionId가 비어 있습니다.`);
    } else if (seenQuestionIds.has(question.questionId)) {
      errors.push(`${label}: questionId가 중복됩니다.`);
    } else {
      seenQuestionIds.add(question.questionId);
    }

    if (typeof question.sourceExcerptId !== "string" || question.sourceExcerptId.length === 0) {
      errors.push(`${label}: sourceExcerptId가 비어 있습니다.`);
    } else if (!/^[a-z0-9-]+-\d{3}$/.test(question.sourceExcerptId)) {
      errors.push(`${label}: sourceExcerptId가 'slug-001' 형식이 아닙니다.`);
    }

    if (typeof question.conceptGroup !== "string" || !conceptGroups.has(question.conceptGroup)) {
      errors.push(`${label}: conceptGroup '${question.conceptGroup}'가 conceptPools에 없습니다.`);
    }

    if (question.type === "multiple_choice") {
      if (!Array.isArray(question.choices) || question.choices.length !== 5) {
        errors.push(`${label}: multiple_choice choices는 정확히 5개여야 합니다.`);
      } else if (!question.choices.includes(question.answer)) {
        errors.push(`${label}: multiple_choice choices에 정답이 포함되어야 합니다.`);
      }
    }

    if (question.type === "fill_blank") {
      if (!Array.isArray(question.acceptedAnswers) || question.acceptedAnswers.length < 1) {
        errors.push(`${label}: fill_blank acceptedAnswers가 1개 이상이어야 합니다.`);
      }
    }
  }

  return errors;
}

const conceptPoolsSource = parseSource(conceptPoolsPath, await readFile(conceptPoolsPath, "utf8"));
const conceptGroups = findConceptPoolKeys(conceptPoolsSource);
const byPageFiles = (await readdir(questionsDir))
  .filter((fileName) => fileName.endsWith(".ts"))
  .map((fileName) => path.join(questionsDir, fileName));

const seenQuestionIds = new Set();
const seenSourceIds = new Set();
const errors = [];

for (const filePath of byPageFiles.sort()) {
  const sourceFile = parseSource(filePath, await readFile(filePath, "utf8"));
  const page = findExportedObject(sourceFile);
  errors.push(...validatePage(page, filePath, conceptGroups, seenQuestionIds, seenSourceIds));
}

if (errors.length > 0) {
  console.error(`문제 데이터 검증 실패 (${errors.length}개)`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`문제 데이터 검증 통과: ${byPageFiles.length}개 페이지, ${seenQuestionIds.size}개 문제`);
