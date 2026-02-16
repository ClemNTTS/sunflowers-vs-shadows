import type { BossAction, Zone } from "./types";

export const DIRECTIONS = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
};

export const ZONES: Record<string, Zone> = {
  "meadow-1": {
    id: "meadow-1",
    name: "Meadow Zone",
    movesToBoss: 30,
    boss: {
      type: "BOSS",
      hp: 25,
      maxHp: 25,
      atk: 2,
      armor: 0,
    },
    baseMonsterHp: 5,
    baseMonsterAtk: 1,
  },
};

export const VOID_PULSE: BossAction = {
  id: "void_pulse",
  cooldown: 3,
  description: "Damage all adjacent tiles",
  preview: (game, bossPos) => {
    const grid = game.getGrid();
    game.activeDangerZones = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const tx = bossPos.x + dx;
        const ty = bossPos.y + dy;

        if (grid.isWithinBounds(tx, ty)) {
          const zone = game.gridViewer.showDangerZone(tx, ty);
          game.activeDangerZones.push(zone);
        }
      }
    }
  },
  execute: (game, bossPos) => {
    game.activeDangerZones.forEach((zone) => {
      zone.destroy();
    });

    game.activeDangerZones = [];

    const grid = game.getGrid();
    const viewer = (game as any).gridViewer;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const targetX = bossPos.x + dx;
        const targetY = bossPos.y + dy;

        if (grid.isWithinBounds(targetX, targetY)) {
          const target = grid.getValue(targetX, targetY);

          viewer.showPopupText(
            game.gridViewer.gridToPixels(targetX),
            game.gridViewer.gridToPixels(targetY),
            "💥",
            0xff0000,
          );

          if (target && target.type === "PLAYER") {
            target.hp = Math.max(0, target.hp - 5);
          }
        }
      }
    }
  },
};
