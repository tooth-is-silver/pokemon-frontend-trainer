import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const rootDir = process.cwd();
const pokemonDir = path.join(rootDir, "src/content/pokemon");
const speciesFiles = ["starters.ts", "gen1-normal.ts", "legendary.ts"];
const TOTAL_DEX = 151;
const LEGENDARY_DEX_NUMBERS = new Set([144, 145, 146, 150, 151]);

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

  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }

  if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }

  if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }

  if (node.kind === ts.SyntaxKind.NullKeyword) {
    return null;
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

function findExportedSpeciesArray(sourceFile) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (declaration.initializer && ts.isArrayLiteralExpression(declaration.initializer)) {
        return toValue(declaration.initializer);
      }
    }
  }

  return [];
}

function addDuplicateError(errors, seen, key, label, value) {
  if (seen.has(value)) {
    errors.push(`${label}: ${key} '${value}'가 중복됩니다.`);
  } else {
    seen.add(value);
  }
}

const species = [];

for (const fileName of speciesFiles) {
  const filePath = path.join(pokemonDir, fileName);
  const sourceFile = parseSource(filePath, await readFile(filePath, "utf8"));
  species.push(...findExportedSpeciesArray(sourceFile));
}

const errors = [];
const seenDexNumbers = new Set();
const seenSpeciesIds = new Set();
const byId = new Map();

for (const item of species) {
  const label = item?.speciesId ?? "(missing speciesId)";

  if (typeof item.speciesId !== "string" || item.speciesId.length === 0) {
    errors.push("speciesId가 비어 있는 포켓몬이 있습니다.");
    continue;
  }

  addDuplicateError(errors, seenSpeciesIds, "speciesId", label, item.speciesId);
  byId.set(item.speciesId, item);

  if (!Number.isInteger(item.dexNumber) || item.dexNumber < 1 || item.dexNumber > TOTAL_DEX) {
    errors.push(`${label}: dexNumber는 1~${TOTAL_DEX} 범위의 정수여야 합니다.`);
  } else {
    addDuplicateError(errors, seenDexNumbers, "dexNumber", label, item.dexNumber);
  }

  if (item.category === "legendary" && !LEGENDARY_DEX_NUMBERS.has(item.dexNumber)) {
    errors.push(`${label}: legendary category지만 전설 dexNumber가 아닙니다.`);
  }

  if (item.category === "normal" && LEGENDARY_DEX_NUMBERS.has(item.dexNumber)) {
    errors.push(`${label}: 전설 dexNumber는 normal category일 수 없습니다.`);
  }

  if (!Array.isArray(item.evolutionLine) || item.evolutionLine.length === 0) {
    errors.push(`${label}: evolutionLine이 비어 있습니다.`);
  }

  if (!Array.isArray(item.branchEvolutionSpeciesIds)) {
    errors.push(`${label}: branchEvolutionSpeciesIds는 배열이어야 합니다.`);
  }
}

for (let dexNumber = 1; dexNumber <= TOTAL_DEX; dexNumber += 1) {
  if (!seenDexNumbers.has(dexNumber)) {
    errors.push(`dexNumber ${dexNumber} 데이터가 없습니다.`);
  }
}

for (const item of species) {
  const label = item.speciesId;
  const lineIds = item.evolutionLine ?? [];

  for (const lineSpeciesId of lineIds) {
    if (!byId.has(lineSpeciesId)) {
      errors.push(`${label}: evolutionLine의 '${lineSpeciesId}'가 존재하지 않습니다.`);
    }
  }

  if (item.nextEvolutionSpeciesId !== null) {
    const next = byId.get(item.nextEvolutionSpeciesId);
    if (!next) {
      errors.push(`${label}: nextEvolutionSpeciesId '${item.nextEvolutionSpeciesId}'가 존재하지 않습니다.`);
    } else if (!next.evolutionLine.includes(item.speciesId)) {
      errors.push(`${label}: 다음 진화체 '${next.speciesId}'의 evolutionLine에 현재 종이 없습니다.`);
    } else if (next.evolutionStage <= item.evolutionStage) {
      errors.push(`${label}: 다음 진화체 '${next.speciesId}'의 evolutionStage가 현재보다 커야 합니다.`);
    }
  }

  for (const branchSpeciesId of item.branchEvolutionSpeciesIds ?? []) {
    const branch = byId.get(branchSpeciesId);
    if (!branch) {
      errors.push(`${label}: branchEvolutionSpeciesIds의 '${branchSpeciesId}'가 존재하지 않습니다.`);
    } else if (!branch.evolutionLine.includes(item.speciesId)) {
      errors.push(`${label}: 분기 진화체 '${branch.speciesId}'의 evolutionLine에 현재 종이 없습니다.`);
    }
  }

  if (lineIds.includes(item.speciesId)) {
    const ownIndex = lineIds.indexOf(item.speciesId);
    const expectedStage = ownIndex + 1;
    if ((item.branchEvolutionSpeciesIds ?? []).length === 0 && item.evolutionStage !== expectedStage) {
      errors.push(`${label}: evolutionStage ${item.evolutionStage}가 evolutionLine 위치 ${expectedStage}와 다릅니다.`);
    }
  }
}

if (errors.length > 0) {
  console.error(`포켓몬 데이터 검증 실패 (${errors.length}개)`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`포켓몬 데이터 검증 통과: ${species.length}종, dexNumber 1~${TOTAL_DEX}`);
