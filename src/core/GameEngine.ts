import { GridView } from "../view/GridView";
import { createStatsDiv, updatePlayerStats } from "../view/StatsRender";
import { DIRECTIONS, VOID_PULSE } from "./constants";
import { Grid } from "./Grid";
import * as PIXI from "pixi.js";
import type { Entity, Zone, Upgrade } from "./types";
import { UpgradeHandler } from "./UpgradeHandler";
import {
  setOverlayEvents,
  showGameOverScreen,
  showUpgradeScreen,
  showVictoryScreen,
  updateMenuUI,
} from "../view/utils";
import type { MetaManager } from "./MetaManager";

export class GameEngine {
  private grid: Grid;
  public gridViewer: GridView;
  private upgradeHandler: UpgradeHandler;
  private isPaused: boolean = false;
  private readonly difficultyMultiplier: number;
  public remainingMoves: number;
  private metadataManager: MetaManager;
  private zone: Zone;
  private boundInputListener: ((e: KeyboardEvent) => void) | null = null;
  public activeDangerZones: PIXI.Graphics[] = [];
  public bossFightTimer: number | null = null;

  constructor(
    app: PIXI.Application,
    difficultyMultiplier: number,
    metadataManager: MetaManager,
    zone: Zone,
  ) {
    this.metadataManager = metadataManager;
    const metadata = metadataManager.getStats();
    this.grid = new Grid(metadata);
    this.gridViewer = new GridView(app);
    this.upgradeHandler = new UpgradeHandler(this.grid.player);
    this.difficultyMultiplier = difficultyMultiplier;
    this.remainingMoves = zone.movesToBoss;
    this.zone = zone;
  }

  public start() {
    setOverlayEvents(this);
    this.grid.init();
    this.gridViewer.drawBackground(this.grid);
    this.gridViewer.renderEntities(this.grid);
    createStatsDiv();
    this.refreshView();
    this.setupInputs();
    console.log(this.grid);
  }

  public getGrid(): Grid {
    return this.grid;
  }

  public refreshView() {
    this.gridViewer.renderEntities(this.grid);
    updatePlayerStats(this);
  }

  private applyTriggers(trigger: Upgrade["trigger"], context?: any) {
    const player = this.grid.player;
    if (!player || !player.upgrades) return;

    player.upgrades.forEach((upgrade) => {
      if (upgrade.trigger === trigger) {
        upgrade.effect(player, context);
      }
    });
  }

  private setupInputs() {
    this.boundInputListener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        this.isPaused = !this.isPaused;
      }
      if (this.isPaused) return;

      let direction;
      if (event.key === "ArrowUp") direction = DIRECTIONS.UP;
      if (event.key === "ArrowDown") direction = DIRECTIONS.DOWN;
      if (event.key === "ArrowLeft") direction = DIRECTIONS.LEFT;
      if (event.key === "ArrowRight") direction = DIRECTIONS.RIGHT;

      if (!direction) return;

      const playerPos = this.grid.getPlayerPosition();
      if (!playerPos) return;

      const targetX = playerPos.x + direction.dx;
      const targetY = playerPos.y + direction.dy;
      const targetCell = this.grid.getValue(targetX, targetY);

      if (targetCell?.type === "MONSTER" || targetCell?.type === "BOSS") {
        this.applyTriggers("onCombatStart", { opponent: targetCell });
      }

      const moved = this.grid.movePlayer(direction);

      if (this.grid.player.hp <= 0) {
        this.handleGameOver("You have been defeated.");
        return;
      }

      if (moved) {
        if (moved.moved) {
          this.applyTriggers("onMove");
          if (
            (moved.type === "MONSTER" || moved.type === "BOSS") &&
            targetCell
          ) {
            this.applyTriggers("onKill", { killed: targetCell });
            this.grid.player.xp =
              (this.grid.player.xp || 0) +
              Math.round(4 * (1 + this.difficultyMultiplier / 10));
          }
        }

        if (moved.type === "XP") {
          this.applyTriggers("onCollectXp");
        }

        this.processBossTurn();
      }

      const entities = this.grid.getEntities();
      const bossStillAlive = entities.some((e) => e.entity.type === "BOSS");

      if (this.remainingMoves === 0 && !bossStillAlive) {
        this.handleZoneWin();
        return;
      }

      if (this.grid.player) {
        this.handleLevelUp(this.grid.player);
      } else {
        console.log("⚠️ Warning : No player detected !");
      }

      if (moved && moved.moved) {
        if (this.bossFightTimer !== null) {
          this.bossFightTimer--;
          if (this.bossFightTimer <= 0 && bossStillAlive) {
            this.handleGameOver("You ran out of time to defeat the boss.");
            return;
          }
        } else {
          this.remainingMoves = Math.max(0, this.remainingMoves - 1);
          if (this.remainingMoves === 0) {
            this.spawnBoss();
          } else {
            this.spawnRandomEntity();
          }
        }
      }

      this.refreshView();
      if (moved && moved?.damageDealt > 0) {
        const pxX = this.gridViewer.gridToPixels(moved.targetPos.x);
        const pxY = this.gridViewer.gridToPixels(moved.targetPos.y);

        this.gridViewer.showPopupText(
          pxX,
          pxY,
          `-${moved.damageDealt}`,
          0xe74c3c,
        );
      }
    };
    window.addEventListener("keydown", this.boundInputListener);
  }

  private spawnRandomEntity() {
    const emptyCells = this.grid.getEmptyCells();
    if (emptyCells.length > 0) {
      const { x, y } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const type = Math.random() < 0.3 ? "MONSTER" : "XP";
      let newEntity: Entity | null = null;
      if (type === "XP") {
        newEntity = { type, hp: 1, atk: 0, armor: 0 };
        this.grid.setValue(x, y, newEntity);
      } else if (type === "MONSTER") {
        newEntity = {
          type,
          hp: Math.round(4 * (1 + this.difficultyMultiplier / 10)),
          atk: Math.round(2 * (1 + this.difficultyMultiplier / 10)),
          armor: Math.round(0 * (1 + this.difficultyMultiplier / 10)),
          maxHp: Math.round(4 * (1 + this.difficultyMultiplier / 10)),
        };
        this.grid.setValue(x, y, newEntity);
      }
      if (newEntity) {
        this.applyTriggers("onNewEntity", { newEntity });
      }
    }
  }

  public PauseToggle() {
    this.isPaused = !this.isPaused;
  }

  private handleLevelUp(player: Entity) {
    if (!player.xp || !player.level) return;
    if (player.xp >= player.level * 5) {
      this.isPaused = true;
      player.level += 1;
      player.xp = 0;
      const rolledUpgrades = this.upgradeHandler.rollThreeUpgrades();
      this.applyTriggers("onLevelUp");
      showUpgradeScreen(rolledUpgrades, (upgrade) => {
        this.upgradeHandler.addUpgrade(upgrade);
        if (upgrade.trigger === "onLevelUp" || upgrade.trigger === "passive") {
          upgrade.effect(player);
        }
        this.isPaused = false;
        this.refreshView();
      });
    }
  }

  public getRemainingMoves(): number {
    return this.remainingMoves;
  }

  private handleGameOver(message: string) {
    this.isPaused = true;
    showGameOverScreen(message, () => {
      this.exitToMenu();
    });
  }

  private handleZoneWin() {
    this.isPaused = true;
    const zoneId = this.zone.id;
    const nextLevel = this.metadataManager.getZoneProgress(zoneId) + 1;
    this.metadataManager.setZoneProgress(zoneId, nextLevel);
    showVictoryScreen((statId) => {
      const value = statId === "baseHp" ? 2 : 1;
      this.metadataManager.updateStat(statId as any, value);
      this.exitToMenu();
    });
  }

  private exitToMenu() {
    this.destroy();
    const mainMenu = document.getElementById("main-menu");
    if (mainMenu) {
      mainMenu.style.display = "block";
      updateMenuUI();
    }
  }

  public destroy() {
    if (this.boundInputListener) {
      window.removeEventListener("keydown", this.boundInputListener);
    }
    this.gridViewer.destroy();
    const statsContainer = document.getElementById("stats-container");
    if (statsContainer) statsContainer.remove();
  }

  private spawnBoss() {
    this.bossFightTimer = Math.floor(this.zone.movesToBoss);
    const emptyCells = this.grid.getEmptyCells();
    if (emptyCells.length > 0) {
      const { x, y } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const bossData = { ...this.zone.boss };

      bossData.hp = Math.round(
        bossData.hp * (1 + this.difficultyMultiplier / 5),
      );
      bossData.maxHp = bossData.hp;
      bossData.atk = Math.round(
        bossData.atk * (1 + this.difficultyMultiplier / 10),
      );

      bossData.actionCount = 0;
      bossData.actions = [VOID_PULSE];
      this.grid.setValue(x, y, bossData);
      this.applyTriggers("onNewEntity", { newEntity: bossData });
    }
  }

  private processBossTurn() {
    const entities = this.grid.getEntities();
    const bossEntry = entities.find((e) => e.entity.type === "BOSS");
    if (bossEntry) {
      const boss = bossEntry.entity;
      boss.actionCount = (boss.actionCount || 0) + 1;
      const currentAction = boss.actions?.[0];
      if (currentAction) {
        if (boss.actionCount === currentAction.cooldown - 1) {
          currentAction.preview?.(this, { x: bossEntry.x, y: bossEntry.y });
        }
        if (boss.actionCount >= currentAction.cooldown) {
          currentAction.execute(this, { x: bossEntry.x, y: bossEntry.y });
          boss.actionCount = 0;
        }
      }
    }
  }
}
