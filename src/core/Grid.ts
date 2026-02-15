import type {
  Cell,
  Direction,
  Entity,
  EntityType,
  PermanentStats,
} from "./types";

export class Grid {
  private readonly cells: Cell[][];
  public readonly size: number = 4;
  public player: Entity;

  constructor(metadata: PermanentStats) {
    this.cells = this.createEmptyGrid();
    const sunflower: Entity = {
      type: "PLAYER",
      hp: metadata.baseHp,
      atk: metadata.baseAtk,
      armor: metadata.baseArmor,
      bonusHeal: metadata.baseHealBonus,
      level: 1,
      xp: 0,
      maxHp: metadata.baseHp,
      upgrades: [],
    };
    this.player = sunflower;
  }

  public init() {
    const emptyCells = this.getEmptyCells();

    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const { x, y } = emptyCells[randomIndex];
      this.setValue(x, y, this.player);
    }
  }

  private createEmptyGrid(): Cell[][] {
    return Array.from({ length: this.size }, () => Array(this.size).fill(null));
  }

  public isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  public getValue(x: number, y: number): Cell {
    if (!this.isWithinBounds(x, y)) return null;
    return this.cells[y][x];
  }

  public setValue(x: number, y: number, value: Cell): void {
    if (!this.isWithinBounds(x, y)) return;
    this.cells[y][x] = value;
  }

  public getEmptyCells(): { x: number; y: number }[] {
    let emptyCells: { x: number; y: number }[] = [];
    this.cells.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === null) {
          emptyCells.push({ x, y });
        }
      });
    });
    return emptyCells;
  }

  public getEntities(): { x: number; y: number; entity: Entity }[] {
    let entities: { x: number; y: number; entity: Entity }[] = [];
    this.cells.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== null) {
          entities.push({ x, y, entity: cell });
        }
      });
    });
    return entities;
  }

  public movePlayer(direction: Direction): {
    moved: boolean;
    damageDealt: number;
    targetPos: { x: number; y: number };
    type: EntityType;
  } | null {
    const entities = this.getEntities();
    const playerEntry = entities.find(
      (entity) => entity.entity.type === "PLAYER",
    );
    if (!playerEntry) return null;

    const newX = playerEntry.x + direction.dx;
    const newY = playerEntry.y + direction.dy;

    if (this.isWithinBounds(newX, newY)) {
      const targetCell = this.getValue(newX, newY);
      if (targetCell === null) {
        this.setValue(playerEntry.x, playerEntry.y, null);
        this.setValue(newX, newY, playerEntry.entity);
        return {
          moved: true,
          damageDealt: 0,
          targetPos: { x: newX, y: newY },
          type: "PLAYER",
        };
      } else if (targetCell.type === "MONSTER") {
        targetCell.hp = Math.max(0, targetCell.hp - playerEntry.entity.atk);
        playerEntry.entity.hp = Math.max(
          0,
          playerEntry.entity.hp - targetCell.atk,
        );
        if (targetCell.hp <= 0) {
          this.setValue(playerEntry.x, playerEntry.y, null);
          this.setValue(newX, newY, playerEntry.entity);
          return {
            moved: true,
            damageDealt: playerEntry.entity.atk,
            targetPos: { x: newX, y: newY },
            type: "MONSTER",
          };
        }
        return {
          moved: false,
          damageDealt: playerEntry.entity.atk,
          targetPos: { x: newX, y: newY },
          type: "MONSTER",
        };
      } else if (targetCell.type === "XP") {
        playerEntry.entity.xp = (playerEntry.entity.xp || 0) + 1;
        this.setValue(playerEntry.x, playerEntry.y, null);
        this.setValue(newX, newY, playerEntry.entity);
        return {
          moved: true,
          damageDealt: 0,
          targetPos: { x: newX, y: newY },
          type: "XP",
        };
      } else {
        return null;
      }
    }
    return null;
  }
}
