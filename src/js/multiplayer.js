import {
  elements,
  overlays,
  state,
  MATCHMAKING_BOT_TIMEOUT_MS,
  TURN_TIMEOUT_MS,
  HEARTBEAT_INTERVAL_MS,
  QUEUE_TIMEOUT_MS,
  delay,
  clamp,
  getPlayerDisplayName,
  getKhodamDisplayName,
  getEffectMap,
  queueAssetPreload,
  isBattleSessionActive
} from "./variable.js";
import { showScreen, showOverlay, syncBattleUi, showToast, rotateOrbit, resetOrbit, clearCelebrationState, resetBattleFeedback, startOrbitLoop } from "./ui.js";
import { playMusic, stopAllMusic, playActionSfx } from "./audio.js";
import {
  createBattleParticipant,
  updateActionButtons,
  clearBotTurnTimeout,
  startBotBattle,
  finishBattle,
  playFullscreenAnimation,
  applyShield,
  applyDamage,
  rollCritical,
  getDamageMultiplier,
  tryApplyActionEffect,
  addOrRefreshEffect,
  getEffectDefinition,
  resolveTurnEffects,
  getUsableActions,
  warmupBattleAssets
} from "./gameplay.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdJ83a2vwePAVY3tVTx4WXXIAqtcNgm_s",
  authDomain: "global-db-yasagiriderma.firebaseapp.com",
  databaseURL: "https://global-db-yasagiriderma-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "global-db-yasagiriderma",
  storageBucket: "global-db-yasagiriderma.firebasestorage.app",
  messagingSenderId: "705392456719",
  appId: "1:705392456719:web:ca41d5c265aeec37fe1f7a"
};

let firebaseReady = false;
let db = null;
let ref;
let set;
let get;
let onValue;
let update;
let remove;
let push;
let off;

async function ensureFirebase() {
  if (firebaseReady) return;
  const appModule = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
  const dbModule = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js");
  const app = appModule.initializeApp(firebaseConfig);
  db = dbModule.getDatabase(app);
  ref = dbModule.ref;
  set = dbModule.set;
  get = dbModule.get;
  onValue = dbModule.onValue;
  update = dbModule.update;
  remove = dbModule.remove;
  push = dbModule.push;
  off = dbModule.off;
  firebaseReady = true;
}

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

function clearTurnTimeout() {
  if (state.online.turnTimeoutId) {
    clearTimeout(state.online.turnTimeoutId);
    state.online.turnTimeoutId = null;
  }
}

function clearHeartbeat() {
  if (state.online.heartbeatIntervalId) {
    clearInterval(state.online.heartbeatIntervalId);
    state.online.heartbeatIntervalId = null;
  }
}

export function resetOnlineMatchState() {
  clearWaitingTimeout();
  clearMatchmakingListener();
  detachAllOnlineListeners();
  clearTurnTimeout();
  clearHeartbeat();
  state.online.roomId = null;
  state.online.mySide = null;
  state.online.isConnected = true;
  state.online.reconnectAttempts = 0;
}

function setTurnTimeout(nextTurnOwner) {
  clearTurnTimeout();
  state.online.turnTimeoutId = setTimeout(async () => {
    state.online.turnTimeoutId = null;
    if (state.battleMode !== "online" || state.gameOver || state.screen !== "gameplay") return;

    const isMyTurn = (nextTurnOwner === "host" && state.online.mySide === "host") ||
      (nextTurnOwner === "guest" && state.online.mySide === "guest");

    if (isMyTurn) {
      showToast("?? Giliran skip karena timeout");
      const nextTurn = state.online.mySide === "host" ? "guest" : "host";
      await pushTurnToFirebase(nextTurn);
    } else {
      showToast("?? Giliran kamu (opponent timeout)");
      state.turnOwner = "player";
      updateActionButtons();
    }
  }, TURN_TIMEOUT_MS);
}

function handleConnectionLoss() {
  if (!state.online.isConnected) return;

  state.online.isConnected = false;
  showToast("?? Koneksi terputus, mencoba reconnect...");

  state.online.reconnectAttempts += 1;
  if (state.online.reconnectAttempts > state.online.maxReconnectAttempts) {
    showToast("? Koneksi gagal, kembali ke lobby");
    leaveBattleToLobbySafe();
    return;
  }

  const backoffMs = Math.min(1000 * Math.pow(2, state.online.reconnectAttempts - 1), 10000);
  setTimeout(() => {
    attemptReconnect();
  }, backoffMs);
}

function startHeartbeat() {
  clearHeartbeat();
  state.online.lastHeartbeat = Date.now();
  state.online.heartbeatIntervalId = setInterval(async () => {
    if (state.battleMode !== "online" || !state.online.roomId) {
      clearHeartbeat();
      return;
    }

    try {
      const roomRef = ref(db, `rooms/${state.online.roomId}`);
      const snap = await get(roomRef);

      if (snap.exists()) {
        state.online.lastHeartbeat = Date.now();
        state.online.isConnected = true;
        state.online.reconnectAttempts = 0;
      } else {
        handleConnectionLoss();
      }
    } catch {
      handleConnectionLoss();
    }
  }, HEARTBEAT_INTERVAL_MS);
}

async function attemptReconnect() {
  if (state.battleMode !== "online" || !state.online.roomId) return;

  try {
    const roomRef = ref(db, `rooms/${state.online.roomId}`);
    const snap = await get(roomRef);

    if (snap.exists()) {
      state.online.isConnected = true;
      state.online.reconnectAttempts = 0;
      showToast("? Koneksi kembali normal");
      await pushMyStateToFirebase();
    } else {
      handleConnectionLoss();
    }
  } catch {
    handleConnectionLoss();
  }
}

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

function deserializeParticipant(data, side) {
  let activeEffects = data.activeEffects || [];
  if (!Array.isArray(activeEffects)) {
    activeEffects = Object.values(activeEffects);
  }

  activeEffects = activeEffects.map((effect) => {
    if (!effect.config && effect.key) effect = { ...effect, config: getEffectMap()[effect.key] || {} };
    return effect;
  });

  const actions = data.actions || {};

  return {
    ...data,
    side,
    activeEffects,
    actions
  };
}

async function pushMyStateToFirebase() {
  const { roomId, mySide } = state.online;
  if (!roomId || !mySide) return;
  const myKey = mySide === "host" ? "hostState" : "guestState";
  await update(ref(db, `rooms/${roomId}`), {
    [myKey]: serializeParticipant(state.battle.player)
  });
}

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
  clearTurnTimeout();
  await update(ref(db, `rooms/${roomId}`), { currentTurn: nextTurn, lastAction: null });
}

export async function pushGameOverToFirebase(winner) {
  const { roomId } = state.online;
  if (!roomId) return;
  clearTurnTimeout();
  clearHeartbeat();
  await update(ref(db, `rooms/${roomId}`), { gameOver: winner });
}

async function enterOnlineBattle() {
  state.battleMode = "online";
  state.battleSession += 1;
  state.turnOwner = state.online.mySide === "host" ? "player" : "opponent";
  resetOrbit();
  clearCelebrationState();
  resetBattleFeedback();
  clearBotTurnTimeout();
  state.gameOver = false;
  state.isBattleBusy = false;

  await warmupBattleAssets();

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

function listenOnlineRoom() {
  const { roomId, mySide } = state.online;
  if (!roomId) return;

  detachAllOnlineListeners();
  startHeartbeat();

  const opponentStateKey = mySide === "host" ? "guestState" : "hostState";
  const opponentStateRef = ref(db, `rooms/${roomId}/${opponentStateKey}`);
  addOnlineListener(opponentStateRef, (snap) => {
    if (!snap.exists() || state.screen !== "gameplay") return;
    const data = snap.val();
    Object.assign(state.battle.opponent, {
      hp: data.hp,
      maxHp: data.maxHp,
      energy: data.energy,
      maxEnergy: data.maxEnergy,
      armor: data.armor,
      activeEffects: data.activeEffects || [],
      actions: data.actions || state.battle.opponent.actions
    });
    syncBattleUi();
  });

  const lastActionRef = ref(db, `rooms/${roomId}/lastAction`);
  addOnlineListener(lastActionRef, async (snap) => {
    if (!snap.exists()) return;
    const action = snap.val();
    if (action.actor === mySide) return;
    if (state.screen !== "gameplay" || state.gameOver) return;

    clearTurnTimeout();
    await handleOpponentAction(action);
  });

  const turnRef = ref(db, `rooms/${roomId}/currentTurn`);
  addOnlineListener(turnRef, (snap) => {
    if (!snap.exists()) return;
    const currentTurn = snap.val();
    const isMyTurn = (currentTurn === "host" && mySide === "host") || (currentTurn === "guest" && mySide === "guest");
    state.turnOwner = isMyTurn ? "player" : "opponent";
    state.isBattleBusy = !isMyTurn;
    updateActionButtons();

    clearTurnTimeout();
    setTurnTimeout(currentTurn);

    if (isMyTurn) showToast("Giliran kamu!");
  });

  const gameOverRef = ref(db, `rooms/${roomId}/gameOver`);
  addOnlineListener(gameOverRef, async (snap) => {
    if (!snap.exists() || !snap.val()) return;
    const winner = snap.val();
    if (state.gameOver) return;
    const iWon = winner === mySide;
    await finishBattle(iWon ? "victory" : "defeat");
  });
}

async function handleOpponentAction(actionData) {
  const { actionKey, resolvedDamage, resolvedArmor, critTriggered, critMultiplier, effectResult } = actionData;

  state.isBattleBusy = true;
  updateActionButtons();
  playActionSfx(actionKey);

  const opponent = state.battle.opponent;
  const player = state.battle.player;
  const action = opponent.actions[actionKey];

  if (!action) {
    state.isBattleBusy = false;
    return;
  }

  await playFullscreenAnimation(action.preview, "", {
    pauseGameplayMusic: actionKey === "skill" || actionKey === "ultimate"
  });

  if (state.screen !== "gameplay") return;

  if (actionKey === "shield") {
    const gained = resolvedArmor ?? 0;
    opponent.armor += gained;
    showToast(`+${gained} armor`);
  } else {
    const total = resolvedDamage ?? 0;
    const armorBlocked = Math.min(player.armor, total);
    player.armor -= armorBlocked;
    player.hp = Math.max(0, player.hp - (total - armorBlocked));
    if (critTriggered) showToast(`${getKhodamDisplayName(opponent.khodamKey)} CRITICAL x${critMultiplier?.toFixed(1)}`);
  }

  if (effectResult) {
    const effectConfig = getEffectDefinition(effectResult.effectKey);
    if (effectConfig) {
      if (effectResult.recipient === (state.online.mySide === "host" ? "host" : "guest")) {
        addOrRefreshEffect(player, effectResult.effectKey, effectConfig);
        showToast(`${getKhodamDisplayName(player.khodamKey)} terkena ${effectResult.effectKey}`);
      } else {
        addOrRefreshEffect(opponent, effectResult.effectKey, effectConfig);
        showToast(`${getKhodamDisplayName(opponent.khodamKey)} menggunakan ${effectResult.effectKey}`);
      }
    }
  }

  if (typeof action.remaining === "number") action.remaining -= 1;
  if (action.cooldown > 0) action.cooldownRemaining = action.cooldown;
  opponent.energy = clamp(opponent.energy - (action.energyCost || 0) + (action.energyGain || 0), 0, 300);

  syncBattleUi();
  await delay(420);
  await rotateOrbit("player");

  if (state.screen !== "gameplay") return;

  syncBattleUi();

  if (player.hp <= 0) {
    if (!state.gameOver) await pushGameOverToFirebase(state.online.mySide === "host" ? "guest" : "host");
    return;
  }

  await pushTurnToFirebase(state.online.mySide);
  await beginMyTurn();
}

async function beginMyTurn() {
  if (state.gameOver || state.screen !== "gameplay") return;

  clearTurnTimeout();

  const actor = state.battle.player;
  actor.energy = clamp(actor.energy + 80, 0, actor.maxEnergy || 300);
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
    const nextTurn = state.online.mySide === "host" ? "guest" : "host";
    await pushTurnToFirebase(nextTurn);
    return;
  }

  state.isBattleBusy = false;
  state.turnOwner = "player";
  updateActionButtons();
}

export async function runOnlineAction(actionKey) {
  const sessionId = state.battleSession;
  const actor = state.battle.player;
  const target = state.battle.opponent;
  const action = actor.actions[actionKey];

  if (!action) return;
  if (action.cooldownRemaining > 0) {
    showToast(`${actionKey.toUpperCase()} cooldown ${action.cooldownRemaining}`);
    return;
  }
  if (typeof action.remaining === "number" && action.remaining <= 0) return;
  if (action.energyCost > 0 && actor.energy < action.energyCost) {
    showToast("Energi tidak cukup!");
    return;
  }

  actor.energy = clamp(actor.energy - action.energyCost + action.energyGain, 0, 300);
  if (action.cooldown > 0) action.cooldownRemaining = action.cooldown;
  playActionSfx(actionKey);

  state.isBattleBusy = true;
  updateActionButtons();

  let resolvedDamage = null;
  let resolvedArmor = null;
  let critTriggered = false;
  let critMultiplier = 1;
  let effectResult = null;

  if (actionKey === "shield") {
    resolvedArmor = Number(action.armor) || 0;
    applyShield(actor, resolvedArmor);
  } else {
    const damageWithEffects = Math.max(0, Math.round((Number(action.damage) || 0) * getDamageMultiplier(actor)));
    const critResult = rollCritical(actor, damageWithEffects);
    critTriggered = critResult.triggered;
    critMultiplier = critResult.multiplier;
    resolvedDamage = critResult.total;
    applyDamage(target, resolvedDamage);
    if (critTriggered) showToast(`${getKhodamDisplayName(actor.khodamKey)} CRITICAL x${critMultiplier.toFixed(1)}`);
  }

  effectResult = tryApplyActionEffect(actor, target, actionKey);
  if (effectResult?.toast) showToast(effectResult.toast);

  if (typeof action.remaining === "number") action.remaining -= 1;

  syncBattleUi();

  await pushMyStateToFirebase();
  await pushActionToFirebase(actionKey, resolvedDamage, resolvedArmor, critTriggered, critMultiplier, effectResult, Math.random());

  await playFullscreenAnimation(action.preview, action.katakata || "", {
    pauseGameplayMusic: actionKey === "skill" || actionKey === "ultimate"
  });

  if (!isBattleSessionActive(sessionId)) return;

  await delay(420);
  await rotateOrbit("opponent");

  if (!isBattleSessionActive(sessionId)) return;
  syncBattleUi();

  if (target.hp <= 0) {
    if (!state.gameOver) await pushGameOverToFirebase(state.online.mySide);
    return;
  }

  const nextTurnOwner = state.online.mySide === "host" ? "guest" : "host";
  await pushTurnToFirebase(nextTurnOwner);
}

export async function cleanupRoom() {
  const { roomId } = state.online;
  if (roomId) {
    try { await remove(ref(db, `rooms/${roomId}`)); } catch {}
  }
  resetOnlineMatchState();
}

function leaveBattleToLobbySafe() {
  state.battleSession += 1;
  state.gameOver = false;
  state.isBattleBusy = false;
  state.battleMode = null;
  resetOnlineMatchState();
  clearBotTurnTimeout();
  clearCelebrationState();
  if (state.orbit.rafId) {
    cancelAnimationFrame(state.orbit.rafId);
    state.orbit.rafId = null;
  }
  stopAllMusic();
  resetBattleFeedback();
  showOverlay(overlays.actionMenu, false);
  showOverlay(overlays.surrender, false);
  showScreen("lobby");
  if (elements.playButton) elements.playButton.disabled = false;
}

export async function startMatchmaking() {
  try {
    await ensureFirebase();
  } catch (err) {
    console.error("Firebase gagal dimuat:", err);
    const playerName = getPlayerDisplayName();
    const khodamKey = state.selectedKhodamKey;
    showToast("Mode online tidak tersedia, masuk bot...");
    await startBotBattle(playerName, khodamKey);
    return;
  }

  const { playerId } = state.online;
  const playerName = getPlayerDisplayName();
  const khodamKey = state.selectedKhodamKey;
  resetOnlineMatchState();
  clearBotTurnTimeout();
  stopAllMusic();
  state.battleMode = null;
  if (elements.playButton) elements.playButton.disabled = true;

  showScreen("search");
  showOverlay(overlays.actionMenu, false);
  showOverlay(overlays.surrender, false);

  try {
    const queueSnap = await get(ref(db, "queue"));
    let foundRoom = null;

    if (queueSnap.exists()) {
      const entries = queueSnap.val();
      for (const [roomId, entry] of Object.entries(entries)) {
        if (entry.playerId === playerId) continue;
        if (Date.now() - entry.ts > QUEUE_TIMEOUT_MS) continue;
        foundRoom = { roomId, host: entry };
        break;
      }
    }

    if (foundRoom) {
      state.battleMode = "online";
      const { roomId, host } = foundRoom;
      state.online.roomId = roomId;
      state.online.mySide = "guest";

      const hostQueueSnap = await get(ref(db, `queue/${roomId}`));
      if (!hostQueueSnap.exists() || hostQueueSnap.val().playerId !== host.playerId) {
        showToast("Room sudah penuh, mencari lawan lain...");
        state.battleMode = null;
        state.online.roomId = null;
        state.online.mySide = null;
        await delay(500);
        return startMatchmaking();
      }

      try {
        await remove(ref(db, `queue/${roomId}`));
      } catch {
        showToast("Gagal join, mencoba lagi...");
        state.battleMode = null;
        state.online.roomId = null;
        state.online.mySide = null;
        await delay(500);
        return startMatchmaking();
      }

      const hostParticipant = createBattleParticipant("opponent", host.khodamKey, host.playerName);
      const guestParticipant = createBattleParticipant("player", khodamKey, playerName);

      state.battle = {
        playerName,
        player: guestParticipant,
        opponent: deserializeParticipant(hostParticipant, "opponent")
      };

      await set(ref(db, `rooms/${roomId}`), {
        host: { playerId: host.playerId, khodamKey: host.khodamKey, playerName: host.playerName },
        guest: { playerId, khodamKey, playerName },
        hostState: serializeParticipant(createBattleParticipant("player", host.khodamKey, host.playerName)),
        guestState: serializeParticipant(guestParticipant),
        currentTurn: "host",
        lastAction: null,
        gameOver: null,
        createdAt: Date.now()
      });

      await enterOnlineBattle();
    } else {
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

      showToast("Menunggu lawan...");

      state.online.waitingTimeout = setTimeout(async () => {
        clearWaitingTimeout();
        clearMatchmakingListener();
        try { await remove(ref(db, `queue/${roomId}`)); } catch {}
        showToast("Tidak ada lawan, masuk bot...");
        await startBotBattle(playerName, khodamKey);
      }, MATCHMAKING_BOT_TIMEOUT_MS);

      const roomRef = ref(db, `rooms/${roomId}`);
      const matchmakingCallback = async (snap) => {
        if (!snap.exists() || state.online.roomId !== roomId || state.battleMode !== "online") return;
        clearMatchmakingListener();
        clearWaitingTimeout();

        const roomData = snap.val();
        const guestInfo = roomData.guest;
        state.battle = {
          playerName,
          player: deserializeParticipant(roomData.hostState, "player"),
          opponent: deserializeParticipant(roomData.guestState, "opponent")
        };
        state.battle.opponent.displayName = guestInfo.playerName;

        await enterOnlineBattle();
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
  } finally {
    if (state.screen === "lobby" && elements.playButton) elements.playButton.disabled = false;
  }
}

export function handleBeforeUnloadCleanup() {
  const { roomId } = state.online;
  if (roomId) {
    remove(ref(db, `rooms/${roomId}`));
    remove(ref(db, `queue/${roomId}`));
  }
}
