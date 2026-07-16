import { describe, expect, it } from "vitest";
import { getAllSpecies } from "@/content/pokemon";
import { resolveActivePokemon } from "@/core/activePokemon";
import type { PokemonInstance } from "@/core/types";

const instance: PokemonInstance = {
  instanceId: "active-instance",
  speciesId: "pikachu",
  currentStage: 1,
  exp: 50,
  totalCorrectCount: 10,
  graduated: false,
  evolutionPending: false,
};

describe("resolveActivePokemon", () => {
  it("활성 인스턴스와 해당 포켓몬 종을 함께 반환", () => {
    const result = resolveActivePokemon({
      activeInstanceId: instance.instanceId,
      instances: [instance],
      allSpecies: getAllSpecies(),
    });

    expect(result.activeInstance).toEqual(instance);
    expect(result.activeSpecies?.speciesId).toBe("pikachu");
  });

  it("활성 인스턴스가 없으면 두 값을 모두 null로 반환", () => {
    expect(
      resolveActivePokemon({
        activeInstanceId: null,
        instances: [instance],
        allSpecies: getAllSpecies(),
      }),
    ).toEqual({
      activeInstance: null,
      activeSpecies: null,
    });
  });
});
