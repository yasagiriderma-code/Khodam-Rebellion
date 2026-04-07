import {
  elements,
  state,
  fetchKhodamData,
  fetchEffectData,
  fetchSfxData,
  loadCustomKhodams,
  getKhodamMap,
  generateDefaultPlayerName,
  runEarlyCaching
} from "./variable.js";
import {
  initializeAudioSystem,
  bindAudioUnlock,
  playSfx,
  ensureMusic,
  resetLobbyIdleHint,
  resetSelectionIdleHint,
  resetActionIdleHint,
  stopAllMusic
} from "./audio.js";
import {
  renderLobbySelection,
  renderSelectionCards,
  showScreen,
  openSelectionScreen,
  closeSelectionScreen,
  confirmPendingKhodam,
  selectPendingKhodam,
  syncSelectionButtons,
  syncCombatantUi,
  openModal,
  closeModal,
  runIntro
} from "./ui.js";
import {
  runPlayerAction,
  updateActionButtons,
  stopFullscreenAnimation,
  finishBattle,
  configureGameplayHandlers
} from "./gameplay.js";
import {
  startMatchmaking,
  runOnlineAction,
  cleanupRoom,
  pushGameOverToFirebase,
  handleBeforeUnloadCleanup,
  resetOnlineMatchState
} from "./multiplayer.js";

function bindEvents() {
  elements.selectionButton.addEventListener("click", () => {
    playSfx("ui-sfx", { volume: 0.7 });
    openSelectionScreen();
  });

  elements.cancelSelectionButton.addEventListener("click", () => {
    playSfx("ui-sfx", { volume: 0.7 });
    closeSelectionScreen();
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
    state.battle.playerName = elements.playerNameInput.value.trim() || state.defaultPlayerName;
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
    if (!confirmed) return;

    if (state.battleMode === "bot") {
      await finishBattle("defeat");
    } else if (!state.gameOver) {
      await pushGameOverToFirebase(state.online.mySide === "host" ? "guest" : "host");
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

  elements.skipAnimationButton?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    stopFullscreenAnimation();
  });

  window.addEventListener("resize", () => {
    if (state.screen === "gameplay" && state.battle) {
      updateActionButtons();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (state.screen === "lobby" && event.target.closest(".main-lobby")) resetLobbyIdleHint();
    if (state.screen === "selection" && event.target.closest(".khodam-selection")) resetSelectionIdleHint();
    if (state.screen === "gameplay" && event.target.closest(".gameplay, .action-menu-overlay")) resetActionIdleHint();
  });

  window.addEventListener("beforeunload", () => {
    handleBeforeUnloadCleanup();
  });
}

export async function initGame() {
  configureGameplayHandlers({
    startMatchmaking,
    cleanupRoom: async () => {
      await cleanupRoom();
      resetOnlineMatchState();
    },
    runOnlineAction
  });

  bindEvents();
  bindAudioUnlock();
  state.defaultPlayerName = generateDefaultPlayerName();
  elements.playerNameInput.placeholder = state.defaultPlayerName;

  await runIntro();

  const { khodamData, effectData, sfxData } = await runEarlyCaching(showScreen);

  const customKhodams = loadCustomKhodams();
  state.data = { ...khodamData, ...customKhodams };
  state.effects = effectData;
  state.sfx = sfxData;

  const allKhodamKeys = Object.keys(getKhodamMap());
  const customKeys = allKhodamKeys.filter((key) => key.startsWith("custom-"));
  const defaultKeys = allKhodamKeys.filter((key) => !key.startsWith("custom-"));
  state.khodamList = [...customKeys, ...defaultKeys];

  if (!getKhodamMap()[state.selectedKhodamKey]) {
    state.selectedKhodamKey = state.khodamList[0];
  }

  await initializeAudioSystem();
  renderLobbySelection();
  renderSelectionCards();
  showScreen("lobby");
  ensureMusic("lobby");
}

initGame().catch((error) => {
  console.error(error);
  stopAllMusic();
  showScreen("lobby");
});
