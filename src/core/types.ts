export type EntityType = "PLAYER" | "MONSTER" | "XP" | "POTION";

export interface Entity {
  type: EntityType;
  hp: number;
  atk: number;
  armor: number;
  level?: number;
  xp?: number;
}

export type Cell = Entity | null;
