// ─── FIREBASE SETUP ──────────────────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  remove,
  push,
  off,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdJ83a2vwePAVY3tVTx4WXXIAqtcNgm_s",
  authDomain: "global-db-yasagiriderma.firebaseapp.com",
  databaseURL: "https://global-db-yasagiriderma-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "global-db-yasagiriderma",
  storageBucket: "global-db-yasagiriderma.firebasestorage.app",
  messagingSenderId: "705392456719",
  appId: "1:705392456719:web:ca41d5c265aeec37fe1f7a"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ─── DOM REFERENCES ───────────────────────────────────────────────────────────
const screens = {
  intro: document.querySelector(".intro"),
  cache: document.querySelector(".early-caching"),
  lobby: document.querySelector(".main-lobby"),
  selection: document.querySelector(".khodam-selection"),
  creator: document.querySelector(".khodam-creator"),
  search: document.querySelector(".cari-lawan"),
  gameplay: document.querySelector(".gameplay")
};

const overlays = {
  actionMenu: document.querySelector(".action-menu-overlay"),
  surrender: document.querySelector(".surrender-overlay"),
  fullscreen: document.querySelector(".fullscreen-animation-in-game"),
  skip: document.querySelector(".skip-animation-overlay"),
  kata: document.querySelector(".kata2-hero-overlay"),
  modal: document.getElementById("confirm-modal")
};

const elements = {
  progressFill: document.querySelector(".progress-fill"),
  progressText: document.getElementById("progress-text"),
  lobbyKhodamName: document.getElementById("nama-khodam"),
  lobbyVideo: document.getElementById("background-video-main-lobby"),
  playerNameInput: document.getElementById("player-name-input"),
  selectionButton: document.getElementById("khodam-selection-button"),
  selectionTitle: document.getElementById("khodam-selection-title"),
  selectionStats: document.getElementById("khodam-selection-stats"),
  selectionStatHp: document.getElementById("khodam-stat-hp"),
  selectionStatAtk: document.getElementById("khodam-stat-atk"),
  selectionStatDef: document.getElementById("khodam-stat-def"),
  selectionStatSp: document.getElementById("khodam-stat-sp"),
  playButton: document.getElementById("play-button"),
  selectionCards: document.getElementById("khodam-selection-cards"),
  createKhodamButton: document.getElementById("create-khodam"),
  creatorScreen: document.querySelector(".khodam-creator"),
  creatorCanvas: document.getElementById("creator-canvas"),
  creatorColorInput: document.getElementById("creator-color"),
  creatorSizeInput: document.getElementById("creator-size"),
  creatorSizeDisplay: document.getElementById("creator-size-display"),
  creatorEraserButton: document.getElementById("creator-eraser-button"),
  creatorClearButton: document.getElementById("creator-clear-button"),
  creatorNameInput: document.getElementById("creator-name-input"),
  creatorSaveButton: document.getElementById("save-khodam-button"),
  creatorCancelButton: document.getElementById("close-creator-screen"),
  cancelSelectionButton: document.getElementById("cancel-khodam-selection"),
  confirmSelectionButton: document.getElementById("confirm-khodam-selection"),
  actionButtons: Array.from(document.querySelectorAll(".action-button")),
  surrenderButton: document.getElementById("surrender-button"),
  modalTitle: document.getElementById("modal-title"),
  modalDescription: document.getElementById("modal-description"),
  modalConfirm: document.getElementById("modal-confirm"),
  modalCancel: document.getElementById("modal-cancel"),
  fullscreenVideo: document.querySelector(".animasi-fullscreen-video"),
  skipAnimationButton: document.querySelector(".skip-animation-button"),
  kataText: document.getElementById("kata2-hero"),
  battleToast: document.getElementById("battle-toast"),
  combatants: {
    player: {
      wrapper: document.querySelector(".player"),
      label: document.getElementById("nama-player"),
      name: document.getElementById("player-battle-name"),
      hpFill: document.getElementById("player-hp-fill"),
      hpTrailFill: document.getElementById("player-hp-trail-fill"),
      armorFill: document.getElementById("player-armor-fill"),
      energyFill: document.getElementById("player-energy-fill"),
      energyMeta: document.getElementById("player-energy-meta"),
      meta: document.getElementById("player-status-meta"),
      art: document.getElementById("player-card-art"),
      float: document.getElementById("player-damage-float"),
      hpText: document.getElementById("player-hp-text"),
      energyText: document.getElementById("player-energy-text"),
      offsetX: -70
    },
    opponent: {
      wrapper: document.querySelector(".opponent"),
      label: document.getElementById("nama-opponent"),
      name: document.getElementById("opponent-battle-name"),
      hpFill: document.getElementById("opponent-hp-fill"),
      hpTrailFill: document.getElementById("opponent-hp-trail-fill"),
      armorFill: document.getElementById("opponent-armor-fill"),
      energyFill: document.getElementById("opponent-energy-fill"),
      energyMeta: document.getElementById("opponent-energy-meta"),
      meta: document.getElementById("opponent-status-meta"),
      art: document.getElementById("opponent-card-art"),
      float: document.getElementById("opponent-damage-float"),
      hpText: document.getElementById("opponent-hp-text"),
      energyText: document.getElementById("opponent-energy-text"),
      offsetX: 70
    }
  }
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const actionMeta = {
  attack: { icon: "🗡️", label: "serangan" },
  skill: { icon: "⚔️", label: "skill" },
  ultimate: { icon: "💥", label: "ultimate" },
  shield: { icon: "🛡️", label: "shield" }
};

const ENERGY_SETTINGS = { max: 300, perTurn: 80 };
const MATCHMAKING_BOT_TIMEOUT_MS = 10000;

const battleQuotes = {
  attack: ["Hajar!", "Masuk!", "Serang terus!"],
  skill: ["Lihat jurusku!", "Ini baru skill!", "Kena kombo!"],
  ultimate: ["Waktunya tamat!", "Serius sekarang!", "Terima ini!"],
  shield: ["Aku tahan!", "Belum tumbang!", "Pertahanan aktif!"]
};

const khodamAssetAliases = { "si pitung": "pitung" };

// ─── STATE ────────────────────────────────────────────────────────────────────
const state = {
  data: null,
  effects: null,
  sfx: null,
  khodamList: [],
  defaultPlayerName: null,
  selectedKhodamKey: "anoman",
  pendingKhodamKey: null,
  screen: null,
  modalResolver: null,
  isBattleBusy: false,
  turnOwner: "player",
  gameOver: false,
  orbit: {
    angle: Math.PI / 2,
    targetAngle: Math.PI / 2,
    isSwitching: false,
    rafId: null
  },
  battleSession: 0,
  activeAnimationResolver: null,
  toastTimerId: null,
  battle: null,
  battleMode: null,
  assetCache: { ready: new Set(), pending: new Map() },
  audio: {
    unlocked: false,
    unlockBound: false,
    activeMusic: null,
    music: {
      lobby: null,
      gameplay: null
    }
  },
  idleHints: {
    intervalMs: 3000,
    durationMs: 550,
    lobbyTimer: null,
    selectionTimer: null,
    actionTimer: null
  },

  // ── Online multiplayer state ──
  online: {
    playerId: null,        // unique ID for this tab/session
    roomId: null,          // current room key in Firebase
    mySide: null,          // "host" | "guest"
    listeners: [],         // Firebase listeners to detach on leave
    matchmakingRef: null,
    matchmakingCallback: null,
    waitingTimeout: null
  },
  botTurnTimeout: null
};

// Generate a unique player ID once per session
state.online.playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ─── UTILITY ──────────────────────────────────────────────────────────────────
function delay(ms) { return new Promise((resolve) => window.setTimeout(resolve, ms)); }

function toTitleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function clamp(number, min, max) { return Math.min(Math.max(number, min), max); }

function generateDefaultPlayerName() {
  return `player${Math.floor(Math.random() * 99999) + 1}`;
}

function getPlayerDisplayName() {
  return elements.playerNameInput.value.trim() || state.defaultPlayerName || "player1";
}

function getHpTone(hpPercent) {
  if (hpPercent < 30) return "is-low";
  if (hpPercent < 60) return "is-medium";
  return "is-high";
}

function getSfxMap() { return state.sfx || {}; }

function createAudioInstance(src, { loop = false, volume = 1 } = {}) {
  if (!src || src === "none") return null;
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.loop = loop;
  audio.volume = volume;
  return audio;
}

function initializeAudioSystem() {
  const sfx = getSfxMap();
  state.audio.music.lobby = createAudioInstance(sfx["lobby-music"], { loop: true, volume: 0.45 });
  state.audio.music.gameplay = createAudioInstance(sfx["gameplay-music"], { loop: true, volume: 0.4 });
}

function tryPlayAudio(audio) {
  if (!audio) return;
  const playPromise = audio.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
      bindAudioUnlock();
    });
  }
}

function stopAudio(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

function stopAllMusic() {
  stopAudio(state.audio.music.lobby);
  stopAudio(state.audio.music.gameplay);
  state.audio.activeMusic = null;
}

function playMusic(trackName) {
  const nextTrack = state.audio.music[trackName];
  if (!nextTrack) return;
  if (state.audio.activeMusic === nextTrack && !nextTrack.paused) return;

  Object.values(state.audio.music).forEach((audio) => {
    if (audio && audio !== nextTrack) stopAudio(audio);
  });

  nextTrack.currentTime = 0;
  state.audio.activeMusic = nextTrack;
  tryPlayAudio(nextTrack);
}

function ensureMusic(trackName) {
  const track = state.audio.music[trackName];
  if (!track) return;
  if (state.audio.activeMusic === track && !track.paused) return;
  if (state.audio.activeMusic && state.audio.activeMusic !== track) {
    playMusic(trackName);
    return;
  }
  state.audio.activeMusic = track;
  tryPlayAudio(track);
}

function bindAudioUnlock() {
  if (state.audio.unlockBound) return;
  state.audio.unlockBound = true;

  const unlock = () => {
    if (state.audio.unlocked) return;
    state.audio.unlocked = true;
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    state.audio.unlockBound = false;

    if (state.screen === "lobby" || state.screen === "selection") {
      ensureMusic("lobby");
    } else if (state.screen === "gameplay") {
      ensureMusic("gameplay");
    }
  };

  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

function playSfx(name, { volume = 1 } = {}) {
  const src = getSfxMap()[name];
  if (!src || src === "none") return;
  const audio = createAudioInstance(src, { volume });
  tryPlayAudio(audio);
}

function playActionSfx(actionKey) {
  if (actionKey === "attack") {
    playSfx("atk-sfx", { volume: 0.7 });
    return;
  }
  if (actionKey === "shield") {
    playSfx("def-sfx", { volume: 0.7 });
  }
}

function isElementVisible(element) {
  if (!element) return false;
  if (element.hidden) return false;
  return window.getComputedStyle(element).display !== "none";
}

function triggerIdleNudge(elementsToAnimate) {
  elementsToAnimate.forEach((element) => {
    if (!element || !isElementVisible(element) || element.disabled) return;
    element.classList.remove("idle-nudge");
    void element.offsetWidth;
    element.classList.add("idle-nudge");
  });

  window.setTimeout(() => {
    elementsToAnimate.forEach((element) => element?.classList.remove("idle-nudge"));
  }, state.idleHints.durationMs);
}

function clearIdleHintTimer(timerKey) {
  const timerId = state.idleHints[timerKey];
  if (timerId) {
    window.clearTimeout(timerId);
    state.idleHints[timerKey] = null;
  }
}

function scheduleIdleHint(timerKey, getTargets, shouldRun) {
  clearIdleHintTimer(timerKey);

  const queueNext = () => {
    clearIdleHintTimer(timerKey);
    state.idleHints[timerKey] = window.setTimeout(() => {
      if (!shouldRun()) {
        queueNext();
        return;
      }

      const targets = getTargets().filter((element) => element && isElementVisible(element) && !element.disabled);
      if (targets.length) triggerIdleNudge(targets);
      queueNext();
    }, state.idleHints.intervalMs);
  };

  queueNext();
}

function resetLobbyIdleHint() {
  scheduleIdleHint(
    "lobbyTimer",
    () => [elements.selectionButton, elements.playButton],
    () => state.screen === "lobby"
  );
}

function resetSelectionIdleHint() {
  scheduleIdleHint(
    "selectionTimer",
    () => [elements.cancelSelectionButton, elements.confirmSelectionButton],
    () => state.screen === "selection"
  );
}

function resetActionIdleHint() {
  scheduleIdleHint(
    "actionTimer",
    () => elements.actionButtons.filter((button) => !button.disabled),
    () => state.screen === "gameplay" && !state.gameOver && state.turnOwner === "player" && !state.isBattleBusy
  );
}

// ─── SCREEN MANAGEMENT ───────────────────────────────────────────────────────
function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle("screen-visible", key === name);
  });
  state.screen = name;

  if (name !== "gameplay") {
    showOverlay(overlays.actionMenu, false);
    showOverlay(overlays.surrender, false);
  }
}

function showOverlay(element, visible) {
  if (!element) return;
  element.hidden = !visible;
  element.classList.toggle("overlay-visible", visible);
}

function initializeKhodamCreator() {
  if (!elements.creatorCanvas || !elements.creatorColorInput || !elements.creatorSizeInput) return;
  state.creator = state.creator || {};
  const canvas = elements.creatorCanvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  state.creator.ctx = ctx;
  state.creator.canvas = canvas;
  state.creator.isDrawing = false;
  state.creator.eraserMode = false;
  state.creator.color = elements.creatorColorInput.value || "#1E3A8A";
  state.creator.size = parseInt(elements.creatorSizeInput.value || "6", 10);
  updateCreatorBrush();
  clearCreatorCanvas();

  canvas.addEventListener("pointerdown", startCreatorDraw);
  window.addEventListener("pointermove", drawCreator);
  window.addEventListener("pointerup", endCreatorDraw);
  canvas.addEventListener("pointerleave", endCreatorDraw);
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  elements.creatorColorInput.addEventListener("input", (event) => {
    state.creator.color = event.target.value;
    updateCreatorBrush();
  });
  elements.creatorSizeInput.addEventListener("input", (event) => {
    const size = parseInt(event.target.value, 10);
    state.creator.size = Number.isFinite(size) ? size : 6;
    elements.creatorSizeDisplay.textContent = `${state.creator.size}px`;
    updateCreatorBrush();
  });
  elements.creatorClearButton.addEventListener("click", () => {
    clearCreatorCanvas();
  });
  elements.creatorEraserButton.addEventListener("click", toggleCreatorEraser);
  elements.creatorSaveButton.addEventListener("click", async () => {
    playSfx("ui-sfx", { volume: 0.7 });
    await saveCustomKhodam();
  });
  elements.creatorCancelButton?.addEventListener("click", () => {
    playSfx("ui-sfx", { volume: 0.7 });
    closeCreatorScreen();
  });
}

function getCreatorCanvasCoords(event) {
  const canvas = elements.creatorCanvas;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX || 0) - rect.left) * (canvas.width / rect.width);
  const y = ((event.clientY || 0) - rect.top) * (canvas.height / rect.height);
  return {
    x: Math.min(Math.max(0, x), canvas.width),
    y: Math.min(Math.max(0, y), canvas.height)
  };
}

function updateCreatorBrush() {
  const ctx = state.creator?.ctx;
  if (!ctx) return;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = state.creator.size;
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = state.creator.eraserMode ? "#FFFFFF" : state.creator.color;
}

function clearCreatorCanvas() {
  const canvas = elements.creatorCanvas;
  const ctx = state.creator?.ctx;
  if (!canvas || !ctx) return;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  state.creator.isDrawing = false;
}

function startCreatorDraw(event) {
  if (!state.creator || state.screen !== "creator") return;
  event.preventDefault();
  const coords = getCreatorCanvasCoords(event);
  if (!coords) return;
  if (!state.creator.ctx) return;
  state.creator.isDrawing = true;
  state.creator.lastX = coords.x;
  state.creator.lastY = coords.y;
  state.creator.ctx.beginPath();
  state.creator.ctx.moveTo(coords.x, coords.y);
  state.creator.ctx.lineTo(coords.x + 0.5, coords.y + 0.5);
  state.creator.ctx.stroke();
}

function drawCreator(event) {
  if (!state.creator?.isDrawing || state.screen !== "creator") return;
  event.preventDefault();
  const coords = getCreatorCanvasCoords(event);
  if (!coords || !state.creator?.ctx) return;
  state.creator.ctx.beginPath();
  state.creator.ctx.moveTo(state.creator.lastX, state.creator.lastY);
  state.creator.ctx.lineTo(coords.x, coords.y);
  state.creator.ctx.stroke();
  state.creator.lastX = coords.x;
  state.creator.lastY = coords.y;
}

function endCreatorDraw() {
  if (!state.creator || state.screen !== "creator") return;
  state.creator.isDrawing = false;
  state.creator?.ctx?.beginPath();
}

function toggleCreatorEraser() {
  if (!state.creator) return;
  state.creator.eraserMode = !state.creator.eraserMode;
  elements.creatorEraserButton.textContent = state.creator.eraserMode ? "✏️ Mode Gambar" : "✖️ Penghapus";
  elements.creatorEraserButton.classList.toggle("active", state.creator.eraserMode);
  updateCreatorBrush();
}

function openCreatorScreen() {
  if (!state.creator) return;
  state.pendingKhodamKey = null;
  state.creator.eraserMode = false;
  state.creator.color = elements.creatorColorInput?.value || "#1E3A8A";
  state.creator.size = parseInt(elements.creatorSizeInput?.value || "6", 10);
  elements.creatorNameInput.value = "";
  elements.creatorEraserButton.textContent = "✖️ Penghapus";
  elements.creatorEraserButton.classList.remove("active");
  updateCreatorBrush();
  clearCreatorCanvas();
  showScreen("creator");
}

function closeCreatorScreen() {
  showScreen("selection");
}

function createCustomKhodamObject(name, previewSrc) {
  const effectKeys = Object.keys(getEffectMap());
  const effect = effectKeys[Math.floor(Math.random() * effectKeys.length)] || "burn";
  const hp = randomInt(900, 1200);
  const atk = randomInt(90, 120);
  const skill = randomInt(230, 270);
  const ult = randomInt(420, 470);
  const def = randomInt(150, 175);
  return {
    preview: previewSrc,
    name,
    hp,
    critical: { chance: randomInt(20, 30), multiplier: randomFloat(1.5, 2.0) },
    effect,
    effectChance: { attack: 0.2, skill: 0.3, ultimate: 1, shield: 0 },
    action: {
      attack: { name: "Serang ⚔️", damage: atk, preview: "none", use: "unlimited", energyCost: 0, energyGain: 10, cooldown: 0 },
      skill: { name: "Skill Khodam", damage: skill, preview: "none", use: 3, energyCost: 100, energyGain: 0, cooldown: 2 },
      ultimate: { name: "Ultimate Khodam", damage: ult, preview: "none", use: 1, energyCost: 300, energyGain: 0, cooldown: 4 },
      shield: { name: "Bertahan 🛡️", armor: def, preview: "none", use: 3, energyCost: 0, energyGain: 40, cooldown: 0 }
    },
    selebrasi: "none"
  };
}

async function saveCustomKhodam() {
  const name = elements.creatorNameInput.value.trim();
  if (!name) {
    showToast("Masukkan nama khodam terlebih dahulu.");
    return;
  }
  const previewSrc = elements.creatorCanvas.toDataURL("image/jpeg", 0.92);
  const key = createCustomKhodamKey(name);
  const customKhodam = createCustomKhodamObject(name, previewSrc);
  state.data[key] = customKhodam;
  state.khodamList.push(key);
  saveCustomKhodams();
  renderSelectionCards();
  selectPendingKhodam(key);
  showToast("Khodam baru berhasil dibuat.");
  closeCreatorScreen();
}

function isBattleSessionActive(sessionId) {
  return sessionId === state.battleSession && state.screen === "gameplay";
}

// ─── DATA FETCHING ────────────────────────────────────────────────────────────
async function fetchKhodamData() {
  const response = await fetch("khodam.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Gagal membaca khodam.json");
  return normalizeKhodamData(await response.json());
}

async function fetchEffectData() {
  const response = await fetch("effect.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Gagal membaca effect.json");
  return normalizeEffectData(await response.json());
}

async function fetchSfxData() {
  const response = await fetch("sfx.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Gagal membaca sfx.json");
  return normalizeSfxData(await response.json());
}

function normalizeKhodamData(rawData) {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData))
    throw new Error("Format khodam.json tidak valid");
  return rawData.khodam && typeof rawData.khodam === "object" ? rawData.khodam : rawData;
}

function normalizeEffectData(rawData) {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData))
    throw new Error("Format effect.json tidak valid");
  return rawData;
}

function normalizeSfxData(rawData) {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData))
    throw new Error("Format sfx.json tidak valid");
  return rawData;
}

function getKhodamMap() { return state.data || {}; }
function getEffectMap() { return state.effects || {}; }

// ─── ASSET HELPERS ────────────────────────────────────────────────────────────
function resolvePreviewMedia(src) {
  if (!src || src === "none") return src;
  return src.replace(/\.(mp4|webm)$/i, ".png");
}

function toAssetSlug(value) {
  return (khodamAssetAliases[value] || value).replace(/\s+/g, "").toLowerCase();
}

function getKhodamPreviewSrc(khodamKey, previewSrc = "none") {
  if (previewSrc && previewSrc !== "none") return resolvePreviewMedia(previewSrc);
  return `asset/${toAssetSlug(khodamKey)}.png`;
}

function getKhodamCelebrationSrc(khodamKey) {
  return getKhodamMap()[khodamKey]?.selebrasi || "none";
}

function getKhodamDisplayName(key) {
  const khodam = getKhodamMap()[key];
  return khodam?.name ? khodam.name : toTitleCase(key);
}

function createCustomKhodamKey(name) {
  const slug = String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `custom-${slug || "khodam"}-${Date.now()}`;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, precision = 2) {
  return parseFloat((min + Math.random() * (max - min)).toFixed(precision));
}

function loadCustomKhodams() {
  try {
    const raw = localStorage.getItem("customKhodams");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveCustomKhodams() {
  try {
    const customEntries = Object.entries(state.data || {}).filter(([key]) => key.startsWith("custom-"));
    const customData = Object.fromEntries(customEntries);
    localStorage.setItem("customKhodams", JSON.stringify(customData));
  } catch {
    // ignore storage failures
  }
}

function isVideoAsset(src) { return /\.(mp4|webm)$/i.test(src || ""); }

async function preloadVideo(src) {
  if (!src || src === "none") return;
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(video);
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const warmPlayback = () => {
      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise
          .then(() => {
            window.setTimeout(() => {
              video.pause();
              finish();
            }, 120);
          })
          .catch(() => {
            if (video.readyState >= 2) finish();
          });
      } else if (video.readyState >= 2) {
        finish();
      }
    };
    video.addEventListener("canplaythrough", finish, { once: true });
    video.addEventListener("loadeddata", warmPlayback, { once: true });
    video.addEventListener("loadedmetadata", warmPlayback, { once: true });
    video.addEventListener("error", finish, { once: true });
    window.setTimeout(finish, 15000);
    video.src = chooseCompatibleMedia(src);
    video.load();
  });
}

async function preloadImage(src) {
  if (!src || src === "none") return;
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = () => { if (settled) return; settled = true; resolve(); };
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
    window.setTimeout(finish, 8000);
    image.src = src;
  });
}

function queueAssetPreload(src) {
  if (!src || src === "none") return Promise.resolve();
  const resolvedSrc = isVideoAsset(src) ? chooseCompatibleMedia(src) : resolvePreviewMedia(src);
  if (state.assetCache.ready.has(resolvedSrc)) return Promise.resolve();
  const pending = state.assetCache.pending.get(resolvedSrc);
  if (pending) return pending;
  const preloadRequest = isVideoAsset(src) ? preloadVideo(src) : preloadImage(resolvedSrc);
  const request = preloadRequest.then(() => {
    state.assetCache.ready.add(resolvedSrc);
    state.assetCache.pending.delete(resolvedSrc);
  });
  state.assetCache.pending.set(resolvedSrc, request);
  return request;
}

function buildPreviewAssetList(data) {
  const assets = [];
  Object.entries(data).forEach(([khodamKey, khodam]) => {
    assets.push(getKhodamPreviewSrc(khodamKey, khodam.preview));
  });
  return [...new Set(assets)];
}

async function runEarlyCaching(data) {
  const assets = buildPreviewAssetList(data);
  const total = assets.length || 1;
  let loaded = 0;
  showScreen("cache");
  const BATCH_SIZE = 4;
  for (let i = 0; i < assets.length; i += BATCH_SIZE) {
    const batch = assets.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((asset) => queueAssetPreload(asset).then(() => {
      loaded += 1;
      const progress = Math.round((loaded / total) * 100);
      elements.progressFill.style.width = `${progress}%`;
      elements.progressText.textContent = String(progress);
    })));
  }
  if (!assets.length) {
    elements.progressFill.style.width = "100%";
    elements.progressText.textContent = "100";
  }
  await delay(250);
}

function buildMediaCandidates(src) {
  if (!src) return [];
  if (src.endsWith(".mp4")) return [{ type: "mp4", src }];
  if (src.endsWith(".webm")) return [{ type: "mp4", src: src.replace(/\.webm$/i, ".mp4") }];
  return [{ type: "mp4", src }];
}

function chooseCompatibleMedia(src) {
  const candidates = buildMediaCandidates(src);
  return candidates[0]?.src || src;
}

function applyImageSource(image, src) {
  if (!image || !src) return;
  const resolvedSrc = resolvePreviewMedia(src);
  if (image.getAttribute("src") === resolvedSrc) return;
  image.setAttribute("src", resolvedSrc);
}

function applyVideoSource(video, src) {
  if (!video || !src) return;
  const resolvedSrc = chooseCompatibleMedia(src);
  if (video.getAttribute("src") === resolvedSrc) return;
  video.pause();
  video.setAttribute("src", resolvedSrc);
  video.load();
  const playPromise = video.play();
  if (playPromise?.catch) playPromise.catch(() => {});
}

// ─── LOBBY / SELECTION ───────────────────────────────────────────────────────
function renderLobbySelection() {
  const khodam = getKhodamMap()[state.selectedKhodamKey];
  elements.lobbyKhodamName.textContent = getKhodamDisplayName(state.selectedKhodamKey);
  applyImageSource(elements.lobbyVideo, getKhodamPreviewSrc(state.selectedKhodamKey, khodam.preview));
}

function renderSelectionCards() {
  elements.selectionCards.innerHTML = "";
  state.khodamList.forEach((key) => {
    const khodam = getKhodamMap()[key];
    const card = document.createElement("div");
    card.className = "khodam-card";
    card.dataset.khodam = key;
    card.innerHTML = `
      <img src="${getKhodamPreviewSrc(key, khodam.preview)}" alt="${getKhodamDisplayName(key)}">
      <h2>${getKhodamDisplayName(key)}</h2>
    `;
    if (state.pendingKhodamKey === key) card.classList.add("is-selected");
    elements.selectionCards.appendChild(card);
  });
  renderSelectionHeader();
  syncSelectionButtons();
}

function renderSelectionHeader() {
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

function syncSelectionButtons() {
  const hasPending = Boolean(state.pendingKhodamKey);
  elements.confirmSelectionButton.style.display = hasPending ? "inline-block" : "none";
  const cards = elements.selectionCards.querySelectorAll(".khodam-card");
  cards.forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.khodam === state.pendingKhodamKey);
  });
  renderSelectionHeader();
  if (state.screen === "selection") resetSelectionIdleHint();
}

function openSelectionScreen() {
  state.pendingKhodamKey = null;
  syncSelectionButtons();
  showScreen("selection");
  resetSelectionIdleHint();
}

function closeSelectionScreen() {
  state.pendingKhodamKey = null;
  showScreen("lobby");
  syncSelectionButtons();
  resetLobbyIdleHint();
}

function selectPendingKhodam(key) {
  state.pendingKhodamKey = key;
  syncSelectionButtons();
}

function confirmPendingKhodam() {
  if (state.pendingKhodamKey) {
    state.selectedKhodamKey = state.pendingKhodamKey;
    renderLobbySelection();
  }
  closeSelectionScreen();
  resetLobbyIdleHint();
}

// ─── ORBIT (arena animation) ─────────────────────────────────────────────────
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

function startOrbitLoop() {
  if (state.orbit.rafId) cancelAnimationFrame(state.orbit.rafId);
  state.orbit.rafId = requestAnimationFrame(updateOrbitFrame);
}

function rotateOrbit(nextTurnOwner) {
  state.orbit.targetAngle = getOrbitAngleForTurnOwner(nextTurnOwner);
  state.orbit.isSwitching = true;
  return delay(600);
}

function resetOrbit() {
  const angle = getOrbitAngleForTurnOwner();
  state.orbit.angle = angle;
  state.orbit.targetAngle = angle;
  state.orbit.isSwitching = false;
}

// ─── BATTLE PARTICIPANT ───────────────────────────────────────────────────────
function createBattleParticipant(side, khodamKey, displayName) {
  const khodam = getKhodamMap()[khodamKey];
  const critical = khodam.critical || {};
  const buildAction = (actionKey) => {
    const base = khodam.action[actionKey] || {};
    const remaining = base.use === "unlimited" || typeof base.use === "undefined" ? undefined : Number(base.use);
    return {
      ...base, remaining,
      energyCost: Number(base.energyCost ?? 0),
      energyGain: Number(base.energyGain ?? 0),
      cooldown: Number(base.cooldown ?? 0),
      cooldownRemaining: 0
    };
  };
  return {
    side, khodamKey, displayName,
    hp: khodam.hp, maxHp: khodam.hp,
    energy: ENERGY_SETTINGS.perTurn,
    maxEnergy: ENERGY_SETTINGS.max,
    armor: 0,
    critical: { chance: Number(critical.chance) || 0, multiplier: Number(critical.multiplier) || 1 },
    effectAction: { effectKey: khodam.effect || null, chanceByAction: khodam.effectChance || {} },
    activeEffects: [],
    actions: {
      attack: buildAction("attack"),
      skill: buildAction("skill"),
      ultimate: buildAction("ultimate"),
      shield: buildAction("shield")
    }
  };
}

// ─── UI SYNC ──────────────────────────────────────────────────────────────────
function syncCombatantUi(side) {
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

  const energyPercent = clamp((participant.energy / (participant.maxEnergy || ENERGY_SETTINGS.max)) * 100, 0, 100);
  if (combatant.energyFill) combatant.energyFill.style.width = `${energyPercent}%`;
  if (combatant.energyText) combatant.energyText.textContent = `${Math.ceil(participant.energy)} / ${participant.maxEnergy || ENERGY_SETTINGS.max} ⚡`;

  const hpText = `${Math.ceil(participant.hp)} ❤️${participant.armor ? ` + ${participant.armor} 🛡️` : ""}`;
  if (combatant.hpText) combatant.hpText.textContent = hpText;
  if (combatant.meta) combatant.meta.textContent = hpText;

  const preview = getKhodamPreviewSrc(participant.khodamKey, getKhodamMap()[participant.khodamKey].preview);
  applyImageSource(combatant.art, preview);
}

function syncBattleUi() {
  syncCombatantUi("player");
  syncCombatantUi("opponent");
}

function showToast(message) {
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

function showDamageFloat(side, text) {
  const target = elements.combatants[side].float;
  target.textContent = text;
  target.classList.remove("show");
  void target.offsetWidth;
  target.classList.add("show");
}

function resetBattleFeedback() {
  if (state.toastTimerId) { window.clearTimeout(state.toastTimerId); state.toastTimerId = null; }
  elements.battleToast.classList.remove("show");
  Object.values(elements.combatants).forEach((combatant) => {
    combatant.float.classList.remove("show");
    combatant.float.textContent = "";
  });
}

function clearBotTurnTimeout() {
  if (state.botTurnTimeout) {
    clearTimeout(state.botTurnTimeout);
    state.botTurnTimeout = null;
  }
}

function clearCelebrationState() {
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

function playCardCelebration(side, src) {
  if (!src || src === "none") return delay(1800);

  const wrapper = elements.combatants[side]?.wrapper;
  const battleCard = wrapper?.querySelector(".battle-card");
  if (!battleCard) return delay(1800);

  const video = document.createElement("video");
  video.className = "card-celebration-video";
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.src = chooseCompatibleMedia(src);
  battleCard.appendChild(video);

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      video.pause();
      video.removeAttribute("src");
      video.remove();
      resolve();
    };
    video.addEventListener("ended", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
    const playPromise = video.play();
    if (playPromise?.catch) playPromise.catch(() => finish());
    window.setTimeout(finish, 3200);
  });
}

async function playBattleCelebration(result) {
  const winnerSide = result === "victory" ? "player" : "opponent";
  const loserSide = winnerSide === "player" ? "opponent" : "player";
  const winner = state.battle?.[winnerSide];
  if (!winner) return;

  stopAudio(state.audio.music.gameplay);
  state.audio.activeMusic = null;

  clearCelebrationState();
  state.turnOwner = winnerSide;
  syncBattleUi();
  await rotateOrbit(winnerSide);
  syncBattleUi();

  elements.combatants[winnerSide].wrapper.classList.add("is-celebrating");
  elements.combatants[loserSide].wrapper.classList.add("is-watching");
  showToast(`${getKhodamDisplayName(winner.khodamKey)} menang!`);

  const celebrationSrc = getKhodamCelebrationSrc(winner.khodamKey);
  await queueAssetPreload(celebrationSrc);
  await delay(520);
  await playFullscreenAnimation(celebrationSrc, "", { allowSkip: false, muted: false });
  clearCelebrationState();
}

// ─── ACTION BUTTONS ───────────────────────────────────────────────────────────
function getActionButtonLabel(button, actionKey) {
  const playerActionName = state.battle?.player?.actions?.[actionKey]?.name;
  if (playerActionName) return toTitleCase(playerActionName);
  if (!button.dataset.baseLabel) {
    button.dataset.baseLabel = button.textContent.trim() || actionMeta[actionKey]?.label || actionKey.toUpperCase();
  }
  return button.dataset.baseLabel;
}

function updateActionButtons() {
  const player = state.battle?.player;
  const disabled = state.isBattleBusy || state.turnOwner !== "player" || state.gameOver;

  elements.actionButtons.forEach((button) => {
    const actionKey = button.dataset.action;
    const actionData = player?.actions[actionKey];
    const label = getActionButtonLabel(button, actionKey);
    const remainingBadge = typeof actionData?.remaining === "number" ? `<span class="action-button-badge">${actionData.remaining}</span>` : "";
    const cooldownBadge = actionData?.cooldownRemaining > 0 ? `<span class="action-button-badge">⏳ ${actionData.cooldownRemaining}</span>` : "";
    const energyBadge = actionData?.energyCost > 0 ? `<span class="action-button-badge">⚡ ${actionData.energyCost}</span>` : "";
    const badgeGroup = remainingBadge || cooldownBadge || energyBadge
      ? `<span class="action-button-badges">${remainingBadge}${cooldownBadge}${energyBadge}</span>` : "";
    button.innerHTML = `<span class="action-button-label">${label}</span>${badgeGroup}`;

    const notEnoughEnergy = actionData?.energyCost > (player?.energy || 0);
    const onCooldown = actionData?.cooldownRemaining > 0;
    const noUses = typeof actionData?.remaining === "number" && actionData.remaining <= 0;
    const blockedByEffect = player ? isActionDisabledByEffects(player, actionKey) : false;
    button.disabled = disabled || notEnoughEnergy || onCooldown || noUses || blockedByEffect;
  });
  if (state.screen === "gameplay") resetActionIdleHint();
}

// ─── FULLSCREEN ANIMATION ─────────────────────────────────────────────────────
async function playFullscreenAnimation(src, quote, options = {}) {
  if (!src || src === "none") return;
  const { allowSkip = true, muted = false, pauseGameplayMusic = false } = options;
  const gameplayMusic = state.audio.music.gameplay;
  const shouldResumeGameplayMusic = Boolean(
    pauseGameplayMusic &&
    gameplayMusic &&
    state.audio.activeMusic === gameplayMusic &&
    !gameplayMusic.paused
  );

  await queueAssetPreload(src);
  if (pauseGameplayMusic && gameplayMusic && !gameplayMusic.paused) {
    gameplayMusic.pause();
  }

  showOverlay(overlays.fullscreen, true);
  showOverlay(overlays.skip, allowSkip);
  if (quote) {
    elements.kataText.textContent = `"${quote}"`;
    showOverlay(overlays.kata, true);
  } else {
    showOverlay(overlays.kata, false);
  }
  const video = elements.fullscreenVideo;
  video.muted = muted;
  video.volume = muted ? 0 : 1;
  applyVideoSource(video, src);
  video.currentTime = 0;
  await new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      state.activeAnimationResolver = null;
      video.removeEventListener("ended", finish);
      elements.skipAnimationButton.removeEventListener("click", finish);
      resolve();
    };
    state.activeAnimationResolver = finish;
    video.addEventListener("ended", finish, { once: true });
    if (allowSkip) elements.skipAnimationButton.addEventListener("click", finish, { once: true });
    const playPromise = video.play();
    if (playPromise?.catch) playPromise.catch(() => finish());
  });
  video.pause();
  video.muted = true;
  video.volume = 0;
  showOverlay(overlays.fullscreen, false);
  showOverlay(overlays.skip, false);
  showOverlay(overlays.kata, false);

  if (
    shouldResumeGameplayMusic &&
    state.screen === "gameplay" &&
    !state.gameOver &&
    !overlays.fullscreen.classList.contains("overlay-visible")
  ) {
    tryPlayAudio(gameplayMusic);
  }
}

function stopFullscreenAnimation() {
  if (state.activeAnimationResolver) state.activeAnimationResolver();
  const video = elements.fullscreenVideo;
  video.pause();
  video.currentTime = 0;
  video.removeAttribute("src");
  video.load();
  showOverlay(overlays.fullscreen, false);
  showOverlay(overlays.skip, false);
  showOverlay(overlays.kata, false);
}

function getParticipantActionAssets(participant) {
  if (!participant) return [];
  const assets = ["skill", "ultimate"]
    .map((actionKey) => participant.actions[actionKey]?.preview)
    .filter((src) => src && src !== "none");
  const celebration = getKhodamCelebrationSrc(participant.khodamKey);
  if (celebration && celebration !== "none") assets.push(celebration);
  return assets;
}

async function warmupBattleAssets(onProgress) {
  const assets = [
    ...getParticipantActionAssets(state.battle?.player),
    ...getParticipantActionAssets(state.battle?.opponent)
  ];
  const uniqueAssets = [...new Set(assets)];
  if (!uniqueAssets.length) { onProgress?.(100, 0, 0); return; }
  let loaded = 0;
  onProgress?.(0, loaded, uniqueAssets.length);
  await Promise.all(uniqueAssets.map((src) => queueAssetPreload(src).then(() => {
    loaded += 1;
    onProgress?.(Math.round((loaded / uniqueAssets.length) * 100), loaded, uniqueAssets.length);
  })));
}

// ─── BATTLE MECHANICS ─────────────────────────────────────────────────────────
function applyDamage(target, amount) {
  const armorBlocked = Math.min(target.armor, amount);
  target.armor -= armorBlocked;
  const hpDamage = amount - armorBlocked;
  target.hp = Math.max(0, target.hp - hpDamage);
  return { armorBlocked, hpDamage, total: amount };
}

function rollCritical(participant, amount) {
  const chance = clamp(Number(participant?.critical?.chance) || 0, 0, 100);
  const multiplier = Math.max(Number(participant?.critical?.multiplier) || 1, 1);
  const triggered = chance > 0 && Math.random() * 100 < chance;
  const total = triggered ? Math.max(1, Math.round(amount * multiplier)) : amount;
  return { triggered, chance, multiplier, total };
}

function applyShield(target, amount) {
  target.armor += amount;
  return amount;
}

function getEffectDefinition(effectKey) { return getEffectMap()[effectKey] || null; }

function normalizeActionList(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => String(item || "").trim()).filter(Boolean);
}

function isSupportEffect(effectConfig = {}) {
  return Boolean(
    effectConfig.healPerTurn || effectConfig.armorPerTurn || effectConfig.getEnergy ||
    effectConfig.removeEffect || effectConfig.damageIncrease || effectConfig.hpDrain || effectConfig.hpFlip
  );
}

function getEffectRecipient(actor, target, effectConfig = {}) {
  if (effectConfig.target === "sendiri") return actor;
  if (effectConfig.target === "musuh") return target;
  return isSupportEffect(effectConfig) ? actor : target;
}

function getActionEffectChance(participant, actionKey) {
  return clamp(Number(participant?.effectAction?.chanceByAction?.[actionKey]) || 0, 0, 1);
}

function findActiveEffect(participant, effectKey) {
  return participant.activeEffects.find((effect) => effect.key === effectKey);
}

function addOrRefreshEffect(participant, effectKey, effectConfig) {
  const existingEffect = findActiveEffect(participant, effectKey);
  if (existingEffect) {
    existingEffect.remainingTurns = Math.max(existingEffect.remainingTurns, Number(effectConfig.duration) || 0);
    return existingEffect;
  }
  const activeEffect = { key: effectKey, remainingTurns: Number(effectConfig.duration) || 0, config: effectConfig };
  participant.activeEffects.push(activeEffect);
  return activeEffect;
}

function removeExpiredEffects(participant) {
  participant.activeEffects = participant.activeEffects.filter((effect) => effect.remainingTurns > 0);
}

function clearEffects(participant) { participant.activeEffects = []; }

function getDamageMultiplier(participant) {
  const bonusPercent = participant.activeEffects.reduce((total, effect) => total + (Number(effect.config?.damageIncrease) || 0), 0);
  return 1 + bonusPercent / 100;
}

function isActionDisabledByEffects(participant, actionKey) {
  return participant.activeEffects.some((effect) => {
    const disabledActions = normalizeActionList(effect.config?.disableActions);
    return disabledActions.includes(actionKey);
  });
}

function applyCooldownEffect(participant, effectConfig) {
  const affectedActions = normalizeActionList(effectConfig.addCooldown);
  const cooldownIncrease = Number(effectConfig.cooldownIncrease) || 0;
  if (!affectedActions.length || cooldownIncrease <= 0) return false;
  affectedActions.forEach((actionKey) => {
    const action = participant.actions[actionKey];
    if (action) action.cooldownRemaining += cooldownIncrease;
  });
  return true;
}

function applyImmediateEffect(actor, target, effectKey, effectConfig) {
  if (effectConfig.removeEffect) {
    clearEffects(actor);
    return { applied: true, toast: `${getKhodamDisplayName(actor.khodamKey)} menggunakan ${effectKey}` };
  }
  if (effectConfig.getEnergy) {
    const gained = Number(effectConfig.getEnergy) || 0;
    actor.energy = clamp(actor.energy + gained, 0, actor.maxEnergy || ENERGY_SETTINGS.max);
    return { applied: true, toast: `${getKhodamDisplayName(actor.khodamKey)} menggunakan ${effectKey}` };
  }
  if (effectConfig.hpFlip) {
    const actorHp = actor.hp;
    actor.hp = clamp(target.hp, 0, actor.maxHp);
    target.hp = clamp(actorHp, 0, target.maxHp);
    return { applied: true, toast: `${getKhodamDisplayName(actor.khodamKey)} menggunakan ${effectKey}` };
  }
  if (applyCooldownEffect(target, effectConfig)) {
    return { applied: true, toast: `${getKhodamDisplayName(target.khodamKey)} terkena cooldown` };
  }
  return { applied: false, toast: "" };
}

function tryApplyActionEffect(actor, target, actionKey) {
  const effectKey = actor.effectAction?.effectKey;
  const effectConfig = getEffectDefinition(effectKey);
  const chance = getActionEffectChance(actor, actionKey);
  if (!effectKey || !effectConfig || chance <= 0 || Math.random() > chance) return null;
  const recipient = getEffectRecipient(actor, target, effectConfig);
  const immediateResult = applyImmediateEffect(actor, target, effectKey, effectConfig);
  if (immediateResult.applied) {
    return { effectKey, recipient: recipient.side, toast: immediateResult.toast };
  }
  if (Number(effectConfig.duration) > 0) {
    addOrRefreshEffect(recipient, effectKey, effectConfig);
    return {
      effectKey, recipient: recipient.side,
      toast: effectConfig.target === "sendiri"
        ? `${getKhodamDisplayName(actor.khodamKey)} menggunakan ${effectKey}`
        : `${getKhodamDisplayName(recipient.khodamKey)} terkena ${effectKey}`
    };
  }
  return null;
}

function resolveTurnEffects(participant) {
  const events = [];
  participant.activeEffects.forEach((effect) => {
    const effectConfig = effect.config || {};
    if (effectConfig.damagePerTurn) {
      const amount = Number(effectConfig.damagePerTurn) || 0;
      const result = applyDamage(participant, amount);
      events.push(`-${result.total} ${effect.key}`);
    }
    if (effectConfig.healPerTurn) {
      const healed = Number(effectConfig.healPerTurn) || 0;
      participant.hp = clamp(participant.hp + healed, 0, participant.maxHp);
      events.push(`+${healed} HP`);
    }
    if (effectConfig.armorPerTurn) {
      const armorGain = Number(effectConfig.armorPerTurn) || 0;
      participant.armor += armorGain;
      events.push(`+${armorGain} armor`);
    }
    if (effectConfig.hpDrain) {
      const drain = Number(effectConfig.hpDrain) || 0;
      participant.hp = clamp(participant.hp - drain, 0, participant.maxHp);
      events.push(`-${drain} HP`);
    }
    if (typeof effect.remainingTurns === "number" && effect.remainingTurns > 0) {
      effect.remainingTurns -= 1;
    }
  });
  removeExpiredEffects(participant);
  return events;
}

function getUsableActions(participant) {
  return Object.entries(participant.actions)
    .filter(([actionKey, action]) => {
      const hasUses = typeof action.remaining !== "number" || action.remaining > 0;
      const hasEnergy = !action.energyCost || participant.energy >= action.energyCost;
      const offCooldown = !action.cooldownRemaining || action.cooldownRemaining <= 0;
      const notBlocked = !isActionDisabledByEffects(participant, actionKey);
      return hasUses && hasEnergy && offCooldown && notBlocked;
    })
    .map(([key]) => key);
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function pickBotKhodamKey(playerKhodamKey) {
  const pool = state.khodamList.filter((key) => key !== playerKhodamKey);
  const source = pool.length ? pool : state.khodamList;
  return source[Math.floor(Math.random() * source.length)] || playerKhodamKey;
}

function chooseBotAction(participant, target) {
  const usable = getUsableActions(participant);
  if (!usable.length) return null;

  const finisher = usable.find((actionKey) => {
    if (actionKey === "shield") return false;
    const action = participant.actions[actionKey];
    return Number(action?.damage || 0) >= target.hp + target.armor;
  });
  if (finisher) return finisher;

  if (participant.hp <= participant.maxHp * 0.35 && usable.includes("shield")) return "shield";
  if (usable.includes("ultimate")) return "ultimate";
  if (usable.includes("skill")) return "skill";
  if (usable.includes("attack")) return "attack";
  return usable[0];
}

async function enterBotBattle() {
  state.battleMode = "bot";
  state.battleSession += 1;
  state.turnOwner = "player";
  resetOrbit();
  clearCelebrationState();
  resetBattleFeedback();
  clearBotTurnTimeout();
  state.gameOver = false;
  state.isBattleBusy = false;

  syncBattleUi();
  showScreen("gameplay");
  playMusic("gameplay");
  showOverlay(overlays.actionMenu, true);
  showOverlay(overlays.surrender, true);
  startOrbitLoop();
  updateActionButtons();
  showToast("Lawan bot ditemukan!");
}

async function startBotBattle(playerName, khodamKey) {
  const botKhodamKey = pickBotKhodamKey(khodamKey);
  resetOnlineMatchState();

  state.battle = {
    playerName,
    player: createBattleParticipant("player", khodamKey, playerName),
    opponent: createBattleParticipant("opponent", botKhodamKey, "BOT")
  };

  await warmupBattleAssets();
  await enterBotBattle();
}

async function beginLocalPlayerTurn() {
  if (state.gameOver || state.screen !== "gameplay" || state.battleMode !== "bot") return;

  const actor = state.battle.player;
  actor.energy = clamp(actor.energy + ENERGY_SETTINGS.perTurn, 0, actor.maxEnergy || ENERGY_SETTINGS.max);
  Object.values(actor.actions).forEach((action) => {
    if (action.cooldownRemaining > 0) action.cooldownRemaining = Math.max(0, action.cooldownRemaining - 1);
  });

  const effectEvents = resolveTurnEffects(actor);
  syncBattleUi();

  if (effectEvents.length) {
    showToast(`${getKhodamDisplayName(actor.khodamKey)} ${effectEvents.join(", ")}`);
    await delay(700);
  }

  if (actor.hp <= 0) {
    await finishBattle("defeat");
    return;
  }

  const usable = getUsableActions(actor);
  if (!usable.length) {
    showToast(`${getKhodamDisplayName(actor.khodamKey)} tidak bisa bertindak`);
    await delay(700);
    await rotateOrbit("opponent");
    await beginBotTurn();
    return;
  }

  state.isBattleBusy = false;
  state.turnOwner = "player";
  updateActionButtons();
  showToast("Giliran kamu!");
}

async function beginBotTurn() {
  if (state.gameOver || state.screen !== "gameplay" || state.battleMode !== "bot") return;

  clearBotTurnTimeout();
  state.isBattleBusy = true;
  state.turnOwner = "opponent";
  updateActionButtons();

  state.botTurnTimeout = setTimeout(async () => {
    state.botTurnTimeout = null;
    if (state.gameOver || state.screen !== "gameplay" || state.battleMode !== "bot") return;

    const actor = state.battle.opponent;
    actor.energy = clamp(actor.energy + ENERGY_SETTINGS.perTurn, 0, actor.maxEnergy || ENERGY_SETTINGS.max);
    Object.values(actor.actions).forEach((action) => {
      if (action.cooldownRemaining > 0) action.cooldownRemaining = Math.max(0, action.cooldownRemaining - 1);
    });

    const effectEvents = resolveTurnEffects(actor);
    syncBattleUi();

    if (effectEvents.length) {
      showToast(`${getKhodamDisplayName(actor.khodamKey)} ${effectEvents.join(", ")}`);
      await delay(700);
    }

    if (actor.hp <= 0) {
      await finishBattle("victory");
      return;
    }

    const actionKey = chooseBotAction(actor, state.battle.player);
    if (!actionKey) {
      showToast(`${getKhodamDisplayName(actor.khodamKey)} tidak bisa bertindak`);
      await delay(700);
      await rotateOrbit("player");
      await beginLocalPlayerTurn();
      return;
    }

    await runBotAction(actionKey);
  }, 900);
}

async function runBotAction(actionKey) {
  if (state.gameOver || state.screen !== "gameplay" || state.battleMode !== "bot") return;

  const opponent = state.battle.opponent;
  const player = state.battle.player;
  const action = opponent.actions[actionKey];
  if (!action) return;
  playActionSfx(actionKey);

  await queueAssetPreload(action.preview);
  await playFullscreenAnimation(action.preview, action.katakata || "", {
    pauseGameplayMusic: actionKey === "skill" || actionKey === "ultimate"
  });

  if (state.screen !== "gameplay" || state.battleMode !== "bot") return;

  if (action.cooldown > 0) action.cooldownRemaining = action.cooldown;
  opponent.energy = clamp(opponent.energy - (action.energyCost || 0) + (action.energyGain || 0), 0, ENERGY_SETTINGS.max);
  if (typeof action.remaining === "number") action.remaining -= 1;

  if (actionKey === "shield") {
    const gainedArmor = Number(action.armor) || 0;
    applyShield(opponent, gainedArmor);
    showDamageFloat("opponent", `+${gainedArmor}`);
  } else {
    const damageWithEffects = Math.max(0, Math.round((Number(action.damage) || 0) * getDamageMultiplier(opponent)));
    const critResult = rollCritical(opponent, damageWithEffects);
    const result = applyDamage(player, critResult.total);
    showDamageFloat("player", critResult.triggered ? `CRIT! -${result.total}` : `-${result.total}`);
    if (critResult.triggered) showToast(`${getKhodamDisplayName(opponent.khodamKey)} CRITICAL x${critResult.multiplier.toFixed(1)}`);
  }

  const effectResult = tryApplyActionEffect(opponent, player, actionKey);
  if (effectResult?.toast) showToast(effectResult.toast);

  syncBattleUi();
  await delay(420);
  await rotateOrbit("player");

  if (state.screen !== "gameplay" || state.battleMode !== "bot") return;

  syncBattleUi();

  if (player.hp <= 0) {
    await finishBattle("defeat");
    return;
  }

  await beginLocalPlayerTurn();
}

async function runLocalBotPlayerAction(actionKey) {
  const sessionId = state.battleSession;
  const actor = state.battle.player;
  const target = state.battle.opponent;
  const action = actor.actions[actionKey];

  if (!action) return;
  if (action.cooldownRemaining > 0) { showToast(`${actionKey.toUpperCase()} cooldown ${action.cooldownRemaining}`); return; }
  if (isActionDisabledByEffects(actor, actionKey)) { showToast(`${actionKey.toUpperCase()} sedang terkunci`); return; }
  if (typeof action.remaining === "number" && action.remaining <= 0) return;
  if (action.energyCost > 0 && actor.energy < action.energyCost) { showToast("Energi tidak cukup!"); return; }

  actor.energy = clamp(actor.energy - action.energyCost + action.energyGain, 0, ENERGY_SETTINGS.max);
  if (action.cooldown > 0) action.cooldownRemaining = action.cooldown;
  playActionSfx(actionKey);

  state.isBattleBusy = true;
  updateActionButtons();

  if (actionKey === "shield") {
    const gainedArmor = Number(action.armor) || 0;
    applyShield(actor, gainedArmor);
    showDamageFloat("player", `+${gainedArmor}`);
  } else {
    const damageWithEffects = Math.max(0, Math.round((Number(action.damage) || 0) * getDamageMultiplier(actor)));
    const critResult = rollCritical(actor, damageWithEffects);
    const result = applyDamage(target, critResult.total);
    showDamageFloat("opponent", critResult.triggered ? `CRIT! -${result.total}` : `-${result.total}`);
    if (critResult.triggered) showToast(`${getKhodamDisplayName(actor.khodamKey)} CRITICAL x${critResult.multiplier.toFixed(1)}`);
  }

  const effectResult = tryApplyActionEffect(actor, target, actionKey);
  if (effectResult?.toast) showToast(effectResult.toast);

  if (typeof action.remaining === "number") action.remaining -= 1;

  syncBattleUi();

  await queueAssetPreload(action.preview);
  await playFullscreenAnimation(action.preview, action.katakata || "", {
    pauseGameplayMusic: actionKey === "skill" || actionKey === "ultimate"
  });

  if (!isBattleSessionActive(sessionId) || state.battleMode !== "bot") return;

  await delay(420);
  await rotateOrbit("opponent");

  if (!isBattleSessionActive(sessionId) || state.battleMode !== "bot") return;
  syncBattleUi();

  if (target.hp <= 0) {
    await finishBattle("victory");
    return;
  }

  await beginBotTurn();
}

async function runPlayerAction(actionKey) {
  if (state.battleMode === "bot") {
    await runLocalBotPlayerAction(actionKey);
    return;
  }
  await runOnlineAction("player", actionKey);
}

function openModal({
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

function closeModal(result) {
  showOverlay(overlays.modal, false);
  overlays.modal.classList.remove("result-layout", "victory-layout", "defeat-layout");
  if (state.modalResolver) { state.modalResolver(result); state.modalResolver = null; }
}

// ─── ONLINE: FIREBASE HELPERS ────────────────────────────────────────────────

function addOnlineListener(refObj, callback) {
  onValue(refObj, callback);
  state.online.listeners.push({ refObj, callback });
}

function detachAllOnlineListeners() {
  state.online.listeners.forEach(({ refObj, callback }) => off(refObj, "value", callback));
  state.online.listeners = [];
}

function clearWaitingTimeout() {
  if (state.online.waitingTimeout) {
    clearTimeout(state.online.waitingTimeout);
    state.online.waitingTimeout = null;
  }
}

function clearMatchmakingListener() {
  if (state.online.matchmakingRef && state.online.matchmakingCallback) {
    off(state.online.matchmakingRef, "value", state.online.matchmakingCallback);
  }
  state.online.matchmakingRef = null;
  state.online.matchmakingCallback = null;
}

function resetOnlineMatchState() {
  clearWaitingTimeout();
  clearMatchmakingListener();
  detachAllOnlineListeners();
  state.online.roomId = null;
  state.online.mySide = null;
}

// Serialize battle participant for Firebase (remove circular / function refs)
// Replace undefined with null recursively so Firebase doesn't reject the payload
function sanitizeForFirebase(obj) {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirebase);
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = sanitizeForFirebase(value);
  }
  return result;
}

function serializeParticipant(p) {
  return sanitizeForFirebase({
    side: p.side,
    khodamKey: p.khodamKey,
    displayName: p.displayName,
    hp: p.hp,
    maxHp: p.maxHp,
    energy: p.energy,
    maxEnergy: p.maxEnergy,
    armor: p.armor,
    critical: p.critical,
    effectAction: p.effectAction,
    activeEffects: p.activeEffects,
    actions: p.actions
  });
}

// Restore serialized participant back to full object
// Firebase may turn arrays into objects and strip undefined — fix both here
function deserializeParticipant(data, side) {
  // Firebase can turn arrays into keyed objects — convert back
  let activeEffects = data.activeEffects || [];
  if (!Array.isArray(activeEffects)) {
    activeEffects = Object.values(activeEffects);
  }
  // Restore effect.config from effectMap in case it was lost
  activeEffects = activeEffects.map((effect) => {
    if (!effect.config && effect.key) {
      effect = { ...effect, config: getEffectMap()[effect.key] || {} };
    }
    return effect;
  });

  // Also fix actions — remaining: null should stay null (unlimited), not break
  const actions = data.actions || {};

  return {
    ...data,
    side,
    activeEffects,
    actions
  };
}

// Push the full battle state of the local player to Firebase
async function pushMyStateToFirebase() {
  const { roomId, mySide } = state.online;
  if (!roomId || !mySide) return;
  const myKey = mySide === "host" ? "hostState" : "guestState";
  await update(ref(db, `rooms/${roomId}`), {
    [myKey]: serializeParticipant(state.battle.player)
  });
}

// Write an action event to Firebase so the opponent sees it
async function pushActionToFirebase(actionKey, resolvedDamage, resolvedArmor, critTriggered, critMultiplier, effectResult, randomSeed) {
  const { roomId, mySide } = state.online;
  if (!roomId || !mySide) return;
  await update(ref(db, `rooms/${roomId}`), {
    lastAction: {
      actor: mySide,
      actionKey,
      resolvedDamage: resolvedDamage ?? null,
      resolvedArmor: resolvedArmor ?? null,
      critTriggered: critTriggered ?? false,
      critMultiplier: critMultiplier ?? 1,
      effectResult: effectResult ?? null,
      randomSeed,
      ts: Date.now()
    }
  });
}

async function pushTurnToFirebase(nextTurn) {
  const { roomId } = state.online;
  if (!roomId) return;
  await update(ref(db, `rooms/${roomId}`), { currentTurn: nextTurn, lastAction: null });
}

async function pushGameOverToFirebase(winner) {
  const { roomId } = state.online;
  if (!roomId) return;
  await update(ref(db, `rooms/${roomId}`), { gameOver: winner });
}

// ─── ONLINE: MATCHMAKING ─────────────────────────────────────────────────────

async function startMatchmaking() {
  const { playerId } = state.online;
  const playerName = getPlayerDisplayName();
  const khodamKey = state.selectedKhodamKey;
  resetOnlineMatchState();
  clearBotTurnTimeout();
  stopAllMusic();
  state.battleMode = null;

  showScreen("search");
  showOverlay(overlays.actionMenu, false);
  showOverlay(overlays.surrender, false);

  try {
    // Check for an open waiting room
    const queueSnap = await get(ref(db, "queue"));
    let foundRoom = null;

    if (queueSnap.exists()) {
      const entries = queueSnap.val();
      for (const [roomId, entry] of Object.entries(entries)) {
        // Ignore stale entries older than 30 s
        if (entry.playerId === playerId) continue;
        if (Date.now() - entry.ts > 30000) continue;
        foundRoom = { roomId, host: entry };
        break;
      }
    }

    if (foundRoom) {
      state.battleMode = "online";
      // Join as guest
      const { roomId, host } = foundRoom;
      state.online.roomId = roomId;
      state.online.mySide = "guest";

      // Remove from queue
      await remove(ref(db, `queue/${roomId}`));

      // Build room data
      const hostParticipant = createBattleParticipant("opponent", host.khodamKey, host.playerName);
      const guestParticipant = createBattleParticipant("player", khodamKey, playerName);

      state.battle = {
        playerName,
        player: guestParticipant,
        opponent: deserializeParticipant({ ...createBattleParticipant("opponent", host.khodamKey, host.playerName) }, "opponent")
      };

      await set(ref(db, `rooms/${roomId}`), {
        host: { playerId: host.playerId, khodamKey: host.khodamKey, playerName: host.playerName },
        guest: { playerId, khodamKey, playerName },
        hostState: serializeParticipant(createBattleParticipant("player", host.khodamKey, host.playerName)),
        guestState: serializeParticipant(guestParticipant),
        currentTurn: "host",   // host always goes first
        lastAction: null,
        gameOver: null,
        createdAt: Date.now()
      });

      await warmupBattleAssets();
      enterOnlineBattle();

    } else {
      // Create a new room, wait as host
      state.battleMode = "online";
      state.online.mySide = "host";
      const newRoomRef = push(ref(db, "queue"));
      const roomId = newRoomRef.key;
      state.online.roomId = roomId;

      await set(ref(db, `queue/${roomId}`), {
        playerId,
        khodamKey,
        playerName,
        ts: Date.now()
      });

      // Wait for guest to join (listen on rooms/{roomId})
      showToast("Menunggu lawan...");

      // Fallback ke bot kalau 10 detik belum dapat lawan
      state.online.waitingTimeout = setTimeout(async () => {
        clearWaitingTimeout();
        clearMatchmakingListener();
        try { await remove(ref(db, `queue/${roomId}`)); } catch (_) {}
        showToast("Tidak ada lawan, masuk bot...");
        await startBotBattle(playerName, khodamKey);
      }, MATCHMAKING_BOT_TIMEOUT_MS);

      // Listen for room creation by guest
      const roomRef = ref(db, `rooms/${roomId}`);
      const matchmakingCallback = async (snap) => {
        if (!snap.exists() || state.online.roomId !== roomId || state.battleMode !== "online") return;
        clearMatchmakingListener();
        clearWaitingTimeout();

        const roomData = snap.val();
        // Build local state from room data
        const guestInfo = roomData.guest;
        state.battle = {
          playerName,
          player: deserializeParticipant(roomData.hostState, "player"),
          opponent: deserializeParticipant(roomData.guestState, "opponent")
        };
        // Sync opponent's display name
        state.battle.opponent.displayName = guestInfo.playerName;

        await warmupBattleAssets();
        enterOnlineBattle();
      };
      state.online.matchmakingRef = roomRef;
      state.online.matchmakingCallback = matchmakingCallback;
      onValue(roomRef, matchmakingCallback);
    }
  } catch (err) {
    console.error("Matchmaking error:", err);
    resetOnlineMatchState();
    state.battleMode = null;
    showToast("Gagal konek ke server!");
    showScreen("lobby");
  }
}

// ─── ONLINE: BATTLE ENTRY ────────────────────────────────────────────────────

function enterOnlineBattle() {
  state.battleMode = "online";
  state.battleSession += 1;
  // Host goes first
  state.turnOwner = state.online.mySide === "host" ? "player" : "opponent";
  resetOrbit();
  clearCelebrationState();
  resetBattleFeedback();
  clearBotTurnTimeout();
  state.gameOver = false;
  state.isBattleBusy = false;

  syncBattleUi();
  showScreen("gameplay");
  playMusic("gameplay");
  showOverlay(overlays.actionMenu, true);
  showOverlay(overlays.surrender, true);
  startOrbitLoop();
  updateActionButtons();

  listenOnlineRoom();

  showToast("PERTARUNGAN DIMULAI!");
}

// ─── ONLINE: ROOM LISTENER ───────────────────────────────────────────────────

function listenOnlineRoom() {
  const { roomId, mySide } = state.online;
  if (!roomId) return;

  detachAllOnlineListeners();

  // ── Listen for opponent's state changes ──
  const opponentStateKey = mySide === "host" ? "guestState" : "hostState";
  const opponentStateRef = ref(db, `rooms/${roomId}/${opponentStateKey}`);
  addOnlineListener(opponentStateRef, (snap) => {
    if (!snap.exists() || state.screen !== "gameplay") return;
    const data = snap.val();
    // Merge into local opponent object (hp, energy, armor, activeEffects, actions)
    Object.assign(state.battle.opponent, {
      hp: data.hp,
      maxHp: data.maxHp,
      energy: data.energy,
      maxEnergy: data.maxEnergy,
      armor: data.armor,
      activeEffects: data.activeEffects || [],
      actions: data.actions
    });
    syncBattleUi();
  });

  // ── Listen for lastAction (opponent's move) ──
  const lastActionRef = ref(db, `rooms/${roomId}/lastAction`);
  addOnlineListener(lastActionRef, async (snap) => {
    if (!snap.exists()) return;
    const action = snap.val();
    // Only react to opponent's actions (not our own echoed back)
    if (action.actor === mySide) return;
    if (state.screen !== "gameplay" || state.gameOver) return;

    await handleOpponentAction(action);
  });

  // ── Listen for currentTurn ──
  const turnRef = ref(db, `rooms/${roomId}/currentTurn`);
  addOnlineListener(turnRef, (snap) => {
    if (!snap.exists()) return;
    const currentTurn = snap.val();
    const isMyTurn = (currentTurn === "host" && mySide === "host") || (currentTurn === "guest" && mySide === "guest");
    state.turnOwner = isMyTurn ? "player" : "opponent";
    state.isBattleBusy = !isMyTurn;
    updateActionButtons();
    if (isMyTurn) showToast("Giliran kamu!");
  });

  // ── Listen for game over ──
  const gameOverRef = ref(db, `rooms/${roomId}/gameOver`);
  addOnlineListener(gameOverRef, async (snap) => {
    if (!snap.exists() || !snap.val()) return;
    const winner = snap.val(); // "host" | "guest"
    if (state.gameOver) return;
    const iWon = winner === mySide;
    await finishBattle(iWon ? "victory" : "defeat");
  });
}

// ─── ONLINE: HANDLE OPPONENT'S ACTION ────────────────────────────────────────

async function handleOpponentAction(actionData) {
  const { actionKey, resolvedDamage, resolvedArmor, critTriggered, critMultiplier, effectResult } = actionData;

  state.isBattleBusy = true;
  updateActionButtons();
  playActionSfx(actionKey);

  const opponent = state.battle.opponent;
  const player = state.battle.player;
  const action = opponent.actions[actionKey];

  if (!action) { state.isBattleBusy = false; return; }

  await queueAssetPreload(action.preview);
  await playFullscreenAnimation(action.preview, "", {
    pauseGameplayMusic: actionKey === "skill" || actionKey === "ultimate"
  });

  if (state.screen !== "gameplay") return;

  if (actionKey === "shield") {
    const gained = resolvedArmor ?? 0;
    opponent.armor += gained;
    showDamageFloat("opponent", `+${gained}`);
  } else {
    // Apply pre-computed damage from opponent
    const total = resolvedDamage ?? 0;
    const armorBlocked = Math.min(player.armor, total);
    player.armor -= armorBlocked;
    player.hp = Math.max(0, player.hp - (total - armorBlocked));
    showDamageFloat("player", critTriggered ? `CRIT! -${total}` : `-${total}`);
    if (critTriggered) showToast(`${getKhodamDisplayName(opponent.khodamKey)} CRITICAL x${critMultiplier?.toFixed(1)}`);
  }

  // Apply effect from opponent if any
  if (effectResult) {
    const effectConfig = getEffectDefinition(effectResult.effectKey);
    if (effectConfig) {
      // Effect targeting us (the player)
      if (effectResult.recipient === (state.online.mySide === "host" ? "host" : "guest")) {
        addOrRefreshEffect(player, effectResult.effectKey, effectConfig);
        showToast(`${getKhodamDisplayName(player.khodamKey)} terkena ${effectResult.effectKey}`);
      } else {
        // Effect on opponent themselves
        addOrRefreshEffect(opponent, effectResult.effectKey, effectConfig);
        showToast(`${getKhodamDisplayName(opponent.khodamKey)} menggunakan ${effectResult.effectKey}`);
      }
    }
  }

  if (typeof action.remaining === "number") action.remaining -= 1;
  if (action.cooldown > 0) action.cooldownRemaining = action.cooldown;
  opponent.energy = clamp(opponent.energy - (action.energyCost || 0) + (action.energyGain || 0), 0, ENERGY_SETTINGS.max);

  syncBattleUi();
  await delay(420);
  await rotateOrbit("player");

  if (state.screen !== "gameplay") return;

  syncBattleUi();

  // Check if we're dead
  if (player.hp <= 0) {
    if (!state.gameOver) await pushGameOverToFirebase(state.online.mySide === "host" ? "guest" : "host");
    return;
  }

  // Now it's our turn — push turn change
  await pushTurnToFirebase(state.online.mySide);

  // Apply our start-of-turn effects
  await beginMyTurn();
}

// ─── ONLINE: BEGIN / END TURN ─────────────────────────────────────────────────

async function beginMyTurn() {
  if (state.gameOver || state.screen !== "gameplay") return;

  const actor = state.battle.player;
  actor.energy = clamp(actor.energy + ENERGY_SETTINGS.perTurn, 0, actor.maxEnergy || ENERGY_SETTINGS.max);
  Object.values(actor.actions).forEach((a) => {
    if (a.cooldownRemaining > 0) a.cooldownRemaining = Math.max(0, a.cooldownRemaining - 1);
  });

  const effectEvents = resolveTurnEffects(actor);
  syncBattleUi();
  await pushMyStateToFirebase();

  if (effectEvents.length) {
    showToast(`${getKhodamDisplayName(actor.khodamKey)} ${effectEvents.join(", ")}`);
    await delay(700);
  }

  if (actor.hp <= 0) {
    if (!state.gameOver) await pushGameOverToFirebase(state.online.mySide === "host" ? "guest" : "host");
    return;
  }

  const usable = getUsableActions(actor);
  if (!usable.length) {
    showToast(`${getKhodamDisplayName(actor.khodamKey)} tidak bisa bertindak`);
    await delay(700);
    await rotateOrbit("opponent");
    // Pass turn to opponent
    const nextTurn = state.online.mySide === "host" ? "guest" : "host";
    await pushTurnToFirebase(nextTurn);
    return;
  }

  state.isBattleBusy = false;
  state.turnOwner = "player";
  updateActionButtons();
}

// ─── ONLINE: RUN MY ACTION ───────────────────────────────────────────────────

async function runOnlineAction(actorSide, actionKey) {
  if (actorSide !== "player") return;

  const sessionId = state.battleSession;
  const actor = state.battle.player;
  const target = state.battle.opponent;
  const action = actor.actions[actionKey];

  if (!action) return;
  if (action.cooldownRemaining > 0) { showToast(`${actionKey.toUpperCase()} cooldown ${action.cooldownRemaining}`); return; }
  if (isActionDisabledByEffects(actor, actionKey)) { showToast(`${actionKey.toUpperCase()} sedang terkunci`); return; }
  if (typeof action.remaining === "number" && action.remaining <= 0) return;
  if (action.energyCost > 0 && actor.energy < action.energyCost) { showToast("Energi tidak cukup!"); return; }

  actor.energy = clamp(actor.energy - action.energyCost + action.energyGain, 0, ENERGY_SETTINGS.max);
  if (action.cooldown > 0) action.cooldownRemaining = action.cooldown;
  playActionSfx(actionKey);

  state.isBattleBusy = true;
  updateActionButtons();

  // Pre-compute damage/shield so opponent gets deterministic results
  let resolvedDamage = null;
  let resolvedArmor = null;
  let critTriggered = false;
  let critMultiplier = 1;
  let effectResult = null;

  if (actionKey === "shield") {
    resolvedArmor = Number(action.armor) || 0;
    applyShield(actor, resolvedArmor);
    showDamageFloat("player", `+${resolvedArmor}`);
  } else {
    const damageWithEffects = Math.max(0, Math.round((Number(action.damage) || 0) * getDamageMultiplier(actor)));
    const critResult = rollCritical(actor, damageWithEffects);
    critTriggered = critResult.triggered;
    critMultiplier = critResult.multiplier;
    resolvedDamage = critResult.total;
    const result = applyDamage(target, resolvedDamage);
    showDamageFloat("opponent", critTriggered ? `CRIT! -${result.total}` : `-${result.total}`);
    if (critTriggered) showToast(`${getKhodamDisplayName(actor.khodamKey)} CRITICAL x${critMultiplier.toFixed(1)}`);
  }

  // Try to apply effect
  effectResult = tryApplyActionEffect(actor, target, actionKey);
  if (effectResult?.toast) { showToast(effectResult.toast); }

  if (typeof action.remaining === "number") action.remaining -= 1;

  syncBattleUi();

  // Push action & state to Firebase
  await pushMyStateToFirebase();
  await pushActionToFirebase(actionKey, resolvedDamage, resolvedArmor, critTriggered, critMultiplier, effectResult, Math.random());

  await queueAssetPreload(action.preview);
  await playFullscreenAnimation(action.preview, action.katakata || "", {
    pauseGameplayMusic: actionKey === "skill" || actionKey === "ultimate"
  });

  if (!isBattleSessionActive(sessionId)) return;

  await delay(420);
  await rotateOrbit("opponent");

  if (!isBattleSessionActive(sessionId)) return;
  syncBattleUi();

  // Check if opponent is dead
  if (target.hp <= 0) {
    if (!state.gameOver) await pushGameOverToFirebase(state.online.mySide);
    return;
  }

  // Pass turn to opponent
  const nextTurnOwner = state.online.mySide === "host" ? "guest" : "host";
  await pushTurnToFirebase(nextTurnOwner);

  // Apply end-of-turn effect countdown for our own effects (opponent's effects resolved on their turn)
  // Nothing to do locally — effects are resolved at beginMyTurn
}

// ─── BATTLE FINISH ────────────────────────────────────────────────────────────

async function finishBattle(result) {
  state.gameOver = true;
  state.isBattleBusy = true;
  clearBotTurnTimeout();
  detachAllOnlineListeners();
  updateActionButtons();
  await playBattleCelebration(result);

  const isVictory = result === "victory";
  const modalPromise = openModal({
    title: isVictory ? "VICTORY" : "DEFEAT",
    description: isVictory ? "Khodammu menang. Mau rematch?" : "Kali ini kalah. Mau coba lagi?",
    confirmText: isVictory ? "LANJUT" : "ULANGI",
    confirmVariant: isVictory ? "success" : "danger",
    cancelText: "KE LOBBY",
    layout: "result"
  });
  playSfx(isVictory ? "win-sfx" : "lose-sfx", { volume: 0.85 });
  const confirmed = await modalPromise;

  // Clean up room
  await cleanupRoom();

  if (confirmed) {
    startMatchmaking();
  } else {
    leaveBattleToLobby();
  }
}

async function cleanupRoom() {
  const { roomId } = state.online;
  if (roomId) {
    try { await remove(ref(db, `rooms/${roomId}`)); } catch (_) {}
  }
  resetOnlineMatchState();
}

function leaveBattleToLobby() {
  state.battleSession += 1;
  state.gameOver = false;
  state.isBattleBusy = false;
  state.battleMode = null;
  resetOnlineMatchState();
  clearBotTurnTimeout();
  clearCelebrationState();
  stopFullscreenAnimation();
  stopAllMusic();
  resetBattleFeedback();
  showOverlay(overlays.actionMenu, false);
  showOverlay(overlays.surrender, false);
  showScreen("lobby");
  ensureMusic("lobby");
}

// ─── EVENT BINDING ────────────────────────────────────────────────────────────
function bindEvents() {
  elements.selectionButton.addEventListener("click", () => {
    playSfx("ui-sfx", { volume: 0.7 });
    openSelectionScreen();
  });
  elements.cancelSelectionButton.addEventListener("click", () => {
    playSfx("ui-sfx", { volume: 0.7 });
    closeSelectionScreen();
  });
  elements.createKhodamButton?.addEventListener("click", () => {
    playSfx("ui-sfx", { volume: 0.7 });
    openCreatorScreen();
  });
  elements.confirmSelectionButton.addEventListener("click", () => {
    playSfx("ui-sfx", { volume: 0.7 });
    confirmPendingKhodam();
  });

  elements.selectionCards.addEventListener("click", (event) => {
    const card = event.target.closest(".khodam-card");
    if (!card) return;
    playSfx("ui-sfx", { volume: 0.65 });
    selectPendingKhodam(card.dataset.khodam);
    resetSelectionIdleHint();
  });

  document.addEventListener("click", (event) => {
    if (state.screen !== "selection") return;
    const clickedInsideCard = event.target.closest(".khodam-card");
    const clickedButtonArea = event.target.closest(".khodam-selection-button-overlay");
    const clickedTitle = event.target.closest(".khodam-selection-title-overlay");
    if (!clickedInsideCard && !clickedButtonArea && !clickedTitle) {
      state.pendingKhodamKey = null;
      syncSelectionButtons();
    }
  });

  elements.playButton.addEventListener("click", () => {
    playSfx("ui-sfx", { volume: 0.75 });
    startMatchmaking();
  });

  elements.playerNameInput.addEventListener("input", () => {
    if (state.screen === "lobby") resetLobbyIdleHint();
    if (!state.battle) return;
    state.battle.playerName = getPlayerDisplayName();
    syncCombatantUi("player");
  });

  elements.actionButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (state.isBattleBusy || state.turnOwner !== "player" || state.gameOver) return;
      resetActionIdleHint();
      await runPlayerAction(button.dataset.action);
    });
  });

  elements.surrenderButton.addEventListener("click", async () => {
    if (state.gameOver || state.screen !== "gameplay") return;
    playSfx("ui-sfx", { volume: 0.7 });
    const confirmed = await openModal({
      title: "SURRENDER?",
      description: "Kalau menyerah, pertarungan langsung kalah.",
      confirmText: "YA",
      confirmVariant: "danger",
      cancelText: "TIDAK"
    });
    if (confirmed) {
      if (state.battleMode === "bot") {
        await finishBattle("defeat");
      } else if (!state.gameOver) {
        // Tell Firebase we lost
        await pushGameOverToFirebase(state.online.mySide === "host" ? "guest" : "host");
      }
    }
  });

  elements.modalConfirm.addEventListener("click", () => {
    playSfx("ui-sfx", { volume: 0.7 });
    closeModal(true);
  });
  elements.modalCancel.addEventListener("click", () => {
    playSfx("ui-sfx", { volume: 0.7 });
    closeModal(false);
  });

  initializeKhodamCreator();

  window.addEventListener("resize", () => {
    if (state.screen === "gameplay") syncBattleUi();
  });

  document.addEventListener("pointerdown", (event) => {
    if (state.screen === "lobby" && event.target.closest(".main-lobby")) resetLobbyIdleHint();
    if (state.screen === "selection" && event.target.closest(".khodam-selection")) resetSelectionIdleHint();
    if (state.screen === "gameplay" && event.target.closest(".gameplay, .action-menu-overlay")) resetActionIdleHint();
  });

  // Clean up when tab closes
  window.addEventListener("beforeunload", () => {
    const { roomId } = state.online;
    if (roomId) {
      // Best-effort remove (no await)
      remove(ref(db, `rooms/${roomId}`));
      remove(ref(db, `queue/${roomId}`));
    }
  });
}

// ─── INTRO ────────────────────────────────────────────────────────────────────
async function runIntro() {
  showScreen("intro");
  await delay(50);
  screens.intro.classList.add("is-fading-in");
  await delay(2000);
  screens.intro.classList.remove("is-fading-in");
  screens.intro.classList.add("is-fading-out");
  await delay(800);
  screens.intro.classList.remove("is-fading-out");
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
async function init() {
  bindEvents();
  bindAudioUnlock();
  state.defaultPlayerName = generateDefaultPlayerName();
  elements.playerNameInput.placeholder = state.defaultPlayerName;
  await runIntro();
  const [khodamData, effectData, sfxData] = await Promise.all([fetchKhodamData(), fetchEffectData(), fetchSfxData()]);
  const customKhodams = loadCustomKhodams();
  state.data = { ...khodamData, ...customKhodams };
  state.effects = effectData;
  state.sfx = sfxData;
  initializeAudioSystem();
  state.khodamList = Object.keys(getKhodamMap());

  if (!getKhodamMap()[state.selectedKhodamKey]) {
    state.selectedKhodamKey = state.khodamList[0];
  }

  await runEarlyCaching(state.data);
  renderLobbySelection();
  renderSelectionCards();
  showScreen("lobby");
  ensureMusic("lobby");
}

init().catch((error) => {
  console.error(error);
  stopAllMusic();
  showScreen("lobby");
  showToast("Gagal memuat data game");
});

