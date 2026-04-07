import {
  screens,
  overlays,
  elements,
  state,
  clamp,
  delay,
  getPlayerDisplayName,
  getHpTone,
  getKhodamMap,
  getKhodamDisplayName,
  getKhodamPreviewSrc,
  applyImageSource
} from "./variable.js";
import { resetLobbyIdleHint, resetSelectionIdleHint } from "./audio.js";

export function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle("screen-visible", key === name);
  });
  state.screen = name;

  if (name !== "gameplay") {
    showOverlay(overlays.actionMenu, false);
    showOverlay(overlays.surrender, false);
  }
}

export function showOverlay(element, visible) {
  if (!element) return;
  element.hidden = !visible;
  element.classList.toggle("overlay-visible", visible);
}

export function renderLobbySelection() {
  const khodam = getKhodamMap()[state.selectedKhodamKey];
  elements.lobbyKhodamName.textContent = getKhodamDisplayName(state.selectedKhodamKey);
  applyImageSource(elements.lobbyVideo, getKhodamPreviewSrc(state.selectedKhodamKey, khodam.preview));
}

export function renderSelectionCards() {
  elements.selectionCards.innerHTML = "";

  const customKhodams = [];
  const defaultKhodams = [];
  state.khodamList.forEach((key) => {
    if (key.startsWith("custom-")) customKhodams.push(key);
    else defaultKhodams.push(key);
  });

  customKhodams.forEach((key) => {
    const khodam = getKhodamMap()[key];
    const previewSrc = getKhodamPreviewSrc(key, khodam.preview);
    const card = document.createElement("div");
    card.className = "khodam-card khodam-card-custom";
    card.dataset.khodam = key;

    card.innerHTML = `
      <div class="khodam-card-layers">
        <div class="card-layer back-layer" style="background-image: url('${previewSrc}');"></div>
        <div class="card-layer middle-layer" style="background-image: url('${previewSrc}');"></div>
        <div class="card-layer front-layer" style="background-image: url('${previewSrc}');"></div>
      </div>
      <h2>${getKhodamDisplayName(key)}</h2>
    `;

    if (state.pendingKhodamKey === key) card.classList.add("is-selected");
    elements.selectionCards.appendChild(card);
  });

  defaultKhodams.forEach((key) => {
    const khodam = getKhodamMap()[key];
    const previewSrc = getKhodamPreviewSrc(key, khodam.preview);
    const card = document.createElement("div");
    card.className = "khodam-card";
    card.dataset.khodam = key;

    card.innerHTML = `
      <div class="khodam-card-layers">
        <div class="card-layer back-layer" style="background-image: url('${previewSrc}');"></div>
        <div class="card-layer middle-layer" style="background-image: url('${previewSrc}');"></div>
        <div class="card-layer front-layer" style="background-image: url('${previewSrc}');"></div>
      </div>
      <h2>${getKhodamDisplayName(key)}</h2>
    `;

    if (state.pendingKhodamKey === key) card.classList.add("is-selected");
    elements.selectionCards.appendChild(card);
  });

  renderSelectionHeader();
  syncSelectionButtons();
}

export function renderSelectionHeader() {
  const pendingKey = state.pendingKhodamKey;

  if (!pendingKey) {
    elements.selectionTitle.hidden = false;
    elements.selectionStats.hidden = true;
    return;
  }

  const khodam = getKhodamMap()[pendingKey];
  if (!khodam) {
    elements.selectionTitle.hidden = false;
    elements.selectionStats.hidden = true;
    return;
  }

  elements.selectionTitle.hidden = true;
  elements.selectionStats.hidden = false;
  elements.selectionStatHp.textContent = String(khodam.hp ?? 0);
  elements.selectionStatAtk.textContent = String(khodam.action?.attack?.damage ?? 0);
  elements.selectionStatDef.textContent = String(khodam.action?.shield?.armor ?? 0);
  elements.selectionStatSp.textContent = String(khodam.effect ?? "-").toUpperCase();
}

export function syncSelectionButtons() {
  const hasPending = Boolean(state.pendingKhodamKey);
  elements.confirmSelectionButton.style.display = hasPending ? "inline-block" : "none";
  const cards = elements.selectionCards.querySelectorAll(".khodam-card");
  cards.forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.khodam === state.pendingKhodamKey);
  });
  renderSelectionHeader();
  if (state.screen === "selection") resetSelectionIdleHint();
}

export function openSelectionScreen() {
  state.pendingKhodamKey = null;
  syncSelectionButtons();
  showScreen("selection");
  resetSelectionIdleHint();
}

export function closeSelectionScreen() {
  state.pendingKhodamKey = null;
  showScreen("lobby");
  syncSelectionButtons();
  resetLobbyIdleHint();
}

export function selectPendingKhodam(key) {
  state.pendingKhodamKey = key;
  syncSelectionButtons();
}

export function confirmPendingKhodam() {
  if (state.pendingKhodamKey) {
    state.selectedKhodamKey = state.pendingKhodamKey;
    renderLobbySelection();
  }
  closeSelectionScreen();
  resetLobbyIdleHint();
}

function getArenaMetrics() {
  const width = screens.gameplay.clientWidth;
  const height = screens.gameplay.clientHeight;
  return {
    centerX: width / 2.1,
    centerY: height * 0.35,
    radiusX: Math.min(width * 0.23, 180),
    radiusY: Math.min(height * 0.09, 78)
  };
}

function getScale(y, centerY, radiusY) {
  const minY = centerY - radiusY;
  const maxY = centerY + radiusY;
  const t = (y - minY) / Math.max(maxY - minY, 1);
  return 0.72 + t * 0.56;
}

function getOrbitAngleForTurnOwner(turnOwner = state.turnOwner) {
  return turnOwner === "opponent" ? -Math.PI / 2 : Math.PI / 2;
}

function setCombatantState(combatant, x, y, scale) {
  const width = combatant.wrapper.offsetWidth;
  const height = combatant.wrapper.offsetHeight;
  combatant.wrapper.style.transform = `translate(${x - width / 2}px, ${y - height / 2}px) scale(${scale})`;
  combatant.wrapper.style.zIndex = String(Math.round(y));
  combatant.wrapper.style.filter = `drop-shadow(0 ${Math.round(scale * 12)}px ${Math.round(scale * 20)}px rgba(0, 0, 0, 0.22))`;
}

function updateOrbitFrame() {
  const orbit = state.orbit;
  const { centerX, centerY, radiusX, radiusY } = getArenaMetrics();
  if (orbit.isSwitching) {
    orbit.angle += (orbit.targetAngle - orbit.angle) * 0.1;
    if (Math.abs(orbit.targetAngle - orbit.angle) < 0.01) {
      orbit.angle = orbit.targetAngle;
      orbit.isSwitching = false;
    }
  }

  const playerY = centerY + Math.sin(orbit.angle) * radiusY;
  const opponentY = centerY + Math.sin(orbit.angle + Math.PI) * radiusY;
  const playerOffsetX = playerY >= centerY ? -70 : 70;
  const opponentOffsetX = opponentY >= centerY ? -70 : 70;

  const positions = [
    { x: centerX + Math.cos(orbit.angle) * radiusX + playerOffsetX, y: playerY, combatant: elements.combatants.player },
    { x: centerX + Math.cos(orbit.angle + Math.PI) * radiusX + opponentOffsetX, y: opponentY, combatant: elements.combatants.opponent }
  ].sort((a, b) => a.y - b.y);

  positions.forEach(({ x, y, combatant }) => {
    setCombatantState(combatant, x, y, getScale(y, centerY, radiusY));
  });

  state.orbit.rafId = requestAnimationFrame(updateOrbitFrame);
}

export function startOrbitLoop() {
  if (state.orbit.rafId) cancelAnimationFrame(state.orbit.rafId);
  state.orbit.rafId = requestAnimationFrame(updateOrbitFrame);
}

export function rotateOrbit(nextTurnOwner) {
  state.orbit.targetAngle = getOrbitAngleForTurnOwner(nextTurnOwner);
  state.orbit.isSwitching = true;
  return delay(600);
}

export function resetOrbit() {
  const angle = getOrbitAngleForTurnOwner();
  state.orbit.angle = angle;
  state.orbit.targetAngle = angle;
  state.orbit.isSwitching = false;
}

export function syncCombatantUi(side) {
  const participant = state.battle[side];
  const combatant = elements.combatants[side];
  const hpPercent = clamp((participant.hp / participant.maxHp) * 100, 0, 100);
  const armorPercent = clamp((participant.armor / participant.maxHp) * 100, 0, 100);
  const hpTone = getHpTone(hpPercent);

  combatant.label.textContent = side === "player" ? getPlayerDisplayName() : participant.displayName;
  combatant.name.textContent = getKhodamDisplayName(participant.khodamKey);
  combatant.hpFill.style.width = `${hpPercent}%`;
  combatant.hpTrailFill.style.width = `${hpPercent}%`;
  combatant.armorFill.style.left = `${hpPercent}%`;
  combatant.armorFill.style.width = `${armorPercent}%`;
  combatant.hpFill.classList.remove("is-high", "is-medium", "is-low");
  combatant.hpFill.classList.add(hpTone);

  const energyPercent = clamp((participant.energy / participant.maxEnergy) * 100, 0, 100);
  if (combatant.energyFill) combatant.energyFill.style.width = `${energyPercent}%`;
  if (combatant.energyText) combatant.energyText.textContent = `${Math.ceil(participant.energy)} / ${participant.maxEnergy} ⚡`;

  const hpText = `${Math.ceil(participant.hp)} ❤️${participant.armor ? ` + ${participant.armor} 🛡️` : ""}`;
  if (combatant.hpText) combatant.hpText.textContent = hpText;
  if (combatant.meta) combatant.meta.textContent = hpText;

  const preview = getKhodamPreviewSrc(participant.khodamKey, getKhodamMap()[participant.khodamKey].preview);
  applyImageSource(combatant.art, preview);
}

export function syncBattleUi() {
  syncCombatantUi("player");
  syncCombatantUi("opponent");
}

export function showToast(message) {
  elements.battleToast.textContent = message;
  elements.battleToast.classList.remove("show");
  void elements.battleToast.offsetWidth;
  elements.battleToast.classList.add("show");
  if (state.toastTimerId) window.clearTimeout(state.toastTimerId);
  state.toastTimerId = window.setTimeout(() => {
    elements.battleToast.classList.remove("show");
    state.toastTimerId = null;
  }, 1400);
}

export function showDamageFloat(side, text) {
  const target = elements.combatants[side].float;
  target.textContent = text;
  target.classList.remove("show");
  void target.offsetWidth;
  target.classList.add("show");
}

export function resetBattleFeedback() {
  if (state.toastTimerId) {
    window.clearTimeout(state.toastTimerId);
    state.toastTimerId = null;
  }
  elements.battleToast.classList.remove("show");
  Object.values(elements.combatants).forEach((combatant) => {
    combatant.float.classList.remove("show");
    combatant.float.textContent = "";
  });
}

export function clearCelebrationState() {
  Object.values(elements.combatants).forEach((combatant) => {
    combatant.wrapper.classList.remove("is-celebrating", "is-watching");
    const previousVideo = combatant.wrapper.querySelector(".card-celebration-video");
    if (previousVideo) {
      previousVideo.pause();
      previousVideo.removeAttribute("src");
      previousVideo.remove();
    }
  });
}

export function openModal({
  title,
  description,
  confirmText = "YA",
  cancelText = "TIDAK",
  confirmVariant = "danger",
  layout = "default"
}) {
  elements.modalTitle.textContent = title;
  elements.modalDescription.textContent = description;
  elements.modalConfirm.textContent = confirmText;
  elements.modalCancel.textContent = cancelText;
  overlays.modal.classList.remove("result-layout", "victory-layout", "defeat-layout");
  if (layout === "result") {
    overlays.modal.classList.add("result-layout");
    overlays.modal.classList.add(confirmVariant === "success" ? "victory-layout" : "defeat-layout");
  }
  elements.modalConfirm.className = "modal-button";
  if (confirmVariant) elements.modalConfirm.classList.add(confirmVariant);
  showOverlay(overlays.modal, true);
  return new Promise((resolve) => { state.modalResolver = resolve; });
}

export function closeModal(result) {
  showOverlay(overlays.modal, false);
  overlays.modal.classList.remove("result-layout", "victory-layout", "defeat-layout");
  if (state.modalResolver) {
    state.modalResolver(result);
    state.modalResolver = null;
  }
}

export async function runIntro() {
  showScreen("intro");
  await delay(50);
  screens.intro.classList.add("is-fading-in");
  await delay(2000);
  screens.intro.classList.remove("is-fading-in");
  screens.intro.classList.add("is-fading-out");
  await delay(800);
  screens.intro.classList.remove("is-fading-out");
}
