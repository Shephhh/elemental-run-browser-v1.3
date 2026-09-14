(function () {
  'use strict';

  // Phase 1 audio boundary. This module owns the Web Audio graph and both
  // HTMLAudioElement music tracks. Gameplay provides a read-only state
  // snapshot; the audio layer never imports game/platform globals directly.
  const MENU_MUSIC_SRC = 'elemental run icons/menu-theme.mp3';
  const MENU_MUSIC_VOLUME = 0.18;
  const GAMEPLAY_MUSIC_SRC = 'elemental run icons/gameplay-music.mp3';
  const GAMEPLAY_MUSIC_VOLUME = 0.42;

  let getRuntimeState = () => ({});
  let onMenuUnlockChange = () => {};
  let configured = false;
  let audioContext = null;
  let masterGain = null;
  let sfxGain = null;
  let musicGain = null;
  let ambienceGain = null;
  let uiGain = null;
  let menuAmbientGain = null;
  let audioBedNodes = null;
  let menuMusicElement = null;
  let gameplayMusicElement = null;
  let menuMusicFadeRaf = 0;
  let gameplayMusicFadeRaf = 0;
  let menuMusicUnlocked = false;
  let gameplayMusicUnlocked = false;
  let gameplayMusicPlayPending = false;
  let gameplayMusicPlayAttempt = 0;
  let menuMusicAutoplayBlocked = false;
  let menuMusicStartAttempt = 0;
  let menuMusicManualUnlockPending = false;
  let gameplayMusicTargetVolume = -1;
  const noiseCache = Object.create(null);

  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Math.max(min, Math.min(max, Number.isFinite(number) ? number : fallback));
  };
  const state = () => {
    try { return getRuntimeState() || {}; } catch (error) { return {}; }
  };
  const settings = () => state().settings || {};
  const notifyMenuUnlock = () => {
    try { onMenuUnlockChange(snapshot()); } catch (error) {}
  };

  function configure(options = {}) {
    if (typeof options.getState === 'function') getRuntimeState = options.getState;
    if (typeof options.onMenuUnlockChange === 'function') onMenuUnlockChange = options.onMenuUnlockChange;
    configured = true;
    return api;
  }

  function getNoiseBuffer(seconds) {
    if (!audioContext) return null;
    const length = Math.max(1, Math.floor(audioContext.sampleRate * seconds));
    const key = `${audioContext.sampleRate}:${length}`;
    if (!noiseCache[key]) {
      const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < length; index++) data[index] = Math.random() * 2 - 1;
      noiseCache[key] = buffer;
    }
    return noiseCache[key];
  }

  function startAudioBed() {
    if (!audioContext || audioBedNodes) return;
    const droneOsc = audioContext.createOscillator();
    const shimmerOsc = audioContext.createOscillator();
    const pulseOsc = audioContext.createOscillator();
    const droneFilter = audioContext.createBiquadFilter();
    const droneGain = audioContext.createGain();
    const shimmerGain = audioContext.createGain();
    const pulseGain = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    const pulseLfo = audioContext.createOscillator();
    const pulseDepth = audioContext.createGain();
    const noiseSource = audioContext.createBufferSource();
    const noiseFilter = audioContext.createBiquadFilter();
    const noiseGain = audioContext.createGain();

    droneOsc.type = 'triangle';
    droneOsc.frequency.value = 62;
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.value = 248;
    pulseOsc.type = 'sawtooth';
    pulseOsc.frequency.value = 124;
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 420;
    droneGain.gain.value = 0.03;
    shimmerGain.gain.value = 0.012;
    pulseGain.gain.value = 0.008;
    lfo.frequency.value = 0.16;
    lfoGain.gain.value = 0.008;
    pulseLfo.frequency.value = 1.8;
    pulseDepth.gain.value = 0.006;
    noiseSource.buffer = getNoiseBuffer(2.5);
    noiseSource.loop = true;
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1240;
    noiseFilter.Q.value = 0.6;
    noiseGain.gain.value = 0.015;

    lfo.connect(lfoGain);
    lfoGain.connect(shimmerGain.gain);
    pulseLfo.connect(pulseDepth);
    pulseDepth.connect(pulseGain.gain);
    droneOsc.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(musicGain);
    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(musicGain);
    pulseOsc.connect(pulseGain);
    pulseGain.connect(musicGain);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ambienceGain);

    const now = audioContext.currentTime + 0.02;
    [droneOsc, shimmerOsc, pulseOsc, lfo, pulseLfo, noiseSource].forEach((node) => node.start(now));
    audioBedNodes = { droneOsc, shimmerOsc, pulseOsc, noiseSource, lfo, pulseLfo };
  }

  function init() {
    if (audioContext) return getNodes();
    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return getNodes();
      audioContext = new AudioContextCtor();
      masterGain = audioContext.createGain();
      sfxGain = audioContext.createGain();
      musicGain = audioContext.createGain();
      ambienceGain = audioContext.createGain();
      uiGain = audioContext.createGain();
      menuAmbientGain = audioContext.createGain();
      masterGain.gain.value = 0.28;
      sfxGain.gain.value = 1.18;
      musicGain.gain.value = 0;
      ambienceGain.gain.value = 0;
      uiGain.gain.value = 1.55;
      menuAmbientGain.gain.value = 0;
      masterGain.connect(audioContext.destination);
      sfxGain.connect(masterGain);
      musicGain.connect(masterGain);
      ambienceGain.connect(masterGain);
      uiGain.connect(masterGain);
      menuAmbientGain.connect(masterGain);
      applySettings();
      startAudioBed();
    } catch (error) {
      console.error('Ses baslatilamadi:', error);
    }
    return getNodes();
  }

  function getNodes() {
    return Object.freeze({ audioContext, masterGain, sfxGain, musicGain, ambienceGain, uiGain, menuAmbientGain });
  }

  function isPoki() {
    return state().platformKind === 'poki';
  }

  function startMenuAmbient() {
    if (menuMusicElement) return;
    menuMusicElement = new Audio(MENU_MUSIC_SRC);
    menuMusicElement.loop = true;
    menuMusicElement.preload = isPoki() ? 'metadata' : 'auto';
    menuMusicElement.autoplay = true;
    menuMusicElement.volume = 0;
  }

  function ensureGameplayMusic() {
    if (!gameplayMusicElement) {
      gameplayMusicElement = new Audio(GAMEPLAY_MUSIC_SRC);
      gameplayMusicElement.loop = true;
      gameplayMusicElement.preload = isPoki() ? 'metadata' : 'auto';
      gameplayMusicElement.volume = 0;
      gameplayMusicElement.addEventListener('canplay', () => {
        const current = state();
        if (current.runStartedFromMenu && !settings().muted && !current.mainMenuVisible && !current.isGameOver && !current.reviveMusicHold) {
          requestGameplayMusicPlay();
        }
      });
    }
    return gameplayMusicElement;
  }

  function primeGameplayMusicBuffer() {
    const music = ensureGameplayMusic();
    try { music.load(); } catch (error) {}
  }

  function requestGameplayMusicPlay() {
    const music = ensureGameplayMusic();
    if (gameplayMusicPlayPending || !music.paused) return;
    gameplayMusicPlayPending = true;
    const playAttempt = ++gameplayMusicPlayAttempt;
    let promise;
    try { promise = music.play(); } catch (error) {
      gameplayMusicPlayPending = false;
      gameplayMusicUnlocked = false;
      return;
    }
    if (promise && typeof promise.then === 'function') {
      promise.then(() => {
        if (playAttempt !== gameplayMusicPlayAttempt) return;
        const current = state();
        const stillWanted = current.runStartedFromMenu && !settings().muted && !current.mainMenuVisible && !current.isGameOver && !current.reviveMusicHold;
        gameplayMusicUnlocked = stillWanted;
        if (!stillWanted) music.pause();
      }).catch(() => { gameplayMusicUnlocked = false; }).finally(() => {
        if (playAttempt === gameplayMusicPlayAttempt) gameplayMusicPlayPending = false;
      });
    } else {
      gameplayMusicUnlocked = true;
      gameplayMusicPlayPending = false;
    }
  }

  function getMenuMusicTargetVolume(volume = MENU_MUSIC_VOLUME) {
    return Math.max(0, Math.min(1, volume * clamp(settings().musicVolume, 0, 1, 0.55)));
  }

  function getGameplayMusicTargetVolume(volume = GAMEPLAY_MUSIC_VOLUME) {
    return Math.max(0, Math.min(1, volume * clamp(settings().masterVolume, 0, 1.35, 1) * clamp(settings().musicVolume, 0, 1, 0.55)));
  }

  function fadeElement(which, targetVolume, durationMs, pauseWhenSilent) {
    const element = which === 'menu' ? menuMusicElement : gameplayMusicElement;
    if (!element) return;
    let raf = which === 'menu' ? menuMusicFadeRaf : gameplayMusicFadeRaf;
    if (raf) cancelAnimationFrame(raf);
    const effectiveTarget = targetVolume <= 0.001 ? 0 : (which === 'menu' ? getMenuMusicTargetVolume(targetVolume) : getGameplayMusicTargetVolume(targetVolume));
    const from = Number.isFinite(element.volume) ? element.volume : 0;
    if (which === 'gameplay') gameplayMusicTargetVolume = effectiveTarget;
    const started = performance.now();
    const duration = Math.max(1, durationMs);
    const tick = (now) => {
      const t = Math.max(0, Math.min(1, (now - started) / duration));
      const eased = t * t * (3 - 2 * t);
      element.volume = Math.max(0, Math.min(1, from + (effectiveTarget - from) * eased));
      if (t < 1) {
        const next = requestAnimationFrame(tick);
        if (which === 'menu') menuMusicFadeRaf = next;
        else gameplayMusicFadeRaf = next;
      } else {
        if (which === 'menu') menuMusicFadeRaf = 0;
        else gameplayMusicFadeRaf = 0;
        element.volume = effectiveTarget;
        if (pauseWhenSilent && effectiveTarget <= 0.001) element.pause();
      }
    };
    const next = requestAnimationFrame(tick);
    if (which === 'menu') menuMusicFadeRaf = next;
    else gameplayMusicFadeRaf = next;
  }

  function fadeGameplayMusicVolume(target, duration = 520, pauseWhenSilent = false) {
    if (!gameplayMusicElement) return;
    const effective = target <= 0.001 ? 0 : getGameplayMusicTargetVolume(target);
    const current = Number.isFinite(gameplayMusicElement.volume) ? gameplayMusicElement.volume : 0;
    if (Math.abs((gameplayMusicTargetVolume || 0) - effective) < 0.006 && Math.abs(current - effective) < 0.006 && (!pauseWhenSilent || gameplayMusicElement.paused || effective > 0.001)) return;
    fadeElement('gameplay', target, duration, pauseWhenSilent);
  }

  function fadeMenuMusicVolume(target, duration = 420, pauseWhenSilent = false) {
    fadeElement('menu', target, duration, pauseWhenSilent);
  }

  function updateGameplayMusic(forcePlay = false) {
    const current = state();
    const shouldPlay = !settings().muted && !current.mainMenuVisible && !current.isGameOver && !current.reviveMusicHold;
    if (!shouldPlay && !gameplayMusicElement && !forcePlay) return;
    const music = ensureGameplayMusic();
    if (shouldPlay && (forcePlay || music.paused)) requestGameplayMusicPlay();
    const target = shouldPlay ? GAMEPLAY_MUSIC_VOLUME * (current.isGamePaused ? 0.28 : 1) : 0;
    if (shouldPlay) {
      if (gameplayMusicFadeRaf) cancelAnimationFrame(gameplayMusicFadeRaf);
      gameplayMusicFadeRaf = 0;
      gameplayMusicTargetVolume = getGameplayMusicTargetVolume(target);
      music.volume = gameplayMusicTargetVolume;
    } else {
      fadeGameplayMusicVolume(0, 180, true);
    }
  }

  function invalidateGameplayMusicPlay() {
    gameplayMusicPlayAttempt++;
    gameplayMusicPlayPending = false;
  }

  function stopGameplayMusicNow() {
    invalidateGameplayMusicPlay();
    gameplayMusicUnlocked = false;
    if (!gameplayMusicElement) return;
    if (gameplayMusicFadeRaf) cancelAnimationFrame(gameplayMusicFadeRaf);
    gameplayMusicFadeRaf = 0;
    gameplayMusicTargetVolume = 0;
    gameplayMusicElement.volume = 0;
    try { gameplayMusicElement.pause(); } catch (error) {}
  }

  function stopMenuMusicNow() {
    if (!menuMusicElement) return;
    if (menuMusicFadeRaf) cancelAnimationFrame(menuMusicFadeRaf);
    menuMusicFadeRaf = 0;
    menuMusicElement.volume = 0;
    try { menuMusicElement.pause(); } catch (error) {}
  }

  function setMenuAmbientActive(active) {
    startMenuAmbient();
    const current = state();
    const shouldPlay = active && current.mainMenuVisible && !settings().muted && menuMusicUnlocked;
    if (audioContext && audioContext.state === 'running' && menuAmbientGain) {
      menuAmbientGain.gain.setTargetAtTime(shouldPlay ? 0.16 * clamp(settings().musicVolume, 0, 1, 0.55) : 0, audioContext.currentTime, active ? 0.42 : 0.18);
    }
    if (shouldPlay) {
      const promise = menuMusicElement.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {
        menuMusicUnlocked = false;
        menuMusicAutoplayBlocked = true;
        notifyMenuUnlock();
      });
      fadeMenuMusicVolume(MENU_MUSIC_VOLUME, 520, false);
    } else {
      fadeMenuMusicVolume(0, 360, true);
    }
  }

  function tryStartMenuMusicAutoplay() {
    const current = state();
    if (!current.mainMenuVisible || settings().muted) {
      setMenuAmbientActive(false);
      return;
    }
    startMenuAmbient();
    const attempt = ++menuMusicStartAttempt;
    const started = () => {
      if (attempt !== menuMusicStartAttempt) return;
      menuMusicUnlocked = true;
      menuMusicAutoplayBlocked = false;
      menuMusicElement.muted = false;
      if (state().mainMenuVisible && !settings().muted) fadeMenuMusicVolume(MENU_MUSIC_VOLUME, 720, false);
      notifyMenuUnlock();
    };
    const blocked = () => {
      if (attempt !== menuMusicStartAttempt) return;
      menuMusicUnlocked = false;
      menuMusicAutoplayBlocked = true;
      menuMusicElement.volume = 0;
      try { menuMusicElement.pause(); } catch (error) {}
      notifyMenuUnlock();
    };
    const tryMutedBootstrap = () => {
      if (attempt !== menuMusicStartAttempt) return;
      menuMusicElement.muted = true;
      menuMusicElement.volume = 0;
      let mutedPromise;
      try { mutedPromise = menuMusicElement.play(); } catch (error) { blocked(); return; }
      if (mutedPromise && typeof mutedPromise.then === 'function') mutedPromise.then(() => setTimeout(started, 80)).catch(blocked);
      else setTimeout(started, 80);
    };
    menuMusicElement.muted = false;
    menuMusicElement.volume = 0;
    let promise;
    try { promise = menuMusicElement.play(); } catch (error) { blocked(); return; }
    if (promise && typeof promise.then === 'function') {
      let settled = false;
      const timeout = setTimeout(() => {
        if (settled || attempt !== menuMusicStartAttempt) return;
        settled = true;
        try { menuMusicElement.pause(); } catch (error) {}
        tryMutedBootstrap();
      }, 450);
      promise.then(() => {
        if (settled || attempt !== menuMusicStartAttempt) {
          if (!menuMusicUnlocked) stopMenuMusicNow();
          return;
        }
        settled = true;
        clearTimeout(timeout);
        started();
      }).catch(() => {
        if (settled || attempt !== menuMusicStartAttempt) return;
        settled = true;
        clearTimeout(timeout);
        tryMutedBootstrap();
      });
    } else started();
  }

  function unlockMenuMusicFromUserGesture() {
    const current = state();
    if (settings().muted || !current.mainMenuVisible) return;
    init();
    startMenuAmbient();
    if (menuMusicUnlocked && !menuMusicElement.paused) {
      if (menuMusicElement.volume < getMenuMusicTargetVolume() * 0.75) fadeMenuMusicVolume(MENU_MUSIC_VOLUME, 240, false);
      return;
    }
    if (menuMusicManualUnlockPending) return;
    menuMusicManualUnlockPending = true;
    menuMusicStartAttempt++;
    menuMusicElement.muted = false;
    menuMusicElement.volume = 0;
    const finish = (ok) => {
      menuMusicManualUnlockPending = false;
      menuMusicUnlocked = ok;
      menuMusicAutoplayBlocked = !ok;
      if (ok && state().mainMenuVisible && !settings().muted) fadeMenuMusicVolume(MENU_MUSIC_VOLUME, 520, false);
      else stopMenuMusicNow();
      notifyMenuUnlock();
    };
    const play = () => {
      let promise;
      try { promise = menuMusicElement.play(); } catch (error) { finish(false); return; }
      if (promise && typeof promise.then === 'function') promise.then(() => finish(true)).catch(() => finish(false));
      else finish(true);
    };
    if (audioContext && audioContext.state === 'suspended') audioContext.resume().then(play).catch(play);
    else play();
  }

  function unlockGameplayAudioFromUserGesture() {
    init();
    if (!audioContext) return;
    const play = () => updateGameplayMusic(true);
    if (audioContext.state === 'suspended') audioContext.resume().then(play).catch(play);
    else play();
  }

  function ensureMenuAudio() {
    init();
    startMenuAmbient();
    if (!audioContext) return;
    const activate = () => setMenuAmbientActive(state().mainMenuVisible);
    if (audioContext.state === 'suspended') audioContext.resume().then(activate).catch(() => {});
    else if (audioContext.state === 'running') activate();
  }

  function applySettings() {
    if (!audioContext) return;
    const current = state();
    const values = settings();
    const now = audioContext.currentTime;
    const master = values.muted ? 0 : (current.isGamePaused ? 0.22 : 0.3) * clamp(values.masterVolume, 0, 1.35, 1);
    masterGain.gain.setTargetAtTime(master, now, 0.12);
    sfxGain.gain.setTargetAtTime(1.18 * clamp(values.sfxVolume, 0, 1.4, 1.15), now, 0.12);
    uiGain.gain.setTargetAtTime(1.55 * clamp(values.uiVolume, 0, 1.6, 1.25), now, 0.12);
    syncHtmlAudioWithSettings();
  }

  function syncHtmlAudioWithSettings(forceGameplayPlay = false) {
    const current = state();
    if (settings().muted) {
      stopMenuMusicNow();
      stopGameplayMusicNow();
    } else if (current.mainMenuVisible) {
      setMenuAmbientActive(true);
    } else {
      updateGameplayMusic(forceGameplayPlay);
    }
  }

  function updateMix() {
    if (!audioContext || audioContext.state !== 'running') return;
    if (!audioBedNodes) startAudioBed();
    const current = state();
    const values = settings();
    const now = audioContext.currentTime;
    const pause = (current.isGamePaused || current.isGameOver) ? 0.42 : 1;
    const musicDuck = current.reviveMusicHold ? 0 : 1;
    const ambienceDuck = current.reviveMusicHold ? 0.12 : 1;
    const speedRatio = Math.max(0, Math.min(1, (current.moveSpeed - current.minMoveSpeed) / Math.max(0.001, current.maxMoveSpeed - current.minMoveSpeed)));
    const phaseBoost = current.gamePhase === 5 ? 1.08 : (current.gamePhase === 4 ? 1.12 : (current.gamePhase === 3 ? 1.24 : ((current.onSkyLayer || current.isSkyFading) ? 1.16 : 0.92)));
    masterGain.gain.setTargetAtTime(values.muted ? 0 : (current.isGamePaused ? 0.22 : 0.3) * clamp(values.masterVolume, 0, 1.35, 1), now, 0.18);
    musicGain.gain.setTargetAtTime((0.012 + speedRatio * 0.012) * pause * musicDuck * phaseBoost * clamp(values.musicVolume, 0, 1, 0.55), now, 0.18);
    ambienceGain.gain.setTargetAtTime((0.03 + speedRatio * 0.018 + ((current.onSkyLayer || current.isSkyFading) ? 0.015 : 0) + (current.gamePhase === 3 ? 0.02 : 0) + (current.gamePhase === 4 ? 0.012 : 0) + (current.gamePhase === 5 ? 0.018 : 0)) * pause * ambienceDuck, now, 0.2);
    menuAmbientGain.gain.setTargetAtTime(current.mainMenuVisible && !values.muted && menuMusicUnlocked ? 0.16 * clamp(values.musicVolume, 0, 1, 0.55) : 0, now, 0.36);
    updateGameplayMusic();
  }

  function resumeContext() {
    init();
    if (audioContext && audioContext.state === 'suspended') return audioContext.resume().catch(() => {});
    return Promise.resolve();
  }

  function snapshot() {
    return {
      configured,
      contextCreated: !!audioContext,
      contextState: audioContext ? audioContext.state : 'uninitialized',
      menuMusic: {
        created: !!menuMusicElement,
        paused: menuMusicElement ? menuMusicElement.paused : true,
        unlocked: menuMusicUnlocked,
        autoplayBlocked: menuMusicAutoplayBlocked,
        currentTime: menuMusicElement ? menuMusicElement.currentTime : 0
      },
      gameplayMusic: {
        created: !!gameplayMusicElement,
        paused: gameplayMusicElement ? gameplayMusicElement.paused : true,
        readyState: gameplayMusicElement ? gameplayMusicElement.readyState : 0,
        networkState: gameplayMusicElement ? gameplayMusicElement.networkState : 0,
        playPending: gameplayMusicPlayPending,
        unlocked: gameplayMusicUnlocked,
        currentTime: gameplayMusicElement ? gameplayMusicElement.currentTime : 0,
        targetVolume: gameplayMusicTargetVolume
      }
    };
  }

  const api = Object.freeze({
    configure, init, getNodes, getNoiseBuffer, resumeContext,
    applySettings, syncHtmlAudioWithSettings, updateMix,
    startMenuAmbient, ensureGameplayMusic, primeGameplayMusicBuffer,
    requestGameplayMusicPlay, updateGameplayMusic, invalidateGameplayMusicPlay,
    fadeGameplayMusicVolume, fadeMenuMusicVolume,
    stopGameplayMusicNow, stopMenuMusicNow, setMenuAmbientActive,
    tryStartMenuMusicAutoplay, unlockMenuMusicFromUserGesture,
    unlockGameplayAudioFromUserGesture, ensureMenuAudio,
    isMenuMusicUnlocked: () => menuMusicUnlocked,
    snapshot,
    constants: Object.freeze({ MENU_MUSIC_VOLUME, GAMEPLAY_MUSIC_VOLUME })
  });

  Object.defineProperty(window, 'ElementalAudio', {
    value: api,
    writable: false,
    configurable: false,
    enumerable: false
  });
})();
