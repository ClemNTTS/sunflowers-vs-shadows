import type { Cell } from "./types";

export class Grid {
  private readonly cells: Cell[][];
  public readonly size: number = 4;

  constructor() {
    this.cells = this.createEmptyGrid();
  }

  private createEmptyGrid(): Cell[][] {
    return Array.from({ length: this.size }, () => Array(this.size).fill(null));
  }

  public isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  public getValue(x: number, y: number): Cell {
    if (!this.isWithinBounds(x, y)) return null;
    return this.cells[y][x];
  }
}
