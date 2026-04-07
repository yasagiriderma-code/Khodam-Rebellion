import {
  elements,
  overlays,
  state,
  actionMeta,
  ENERGY_SETTINGS,
  delay,
  clamp,
  toTitleCase,
  getKhodamMap,
  getEffectMap,
  getKhodamDisplayName,
  getKhodamCelebrationSrc,
  queueAssetPreload,
  applyVideoSource,
  waitVideoReady,
  isVideoAsset,
  isAssetReady,
  isBattleSessionActive
} from "./variable.js";
import { playActionSfx, playMusic, stopAllMusic, playSfx, ensureMusic } from "./audio.js";
import {
  showScreen,
  showOverlay,
  syncBattleUi,
  showToast,
  showDamageFloat,
  resetBattleFeedback,
  clearCelebrationState,
  rotateOrbit,
  resetOrbit,
  startOrbitLoop,
  openModal
} from "./ui.js";

let startMatchmakingHandler = async () => {};
let cleanupRoomHandler = async () => {};
let runOnlineActionHandler = async () => {};

export function configureGameplayHandlers({ startMatchmaking, cleanupRoom, runOnlineAction }) {
  if (startMatchmaking) startMatchmakingHandler = startMatchmaking;
  if (cleanupRoom) cleanupRoomHandler = cleanupRoom;
  if (runOnlineAction) runOnlineActionHandler = runOnlineAction;
}

export function createBattleParticipant(side, khodamKey, displayName) {
  const khodam = getKhodamMap()[khodamKey];
  const critical = khodam.critical || {};
  const buildAction = (actionKey) => {
    const base = khodam.action[actionKey] || {};
    const remaining = base.use === "unlimited" || typeof base.use === "undefined" ? undefined : Number(base.use);
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

export function clearBotTurnTimeout() {
  if (state.botTurnTimeout) {
    clearTimeout(state.botTurnTimeout);
    state.botTurnTimeout = null;
  }
}

function getActionButtonLabel(button, actionKey) {
  const playerActionName = state.battle?.player?.actions?.[actionKey]?.name;
  if (playerActionName) return toTitleCase(playerActionName);
  if (!button.dataset.baseLabel) {
    button.dataset.baseLabel = button.textContent.trim() || actionMeta[actionKey]?.label || actionKey.toUpperCase();
  }
  return button.dataset.baseLabel;
}

export function updateActionButtons() {
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
}

export async function playFullscreenAnimation(src, quote, options = {}) {
  if (!src || src === "none") return;
  const { allowSkip = true, muted = false, pauseGameplayMusic = false } = options;
  const gameplayMusic = state.audio.music.gameplay;
  const shouldResumeGameplayMusic = Boolean(
    pauseGameplayMusic && gameplayMusic && state.audio.activeMusic === gameplayMusic && !gameplayMusic.paused
  );

  if (isVideoAsset(src) && !isAssetReady(src)) {
    return;
  }

  await queueAssetPreload(src);
  if (pauseGameplayMusic && gameplayMusic && !gameplayMusic.paused) gameplayMusic.pause();

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
  await waitVideoReady(video);

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

  if (shouldResumeGameplayMusic && state.screen === "gameplay" && !state.gameOver) {
    const playPromise = gameplayMusic.play();
    if (playPromise?.catch) playPromise.catch(() => {});
  }
}

export function stopFullscreenAnimation() {
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

async function playBattleCelebration(result) {
  const winnerSide = result === "victory" ? "player" : "opponent";
  const loserSide = winnerSide === "player" ? "opponent" : "player";
  const winner = state.battle?.[winnerSide];
  if (!winner) return;

  const gameplayMusic = state.audio.music.gameplay;
  if (gameplayMusic) {
    gameplayMusic.pause();
    gameplayMusic.currentTime = 0;
  }
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

export function applyDamage(target, amount) {
  const armorBlocked = Math.min(target.armor, amount);
  target.armor -= armorBlocked;
  const hpDamage = amount - armorBlocked;
  target.hp = Math.max(0, target.hp - hpDamage);
  return { armorBlocked, hpDamage, total: amount };
}

export function rollCritical(participant, amount) {
  const chance = clamp(Number(participant?.critical?.chance) || 0, 0, 100);
  const multiplier = Math.max(Number(participant?.critical?.multiplier) || 1, 1);
  const triggered = chance > 0 && Math.random() * 100 < chance;
  const total = triggered ? Math.max(1, Math.round(amount * multiplier)) : amount;
  return { triggered, chance, multiplier, total };
}

export function applyShield(target, amount) {
  target.armor += amount;
  return amount;
}

export function getEffectDefinition(effectKey) { return getEffectMap()[effectKey] || null; }

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

export function addOrRefreshEffect(participant, effectKey, effectConfig) {
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

export function getDamageMultiplier(participant) {
  const bonusPercent = participant.activeEffects.reduce((total, effect) => total + (Number(effect.config?.damageIncrease) || 0), 0);
  return 1 + bonusPercent / 100;
}

export function isActionDisabledByEffects(participant, actionKey) {
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

export function tryApplyActionEffect(actor, target, actionKey) {
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
      effectKey,
      recipient: recipient.side,
      toast: effectConfig.target === "sendiri"
        ? `${getKhodamDisplayName(actor.khodamKey)} menggunakan ${effectKey}`
        : `${getKhodamDisplayName(recipient.khodamKey)} terkena ${effectKey}`
    };
  }
  return null;
}

export function resolveTurnEffects(participant) {
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
    if (typeof effect.remainingTurns === "number" && effect.remainingTurns > 0) effect.remainingTurns -= 1;
  });
  removeExpiredEffects(participant);
  return events;
}

export function getUsableActions(participant) {
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

function getParticipantActionAssets(participant) {
  if (!participant) return [];
  const assets = ["skill", "ultimate"].map((actionKey) => participant.actions[actionKey]?.preview).filter((src) => src && src !== "none");
  const celebration = getKhodamCelebrationSrc(participant.khodamKey);
  if (celebration && celebration !== "none") assets.push(celebration);
  return assets;
}

export async function warmupBattleAssets(onProgress) {
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
  await Promise.all(uniqueAssets.map((src) => queueAssetPreload(src).then(() => {
    loaded += 1;
    onProgress?.(Math.round((loaded / uniqueAssets.length) * 100), loaded, uniqueAssets.length);
  })));
}

export async function startBotBattle(playerName, khodamKey) {
  const botKhodamKey = pickBotKhodamKey(khodamKey);

  state.battle = {
    playerName,
    player: createBattleParticipant("player", khodamKey, playerName),
    opponent: createBattleParticipant("opponent", botKhodamKey, "BOT")
  };

  await warmupBattleAssets();
  await enterBotBattle();
}

export async function beginLocalPlayerTurn() {
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

export async function runLocalBotPlayerAction(actionKey) {
  const sessionId = state.battleSession;
  const actor = state.battle.player;
  const target = state.battle.opponent;
  const action = actor.actions[actionKey];

  if (!action) return;
  if (action.cooldownRemaining > 0) {
    showToast(`${actionKey.toUpperCase()} cooldown ${action.cooldownRemaining}`);
    return;
  }
  if (isActionDisabledByEffects(actor, actionKey)) {
    showToast(`${actionKey.toUpperCase()} sedang terkunci`);
    return;
  }
  if (typeof action.remaining === "number" && action.remaining <= 0) return;
  if (action.energyCost > 0 && actor.energy < action.energyCost) {
    showToast("Energi tidak cukup!");
    return;
  }

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

export async function runPlayerAction(actionKey) {
  if (state.battleMode === "bot") {
    await runLocalBotPlayerAction(actionKey);
    return;
  }
  await runOnlineActionHandler(actionKey);
}

export async function finishBattle(result) {
  state.gameOver = true;
  state.isBattleBusy = true;
  clearBotTurnTimeout();
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

  await cleanupRoomHandler();

  if (confirmed) {
    await startMatchmakingHandler();
  } else {
    leaveBattleToLobby();
  }
}

export function leaveBattleToLobby() {
  state.battleSession += 1;
  state.gameOver = false;
  state.isBattleBusy = false;
  state.battleMode = null;
  clearBotTurnTimeout();
  clearCelebrationState();
  if (state.orbit.rafId) {
    cancelAnimationFrame(state.orbit.rafId);
    state.orbit.rafId = null;
  }
  stopFullscreenAnimation();
  stopAllMusic();
  resetBattleFeedback();
  showOverlay(overlays.actionMenu, false);
  showOverlay(overlays.surrender, false);
  showScreen("lobby");
  if (elements.playButton) elements.playButton.disabled = false;
  ensureMusic("lobby");
}
