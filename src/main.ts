import * as PIXI from "pixi.js";
import { GameEngine } from "./core/GameEngine";

const app = new PIXI.Application();
const gameEngine = new GameEngine(app);

async function init() {
  await app.init({
    width: 800,
    height: 800,
    backgroundColor: 0x101010,
  });
  document.body.appendChild(app.canvas);
}

init();
gameEngine.start();
