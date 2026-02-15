import type { GameEngine } from "../core/GameEngine";
import type { Upgrade } from "../core/types";

export function showUpgradeScreen(
  upgrades: Upgrade[],
  onSelect: (upgrade: Upgrade) => void,
) {
  const overlay = document.getElementById("levelup-overlay");
  const container = document.getElementById("upgrade-cards-container");

  if (!overlay || !container) return;

  container.innerHTML = "";

  upgrades.forEach((upgrade) => {
    const card = document.createElement("div");
    card.className = "upgrade-card";
    card.innerHTML = `
      <img src="${upgrade.iconPath || "/assets/upgrades/default_upgrade.png"}" alt="${upgrade.name}">
      <h3>${upgrade.name}</h3>
      <p>${upgrade.description}</p>
    `;

    card.onclick = () => {
      overlay.classList.remove("visible");
      onSelect(upgrade);
    };

    container.appendChild(card);
  });

  overlay.classList.add("visible");
}

export function setOverlayEvents(gameEngine: GameEngine) {
  function upgradeSkipButton() {
    const button = document.getElementById("skip-upgrade");
    if (button) {
      button.onclick = () => {
        const overlay = document.getElementById("levelup-overlay");
        if (overlay) {
          overlay.classList.remove("visible");
          gameEngine.PauseToggle();
        }
      };
    }
  }

  upgradeSkipButton();
}
