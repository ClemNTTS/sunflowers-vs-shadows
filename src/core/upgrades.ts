import type { Upgrade } from "./types";

export const UPGRADE_CATALOG: Upgrade[] = [
  {
    id: "power_boost",
    name: "Sunflower strength",
    description: "Increase strength by +1",
    trigger: "passive",
    effect: (player) => {
      player.atk += 1;
    },
  },
  {
    id: "healing_roots",
    name: "Healing roots",
    description: "Heal 2 HP on each kill",
    iconPath: "/assets/upgrades/default_upgrade.png",
    trigger: "onKill",
    effect: (player) => {
      player.hp = Math.min(player.maxHp || 10, player.hp + 2);
    },
  },
];
