import * as PIXI from "pixi.js";
import { GameEngine } from "./core/GameEngine";
import { MetaManager } from "./core/MetaManager";
import { ZONES } from "./core/constants";
import { updateMenuUI } from "./view/utils";
import type { Zone } from "./core/types";

const app = new PIXI.Application();
const metaManager = new MetaManager();

// --- Main Menu Logic ---
const displayableZones: (Zone & {
  available: boolean;
  description: string;
  image?: string;
})[] = [
  {
    ...ZONES["meadow-1"],
    available: true,
    description: "A once peaceful meadow, now teeming with shadowy creatures.",
    image: "/public/assets/zones/meadow_zone.jpg",
  },
  {
    id: "forest-of-whispers",
    name: "Soon...",
    movesToBoss: 0,
    boss: ZONES["meadow-1"].boss,
    baseMonsterHp: 0,
    baseMonsterAtk: 0,
    available: false,
    description: "This area is currently being consumed by shadows.",
  },
];

let currentZoneIndex = 0;

function updateZoneDisplay() {
  const zone = displayableZones[currentZoneIndex];

  const zoneNameEl = document.getElementById("zone-name") as HTMLElement;
  const zoneDescEl = document.getElementById("zone-description") as HTMLElement;
  const zoneImageEl = document.getElementById(
    "zone-image-placeholder",
  ) as HTMLElement;
  const startButton = document.getElementById(
    "start-zone-button",
  ) as HTMLButtonElement;
  const prevButton = document.getElementById("prev-zone") as HTMLButtonElement;
  const nextButton = document.getElementById("next-zone") as HTMLButtonElement;

  if (zoneNameEl) zoneNameEl.textContent = zone.name;
  if (zoneDescEl) zoneDescEl.textContent = zone.description;

  if (zoneImageEl) {
    if (zone.image) {
      zoneImageEl.style.backgroundImage = `url(${zone.image})`;
      zoneImageEl.textContent = ""; // Clear text if image is used
    } else {
      zoneImageEl.textContent = "No map data";
      zoneImageEl.style.backgroundImage = "";
    }
  }

  if (startButton) {
    startButton.disabled = !zone.available;
    startButton.textContent = zone.available ? "Enter Zone" : "Unavailable";
  }

  if (prevButton) prevButton.disabled = currentZoneIndex === 0;
  if (nextButton)
    nextButton.disabled = currentZoneIndex === displayableZones.length - 1;

  const winCounter = document.querySelector(
    "#zone-name + #win-counter-meadow",
  ) as HTMLElement | null;
  if (winCounter) {
    const wins = metaManager.getZoneProgress("meadow-1") || 0;
    winCounter.innerText = wins > 0 && zone.id === "meadow-1" ? `+${wins}` : "";
  }
}

function setupMenuControls() {
  const prevButton = document.getElementById("prev-zone") as HTMLButtonElement;
  const nextButton = document.getElementById("next-zone") as HTMLButtonElement;
  const startButton = document.getElementById(
    "start-zone-button",
  ) as HTMLButtonElement;
  const mainMenu = document.getElementById("main-menu");

  if (prevButton) {
    prevButton.onclick = () => {
      if (currentZoneIndex > 0) {
        currentZoneIndex--;
        updateZoneDisplay();
      }
    };
  }

  if (nextButton) {
    nextButton.onclick = () => {
      if (currentZoneIndex < displayableZones.length - 1) {
        currentZoneIndex++;
        updateZoneDisplay();
      }
    };
  }

  if (startButton) {
    startButton.addEventListener("click", () => {
      const selectedZone = displayableZones[currentZoneIndex];
      if (!selectedZone.available) return;

      if (mainMenu) mainMenu.style.display = "none";

      const difficultyMultiplier = metaManager.getZoneProgress(selectedZone.id);
      const gameEngine = new GameEngine(
        app,
        difficultyMultiplier,
        metaManager,
        selectedZone,
      );

      window.addEventListener("resize", () => {
        gameEngine.gridViewer.centerContainers(
          app.screen.width,
          app.screen.height,
          gameEngine.getGrid().size,
        );
      });

      gameEngine.start();
      gameEngine.gridViewer.centerContainers(
        app.screen.width,
        app.screen.height,
        gameEngine.getGrid().size,
      );
    });
  }
}

async function init() {
  await app.init({
    resizeTo: window,
    antialias: true,
    backgroundColor: 0x101010,
  });
  document.body.appendChild(app.canvas);

  setupMenuControls();
  updateZoneDisplay();
  updateMenuUI();
}

init();
