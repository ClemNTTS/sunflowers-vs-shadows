export type EntityType = "PLAYER" | "MONSTER" | "XP" | "POTION";

export interface Entity {
  type: EntityType;
  hp: number;
  atk: number;
  armor: number;
  level?: number;
  xp?: number;
  maxHp?: number;
}

export type Cell = Entity | null;

export type Direction = { dx: number; dy: number };
