export const screens = {
  intro: document.querySelector(".intro"),
  cache: document.querySelector(".early-caching"),
  lobby: document.querySelector(".main-lobby"),
  selection: document.querySelector(".khodam-selection"),
  search: document.querySelector(".cari-lawan"),
  gameplay: document.querySelector(".gameplay")
};

export const overlays = {
  actionMenu: document.querySelector(".action-menu-overlay"),
  surrender: document.querySelector(".surrender-overlay"),
  fullscreen: document.querySelector(".fullscreen-animation-in-game"),
  skip: document.querySelector(".skip-animation-overlay"),
  kata: document.querySelector(".kata2-hero-overlay"),
  modal: document.getElementById("confirm-modal")
};

export const elements = {
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
      energyText: document.getElementById("player-energy-text")
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
      energyText: document.getElementById("opponent-energy-text")
    }
  }
};

export const actionMeta = {
  attack: { icon: "???", label: "serangan" },
  skill: { icon: "??", label: "skill" },
  ultimate: { icon: "??", label: "ultimate" },
  shield: { icon: "???", label: "shield" }
};

export const ENERGY_SETTINGS = { max: 300, perTurn: 80 };
export const MATCHMAKING_BOT_TIMEOUT_MS = 4000;
export const TURN_TIMEOUT_MS = 30000;
export const HEARTBEAT_INTERVAL_MS = 5000;
export const QUEUE_TIMEOUT_MS = 60000;

export const battleQuotes = {
  attack: ["Hajar!", "Masuk!", "Serang terus!"],
  skill: ["Lihat jurusku!", "Ini baru skill!", "Kena kombo!"],
  ultimate: ["Waktunya tamat!", "Serius sekarang!", "Terima ini!"],
  shield: ["Aku tahan!", "Belum tumbang!", "Pertahanan aktif!"]
};

const khodamAssetAliases = { "si pitung": "pitung" };

export const state = {
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
    isTransitioning: false,
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
  online: {
    playerId: null,
    roomId: null,
    mySide: null,
    listeners: [],
    matchmakingRef: null,
    matchmakingCallback: null,
    waitingTimeout: null,
    turnTimeoutId: null,
    heartbeatIntervalId: null,
    lastHeartbeat: null,
    isConnected: true,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  },
  botTurnTimeout: null
};

state.online.playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export function delay(ms) { return new Promise((resolve) => window.setTimeout(resolve, ms)); }
export function toTitleCase(value) { return value.replace(/\b\w/g, (char) => char.toUpperCase()); }
export function clamp(number, min, max) { return Math.min(Math.max(number, min), max); }
export function generateDefaultPlayerName() { return `player${Math.floor(Math.random() * 99999) + 1}`; }
export function getPlayerDisplayName() { return elements.playerNameInput.value.trim() || state.defaultPlayerName || "player1"; }
export function getHpTone(hpPercent) { if (hpPercent < 30) return "is-low"; if (hpPercent < 60) return "is-medium"; return "is-high"; }

async function retryFetch(url, options = {}, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`${url} gagal dengan status ${response.status}`);
      return response;
    } catch (err) {
      if (attempt === retries) throw err;
      await delay(400 * (attempt + 1));
    }
  }
}

export async function fetchKhodamData() {
  const response = await retryFetch("data/khodam.json", { cache: "no-store" });
  return normalizeKhodamData(await response.json());
}

export async function fetchEffectData() {
  const response = await retryFetch("data/effect.json", { cache: "no-store" });
  return normalizeEffectData(await response.json());
}

export async function fetchSfxData() {
  const response = await retryFetch("data/sfx.json", { cache: "no-store" });
  return normalizeSfxData(await response.json());
}

function normalizeKhodamData(rawData) {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) throw new Error("Format khodam.json tidak valid");
  return rawData.khodam && typeof rawData.khodam === "object" ? rawData.khodam : rawData;
}

function normalizeEffectData(rawData) {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) throw new Error("Format effect.json tidak valid");
  return rawData;
}

function normalizeSfxData(rawData) {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) throw new Error("Format sfx.json tidak valid");
  return rawData;
}

export function getKhodamMap() { return state.data || {}; }
export function getEffectMap() { return state.effects || {}; }

function resolvePreviewMedia(src) {
  if (!src || src === "none") return src;
  return src.replace(/\.(mp4|webm)$/i, ".png");
}

function toAssetSlug(value) {
  return (khodamAssetAliases[value] || value).replace(/\s+/g, "").toLowerCase();
}

export function getKhodamPreviewSrc(khodamKey, previewSrc = "none") {
  if (previewSrc && previewSrc !== "none") return resolvePreviewMedia(previewSrc);
  return `asset/${toAssetSlug(khodamKey)}.png`;
}

export function getKhodamCelebrationSrc(khodamKey) {
  return getKhodamMap()[khodamKey]?.selebrasi || "none";
}

export function getKhodamDisplayName(key) {
  const khodam = getKhodamMap()[key];
  return khodam?.name ? khodam.name : toTitleCase(key);
}

export function createCustomKhodamKey(name) {
  const slug = String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `custom-${slug || "khodam"}-${Date.now()}`;
}

export function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function randomFloat(min, max, precision = 2) { return parseFloat((min + Math.random() * (max - min)).toFixed(precision)); }

export function loadCustomKhodams() {
  try {
    const raw = localStorage.getItem("customKhodams");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCustomKhodams() {
  const customEntries = Object.entries(state.data || {}).filter(([key]) => key.startsWith("custom-"));
  const customData = Object.fromEntries(customEntries);
  try {
    localStorage.setItem("customKhodams", JSON.stringify(customData));
    return true;
  } catch (err) {
    console.error("Gagal menyimpan custom khodam ke localStorage:", err);
    return false;
  }
}

export function isVideoAsset(src) { return /\.(mp4|webm)$/i.test(src || ""); }

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
    const cleanup = () => {
      if (video.parentNode) video.remove();
      video.removeAttribute("src");
      video.load();
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener("canplaythrough", finish);
      video.removeEventListener("loadeddata", warmPlayback);
      video.removeEventListener("loadedmetadata", warmPlayback);
      video.removeEventListener("error", finish);
      cleanup();
      resolve();
    };
    const warmPlayback = () => {
      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.then(() => {
          window.setTimeout(() => {
            video.pause();
            finish();
          }, 120);
        }).catch(() => {
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

export function buildMediaCandidates(src) {
  if (!src) return [];
  if (src.endsWith(".mp4")) return [{ type: "mp4", src }];
  if (src.endsWith(".webm")) return [{ type: "mp4", src: src.replace(/\.webm$/i, ".mp4") }];
  return [{ type: "mp4", src }];
}

export function chooseCompatibleMedia(src) {
  const candidates = buildMediaCandidates(src);
  return candidates[0]?.src || src;
}

export function queueAssetPreload(src) {
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

export function buildPreviewAssetList(data) {
  const assets = [];
  Object.entries(data).forEach(([khodamKey, khodam]) => {
    assets.push(getKhodamPreviewSrc(khodamKey, khodam.preview));
    if (khodam.action) {
      Object.values(khodam.action).forEach((action) => {
        if (action && action.preview) assets.push(action.preview);
      });
    }
    assets.push(getKhodamCelebrationSrc(khodamKey));
  });
  return [...new Set(assets.filter(Boolean))];
}

export async function runEarlyCaching(data, showScreen) {
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

export function applyImageSource(image, src) {
  if (!image || !src) return;
  const resolvedSrc = resolvePreviewMedia(src);
  if (image.getAttribute("src") === resolvedSrc) return;
  image.setAttribute("src", resolvedSrc);
}

export function applyVideoSource(video, src) {
  if (!video || !src) return;
  const resolvedSrc = chooseCompatibleMedia(src);
  if (video.getAttribute("src") === resolvedSrc) return;
  video.pause();
  video.removeAttribute("src");
  video.setAttribute("src", resolvedSrc);
  video.load();
}

export async function waitVideoReady(video) {
  if (!video) return;
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener("canplay", finish);
      video.removeEventListener("loadedmetadata", finish);
      video.removeEventListener("error", finish);
      resolve();
    };

    if (video.readyState >= 2) {
      resolve();
      return;
    }

    video.addEventListener("canplay", finish, { once: true });
    video.addEventListener("loadedmetadata", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
    window.setTimeout(finish, 5000);
  });
}

export function isBattleSessionActive(sessionId) {
  return sessionId === state.battleSession && state.screen === "gameplay";
}
