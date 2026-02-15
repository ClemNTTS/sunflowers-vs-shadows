import { GridView } from "../view/GridView";
import { createStatsDiv, updatePlayerStats } from "../view/StatsRender";
import { DIRECTIONS, VOID_PULSE } from "./constants";
import { Grid } from "./Grid";
import * as PIXI from "pixi.js";
import type { Entity, Zone } from "./types";
import { UpgradeHandler } from "./UpgradeHandler";
import {
  setOverlayEvents,
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
  private remainingMoves: number;
  private metadataManager: MetaManager;
  private zone: Zone;
  private boundInputListener: ((e: KeyboardEvent) => void) | null = null;

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

  private setupInputs() {
    this.boundInputListener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        this.isPaused = !this.isPaused;
      }
      if (this.isPaused) return;

      let moved;
      if (event.key === "ArrowUp") moved = this.grid.movePlayer(DIRECTIONS.UP);
      if (event.key === "ArrowDown")
        moved = this.grid.movePlayer(DIRECTIONS.DOWN);
      if (event.key === "ArrowLeft")
        moved = this.grid.movePlayer(DIRECTIONS.LEFT);
      if (event.key === "ArrowRight")
        moved = this.grid.movePlayer(DIRECTIONS.RIGHT);
      if (moved) {
        this.processBossTurn();
      }

      //BOSS wining check
      const entities = this.grid.getEntities();
      const bossStillAlive = entities.some((e) => e.entity.type === "BOSS");

      if (this.remainingMoves === 0 && !bossStillAlive) {
        this.handleZoneWin();
        return;
      }

      //LEVEL-UP
      if (this.grid.player) {
        this.handleLevelUp(this.grid.player);
      } else {
        console.log("⚠️ Warning : No player detected !");
      }

      //REMAINING MOVES
      if (moved && moved.moved) {
        this.remainingMoves = Math.max(0, this.remainingMoves - 1);

        if (this.remainingMoves === 0 && !bossStillAlive) {
          this.spawnBoss();
        } else {
          this.spawnRandomEntity();
        }
      }

      //RENDERING
      this.refreshView();
      if (moved && moved?.damageDealt > 0) {
        this.gridViewer.showPopupText(
          this.gridViewer.tileSize +
            this.gridViewer.gridToPixels(moved.targetPos.x),
          this.gridViewer.gridToPixels(moved.targetPos.y),
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
      if (type === "XP") {
        this.grid.setValue(x, y, { type, hp: 1, atk: 0, armor: 0 });
        return;
      } else if (type === "MONSTER") {
        this.grid.setValue(x, y, {
          type,
          hp: Math.round(5 * (1 + this.difficultyMultiplier / 10)),
          atk: Math.round(2 * (1 + this.difficultyMultiplier / 10)),
          armor: Math.round(0 * (1 + this.difficultyMultiplier / 10)),
          maxHp: Math.round(5 * (1 + this.difficultyMultiplier / 10)),
        });
        return;
      }
      this.grid.setValue(x, y, null);
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
    const emptyCells = this.grid.getEmptyCells();
    if (emptyCells.length > 0) {
      const { x, y } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const bossData = { ...this.zone.boss };

      bossData.actionCount = 0;
      bossData.actions = [VOID_PULSE];

      this.grid.setValue(x, y, bossData);
    }
  }

  private processBossTurn() {
    const entities = this.grid.getEntities();
    const bossEntry = entities.find((e) => e.entity.type === "BOSS");

    if (bossEntry) {
      const boss = bossEntry.entity;
      boss.actionCount = (boss.actionCount || 0) + 1;

      const currentAction = boss.actions?.[0]; // On prend la première action pour l'instant
      if (currentAction && boss.actionCount >= currentAction.cooldown) {
        currentAction.execute(this, { x: bossEntry.x, y: bossEntry.y });
        boss.actionCount = 0;
      }
    }
  }
}
