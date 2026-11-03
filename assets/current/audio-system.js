(function () {
  'use strict';

  // Audio boundary. This module owns the Web Audio graph and streamed
  // HTMLAudioElement music tracks. Gameplay provides a read-only state
  // snapshot; the audio layer never imports game/platform globals directly.
  const MENU_MUSIC_SRC = 'elemental run icons/gameplay-music.mp3';
  const MENU_MUSIC_VOLUME = 0.18;
  const LOBBY_MUSIC_VOLUME = 0.12;
  const GAMEPLAY_MUSIC_SRC = 'elemental run icons/gameplay-music.mp3';
  const GAMEPLAY_MUSIC_VOLUME = 0.42;
  const RUNNER_2D_MUSIC_SRC = 'assets/audio/runner2d-theme.mp3';
  const RUNNER_2D_MUSIC_VOLUME = 0.4;
  // All 3D modes share the normal run track; 2D deliberately keeps its own song.
  const SURF_MUSIC_SRC = GAMEPLAY_MUSIC_SRC, SURF_MUSIC_VOLUME = GAMEPLAY_MUSIC_VOLUME;
  let surfState='inactive',surfMusic=null,surfPlayPending=false,surfPlayAttempt=0,surfNextPlay=0,surfMixAt=0;
  let lastSoftPad=-Infinity;const softPadVoices=new Set();

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
  let lastMixAutomationTime = -Infinity;
  const noiseCache = Object.create(null);
  let runner2DState = 'inactive', runner2DMusic = null, runner2DPlayPending = false;
  const partyHeartVoices = new Set();
  let lastPartyHeartBeat = -Infinity, partyHeartBeatCount = 0;
  function stopPartyHeartbeat() {
    for (const voice of partyHeartVoices) {
      if(voice.stopping)continue;voice.stopping=true;
      try { voice.gain.gain.cancelScheduledValues(audioContext.currentTime);voice.gain.gain.setTargetAtTime(0,audioContext.currentTime,.008);voice.osc.stop(audioContext.currentTime+.035); } catch (_) {}
    }
  }
  // Original two-part low thud, same SFX/master bus and mute policy as gameplay.
  // No sample decode, interval, second AudioContext or unbounded voice queue.
  function playPartyHeartbeat(strength = 0) {
    const current=state(),values=settings(),p=Number.isFinite(strength)?Math.max(0,Math.min(1,strength)):0;
    if (!audioContext || audioContext.state!=='running' || p<.08 || values.muted || current.audioBlocked || current.isGamePaused || current.isGameOver || Number(values.sfxVolume)===0 || Number(values.masterVolume)===0) { stopPartyHeartbeat();return false; }
    const now=audioContext.currentTime;if(now-lastPartyHeartBeat<.26||partyHeartVoices.size>4)return false;
    lastPartyHeartBeat=now;partyHeartBeatCount++;
    for(let i=0;i<2;i++){
      const at=now+i*.135,osc=audioContext.createOscillator(),gain=audioContext.createGain(),voice={osc,gain};
      osc.type='sine';osc.frequency.setValueAtTime(i?88:112,at);osc.frequency.exponentialRampToValueAtTime(i?39:48,at+.13);
      gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime((.18+p*.34)*(i?.66:1),at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+.145);
      osc.connect(gain).connect(sfxGain);partyHeartVoices.add(voice);osc.onended=()=>{osc.disconnect();gain.disconnect();partyHeartVoices.delete(voice);};osc.start(at);osc.stop(at+.16);
    }
    return true;
  }
  let runner2DPlayAttempt = 0, runner2DNextPlayTime = 0, runner2DMixTime = 0, runner2DTargetVolume = 0;
  const runner2DVoices = new Set(), runner2DSoundTimes = Object.create(null);
  // [oscillator type, start/end Hz, duration, gain, noise mix]. Short,
  // bounded voices share the normal SFX bus; no samples decode during play.
  const runner2DSounds = Object.freeze({
    start: ['triangle', 440, 880, .22, .45, 0],
    jump: ['triangle', 270, 640, .16, .48, 0],
    slide: ['triangle', 130, 65, .2, .3, .55],
    land: ['sine', 110, 42, .1, .35, .2],
    coin: ['sine', 1050, 1580, .12, .4, 0],
    pad: ['sine', 230, 480, .22, .22, 0],
    hit: ['sawtooth', 160, 35, .38, .4, .65],
    pickup: ['sine', 600, 1250, .25, .45, 0],
    break: ['triangle', 180, 45, .23, .35, .65],
    crumble: ['triangle', 95, 36, .22, .3, .6],
    gravity: ['sine', 260, 980, .38, .4, .08],
    revive: ['triangle', 330, 1320, .45, .4, 0],
    airDash: ['sawtooth', 150, 460, .28, .25, .45],
    timeSlow: ['sine', 700, 160, .45, .42, 0],
    timeRewind: ['triangle', 1000, 180, .5, .36, .12],
    phaseShift: ['sine', 210, 560, .4, .42, .08],
    skill: ['triangle', 420, 840, .28, .4, 0]
  });

  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Math.max(min, Math.min(max, Number.isFinite(number) ? number : fallback));
  };
  const state = () => {
    try { return getRuntimeState() || {}; } catch (error) { return {}; }
  };
  const settings = () => state().settings || {};
  const wantsMenuMusic = current => surfState==='inactive' && runner2DState === 'inactive' && (current.mainMenuVisible || current.lobbyActive) && !current.audioBlocked;
  const menuVolume = () => state().lobbyActive ? LOBBY_MUSIC_VOLUME : MENU_MUSIC_VOLUME;
  let menuTargetVolume = -1;
  let menuPlayPending = false;
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
        if (wantsGameplayMusic(state())) {
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

  function wantsGameplayMusic(current) {
    return surfState==='inactive' && runner2DState === 'inactive' && !settings().muted && !current.audioBlocked && !current.lobbyActive && !current.mainMenuVisible && !current.isGameOver && !current.reviveMusicHold
      && (current.runStartedFromMenu || current.levelCompletionInProgress);
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
        const stillWanted = wantsGameplayMusic(state());
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
    return Math.max(0, Math.min(1, volume * clamp(settings().masterVolume, 0, 1.35, 1) * clamp(settings().musicVolume, 0, 1, 0.55)));
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
    // A fade already in flight must not be restarted on every animation frame.
    if (gameplayMusicFadeRaf && Math.abs((gameplayMusicTargetVolume || 0) - effective) < 0.006) return;
    if (Math.abs((gameplayMusicTargetVolume || 0) - effective) < 0.006 && Math.abs(current - effective) < 0.006 && (!pauseWhenSilent || gameplayMusicElement.paused || effective > 0.001)) return;
    fadeElement('gameplay', target, duration, pauseWhenSilent);
  }

  function fadeMenuMusicVolume(target, duration = 420, pauseWhenSilent = false) {
    if (!menuMusicElement) return;
    const effective = target <= .001 ? 0 : getMenuMusicTargetVolume(target);
    if (Math.abs(menuTargetVolume - effective) < .003 && (menuMusicFadeRaf || (Math.abs(menuMusicElement.volume - effective) < .003 && (!pauseWhenSilent || menuMusicElement.paused || effective > .001)))) return;
    menuTargetVolume = effective;
    fadeElement('menu', target, duration, pauseWhenSilent);
  }

  function updateGameplayMusic(forcePlay = false) {
    if (runner2DState !== 'inactive') return; // The runtime's shared unlock must not start/prime the 3D track in 2D.
    const current = state();
    const shouldPlay = wantsGameplayMusic(current);
    if (!shouldPlay && !gameplayMusicElement && !forcePlay) return;
    const music = ensureGameplayMusic();
    if (shouldPlay && (forcePlay || music.paused)) requestGameplayMusicPlay();
    const target = shouldPlay ? GAMEPLAY_MUSIC_VOLUME * (current.levelCompletionInProgress ? 0.16 : (current.isGamePaused ? 0.28 : 1)) : 0;
    if (shouldPlay) {
      if (gameplayMusicFadeRaf) cancelAnimationFrame(gameplayMusicFadeRaf);
      gameplayMusicFadeRaf = 0;
      gameplayMusicTargetVolume = getGameplayMusicTargetVolume(target);
      if (Math.abs(music.volume - gameplayMusicTargetVolume) > 0.003) music.volume = gameplayMusicTargetVolume;
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
    menuTargetVolume = 0;
  }

  function setMenuAmbientActive(active) {
    startMenuAmbient();
    const current = state();
    const shouldPlay = active && wantsMenuMusic(current) && !settings().muted && menuMusicUnlocked;
    if (audioContext && audioContext.state === 'running' && menuAmbientGain) {
      menuAmbientGain.gain.setTargetAtTime(shouldPlay ? 0.08 * clamp(settings().musicVolume, 0, 1, 0.55) : 0, audioContext.currentTime, active ? 0.42 : 0.18);
    }
    if (shouldPlay) {
      if (menuMusicElement.paused && !menuPlayPending) {
        menuPlayPending = true;
        Promise.resolve(menuMusicElement.play()).catch(error => {
          // Hiding the tab/ad/mute can legitimately abort an in-flight play.
          // That is not a browser autoplay denial and must not revoke unlock.
          if (error?.name === 'AbortError' || !wantsMenuMusic(state()) || settings().muted) return;
          menuMusicUnlocked = false; menuMusicAutoplayBlocked = true; notifyMenuUnlock();
        }).finally(() => { menuPlayPending = false; });
      }
      fadeMenuMusicVolume(menuVolume(), 520, false);
    } else {
      fadeMenuMusicVolume(0, 360, true);
    }
  }

  function tryStartMenuMusicAutoplay() {
    const current = state();
    if (!wantsMenuMusic(current) || settings().muted) {
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
      if (wantsMenuMusic(state()) && !settings().muted) fadeMenuMusicVolume(menuVolume(), 720, false);
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
    if (settings().muted || !wantsMenuMusic(current)) return;
    init();
    startMenuAmbient();
    if (menuMusicUnlocked && !menuMusicElement.paused) {
      if (menuMusicElement.volume < getMenuMusicTargetVolume(menuVolume()) * 0.75) fadeMenuMusicVolume(menuVolume(), 240, false);
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
      if (ok && wantsMenuMusic(state()) && !settings().muted) fadeMenuMusicVolume(menuVolume(), 520, false);
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
    const play = () => surfState!=='inactive'?updateSurfMusic():updateGameplayMusic(true);
    if (audioContext.state === 'suspended') audioContext.resume().then(play).catch(play);
    else play();
  }

  function ensureMenuAudio() {
    init();
    startMenuAmbient();
    if (!audioContext) return;
    const activate = () => setMenuAmbientActive(wantsMenuMusic(state()));
    if (audioContext.state === 'suspended') audioContext.resume().then(activate).catch(() => {});
    else if (audioContext.state === 'running') activate();
  }

  function wantsRunner2DMusic() {
    return runner2DState === 'playing' && !settings().muted && !state().audioBlocked && !document.hidden;
  }
  function wantsSurfMusic(){return surfState==='playing'&&!settings().muted&&!state().audioBlocked&&!document.hidden;}
  function updateSurfMusic(){
    if(!surfMusic)return;
    if(!wantsSurfMusic()){if(surfPlayPending||!surfMusic.paused){surfPlayAttempt++;surfPlayPending=false;surfMusic.pause();}surfMusic.volume=0;surfMixAt=0;return;}
    const now=performance.now();
    if(surfMusic.paused&&!surfPlayPending&&now>=surfNextPlay){const attempt=++surfPlayAttempt;surfPlayPending=true;let job;try{job=surfMusic.play();}catch(_){surfPlayPending=false;surfNextPlay=now+1000;return;}Promise.resolve(job).then(()=>{if(!wantsSurfMusic())surfMusic.pause();}).catch(()=>{if(attempt===surfPlayAttempt)surfNextPlay=performance.now()+1000;}).finally(()=>{if(attempt===surfPlayAttempt)surfPlayPending=false;});}
    const dt=Math.min(.1,Math.max(0,(now-(surfMixAt||now))/1000));surfMixAt=now;
    const target=getGameplayMusicTargetVolume(SURF_MUSIC_VOLUME);surfMusic.volume+=(target-surfMusic.volume)*(1-Math.exp(-dt*7));
  }
  function setSurfState(next){surfState=next;if(next!=='inactive'){stopGameplayMusicNow();stopMenuMusicNow();if(!surfMusic){surfMusic=new Audio(SURF_MUSIC_SRC);surfMusic.loop=true;surfMusic.preload='metadata';surfMusic.volume=0;}if(next==='playing'){surfNextPlay=0;resumeContext();}}updateSurfMusic();}
  function playSoftPadSound(){
    const values=settings(),s=state();if(!audioContext||audioContext.state!=='running'||values.muted||s.audioBlocked||s.isGamePaused||s.isGameOver)return false;
    const now=audioContext.currentTime;if(now-lastSoftPad<.09||softPadVoices.size>=8)return false;lastSoftPad=now;
    const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.setValueAtTime(235,now);osc.frequency.exponentialRampToValueAtTime(470,now+.13);osc.frequency.exponentialRampToValueAtTime(360,now+.23);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.2,now+.014);gain.gain.exponentialRampToValueAtTime(.0001,now+.25);osc.connect(gain).connect(sfxGain);const voice={osc,gain};softPadVoices.add(voice);osc.onended=()=>{osc.disconnect();gain.disconnect();softPadVoices.delete(voice);};osc.start(now);osc.stop(now+.26);return true;
  }

  function ensureRunner2DMusic() {
    if (!runner2DMusic) {
      runner2DMusic = new Audio(RUNNER_2D_MUSIC_SRC);
      runner2DMusic.loop = true;
      runner2DMusic.preload = 'metadata'; // Lazy: never part of the 3D boot load.
      runner2DMusic.volume = 0;
    }
    return runner2DMusic;
  }

  function stopRunner2DVoices() {
    for (const voice of runner2DVoices) {
      for (const source of voice.sources) { try { source.stop(); } catch (_) {} }
      for (const node of voice.nodes) { try { node.disconnect(); } catch (_) {} }
    }
    runner2DVoices.clear();
  }

  function updateRunner2DMusic() {
    if (!runner2DMusic) return;
    if (!wantsRunner2DMusic()) {
      if (runner2DPlayPending || !runner2DMusic.paused) {
        runner2DPlayAttempt++; runner2DPlayPending = false;
        runner2DMusic.pause();
      }
      runner2DMusic.volume = runner2DTargetVolume = 0;
      runner2DMixTime = 0;
      if (state().audioBlocked || settings().muted || document.hidden) stopRunner2DVoices();
      return;
    }
    if (runner2DMusic.paused && !runner2DPlayPending && performance.now() >= runner2DNextPlayTime) {
      runner2DPlayPending = true;
      const attempt = ++runner2DPlayAttempt;
      // Call play in the original gesture, without awaiting AudioContext.resume.
      try {
        Promise.resolve(runner2DMusic.play()).then(() => {
          if (!wantsRunner2DMusic()) runner2DMusic.pause();
        }).catch(() => {
          if (attempt === runner2DPlayAttempt) runner2DNextPlayTime = performance.now() + 1000;
        }).finally(() => {
          if (attempt === runner2DPlayAttempt) runner2DPlayPending = false;
        });
      } catch (_) { runner2DPlayPending = false; runner2DNextPlayTime = performance.now() + 1000; }
    }
    const now = performance.now(), dt = Math.min(.1, Math.max(0, (now - (runner2DMixTime || now)) / 1000));
    runner2DMixTime = now;
    runner2DTargetVolume = getGameplayMusicTargetVolume(RUNNER_2D_MUSIC_VOLUME);
    runner2DMusic.volume += (runner2DTargetVolume - runner2DMusic.volume) * (1 - Math.exp(-dt * 12));
  }

  function setRunner2DState(next, options = {}) {
    runner2DState = next;
    if (next !== 'inactive') {
      stopMenuMusicNow(); stopGameplayMusicNow();
      const music = ensureRunner2DMusic();
      if (options.restart) { try { music.currentTime = 0; } catch (_) {} }
      if (next === 'playing') { runner2DNextPlayTime = 0; resumeContext(); getNoiseBuffer(.25); }
    }
    // Preserve the short impact tail through hit-stop, not through a menu.
    if (next !== 'playing' && next !== 'dying') stopRunner2DVoices();
    updateRunner2DMusic();
    syncHtmlAudioWithSettings();
  }

  function playRunner2DSound(kind, skill) {
    if (runner2DState !== 'playing' || settings().muted || state().audioBlocked || document.hidden) return;
    if (!audioContext || audioContext.state !== 'running') return;
    if (kind === 'skill' && runner2DSounds[skill]) kind = skill;
    if (kind === 'shieldBreak') kind = 'break';
    const profile = runner2DSounds[kind] || runner2DSounds.skill, now = audioContext.currentTime;
    const gap = kind === 'coin' ? .055 : kind === 'land' ? .09 : .035;
    if (now - (runner2DSoundTimes[kind] ?? -Infinity) < gap || runner2DVoices.size >= 12) return;
    runner2DSoundTimes[kind] = now;
    const [type, from, to, duration, level, noise] = profile;
    const osc = audioContext.createOscillator(), envelope = audioContext.createGain();
    const voice = { sources: [osc], nodes: [osc, envelope] };
    osc.type = type; osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(to, now + duration);
    envelope.gain.setValueAtTime(.0001, now);
    envelope.gain.exponentialRampToValueAtTime(level, now + .008);
    envelope.gain.exponentialRampToValueAtTime(.0001, now + duration);
    osc.connect(envelope); envelope.connect(sfxGain);
    if (noise) {
      const source = audioContext.createBufferSource(), filter = audioContext.createBiquadFilter(), gain = audioContext.createGain();
      source.buffer = getNoiseBuffer(.25); source.loop = true;
      filter.type = 'lowpass'; filter.frequency.value = kind === 'slide' ? 1800 : 2600;
      gain.gain.value = noise; source.connect(filter); filter.connect(gain); gain.connect(envelope);
      voice.sources.push(source); voice.nodes.push(source, filter, gain);
      source.start(now); source.stop(now + duration);
    }
    runner2DVoices.add(voice);
    osc.onended = () => { for (const node of voice.nodes) node.disconnect(); runner2DVoices.delete(voice); };
    osc.start(now); osc.stop(now + duration + .01);
  }

  document.addEventListener('visibilitychange',()=>{updateRunner2DMusic();updateSurfMusic();});

  function applySettings() {
    if (!audioContext) { syncHtmlAudioWithSettings(); return; }
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
    updateSurfMusic();
    updateRunner2DMusic();
    const current = state();
    if (settings().muted || current.audioBlocked) {
      stopMenuMusicNow();
      stopGameplayMusicNow();
    } else if (wantsMenuMusic(current)) {
      setMenuAmbientActive(true);
      updateGameplayMusic();
    } else {
      setMenuAmbientActive(false);
      updateGameplayMusic(forceGameplayPlay);
    }
  }

  function updateMix() {
    updateSurfMusic();
    updateRunner2DMusic();
    if(state().audioBlocked||state().isGamePaused||state().isGameOver||settings().muted)stopPartyHeartbeat();
    if (!audioContext || audioContext.state !== 'running') return;
    if (!audioBedNodes) startAudioBed();
    const now = audioContext.currentTime;
    // Re-queuing the same AudioParam ramps at render FPS grows the automation
    // queue and can make Web Audio crackle on slower browser devices.
    if (now - lastMixAutomationTime < 0.08) {
      updateGameplayMusic();
      return;
    }
    lastMixAutomationTime = now;
    const current = state();
    const values = settings();
    const pause = (current.isGamePaused || current.isGameOver) ? 0.42 : 1;
    const musicDuck = current.reviveMusicHold ? 0 : 1;
    const ambienceDuck = current.reviveMusicHold ? 0.12 : 1;
    const speedRatio = Math.max(0, Math.min(1, (current.moveSpeed - current.minMoveSpeed) / Math.max(0.001, current.maxMoveSpeed - current.minMoveSpeed)));
    const phaseBoost = current.gamePhase === 5 ? 1.08 : (current.gamePhase === 4 ? 1.12 : (current.gamePhase === 3 ? 1.24 : ((current.onSkyLayer || current.isSkyFading) ? 1.16 : 0.92)));
    masterGain.gain.setTargetAtTime(values.muted ? 0 : (current.isGamePaused ? 0.22 : 0.3) * clamp(values.masterVolume, 0, 1.35, 1), now, 0.18);
    const worldAudio = runner2DState === 'inactive' && surfState==='inactive' ? 1 : 0;
    musicGain.gain.setTargetAtTime(worldAudio * (0.012 + speedRatio * 0.012) * pause * musicDuck * phaseBoost * clamp(values.musicVolume, 0, 1, 0.55), now, 0.18);
    ambienceGain.gain.setTargetAtTime(worldAudio * (0.03 + speedRatio * 0.018 + ((current.onSkyLayer || current.isSkyFading) ? 0.015 : 0) + (current.gamePhase === 3 ? 0.02 : 0) + (current.gamePhase === 4 ? 0.012 : 0) + (current.gamePhase === 5 ? 0.018 : 0)) * pause * ambienceDuck, now, 0.2);
    menuAmbientGain.gain.setTargetAtTime(wantsMenuMusic(current) && !values.muted && menuMusicUnlocked ? 0.08 * clamp(values.musicVolume, 0, 1, 0.55) : 0, now, 0.36);
    setMenuAmbientActive(wantsMenuMusic(current));
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
      partyHeartbeat: { beats:partyHeartBeatCount, voices:partyHeartVoices.size },
      surfMusic:{state:surfState,created:!!surfMusic,src:surfMusic?.getAttribute('src')||'',paused:surfMusic?.paused??true,volume:surfMusic?.volume||0,currentTime:surfMusic?.currentTime||0,readyState:surfMusic?.readyState||0},softPad:{voices:softPadVoices.size},
      runner2D: {
        state: runner2DState, created: !!runner2DMusic, paused: runner2DMusic?.paused ?? true,
        src: runner2DMusic?.getAttribute('src') || '', readyState: runner2DMusic?.readyState || 0,
        currentTime: runner2DMusic?.currentTime || 0, volume: runner2DMusic?.volume || 0,
        targetVolume: runner2DTargetVolume, voices: runner2DVoices.size
      },
      menuMusic: {
        created: !!menuMusicElement,
        paused: menuMusicElement ? menuMusicElement.paused : true,
        unlocked: menuMusicUnlocked,
        autoplayBlocked: menuMusicAutoplayBlocked,
        currentTime: menuMusicElement ? menuMusicElement.currentTime : 0,
        volume: menuMusicElement?.volume || 0, lobby: !!state().lobbyActive
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
    setRunner2DState, playRunner2DSound, playPartyHeartbeat, stopPartyHeartbeat, setSurfState, playSoftPadSound,
    applySettings, syncHtmlAudioWithSettings, updateMix,
    startMenuAmbient, ensureGameplayMusic, primeGameplayMusicBuffer,
    requestGameplayMusicPlay, updateGameplayMusic, invalidateGameplayMusicPlay,
    fadeGameplayMusicVolume, fadeMenuMusicVolume,
    stopGameplayMusicNow, stopMenuMusicNow, setMenuAmbientActive,
    tryStartMenuMusicAutoplay, unlockMenuMusicFromUserGesture,
    unlockGameplayAudioFromUserGesture, ensureMenuAudio,
    isMenuMusicUnlocked: () => menuMusicUnlocked,
    snapshot,
    constants: Object.freeze({ MENU_MUSIC_VOLUME, LOBBY_MUSIC_VOLUME, GAMEPLAY_MUSIC_VOLUME })
  });

  Object.defineProperty(window, 'ElementalAudio', {
    value: api,
    writable: false,
    configurable: false,
    enumerable: false
  });
})();
