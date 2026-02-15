export type EntityType = "PLAYER" | "MONSTER" | "XP" | "POTION";

export interface Entity {
  type: EntityType;
  hp: number;
  atk: number;
  armor: number;
  level?: number;
  xp?: number;
  maxHp?: number;
  upgrades?: Upgrade[];
}

export type Cell = Entity | null;

export type Direction = { dx: number; dy: number };

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  trigger:
    | "onMove"
    | "onKill"
    | "onCollectXp"
    | "passive"
    | "onCombatStart"
    | "onLevelUp"
    | "onNewEntity";
  effect: (player: Entity, context?: any) => void;
  iconPath?: string;
}

export interface MetaData {
  permanentStats: {
    baseHp: number;
    baseAtk: number;
    baseArmor: number;
    baseHealBonus: number;
  };
  zones: {
    [zoneId: string]: number;
  };
}
