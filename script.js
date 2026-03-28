const screens = {
  intro: document.querySelector(".intro"),
  cache: document.querySelector(".early-caching"),
  lobby: document.querySelector(".main-lobby"),
  selection: document.querySelector(".khodam-selection"),
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

const actionMeta = {
  attack: { icon: "🗡️", label: "serangan" },
  skill: { icon: "⚔️", label: "skill" },
  ultimate: { icon: "💥", label: "ultimate" },
  shield: { icon: "🛡️", label: "shield" }
};

const ENERGY_SETTINGS = {
  max: 300,
  perTurn: 80
};

const botNames = [
  "⋆༺𓆩☠︎︎𓆪༻⋆", "꧁⎝ 𓆩༺✧༻𓆪 ⎠꧂", "「 ✦ Bagas ✦ 」", "𝗥⟐𝗕𝗟◘𝗫", "ᡕᠵデᡁ᠊╾━", "꧁𓊈𒆜DANU𒆜𓊉꧂", "A for Aldo", 
  "𝔾𝕆𝕆𝔻 𝔹𝕆𝕐", "▀▄▀▄▀▄ P BALAP", "💪 Setrongmen", "🦸‍♂️ Hero", "Yudi", "Zulfi", "MEIMEI_CANTIQ", "𝄞𝄢", "H.U.G.O",
  "・✿ Shera", "🐸", "𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦🅾", "Aji", "y4ntiEeee", "ZACK", "ζ͜͡𝕲𝖍𝖔𝖘𝖙", "𝖀𝖈𝖍𝖎𝖍𝖆 𝕺𝖇𝖎𝖙𝖔", "𝐵𝑜𝑟𝑛 𝑡𝑜 𝑑𝑖𝑒.", "(๑-﹏-๑)",
  "Alex", "Rizky", "Fajar", "Dimas", "Raka", "Bayu", "Ilham", "Agus", "Eko", "Budi", "Charlie", "Dewi", "Eka", "Feri", "Gilang", "Hendra", "Indra", "Joko", "Kurniawan", "Lina",
  "Maya", "Nina", "Oka", "Putri", "Qori", "Rani", "Sari", "Tina", "Umar", "Vina", "Wawan", "Xena", "Yusuf", "Zara"
];

const battleQuotes = {
  attack: ["Hajar!", "Masuk!", "Serang terus!"],
  skill: ["Lihat jurusku!", "Ini baru skill!", "Kena kombo!"],
  ultimate: ["Waktunya tamat!", "Serius sekarang!", "Terima ini!"],
  shield: ["Aku tahan!", "Belum tumbang!", "Pertahanan aktif!"]
};

const khodamAssetAliases = {
  "si pitung": "pitung"
};

const state = {
  data: null,
  effects: null,
  khodamList: [],
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
  assetCache: {
    ready: new Set(),
    pending: new Map()
  }
};

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function toTitleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

function getHpTone(hpPercent) {
  if (hpPercent < 30) {
    return "is-low";
  }
  if (hpPercent < 60) {
    return "is-medium";
  }
  return "is-high";
}

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
  if (!element) {
    return;
  }
  element.hidden = !visible;
  element.classList.toggle("overlay-visible", visible);
}

function isBattleSessionActive(sessionId) {
  return sessionId === state.battleSession && state.screen === "gameplay";
}

async function fetchKhodamData() {
  const response = await fetch("khodam.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Gagal membaca khodam.json");
  }
  const rawData = await response.json();
  return normalizeKhodamData(rawData);
}

async function fetchEffectData() {
  const response = await fetch("effect.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Gagal membaca effect.json");
  }
  const rawData = await response.json();
  return normalizeEffectData(rawData);
}

function normalizeKhodamData(rawData) {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
    throw new Error("Format khodam.json tidak valid");
  }

  const source = rawData.khodam && typeof rawData.khodam === "object" ? rawData.khodam : rawData;
  return source;
}

function normalizeEffectData(rawData) {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
    throw new Error("Format effect.json tidak valid");
  }

  return rawData;
}

function getKhodamMap() {
  return state.data || {};
}

function getEffectMap() {
  return state.effects || {};
}

function resolvePreviewMedia(src) {
  if (!src || src === "none") {
    return src;
  }

  return src.replace(/\.(mp4|webm)$/i, ".png");
}

function toAssetSlug(value) {
  return (khodamAssetAliases[value] || value).replace(/\s+/g, "").toLowerCase();
}

function getKhodamPreviewSrc(khodamKey, previewSrc = "none") {
  if (previewSrc && previewSrc !== "none") {
    return resolvePreviewMedia(previewSrc);
  }

  return `asset/${toAssetSlug(khodamKey)}.png`;
}

function isVideoAsset(src) {
  return /\.(mp4|webm)$/i.test(src || "");
}

async function preloadVideo(src) {
  if (!src || src === "none") {
    return;
  }

  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    // Simpan elemen di DOM tersembunyi supaya browser tetap cache-nya
    video.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(video);

    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      // Jangan hapus src — biarkan browser tetap pegang cache
      resolve();
    };

    video.addEventListener("canplaythrough", finish, { once: true });
    video.addEventListener("loadeddata", finish, { once: true });
    video.addEventListener("error", finish, { once: true });

    // Timeout fallback 8 detik supaya gak stuck
    window.setTimeout(finish, 8000);

    video.src = chooseCompatibleMedia(src);
    video.load();
  });
}

async function preloadImage(src) {
  if (!src || src === "none") {
    return;
  }

  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };

    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
    window.setTimeout(finish, 8000);
    image.src = src;
  });
}

function queueAssetPreload(src) {
  if (!src || src === "none") {
    return Promise.resolve();
  }

  const resolvedSrc = isVideoAsset(src) ? chooseCompatibleMedia(src) : resolvePreviewMedia(src);
  if (state.assetCache.ready.has(resolvedSrc)) {
    return Promise.resolve();
  }

  const pendingRequest = state.assetCache.pending.get(resolvedSrc);
  if (pendingRequest) {
    return pendingRequest;
  }

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

  // Batch 4 video sekaligus supaya paralel tapi gak overload jaringan
  const BATCH_SIZE = 4;
  for (let i = 0; i < assets.length; i += BATCH_SIZE) {
    const batch = assets.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((asset) =>
        queueAssetPreload(asset).then(() => {
          loaded += 1;
          const progress = Math.round((loaded / total) * 100);
          elements.progressFill.style.width = `${progress}%`;
          elements.progressText.textContent = String(progress);
        })
      )
    );
  }

  if (!assets.length) {
    elements.progressFill.style.width = "100%";
    elements.progressText.textContent = "100";
  }

  await delay(250);
}

function buildMediaCandidates(src) {
  if (!src) {
    return [];
  }

  if (src.endsWith(".mp4")) {
    return [{ type: "mp4", src }];
  }

  if (src.endsWith(".webm")) {
    return [{ type: "mp4", src: src.replace(/\.webm$/i, ".mp4") }];
  }

  return [{ type: "mp4", src }];
}

function chooseCompatibleMedia(src) {
  const candidates = buildMediaCandidates(src);
  return candidates[0]?.src || src;
}

function applyImageSource(image, src) {
  if (!image || !src) {
    return;
  }
  const resolvedSrc = resolvePreviewMedia(src);
  if (image.getAttribute("src") === resolvedSrc) {
    return;
  }
  image.setAttribute("src", resolvedSrc);
}

function applyVideoSource(video, src) {
  if (!video || !src) {
    return;
  }
  const resolvedSrc = chooseCompatibleMedia(src);
  if (video.getAttribute("src") === resolvedSrc) {
    return;
  }
  video.pause();
  video.setAttribute("src", resolvedSrc);
  video.load();
  const playPromise = video.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {});
  }
}

function renderLobbySelection() {
  const khodam = getKhodamMap()[state.selectedKhodamKey];
  elements.lobbyKhodamName.textContent = toTitleCase(state.selectedKhodamKey);
  applyImageSource(elements.lobbyVideo, getKhodamPreviewSrc(state.selectedKhodamKey, khodam.preview));
}

function renderSelectionCards() {
  elements.selectionCards.innerHTML = "";

  state.khodamList.forEach((key) => {
    const khodam = getKhodamMap()[key];
    const card = document.createElement("div");
    card.className = "khodam-card";
    card.dataset.khodam = key;
    // Jangan autoplay langsung — observer yang ngatur
    card.innerHTML = `
      <img src="${getKhodamPreviewSrc(key, khodam.preview)}" alt="${toTitleCase(key)}">
      <h2>${toTitleCase(key)}</h2>
    `;
    if (state.pendingKhodamKey === key) {
      card.classList.add("is-selected");
    }
    elements.selectionCards.appendChild(card);
  });

  syncSelectionButtons();
}

function syncSelectionButtons() {
  const hasPending = Boolean(state.pendingKhodamKey);
  elements.confirmSelectionButton.style.display = hasPending ? "inline-block" : "none";
  const cards = elements.selectionCards.querySelectorAll(".khodam-card");
  cards.forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.khodam === state.pendingKhodamKey);
  });
}

function openSelectionScreen() {
  state.pendingKhodamKey = null;
  syncSelectionButtons();
  showScreen("selection");
}

function closeSelectionScreen() {
  state.pendingKhodamKey = null;
  showScreen("lobby");
  syncSelectionButtons();
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

function setCombatantState(combatant, x, y, scale) {
  const width = combatant.wrapper.offsetWidth;
  const height = combatant.wrapper.offsetHeight;
  combatant.wrapper.style.transform = `translate(${x - width / 2}px, ${y - height / 2}px) scale(${scale})`;
  combatant.wrapper.style.zIndex = String(Math.round(y));
  combatant.wrapper.style.filter = `drop-shadow(0 ${Math.round(scale * 12)}px ${Math.round(
    scale * 20
  )}px rgba(0, 0, 0, 0.22))`;
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

  const positions = [
    {
      x: centerX + Math.cos(orbit.angle) * radiusX + elements.combatants.player.offsetX,
      y: centerY + Math.sin(orbit.angle) * radiusY,
      combatant: elements.combatants.player
    },
    {
      x: centerX + Math.cos(orbit.angle + Math.PI) * radiusX + elements.combatants.opponent.offsetX,
      y: centerY + Math.sin(orbit.angle + Math.PI) * radiusY,
      combatant: elements.combatants.opponent
    }
  ].sort((a, b) => a.y - b.y);

  positions.forEach(({ x, y, combatant }) => {
    const scale = getScale(y, centerY, radiusY);
    setCombatantState(combatant, x, y, scale);
  });

  state.orbit.rafId = requestAnimationFrame(updateOrbitFrame);
}

function startOrbitLoop() {
  if (state.orbit.rafId) {
    cancelAnimationFrame(state.orbit.rafId);
  }
  state.orbit.rafId = requestAnimationFrame(updateOrbitFrame);
}

function rotateOrbit() {
  state.orbit.targetAngle += Math.PI;
  state.orbit.isSwitching = true;
  return delay(600);
}

function createBattleParticipant(side, khodamKey, displayName) {
  const khodam = getKhodamMap()[khodamKey];
  const critical = khodam.critical || {};

  const buildAction = (actionKey) => {
    const base = khodam.action[actionKey] || {};
    const remaining = base.use === "unlimited" || typeof base.use === "undefined"
      ? undefined
      : Number(base.use);

    return {
      ...base,
      remaining,
      energyCost: Number(base.energyCost ?? 0),
      energyGain: Number(base.energyGain ?? 0),
      cooldown: Number(base.cooldown ?? 0),
      cooldownRemaining: 0
    };
  };

  return {
    side,
    khodamKey,
    displayName,
    hp: khodam.hp,
    maxHp: khodam.hp,
    energy: ENERGY_SETTINGS.perTurn,
    maxEnergy: ENERGY_SETTINGS.max,
    armor: 0,
    critical: {
      chance: Number(critical.chance) || 0,
      multiplier: Number(critical.multiplier) || 1
    },
    effectAction: {
      effectKey: khodam.effect || null,
      chanceByAction: khodam.effectChance || {}
    },
    activeEffects: [],
    actions: {
      attack: buildAction("attack"),
      skill: buildAction("skill"),
      ultimate: buildAction("ultimate"),
      shield: buildAction("shield")
    }
  };
}

function syncCombatantUi(side) {
  const participant = state.battle[side];
  const combatant = elements.combatants[side];
  const hpPercent = clamp((participant.hp / participant.maxHp) * 100, 0, 100);
  const armorPercent = clamp((participant.armor / participant.maxHp) * 100, 0, 100);
  const hpTone = getHpTone(hpPercent);

  combatant.label.textContent = side === "player" ? (state.battle.playerName || "KAMU") : participant.displayName;
  combatant.name.textContent = toTitleCase(participant.khodamKey);
  combatant.hpFill.style.width = `${hpPercent}%`;
  combatant.hpTrailFill.style.width = `${hpPercent}%`;
  combatant.armorFill.style.left = `${hpPercent}%`;
  combatant.armorFill.style.width = `${armorPercent}%`;
  combatant.hpFill.classList.remove("is-high", "is-medium", "is-low");
  combatant.hpFill.classList.add(hpTone);

  const energyPercent = clamp((participant.energy / (participant.maxEnergy || ENERGY_SETTINGS.max)) * 100, 0, 100);
  if (combatant.energyFill) {
    combatant.energyFill.style.width = `${energyPercent}%`;
  }
  if (combatant.energyText) {
    combatant.energyText.textContent = `${Math.ceil(participant.energy)} / ${participant.maxEnergy || ENERGY_SETTINGS.max} ⚡`;
  }

  const hpText = `${Math.ceil(participant.hp)} ❤️${participant.armor ? ` + ${participant.armor} 🛡️` : ""}`;
  if (combatant.hpText) {
    combatant.hpText.textContent = hpText;
  }
  if (combatant.meta) {
    combatant.meta.textContent = hpText;
  }

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

  if (state.toastTimerId) {
    window.clearTimeout(state.toastTimerId);
  }

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

function getActionButtonLabel(button, actionKey) {
  const playerActionName = state.battle?.player?.actions?.[actionKey]?.name;
  if (playerActionName) {
    return toTitleCase(playerActionName);
  }

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

    const remainingBadge =
      typeof actionData?.remaining === "number" ? `<span class="action-button-badge">${actionData.remaining}</span>` : "";
    const cooldownBadge =
      actionData?.cooldownRemaining > 0 ? `<span class="action-button-badge">⏳ ${actionData.cooldownRemaining}</span>` : "";
    const energyBadge = actionData?.energyCost > 0 ? `<span class="action-button-badge">⚡ ${actionData.energyCost}</span>` : "";
    const badgeGroup = remainingBadge || cooldownBadge || energyBadge
      ? `<span class="action-button-badges">${remainingBadge}${cooldownBadge}${energyBadge}</span>`
      : "";

    button.innerHTML = `<span class="action-button-label">${label}</span>${badgeGroup}`;

    const notEnoughEnergy = actionData?.energyCost > (player?.energy || 0);
    const onCooldown = actionData?.cooldownRemaining > 0;
    const noUses = typeof actionData?.remaining === "number" && actionData.remaining <= 0;
    const blockedByEffect = player ? isActionDisabledByEffects(player, actionKey) : false;

    button.disabled = disabled || notEnoughEnergy || onCooldown || noUses || blockedByEffect;
  });
}

async function playFullscreenAnimation(src, quote) {
  if (!src || src === "none") {
    return;
  }

  showOverlay(overlays.fullscreen, true);
  showOverlay(overlays.skip, true);

  if (quote) {
    elements.kataText.textContent = `"${quote}"`;
    showOverlay(overlays.kata, true);
  } else {
    showOverlay(overlays.kata, false);
  }

  const video = elements.fullscreenVideo;
  applyVideoSource(video, src);
  video.currentTime = 0;

  await new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      state.activeAnimationResolver = null;
      video.removeEventListener("ended", finish);
      elements.skipAnimationButton.removeEventListener("click", finish);
      resolve();
    };

    state.activeAnimationResolver = finish;

    video.addEventListener("ended", finish, { once: true });
    elements.skipAnimationButton.addEventListener("click", finish, { once: true });

    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => finish());
    }
  });

  video.pause();
  showOverlay(overlays.fullscreen, false);
  showOverlay(overlays.skip, false);
  showOverlay(overlays.kata, false);
}

function stopFullscreenAnimation() {
  if (state.activeAnimationResolver) {
    state.activeAnimationResolver();
  }

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
  if (!participant) {
    return [];
  }

  return ["skill", "ultimate"]
    .map((actionKey) => participant.actions[actionKey]?.preview)
    .filter((src) => src && src !== "none");
}

async function warmupBattleAssets(onProgress) {
  const assets = [
    ...getParticipantActionAssets(state.battle?.player),
    ...getParticipantActionAssets(state.battle?.opponent)
  ];
  const uniqueAssets = [...new Set(assets)];

  if (!uniqueAssets.length) {
    onProgress?.(100, 0, 0);
    return;
  }

  let loaded = 0;
  onProgress?.(0, loaded, uniqueAssets.length);

  await Promise.all(
    uniqueAssets.map((src) =>
      queueAssetPreload(src).then(() => {
        loaded += 1;
        const progress = Math.round((loaded / uniqueAssets.length) * 100);
        onProgress?.(progress, loaded, uniqueAssets.length);
      })
    )
  );
}

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

  return {
    triggered,
    chance,
    multiplier,
    total
  };
}

function applyShield(target, amount) {
  target.armor += amount;
  return amount;
}

function getEffectDefinition(effectKey) {
  return getEffectMap()[effectKey] || null;
}

function normalizeActionList(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function isSupportEffect(effectConfig = {}) {
  return Boolean(
    effectConfig.healPerTurn ||
      effectConfig.armorPerTurn ||
      effectConfig.getEnergy ||
      effectConfig.removeEffect ||
      effectConfig.damageIncrease ||
      effectConfig.hpDrain ||
      effectConfig.hpFlip
  );
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

  const activeEffect = {
    key: effectKey,
    remainingTurns: Number(effectConfig.duration) || 0,
    config: effectConfig
  };

  participant.activeEffects.push(activeEffect);
  return activeEffect;
}

function removeExpiredEffects(participant) {
  participant.activeEffects = participant.activeEffects.filter((effect) => effect.remainingTurns > 0);
}

function clearEffects(participant) {
  participant.activeEffects = [];
}

function getDamageMultiplier(participant) {
  const bonusPercent = participant.activeEffects.reduce((total, effect) => {
    return total + (Number(effect.config.damageIncrease) || 0);
  }, 0);

  return 1 + bonusPercent / 100;
}

function isActionDisabledByEffects(participant, actionKey) {
  return participant.activeEffects.some((effect) => {
    const disabledActions = normalizeActionList(effect.config.disableActions);
    return disabledActions.includes(actionKey);
  });
}

function applyCooldownEffect(participant, effectConfig) {
  const affectedActions = normalizeActionList(effectConfig.addCooldown);
  const cooldownIncrease = Number(effectConfig.cooldownIncrease) || 0;

  if (!affectedActions.length || cooldownIncrease <= 0) {
    return false;
  }

  affectedActions.forEach((actionKey) => {
    const action = participant.actions[actionKey];
    if (!action) {
      return;
    }

    action.cooldownRemaining += cooldownIncrease;
  });

  return true;
}

function applyImmediateEffect(actor, target, effectConfig) {
  if (effectConfig.removeEffect) {
    clearEffects(actor);
    return { applied: true, toast: `${toTitleCase(actor.khodamKey)} membersihkan efek` };
  }

  if (effectConfig.getEnergy) {
    const gained = Number(effectConfig.getEnergy) || 0;
    actor.energy = clamp(actor.energy + gained, 0, actor.maxEnergy || ENERGY_SETTINGS.max);
    return { applied: true, toast: `${toTitleCase(actor.khodamKey)} +${gained} energi` };
  }

  if (effectConfig.hpFlip) {
    const actorHp = actor.hp;
    actor.hp = clamp(target.hp, 0, actor.maxHp);
    target.hp = clamp(actorHp, 0, target.maxHp);
    return { applied: true, toast: `${toTitleCase(actor.khodamKey)} menukar HP` };
  }

  if (applyCooldownEffect(target, effectConfig)) {
    return { applied: true, toast: `${toTitleCase(target.khodamKey)} terkena cooldown` };
  }

  return { applied: false, toast: "" };
}

function tryApplyActionEffect(actor, target, actionKey) {
  const effectKey = actor.effectAction?.effectKey;
  const effectConfig = getEffectDefinition(effectKey);
  const chance = getActionEffectChance(actor, actionKey);

  if (!effectKey || !effectConfig || chance <= 0 || Math.random() > chance) {
    return null;
  }

  const recipient = isSupportEffect(effectConfig) ? actor : target;
  const immediateResult = applyImmediateEffect(actor, target, effectConfig);

  if (immediateResult.applied) {
    return {
      effectKey,
      recipient: recipient.side,
      toast: immediateResult.toast
    };
  }

  if (Number(effectConfig.duration) > 0) {
    addOrRefreshEffect(recipient, effectKey, effectConfig);
    return {
      effectKey,
      recipient: recipient.side,
      toast: `${toTitleCase(recipient.khodamKey)} terkena ${effectKey}`
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

async function beginTurn(side) {
  const sessionId = state.battleSession;
  const actor = state.battle[side];

  state.turnOwner = side;
  actor.energy = clamp(actor.energy + ENERGY_SETTINGS.perTurn, 0, actor.maxEnergy || ENERGY_SETTINGS.max);
  Object.values(actor.actions).forEach((nextAction) => {
    if (nextAction.cooldownRemaining > 0) {
      nextAction.cooldownRemaining = Math.max(0, nextAction.cooldownRemaining - 1);
    }
  });

  const effectEvents = resolveTurnEffects(actor);
  syncBattleUi();

  if (effectEvents.length) {
    showToast(`${toTitleCase(actor.khodamKey)} ${effectEvents.join(", ")}`);
    await delay(700);
  }

  if (!isBattleSessionActive(sessionId)) {
    return false;
  }

  if (state.battle.player.hp <= 0 || state.battle.opponent.hp <= 0) {
    await finishBattle(state.battle.player.hp > 0 ? "victory" : "defeat");
    return false;
  }

  const usableActions = getUsableActions(actor);
  if (!usableActions.length) {
    showToast(`${toTitleCase(actor.khodamKey)} tidak bisa bertindak`);
    await delay(700);
    if (!isBattleSessionActive(sessionId)) {
      return false;
    }
    await endTurn(side === "player" ? "opponent" : "player");
    return false;
  }

  updateActionButtons();
  return true;
}

async function endTurn(nextSide) {
  if (!isBattleSessionActive(state.battleSession)) {
    return;
  }

  state.isBattleBusy = false;
  const canAct = await beginTurn(nextSide);
  if (!canAct || state.turnOwner !== "opponent") {
    return;
  }

  state.isBattleBusy = true;
  updateActionButtons();
  await delay(850);
  await runBotTurn();
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

function chooseBotAction(participant) {
  const usable = getUsableActions(participant);
  if (participant.hp < participant.maxHp * 0.45 && usable.includes("shield") && Math.random() < 0.4) {
    return "shield";
  }
  if (usable.includes("ultimate") && Math.random() < 0.35) {
    return "ultimate";
  }
  if (usable.includes("skill") && Math.random() < 0.5) {
    return "skill";
  }
  return usable.includes("attack") ? "attack" : usable[0];
}

async function runAction(actorSide, actionKey) {
  const sessionId = state.battleSession;
  const actor = state.battle[actorSide];
  const targetSide = actorSide === "player" ? "opponent" : "player";
  const target = state.battle[targetSide];
  const action = actor.actions[actionKey];

  if (!action) {
    return;
  }

  if (action.cooldownRemaining > 0) {
    showToast(`${toTitleCase(actor.khodamKey)} ${actionKey.toUpperCase()} cooldown ${action.cooldownRemaining}`);
    return;
  }

  if (isActionDisabledByEffects(actor, actionKey)) {
    showToast(`${actionKey.toUpperCase()} sedang terkunci`);
    return;
  }

  if (typeof action.remaining === "number" && action.remaining <= 0) {
    return;
  }

  if (action.energyCost > 0 && actor.energy < action.energyCost) {
    showToast("Energi tidak cukup!");
    return;
  }

  actor.energy = clamp(actor.energy - action.energyCost, 0, ENERGY_SETTINGS.max);
  actor.energy = clamp(actor.energy + action.energyGain, 0, ENERGY_SETTINGS.max);

  if (action.cooldown > 0) {
    action.cooldownRemaining = action.cooldown;
  }

  state.isBattleBusy = true;
  updateActionButtons();

  await queueAssetPreload(action.preview);
  await playFullscreenAnimation(action.preview, action.katakata || "");

  if (!isBattleSessionActive(sessionId)) {
    return;
  }

  if (actionKey === "shield") {
    const gained = applyShield(actor, action.armor);
    showDamageFloat(actorSide, `+${gained}`);
    syncBattleUi();
  } else {
    const damageWithEffects = Math.max(0, Math.round((Number(action.damage) || 0) * getDamageMultiplier(actor)));
    const criticalHit = rollCritical(actor, damageWithEffects);
    const result = applyDamage(target, criticalHit.total);
    showDamageFloat(targetSide, criticalHit.triggered ? `CRIT! -${result.total}` : `-${result.total}`);
    if (criticalHit.triggered) {
      showToast(`${toTitleCase(actor.khodamKey)} CRITICAL x${criticalHit.multiplier.toFixed(1)}`);
    }
    syncBattleUi();
  }

  const effectResult = tryApplyActionEffect(actor, target, actionKey);
  if (effectResult?.toast) {
    showToast(effectResult.toast);
    syncBattleUi();
  }

  if (typeof action.remaining === "number") {
    action.remaining -= 1;
  }

  await delay(420);
  await rotateOrbit();

  if (!isBattleSessionActive(sessionId)) {
    return;
  }

  syncBattleUi();

  if (state.battle.player.hp <= 0 || state.battle.opponent.hp <= 0) {
    await finishBattle(state.battle.player.hp > 0 ? "victory" : "defeat");
    return;
  }

  await endTurn(targetSide);
}

async function runBotTurn() {
  if (state.gameOver) {
    return;
  }
  const botAction = chooseBotAction(state.battle.opponent);
  await runAction("opponent", botAction);
}

function openModal({ title, description, confirmText = "YA", cancelText = "TIDAK", confirmVariant = "danger" }) {
  elements.modalTitle.textContent = title;
  elements.modalDescription.textContent = description;
  elements.modalConfirm.textContent = confirmText;
  elements.modalCancel.textContent = cancelText;
  elements.modalConfirm.className = "modal-button";
  if (confirmVariant) {
    elements.modalConfirm.classList.add(confirmVariant);
  }
  showOverlay(overlays.modal, true);

  return new Promise((resolve) => {
    state.modalResolver = resolve;
  });
}

function closeModal(result) {
  showOverlay(overlays.modal, false);
  if (state.modalResolver) {
    state.modalResolver(result);
    state.modalResolver = null;
  }
}

async function finishBattle(result) {
  state.gameOver = true;
  state.isBattleBusy = true;
  updateActionButtons();

  const isVictory = result === "victory";
  const confirmed = await openModal({
    title: isVictory ? "VICTORY" : "DEFEAT",
    description: isVictory ? "Khodammu menang. Mau lanjut rematch?" : "Kali ini kalah. Mau coba lagi?",
    confirmText: isVictory ? "LANJUT" : "ULANGI",
    confirmVariant: isVictory ? "success" : "danger",
    cancelText: "KE LOBBY"
  });

  if (confirmed) {
    startMatch();
  } else {
    leaveBattleToLobby();
  }
}

function leaveBattleToLobby() {
  state.battleSession += 1;
  state.gameOver = false;
  state.isBattleBusy = false;
  stopFullscreenAnimation();
  resetBattleFeedback();
  showOverlay(overlays.actionMenu, false);
  showOverlay(overlays.surrender, false);
  showScreen("lobby");
}

function buildBattleState() {
  const playerName = elements.playerNameInput.value.trim() || "KAMU";
  const enemyKhodamOptions = state.khodamList.filter((key) => key !== state.selectedKhodamKey);
  const enemyKhodamKey =
    enemyKhodamOptions[Math.floor(Math.random() * enemyKhodamOptions.length)] || state.selectedKhodamKey;
  const enemyName = botNames[Math.floor(Math.random() * botNames.length)];

  state.battle = {
    playerName,
    player: createBattleParticipant("player", state.selectedKhodamKey, playerName),
    opponent: createBattleParticipant("opponent", enemyKhodamKey, enemyName)
  };
}

function resetOrbit() {
  state.orbit.angle = Math.PI / 2;
  state.orbit.targetAngle = Math.PI / 2;
  state.orbit.isSwitching = false;
}

function startBattleScene() {
  state.battleSession += 1;
  resetOrbit();
  resetBattleFeedback();
  state.turnOwner = "player";
  state.gameOver = false;
  state.isBattleBusy = false;

  syncBattleUi();
  showScreen("gameplay");
  showOverlay(overlays.actionMenu, true);
  showOverlay(overlays.surrender, true);
  startOrbitLoop();
  updateActionButtons();
}

async function startMatch() {
  buildBattleState();
  showOverlay(overlays.actionMenu, false);
  showOverlay(overlays.surrender, false);
  showScreen("search");

  const minimumSearchDelay = delay(2300);
  const assetWarmup = warmupBattleAssets();

  await Promise.all([minimumSearchDelay, assetWarmup]);
  startBattleScene();
}

function bindEvents() {
  elements.selectionButton.addEventListener("click", openSelectionScreen);
  elements.cancelSelectionButton.addEventListener("click", closeSelectionScreen);
  elements.confirmSelectionButton.addEventListener("click", confirmPendingKhodam);

  elements.selectionCards.addEventListener("click", (event) => {
    const card = event.target.closest(".khodam-card");
    if (!card) {
      return;
    }
    selectPendingKhodam(card.dataset.khodam);
  });

  document.addEventListener("click", (event) => {
    if (state.screen !== "selection") {
      return;
    }
    const clickedInsideCard = event.target.closest(".khodam-card");
    const clickedButtonArea = event.target.closest(".khodam-selection-button-overlay");
    const clickedTitle = event.target.closest(".khodam-selection-title-overlay");
    if (!clickedInsideCard && !clickedButtonArea && !clickedTitle) {
      state.pendingKhodamKey = null;
      syncSelectionButtons();
    }
  });

  elements.playButton.addEventListener("click", () => {
    startMatch();
  });

  elements.playerNameInput.addEventListener("input", () => {
    if (!state.battle) {
      return;
    }
    state.battle.playerName = elements.playerNameInput.value.trim() || "KAMU";
    syncCombatantUi("player");
  });

  elements.actionButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (state.isBattleBusy || state.turnOwner !== "player" || state.gameOver) {
        return;
      }
      await runAction("player", button.dataset.action);
    });
  });

  elements.surrenderButton.addEventListener("click", async () => {
    if (state.gameOver || state.screen !== "gameplay") {
      return;
    }
    const confirmed = await openModal({
      title: "SURRENDER?",
      description: "Kalau menyerah, pertarungan langsung kalah.",
      confirmText: "YA",
      confirmVariant: "danger",
      cancelText: "TIDAK"
    });

    if (confirmed) {
      leaveBattleToLobby();
    }
  });

  elements.modalConfirm.addEventListener("click", () => closeModal(true));
  elements.modalCancel.addEventListener("click", () => closeModal(false));

  window.addEventListener("resize", () => {
    if (state.screen === "gameplay") {
      syncBattleUi();
    }
  });
}

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

async function init() {
  bindEvents();
  await runIntro();
  const [khodamData, effectData] = await Promise.all([fetchKhodamData(), fetchEffectData()]);
  state.data = khodamData;
  state.effects = effectData;
  state.khodamList = Object.keys(getKhodamMap());

  if (!getKhodamMap()[state.selectedKhodamKey]) {
    state.selectedKhodamKey = state.khodamList[0];
  }

  await runEarlyCaching(state.data);
  renderLobbySelection();
  renderSelectionCards();
  showScreen("lobby");
}

init().catch((error) => {
  console.error(error);
  showScreen("lobby");
  showToast("Gagal memuat data game");
});
