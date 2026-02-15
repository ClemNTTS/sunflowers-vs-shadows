import type { MetaData } from "./types";

export class MetaManager {
  private metaData: MetaData;
  private readonly STORAGE_KEY = "sunflowers_vs_shadows_meta";

  constructor() {
    this.metaData = this.loadMetaData();
  }

  private loadMetaData(): MetaData {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse MetaData", e);
      }
    }

    return {
      permanentStats: {
        baseHp: 10,
        baseAtk: 2,
        baseArmor: 0,
        baseHealBonus: 0,
      },
      zones: {
        "meadow-1": 0,
      },
    };
  }

  public saveMetaData(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metaData));
  }

  public getStats() {
    return this.metaData.permanentStats;
  }

  public updateStat(
    stat: keyof MetaData["permanentStats"],
    value: number,
  ): void {
    this.metaData.permanentStats[stat] += value;
    this.saveMetaData();
  }

  public getZoneProgress(zoneId: string): number {
    return this.metaData.zones[zoneId] || 0;
  }

  public setZoneProgress(zoneId: string, score: number): void {
    if (!this.metaData.zones[zoneId] || score > this.metaData.zones[zoneId]) {
      this.metaData.zones[zoneId] = score;
      this.saveMetaData();
    }
  }
}
