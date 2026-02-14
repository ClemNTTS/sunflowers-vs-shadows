import { GridView } from "../view/GridView";
import { DIRECTIONS } from "./constants";
import { Grid } from "./Grid";
import * as PIXI from "pixi.js";

export class GameEngine {
  private grid: Grid;
  private gridViewer: GridView;

  constructor(app: PIXI.Application) {
    this.grid = new Grid();
    this.gridViewer = new GridView(app);
  }

  public start() {
    this.grid.init();
    this.gridViewer.drawBackground(this.grid);
    this.gridViewer.renderEntities(this.grid);
    this.setupInputs();
    console.log(this.grid);
  }

  public getGrid(): Grid {
    return this.grid;
  }

  public refreshView() {
    this.gridViewer.renderEntities(this.grid);
  }

  private setupInputs() {
    window.addEventListener("keydown", (event) => {
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
      this.grid.setValue(x, y, { type, hp: 5, atk: 1, armor: 0 });
    }
  }
}
