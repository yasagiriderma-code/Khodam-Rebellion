# Scalable Structure

- `src/js/variable.js`: state global, constants, utility, data loader, dan helper aset.
- `src/js/audio.js`: musik, SFX, audio unlock, dan idle hints.
- `src/js/ui.js`: screen flow, selection UI, orbit arena, toast/modal, intro.
- `src/js/gameplay.js`: mekanik battle, bot flow, action execution, battle finish.
- `src/js/multiplayer.js`: matchmaking + sinkronisasi battle online via Firebase (lazy-load, tidak blokir startup).
- `src/js/main.js`: wiring event dan bootstrap init game.
- `script.js`: entrypoint tipis (import `src/js/main.js`).
- `data/*.json`: semua data game (`khodam`, `effect`, `sfx`) dipusatkan untuk memudahkan scaling.

## Catatan Aset
Saat ini aset visual/audio masih kompatibel di `asset/` dan `sfx/`.
Untuk versi mendatang disarankan pindah bertahap ke:
- `assets/characters/...`
- `assets/audio/sfx/...`
- `assets/audio/music/...`
agar tidak menambah path hardcoded yang monolitik.
