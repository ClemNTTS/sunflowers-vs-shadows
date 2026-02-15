import type { Zone } from "./types";

export const DIRECTIONS = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
};

export const ZONES: Record<string, Zone> = {
  "meadow-1": {
    id: "meadow-1",
    name: "Meadow Zone",
    movesToBoss: 30,
    boss: {
      type: "BOSS",
      hp: 50,
      maxHp: 50,
      atk: 5,
      armor: 2,
    },
    baseMonsterHp: 5,
    baseMonsterAtk: 1,
  },
};
