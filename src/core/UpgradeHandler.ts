import type { Entity, Upgrade } from "./types";
import { UPGRADE_CATALOG } from "./upgrades";

export class UpgradeHandler {
  private player: Entity;
  constructor(player: Entity) {
    this.player = player;
  }

  public rollThreeUpgrades(): Upgrade[] {
    let returnArray: Upgrade[] = [];

    const catalog = UPGRADE_CATALOG.filter((u) => !this.hasUpgrade(u));

    if (catalog.length < 3) return catalog;

    while (returnArray.length < 3) {
      const randomIndex = Math.floor(Math.random() * catalog.length);
      if (!returnArray.includes(UPGRADE_CATALOG[randomIndex])) {
        returnArray.push(UPGRADE_CATALOG[randomIndex]);
      }
    }
    return returnArray;
  }

  public addUpgrade(upgrade: Upgrade): void {
    if (!this.player.upgrades) {
      this.player.upgrades = [];
    }
    this.player.upgrades.push(upgrade);
  }

  public removeUpgrade(upgrade: Upgrade): void {
    if (this.player.upgrades) {
      this.player.upgrades = this.player.upgrades.filter(
        (u) => u.id !== upgrade.id,
      );
    }
  }

  public hasUpgrade(upgrade: Upgrade): boolean {
    if (this.player.upgrades) {
      return this.player.upgrades.some((u) => u.id === upgrade.id);
    }
    return false;
  }
}
