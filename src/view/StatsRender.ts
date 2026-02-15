import type { GameEngine } from "../core/GameEngine";

export function updatePlayerStats(gameEngine: GameEngine) {
  const hpDiv = document.getElementById("stats-hp");
  const xpDiv = document.getElementById("stats-xp");
  const levelDiv = document.getElementById("stats-level");
  const atkDiv = document.getElementById("stats-atk");
  const armorDiv = document.getElementById("stats-armor");
  const inventoryContainer = document.getElementById("stats-inventory"); //
  const bossTimerDiv = document.getElementById("boss-timer");
  if (bossTimerDiv) {
    bossTimerDiv.innerText =
      gameEngine.getRemainingMoves() > 0
        ? `Boss in: ${gameEngine.getRemainingMoves()} moves`
        : "BOSS ARRIVED !";
  }

  const player = gameEngine
    .getGrid()
    .getEntities()
    .find((e) => e.entity.type === "PLAYER");

  if (player) {
    const { entity } = player;
    if (hpDiv) hpDiv.innerText = `❤️: ${entity.hp}/${entity.maxHp}`;
    if (xpDiv) xpDiv.innerText = `XP: ${entity.xp}`;
    if (levelDiv) levelDiv.innerText = `Level: ${entity.level}`;
    if (atkDiv) atkDiv.innerText = `⚔️: ${entity.atk}`;
    if (armorDiv) armorDiv.innerText = `🛡️: ${entity.armor}`;
    if (inventoryContainer && entity.upgrades) {
      inventoryContainer.innerHTML = "";

      entity.upgrades.forEach((upgrade) => {
        const iconWrapper = document.createElement("div");
        iconWrapper.className = "inventory-item";

        iconWrapper.innerHTML = `
          <div class="inventory-icon">
            <img src="${upgrade.iconPath || "/assets/upgrades/default_upgrade.png"}" alt="${upgrade.name}">
          </div>
          <div class="tooltip">
            <strong>${upgrade.name}</strong><br>
            ${upgrade.description}
          </div>
        `;

        inventoryContainer.appendChild(iconWrapper);
      });
    }
  }
}

export function createStatsDiv() {
  const statsDiv = document.createElement("div");
  statsDiv.id = "stats-container";
  statsDiv.innerHTML = `
  <div id="boss-timer" style="color: #f1c40f; font-weight: bold;">Boss in: 30 moves</div>
  <div id="stats-level">Level: 1</div>
  <div id="stats-xp">XP: 0</div>
  <div id="stats-hp">❤️: 0/0</div>
    <div id="stats-atk">⚔️: 0</div>
    <div id="stats-armor">🛡️: 0</div>
    <hr style="border: 0.5px solid #2c3e50; width: 100%; margin: 10px 0;">
    <div style="font-size: 0.8rem; color: #7f8c8d; margin-bottom: 5px;">INVENTAIRE</div>
    <div id="stats-inventory"></div>
  `;
  document.body.appendChild(statsDiv);
}
