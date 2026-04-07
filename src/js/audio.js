import { elements, state } from "./variable.js";

function getSfxMap() { return state.sfx || {}; }

function preloadAudio(audio) {
  if (!audio) return Promise.resolve();
  return new Promise((resolve) => {
    const finish = () => {
      audio.removeEventListener("canplaythrough", finish);
      audio.removeEventListener("error", finish);
      resolve();
    };
    audio.addEventListener("canplaythrough", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    audio.load();
    window.setTimeout(finish, 5000);
  });
}

function createAudioInstance(src, { loop = false, volume = 1 } = {}) {
  if (!src || src === "none") return null;
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.loop = loop;
  audio.volume = volume;
  audio.load();
  return audio;
}

export async function initializeAudioSystem() {
  const sfx = getSfxMap();
  state.audio.music.lobby = createAudioInstance(sfx["lobby-music"], { loop: true, volume: 0.45 });
  state.audio.music.gameplay = createAudioInstance(sfx["gameplay-music"], { loop: true, volume: 0.4 });
  await Promise.all([
    preloadAudio(state.audio.music.lobby),
    preloadAudio(state.audio.music.gameplay)
  ]);
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

export function stopAllMusic() {
  stopAudio(state.audio.music.lobby);
  stopAudio(state.audio.music.gameplay);
  state.audio.activeMusic = null;
}

export function playMusic(trackName) {
  const nextTrack = state.audio.music[trackName];
  if (!nextTrack) return;
  
  // Prevent stacking: if this track is already playing, skip
  if (state.audio.activeMusic === nextTrack && !nextTrack.paused) return;
  
  // Prevent rapid successive calls during transition
  if (state.audio.isTransitioning) return;
  state.audio.isTransitioning = true;
  
  try {
    // Stop all other music tracks immediately
    Object.values(state.audio.music).forEach((audio) => {
      if (audio && audio !== nextTrack) stopAudio(audio);
    });
    
    // Reset and start new track
    nextTrack.currentTime = 0;
    state.audio.activeMusic = nextTrack;
    tryPlayAudio(nextTrack);
  } finally {
    state.audio.isTransitioning = false;
  }
}

export function ensureMusic(trackName) {
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

export function bindAudioUnlock() {
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

export function playSfx(name, { volume = 1 } = {}) {
  const src = getSfxMap()[name];
  if (!src || src === "none") return;
  const audio = createAudioInstance(src, { volume });
  tryPlayAudio(audio);
}

export function playActionSfx(actionKey) {
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

export function clearIdleHintTimer(timerKey) {
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

export function resetLobbyIdleHint() {
  scheduleIdleHint(
    "lobbyTimer",
    () => [elements.selectionButton, elements.playButton],
    () => state.screen === "lobby"
  );
}

export function resetSelectionIdleHint() {
  scheduleIdleHint(
    "selectionTimer",
    () => [elements.cancelSelectionButton, elements.confirmSelectionButton, elements.createKhodamButton],
    () => state.screen === "selection"
  );
}

export function resetActionIdleHint() {
  scheduleIdleHint(
    "actionTimer",
    () => elements.actionButtons.filter((button) => !button.disabled),
    () => state.screen === "gameplay" && !state.gameOver && state.turnOwner === "player" && !state.isBattleBusy
  );
}
