const gameplay = document.querySelector(".gameplay");
const actionMenuOverlay = document.querySelector(".action-menu-overlay");
const surrenderOverlay = document.querySelector(".surrender-overlay");
const fullscreenAnimation = document.querySelector(".fullscreen-animation-in-game");
const combatants = {
  player: {
    element: document.querySelector(".player"),
    name: document.getElementById("player-battle-name"),
    hpFill: document.getElementById("player-hp-fill"),
    offsetX: -70
  },
  opponent: {
    element: document.querySelector(".opponent"),
    name: document.getElementById("opponent-battle-name"),
    hpFill: document.getElementById("opponent-hp-fill"),
    offsetX: 70
  }
};

let angle = Math.PI / 2;
let targetAngle = angle;
let isSwitching = false;

function getArenaMetrics() {
  const width = gameplay.clientWidth;
  const height = gameplay.clientHeight;

  return {
    centerX: width / 2.1,
    centerY: height * 0.4,
    radiusX: Math.min(width * 0.23, 180),
    radiusY: Math.min(height * 0.09, 78)
  };
}

function getScale(y, centerY, radiusY) {
  const minY = centerY - radiusY;
  const maxY = centerY + radiusY;
  const t = (y - minY) / (maxY - minY);
  return 0.72 + t * 0.56;
}

function setCombatantState(combatant, x, y, scale) {
  const width = combatant.element.offsetWidth;
  const height = combatant.element.offsetHeight;

  combatant.element.style.transform = `translate(${x - width / 2}px, ${y - height / 2}px) scale(${scale})`;
  combatant.element.style.zIndex = String(Math.round(y));
  combatant.element.style.filter = `drop-shadow(0 ${Math.round(scale * 12)}px ${Math.round(
    scale * 20
  )}px rgba(0, 0, 0, 0.22))`;
}

function updateCombatantInfo() {
  const lobbyName = document.getElementById("nama-khodam");
  const playerInput = document.getElementById("player-name-input");

  if (lobbyName && combatants.player.name) {
    combatants.player.name.textContent = lobbyName.textContent.trim() || "PLAYER";
  }

  if (playerInput && combatants.player.name) {
    playerInput.addEventListener("input", () => {
      const value = playerInput.value.trim();
      combatants.player.name.textContent = value || lobbyName.textContent.trim() || "PLAYER";
    });
  }
}

function updateOrbit() {
  const { centerX, centerY, radiusX, radiusY } = getArenaMetrics();

  if (isSwitching) {
    angle += (targetAngle - angle) * 0.08;
    if (Math.abs(targetAngle - angle) < 0.01) {
      angle = targetAngle;
      isSwitching = false;
    }
  }

  const playerPos = {
    x: centerX + Math.cos(angle) * radiusX + combatants.player.offsetX,
    y: centerY + Math.sin(angle) * radiusY
  };

  const opponentPos = {
    x: centerX + Math.cos(angle + Math.PI) * radiusX + combatants.opponent.offsetX,
    y: centerY + Math.sin(angle + Math.PI) * radiusY
  };

  const orbiting = [
    { ...playerPos, combatant: combatants.player },
    { ...opponentPos, combatant: combatants.opponent }
  ].sort((a, b) => a.y - b.y);

  orbiting.forEach(({ x, y, combatant }) => {
    const scale = getScale(y, centerY, radiusY);
    setCombatantState(combatant, x, y, scale);
  });

  requestAnimationFrame(updateOrbit);
}

function startBattleScene() {
  if (!gameplay) {
    return;
  }

  gameplay.classList.add("active");
  actionMenuOverlay?.classList.add("active");
  surrenderOverlay?.classList.add("active");
  updateCombatantInfo();
  updateOrbit();

  gameplay.addEventListener("click", () => {
    if (!isSwitching) {
      targetAngle += Math.PI;
      isSwitching = true;
    }
  });
}

function stopBattleScene() {
  gameplay?.classList.remove("active");
  actionMenuOverlay?.classList.remove("active");
  surrenderOverlay?.classList.remove("active");
  fullscreenAnimation?.classList.remove("active");
}

startBattleScene();
