export type EncounterRarity = "common" | "uncommon" | "rare" | "very-rare";

export type EncounterUnlockCondition =
  | "always"
  | "normal-pokedex-completed"
  | "legendary-birds-completed";

export interface RegionEncounterTier {
  rarity: EncounterRarity;
  ratePercent: number;
  speciesIds: string[];
}

export interface FixedRegionEncounter {
  speciesId: string;
  ratePercent: number;
  unlockCondition: EncounterUnlockCondition;
}

export interface RegionEncounterPool {
  regionId: string;
  tiers: RegionEncounterTier[];
  fixedEncounters: FixedRegionEncounter[];
}

export const regionEncounterPools: RegionEncounterPool[] = [
  {
    regionId: "sprout-field",
    tiers: [
      {
        rarity: "common",
        ratePercent: 64,
        speciesIds: ["bulbasaur", "caterpie", "weedle", "pidgey", "spearow", "oddish", "doduo"],
      },
      {
        rarity: "uncommon",
        ratePercent: 20,
        speciesIds: ["tangela", "scyther", "pinsir", "tauros"],
      },
      {
        rarity: "rare",
        ratePercent: 10,
        speciesIds: ["ivysaur", "metapod", "kakuna", "pidgeotto", "fearow", "gloom", "dodrio"],
      },
      {
        rarity: "very-rare",
        ratePercent: 4,
        speciesIds: ["venusaur", "butterfree", "beedrill", "pidgeot", "vileplume"],
      },
    ],
    fixedEncounters: [
      {
        speciesId: "ditto",
        ratePercent: 2,
        unlockCondition: "always",
      },
    ],
  },
  {
    regionId: "misty-shore",
    tiers: [
      {
        rarity: "common",
        ratePercent: 63,
        speciesIds: [
          "squirtle",
          "psyduck",
          "poliwag",
          "tentacool",
          "krabby",
          "exeggcute",
          "horsea",
          "goldeen",
          "magikarp",
        ],
      },
      {
        rarity: "uncommon",
        ratePercent: 20,
        speciesIds: ["farfetchd", "omanyte", "kabuto"],
      },
      {
        rarity: "rare",
        ratePercent: 10,
        speciesIds: [
          "wartortle",
          "golduck",
          "poliwhirl",
          "tentacruel",
          "kingler",
          "exeggutor",
          "seadra",
          "seaking",
        ],
      },
      {
        rarity: "very-rare",
        ratePercent: 4,
        speciesIds: ["blastoise", "poliwrath", "gyarados", "omastar", "kabutops"],
      },
    ],
    fixedEncounters: [
      {
        speciesId: "ditto",
        ratePercent: 2,
        unlockCondition: "always",
      },
      {
        speciesId: "zapdos",
        ratePercent: 1,
        unlockCondition: "normal-pokedex-completed",
      },
    ],
  },
  {
    regionId: "ashen-mountain",
    tiers: [
      {
        rarity: "common",
        ratePercent: 58,
        speciesIds: [
          "charmander",
          "sandshrew",
          "vulpix",
          "diglett",
          "growlithe",
          "machop",
          "geodude",
        ],
      },
      {
        rarity: "uncommon",
        ratePercent: 20,
        speciesIds: ["ponyta", "onix", "rhyhorn", "magmar"],
      },
      {
        rarity: "rare",
        ratePercent: 10,
        speciesIds: [
          "charmeleon",
          "sandslash",
          "ninetales",
          "dugtrio",
          "arcanine",
          "machoke",
          "graveler",
          "rapidash",
          "rhydon",
        ],
      },
      {
        rarity: "very-rare",
        ratePercent: 4,
        speciesIds: ["charizard", "machamp", "golem", "flareon", "aerodactyl"],
      },
    ],
    fixedEncounters: [
      {
        speciesId: "eevee",
        ratePercent: 5,
        unlockCondition: "always",
      },
      {
        speciesId: "ditto",
        ratePercent: 2,
        unlockCondition: "always",
      },
      {
        speciesId: "moltres",
        ratePercent: 1,
        unlockCondition: "normal-pokedex-completed",
      },
    ],
  },
  {
    regionId: "ghost-town",
    tiers: [
      {
        rarity: "common",
        ratePercent: 64,
        speciesIds: ["ekans", "nidoran-f", "nidoran-m", "zubat", "paras", "venonat"],
      },
      {
        rarity: "uncommon",
        ratePercent: 20,
        speciesIds: ["abra", "gastly", "drowzee", "cubone"],
      },
      {
        rarity: "rare",
        ratePercent: 10,
        speciesIds: [
          "arbok",
          "nidorina",
          "nidorino",
          "golbat",
          "parasect",
          "venomoth",
          "kadabra",
          "haunter",
          "hypno",
          "marowak",
        ],
      },
      {
        rarity: "very-rare",
        ratePercent: 4,
        speciesIds: ["nidoqueen", "nidoking", "alakazam", "gengar", "mr-mime"],
      },
    ],
    fixedEncounters: [
      {
        speciesId: "ditto",
        ratePercent: 2,
        unlockCondition: "always",
      },
    ],
  },
  {
    regionId: "sky-garden",
    tiers: [
      {
        rarity: "common",
        ratePercent: 58,
        speciesIds: ["clefairy", "jigglypuff", "slowpoke", "seel", "shellder", "staryu", "dratini"],
      },
      {
        rarity: "uncommon",
        ratePercent: 20,
        speciesIds: ["lickitung", "chansey", "jynx", "lapras"],
      },
      {
        rarity: "rare",
        ratePercent: 10,
        speciesIds: ["clefable", "wigglytuff", "slowbro", "dewgong", "dragonair"],
      },
      {
        rarity: "very-rare",
        ratePercent: 4,
        speciesIds: ["cloyster", "starmie", "vaporeon", "dragonite"],
      },
    ],
    fixedEncounters: [
      {
        speciesId: "eevee",
        ratePercent: 5,
        unlockCondition: "always",
      },
      {
        speciesId: "ditto",
        ratePercent: 2,
        unlockCondition: "always",
      },
      {
        speciesId: "articuno",
        ratePercent: 1,
        unlockCondition: "normal-pokedex-completed",
      },
    ],
  },
  {
    regionId: "neon-city",
    tiers: [
      {
        rarity: "common",
        ratePercent: 58,
        speciesIds: [
          "rattata",
          "pikachu",
          "meowth",
          "mankey",
          "bellsprout",
          "magnemite",
          "grimer",
          "voltorb",
          "koffing",
        ],
      },
      {
        rarity: "uncommon",
        ratePercent: 20,
        speciesIds: ["hitmonlee", "hitmonchan", "kangaskhan", "electabuzz"],
      },
      {
        rarity: "rare",
        ratePercent: 10,
        speciesIds: [
          "raticate",
          "raichu",
          "persian",
          "primeape",
          "weepinbell",
          "magneton",
          "muk",
          "electrode",
          "weezing",
        ],
      },
      {
        rarity: "very-rare",
        ratePercent: 4,
        speciesIds: ["victreebel", "jolteon", "porygon", "snorlax"],
      },
    ],
    fixedEncounters: [
      {
        speciesId: "eevee",
        ratePercent: 5,
        unlockCondition: "always",
      },
      {
        speciesId: "ditto",
        ratePercent: 2,
        unlockCondition: "always",
      },
      {
        speciesId: "mewtwo",
        ratePercent: 1,
        unlockCondition: "legendary-birds-completed",
      },
    ],
  },
];
