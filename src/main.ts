import * as PIXI from "pixi.js";

const app = new PIXI.Application();

async function init() {
  await app.init({
    width: 400,
    height: 400,
    backgroundColor: 0x101010,
  });

  document.body.appendChild(app.canvas);

  const sunFlower = new PIXI.Graphics().circle(0, 0, 20).fill(0xffd700);

  sunFlower.x = app.screen.width / 2;
  sunFlower.y = app.screen.height / 2;

  app.stage.addChild(sunFlower);
}

init();
