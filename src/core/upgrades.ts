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
    id: "thick_bark",
    name: "Thick Bark",
    description: "Increase armor by +1.",
    trigger: "passive",
    effect: (player) => {
      player.armor += 1;
    },
  },
  {
    id: "healing_roots",
    name: "Healing roots",
    description: "Heal 2 HP on each kill.",
    iconPath: "/assets/upgrades/default_upgrade.png",
    trigger: "onKill",
    effect: (player) => {
      player.hp = Math.min(player.maxHp || 10, player.hp + 2);
    },
  },
  {
    id: "light_foot",
    name: "Light Foot",
    description: "30% chance to heal 1 HP on move.",
    trigger: "onMove",
    effect: (player) => {
      if (Math.random() < 0.3) {
        player.hp = Math.min(player.maxHp || 999, player.hp + 1);
      }
    },
  },
  {
    id: "knowledge_is_power",
    name: "Knowledge is Power",
    description: "Gain +1 max HP on XP collect.",
    trigger: "onCollectXp",
    effect: (player) => {
      if (player.maxHp) {
        player.maxHp += 1;
      }
    },
  },
  {
    id: "first_strike",
    name: "First Strike",
    description: "Deal 1 damage to the opponent at the start of combat.",
    trigger: "onCombatStart",
    effect: (player, context) => {
      if (context?.opponent) {
        context.opponent.hp -= 1;
      }
    },
  },
  {
    id: "blessing_of_the_sun",
    name: "Blessing of the Sun",
    description: "On level up, fully heals and increase max HP by 2.",
    trigger: "onLevelUp",
    effect: (player) => {
      if (player.maxHp) {
        player.maxHp += 2;
        player.hp = player.maxHp;
      }
    },
  },
  {
    id: "precognition",
    name: "Precognition",
    description: "75% chance for new monsters to spawn with -2 HP.",
    trigger: "onNewEntity",
    effect: (player, context) => {
      if (context?.newEntity && context.newEntity.type === "MONSTER") {
        if (Math.random() < 0.75) {
          context.newEntity.hp = Math.max(1, context.newEntity.hp - 2);
        }
      }
    },
  },
];
