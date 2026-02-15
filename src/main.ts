import * as PIXI from "pixi.js";
import { GameEngine } from "./core/GameEngine";
import { MetaManager } from "./core/MetaManager";
import { ZONES } from "./core/constants";
import { updateMenuUI } from "./view/utils";

const app = new PIXI.Application();
const metaManager = new MetaManager();

async function init() {
  await app.init({
    width: 800,
    height: 800,
    backgroundColor: 0x101010,
  });
  document.body.appendChild(app.canvas);
  const mainMenu = document.getElementById("main-menu");

  const meadowZone = document.getElementById("meadow-zone");
  if (meadowZone) {
    meadowZone.addEventListener("click", () => {
      if (mainMenu) {
        mainMenu.style.display = "none";
      }

      const difficultyMultiplier = metaManager.getZoneProgress("meadow-1");
      const gameEngine = new GameEngine(
        app,
        difficultyMultiplier,
        metaManager,
        ZONES["meadow-1"],
      );
      gameEngine.start();
    });
  }

  updateMenuUI();
}

init();
