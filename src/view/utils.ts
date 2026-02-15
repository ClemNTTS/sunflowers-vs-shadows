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
          updateMenuUI();
        }
      };
    }
  }
  upgradeSkipButton();
}

export function showVictoryScreen(onSelect: (stat: string) => void) {
  const overlay = document.getElementById("levelup-overlay");
  const container = document.getElementById("upgrade-cards-container");
  const title = overlay?.querySelector("h1");
  const desc = overlay?.querySelector("p");
  const skipButton = document.getElementById("skip-upgrade");

  if (!overlay || !container || !title || !desc || !skipButton) return;

  // On change les textes pour le mode Victoire
  title.innerText = "VICTORY !";
  title.style.color = "#2ecc71"; // Un beau vert de victoire
  desc.innerText = "Select a permanent stat to upgrade:";
  container.innerHTML = "";

  const rewards = [
    { id: "baseHp", name: "Vitality", icon: "❤️", desc: "+2 HP Max" },
    { id: "baseAtk", name: "Strength", icon: "⚔️", desc: "+1 ATK" },
    { id: "baseArmor", name: "Armor", icon: "🛡️", desc: "+1 Armure" },
    {
      id: "baseHealBonus",
      name: "Recovery",
      icon: "🌿",
      desc: "+1 Heal Bonus",
    },
  ];

  rewards.forEach((reward) => {
    const card = document.createElement("div");
    card.className = "upgrade-card";
    card.innerHTML = `
      <div class="upgrade-icon">${reward.icon}</div>
      <h3>${reward.name}</h3>
      <p>${reward.desc}</p>
    `;

    card.onclick = () => {
      overlay.classList.remove("visible");
      onSelect(reward.id);
      skipButton.style.display = "block";
      updateMenuUI();
    };
    container.appendChild(card);
  });

  skipButton.style.display = "none";
  overlay.classList.add("visible");
}

export function updateMenuUI() {
  const mainMenu = document.getElementById("main-menu");
  const winCounterMeadow = document.getElementById("win-counter-meadow");
  const data = JSON.parse(
    localStorage.getItem("sunflowers_vs_shadows_meta") || "{}",
  );

  if (mainMenu) {
    if (winCounterMeadow) {
      const wins = data.zones?.["meadow-1"] || 0;
      winCounterMeadow.innerText =
        wins === 0 ? "" : `+${data.zones?.["meadow-1"] || 0}`;
    }
  }
}
