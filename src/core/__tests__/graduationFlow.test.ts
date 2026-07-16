import { describe, expect, it } from "vitest";
import { getGraduationSelectionErrorMessage, resolveGraduationFlow } from "@/core/graduationFlow";
import type { PokemonSpecies } from "@/content/pokemon/types";
import type { PokemonInstance } from "@/core/types";

function species(overrides: Partial<PokemonSpecies>): PokemonSpecies {
  return {
    speciesId: "filler",
    dexNumber: 0,
    nameKo: "더미",
    nameEn: "Dummy",
    category: "normal",
    isStarter: false,
    evolutionStage: 1,
    evolutionLine: ["filler"],
    nextEvolutionSpeciesId: null,
    branchEvolutionSpeciesIds: [],
    ...overrides,
  };
}

function instance(overrides: Partial<PokemonInstance>): PokemonInstance {
  return {
    instanceId: "instance-1",
    speciesId: "rattata",
    currentStage: 1,
    exp: 50,
    totalCorrectCount: 10,
    graduated: false,
    evolutionPending: false,
    ...overrides,
  };
}

const rattata = species({ speciesId: "rattata", nameKo: "꼬렛", dexNumber: 19 });
const pidgey = species({ speciesId: "pidgey", nameKo: "구구", dexNumber: 16 });
const spearow = species({ speciesId: "spearow", nameKo: "깨비참", dexNumber: 21 });
const mew = species({
  speciesId: "mew",
  nameKo: "뮤",
  dexNumber: 151,
  category: "legendary",
});

const allSpecies = [rattata, pidgey, spearow, mew];

describe("resolveGraduationFlow", () => {
  it("대기 중인 졸업 인스턴스가 없으면 빈 졸업 상태 반환", () => {
    const result = resolveGraduationFlow({
      pendingGraduationInstanceId: null,
      instances: [instance({})],
      unlockedSpeciesIds: [],
      legendaryStage: "none",
      allSpecies,
    });

    expect(result.graduatedInstance).toBeNull();
    expect(result.graduatedSpecies).toBeNull();
    expect(result.graduationCandidates).toEqual([]);
    expect(result.autoGraduationCandidate).toBeNull();
    expect(result.showGraduationModal).toBe(false);
  });

  it("후보가 1마리면 자동 해금 후보로 반환하고 모달은 열지 않음", () => {
    const result = resolveGraduationFlow({
      pendingGraduationInstanceId: "instance-1",
      instances: [instance({})],
      unlockedSpeciesIds: ["rattata", "pidgey"],
      legendaryStage: "none",
      allSpecies,
    });

    expect(result.graduatedSpecies?.speciesId).toBe("rattata");
    expect(result.autoGraduationCandidate?.speciesId).toBe("spearow");
    expect(result.showGraduationModal).toBe(false);
  });

  it("후보가 여러 마리면 선택 모달 대상 상태를 반환", () => {
    const result = resolveGraduationFlow({
      pendingGraduationInstanceId: "instance-1",
      instances: [instance({})],
      unlockedSpeciesIds: ["rattata"],
      legendaryStage: "none",
      allSpecies,
    });

    expect(result.graduationCandidates.map((species) => species.speciesId).sort()).toEqual([
      "pidgey",
      "spearow",
    ]);
    expect(result.autoGraduationCandidate).toBeNull();
    expect(result.showGraduationModal).toBe(true);
  });

  it("뮤 졸업은 자동 해금이나 후보 모달을 띄우지 않음", () => {
    const result = resolveGraduationFlow({
      pendingGraduationInstanceId: "mew-instance",
      instances: [instance({ instanceId: "mew-instance", speciesId: "mew", exp: 100 })],
      unlockedSpeciesIds: ["rattata", "pidgey", "spearow", "mew"],
      legendaryStage: "mew",
      allSpecies,
    });

    expect(result.isMewGraduating).toBe(true);
    expect(result.autoGraduationCandidate).toBeNull();
    expect(result.showGraduationModal).toBe(false);
  });
});

describe("getGraduationSelectionErrorMessage", () => {
  it("인증 오류를 세션 만료 안내로 변환", () => {
    expect(getGraduationSelectionErrorMessage(new Error("JWT authentication failed"))).toBe(
      "로그인 세션이 만료됐을 수 있어요. 새로고침 후 다시 시도해주세요.",
    );
  });

  it("네트워크 오류를 재시도 안내로 변환", () => {
    expect(getGraduationSelectionErrorMessage({ message: "Failed to fetch" })).toBe(
      "네트워크 연결이 불안정해요. 잠시 후 다시 시도해주세요.",
    );
  });

  it("서버 메시지가 있으면 기본 안내 뒤에 보존", () => {
    expect(getGraduationSelectionErrorMessage(new Error("candidate is locked"))).toBe(
      "다음 포켓몬을 시작하지 못했어요. candidate is locked",
    );
  });

  it("메시지를 확인할 수 없으면 기본 안내를 반환", () => {
    expect(getGraduationSelectionErrorMessage(null)).toBe(
      "다음 포켓몬을 시작하지 못했어요. 잠시 후 다시 시도해주세요.",
    );
  });
});
