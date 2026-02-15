import * as PIXI from "pixi.js";
import type { Grid } from "../core/Grid";
import type { Entity } from "../core/types";
import gsap from "gsap";

export class GridView {
  private backgroundContainer: PIXI.Container;
  private entityContainer: PIXI.Container;
  public readonly tileSize: number = 80;
  private gap: number = 10;

  // On met à jour la Map pour stocker la barre de vie et son groupe
  private spriteMap: Map<
    Entity,
    {
      container: PIXI.Container;
      text: PIXI.Text;
      healthBar: PIXI.Graphics;
      healthGroup: PIXI.Container;
    }
  > = new Map();

  constructor(app: PIXI.Application) {
    this.backgroundContainer = new PIXI.Container();
    this.entityContainer = new PIXI.Container();
    app.stage.addChild(this.backgroundContainer);
    app.stage.addChild(this.entityContainer);
  }

  public gridToPixels(pos: number): number {
    return pos * (this.tileSize + this.gap) + this.tileSize / 2;
  }

  public drawBackground(grid: Grid) {
    for (let y = 0; y < grid.size; y++) {
      for (let x = 0; x < grid.size; x++) {
        const slot = new PIXI.Graphics()
          .roundRect(0, 0, this.tileSize, this.tileSize, 12)
          .fill(0x1e272e); // Couleur un peu plus "DeepDark"
        slot.x = x * (this.tileSize + this.gap);
        slot.y = y * (this.tileSize + this.gap);
        this.backgroundContainer.addChild(slot);
      }
    }
  }

  public renderEntities(grid: Grid) {
    this.clearEntities(grid);
    const entities = grid.getEntities();

    entities.forEach((entity) => {
      let sprite = this.spriteMap.get(entity.entity);

      if (!sprite) {
        const container = new PIXI.Container();
        const shape = new PIXI.Graphics();

        const healthGroup = new PIXI.Container();
        const healthWidth = 40;
        const bgHealth = new PIXI.Graphics()
          .rect(-healthWidth / 2, 20, healthWidth, 4)
          .fill(0x2c3e50);
        const fgHealth = new PIXI.Graphics()
          .rect(-healthWidth / 2, 20, healthWidth, 4)
          .fill(0x2ecc71);

        healthGroup.addChild(bgHealth, fgHealth);
        healthGroup.alpha = 0;

        const text = new PIXI.Text({
          style: { fontSize: 12, fill: 0xffffff, fontWeight: "bold" },
        });
        text.anchor.set(0.5);
        text.y = -this.tileSize / 2.2;

        if (entity.entity.type === "PLAYER") {
          shape.circle(0, 0, this.tileSize / 3).fill(0xf1c40f);
        } else if (entity.entity.type === "MONSTER") {
          shape.poly([0, -18, 18, 18, -18, 18]).fill(0xe74c3c);
          fgHealth.fill(0xe74c3c);
        } else if (entity.entity.type === "XP") {
          shape.star(0, 0, 5, 15, 8).fill(0x3498db);
        }

        container.addChild(shape, text, healthGroup);
        container.x = this.gridToPixels(entity.x);
        container.y = this.gridToPixels(entity.y);
        container.scale.set(0);

        this.entityContainer.addChild(container);
        sprite = { container, text, healthBar: fgHealth, healthGroup };
        this.spriteMap.set(entity.entity, sprite);

        gsap.to(container.scale, {
          x: 1,
          y: 1,
          duration: 0.3,
          ease: "back.out",
        });
      }

      if (entity.entity.type === "PLAYER") {
        sprite.text.text = `Lvl ${entity.entity.level}`;
      } else if (entity.entity.type === "MONSTER") {
        sprite.text.text = `🗡️ ${entity.entity.atk}`;
      }

      let maxHp = entity.entity.type === "PLAYER" ? 10 : 5;
      if (entity.entity.maxHp) {
        maxHp = entity.entity.maxHp;
      }
      const ratio = Math.max(0, entity.entity.hp / maxHp);

      gsap.to(sprite.healthBar, { width: 40 * ratio, duration: 0.3 });

      const isDamaged = ratio < 1 && entity.entity.type !== "XP";
      gsap.to(sprite.healthGroup, { alpha: isDamaged ? 1 : 0, duration: 0.3 });

      gsap.to(sprite.container, {
        x: this.gridToPixels(entity.x),
        y: this.gridToPixels(entity.y),
        duration: 0.25,
        ease: "power2.out",
      });
    });
  }

  public clearEntities(grid: Grid) {
    const activeEntities = grid.getEntities().map((e) => e.entity);
    this.spriteMap.forEach((sprite, entity) => {
      if (!activeEntities.includes(entity)) {
        gsap.killTweensOf(sprite.container);
        gsap.killTweensOf(sprite.healthBar);
        sprite.container.destroy({ children: true });
        this.spriteMap.delete(entity);
      }
    });
  }

  public showPopupText(
    x: number,
    y: number,
    text: string,
    color: number = 0xffffff,
  ) {
    const popup = new PIXI.Text({
      text,
      style: {
        fontSize: 22,
        fill: color,
        fontWeight: "bold",
        stroke: { color: 0x000000, width: 4 },
      },
    });

    popup.anchor.set(0.5);
    popup.x = x;
    popup.y = y;
    this.entityContainer.addChild(popup);

    gsap.to(popup, {
      y: y - 60,
      alpha: 0,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => popup.destroy(),
    });
  }

  public destroy() {
    this.spriteMap.forEach((sprite) => {
      gsap.killTweensOf(sprite.container);
      sprite.container.destroy({ children: true });
    });
    this.spriteMap.clear();

    this.backgroundContainer.destroy({ children: true });
    this.entityContainer.destroy({ children: true });
  }
}
