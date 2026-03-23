// ─── Firebase SDK (ESM via CDN – loaded via <script type="module"> in index.html)
// Import at top of module
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    get,
    push,
    remove,
    onValue,
    off,
    onDisconnect,
    serverTimestamp,
    update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ─── Firebase Init ────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyCdJ83a2vwePAVY3tVTx4WXXIAqtcNgm_s",
    authDomain: "global-db-yasagiriderma.firebaseapp.com",
    projectId: "global-db-yasagiriderma",
    storageBucket: "global-db-yasagiriderma.firebasestorage.app",
    messagingSenderId: "705392456719",
    appId: "1:705392456719:web:ca41d5c265aeec37fe1f7a"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ─── Matchmaking / Online State ───────────────────────────────────────────────
let isOnline = navigator.onLine;
let myPlayerId = null;          // unique session ID
let currentRoomId = null;       // Firebase room key
let myRole = null;              // "host" | "guest"
let roomRef = null;             // Firebase ref for current room
let roomListener = null;        // active onValue listener
let waitingListener = null;     // listener while searching
let isSearchingMatch = false;
let matchFound = false;

// ─── Game State ───────────────────────────────────────────────────────────────
let characters = [];
let selectedCharacterIndex = 0;
let selectionCursor = 0;
let selectionCards = [];
let selectionReady = false;
let selectionInitialized = false;
const previewVideoPool = new Map();
const arenaImage = new Image();

let gameCanvas;
let gameCtx;
let container;
let footer;
let angle = Math.PI / 2;
let targetAngle = angle;
let isSwitching = false;
let isPlayerTurn = true;
let inGameStarted = false;
let currentEnemyIndex = -1;
let battleState = null;
let battleToken = 0;
let ultimateCompletion = null;
let currentTheme = "dark";
let sfxVolume = 0.7;
let bgmVolume = 0.35;
let audioContext;
let customBgmUrl = "";
const cachedAssetUrls = new Map();
const cachedAssetPromises = new Map();
const loadingState = { total: 0, loaded: 0 };

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const loadingScreen          = document.getElementById("loading");
const loadingProgressBar     = document.getElementById("loadingProgressBar");
const loadingStatusLabel     = document.getElementById("loadingStatusLabel");
const loadingPercentLabel    = document.getElementById("loadingPercentLabel");
const lobbyBgVideo           = document.getElementById("lobby-bg-video");
const lobbyCharacterName     = document.getElementById("lobby-character-name");
const lobbyCharacterRole     = document.getElementById("lobby-character-role");
const selectionTrack         = document.getElementById("selectionTrack");
const selectionSummary       = document.getElementById("selection-summary");
const selectionSkillName     = document.getElementById("selectionSkillName");
const startGameBtn           = document.getElementById("startGameBtn");
const openSelectionBtn       = document.getElementById("openSelectionBtn");
const openSettingsBtn        = document.getElementById("openSettingsBtn");
const confirmSelectionBtn    = document.getElementById("confirmSelectionBtn");
const closeSelectionBtn      = document.getElementById("closeSelectionBtn");
const closeSettingsBtn       = document.getElementById("closeSettingsBtn");
const prevBtn                = document.getElementById("prevBtn");
const nextBtn                = document.getElementById("nextBtn");
const inGameTitle            = document.getElementById("inGameTitle");
const turnBanner             = document.getElementById("turnBanner");
const ultimateOverlay        = document.getElementById("ultimate-overlay");
const ultimateVideo          = document.getElementById("ultimateVideo");
const battleResultOverlay    = document.getElementById("battle-result-overlay");
const battleResultTitle      = document.getElementById("battleResultTitle");
const battleResultSubtitle   = document.getElementById("battleResultSubtitle");
const rematchBtn             = document.getElementById("rematchBtn");
const backToLobbyBtn         = document.getElementById("backToLobbyBtn");
const ultimateActionBtn      = document.getElementById("ultimateActionBtn");
const ultimateBadge          = document.getElementById("ultimateBadge");
const surrenderOverlay       = document.getElementById("surrender-overlay");
const confirmSurrenderBtn    = document.getElementById("confirmSurrenderBtn");
const cancelSurrenderBtn     = document.getElementById("cancelSurrenderBtn");
const saveSettingsBtn        = document.getElementById("saveSettingsBtn");
const sfxVolumeSlider        = document.getElementById("sfxVolumeSlider");
const bgmVolumeSlider        = document.getElementById("bgmVolumeSlider");
const sfxVolumeValue         = document.getElementById("sfxVolumeValue");
const bgmVolumeValue         = document.getElementById("bgmVolumeValue");
const customBgmInput         = document.getElementById("customBgmInput");
const lightModeBtn           = document.getElementById("lightModeBtn");
const darkModeBtn            = document.getElementById("darkModeBtn");
const bgmAudio               = document.getElementById("bgmAudio");

// ─── Matchmaking UI overlay (injected) ────────────────────────────────────────
function injectMatchmakingOverlay() {
    if (document.getElementById("matchmaking-overlay")) return;
    const el = document.createElement("div");
    el.id = "matchmaking-overlay";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `
        <div class="mm-panel">
            <div class="mm-badge">MATCHMAKING</div>
            <div id="mmTitle" class="mm-title">Mencari lawan...</div>
            <div id="mmSub" class="mm-sub">Menghubungkan ke server</div>
            <div class="mm-spinner"></div>
            <button id="mmCancelBtn" class="result-btn back">Batal</button>
        </div>
    `;
    // style
    const style = document.createElement("style");
    style.textContent = `
        #matchmaking-overlay {
            display: none;
            position: absolute;
            inset: 0;
            z-index: 120;
            background: rgba(2,6,23,0.92);
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        #matchmaking-overlay.show { display: flex; }
        .mm-panel {
            display: flex; flex-direction: column; align-items: center;
            gap: 12px; padding: 32px 28px; background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.14); border-radius: 20px;
            max-width: 280px; width: 90%; text-align: center;
        }
        .mm-badge {
            font-size: 0.7rem; letter-spacing: 3px;
            color: var(--primary-glow); font-weight: 700;
        }
        .mm-title { font-size: 1.4rem; font-weight: 700; }
        .mm-sub { font-size: 0.85rem; color: rgba(255,255,255,0.6); min-height: 20px; }
        .mm-spinner {
            width: 36px; height: 36px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top-color: var(--primary-glow);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
    document.getElementById("game-container").appendChild(el);

    document.getElementById("mmCancelBtn").addEventListener("click", cancelMatchmaking);
}

function showMatchmakingOverlay(title, sub) {
    injectMatchmakingOverlay();
    const overlay = document.getElementById("matchmaking-overlay");
    document.getElementById("mmTitle").textContent = title || "Mencari lawan...";
    document.getElementById("mmSub").textContent = sub || "";
    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");
}

function updateMatchmakingSub(sub) {
    const el = document.getElementById("mmSub");
    if (el) el.textContent = sub;
}

function hideMatchmakingOverlay() {
    const overlay = document.getElementById("matchmaking-overlay");
    if (overlay) {
        overlay.classList.remove("show");
        overlay.setAttribute("aria-hidden", "true");
    }
}

// ─── Player ID ────────────────────────────────────────────────────────────────
function getOrCreatePlayerId() {
    let id = sessionStorage.getItem("kr_player_id");
    if (!id) {
        id = "p_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        sessionStorage.setItem("kr_player_id", id);
    }
    return id;
}

// ─── Online check ─────────────────────────────────────────────────────────────
window.addEventListener("online",  () => { isOnline = true; });
window.addEventListener("offline", () => { isOnline = false; });

// ─── Matchmaking flow ─────────────────────────────────────────────────────────
async function startMatchmaking() {
    if (!isOnline) {
        startBotGame();
        return;
    }

    isSearchingMatch = true;
    matchFound = false;
    myPlayerId = getOrCreatePlayerId();

    showMatchmakingOverlay("Mencari lawan...", "Menyambungkan ke server...");

    try {
        // ── Bersihkan stale rooms dulu (waiting > 30 detik tanpa createdAt valid) ──
        const waitingRef = ref(db, "matchmaking/waiting");
        const snapshot = await get(waitingRef);
        let joined = false;

        if (snapshot.exists()) {
            const waitingRooms = snapshot.val();
            const now = Date.now();

            for (const [roomId, roomData] of Object.entries(waitingRooms)) {
                // Skip room milik sendiri
                if (roomData.hostId === myPlayerId) continue;

                // Skip room yang sudah terlalu lama (> 30 detik) → stale, hapus
                const age = now - (roomData.createdAt || 0);
                if (age > 30000) {
                    await remove(ref(db, `matchmaking/waiting/${roomId}`)).catch(() => {});
                    continue;
                }

                // Join sebagai guest
                joined = true;
                currentRoomId = roomId;
                myRole = "guest";
                currentEnemyIndex = roomData.hostCharacterIndex;

                const activeRoomData = {
                    host: {
                        id: roomData.hostId,
                        characterIndex: roomData.hostCharacterIndex,
                        hp: characters[roomData.hostCharacterIndex]?.hp || 2000,
                        bonusHp: 0
                    },
                    guest: {
                        id: myPlayerId,
                        characterIndex: selectedCharacterIndex,
                        hp: characters[selectedCharacterIndex]?.hp || 2000,
                        bonusHp: 0
                    },
                    turn: "host",
                    status: "active",
                    createdAt: roomData.createdAt
                };

                await set(ref(db, `rooms/${roomId}`), activeRoomData);
                await remove(ref(db, `matchmaking/waiting/${roomId}`));

                updateMatchmakingSub("Lawan ditemukan! Memulai battle...");
                await sleep(800);

                hideMatchmakingOverlay();
                isSearchingMatch = false;
                matchFound = true;
                startOnlineBattle(roomId, "guest");
                break;
            }
        }

        if (!joined) {
            // Buat room baru sebagai host
            const newRoomRef = push(ref(db, "matchmaking/waiting"));
            currentRoomId = newRoomRef.key;
            myRole = "host";

            // Simpan createdAt sebagai client timestamp (serverTimestamp tidak bisa dibaca saat offline)
            await set(newRoomRef, {
                hostId: myPlayerId,
                hostCharacterIndex: selectedCharacterIndex,
                createdAt: Date.now()
            });

            // Auto-hapus saat disconnect
            onDisconnect(newRoomRef).remove();

            updateMatchmakingSub("Menunggu lawan masuk...");

            // Listen untuk room aktif
            const activeRef = ref(db, `rooms/${currentRoomId}`);
            const capturedRoomId = currentRoomId;

            waitingListener = onValue(activeRef, async (snap) => {
                if (!isSearchingMatch) return;
                if (!snap.exists()) return;

                const room = snap.val();
                if (room && room.status === "active" && room.guest) {
                    // Matikan listener — gunakan off() langsung dengan ref
                    off(activeRef);
                    waitingListener = null;

                    currentEnemyIndex = room.guest.characterIndex;

                    updateMatchmakingSub("Lawan ditemukan! Memulai battle...");
                    await sleep(800);

                    hideMatchmakingOverlay();
                    isSearchingMatch = false;
                    matchFound = true;
                    startOnlineBattle(capturedRoomId, "host");
                }
            });

            // Timeout 20 detik → fallback bot
            setTimeout(async () => {
                if (!isSearchingMatch) return;
                off(activeRef);
                waitingListener = null;
                await cleanupRoom();
                isSearchingMatch = false;
                hideMatchmakingOverlay();
                showToast("Tidak ada lawan online. Lawan bot!");
                startBotGame();
            }, 20000);
        }
    } catch (err) {
        console.error("Matchmaking error:", err);
        isSearchingMatch = false;
        hideMatchmakingOverlay();
        showToast(`Koneksi gagal (${err.code || err.message}). Lawan bot!`);
        startBotGame();
    }
}

async function cancelMatchmaking() {
    isSearchingMatch = false;
    if (currentRoomId) {
        off(ref(db, `rooms/${currentRoomId}`));
    }
    waitingListener = null;
    await cleanupRoom();
    hideMatchmakingOverlay();
    showSection("lobby");
}

async function cleanupRoom() {
    if (!currentRoomId) return;
    try {
        await remove(ref(db, `matchmaking/waiting/${currentRoomId}`));
        if (matchFound) {
            await remove(ref(db, `rooms/${currentRoomId}`));
        }
    } catch (_) {}
    currentRoomId = null;
    myRole = null;
}

// ─── Online Battle ────────────────────────────────────────────────────────────
function startOnlineBattle(roomId, role) {
    myRole = role;
    currentRoomId = roomId;
    matchFound = true;

    // currentEnemyIndex already set before calling this
    showSection("in-game");
}

function listenToRoom() {
    if (!currentRoomId) return;
    if (roomRef) {
        off(roomRef);
        roomListener = null;
    }

    roomRef = ref(db, `rooms/${currentRoomId}`);
    roomListener = onValue(roomRef, (snap) => {
        if (!snap.exists()) {
            // Room deleted – opponent disconnected
            if (battleState && !battleState.winner) {
                finishBattle("player");
                showToast("Lawan disconnect. Kamu menang!");
            }
            return;
        }

        const room = snap.val();
        if (!room || !battleState) return;

        // Sync HP values from DB for both sides
        const myKey   = myRole === "host" ? "host" : "guest";
        const oppKey  = myRole === "host" ? "guest" : "host";

        if (room[myKey]  && room[myKey].hp  !== undefined) {
            battleState.player.hp      = room[myKey].hp;
            battleState.player.bonusHp = room[myKey].bonusHp || 0;
        }
        if (room[oppKey] && room[oppKey].hp !== undefined) {
            battleState.enemy.hp      = room[oppKey].hp;
            battleState.enemy.bonusHp = room[oppKey].bonusHp || 0;
        }

        // Handle winner
        if (room.status === "finished" && room.winner && !battleState.winner) {
            const localWinner = room.winner === myRole ? "player" : "enemy";
            finishBattle(localWinner);
            return;
        }

        // Handle turn
        const myTurnKey = myRole;
        if (room.turn === myTurnKey && !isPlayerTurn && !battleState.winner) {
            isPlayerTurn = true;
            footer.classList.remove("hidden");
            const playerChar = getSelectedCharacter();
            if (playerChar) turnBanner.textContent = `Giliran ${playerChar.name}`;
            updateUltimateButton();
        } else if (room.turn !== myTurnKey && isPlayerTurn && !battleState.winner) {
            isPlayerTurn = false;
            footer.classList.add("hidden");
            const enemyChar = getEnemyCharacter();
            if (enemyChar) turnBanner.textContent = `${enemyChar.name} bersiap...`;
            updateUltimateButton();
        }

        // Handle opponent action
        if (room.lastAction && room.lastAction.by !== myRole && !room.lastAction.processed) {
            handleOpponentAction(room.lastAction, room);
        }
    });

    // Cleanup on disconnect
    onDisconnect(roomRef).update({ status: "abandoned" });
}

function handleOpponentAction(actionData, room) {
    const { action, damage, bonusHp } = actionData;
    const enemyChar = getEnemyCharacter();

    if (action === "shield") {
        if (battleState) {
            battleState.enemy.bonusHp = bonusHp || 100;
            const playerChar = getSelectedCharacter();
            if (enemyChar) turnBanner.textContent = `${enemyChar.name} menambah guard`;
        }
    } else if (action === "ultimate") {
        if (battleState) battleState.enemy.ultimateUses = Math.max(0, (battleState.enemy.ultimateUses || 1) - 1);
        playUltimateVideo(enemyChar, () => {
            if (!battleState || battleState.winner) return;
            applyDamage("player", damage || 0, "ultimate");
            if (battleState.winner) { finishBattle("enemy"); return; }
            markOpponentActionProcessed();
        });
        return;
    } else if (action === "attack") {
        if (battleState) applyDamage("player", damage || 0, "attack");
        if (battleState && battleState.winner) { finishBattle("enemy"); return; }
    }

    markOpponentActionProcessed();
}

async function markOpponentActionProcessed() {
    if (!currentRoomId) return;
    try {
        await update(ref(db, `rooms/${currentRoomId}/lastAction`), { processed: true });
    } catch (_) {}
}

async function sendOnlineAction(action) {
    if (!currentRoomId || !myRole) return;

    const playerChar = getSelectedCharacter();
    const enemyChar  = getEnemyCharacter();
    if (!playerChar || !enemyChar || !battleState) return;

    const myKey  = myRole === "host" ? "host" : "guest";
    const oppKey = myRole === "host" ? "guest" : "host";
    const nextTurn = myRole === "host" ? "guest" : "host";

    let damage = 0;
    let bonusHp = battleState.player.bonusHp;

    if (action === "shield") {
        addDefenseBonus("player", 100);
        bonusHp = battleState.player.bonusHp;
        turnBanner.textContent = `${playerChar.name} menambah guard 100 HP`;
    } else if (action === "ultimate") {
        if (battleState.player.ultimateUses <= 0) {
            footer.classList.remove("hidden");
            isPlayerTurn = true;
            updateUltimateButton();
            return;
        }
        battleState.player.ultimateUses -= 1;
        updateUltimateButton();
        damage = getActionDamage(playerChar, "ultimate");
        applyDamage("enemy", damage, "ultimate");
    } else {
        damage = getActionDamage(playerChar, "attack");
        applyDamage("enemy", damage, "attack");
    }

    isPlayerTurn = false;
    footer.classList.add("hidden");
    updateUltimateButton();

    // Check win
    if (battleState.winner) {
        try {
            await update(ref(db, `rooms/${currentRoomId}`), {
                status: "finished",
                winner: myRole,
                [`${myKey}/hp`]: battleState.player.hp,
                [`${myKey}/bonusHp`]: battleState.player.bonusHp
            });
        } catch (_) {}
        finishBattle("player");
        return;
    }

    // Write action + HP update + pass turn
    try {
        await update(ref(db, `rooms/${currentRoomId}`), {
            turn: nextTurn,
            [`${myKey}/hp`]: battleState.player.hp,
            [`${myKey}/bonusHp`]: battleState.player.bonusHp,
            lastAction: {
                by: myRole,
                action,
                damage,
                bonusHp,
                processed: false,
                ts: serverTimestamp()
            }
        });
    } catch (err) {
        console.error("sendOnlineAction error:", err);
    }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg) {
    let toast = document.getElementById("kr-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "kr-toast";
        const s = document.createElement("style");
        s.textContent = `
            #kr-toast {
                position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%);
                background: rgba(0,0,0,0.82); color: #fff;
                padding: 10px 20px; border-radius: 20px;
                font-size: 0.85rem; white-space: nowrap;
                z-index: 200; opacity: 0; transition: opacity 0.3s;
                pointer-events: none;
            }
            #kr-toast.visible { opacity: 1; }
        `;
        document.head.appendChild(s);
        document.getElementById("game-container").appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 3000);
}

// ─── Bot game (offline) ───────────────────────────────────────────────────────
function startBotGame() {
    matchFound = false;
    currentRoomId = null;
    myRole = null;
    showSection("in-game");
}

// ─── Sleep util ───────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Asset caching ────────────────────────────────────────────────────────────
function getCachedAssetUrl(path) {
    return cachedAssetUrls.get(path) || path;
}

function setLoadingProgress(loaded, total, message) {
    loadingState.loaded = loaded;
    loadingState.total = total;
    const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
    loadingProgressBar.style.width = `${percent}%`;
    loadingPercentLabel.textContent = `${percent}%`;
    loadingStatusLabel.textContent = message;
}

async function cacheMediaAsset(path, label) {
    if (!path) return path;
    if (cachedAssetUrls.has(path)) {
        loadingState.loaded += 1;
        setLoadingProgress(loadingState.loaded, loadingState.total, label);
        return cachedAssetUrls.get(path);
    }
    if (!cachedAssetPromises.has(path)) {
        cachedAssetPromises.set(path, (async () => {
            try {
                const response = await fetch(path, { cache: "force-cache" });
                if (!response.ok) throw new Error(`Gagal memuat: ${path}`);
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                cachedAssetUrls.set(path, objectUrl);
                return objectUrl;
            } catch (err) {
                console.warn(`Fallback untuk ${path}`, err);
                return path;
            }
        })());
    }
    try {
        return await cachedAssetPromises.get(path);
    } finally {
        loadingState.loaded += 1;
        setLoadingProgress(loadingState.loaded, loadingState.total, label);
    }
}

async function preloadCharacterMedia(characterList) {
    const assetEntries = [];
    characterList.forEach((character) => {
        if (character.preview) {
            assetEntries.push({ path: character.preview, label: `Caching preview ${character.name}...` });
        }
        if (character.skill && character.skill.animation) {
            assetEntries.push({ path: character.skill.animation, label: `Caching ultimate ${character.name}...` });
        }
    });
    assetEntries.push({ path: "./arena.png", label: "Caching arena..." });

    loadingState.total = assetEntries.length + 1;
    loadingState.loaded = 0;
    setLoadingProgress(0, loadingState.total, "Menyiapkan cache video...");
    await Promise.all(assetEntries.map((asset) => cacheMediaAsset(asset.path, asset.label)));
    loadingState.loaded += 1;
    setLoadingProgress(loadingState.loaded, loadingState.total, "Semua asset siap.");
}

function normalizeCharacter(character, index) {
    const accentPalette = ["#00d2ff", "#ff4d4d", "#ffd166", "#4dff88", "#b388ff", "#ff8fab", "#5eead4"];
    const defaultAttackByRole = { mage: 145, summoner: 135, fighter: 165, tank: 120 };
    return {
        ...character,
        accent: accentPalette[index % accentPalette.length],
        attack: Number(character.attack) || defaultAttackByRole[character.role] || 140,
        skill: character.skills && character.skills.length ? {
            ...character.skills[0],
            use: Number(character.skills[0].use) || 0
        } : null
    };
}

async function loadCharacters() {
    try {
        setLoadingProgress(0, 1, "Memuat data karakter...");
        const response = await fetch("./characters.json", { cache: "no-store" });
        if (!response.ok) throw new Error("Gagal memuat characters.json");
        const data = await response.json();
        characters = (data.characters || []).map(normalizeCharacter);
        await preloadCharacterMedia(characters);
    } catch (error) {
        console.error(error);
        selectionSummary.textContent = "Karakter gagal dimuat.";
        lobbyCharacterName.textContent = "Data Error";
        lobbyCharacterRole.textContent = "Periksa characters.json";
        loadingStatusLabel.textContent = "Gagal menyiapkan asset.";
    }

    if (!characters.length) {
        startGameBtn.disabled = true;
        openSelectionBtn.disabled = true;
        confirmSelectionBtn.disabled = true;
        return;
    }

    selectedCharacterIndex = 0;
    selectionCursor = selectedCharacterIndex;
    arenaImage.src = getCachedAssetUrl("./arena.png");
    renderLobbyPreview();
    initSelection();
    updateSelectionUI();
    loadingScreen.classList.remove("show");
    document.getElementById("lobby").classList.add("show");
}

function getSelectedCharacter() { return characters[selectedCharacterIndex] || null; }
function getEnemyCharacter()    { return characters[currentEnemyIndex]    || null; }

function pickRandomEnemyIndex() {
    if (characters.length <= 1) return selectedCharacterIndex;
    const candidates = characters.map((_, i) => i).filter((i) => i !== selectedCharacterIndex);
    return candidates[Math.floor(Math.random() * candidates.length)];
}

// ─── Battle State ─────────────────────────────────────────────────────────────
function createCombatantState(character) {
    return {
        maxHp: character.hp,
        hp: character.hp,
        bonusHp: 0,
        displayHp: character.hp,
        trailHp: character.hp,
        trailDelayUntil: 0,
        damageFx: null,
        ultimateUses: character.skill ? character.skill.use : 0
    };
}

function resetBattleState() {
    const playerCharacter = getSelectedCharacter();
    if (!playerCharacter) return;

    // If online match, enemy was already set; otherwise pick random bot
    if (!matchFound) {
        currentEnemyIndex = pickRandomEnemyIndex();
    }

    const enemyCharacter = getEnemyCharacter() || playerCharacter;

    battleState = {
        player: createCombatantState(playerCharacter),
        enemy:  createCombatantState(enemyCharacter),
        winner: null
    };

    battleToken += 1;
    angle = Math.PI / 2;
    targetAngle = angle;
    isSwitching = false;
    isPlayerTurn = true;
    footer.classList.remove("hidden");
    turnBanner.textContent = `Giliran ${playerCharacter.name}`;
    inGameTitle.textContent = `${playerCharacter.name} VS ${enemyCharacter.name}`;

    const modeTag = matchFound ? " [1v1 ONLINE]" : " [VS BOT]";
    inGameTitle.textContent += modeTag;

    hideBattleResult();
    updateUltimateButton();

    // If online, start listening for opponent moves
    if (matchFound && currentRoomId) {
        // Host goes first; guest waits
        if (myRole === "guest") {
            isPlayerTurn = false;
            footer.classList.add("hidden");
        }
        listenToRoom();
    }
}

function updateUltimateButton() {
    const uses = battleState ? battleState.player.ultimateUses : 0;
    ultimateBadge.textContent = String(Math.max(0, uses));
    ultimateBadge.style.display = uses > 0 ? "flex" : "none";
    ultimateActionBtn.disabled = uses <= 0 || !isPlayerTurn || Boolean(battleState && battleState.winner);
}

// ─── Preview Video Pool ───────────────────────────────────────────────────────
function getPreviewVideo(character) {
    if (!character || !character.preview) return null;
    if (previewVideoPool.has(character.preview)) return previewVideoPool.get(character.preview);
    const video = document.createElement("video");
    video.src = getCachedAssetUrl(character.preview);
    video.muted = true;
    video.loop = true;
    video.autoplay = false;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    previewVideoPool.set(character.preview, video);
    return video;
}

function syncInGamePreviewVideos(active) {
    const playerCharacter = getSelectedCharacter();
    const enemyCharacter  = getEnemyCharacter() || playerCharacter;
    const activePreviews = new Set(
        [playerCharacter, enemyCharacter].map((c) => c && c.preview).filter(Boolean)
    );
    previewVideoPool.forEach((video, previewPath) => {
        if (active && activePreviews.has(previewPath)) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    });
    if (active) {
        [playerCharacter, enemyCharacter].forEach((character) => {
            const video = getPreviewVideo(character);
            if (video) video.play().catch(() => {});
        });
    }
}

function renderLobbyPreview() {
    const character = getSelectedCharacter();
    if (!character) return;
    document.documentElement.style.setProperty("--primary-glow", character.accent);
    lobbyBgVideo.src = getCachedAssetUrl(character.preview);
    lobbyBgVideo.muted = true;
    lobbyBgVideo.play().catch(() => {});
    lobbyCharacterName.textContent = character.name;
    lobbyCharacterRole.textContent = `${character.role} - HP ${character.hp}`;
}

// ─── Audio ────────────────────────────────────────────────────────────────────
function ensureAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    return audioContext;
}

function playUiSound(type = "tap") {
    if (sfxVolume <= 0) return;
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const now = ctx.currentTime;
    const profile = {
        tap:     { start: 420, end: 620, duration: 0.08, wave: "triangle" },
        confirm: { start: 360, end: 760, duration: 0.14, wave: "sine"     },
        back:    { start: 280, end: 180, duration: 0.12, wave: "sawtooth" }
    }[type] || { start: 420, end: 620, duration: 0.08, wave: "triangle" };

    osc.type = profile.wave;
    osc.frequency.setValueAtTime(profile.start, now);
    osc.frequency.exponentialRampToValueAtTime(profile.end, now + profile.duration);
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, sfxVolume * 0.05), now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + profile.duration + 0.02);
}

function updateAudioUI() {
    sfxVolumeValue.textContent = `${Math.round(sfxVolume * 100)}%`;
    bgmVolumeValue.textContent = `${Math.round(bgmVolume * 100)}%`;
    sfxVolumeSlider.value = String(Math.round(sfxVolume * 100));
    bgmVolumeSlider.value = String(Math.round(bgmVolume * 100));
    bgmAudio.volume = bgmVolume;
    ultimateVideo.volume = bgmVolume;
}

function updateThemeUI() {
    document.body.classList.toggle("theme-light", currentTheme === "light");
    lightModeBtn.classList.toggle("active", currentTheme === "light");
    darkModeBtn.classList.toggle("active",  currentTheme === "dark");
}

function startBgmIfAvailable() {
    bgmAudio.volume = bgmVolume;
    if (bgmAudio.src) bgmAudio.play().catch(() => {});
}

// ─── Selection UI ─────────────────────────────────────────────────────────────
function createSelectionCard(character, index) {
    const card = document.createElement("article");
    card.className = "selection-card";
    card.dataset.index = String(index);
    card.style.borderColor = `${character.accent}55`;

    const video = document.createElement("video");
    video.src = getCachedAssetUrl(character.preview);
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";

    const caption = document.createElement("div");
    caption.className = "selection-card-caption";
    caption.innerHTML = `
        <h2 class="selection-card-name">${character.name}</h2>
        <div class="selection-card-role">${character.role}</div>
        <div class="selection-card-hp">HP ${character.hp}</div>
    `;

    card.appendChild(video);
    card.appendChild(caption);
    selectionTrack.appendChild(card);
    return card;
}

function initSelection() {
    if (selectionInitialized) return;
    selectionTrack.innerHTML = "";
    selectionCards = characters.map((character, index) => createSelectionCard(character, index));
    selectionInitialized = true;
}

function cardPositionClass(index) {
    const total = characters.length;
    let diff = index - selectionCursor;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    if (diff === 0) return "center";
    if (diff === -1) return "left";
    if (diff === 1) return "right";
    return diff < 0 ? "hidden-left" : "hidden-right";
}

function updateSelectionUI() {
    const character = characters[selectionCursor];
    if (!character) return;
    selectionCards.forEach((card, index) => {
        card.className = `selection-card ${cardPositionClass(index)}`;
        const isCenter = index === selectionCursor;
        const video = card.querySelector("video");
        video.muted = true;
        if (isCenter) {
            card.style.borderColor = `${character.accent}aa`;
            video.play().catch(() => {});
        } else {
            card.style.borderColor = "rgba(255,255,255,0.18)";
        }
    });
    selectionSummary.textContent = `${character.name} - ${character.role.toUpperCase()} - HP ${character.hp}`;
    selectionSkillName.textContent = character.skill
        ? `${character.skill.name} - Damage ${character.skill.damage} - Use ${character.skill.use}`
        : "Tidak ada skill";
}

function moveSelection(step) {
    if (!characters.length || selectionReady === false) return;
    selectionReady = false;
    selectionCursor = (selectionCursor + step + characters.length) % characters.length;
    updateSelectionUI();
    window.setTimeout(() => { selectionReady = true; }, 360);
}

function confirmCharacterSelection() {
    selectedCharacterIndex = selectionCursor;
    renderLobbyPreview();
    showSection("lobby");
}

// ─── Section Navigation ───────────────────────────────────────────────────────
function showSection(sectionId) {
    document.getElementById("lobby").classList.remove("show");
    document.getElementById("selection").classList.remove("show");
    document.getElementById("settings").classList.remove("show");
    document.getElementById("in-game").classList.remove("show");
    hideBattleResult();
    hideSurrenderPrompt();

    document.getElementById(sectionId).classList.add("show");

    if (sectionId === "selection") {
        selectionCursor = selectedCharacterIndex;
        updateSelectionUI();
        selectionReady = true;
        selectionCards.forEach((card) => {
            const video = card.querySelector("video");
            video.play().catch(() => {});
        });
        syncInGamePreviewVideos(false);
    } else if (sectionId === "lobby") {
        // Detach any room listener if coming back
        if (roomRef) {
            off(roomRef);
            roomListener = null;
        }
        matchFound = false;
        currentRoomId = null;
        myRole = null;
        renderLobbyPreview();
        syncInGamePreviewVideos(false);
        startBgmIfAvailable();
    } else if (sectionId === "settings") {
        syncInGamePreviewVideos(false);
        startBgmIfAvailable();
    } else if (sectionId === "in-game") {
        initInGame();
        syncInGamePreviewVideos(true);
    }
}

// ─── In-Game Init ─────────────────────────────────────────────────────────────
function initInGame() {
    container  = document.getElementById("game-container");
    gameCanvas = document.getElementById("game");
    gameCtx    = gameCanvas.getContext("2d");
    footer     = document.querySelector(".overlay-footer");

    function resizeCanvas() {
        gameCanvas.width  = container.clientWidth;
        gameCanvas.height = container.clientHeight;
    }

    if (!window.__gameResizeBound) {
        window.addEventListener("resize", resizeCanvas);
        window.__gameResizeBound = true;
    }

    resizeCanvas();
    resetBattleState();
    syncInGamePreviewVideos(true);

    if (!inGameStarted) {
        inGameStarted = true;
        updateInGame();
    }
}

// ─── Player Action ────────────────────────────────────────────────────────────
function playerAction(action) {
    if (!battleState || battleState.winner || !isPlayerTurn || isSwitching) return;

    const playerCharacter = getSelectedCharacter();
    const enemyCharacter  = getEnemyCharacter();
    if (!playerCharacter || !enemyCharacter) return;

    // Online mode: relay action to Firebase
    if (matchFound && currentRoomId) {
        if (action === "ultimate") {
            if (battleState.player.ultimateUses <= 0) return;
            playUltimateVideo(playerCharacter, async () => {
                await sendOnlineAction("ultimate");
            });
        } else {
            sendOnlineAction(action);
        }
        return;
    }

    // Bot mode (original logic)
    isPlayerTurn = false;
    turnBanner.textContent = `${enemyCharacter.name} bersiap...`;
    footer.classList.add("hidden");
    updateUltimateButton();

    if (action === "shield") {
        addDefenseBonus("player", 100);
        turnBanner.textContent = `${playerCharacter.name} menambah guard 100 HP`;
        beginTurnSwitch(() => enemyResponse(), 2000);
    } else if (action === "ultimate") {
        if (battleState.player.ultimateUses <= 0) {
            footer.classList.remove("hidden");
            isPlayerTurn = true;
            updateUltimateButton();
            return;
        }
        battleState.player.ultimateUses -= 1;
        updateUltimateButton();
        playUltimateVideo(playerCharacter, () => {
            if (!battleState || battleState.winner) return;
            const damage = getActionDamage(playerCharacter, action);
            applyDamage("enemy", damage, action);
            if (battleState.winner) { finishBattle("player"); return; }
            beginTurnSwitch(() => enemyResponse(), 2000);
        });
    } else {
        const damage = getActionDamage(playerCharacter, action);
        applyDamage("enemy", damage, action);
        if (battleState.winner) { finishBattle("player"); return; }
        beginTurnSwitch(() => enemyResponse(), 2000);
    }
}

// ─── Bot Response ─────────────────────────────────────────────────────────────
function enemyResponse() {
    if (!battleState || battleState.winner) return;
    const playerCharacter = getSelectedCharacter();
    const enemyCharacter  = getEnemyCharacter();
    if (!playerCharacter || !enemyCharacter) return;

    const action = chooseEnemyAction(enemyCharacter);
    if (action === "shield") {
        addDefenseBonus("enemy", 100);
        turnBanner.textContent = `${enemyCharacter.name} menambah guard 100 HP`;
        beginTurnSwitch(() => {
            if (!battleState || battleState.winner) return;
            footer.classList.remove("hidden");
            isPlayerTurn = true;
            turnBanner.textContent = `Giliran ${playerCharacter.name}`;
            updateUltimateButton();
        }, 500);
    } else if (action === "ultimate") {
        battleState.enemy.ultimateUses = Math.max(0, battleState.enemy.ultimateUses - 1);
        turnBanner.textContent = `${enemyCharacter.name} melepaskan ultimate`;
        playUltimateVideo(enemyCharacter, () => {
            if (!battleState || battleState.winner) return;
            const damage = getActionDamage(enemyCharacter, action);
            applyDamage("player", damage, action);
            if (battleState.winner) { finishBattle("enemy"); return; }
            turnBanner.textContent = `${enemyCharacter.name} menyerang ${playerCharacter.name}`;
            beginTurnSwitch(() => {
                if (!battleState || battleState.winner) return;
                footer.classList.remove("hidden");
                isPlayerTurn = true;
                turnBanner.textContent = `Giliran ${playerCharacter.name}`;
                updateUltimateButton();
            }, 500);
        });
    } else {
        const damage = getActionDamage(enemyCharacter, action);
        applyDamage("player", damage, action);
        if (battleState.winner) { finishBattle("enemy"); return; }
        turnBanner.textContent = `${enemyCharacter.name} menyerang ${playerCharacter.name}`;
        beginTurnSwitch(() => {
            if (!battleState || battleState.winner) return;
            footer.classList.remove("hidden");
            isPlayerTurn = true;
            turnBanner.textContent = `Giliran ${playerCharacter.name}`;
            updateUltimateButton();
        }, 500);
    }
}

function beginTurnSwitch(callback, delay) {
    targetAngle += Math.PI;
    isSwitching = true;
    const activeToken = battleToken;
    setTimeout(() => {
        if (activeToken !== battleToken) return;
        callback();
    }, delay);
}

function getActionDamage(character, action) {
    if (action === "ultimate") return character.skill ? character.skill.damage : Math.round(character.attack * 1.6);
    return character.attack;
}

function chooseEnemyAction(enemyCharacter) {
    const roll = Math.random();
    if (enemyCharacter.skill && battleState && battleState.enemy.ultimateUses > 0 && roll > 0.8) return "ultimate";
    if (roll > 0.58) return "shield";
    return "attack";
}

function applyDamage(target, baseDamage, action = "attack") {
    if (!battleState) return 0;
    const defender = battleState[target];
    const finalDamage = Math.max(1, Math.round(baseDamage));
    let remainingDamage = finalDamage;
    const shieldCap = action === "ultimate" && defender.bonusHp > 0 ? 300 : defender.bonusHp;

    if (defender.bonusHp > 0) {
        const absorbed = Math.min(shieldCap, remainingDamage);
        defender.bonusHp = Math.max(0, defender.bonusHp - absorbed);
        remainingDamage -= absorbed;
    }
    if (remainingDamage > 0) {
        defender.hp = Math.max(0, defender.hp - remainingDamage);
    }

    defender.trailDelayUntil = performance.now() + 1000;
    defender.damageFx = { amount: finalDamage, startedAt: performance.now() };

    if (defender.hp <= 0) {
        battleState.winner = target === "enemy" ? "player" : "enemy";
    }
    return finalDamage;
}

function addDefenseBonus(target, amount) {
    if (!battleState) return;
    const combatant = battleState[target];
    combatant.bonusHp = Math.min(100, combatant.bonusHp + amount);
    combatant.displayHp = combatant.hp + combatant.bonusHp;
    combatant.trailHp   = combatant.hp + combatant.bonusHp;
    combatant.trailDelayUntil = 0;
}

function finishBattle(winner) {
    if (!battleState) return;
    isSwitching = false;
    battleState.winner = winner;
    footer.classList.add("hidden");
    isPlayerTurn = false;
    updateUltimateButton();

    // Cleanup room listener
    if (roomRef) {
        off(roomRef);
        roomListener = null;
    }

    const playerCharacter = getSelectedCharacter();
    const enemyCharacter  = getEnemyCharacter();
    if (winner === "player" && playerCharacter) {
        turnBanner.textContent = `${playerCharacter.name} menang`;
        showBattleResult("player", playerCharacter, enemyCharacter);
    } else if (winner === "enemy" && enemyCharacter) {
        turnBanner.textContent = `${enemyCharacter.name} menang`;
        showBattleResult("enemy", playerCharacter, enemyCharacter);
    }
}

// ─── Battle Result UI ─────────────────────────────────────────────────────────
function showBattleResult(winner, playerCharacter, enemyCharacter) {
    if (!playerCharacter || !enemyCharacter) return;
    if (winner === "player") {
        battleResultTitle.textContent = "Victory";
        battleResultTitle.className = "battle-result-title victory";
        battleResultSubtitle.textContent = `${playerCharacter.name} menaklukkan ${enemyCharacter.name} di arena.`;
    } else {
        battleResultTitle.textContent = "Defeat";
        battleResultTitle.className = "battle-result-title defeat";
        battleResultSubtitle.textContent = `${playerCharacter.name} tumbang oleh ${enemyCharacter.name}.`;
    }
    battleResultOverlay.classList.add("show");
    battleResultOverlay.setAttribute("aria-hidden", "false");
}

function hideBattleResult() {
    battleResultOverlay.classList.remove("show");
    battleResultOverlay.setAttribute("aria-hidden", "true");
}

function rematchBattle() {
    stopUltimateVideo();
    battleToken += 1;
    // Online rematch: just go back to lobby (start a new search)
    if (matchFound || currentRoomId) {
        cleanupRoom();
        matchFound = false;
        showSection("lobby");
        return;
    }
    initInGame();
    syncInGamePreviewVideos(true);
}

// ─── Ultimate Video ───────────────────────────────────────────────────────────
function playUltimateVideo(character, onComplete) {
    const animation = character && character.skill ? character.skill.animation : "";
    if (!animation) { if (onComplete) onComplete(); return; }
    ultimateCompletion = onComplete || null;
    ultimateVideo.src = getCachedAssetUrl(animation);
    ultimateVideo.muted = false;
    ultimateVideo.volume = bgmVolume;
    ultimateOverlay.classList.add("show");
    ultimateOverlay.setAttribute("aria-hidden", "false");
    ultimateVideo.play().catch(() => {});
}

function stopUltimateVideo(runCompletion = false) {
    ultimateVideo.pause();
    ultimateVideo.currentTime = 0;
    ultimateOverlay.classList.remove("show");
    ultimateOverlay.setAttribute("aria-hidden", "true");
    const completion = ultimateCompletion;
    ultimateCompletion = null;
    if (runCompletion && completion) completion();
}

ultimateVideo.addEventListener("ended", () => stopUltimateVideo(true));

// ─── Surrender ────────────────────────────────────────────────────────────────
function surrender() { showSurrenderPrompt(); }

function confirmSurrender() {
    stopUltimateVideo();
    battleToken += 1;
    hideSurrenderPrompt();
    hideBattleResult();
    if (matchFound && currentRoomId) {
        cleanupRoom();
        matchFound = false;
    }
    showSection("lobby");
}

function showSurrenderPrompt() {
    surrenderOverlay.classList.add("show");
    surrenderOverlay.setAttribute("aria-hidden", "false");
}

function hideSurrenderPrompt() {
    surrenderOverlay.classList.remove("show");
    surrenderOverlay.setAttribute("aria-hidden", "true");
}

// ─── Canvas Render ────────────────────────────────────────────────────────────
function drawArenaBackground() {
    if (arenaImage.complete && arenaImage.naturalWidth > 0) {
        const canvasRatio = gameCanvas.width / gameCanvas.height;
        const imageRatio  = arenaImage.naturalWidth / arenaImage.naturalHeight;
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        if (imageRatio > canvasRatio) {
            drawHeight = gameCanvas.height;
            drawWidth  = drawHeight * imageRatio;
            offsetX    = (gameCanvas.width - drawWidth) / 2;
        } else {
            drawWidth  = gameCanvas.width;
            drawHeight = drawWidth / imageRatio;
            offsetY    = (gameCanvas.height - drawHeight) / 2;
        }
        gameCtx.drawImage(arenaImage, offsetX, offsetY, drawWidth, drawHeight);
        const vignette = gameCtx.createLinearGradient(0, 0, 0, gameCanvas.height);
        vignette.addColorStop(0, "rgba(3, 5, 10, 0.18)");
        vignette.addColorStop(0.55, "rgba(2, 4, 10, 0.08)");
        vignette.addColorStop(1, "rgba(0, 0, 0, 0.32)");
        gameCtx.fillStyle = vignette;
        gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        return;
    }
    const skyGradient = gameCtx.createLinearGradient(0, 0, 0, gameCanvas.height);
    skyGradient.addColorStop(0, "#314766");
    skyGradient.addColorStop(0.42, "#172233");
    skyGradient.addColorStop(0.72, "#120f16");
    skyGradient.addColorStop(1, "#050507");
    gameCtx.fillStyle = skyGradient;
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    const spotlight = gameCtx.createRadialGradient(gameCanvas.width/2, gameCanvas.height*0.36, 20, gameCanvas.width/2, gameCanvas.height*0.36, gameCanvas.width*0.65);
    spotlight.addColorStop(0, "rgba(255, 214, 153, 0.22)");
    spotlight.addColorStop(0.4, "rgba(255, 153, 102, 0.1)");
    spotlight.addColorStop(1, "rgba(0, 0, 0, 0)");
    gameCtx.fillStyle = spotlight;
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    const floorY = gameCanvas.height * 0.7;
    const floorGradient = gameCtx.createLinearGradient(0, floorY, 0, gameCanvas.height);
    floorGradient.addColorStop(0, "#312022");
    floorGradient.addColorStop(1, "#09090b");
    gameCtx.fillStyle = floorGradient;
    gameCtx.fillRect(0, floorY, gameCanvas.width, gameCanvas.height - floorY);
    gameCtx.fillStyle = "rgba(255,255,255,0.05)";
    gameCtx.fillRect(0, floorY + 10, gameCanvas.width, 2);
    gameCtx.beginPath();
    gameCtx.ellipse(gameCanvas.width/2, floorY+32, gameCanvas.width*0.28, 28, 0, 0, Math.PI*2);
    const arenaGlow = gameCtx.createRadialGradient(gameCanvas.width/2, floorY+32, 10, gameCanvas.width/2, floorY+32, gameCanvas.width*0.32);
    arenaGlow.addColorStop(0, "rgba(255, 196, 120, 0.28)");
    arenaGlow.addColorStop(0.45, "rgba(255, 120, 82, 0.12)");
    arenaGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    gameCtx.fillStyle = arenaGlow;
    gameCtx.fill();
    gameCtx.strokeStyle = "rgba(255, 210, 160, 0.26)";
    gameCtx.lineWidth = 2;
    gameCtx.beginPath();
    gameCtx.ellipse(gameCanvas.width/2, floorY+32, gameCanvas.width*0.22, 18, 0, 0, Math.PI*2);
    gameCtx.stroke();
}

function stepDisplayedHp(combatant, now) {
    const effectiveHp = combatant.hp + combatant.bonusHp;
    combatant.displayHp += (effectiveHp - combatant.displayHp) * 0.18;
    if (Math.abs(effectiveHp - combatant.displayHp) < 0.5) combatant.displayHp = effectiveHp;
    if (now >= combatant.trailDelayUntil) {
        combatant.trailHp += (effectiveHp - combatant.trailHp) * 0.12;
        if (Math.abs(effectiveHp - combatant.trailHp) < 0.5) combatant.trailHp = effectiveHp;
    }
}

function drawDamageFx(x, y, scale, combatant) {
    if (!combatant.damageFx) return;
    const elapsed = performance.now() - combatant.damageFx.startedAt;
    if (elapsed > 900) { combatant.damageFx = null; return; }
    const progress = elapsed / 900;
    gameCtx.save();
    gameCtx.translate(x, y - 90 * scale - progress * 34);
    gameCtx.scale(scale, scale);
    gameCtx.globalAlpha = 1 - progress;
    gameCtx.fillStyle = "#ff3b30";
    gameCtx.strokeStyle = "rgba(0,0,0,0.45)";
    gameCtx.lineWidth = 4;
    gameCtx.font = "bold 22px Arial";
    gameCtx.textAlign = "center";
    gameCtx.strokeText(`-${combatant.damageFx.amount}`, 0, 0);
    gameCtx.fillText(`-${combatant.damageFx.amount}`, 0, 0);
    gameCtx.restore();
}

function drawUI(x, y, scale, name, combatant, accent, side) {
    gameCtx.save();
    gameCtx.translate(x, y);
    gameCtx.scale(scale, scale);
    gameCtx.fillStyle = "rgba(2, 6, 23, 0.86)";
    gameCtx.fillRect(-64, -122, 128, 54);
    gameCtx.fillStyle = "white";
    gameCtx.font = "bold 11px Arial";
    gameCtx.fillText(name, -50, -100);
    const maxEffectiveHp = Math.max(combatant.maxHp, combatant.hp + combatant.bonusHp, combatant.displayHp, combatant.trailHp);
    const displayRatio = Math.max(0, Math.min(1, combatant.displayHp / maxEffectiveHp));
    const trailRatio   = Math.max(0, Math.min(1, combatant.trailHp   / maxEffectiveHp));
    const baseRatio    = Math.max(0, Math.min(1, combatant.hp        / maxEffectiveHp));
    const bonusRatio   = Math.max(0, Math.min(1, (combatant.hp + combatant.bonusHp) / maxEffectiveHp));
    const hpColor = side === "player" ? "#22c55e" : "#ef4444";
    gameCtx.fillStyle = "#1e293b";
    gameCtx.fillRect(-50, -88, 100, 8);
    gameCtx.fillStyle = "#facc15";
    gameCtx.fillRect(-50, -88, 100 * trailRatio, 8);
    gameCtx.fillStyle = hpColor;
    gameCtx.fillRect(-50, -88, 100 * Math.min(displayRatio, baseRatio), 8);
    if (combatant.bonusHp > 0) {
        gameCtx.fillStyle = "rgba(255,255,255,0.95)";
        gameCtx.fillRect(-50 + 100 * baseRatio, -88, 100 * Math.max(0, bonusRatio - baseRatio), 8);
    }
    gameCtx.fillStyle = "rgba(255,255,255,0.76)";
    gameCtx.font = "10px Arial";
    gameCtx.fillText(`${Math.round(Math.max(0, combatant.hp))} / ${combatant.maxHp}`, -50, -68);
    if (combatant.bonusHp > 0) {
        gameCtx.fillStyle = "#ffffff";
        gameCtx.fillText(`+${Math.round(combatant.bonusHp)}`, 18, -68);
    }
    gameCtx.restore();
}

function drawRoundedRectPath(x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    gameCtx.beginPath();
    gameCtx.moveTo(x + safeRadius, y);
    gameCtx.arcTo(x + width, y, x + width, y + height, safeRadius);
    gameCtx.arcTo(x + width, y + height, x, y + height, safeRadius);
    gameCtx.arcTo(x, y + height, x, y, safeRadius);
    gameCtx.arcTo(x, y, x + width, y, safeRadius);
    gameCtx.closePath();
}

function drawCard(x, y, scale, character) {
    gameCtx.save();
    gameCtx.translate(x, y);
    gameCtx.scale(scale, scale);
    const width = 90, height = 130, left = -45, top = -65, radius = 14;
    const previewVideo = getPreviewVideo(character);
    const canDrawPreview = previewVideo && previewVideo.readyState >= 2 && previewVideo.videoWidth > 0;
    const grad = gameCtx.createLinearGradient(0, top, 0, top + height);
    grad.addColorStop(0, character.accent);
    grad.addColorStop(1, "#020617");
    drawRoundedRectPath(left, top, width, height, radius);
    gameCtx.fillStyle = grad;
    gameCtx.fill();
    if (canDrawPreview) {
        gameCtx.save();
        drawRoundedRectPath(left, top, width, height, radius);
        gameCtx.clip();
        gameCtx.drawImage(previewVideo, left, top, width, height);
        gameCtx.restore();
    }
    const overlay = gameCtx.createLinearGradient(0, top, 0, top + height);
    overlay.addColorStop(0, "rgba(2, 6, 23, 0.05)");
    overlay.addColorStop(0.55, "rgba(2, 6, 23, 0.2)");
    overlay.addColorStop(1, "rgba(2, 6, 23, 0.82)");
    drawRoundedRectPath(left, top, width, height, radius);
    gameCtx.fillStyle = overlay;
    gameCtx.fill();
    gameCtx.strokeStyle = "rgba(255,255,255,0.3)";
    gameCtx.lineWidth = 2;
    drawRoundedRectPath(left, top, width, height, radius);
    gameCtx.stroke();
    gameCtx.strokeStyle = `${character.accent}66`;
    gameCtx.lineWidth = 1;
    drawRoundedRectPath(left + 4, top + 4, width - 8, height - 8, radius - 3);
    gameCtx.stroke();
    gameCtx.restore();
}

function getScale(y) {
    const t = (y - (gameCanvas.height / 2 - 60)) / (2 * 60);
    return (0.7 + t * 0.6) * 1.5;
}

function updateInGame() {
    if (!gameCtx) return;
    if (gameCanvas.width !== container.clientWidth || gameCanvas.height !== container.clientHeight) {
        gameCanvas.width  = container.clientWidth;
        gameCanvas.height = container.clientHeight;
    }
    requestAnimationFrame(updateInGame);
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    drawArenaBackground();

    const now = performance.now();
    if (battleState) {
        stepDisplayedHp(battleState.player, now);
        stepDisplayedHp(battleState.enemy,  now);
    }

    if (isSwitching) {
        angle += (targetAngle - angle) * 0.08;
        if (Math.abs(targetAngle - angle) < 0.01) { angle = targetAngle; isSwitching = false; }
    }

    const playerCharacter = getSelectedCharacter();
    const enemyCharacter  = getEnemyCharacter() || playerCharacter;
    if (!playerCharacter || !enemyCharacter || !battleState) return;

    const centerX = gameCanvas.width / 2;
    const centerY = gameCanvas.height / 2 - 10;
    const radiusX = 120, radiusY = 60, offsetX = 70;

    const playerPos = {
        x: centerX + Math.cos(angle) * radiusX - offsetX,
        y: centerY + Math.sin(angle) * radiusY,
        character: playerCharacter,
        name: playerCharacter.name.toUpperCase(),
        combatant: battleState.player,
        side: "player"
    };
    const enemyPos = {
        x: centerX + Math.cos(angle + Math.PI) * radiusX + offsetX,
        y: centerY + Math.sin(angle + Math.PI) * radiusY,
        character: enemyCharacter,
        name: enemyCharacter.name.toUpperCase(),
        combatant: battleState.enemy,
        side: "enemy"
    };

    const objects = [playerPos, enemyPos].sort((a, b) => a.y - b.y);
    objects.forEach((obj) => {
        const scale = getScale(obj.y);
        drawUI(obj.x, obj.y, scale, obj.name, obj.combatant, obj.character.accent, obj.side);
        drawCard(obj.x, obj.y, scale, obj.character);
        drawDamageFx(obj.x, obj.y, scale, obj.combatant);
    });
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function applySettings() { updateAudioUI(); updateThemeUI(); }
function bindButtonSound(button, type = "tap") {
    if (!button) return;
    button.addEventListener("click", () => playUiSound(type));
}

function syncViewportHeight() {
    document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
}

// ─── Button Wiring ────────────────────────────────────────────────────────────
startGameBtn.addEventListener("click", () => {
    // Start matchmaking (online) or bot
    startMatchmaking();
});

openSelectionBtn.addEventListener("click",   () => showSection("selection"));
openSettingsBtn.addEventListener("click",    () => showSection("settings"));
closeSelectionBtn.addEventListener("click",  () => showSection("lobby"));
closeSettingsBtn.addEventListener("click",   () => showSection("lobby"));
confirmSelectionBtn.addEventListener("click", confirmCharacterSelection);
nextBtn.addEventListener("click",            () => moveSelection(1));
prevBtn.addEventListener("click",            () => moveSelection(-1));
rematchBtn.addEventListener("click",         rematchBattle);
backToLobbyBtn.addEventListener("click", () => {
    stopUltimateVideo();
    battleToken += 1;
    cleanupRoom();
    matchFound = false;
    showSection("lobby");
});
confirmSurrenderBtn.addEventListener("click", confirmSurrender);
cancelSurrenderBtn.addEventListener("click",  hideSurrenderPrompt);
saveSettingsBtn.addEventListener("click",     () => showSection("lobby"));

sfxVolumeSlider.addEventListener("input", (e) => { sfxVolume = Number(e.target.value) / 100; updateAudioUI(); });
bgmVolumeSlider.addEventListener("input", (e) => { bgmVolume = Number(e.target.value) / 100; updateAudioUI(); });

customBgmInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (customBgmUrl) URL.revokeObjectURL(customBgmUrl);
    customBgmUrl = URL.createObjectURL(file);
    bgmAudio.src = customBgmUrl;
    startBgmIfAvailable();
    playUiSound("confirm");
});

lightModeBtn.addEventListener("click", () => { currentTheme = "light"; updateThemeUI(); playUiSound("tap"); });
darkModeBtn.addEventListener("click",  () => { currentTheme = "dark";  updateThemeUI(); playUiSound("tap"); });

[
    startGameBtn, openSelectionBtn, openSettingsBtn, closeSelectionBtn,
    closeSettingsBtn, confirmSelectionBtn, nextBtn, prevBtn, rematchBtn,
    saveSettingsBtn, confirmSurrenderBtn, cancelSurrenderBtn,
    lightModeBtn, darkModeBtn, backToLobbyBtn
].forEach((button) => bindButtonSound(button,
    button === confirmSurrenderBtn || button === rematchBtn || button === saveSettingsBtn ? "confirm" : "tap"
));

document.querySelectorAll(".action-btn, .surrender-btn").forEach((button) => bindButtonSound(button, "tap"));
document.addEventListener("pointerdown", () => ensureAudioContext(), { once: true });
window.addEventListener("resize", syncViewportHeight);
window.addEventListener("orientationchange", syncViewportHeight);

syncViewportHeight();
applySettings();
loadCharacters();