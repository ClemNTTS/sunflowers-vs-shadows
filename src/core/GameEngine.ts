import { GridView } from "../view/GridView";
import { createStatsDiv, updatePlayerStats } from "../view/StatsRender";
import { DIRECTIONS } from "./constants";
import { Grid } from "./Grid";
import * as PIXI from "pixi.js";
import type { Entity } from "./types";
import { UpgradeHandler } from "./UpgradeHandler";
import { setOverlayEvents, showUpgradeScreen } from "../view/utils";

export class GameEngine {
  private grid: Grid;
  private gridViewer: GridView;
  private upgradeHandler: UpgradeHandler;
  private isPaused: boolean = false;
  private readonly difficultyMultiplier: number;

  constructor(app: PIXI.Application, difficultyMultiplier: number) {
    this.grid = new Grid();
    this.gridViewer = new GridView(app);
    this.upgradeHandler = new UpgradeHandler(this.grid.player);
    this.difficultyMultiplier = difficultyMultiplier;
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
    window.addEventListener("keydown", (event) => {
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
        this.spawnRandomEntity();
      }

      //LEVEL-UP
      if (this.grid.player) {
        this.handleLevelUp(this.grid.player);
      } else {
        console.log("⚠️ Warning : No player detected !");
      }

      //RENDERING
      this.refreshView();
      if (moved && moved?.damageDealt > 0) {
        this.gridViewer.showPopupText(
          moved.targetPos.x * (this.gridViewer.tileSize + 10) +
            this.gridViewer.tileSize / 2,
          moved.targetPos.y * (this.gridViewer.tileSize + 10) +
            this.gridViewer.tileSize / 2,
          `-${moved.damageDealt}`,
          0xe74c3c,
        );
      }
    });
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
          hp: 5,
          atk: 1,
          armor: 0,
          maxHp: 5,
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
        if (upgrade.trigger === "onLevelUp" || "passive") {
          upgrade.effect(player);
        }
        this.isPaused = false;
        this.refreshView();
      });
    }
  }
}
