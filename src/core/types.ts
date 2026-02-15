import type { GameEngine } from "./GameEngine";

export type EntityType = "PLAYER" | "MONSTER" | "BOSS" | "XP" | "POTION";

export interface Zone {
  id: string;
  name: string;
  movesToBoss: number;
  boss: Entity;
  baseMonsterHp: number;
  baseMonsterAtk: number;
}

export interface Entity {
  type: EntityType;
  hp: number;
  atk: number;
  armor: number;
  level?: number;
  xp?: number;
  maxHp?: number;
  bonusHeal?: number;
  upgrades?: Upgrade[];
  actionCount?: number;
  actions?: BossAction[];
  currentActionIndex?: number;
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
  permanentStats: PermanentStats;
  zones: {
    [zoneId: string]: number;
  };
}

export interface PermanentStats {
  baseHp: number;
  baseAtk: number;
  baseArmor: number;
  baseHealBonus: number;
}

export interface BossAction {
  id: string;
  cooldown: number; // Tous les combien de tours ?
  description: string;
  execute: (game: GameEngine, bossPos: { x: number; y: number }) => void;
  preview?: (game: GameEngine, bossPos: { x: number; y: number }) => void; // Pour prévenir le joueur au tour d'avant
}
