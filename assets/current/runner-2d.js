'use strict';

/* Side-view mode. Logical coordinates: +X forward, +Y up from the ground.
   Driven by the existing game loop; no WebGL scene, loader, or second RAF. */
(function (global) {
  const STEP = 1 / 120, GRAVITY = 1850, JUMP = 715, BODY_W = 42, BODY_H = 62;
  const SECTION = 9000, HISTORY = 241, HISTORY_STRIDE = 12, SAVE_KEY = 'elemental-run-2d-v1';
  const SLIDE_DURATION = .8, SLIDE_RECOVERY = .18, PAD_JUMP = 1080;
  const MAX_HEALTH = 1, COYOTE_TIME = .12, HIT_STOP = .15, DEATH_SHAKE = .24;
  const BASE_SPEED = 450, TOP_SPEED = 800;
  const BHOP_WINDOW = .06, BHOP_SPEED_PER_HOP = .02, BHOP_SPEED_CAP = .10;
  const BHOP_SCORE_PER_HOP = .018, BHOP_SCORE_CAP = .18;
  const CEILING = 380, DEATH_BURST = .65;
  const SCENERY_TILE = 1024, SCENERY_HEIGHT = 512;
  // Side-view silhouettes of the runner's vehicles/barriers. No full-height
  // wall: every authored pattern has a normal jump, slide, or supplied pad route.
  const HAZARDS = {
    block: [78, 48, 0], car: [120, 58, 0], motor: [80, 48, 0],
    beam: [154, 90, 43], fall: [70, 54, 470], spinner: [68, 60, 0],
    lava: [150, 14, 0], ice: [116, 40, 0], train: [180, 108, 0], pad: [92, 12, 0],
    platform: [250, 24, 76], crumblingBlock: [230, 28, 172], icePlatform: [280, 26, 74],
    breakWall: [42, 180, 0], updraft: [150, 300, 0], geyser: [82, 116, 0], waterBubble: [190, 210, 70],
    stepBlock: [140, 56, 0], gravityPortal: [46, CEILING, 0], saw: [64, 64, 108]
  };
  const PATTERNS = ['block', 'beam', 'carIn', 'fall', 'pad', 'motorIn', 'lava', 'ice', 'spinner', 'car',
    'beamJump', 'jumpSlide', 'hopPair', 'fallPair', 'padMotor', 'wideLava', 'stairs', 'padChain', 'gravityRun', 'breakWall', 'field', 'saw'];
  const THEMES = [
    { key: 'hubNature', sky: '#b9e7df', horizon: '#edf0ce', far: '#83ada0', near: '#3b746c', leaf: '#3d8d70', floor: '#283e3e', edge: '#9dc981', glow: '#ffe4a0', type: 'forest' },
    { key: 'hubSnow', sky: '#253a61', horizon: '#879bc4', far: '#566f9d', near: '#a6c4df', leaf: '#3e6b83', floor: '#37475e', edge: '#e6f7ff', glow: '#c0f4ff', type: 'snow' },
    { key: 'city', sky: '#151e3a', horizon: '#54496b', far: '#303854', near: '#39496d', leaf: '#4d7082', floor: '#202b40', edge: '#72d4d0', glow: '#f0b38b', type: 'city' },
    { key: 'hubLava', sky: '#412d46', horizon: '#c76d5a', far: '#794553', near: '#503d4a', leaf: '#74494d', floor: '#332e3a', edge: '#fba66d', glow: '#ffca74', type: 'lava' },
    { key: 'sky', sky: '#76afd1', horizon: '#f0e5ce', far: '#aecfdc', near: '#e6e8dd', leaf: '#84bfb8', floor: '#617480', edge: '#fff0cc', glow: '#ffedb3', type: 'sky' },
    { key: 'hubWater', sky: '#21586d', horizon: '#78b1b0', far: '#377e8b', near: '#285365', leaf: '#57aba3', floor: '#263e4c', edge: '#77dcd1', glow: '#bbf3df', type: 'water' }
  ];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const poly = (c, points, fill) => { c.fillStyle = fill; c.beginPath(); c.moveTo(points[0], points[1]); for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]); c.closePath(); c.fill(); };
  function box(c, x, y, w, h, r, fill, stroke) {
    c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = fill; c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2; c.stroke(); }
  }
  function readBest() {
    try { const data = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); return { distance: clamp(Number(data.distance) || 0, 0, 1e9), score: clamp(Number(data.score) || 0, 0, 1e12) }; }
    catch (_) { return { distance: 0, score: 0 }; }
  }

  class Runner2D {
    constructor(api) {
      this.api = api; this.active = false; this.state = 'inactive'; this.best = readBest();
      this.layers = new Map(); this.obstacles = Array.from({ length: 48 }, () => ({ active: false }));
      this.coins = Array.from({ length: 144 }, () => ({ active: false }));
      this.pickups = Array.from({ length: 24 }, () => ({ active: false }));
      this.particles = Array.from({ length: 112 }, () => ({ life: 0 }));
      this.voxels = Array.from({ length: 18 }, () => ({ active: false }));
      this.history = new Float64Array(HISTORY * HISTORY_STRIDE); this.keys = new Set(); this.pointers = new Map(); this.heldInputs = new Map();
      this.root = document.createElement('section'); this.root.id = 'runner-2d'; this.root.hidden = true;
      this.root.innerHTML = `<canvas id="runner-2d-canvas" tabindex="0" aria-label="Elemental Run 2D"></canvas>
        <header class="r2-hud"><div class="r2-status"><span class="r2-hearts">♥</span><span class="r2-score">0</span></div>
        <div class="r2-track"><div class="r2-biome"><span></span><i><b></b></i><em>0%</em></div><span class="r2-distance">0 m</span></div>
        <div class="r2-wallet"><span class="r2-coins">◈ 0</span><button class="r2-pause" type="button" data-action="pause">Ⅱ</button></div></header>
        <div class="r2-buffs"><span class="r2-bhop" hidden></span><span class="r2-magnet" hidden></span></div>
        <div class="r2-overlay"><div class="r2-card"><small class="r2-eyebrow">ELEMENTAL RUN</small><h1></h1><div class="r2-summary"></div>
          <div class="r2-lessons"><div><i>↗</i><b data-copy="jump"></b><kbd>SPACE / ↑</kbd></div><div><i>↘</i><b data-copy="slide"></b><kbd>S / ↓</kbd></div><div><i>↓ !</i><b data-copy="runner2DFalling"></b><kbd>!</kbd></div></div>
          <button type="button" class="r2-primary" data-action="play"></button><button type="button" class="r2-back" data-action="exit"></button>
        </div></div>
        <footer class="r2-controls"><button type="button" data-action="slide"><strong>↘</strong><span data-copy="slide"></span><kbd>S / ↓</kbd></button>
          <button type="button" data-action="skill" class="r2-skill"><strong>✦</strong><span></span><kbd>E</kbd></button>
          <button type="button" data-action="jump"><strong>↗</strong><span data-copy="jump"></span><kbd>SPACE / ↑</kbd></button></footer>`;
      document.body.appendChild(this.root); this.canvas = this.root.querySelector('canvas'); this.ctx = this.canvas.getContext('2d', { alpha: false });
      this.els = Object.fromEntries(['distance', 'score', 'coins', 'hearts', 'biome', 'overlay', 'summary', 'lessons', 'primary', 'back', 'skill', 'magnet', 'bhop'].map(k => [k, this.root.querySelector('.r2-' + k)]));
      this.slideButton = this.root.querySelector('.r2-controls [data-action="slide"]');
      this.jumpButton = this.root.querySelector('.r2-controls [data-action="jump"]');
      this.root.addEventListener('pointerdown', e => {
        e.stopPropagation(); const action = e.target === this.canvas && this.state === 'playing' ? 'jump' : e.target.closest('[data-action]')?.dataset.action;
        if (['jump', 'slide', 'skill'].includes(action)) {
          e.preventDefault(); this.pointers.set(e.pointerId, action);
          try { (e.target.closest('button') || this.canvas).setPointerCapture(e.pointerId); } catch (_) {}
          this.input(action, true, 'pointer:' + e.pointerId);
        }
      });
      const release = e => { const action = this.pointers.get(e.pointerId); this.pointers.delete(e.pointerId); if (action) this.input(action, false, 'pointer:' + e.pointerId); };
      this.root.addEventListener('pointerup', release); this.root.addEventListener('pointercancel', release);
      this.root.addEventListener('lostpointercapture', release);
      this.root.addEventListener('mousedown', e => e.stopPropagation());
      this.root.addEventListener('click', e => {
        e.stopPropagation(); const action = e.target.closest('[data-action]')?.dataset.action;
        if (action === 'play') { if (this.state === 'paused') this.resume(); else this.begin(); }
        else if (action === 'exit') this.exit(); else if (action === 'pause') this.pause();
        // Accessible keyboard activation of touch controls; pointer input was handled above.
        else if (e.detail === 0 && ['jump', 'slide', 'skill'].includes(action)) { this.input(action, true, 'accessible'); this.input(action, false, 'accessible'); }
      });
      window.addEventListener('resize', () => { if (this.active) this.resize(); });
      window.addEventListener('blur', () => { if (this.active) this.pause(); });
      window.addEventListener('pagehide', () => { if (this.active) { this.pause(); this.settle(); } });
    }
    text(key) { const value = this.api.tr(key); return key === 'jump' ? value.split('/')[0].trim() : value; }
    enter() {
      this.active = true; this.root.hidden = false; document.body.classList.add('runner-2d-active');
      this.skin = this.api.skin() || { id: 'default', skill: '', accent: '#88d4b1', base: '#315c50', edge: '#d0e9b0' };
      this.reduceMotion = !!global.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      this.root.dir = this.api.language() === 'ar' ? 'rtl' : 'ltr';
      this.root.querySelectorAll('[data-copy]').forEach(el => { el.textContent = this.text(el.dataset.copy); });
      for (const action of ['jump', 'slide']) {
        const hint = `${this.api.controlHint?.(action) || (action === 'jump' ? 'SPACE' : 'S')} / ${action === 'jump' ? '↑' : '↓'}`;
        this.root.querySelectorAll(`[data-copy="${action}"]`).forEach(el => { const kbd = el.parentElement.querySelector('kbd'); if (kbd) kbd.textContent = hint; });
      }
      this.root.querySelector('.r2-pause').setAttribute('aria-label', this.text('pauseTitle'));
      this.els.back.textContent = '⌂'; this.els.back.setAttribute('aria-label', this.text('runner2DLobby')); this.els.back.title = this.text('runner2DLobby');
      this.els.skill.querySelector('span').textContent = this.skin.skill ? this.text('handSkill_' + this.skin.skill) : '—';
      this.els.skill.hidden = !this.skin.skill || this.skin.skill === 'glide';
      for (const action of ['jump', 'slide', 'skill']) {
        const button = this.root.querySelector(`.r2-controls [data-action="${action}"]`);
        const label = action === 'skill' ? (this.skin.skill ? this.text('handSkill_' + this.skin.skill) : '') : this.text(action);
        button.setAttribute('aria-label', label); button.title = label;
      }
      this.root.classList.toggle('r2-mobile', !!this.api.mobile);
      this.reset(); this.resize(); this.setState('ready'); this.showOverlay(); this.canvas.focus({ preventScroll: true });
    }
    reset() {
      this.elapsed = 0; this.distance = 0; this.peak = 0; this.score = 0; this.scoreBase = 0; this.gold = 0; this.health = MAX_HEALTH;
      this.y = 0; this.vy = 0; this.gravityDir = 1; this.slide = 0; this.slideHeld = false; this.jumpHeld = false; this.jumps = 0; this.jumpBuffer = 0;
      this.slideRecovery = 0; this.slideBuffer = 0; this.magnetTime = 0; this.padFlash = 0;
      this.slidePose = 0; this.worldTime = 0; this.rewindClockFrom = 0; this.rewindClockTarget = 0;
      this.grounded = true; this.support = -1; this.coyoteTime = 0; this.iceUntil = 0; this.bubbleUntil = 0;
      this.bhopCombo = 0; this.bhopWindow = 0;
      this.cameraY = 0; this.trailClock = 0; this.shakeTime = 0; this.shakeDuration = 0; this.shakeIntensity = 0; this.renderIndex = 0;
      this.speed = BASE_SPEED; this.stride = 0; this.squash = 0; this.shake = 0; this.invulnerable = 0; this.deathClock = 0;
      this.cooldown = 0; this.effect = ''; this.effectTime = 0; this.reviveUsed = false; this.rewindTime = 0;
      this.accumulator = 0; this.hudClock = 0; this.historyClock = 0; this.historyCount = 0; this.historyIndex = 0;
      this.nextObstacle = 1400; this.spawnIndex = 0; this.coinStreak = 0; this.settled = false; this.bankedGold = 0; this.recordedRun = false; this.dustClock = 0; this.gamepadMask = 0;
      this.spawnSeed = null; this.patternBag = []; this.lastPattern = ''; this.recentFamilies = []; this.plannerClamps = 0;
      this.biome = 0; this.previousBiome = 0; this.themeBlend = 1; this.clearInputs();
      for (const o of this.obstacles) o.active = false;
      for (const c of this.coins) c.active = false;
      for (const p of this.pickups) p.active = false;
      for (const p of this.particles) p.life = 0;
      for (const v of this.voxels) v.active = false;
      this.prepareTheme(0); this.spawnAhead(); this.refreshHud();
    }
    setState(state, options) {
      this.state = state;
      global.ElementalAudio?.setRunner2DState?.(state, options);
      this.api.stateChanged?.(state);
    }
    sound(kind) {
      if (global.ElementalAudio?.playRunner2DSound) global.ElementalAudio.playRunner2DSound(kind, this.skin.skill);
      else this.api.sound?.(kind);
    }
    begin() {
      if (!this.active || !['ready', 'dead'].includes(this.state)) return;
      this.reset(); this.setState('playing', { restart: true }); this.els.overlay.hidden = true;
      this.sound('start'); this.canvas.focus({ preventScroll: true });
    }
    pause() {
      if (this.state !== 'playing') return;
      this.clearInputs(); this.accumulator = 0;
      this.setState('paused'); this.showOverlay();
    }
    resume() {
      if (this.state !== 'paused') return;
      this.setState('playing'); this.els.overlay.hidden = true; this.canvas.focus({ preventScroll: true });
    }
    settle() {
      if (this.elapsed <= 0) return;
      this.settled = true; this.best.distance = Math.max(this.best.distance, Math.floor(this.peak / 10));
      this.best.score = Math.max(this.best.score, this.score);
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.best)); } catch (_) {}
      const coins = Math.max(0, this.gold - this.bankedGold), recordRun = !this.recordedRun;
      this.bankedGold = this.gold; this.recordedRun = true;
      if (coins || recordRun) this.api.bank({ coins, recordRun, score: this.score, distance: Math.floor(this.peak / 10), seconds: this.elapsed });
    }
    exit() {
      if (!this.active) return;
      if (document.fullscreenElement === this.root) document.exitFullscreen?.()?.catch?.(() => {});
      this.settle(); this.setState('inactive'); this.active = false; this.root.hidden = true;
      document.body.classList.remove('runner-2d-active'); this.clearInputs();
      for (const key of this.layers.keys()) this.disposeScenery(key);
      this.api.exit();
    }
    showOverlay() {
      this.els.overlay.hidden = false; this.els.lessons.hidden = this.state !== 'ready';
      const heading = this.root.querySelector('h1');
      heading.textContent = this.state === 'ready' ? '2D RUN' : this.state === 'paused' ? 'Ⅱ' : `${Math.floor(this.peak / 10)} m`;
      heading.setAttribute('aria-label', this.state === 'ready' ? '2D RUN' : this.text(this.state === 'paused' ? 'pauseTitle' : 'gameOver'));
      const label = this.text(this.state === 'dead' ? 'retry' : this.state === 'paused' ? 'continue' : 'play');
      this.els.primary.textContent = this.state === 'dead' ? '↻' : '▶'; this.els.primary.setAttribute('aria-label', label); this.els.primary.title = label;
      this.els.summary.hidden = this.state !== 'dead';
      this.els.summary.replaceChildren();
      if (this.state === 'dead') for (const [icon, value] of [['◈', this.gold], ['◷', `${Math.floor(this.elapsed)}s`], ['🏆', `${this.best.distance}m`]]) {
        const chip = document.createElement('span'); chip.textContent = `${icon} ${value}`; this.els.summary.appendChild(chip);
      }
    }
    key(e, down) {
      if (!this.active) return;
      const custom = this.api.binding?.(e.code);
      const action = custom || (['Space', 'KeyW', 'ArrowUp'].includes(e.code) ? 'jump' : ['KeyS', 'ArrowDown'].includes(e.code) ? 'slide' : e.code === 'KeyE' ? 'skill' : null);
      if (action) {
        e.preventDefault(); if (down && e.repeat) return;
        if (down) this.keys.add(e.code); else this.keys.delete(e.code);
        this.input(action, down, e.code); return;
      }
      if (down && !e.repeat && ['Escape', 'KeyP'].includes(e.code)) { e.preventDefault(); if (this.state === 'paused') this.resume(); else this.pause(); }
      if (down && !e.repeat && e.code === 'KeyF') {
        e.preventDefault();
        const change = document.fullscreenElement ? document.exitFullscreen?.() : this.root.requestFullscreen?.();
        change?.catch?.(() => {}); // Embedded portals may disallow fullscreen.
      }
      if (down && !e.repeat && e.code === 'Enter' && ['ready', 'dead'].includes(this.state)) { e.preventDefault(); this.begin(); }
    }
    clearInputs() {
      this.keys.clear(); this.pointers.clear(); this.heldInputs.clear(); this.gamepadMask = 0;
      this.jumpHeld = this.slideHeld = false; this.jumpBuffer = 0;
      this.jumpButton.classList.remove('is-gliding');
    }
    input(action, down, source) {
      if (down) this.heldInputs.set(source, action); else this.heldInputs.delete(source);
      let held = false;
      for (const value of this.heldInputs.values()) if (value === action) { held = true; break; }
      // A release must not cancel another finger/key/controller still holding
      // jump, nor synthesize a fresh jump when one of those sources is released.
      this.action(action, down, held);
    }
    action(action, down, held = down) {
      if ((this.state === 'ready' || this.state === 'dead') && action === 'jump' && down) { this.begin(); return; }
      if (this.state !== 'playing') return;
      if (action === 'jump') {
        this.jumpHeld = held; if (down) { this.jumpBuffer = .12; this.tryJump(); }
        this.jumpButton.classList.toggle('is-gliding', this.isGliding());
      }
      if (action === 'slide') {
        const pressed = down && !this.slideHeld; this.slideHeld = held;
        if (pressed && !this.slide && !this.slideRecovery && !this.rewindTime) {
          if (!this.grounded) { this.vy = Math.min(this.vy * this.gravityDir, -650) * this.gravityDir; this.slideBuffer = .28; }
          else this.startSlide();
        }
      }
      if (action === 'skill' && down) this.useSkill();
    }
    tryJump() {
      const extra = this.skin.skill === 'doubleJump' && this.jumps < 2;
      const edgeJump = this.coyoteTime > 0;
      if (this.rewindTime > 0 || !this.grounded && !edgeJump && !extra) return;
      if (this.grounded || edgeJump) {
        this.bhopCombo = this.grounded && this.bhopWindow > 0 ? Math.min(999, this.bhopCombo + 1) : 0;
        this.bhopWindow = 0;
      }
      this.vy = JUMP * this.gravityDir; this.jumps = this.grounded || edgeJump ? 1 : this.jumps + 1;
      this.grounded = false; this.support = -2; this.coyoteTime = 0;
      // Cancel both the logical slide and its visual pose on this input event.
      this.slide = this.slidePose = this.slideRecovery = this.slideBuffer = 0; this.jumpBuffer = 0; this.squash = -.17;
      this.emit(this.distance, this.y + this.gravityDir * 5, this.skin.accent, 9); this.sound('jump');
    }
    startSlide() {
      this.slide = SLIDE_DURATION; this.slideBuffer = 0; this.squash = .12;
      this.emit(this.distance - 18, this.y + this.gravityDir * 7, THEMES[this.biome].edge, 8); this.sound('slide');
    }
    isGliding() {
      return this.skin.skill === 'glide' && this.jumpHeld && !this.grounded && this.vy * this.gravityDir < 0 && this.rewindTime <= 0;
    }
    useSkill() {
      const skill = this.skin.skill;
      if (!skill || this.cooldown > 0 || this.rewindTime > 0) return;
      if (skill === 'doubleJump') { this.jumpBuffer = .12; this.tryJump(); return; }
      // Forest Guard is hold-to-glide on Jump only, never a latched skill toggle.
      if (skill === 'glide') return;
      if (skill === 'revive') return;
      if (skill === 'timeRewind') {
        if (this.historyCount < 60) return;
        const i = ((this.historyIndex - Math.min(150, this.historyCount) + HISTORY) % HISTORY) * HISTORY_STRIDE;
        this.rewindFrom = this.distance; this.rewindY = this.y; this.rewindTarget = this.history[i]; this.rewindTargetY = this.history[i + 1];
        this.rewindClockFrom = this.worldTime; this.rewindClockTarget = this.history[i + 3];
        this.rewindTargetVy = this.history[i + 2]; this.rewindTargetJumps = this.history[i + 4]; this.rewindTargetSupport = this.history[i + 5];
        this.rewindTargetIce = this.history[i + 6]; this.rewindTargetBubble = this.history[i + 7]; this.rewindTargetCoyote = this.history[i + 8];
        this.rewindTargetGravity = this.history[i + 9]; this.rewindHead = this.historyIndex; this.rewindSamples = Math.min(150, this.historyCount);
        this.rewindTargetBhop = this.history[i + 10]; this.rewindTargetBhopWindow = this.history[i + 11];
        this.rewindTime = .6; this.effectTime = .6; this.cooldown = 14;
      } else {
        this.effectTime = skill === 'airDash' ? .35 : skill === 'timeSlow' ? 2.2 : skill === 'magnet' ? 6 : 3;
        this.cooldown = skill === 'airDash' ? 7 : 12;
      }
      this.effect = skill; this.emit(this.distance, this.y + this.gravityDir * 30, this.skin.accent, 20); this.sound('skill'); this.api.skillUsed?.();
      if (skill === 'airDash') this.screenShake(.18, 4);
    }
    screenShake(duration, intensity) {
      this.shakeTime = Math.max(this.shakeTime, duration); this.shakeDuration = this.shakeTime;
      this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }
    update(dt) {
      if (!this.active) return;
      this.pollGamepad();
      if (this.state === 'playing') {
        if (document.hidden) this.pause();
        else {
          this.accumulator += clamp(dt, 0, .1);
          let steps = 0; while (this.accumulator >= STEP && steps++ < 12 && this.state === 'playing') { this.tick(STEP); this.accumulator -= STEP; }
          this.hudClock += dt; if (this.hudClock >= .1) { this.hudClock = 0; this.refreshHud(); }
        }
      }
      else if (this.state === 'dying' && !document.hidden) {
        // Presentation clock only: worldTime, physics, scoring and the 60 Hz
        // rewind history stay frozen through hit-stop and the death shake.
        this.deathClock = Math.min(HIT_STOP + DEATH_BURST, this.deathClock + clamp(dt, 0, .1));
        const shakeAge = this.deathClock - HIT_STOP;
        this.shakeTime = shakeAge > 0 ? Math.max(0, DEATH_SHAKE - shakeAge) : 0;
        if (this.deathClock >= HIT_STOP + DEATH_BURST) { this.settle(); this.setState('dead'); this.showOverlay(); }
      }
      this.draw();
    }
    pollGamepad() {
      const pad = global.navigator.getGamepads?.().find(p => p?.connected);
      if (!pad) {
        for (let i = 0; i < 3; i++) if (this.gamepadMask & (1 << i)) this.input(['jump', 'slide', 'skill'][i], false, 'gamepad:' + i);
        this.gamepadMask = 0; return;
      }
      const mask = (pad.buttons[0]?.pressed || pad.buttons[12]?.pressed ? 1 : 0) | (pad.buttons[1]?.pressed || pad.buttons[13]?.pressed ? 2 : 0) | (pad.buttons[2]?.pressed ? 4 : 0) | (pad.buttons[9]?.pressed ? 8 : 0);
      for (let i = 0; i < 3; i++) if ((mask & (1 << i)) !== (this.gamepadMask & (1 << i))) this.input(['jump', 'slide', 'skill'][i], !!(mask & (1 << i)), 'gamepad:' + i);
      if (mask & 8 && !(this.gamepadMask & 8)) { if (this.state === 'paused') this.resume(); else this.pause(); } this.gamepadMask = mask;
    }
    tick(dt) {
      const previousX = this.distance, previousY = this.y, previousGravity = this.gravityDir, wasGrounded = this.grounded, rewinding = this.rewindTime > 0;
      if (this.state !== 'playing') return;
      this.elapsed += dt;
      this.cooldown = Math.max(0, this.cooldown - dt); this.effectTime = Math.max(0, this.effectTime - dt);
      this.invulnerable = Math.max(0, this.invulnerable - dt); this.shake = Math.max(0, this.shake - dt * 3);
      this.shakeTime = Math.max(0, this.shakeTime - dt); if (!this.shakeTime) this.shakeIntensity = 0;
      this.squash *= Math.exp(-18 * dt); this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
      this.magnetTime = Math.max(0, this.magnetTime - dt); this.padFlash = Math.max(0, this.padFlash - dt);
      if (this.effectTime <= 0) this.effect = '';
      const worldScale = this.effect === 'timeSlow' ? .32 : this.effect === 'airDash' ? 1.7 : 1;
      const motionDt = dt * (this.effect === 'timeSlow' ? .32 : 1);
      if (!rewinding) {
        this.coyoteTime = Math.max(0, this.coyoteTime - motionDt);
        this.bhopWindow = Math.max(0, this.bhopWindow - motionDt);
        if (wasGrounded && !this.bhopWindow) this.bhopCombo = 0;
      }
      this.speed = (BASE_SPEED + (TOP_SPEED - BASE_SPEED) * (1 - Math.exp(-this.elapsed / 85))) * (1 + Math.min(BHOP_SPEED_CAP, this.bhopCombo * BHOP_SPEED_PER_HOP));
      this.slideBuffer = Math.max(0, this.slideBuffer - motionDt);
      this.slideRecovery = Math.max(0, this.slideRecovery - motionDt);
      if (this.slide > 0) { this.slide = Math.max(0, this.slide - motionDt); if (!this.slide) this.slideRecovery = SLIDE_RECOVERY; }
      const poseTarget = this.slide > 0 && this.grounded ? 1 : 0;
      this.slidePose = poseTarget + (this.slidePose - poseTarget) * Math.exp(-motionDt * (poseTarget ? 32 : 22));
      if (rewinding) {
        this.rewindTime = Math.max(0, this.rewindTime - dt); const t = 1 - this.rewindTime / .6;
        this.distance = this.rewindFrom + (this.rewindTarget - this.rewindFrom) * t;
        this.worldTime = this.rewindClockFrom + (this.rewindClockTarget - this.rewindClockFrom) * t;
        // Replay sampled feet/orientation together: interpolating only endpoints
        // would drag an inverted cube through the ceiling at a portal boundary.
        const offset = 1 + t * (this.rewindSamples - 1), a = Math.floor(offset), f = offset - a;
        const ai = ((this.rewindHead - a + HISTORY) % HISTORY) * HISTORY_STRIDE;
        const bi = ((this.rewindHead - Math.min(this.rewindSamples, a + 1) + HISTORY) % HISTORY) * HISTORY_STRIDE;
        this.distance = this.history[ai] + (this.history[bi] - this.history[ai]) * f;
        this.worldTime = this.history[ai + 3] + (this.history[bi + 3] - this.history[ai + 3]) * f;
        this.gravityDir = this.history[ai + 9] === -1 ? -1 : 1;
        this.bhopCombo = this.history[ai + 10]; this.bhopWindow = this.history[ai + 11];
        const centerA = this.history[ai + 1] + this.gravityDir * BODY_H / 2;
        const centerB = this.history[bi + 1] + (this.history[bi + 9] === -1 ? -1 : 1) * BODY_H / 2;
        this.y = centerA + (centerB - centerA) * f - this.gravityDir * BODY_H / 2;
        this.vy = 0; this.invulnerable = 1;
        this.grounded = false; this.support = -2;
        if (!this.rewindTime) {
          this.historyCount = 0; this.historyClock = 0; this.vy = this.rewindTargetVy; this.jumps = this.rewindTargetJumps;
          this.support = this.rewindTargetSupport; this.grounded = this.support !== -2;
          this.iceUntil = this.rewindTargetIce; this.bubbleUntil = this.rewindTargetBubble; this.coyoteTime = this.rewindTargetCoyote;
          this.gravityDir = this.rewindTargetGravity === -1 ? -1 : 1; this.y = this.rewindTargetY;
          this.bhopCombo = this.rewindTargetBhop; this.bhopWindow = this.rewindTargetBhopWindow;
        }
      } else {
        this.worldTime += motionDt;
        this.distance += this.speed * dt * worldScale * (this.worldTime < this.iceUntil ? 1.22 : 1);
        const gliding = this.isGliding();
        if (this.effect !== 'airDash') this.vy -= GRAVITY * this.gravityDir * motionDt * (gliding ? .15 : this.worldTime < this.bubbleUntil ? .3 : 1);
        else this.vy = 0;
        if (gliding) this.vy = Math.max(this.vy * this.gravityDir, -100) * this.gravityDir;
        this.y += this.vy * motionDt;
        this.grounded = false; this.support = -2;
      }
      // Credit only newly travelled distance at the multiplier that was active
      // then. Expiring boosts or rewinding must never remove/re-credit points.
      this.scoreBase += Math.max(0, this.distance - this.peak) / 10 * Math.max(1, Number(this.api.scoreMultiplier()) || 1) * (1 + Math.min(BHOP_SCORE_CAP, this.bhopCombo * BHOP_SCORE_PER_HOP));
      this.peak = Math.max(this.peak, this.distance); this.score = Math.floor(this.scoreBase) + this.gold * 10;
      this.stride += dt * (this.speed / 38);
      const phase = Math.floor(this.distance / SECTION) % THEMES.length;
      if (phase !== this.biome) { this.previousBiome = this.biome; this.biome = phase; this.themeBlend = 0; this.prepareTheme(phase); }
      this.themeBlend = Math.min(1, this.themeBlend + dt / 1.5);
      if (this.distance % SECTION > SECTION - 1600) this.prepareTheme((phase + 1) % THEMES.length);
      this.spawnAhead();
      for (const o of this.obstacles) {
        if (!o.active) continue;
        if (o.kind === 'saw') o.y = o.homeY + Math.sin(this.worldTime * o.frequency + o.phase) * o.amplitude;
        if (o.incoming) {
          // Deterministic world-time motion is reversible, unlike accumulated
          // per-mesh offsets. Start beyond the visible reaction window; match
          // the encounter to its authored slot without crowding the prior one.
          if (!Number.isFinite(o.motionStart) && !rewinding && o.homeX - this.distance < o.activationDistance) o.motionStart = this.worldTime;
          o.x = Math.max(o.motionMinX, o.spawnX + o.vx * Math.max(0, this.worldTime - o.motionStart));
          if (!Number.isFinite(o.x)) o.x = o.spawnX;
        }
        if (Math.max(o.x, o.homeX, o.ceilingEnd) < this.distance - 3000) { o.active = false; continue; }
        // Event times, rather than timers mutated per frame, make the new
        // structures and fields reversible with the existing 60 Hz history.
        const broken = this.worldTime >= Math.min(o.crumbleAt, o.breakAt);
        if (broken && !o.broken && !rewinding) { this.emit(o.x, o.y + o.h / 2, o.kind === 'breakWall' ? '#b5f1ee' : THEMES[o.biome].edge, 22); this.sound(o.kind === 'breakWall' ? 'break' : 'crumble'); }
        o.broken = broken; o.used = this.worldTime >= o.usedAt;
        if (rewinding) {
          if (this.worldTime < o.breakAt) o.breakAt = Infinity;
          if (this.worldTime < o.crumbleAt - 1) o.crumbleAt = Infinity;
          if (this.worldTime < o.usedAt) o.usedAt = Infinity;
          if (this.worldTime < o.boostAt) o.boostAt = Infinity;
          if (this.worldTime < o.triggerAt) o.triggerAt = Infinity;
        }
        if (o.kind === 'geyser') {
          if (!Number.isFinite(o.triggerAt) && !rewinding && o.x - this.distance < this.speed * 2) o.triggerAt = this.worldTime;
          const age = this.worldTime - o.triggerAt;
          o.warning = age >= 0 && age < 1.5 ? 1.5 - age : 0;
          o.erupting = age >= 1.5 && age < 2.35;
          o.columnHeight = o.erupting ? o.h * clamp(Math.min((age - 1.5) / .08, (2.35 - age) / .12), 0, 1) : 0;
          if (o.erupting && !o.wasErupting && !rewinding) this.emit(o.x, 20, '#ffbd70', 14);
          o.wasErupting = o.erupting;
        }
        if (o.kind === 'fall') {
          // Retain the first event timestamp through rewind. All subsequent
          // warning/drop poses are pure functions of the same world clock.
          if (!Number.isFinite(o.fallStart) && !rewinding && o.fallAnchor - this.distance < this.speed * o.fallLead) o.fallStart = this.worldTime + o.stagger;
          const age = this.worldTime - o.fallStart, drop = Math.max(0, age - o.warningDuration), oldY = o.y;
          o.falling = age >= 0; o.warning = age >= 0 ? Math.max(0, o.warningDuration - age) : 0;
          o.y = Math.max(0, o.homeY - 950 * drop * drop); o.vy = o.y > 0 ? -1900 * drop : 0;
          if (oldY > 0 && !o.y && !rewinding) { this.emit(o.x, 8, '#f0af7a', 14); this.sound('land'); }
        }
        if (o.kind === 'spinner') o.y = o.homeY + o.bounce * .5 * (1 + Math.sin(this.worldTime * o.frequency + o.phase));
      }
      if (!rewinding) for (const o of this.obstacles) {
        if (o.active && o.kind === 'gravityPortal' && !o.used && previousX < o.x && this.distance >= o.x) {
          o.usedAt = this.worldTime; o.used = true; this.flipGravity(o.targetGravity);
        }
      }
      if (!rewinding) {
        // The opposite floor is a physical limit during an inverted section;
        // it cannot grant a free jump while gravity is pulling toward the roof.
        if (this.gravityDir === -1 && this.y < BODY_H) { this.y = BODY_H; this.vy = Math.max(0, this.vy); }
        if (previousGravity === this.gravityDir) this.resolveSupport(previousX, previousY, wasGrounded);
        if (!this.grounded && wasGrounded && previousGravity === this.gravityDir) { this.jumps = Math.max(1, this.jumps); this.coyoteTime = COYOTE_TIME; }
        if ((this.grounded || this.coyoteTime > 0) && this.jumpBuffer > 0) this.tryJump();
        else if (this.grounded && this.slideBuffer > 0 && !this.slideRecovery && !this.slide) this.startSlide();
      }
      const h = this.slide > 0 && this.grounded ? 29 : BODY_H;
      const bodyLow = Math.min(this.y, this.y + this.gravityDir * h), bodyHigh = Math.max(this.y, this.y + this.gravityDir * h);
      for (const o of this.obstacles) {
        if (!o.active || o.broken) continue;
        const dx = o.x - this.distance, overlapX = Math.abs(dx) < (o.w + BODY_W) / 2 - 5;
        const overlap = overlapX && bodyHigh - 4 > o.y && bodyLow + 5 < o.y + (o.kind === 'geyser' ? o.columnHeight : o.h);
        if (o.kind === 'gravityPortal') continue;
        if (o.kind === 'waterBubble' || o.kind === 'updraft') {
          if (!rewinding && overlap) {
            if (o.kind === 'waterBubble') this.bubbleUntil = this.worldTime + .25;
            else if (this.skin.skill === 'glide' && this.jumpHeld && this.worldTime < o.boostAt) {
              o.boostAt = this.worldTime; this.vy = Math.max(this.vy, 980); this.grounded = false; this.support = -2;
              this.coyoteTime = 0;
              this.jumps = Math.max(1, this.jumps); this.emit(this.distance, this.y + 20, this.skin.accent, 18); this.sound('pad');
            }
          }
          continue;
        }
        if (o.kind === 'pad') {
          // A short upward field catches a normal jump too, so jumping just
          // before a pad cannot strand the player in front of its paired train.
          if (!o.used && !rewinding && overlapX && this.y >= o.y - 8 && this.y < o.y + 155) {
            o.used = true; o.usedAt = this.worldTime; this.vy = Math.sqrt(Math.max(0, o.launchVelocity * o.launchVelocity - 2 * GRAVITY * Math.max(0, this.y - o.y)));
            this.grounded = false; this.support = -2; this.coyoteTime = 0;
            // A forced launch ends the manual hop rhythm. Keep the authored
            // pad-chain ballistics at their normal speed, not a stacked boost.
            this.bhopCombo = 0; this.bhopWindow = 0;
            this.jumps = 1; this.slide = this.slideBuffer = 0; this.padFlash = .6;
            this.emit(o.x, o.y + 14, '#96f6ff', 22); this.sound('pad');
          }
          continue;
        }
        if (rewinding || o.topOnly || o.kind === 'geyser' && !o.erupting) continue;
        if (!o.hit && overlap) {
          if (o.kind === 'breakWall' && this.effect === 'airDash') { o.breakAt = this.worldTime; o.broken = true; this.emit(o.x, o.y + o.h / 2, '#b5f1ee', 26); this.screenShake(.16, 5); this.sound('break'); }
          else this.hit(o);
        }
        if (this.state !== 'playing') return;
      }
      for (const c of this.coins) {
        if (!c.active) continue;
        const coinPreviousX = c.x;
        if (c.anchor && !c.detached) c.x = c.anchor.x + c.offsetX;
        if (c.x < this.distance - 1350) { c.active = false; continue; }
        if (c.collected || rewinding) continue;
        let dx = c.x - this.distance, dy = c.y - this.y - this.gravityDir * h / 2;
        if ((this.effect === 'magnet' || this.magnetTime > 0) && Math.hypot(dx, dy) < 230) { c.detached = true; c.x -= dx * Math.min(1, dt * 12); c.y -= dy * Math.min(1, dt * 12); dx = c.x - this.distance; dy = c.y - this.y - this.gravityDir * h / 2; }
        const before = coinPreviousX - previousX, fraction = clamp(before / (before - dx || 1), 0, 1);
        const sweptX = before + (dx - before) * fraction;
        const sweptY = c.y - (previousY + (this.y - previousY) * fraction) - this.gravityDir * h / 2;
        if (Math.abs(sweptX) < 32 && Math.abs(sweptY) < h / 2 + 13) {
          c.collected = true; this.gold += Math.max(1, Math.round(this.api.coinMultiplier())); this.coinStreak++;
          this.emit(c.x, c.y, '#ffdc83', 5); this.sound('coin');
        }
      }
      for (const p of this.pickups) {
        if (!p.active) continue;
        if (p.x < this.distance - 1350) { p.active = false; continue; }
        if (!p.collected && !this.rewindTime && Math.abs(p.x - this.distance) < 39 && Math.abs(p.y - this.y - this.gravityDir * h / 2) < h / 2 + 20) {
          p.collected = true;
          if (p.kind === 'magnet') this.magnetTime = 8;
          this.emit(p.x, p.y, '#a8f3f1', 18); this.sound('pickup'); this.refreshHud();
        }
      }
      for (const p of this.particles) if (p.life > 0) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= p.gravity * dt; }
      this.dustClock += motionDt; if (this.dustClock > (this.slide > 0 ? .035 : .1) && this.grounded) { this.dustClock = 0; this.emit(this.distance - 18, this.y + this.gravityDir * (this.slide > 0 ? 3 : 6), THEMES[this.biome].edge, this.slide > 0 ? 2 : 1); }
      this.trailClock += dt;
      if (this.trailClock > .035 && (this.speed > 455 || this.vy * this.gravityDir < -650 || this.effectTime > 0 || this.worldTime < this.iceUntil || this.skin.skill === 'glide' && this.jumpHeld && !this.grounded)) {
        this.trailClock = 0; this.emit(this.distance - 22, this.y + this.gravityDir * h * .55, this.skin.accent, 1, true);
      }
      const cameraTarget = this.gravityDir === -1 ? 0 : Math.max(0, this.y - 225);
      this.cameraY = cameraTarget + (this.cameraY - cameraTarget) * Math.exp(-dt * 10);
      this.score = Math.floor(this.scoreBase) + this.gold * 10;
      if (!rewinding) this.historyClock += dt;
      if (this.historyClock >= 1 / 60 && !rewinding) {
        this.historyClock -= 1 / 60; const i = this.historyIndex * HISTORY_STRIDE;
        this.history[i] = this.distance; this.history[i + 1] = this.y; this.history[i + 2] = this.vy; this.history[i + 3] = this.worldTime;
        this.history[i + 4] = this.jumps; this.history[i + 5] = this.support;
        this.history[i + 6] = this.iceUntil; this.history[i + 7] = this.bubbleUntil; this.history[i + 8] = this.coyoteTime;
        this.history[i + 9] = this.gravityDir;
        this.history[i + 10] = this.bhopCombo; this.history[i + 11] = this.bhopWindow;
        this.historyIndex = (this.historyIndex + 1) % HISTORY; this.historyCount = Math.min(HISTORY - 1, this.historyCount + 1);
      }
    }
    resolveSupport(previousX, previousY, wasGrounded) {
      const dir = this.gravityDir;
      if (this.vy * dir > 0) return;
      let top = dir === 1 ? 0 : CEILING, support = dir === 1 ? -1 : -3;
      for (let i = 0; i < this.obstacles.length; i++) {
        const o = this.obstacles[i]; if (!o.active || !o.solidTop || o.broken) continue;
        const height = dir === 1 ? o.y + o.h : o.y;
        if ((height - top) * dir < 0 || (previousY - height) * dir < -.5 || (this.y - height) * dir > .5) continue;
        // Sweep the feet across the top. Retaining support requires current X
        // overlap; a newly landed edge uses the interpolated time of impact.
        const t = (previousY - height) * dir > .5 ? clamp((previousY - height) * dir / Math.max(.001, (previousY - this.y) * dir), 0, 1) : 1;
        const x = previousX + (this.distance - previousX) * t;
        if (Math.abs(o.x - x) >= (o.w + BODY_W) / 2 - 5 || Math.abs(o.x - this.distance) >= (o.w + BODY_W) / 2 - 5) continue;
        top = height; support = i;
      }
      if ((this.y - top) * dir > .5) return;
      const impact = -this.vy * dir;
      this.y = top; this.vy = 0; this.jumps = 0; this.grounded = true; this.support = support; this.coyoteTime = 0;
      if (!wasGrounded) this.bhopWindow = BHOP_WINDOW;
      if (!wasGrounded && impact > 150) {
        this.squash = .22; this.emit(this.distance, top + dir * 4, THEMES[this.biome].edge, 6); this.sound('land');
        if (impact > 760) this.screenShake(.2, Math.min(7, impact / 180));
      }
      const o = support >= 0 ? this.obstacles[support] : null;
      if (o?.kind === 'crumblingBlock' && !Number.isFinite(o.crumbleAt)) o.crumbleAt = this.worldTime + 1;
      if (o?.kind === 'icePlatform' && !wasGrounded) { this.iceUntil = this.worldTime + .8; this.emit(this.distance, top + 4, '#bcf3ff', 12); }
    }
    flipGravity(target) {
      if (target !== 1 && target !== -1 || target === this.gravityDir) return;
      const h = this.slide > 0 && this.grounded ? 29 : BODY_H;
      const center = this.y + this.gravityDir * h / 2;
      this.gravityDir = target; this.y = center - target * BODY_H / 2; this.vy = -this.vy;
      this.grounded = false; this.support = -2; this.jumps = 1; this.coyoteTime = 0;
      this.bhopWindow = 0;
      this.slide = this.slidePose = this.slideBuffer = this.slideRecovery = this.jumpBuffer = 0;
      this.emit(this.distance, center, target === -1 ? '#bdabff' : '#9be9c5', 16); this.sound('gravity');
    }
    explodePlayer() {
      // Fixed pool and analytic ballistics use the presentation clock only.
      // No timer/RAF or per-frame object creation, and rewind's clock stays still.
      const h = this.slide > 0 && this.grounded ? 29 : BODY_H;
      for (let i = 0; i < this.voxels.length; i++) {
        const v = this.voxels[i], seed = this.worldTime * 73 + i * 9.31;
        Object.assign(v, { active: true, x: this.distance + (i % 3 - 1) * 13, y: this.y + this.gravityDir * (8 + Math.floor(i / 3) * (h - 12) / 6),
          vx: (hash(seed) - .45) * 620, vy: (100 + hash(seed + 3) * 650) * this.gravityDir,
          spin: (hash(seed + 7) - .5) * 18, size: 7 + hash(seed + 11) * 6, color: i % 4 ? '#89cda7' : this.skin.accent, gravity: this.gravityDir });
      }
    }
    hit(o) {
      if (this.invulnerable > 0 || this.rewindTime > 0 || this.effect === 'phaseShift' || this.effect === 'airDash') return;
      if (this.state !== 'playing') return;
      o.hit = true; this.health = 0; this.shake = 1; this.coinStreak = 0;
      this.bhopCombo = 0; this.bhopWindow = 0;
      this.sound('hit');
      if (this.skin.skill === 'revive' && !this.reviveUsed) {
        this.health = MAX_HEALTH; this.reviveUsed = true; this.invulnerable = 3;
        this.screenShake(.3, 7); this.emit(this.distance, this.y + this.gravityDir * 35, '#eaffba', 28); this.sound('revive');
      } else {
        this.clearInputs();
        this.deathClock = 0; this.shakeTime = 0; this.shakeDuration = DEATH_SHAKE; this.shakeIntensity = 13;
        this.explodePlayer();
        this.setState('dying');
      }
      this.refreshHud();
    }
    spawnSample(index, salt) { return hash(this.spawnSeed + index * 131 + salt * 37.17); }
    patternFamily(kind) {
      if (['pad', 'padMotor', 'wideLava', 'breakWall', 'padChain'].includes(kind)) return 'launch';
      if (['car', 'carIn', 'motorIn'].includes(kind)) return 'traffic';
      if (['beam', 'beamJump', 'jumpSlide'].includes(kind)) return 'slide';
      if (['fall', 'fallPair'].includes(kind)) return 'fall';
      if (['block', 'ice', 'lava', 'spinner', 'hopPair'].includes(kind)) return 'jump';
      return kind;
    }
    choosePattern(index) {
      if (!this.patternBag.length) {
        this.patternBag = PATTERNS.slice();
        for (let j = this.patternBag.length - 1; j > 0; j--) {
          const k = Math.floor(this.spawnSample(index, 900 + j) * (j + 1));
          [this.patternBag[j], this.patternBag[k]] = [this.patternBag[k], this.patternBag[j]];
        }
        if (this.patternBag.at(-1) === this.lastPattern) this.patternBag.reverse();
      }
      // Avoid clusters of visually identical families (five different pad
      // phrases used to look like the same obstacle repeated five times).
      let pick = this.patternBag.length - 1;
      for (let j = pick; j >= 0; j--) if (!this.recentFamilies.includes(this.patternFamily(this.patternBag[j]))) { pick = j; break; }
      const kind = this.patternBag.splice(pick, 1)[0]; this.lastPattern = kind;
      this.recentFamilies.push(this.patternFamily(kind)); if (this.recentFamilies.length > 2) this.recentFamilies.shift();
      return kind;
    }
    jumpClearTime(height, velocity = JUMP) {
      return 2 * Math.sqrt(Math.max(0, velocity * velocity - 2 * GRAVITY * (height + 8))) / GRAVITY;
    }
    obstacleVariant(kind, i, salt, minSpeed, maxSpeed) {
      const r = n => this.spawnSample(i, salt + n), o = { phrase: i, speedMod: .35 + r(1) * .30,
        spinSpeed: (2 + r(2) * 5) * (r(3) < .5 ? -1 : 1), phase: r(4) * Math.PI * 2 };
      if (kind === 'block') { o.w = 58 + r(5) * 52; o.h = 36 + r(6) * 28; }
      if (kind === 'car' || kind === 'motor') {
        o.w = kind === 'car' ? 96 + r(5) * 36 : 64 + r(5) * 30;
        o.h = kind === 'car' ? 50 + r(6) * 16 : 38 + r(6) * 16;
        o.activationDistance = Math.max(900, maxSpeed * 1.35);
        // Offset the spawn position so different closing speeds still meet at
        // the reserved encounter slot, rather than overtaking its neighbour.
        o.incomingOffset = o.speedMod * o.activationDistance;
        o.spawnSpeed = this.speed; o.vx = -o.spawnSpeed * o.speedMod;
      }
      if (kind === 'beam') {
        o.y = 35 + r(5) * 18;
        o.w = 108 + r(6) * (Math.min(260, (SLIDE_DURATION - .18) * minSpeed - BODY_W - 24) - 108);
      }
      if (kind === 'fall') {
        o.w = 52 + r(5) * 16; o.h = 44 + r(6) * 14; o.y = 420 + r(7) * 90;
        o.warningDuration = .5 + r(8) * .4;
        o.fallLead = o.warningDuration + Math.sqrt(2 * o.y / 1900) + .65;
      }
      if (kind === 'spinner') {
        o.w = 56 + r(5) * 20; o.h = 48 + r(6) * 12;
        o.bounce = r(7) < .45 ? 8 + r(8) * 12 : 0; o.frequency = 1.8 + r(9) * 1.8;
      }
      if (kind === 'lava' || kind === 'ice') {
        o.h = kind === 'lava' ? 12 + r(5) * 6 : 28 + r(5) * 16;
        const cap = minSpeed * this.jumpClearTime(o.h) - BODY_W - 32;
        o.w = kind === 'lava' ? 90 + r(6) * (Math.min(245, cap) - 90) : 76 + r(6) * (Math.min(200, cap) - 76);
      }
      if (kind === 'train') { o.w = 140 + r(5) * 60; o.h = 90 + r(6) * 22; }
      if (kind === 'pad') { o.w = 78 + r(5) * 32; o.launchVelocity = 1060 + r(6) * 60; }
      // Ground jump geometry has a non-empty clearance interval even with no
      // glove. The worst-case bounce height is used, not its current phase.
      if (['block', 'car', 'motor', 'spinner'].includes(kind)) {
        const cap = minSpeed * this.jumpClearTime(o.h + (o.bounce || 0)) - BODY_W - 32;
        if (o.w > cap) { o.w = cap; this.plannerClamps++; }
      }
      return o;
    }
    placePadHazard(pad, hazard, minSpeed, maxSpeed, mix) {
      const v = pad.launchVelocity, height = hazard.y + hazard.h + 10 - pad.y;
      const root = Math.sqrt(Math.max(0, v * v - 2 * GRAVITY * height));
      const rise = (v - root) / GRAVITY, fall = (v + root) / GRAVITY;
      const lead = (pad.w + BODY_W) / 2 - 5, stepMargin = maxSpeed * STEP;
      const cap = Math.min(minSpeed * fall - maxSpeed * rise - BODY_W - 32 - stepMargin,
        -lead + minSpeed * fall - BODY_W / 2 - 34 - pad.w / 2);
      if (hazard.w > cap) { hazard.w = Math.max(40, cap); this.plannerClamps++; }
      const half = (hazard.w + BODY_W) / 2;
      const lo = Math.max(-lead + stepMargin + maxSpeed * rise + half + 16, (pad.w + hazard.w) / 2 + 18);
      const hi = -lead + minSpeed * fall - half - 16;
      hazard.x = hazard.homeX = hazard.spawnX = pad.x + lo + Math.max(0, hi - lo) * mix;
      hazard.safePad = { rise, fall, minSpeed, maxSpeed, lower: lo, upper: hi };
    }
    spawnAhead() {
      // The only entropy call is here, in the generation phase. A run seed and
      // immutable instance parameters survive rewind; update/draw never roll.
      if (this.spawnSeed === null) this.spawnSeed = Math.floor(Math.random() * 0x100000000);
      const horizon = Math.max(2800, (this.width || 1200) + 1000);
      while (this.nextObstacle < this.distance + horizon) {
        const i = this.spawnIndex, x = this.nextObstacle, biome = Math.floor(x / SECTION) % THEMES.length;
        const base = BASE_SPEED + (TOP_SPEED - BASE_SPEED) * (1 - Math.exp(-this.elapsed / 85));
        // Eight seconds of curve growth, max bhop and ice speed are reserved.
        // Time-slow scales world motion/ballistics together; dash is immune.
        const minSpeed = base, maxSpeed = Math.min(TOP_SPEED, BASE_SPEED + (TOP_SPEED - BASE_SPEED) * (1 - Math.exp(-(this.elapsed + 8) / 85))) * (1 + BHOP_SPEED_CAP) * 1.22;
        const s = salt => this.spawnSample(i, salt), stepCount = 3 + Math.floor(s(201) * 3);
        if (this.obstacles.reduce((n, o) => n + !o.active, 0) < 6) break;
        let kind = this.choosePattern(i);
        if (kind === 'field') kind = biome === 3 ? 'geyser' : biome === 5 ? 'waterBubble' : biome === 1 ? 'icePlatform' : 'updraft';
        this.spawnIndex++;
        const add = (type, at, incoming = false, extra, salt = 0) => this.addObstacle(type, at, biome, incoming,
          Object.assign(this.obstacleVariant(type, i, salt, minSpeed, maxSpeed), extra));
        const occupied = new Set(this.obstacles.filter(o => o.active));
        const paceAtEncounter = Math.min(TOP_SPEED, BASE_SPEED + (TOP_SPEED - BASE_SPEED) * (1 - Math.exp(-(this.elapsed + Math.max(0, x - this.distance) / base) / 85)));
        let end = x;
        if (kind === 'stairs') {
          const pace = Math.min(TOP_SPEED, this.speed + 8), spacing = pace * .72, width = pace * .35;
          for (let j = 0; j < stepCount; j++) {
            const sx = x + j * spacing, height = (j + 1) * 56;
            add('stepBlock', sx, false, { w: width, h: height, y: 0 }, j * 23);
            this.addCoin(sx, height + BODY_H * .85);
          }
          end = x + (stepCount - 1) * spacing + width / 2 + maxSpeed * 1.15;
        } else if (kind === 'padChain') {
          // Author each launch from its actual ballistic landing point; fixed
          // platform coordinates overshot the intermediate pads at high speed.
          let at = x - 120;
          for (let j = 0; j < 3; j++) {
            const pad = this.addObstacle('pad', at, biome, false, { y: j ? 200 : 0 });
            const lead = (pad.w + BODY_W) / 2 - 5;
            const flight = (PAD_JUMP + Math.sqrt(PAD_JUMP * PAD_JUMP - 2 * GRAVITY * (200 - pad.y))) / GRAVITY;
            const land = at - lead + paceAtEncounter * flight, center = land + paceAtEncounter * .18, width = paceAtEncounter * .65;
            this.addObstacle(j === 1 ? 'crumblingBlock' : 'platform', center, biome, false, { w: width, y: j === 1 ? 172 : 176 });
            for (const part of [.35, .65]) {
              const t = flight * part;
              this.addCoin(at - lead + paceAtEncounter * t, pad.y + PAD_JUMP * t - GRAVITY * t * t / 2 + BODY_H / 2);
            }
            at = center + paceAtEncounter * .16;
            end = center + width / 2 + maxSpeed * .9;
          }
        } else if (kind === 'gravityRun') {
          const spacing = Math.max(470, maxSpeed * (SLIDE_DURATION + SLIDE_RECOVERY + .16));
          const finish = x + 850 + 2 * spacing + maxSpeed * .75;
          add('gravityPortal', x, false, { targetGravity: -1, ceilingEnd: finish });
          add('gravityPortal', finish, false, { targetGravity: 1 });
          for (let j = 0; j < 3; j++) add('saw', x + 850 + j * spacing, false, { y: 205, homeY: 205, amplitude: 70, phase: j * 1.8 }, j * 19);
          for (let j = 0; j < 4; j++) this.addCoin(x + 600 + j * (finish - x - 850) / 3, CEILING - 30);
          end = finish + maxSpeed * 1.3;
        } else if (['pad', 'padMotor', 'wideLava', 'breakWall'].includes(kind)) {
          const pad = add('pad', x), type = kind === 'wideLava' ? 'lava' : kind === 'breakWall' ? 'breakWall' : 'train';
          const hazard = add(type, x + 220, false, kind === 'wideLava' ? { w: 360 + s(61) * 260 } : undefined, 41);
          this.placePadHazard(pad, hazard, minSpeed, maxSpeed, s(62));
          const airTime = 2 * pad.launchVelocity / GRAVITY, lead = (pad.w + BODY_W) / 2 - 5;
          end = x - lead + maxSpeed * (airTime + .22);
          if (kind === 'padMotor') {
            // Reserve the entire pad flight before the next read/jump; the
            // incoming motor is already baked, not spawned on the landing.
            const motor = add('motor', end + maxSpeed * (.26 + s(63) * .15), true, undefined, 71);
            end = motor.homeX + motor.w / 2 + maxSpeed * .52;
          }
          this.padCoins(pad, paceAtEncounter, 4);
        } else if (kind === 'beamJump') {
          const beam = add('beam', x), spin = add('spinner', x, false, undefined, 31);
          const clearance = spin.h + spin.bounce + 10, rise = (JUMP - Math.sqrt(JUMP * JUMP - 2 * GRAVITY * clearance)) / GRAVITY;
          spin.x = spin.homeX = spin.spawnX = x + beam.w / 2 + BODY_W + spin.w / 2 + maxSpeed * rise + 34 + s(79) * 42;
          end = spin.x + (spin.w + BODY_W) / 2 + maxSpeed * .38;
          this.addCoin(x, 16); this.jumpCoins(spin, paceAtEncounter, 1);
        } else if (kind === 'jumpSlide') {
          const first = add(s(141) < .5 ? 'block' : 'ice', x), beam = add('beam', x, false, undefined, 31);
          beam.x = beam.homeX = beam.spawnX = x + maxSpeed * (2 * JUMP / GRAVITY - .38 + .24) + (beam.w + BODY_W) / 2;
          end = beam.x + (beam.w + BODY_W) / 2 + maxSpeed * .3;
          this.jumpCoins(first, paceAtEncounter, 2); this.addCoin(beam.x, 16);
        } else if (kind === 'hopPair') {
          const first = add(s(142) < .5 ? 'block' : 'ice', x), second = add(s(143) < .5 ? 'spinner' : 'block', x, false, undefined, 31);
          second.x = second.homeX = second.spawnX = x + Math.max(maxSpeed * .98, (first.w + second.w) / 2 + maxSpeed * .72);
          end = second.x + (second.w + BODY_W) / 2 + maxSpeed * .4;
          this.jumpCoins(first, paceAtEncounter, 1); this.jumpCoins(second, paceAtEncounter, 1);
        } else if (kind === 'fallPair') {
          const first = add('fall', x), second = add('fall', x, false, undefined, 31);
          first.h = Math.min(50, first.h); second.h = Math.min(50, second.h);
          first.w = Math.min(64, first.w); second.w = Math.min(64, second.w);
          const span = minSpeed * this.jumpClearTime(Math.max(first.h, second.h)) - BODY_W - 32;
          const separation = Math.min((first.w + second.w) / 2 + BODY_W + 8 + s(81) * 10, span - (first.w + second.w) / 2);
          second.x = second.homeX = second.spawnX = x + separation;
          second.stagger = .14 + s(82) * .16; first.fallAnchor = second.fallAnchor = x;
          const lead = Math.max(first.warningDuration, second.warningDuration) + Math.sqrt(2 * Math.max(first.homeY, second.homeY) / 1900) + second.stagger + .65;
          first.fallLead = second.fallLead = lead;
          end = second.x + (second.w + BODY_W) / 2 + maxSpeed * .38;
          this.jumpCoins({ x: x + separation / 2, incoming: false }, paceAtEncounter, 2);
        } else {
          const incoming = kind.endsWith('In'); if (incoming) kind = kind.slice(0, -2);
          const o = add(kind, x, incoming);
          const maxHeight = o.h + (o.bounce || 0);
          end = x + (o.w + BODY_W) / 2 + maxSpeed * (kind === 'beam' ? .12 : incoming ? .52 : maxHeight > 70 ? .46 : .38);
          if (s(91) > .34) {
            const coins = s(92) < .5 ? 2 : 3;
            if (kind === 'beam') for (let j = 0; j < coins; j++) this.addCoin(x + (j / (coins - 1) - .5) * Math.max(40, o.w - 32), 16);
            else if (['waterBubble', 'updraft', 'geyser', 'saw'].includes(kind)) for (let j = 0; j < 2; j++) this.addCoin(x - o.w / 2 - 90 - j * 75, 30);
            else if (kind === 'icePlatform') this.addCoin(x, o.y + o.h + BODY_H / 2);
            else this.jumpCoins(o, paceAtEncounter, coins);
          }
        }
        const phrase = this.obstacles.filter(o => o.active && !occupied.has(o));
        for (const o of phrase) {
          o.phrase = i;
          if (o.incoming) {
            // A vehicle owns its entire approach corridor, not just homeX.
            // Stop its analytic path behind the encounter before it can drive
            // through a previous structure. It is already behind the player.
            o.motionMinX = o.homeX - minSpeed * .28;
          }
          end = Math.max(end, o.spawnX + o.w / 2 + (o.incoming ? maxSpeed * .35 : 0));
        }
        this.validateCoins(phrase);
        // Reserve recovery and the next action's take-off/slide lead. Unlike
        // rigid slots this is based on the actual phrase extent and speed.
        this.nextObstacle = end + 100 + maxSpeed * (.22 + s(97) * .18);
        if (s(98) < .085) {
          const p = this.pickups.find(p => !p.active);
          if (p) Object.assign(p, { active: true, collected: false, kind: 'magnet', x: x - 260, y: 90 });
        }
      }
    }
    addObstacle(kind, x, biome = this.biome, incoming = false, options) {
      const o = this.obstacles.find(o => !o.active); if (!o) return null;
      const [w, h, y] = HAZARDS[kind];
      const offset = incoming ? (options?.incomingOffset ?? 216) : 0;
      Object.assign(o, { active: true, kind, x: x + offset, homeX: x, spawnX: x + offset, incoming, motionStart: Infinity, motionMinX: -Infinity, vx: incoming ? -this.speed * .4 : 0, w, h, y, biome, vy: 0, warning: 0, falling: false, hit: false, used: false,
        solidTop: ['block', 'stepBlock', 'platform', 'crumblingBlock', 'icePlatform'].includes(kind), topOnly: ['platform', 'crumblingBlock', 'icePlatform'].includes(kind),
        homeY: y, amplitude: 80, frequency: 2.2 + hash(x) * .6, phase: hash(x + 3) * Math.PI * 2, targetGravity: -1, ceilingEnd: 0,
        phrase: -1, speedMod: .4, spawnSpeed: this.speed, activationDistance: 900, spinSpeed: 3, bounce: 0, launchVelocity: PAD_JUMP,
        fallStart: Infinity, fallAnchor: x, fallLead: 2.05, warningDuration: .68, stagger: 0, safePad: null,
        crumbleAt: Infinity, breakAt: Infinity, usedAt: Infinity, boostAt: Infinity, triggerAt: Infinity, broken: false, erupting: false, wasErupting: false, columnHeight: 0 }, options);
      o.homeY = Number.isFinite(options?.homeY) ? options.homeY : o.y;
      if (!incoming) o.vx = 0;
      return o;
    }
    jumpCoins(o, pace, count) {
      const closing = pace + (o.incoming ? Math.abs(o.vx) : 0);
      for (let j = 0; j < count; j++) {
        const t = count === 1 ? .38 : .24 + j / (count - 1) * .28;
        this.addCoin(o.x + closing * (t - .38), JUMP * t - GRAVITY * t * t / 2 + BODY_H / 2, o.incoming ? o : null);
      }
    }
    padCoins(pad, pace, count) {
      const launchX = pad.x - (pad.w + BODY_W) / 2 + 5, air = 2 * pad.launchVelocity / GRAVITY;
      for (let j = 0; j < count; j++) {
        const t = air * (.22 + j / (count - 1) * .5);
        this.addCoin(launchX + pace * t, pad.y + pad.launchVelocity * t - GRAVITY * t * t / 2 + BODY_H / 2);
      }
    }
    validateCoins(phrase) {
      // Coins guide an already-authored route. Never invite the player into a
      // collider; future fall/bounce extents count even before they animate.
      for (const c of this.coins) {
        if (!c.active || c.collected) continue;
        for (const o of phrase) {
          if (['pad', 'gravityPortal', 'updraft', 'waterBubble'].includes(o.kind)) continue;
          const x = c.anchor === o ? o.homeX + c.offsetX : c.x;
          const ox = o.incoming ? o.homeX : o.x, low = o.kind === 'fall' ? 0 : o.y;
          const high = o.kind === 'spinner' ? o.homeY + o.h + o.bounce : low + o.h;
          if (Math.abs(x - ox) < o.w / 2 + 14 && c.y > low - 14 && c.y < high + 14) { c.active = false; break; }
        }
      }
    }
    addCoin(x, y, anchor = null) {
      const c = this.coins.find(c => !c.active);
      if (c) Object.assign(c, { active: true, collected: false, x, y, anchor, offsetX: anchor ? x - anchor.x : 0, detached: false });
    }
    emit(x, y, color, count, trail = false) {
      for (let n = 0; n < count; n++) {
        const p = this.particles.find(p => p.life <= 0); if (!p) break;
        const seed = this.elapsed * 99 + n * 3.17;
        const life = trail ? .32 : .35 + hash(seed) * .35;
        Object.assign(p, { x, y, color, life, maxLife: life, trail, gravity: trail ? 0 : 280, vx: trail ? -45 : (hash(seed + 4) - .75) * 170, vy: trail ? 0 : 40 + hash(seed + 7) * 170, size: trail ? 9 : 2 + hash(seed + 8) * 4 });
      }
    }
    refreshHud() {
      this.els.distance.textContent = `${Math.floor(this.peak / 10)} m`;
      this.els.score.textContent = this.score;
      this.els.coins.textContent = `◈ ${this.gold}`;
      this.els.hearts.textContent = this.health > 0 ? '♥' : '♡';
      this.els.biome.querySelector('span').textContent = `${String(Math.floor(this.peak / SECTION) + 1).padStart(2, '0')} / ${this.text(THEMES[this.biome].key)}`;
      this.els.biome.querySelector('b').style.transform = `scaleX(${this.distance % SECTION / SECTION})`;
      this.els.biome.querySelector('em').textContent = `${Math.floor(this.distance % SECTION / SECTION * 100)}%`;
      this.els.biome.title = this.text(THEMES[this.biome].key);
      this.els.skill.querySelector('strong').textContent = this.cooldown > 0 ? Math.ceil(this.cooldown) : this.skin.skill === 'revive' ? (this.reviveUsed ? '—' : '♥') : '✦';
      this.els.skill.classList.toggle('is-ready', this.cooldown === 0 && !this.reviveUsed);
      const cooldownDuration = this.skin.skill === 'airDash' ? 7 : this.skin.skill === 'timeRewind' ? 14 : 12;
      this.els.skill.style.setProperty('--ready', clamp(1 - this.cooldown / cooldownDuration, 0, 1));
      this.slideButton.classList.toggle('is-sliding', this.slide > 0);
      this.slideButton.style.setProperty('--slide', this.slide > 0 ? this.slide / SLIDE_DURATION : 0);
      this.jumpButton.classList.toggle('is-gliding', this.isGliding());
      this.els.bhop.hidden = this.bhopCombo <= 0;
      this.els.bhop.textContent = `↗ ×${this.bhopCombo}`; this.els.bhop.title = this.text('bhopCombo');
      const magnet = Math.max(this.magnetTime, this.effect === 'magnet' ? this.effectTime : 0);
      this.els.magnet.hidden = magnet <= 0; this.els.magnet.textContent = `∩ ${Math.ceil(magnet)}s`; this.els.magnet.title = this.text('handSkill_magnet');
    }
    resize() {
      const rect = this.root.getBoundingClientRect(), ratio = Math.min(global.devicePixelRatio || 1, this.api.mobile ? 1.5 : 2);
      this.width = Math.max(800, rect.width / Math.max(1, rect.height) * 600); this.height = 600;
      this.scale = Math.min(rect.width / this.width, rect.height / this.height); this.offsetY = (rect.height - this.height * this.scale) / 2;
      // Extend scenery into portrait letterbox space without changing logical physics/framing.
      this.viewTop = -this.offsetY / this.scale; this.viewBottom = this.height - this.viewTop;
      this.canvas.width = Math.round(rect.width * ratio); this.canvas.height = Math.round(rect.height * ratio); this.dpr = ratio;
      this.px = Math.min(260, this.width * .23); this.ground = 465; this.draw();
    }
    disposeScenery(index) {
      const layer = this.layers.get(index); if (!layer) return;
      for (const tiles of [layer.far, layer.near]) {
        for (const tile of tiles.values()) tile.width = tile.height = 1;
        tiles.clear();
      }
      this.layers.delete(index);
    }
    prepareTheme(index) {
      if (this.layers.has(index)) return;
      const retain = index === this.biome ? this.previousBiome : this.biome;
      for (const key of this.layers.keys()) if (key !== retain && key !== index) this.disposeScenery(key);
      const t = THEMES[index], skyPaint = this.ctx.createLinearGradient(0, 0, 0, 600);
      skyPaint.addColorStop(0, t.sky); skyPaint.addColorStop(1, t.horizon);
      this.layers.set(index, { far: new Map(), near: new Map(), skyPaint });
      // Bake only the visible region plus one ahead, before this biome is shown.
      for (const name of ['far', 'near']) {
        const scroll = this.distance * (name === 'far' ? .12 : .32);
        const first = Math.floor(scroll / SCENERY_TILE), last = Math.floor((scroll + (this.width || 1200)) / SCENERY_TILE) + 1;
        for (let tile = first; tile <= last; tile++) this.sceneryTile(index, name, tile);
      }
    }
    sceneryTile(index, name, tileIndex) {
      const tiles = this.layers.get(index)[name];
      if (tiles.has(tileIndex)) return tiles.get(tileIndex);
      const tile = document.createElement('canvas'); tile.width = SCENERY_TILE; tile.height = SCENERY_HEIGHT;
      const f = tile.getContext('2d'), n = f, t = THEMES[index];
      const start = tileIndex * SCENERY_TILE, end = start + SCENERY_TILE;
      const sample = value => hash(value + index * 8191);
      if (name === 'far') {
      if (['forest', 'sky'].includes(t.type)) {
        f.fillStyle = '#fffbe6'; f.globalAlpha = .5;
        for (let i = Math.floor(start / 325) - 2; i <= Math.ceil(end / 325) + 2; i++) {
          const x = i * 325 + 35 + sample(i + 19) * 140 - start, y = 75 + sample(i + 8) * 140;
          f.beginPath(); f.ellipse(x, y, 62, 13, 0, 0, Math.PI * 2); f.ellipse(x + 27, y - 9, 27, 21, 0, 0, Math.PI * 2); f.ellipse(x - 19, y - 12, 26, 19, 0, 0, Math.PI * 2); f.fill();
        }
        f.globalAlpha = 1;
      }
      // Global cell coordinates keep shared objects identical on both sides of a tile seam.
      for (let i = Math.floor(start / 310) - 3; i <= Math.ceil(end / 310) + 3; i++) {
        const x = i * 310 + sample(i + 39) * 170 - start, y = 155 + sample(i + 4) * 190;
        const span = 240 + sample(i + 122) * 200, shape = Math.floor(sample(i + 127) * 4);
        if (shape === 0 || t.type === 'forest' && shape === 1) {
          f.fillStyle = t.far; f.beginPath(); f.moveTo(x - span, 470); f.bezierCurveTo(x - span * .6, y + 40, x - 40, y, x + 30, y + 30); f.bezierCurveTo(x + 140, y + 65, x + span * .7, 390, x + span, 470); f.fill();
        } else {
          poly(f, [x - span, 470, x - 50, y + 70, x + 20, y, x + 95, y + 55, x + span, 470], t.far);
          f.globalAlpha = .14; poly(f, [x + 20, y, x + 40, 470, x + span, 470, x + 95, y + 55], '#153646'); f.globalAlpha = 1;
          if (shape === 3 || t.type === 'snow') poly(f, [x + 20, y, x + 95, y + 55, x + 44, y + 42, x + 15, y + 61, x - 24, y + 44], t.type === 'lava' ? '#eb9874' : t.type === 'snow' || t.type === 'sky' ? '#d7e7db' : t.type === 'city' ? '#45506c' : t.type === 'water' ? '#76aeb4' : '#92b591');
        }
      }
      // Sparse, large landmarks establish distinct vistas. They live in the
      // same bounded tile cache; no per-frame geometry or Canvas allocation.
      for (let i = Math.floor(start / 1700) - 1; i <= Math.ceil(end / 1700) + 1; i++) {
        const x = i * 1700 + 250 + sample(i + 817) * 700 - start, variant = Math.floor(sample(i + 829) * 3);
        f.save(); f.globalAlpha = .55;
        if (t.type === 'forest' || t.type === 'water') {
          if (variant === 0) {
            f.fillStyle = '#85c3b4'; f.beginPath(); f.ellipse(x, 454, 230, 20, 0, 0, Math.PI * 2); f.fill();
            f.strokeStyle = '#d6e9ce'; f.lineWidth = 3; for (let j = 0; j < 4; j++) { f.beginPath(); f.moveTo(x - 130 + j * 28, 444 + j * 7); f.lineTo(x + 120 - j * 18, 444 + j * 7); f.stroke(); }
          } else if (variant === 1) {
            poly(f, [x - 120, 465, x - 85, 275, x + 30, 259, x + 90, 465], t.near);
            f.fillStyle = '#badbd8'; f.fillRect(x - 20, 273, 21, 190); f.fillStyle = '#e1ede0'; f.fillRect(x - 16, 275, 6, 185);
          } else {
            box(f, x - 150, 371, 300, 20, 3, t.near);
            for (let j = -1; j <= 1; j++) box(f, x + j * 110 - 10, 390, 20, 80, 2, t.near);
          }
        } else if (t.type === 'city') {
          const height = 210 + variant * 38;
          box(f, x - 60, 465 - height, 120, height, 4, t.near); box(f, x - 37, 435 - height, 74, 30, 2, t.near);
          f.fillStyle = t.edge; f.fillRect(x - 3, 402 - height, 6, 190); for (let j = 0; j < 5; j++) f.fillRect(x - 48, 490 - height + j * 29, 96, 3);
        } else if (t.type === 'snow') {
          poly(f, [x - 210, 470, x - 68, 299, x + 25, 252, x + 110, 324, x + 240, 470], '#a5bdd6');
          poly(f, [x - 68, 299, x + 25, 252, x + 110, 324, x + 48, 306, x + 5, 335], '#e3eff2');
        } else if (t.type === 'lava') {
          f.strokeStyle = '#e3a278'; f.lineWidth = 9; f.beginPath(); f.moveTo(x - 85, 465); f.lineTo(x - 55, 305); f.lineTo(x + 12, 286); f.lineTo(x + 75, 470); f.stroke();
        } else {
          f.fillStyle = '#f6eddb'; for (let j = 0; j < 3; j++) { f.beginPath(); f.ellipse(x + j * 95, 320 + j * 26, 135, 28, -.1, 0, Math.PI * 2); f.fill(); }
        }
        f.restore();
      }

      } else {
      for (let i = Math.floor(start / 142) - 3; i <= Math.ceil(end / 142) + 3; i++) {
        const zone = Math.floor(i * 142 / 1150), mood = Math.floor(sample(zone + 1901) * 4);
        if (sample(i + 319) > [.28, .82, .5, .66][mood]) continue;
        const x = i * 142 + sample(i + 30) * 90 - start, y = 350 + sample(i + 13) * 95, size = 32 + sample(i + 72) * (mood === 1 ? 82 : 55);
        if (t.type === 'city') {
          box(n, x, y - size * 2, 66, 500 - y + size * 2, 2, t.near, '#566b85');
          for (let a = 0; a < 3; a++) for (let b = 0; b < 9; b++) { n.fillStyle = sample(i * 9 + a * 2 + b) > .4 ? (a % 2 ? '#e774c1' : '#63ddd6') : '#283b59'; n.fillRect(x + 8 + a * 18, y - size * 2 + 14 + b * 19, 8, 9); }
          n.fillStyle = '#73e1dc'; n.fillRect(x + 6, y - size * 2 - 6, 54, 3);
          n.fillStyle = '#29384d'; n.fillRect(x + 30, y - size * 2 - 24, 4, 18);
        } else if (t.type === 'lava' || t.type === 'water') {
          poly(n, [x - 28, 490, x - 18, y, x + 6, y - size, x + 38, y + 12, x + 55, 490], t.near);
          poly(n, [x + 6, y - size, x + 18, y + 18, x + 55, 490, x + 22, 490], t.leaf);
          n.strokeStyle = t.edge; n.lineWidth = 3; n.beginPath(); n.moveTo(x + 6, y + 15); n.lineTo(x + 18, y + 42); n.lineTo(x + 4, y + 90); n.stroke();
          if (t.type === 'water') { n.strokeStyle = '#74c6b2'; n.lineWidth = 7; n.beginPath(); n.moveTo(x - 35, 485); n.bezierCurveTo(x - 70, 440, x - 13, 415, x - 43, 385); n.stroke(); }
        } else if (t.type === 'sky') {
          n.fillStyle = '#f5efe0'; n.beginPath(); n.ellipse(x, y, size, 22, 0, 0, Math.PI * 2); n.ellipse(x + 24, y - 12, size * .65, 30, 0, 0, Math.PI * 2); n.fill();
          if (i % 3 === 0) { box(n, x, y + 40, 28, 120, 4, '#d8d2b7', '#f0e8ce'); box(n, x - 7, y + 34, 42, 10, 2, '#f0e8ce'); }
        } else {
          box(n, x - 5, y - 12, 12, 490 - y, 3, '#405c58');
          n.strokeStyle = '#9cb99d'; n.lineWidth = 2; n.beginPath(); n.moveTo(x - 2, 452); n.lineTo(x - 2, y + 8); n.moveTo(x + 2, y + 34); n.lineTo(x + 18, y + 18); n.stroke();
          if (t.type === 'snow' || mood === 2 || sample(i + 291) < .24) {
            for (let a = 0; a < 3; a++) { const py = y - size + a * size * .4, half = size * (.35 + a * .14); poly(n, [x, py - 32, x - half, py + 35, x + half, py + 35], t.leaf); if (t.type === 'snow') poly(n, [x, py - 32, x - half * .82, py + 20, x + half * .82, py + 20], '#d5e6ec'); }
          } else if (sample(i + 941) < .35) {
            n.fillStyle = '#b5c7a1'; n.fillRect(x - 4, y - size, 8, 490 - y + size);
            for (let j = 0; j < 5; j++) { n.fillStyle = j % 2 ? '#579179' : '#70a585'; n.beginPath(); n.ellipse(x + (j % 2 ? 16 : -13), y - size + j * size * .22, size * .45, size * .22, j % 2 ? -.3 : .3, 0, Math.PI * 2); n.fill(); }
          } else {
            n.fillStyle = mood === 3 ? '#679475' : t.leaf; for (let a = 0; a < 3; a++) { n.beginPath(); n.ellipse(x + (a - 1) * size * .32, y - size / 2 - (a % 2) * size * .3, size * .6, size * .5, 0, 0, Math.PI * 2); n.fill(); }
            n.fillStyle = '#8bb982'; n.beginPath(); n.ellipse(x - 18, y - size / 2 - 25, size * .38, 10, -.25, 0, Math.PI * 2); n.fill();
            n.fillStyle = '#a7c88a'; for (let b = 0; b < 7; b++) { n.beginPath(); n.ellipse(x + (sample(i * 7 + b) - .5) * size, y - size * .4 - sample(b + i) * size * .55, 4, 2, -.4, 0, Math.PI * 2); n.fill(); }
          }
        }
      }
      // Background ruins and ground foliage never enter the collision pools.
      for (let i = Math.floor(start / 520) - 2; i <= Math.ceil(end / 520) + 2; i++) {
        const x = i * 520 + 18 + sample(i + 415) * 230 - start;
        if (sample(i + 493) > .88 && ['forest', 'sky', 'water'].includes(t.type)) {
          for (const side of [-1, 1]) { box(n, x + side * 29 - 6, 354, 15, 122, 2, t.near, t.edge); box(n, x + side * 29 - 10, 357, 23, 8, 2, t.edge); }
          n.strokeStyle = t.edge; n.lineWidth = 13; n.beginPath(); n.arc(x + 1, 358, 29, Math.PI, 0); n.stroke();
          poly(n, [x + 1, 325, x + 8, 336, x + 1, 347, x - 6, 336], t.glow);
        }
        if (t.type === 'forest') {
          for (let a = 0; a < 5; a++) { const px = x + a * 11, py = 456 + sample(a + i * 4) * 6; n.strokeStyle = '#5a9070'; n.lineWidth = 2; n.beginPath(); n.moveTo(px, 470); n.lineTo(px, py); n.stroke(); n.fillStyle = a % 2 ? '#ebc888' : '#b8d796'; n.beginPath(); n.arc(px, py, 3, 0, Math.PI * 2); n.fill(); }
        } else if (t.type === 'snow') { n.fillStyle = '#d8ebeb'; n.beginPath(); n.ellipse(x, 469, 47, 9, 0, 0, Math.PI * 2); n.fill(); }
      }
      // Familiar biome motifs, varied by world position instead of a repeating atlas.
      // Snow caps, trunks, buildings and their details always move as one image.
      for (let i = Math.floor(start / 1050) - 2; i <= Math.ceil(end / 1050) + 2; i++) {
        if (sample(i + 416) < .4) continue;
        const x = i * 1050 + 35 + sample(i + 117) * 380 - start, base = 445;
        n.save(); n.translate(x, base); n.scale(.78 + sample(i + 118) * .42, .76 + sample(i + 119) * .4); n.translate(-x, -base);
        if (t.type === 'forest' || t.type === 'snow') {
          if (sample(i + 720) > .46) {
            box(n, x - 46, base - 63, 92, 63, 3, t.type === 'snow' ? '#677a8e' : '#b5a384', '#d9d4b8');
            poly(n, [x - 58, base - 59, x, base - 100, x + 58, base - 59], t.type === 'snow' ? '#edf6f4' : '#586f60');
            box(n, x - 9, base - 32, 20, 32, 2, '#394b4b');
            for (const side of [-1, 1]) { box(n, x + side * 29 - 8, base - 45, 16, 20, 1, '#f9dc9b', '#7c9290'); n.fillStyle = '#788b80'; n.fillRect(x + side * 29 - 1, base - 45, 2, 20); }
          }
          if (t.type === 'snow') {
            for (let j = 0; j < 3; j++) { n.fillStyle = '#e0f1ff'; n.beginPath(); n.arc(x + 75, base - 10 - j * 15, 17 - j * 4, 0, Math.PI * 2); n.fill(); }
            n.fillStyle = '#2e4266'; n.fillRect(x + 63, base - 54, 24, 4); n.fillRect(x + 68, base - 66, 14, 12);
            poly(n, [x + 80, base - 39, x + 95, base - 35, x + 80, base - 34], '#efaa74');
            n.fillStyle = '#bd5e70'; n.fillRect(x + 65, base - 26, 23, 5);
          } else {
            for (let j = 0; j < 4; j++) {
              const bx = x + 66 + j * 15;
              n.fillStyle = '#d8ddd2'; n.fillRect(bx, base - 20, 3, 16);
              n.fillStyle = j % 2 ? '#f2bda2' : '#a7b87d'; n.beginPath(); n.ellipse(bx + 1, base - 20, 8, 5, 0, Math.PI, 0); n.fill();
            }
            poly(n, [x - 80, base, x - 68, base - 26, x - 45, base - 21, x - 36, base], '#608e78');
          }
        } else if (t.type === 'city') {
          box(n, x - 58, base - 21, 135, 9, 3, '#6b7f8c');
          box(n, x - 42, base - 12, 9, 34, 1, '#38475e'); box(n, x + 48, base - 12, 9, 34, 1, '#38475e');
          n.fillStyle = '#6de4dc'; n.fillRect(x - 58, base - 25, 135, 3);
          box(n, x + 86, base - 120, 4, 135, 1, '#8eacb3'); box(n, x + 65, base - 122, 26, 5, 2, '#9cf2e3');
          if (i % 2 === 0) { box(n, x - 50, base - 108, 90, 30, 2, '#19283c', '#cb82c1'); n.fillStyle = '#e8a7c9'; n.font = 'bold 13px sans-serif'; n.fillText('RUN →', x - 32, base - 88); }
        } else if (t.type === 'lava') {
          poly(n, [x - 110, base, x - 36, base - 150, x - 14, base - 132, x + 14, base - 148, x + 110, base], '#523e48');
          poly(n, [x - 36, base - 150, x - 14, base - 132, x + 14, base - 148, x + 25, base - 116, x + 6, base - 125, x - 9, base - 93, x - 24, base - 131, x - 48, base - 117], '#f2a36a');
          n.strokeStyle = '#ee805c'; n.lineWidth = 7; n.beginPath(); n.moveTo(x - 9, base - 94); n.lineTo(x + 14, base - 53); n.lineTo(x - 2, base - 25); n.lineTo(x + 12, base); n.stroke();
          n.fillStyle = '#e8805c'; n.beginPath(); n.ellipse(x + 15, base + 3, 97, 7, 0, 0, Math.PI * 2); n.fill();
        } else if (t.type === 'sky') {
          poly(n, [x - 70, base - 105, x + 80, base - 105, x + 35, base - 36, x - 13, base - 22, x - 48, base - 65], '#9baebe');
          poly(n, [x - 70, base - 105, x - 13, base - 22, x - 15, base - 104], '#738fa6');
          box(n, x - 72, base - 113, 155, 10, 4, '#e6e6cc');
          for (const side of [-1, 1]) { box(n, x + side * 42 - 7, base - 174, 14, 61, 1, '#eee7d0'); box(n, x + side * 42 - 11, base - 180, 22, 8, 2, '#bcbfa9'); }
          poly(n, [x - 62, base - 180, x, base - 206, x + 62, base - 180], '#e9dbb8');
        } else if (t.type === 'water') {
          box(n, x - 45, base - 74, 24, 88, 3, '#507884', '#82aaa4'); box(n, x + 21, base - 74, 24, 88, 3, '#507884', '#82aaa4');
          poly(n, [x - 50, base - 74, x - 36, base - 93, x - 25, base - 81, x - 10, base - 96, x + 49, base - 74], '#719795');
          n.strokeStyle = '#bf9297'; n.lineWidth = 5; n.beginPath(); n.moveTo(x + 87, base); n.lineTo(x + 82, base - 42); n.lineTo(x + 67, base - 54); n.moveTo(x + 84, base - 23); n.lineTo(x + 102, base - 42); n.stroke();
          poly(n, [x - 88, base - 135, x - 61, base - 145, x - 46, base - 135, x - 61, base - 126, x - 88, base - 135, x - 96, base - 147, x - 96, base - 122], '#88c8be');
        }
        n.restore();
      }

      }
      tiles.set(tileIndex, tile); return tile;
    }
    sceneryLayer(index, name, alpha, vertical) {
      const c = this.ctx, tiles = this.layers.get(index)[name], scroll = this.distance * (name === 'far' ? .12 : .32);
      const first = Math.floor(scroll / SCENERY_TILE), last = Math.floor((scroll + this.width - .001) / SCENERY_TILE);
      c.globalAlpha = alpha;
      for (let i = first; i <= last; i++) {
        const tile = this.sceneryTile(index, name, i);
        // Overlap one raster pixel to avoid subpixel cracks at fractional scroll.
        c.drawImage(tile, i * SCENERY_TILE - scroll, vertical, SCENERY_TILE + 1, SCENERY_HEIGHT);
      }
      this.sceneryTile(index, name, last + 1);
      // Bounded per-layer working set. Rewind re-bakes the same deterministic cells.
      for (const [key, tile] of tiles) if (key < first - 1 || key > last + 1) {
        tile.width = tile.height = 1; tiles.delete(key);
      }
    }
    background(index, alpha) {
      if (alpha <= 0) return; const c = this.ctx, t = THEMES[index], layers = this.layers.get(index); if (!layers) return;
      c.globalAlpha = alpha; c.fillStyle = layers.skyPaint; c.fillRect(0, this.viewTop, this.width, this.viewBottom - this.viewTop);
      const sunY = 128 + this.cameraY * .05;
      c.fillStyle = t.glow; c.beginPath(); c.arc(this.width * .76, sunY, 39, 0, Math.PI * 2); c.fill();
      c.globalAlpha = alpha * .18; c.beginPath(); c.arc(this.width * .76, sunY, 56, 0, Math.PI * 2); c.fill(); c.globalAlpha = alpha;
      if (['snow', 'city', 'water', 'lava'].includes(t.type)) { c.fillStyle = '#e8efe9'; for (let i = 0; i < 44; i++) { const x = hash(i + 88) * this.width, y = hash(i + 23) * 280; c.globalAlpha = alpha * (.25 + hash(i) * .45); c.fillRect(x, y, 2, 2); } c.globalAlpha = alpha; }
      // Carry the landscape down with the camera and extend its opaque base.
      // The baked canvases must never expose their lower edge above the road.
      const farY = this.cameraY * .18, horizon = 465 + farY;
      c.fillStyle = t.far; c.fillRect(0, horizon - 1, this.width, Math.max(0, this.viewBottom + 1 - horizon));
      this.sceneryLayer(index, 'far', alpha, farY);
      this.sceneryLayer(index, 'near', alpha, this.cameraY);
      c.globalAlpha = 1;
    }
    drawRoadside() {
      const c = this.ctx, t = THEMES[this.biome], g = this.ground;
      // Red road rail and asphalt echo the main runner, but remain behind all
      // interactive silhouettes. No decorative pillar can obstruct a jump.
      c.fillStyle = t.type === 'sky' ? '#d6d4bd' : '#233943'; c.fillRect(0, g - 13, this.width, 13);
      c.fillStyle = t.type === 'sky' ? '#efe7c9' : '#b75e62'; c.fillRect(0, g - 17, this.width, 4);
      const offset = -(this.distance * .75 % 140);
      for (let x = offset; x < this.width; x += 140) { c.fillStyle = '#40565d'; c.fillRect(x, g - 24, 5, 24); c.fillStyle = '#e6d299'; c.fillRect(x, g - 23, 5, 3); }
    }
    drawGround(index, alpha) {
      const c = this.ctx, t = THEMES[index], g = this.ground; c.globalAlpha = alpha;
      c.fillStyle = t.floor; c.fillRect(0, g, this.width, this.viewBottom - g);
      c.fillStyle = t.edge; c.fillRect(0, g, this.width, 6);
      c.fillStyle = '#ffffff18'; c.fillRect(0, g + 8, this.width, 3);
      const offset = -(this.distance % 96);
      for (let x = offset - 96; x < this.width; x += 96) {
        c.strokeStyle = '#00000025'; c.lineWidth = 2; c.strokeRect(x, g + 17, 92, 28); c.strokeRect(x + 48, g + 52, 92, 34);
        c.fillStyle = t.edge; c.globalAlpha = alpha * .24; c.fillRect(x + 15, g + 23, 19, 3); c.globalAlpha = alpha;
        if (t.type === 'forest') for (let a = 0; a < 3; a++) poly(c, [x + a * 12, g, x + a * 12 + 3, g - 9 - a * 3, x + a * 12 + 7, g], '#73ae70');
        if (t.type === 'lava') { c.strokeStyle = '#db876150'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 40, g + 38); c.lineTo(x + 55, g + 59); c.lineTo(x + 49, g + 69); c.stroke(); }
        if (t.type === 'city') { c.fillStyle = '#7fc9bd44'; c.fillRect(x + 10, g + 22, 36, 2); c.fillRect(x + 46, g + 22, 2, 14); }
      }
      c.globalAlpha = 1;
    }
    draw() {
      if (!this.active || !this.width) return; const c = this.ctx, t = THEMES[this.biome], g = this.ground;
      c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = t.sky; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
      c.setTransform(this.scale * this.dpr, 0, 0, this.scale * this.dpr, 0, this.offsetY * this.dpr);
      c.save(); c.beginPath(); c.rect(0, this.viewTop, this.width, this.viewBottom - this.viewTop); c.clip();
      this.renderIndex++;
      if (this.shakeTime > 0 && (this.state === 'playing' || this.state === 'dying') && !this.reduceMotion) {
        const intensity = this.shakeIntensity * this.shakeTime / Math.max(.001, this.shakeDuration);
        c.translate((hash(this.renderIndex + 7) * 2 - 1) * intensity, (hash(this.renderIndex + 91) * 2 - 1) * intensity);
      }
      if (this.themeBlend < 1) this.background(this.previousBiome, 1);
      this.background(this.biome, this.themeBlend);
      c.save(); c.translate(0, this.cameraY);
      this.drawRoadside();
      if (this.themeBlend < 1) this.drawGround(this.previousBiome, 1);
      this.drawGround(this.biome, this.themeBlend);
      // Small fixed-count atmospheric details, no particle allocation or filters.
      c.fillStyle = t.type === 'snow' ? '#edf7ff' : t.glow;
      for (let i = 0; i < 22; i++) {
        const x = ((hash(i + 9) * this.width - this.distance * .08) % this.width + this.width) % this.width;
        const y = 75 + (hash(i + 17) * 380 + this.elapsed * (t.type === 'snow' ? 15 : -4) + 1e6) % 380;
        c.globalAlpha = .2 + .2 * Math.sin(i + this.elapsed); c.fillRect(x, y, t.type === 'snow' ? 3 : 2, 3);
      }
      c.globalAlpha = 1;
      for (const o of this.obstacles) if (o.active && o.kind === 'gravityPortal' && o.ceilingEnd) {
        const left = Math.max(-20, this.px + o.x - this.distance - 65), right = Math.min(this.width + 20, this.px + o.ceilingEnd - this.distance + 65);
        if (right <= left) continue;
        const roof = g - CEILING;
        box(c, left, roof - 28, right - left, 28, 4, THEMES[o.biome].floor, '#bcb2e9');
        c.fillStyle = '#c8bfff'; c.fillRect(left, roof - 5, right - left, 5);
        c.fillStyle = '#e4dcff66';
        for (let sx = this.px + o.x - this.distance; sx < right; sx += 80) if (sx >= left) c.fillRect(sx, roof - 18, 26, 3);
      }
      for (const o of this.obstacles) if (o.active && !o.broken) this.drawObstacle(o);
      for (const p of this.pickups) if (p.active && !p.collected) this.drawPickup(p);
      for (const coin of this.coins) if (coin.active && !coin.collected) {
        const x = this.px + coin.x - this.distance, y = g - coin.y; if (x < -25 || x > this.width + 25) continue;
        c.save(); c.translate(x, y); c.scale(.72 + .28 * Math.cos(this.elapsed * 4 + coin.x * .01), 1);
        c.fillStyle = '#d99c48'; c.beginPath(); c.arc(0, 0, 11, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#ffeab1'; c.lineWidth = 2; c.stroke();
        poly(c, [0, -6, 4, 0, 0, 6, -4, 0], '#fff0b7'); c.restore();
      }
      if (this.health > 0) this.drawPlayer();
      else this.drawVoxels();
      for (const p of this.particles) if (p.life > 0) { c.globalAlpha = Math.min(1, p.life / p.maxLife) * (p.trail ? .55 : 1); c.fillStyle = p.color; const size = p.trail ? p.size * p.life / p.maxLife : p.size; c.fillRect(this.px + p.x - this.distance, g - p.y, size, size); }
      c.globalAlpha = 1;
      c.restore();
      if (this.effectTime > 0 && this.effect !== 'airDash') { c.strokeStyle = this.skin.accent; c.globalAlpha = .35; c.lineWidth = 7; c.strokeRect(3, 3, this.width - 6, 594); c.globalAlpha = 1; }
      c.restore();
    }
    drawObstacle(o) {
      const c = this.ctx, x = this.px + o.x - this.distance, y = this.ground - o.y - o.h;
      if (x < -o.w || x > this.width + o.w) return;
      c.save(); if (o.hit) c.globalAlpha = .45;
      if (o.incoming && o.vx < 0) {
        c.save(); c.strokeStyle = '#d7e9d7'; c.globalAlpha = .5; c.lineWidth = 2;
        for (let j = 0; j < 3; j++) { const sx = x + o.w / 2 + 8 + (this.worldTime * 110 + j * 11) % 24; c.beginPath(); c.moveTo(sx, y + 12 + j * 12); c.lineTo(sx + 20 + j * 5, y + 12 + j * 12); c.stroke(); }
        c.restore();
      }
      if (o.kind === 'gravityPortal') {
        const color = o.targetGravity === -1 ? '#c3adff' : '#a8f1c9', center = this.ground - CEILING / 2;
        c.strokeStyle = color; c.lineWidth = 4; c.globalAlpha = .85;
        c.beginPath(); c.ellipse(x, center, 22, CEILING / 2 - 12, 0, 0, Math.PI * 2); c.stroke();
        c.globalAlpha = .1; c.fillStyle = color; c.fill(); c.globalAlpha = .9;
        for (let j = 0; j < 6; j++) {
          const py = this.ground - 35 - (j * 54 + this.worldTime * 45) % (CEILING - 60), s = o.targetGravity;
          c.beginPath(); c.moveTo(x - 7, py - s * 5); c.lineTo(x, py + s * 5); c.lineTo(x + 7, py - s * 5); c.stroke();
        }
      } else if (o.kind === 'saw') {
        c.translate(x, y + o.h / 2); c.rotate(this.worldTime * 5 + o.phase);
        c.beginPath();
        for (let j = 0; j < 24; j++) {
          const a = j * Math.PI / 12, radius = j % 2 ? 23 : 32;
          if (!j) c.moveTo(Math.cos(a) * radius, Math.sin(a) * radius); else c.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
        }
        c.closePath(); c.fillStyle = '#a6bec6'; c.fill(); c.strokeStyle = '#eef8e5'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#385667'; c.beginPath(); c.arc(0, 0, 16, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#eeaa83'; c.lineWidth = 3; c.stroke(); box(c, -5, -5, 10, 10, 2, '#f3d8a1');
      } else if (o.kind === 'stepBlock') {
        const t = THEMES[o.biome]; box(c, x - o.w / 2, y, o.w, o.h, 5, t.floor, t.edge);
        c.fillStyle = t.edge; c.fillRect(x - o.w / 2 + 2, y, o.w - 4, 7);
        c.fillStyle = '#ffffff18'; c.fillRect(x - o.w / 2 + 8, y + 13, o.w - 16, 6);
        c.strokeStyle = '#ffffff1c'; c.lineWidth = 2;
        for (let row = 36; row < o.h; row += 36) { c.beginPath(); c.moveTo(x - o.w / 2 + 2, y + row); c.lineTo(x + o.w / 2 - 2, y + row); c.stroke(); }
        poly(c, [x - 8, y + 30, x, y + 22, x + 8, y + 30, x + 4, y + 30, x, y + 26, x - 4, y + 30], '#e6ddab');
      } else if (o.kind === 'pad') {
        const base = this.ground - o.y;
        c.save(); c.translate(x, base); c.scale(o.w / 92, 1); c.translate(-x, -base);
        c.globalAlpha = o.used ? .45 : 1;
        box(c, x - 46, base - 12, 92, 12, 6, '#23768e', '#acf6f4');
        c.strokeStyle = '#a7f8ff'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, base - 11, 34, 6, 0, 0, Math.PI * 2); c.stroke();
        if (!o.used) {
          c.fillStyle = '#8de9ef'; c.globalAlpha = .1; c.fillRect(x - 32, base - 140, 64, 125); c.globalAlpha = 1;
          for (let i = 0; i < 3; i++) { const py = base - 29 - i * 22 - this.worldTime * 24 % 22; c.globalAlpha = .35 + i * .2; c.strokeStyle = '#b6ffff'; c.beginPath(); c.moveTo(x - 11, py + 7); c.lineTo(x, py); c.lineTo(x + 11, py + 7); c.stroke(); }
        }
        c.restore();
      } else if (['platform', 'crumblingBlock', 'icePlatform'].includes(o.kind)) {
        const t = THEMES[o.biome], ice = o.kind === 'icePlatform', crumble = o.kind === 'crumblingBlock';
        const remaining = Number.isFinite(o.crumbleAt) ? clamp(o.crumbleAt - this.worldTime, 0, 1) : 1;
        if (crumble && remaining < 1) c.translate(Math.sin(this.worldTime * 75) * (1 - remaining) * 2, 0);
        box(c, x - o.w / 2, y, o.w, o.h, ice ? 8 : 4, ice ? '#689dbb' : t.floor, ice ? '#d1f7ff' : t.edge);
        c.fillStyle = ice ? '#d9f9ff' : crumble ? '#dbb589' : t.edge; c.fillRect(x - o.w / 2 + 2, y, o.w - 4, 5);
        c.strokeStyle = ice ? '#a5e7f3' : '#ffffff28'; c.lineWidth = 2;
        for (let j = 0; j < Math.floor(o.w / 44); j++) { const sx = x - o.w / 2 + 21 + j * 44; c.beginPath(); c.moveTo(sx, y + 10); c.lineTo(sx + 13, y + o.h - 5); c.stroke(); }
        if (crumble) {
          c.strokeStyle = remaining < 1 ? '#ffc794' : '#b7a98a'; c.lineWidth = 2;
          for (let j = 0; j < 3; j++) { const sx = x + (j - 1) * o.w * .26; c.beginPath(); c.moveTo(sx - 9, y); c.lineTo(sx + 3, y + 11); c.lineTo(sx - 5, y + o.h); c.stroke(); }
          if (remaining < 1) { c.fillStyle = '#f8ca8c'; c.fillRect(x - o.w / 2, y - 4, o.w * remaining, 3); }
        }
        if (ice) { c.strokeStyle = '#e6ffff'; for (let j = 0; j < 3; j++) { const sx = x - 55 + j * 55; c.beginPath(); c.moveTo(sx, y + 11); c.lineTo(sx + 11, y + 16); c.lineTo(sx, y + 21); c.stroke(); } }
      } else if (o.kind === 'breakWall') {
        box(c, x - o.w / 2 - 4, y, o.w + 8, o.h, 4, '#364d5e', '#8da8ad');
        box(c, x - o.w / 2 + 3, y + 7, o.w - 6, o.h - 14, 2, '#86c1ceaa', '#c4f2ec');
        c.strokeStyle = '#e2f9ee'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 12, y + 12); c.lineTo(x - 8, y + 48); c.lineTo(x + 5, y + 82); c.lineTo(x - 11, y + 110); c.lineTo(x + 9, y + o.h - 8); c.stroke();
        c.globalAlpha = .3; c.fillStyle = '#edffff'; c.fillRect(x - 9, y + 10, 4, o.h - 20);
      } else if (o.kind === 'updraft' || o.kind === 'waterBubble') {
        const bubble = o.kind === 'waterBubble'; c.strokeStyle = bubble ? '#acf2f6' : '#c7e6c6'; c.fillStyle = bubble ? '#7fd4e71c' : '#c2ebc511';
        c.beginPath(); c.ellipse(x, y + o.h / 2, o.w / 2, o.h / 2, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = .5; c.lineWidth = 2; c.stroke();
        for (let j = 0; j < 9; j++) {
          const px = x + (hash(o.homeX + j) - .5) * o.w * .8, py = y + o.h - (this.worldTime * (bubble ? 40 : 125) + j * 37) % o.h;
          c.globalAlpha = .25 + hash(j + 18) * .5; c.beginPath();
          if (bubble) c.arc(px, py, 3 + j % 3 * 2, 0, Math.PI * 2);
          else { c.moveTo(px - 5, py + 5); c.quadraticCurveTo(px + 9, py - 8, px, py - 21); }
          c.stroke();
        }
      } else if (o.kind === 'geyser') {
        box(c, x - o.w / 2, this.ground - 9, o.w, 13, 5, '#4f3d44', '#dd8f69');
        if (o.warning > 0) {
          c.globalAlpha = .3 + .2 * Math.sin(this.worldTime * 16); c.fillStyle = '#ffb15f'; c.fillRect(x - o.w / 2, this.ground - 4, o.w, 4);
          c.globalAlpha = .8; c.strokeStyle = '#ffcb81'; c.lineWidth = 3; c.beginPath(); c.arc(x, this.ground - 27, 12, -Math.PI / 2, -Math.PI / 2 + (1 - o.warning / 1.5) * Math.PI * 2); c.stroke();
        }
        if (o.erupting) {
          const height = o.columnHeight;
          c.globalAlpha = .85; poly(c, [x - o.w / 2, this.ground, x - 20, this.ground - height * .8, x - 8, this.ground - height, x + 6, this.ground - height * .85, x + 19, this.ground - height * .96, x + o.w / 2, this.ground], '#f18a53');
          c.globalAlpha = 1; poly(c, [x - 18, this.ground, x - 5, this.ground - height * .76, x + 10, this.ground - height * .65, x + 20, this.ground], '#ffe2a1');
        }
      } else if (o.kind === 'car' || o.kind === 'train' || o.kind === 'motor') {
        const train = o.kind === 'train', bike = o.kind === 'motor', w = HAZARDS[o.kind][0], g = this.ground, y = g - HAZARDS[o.kind][1];
        c.save(); c.translate(x, g); c.scale(o.w / w, o.h / HAZARDS[o.kind][1]); c.translate(-x, -g);
        const paint = train ? '#bd535e' : bike ? '#df9a54' : '#628ccc';
        // Wheels, windows, body trim and lamps match the 3D vehicle silhouettes.
        if (train) {
          box(c, x - w / 2, y + 3, w, o.h - 14, 8, paint, '#e4a3a0');
          box(c, x - w / 2 + 4, y, w - 8, 11, 4, '#4a546e');
          for (let j = 0; j < 5; j++) box(c, x - w / 2 + 14 + j * 33, y + 23, 24, 27, 3, '#183949', '#9ec6d1');
          box(c, x - 15, y + 65, 30, 33, 2, '#733e4e', '#df9295'); c.fillStyle = '#eed1aa'; c.fillRect(x - w / 2 + 8, y + 58, w - 16, 4);
        } else if (bike) {
          c.strokeStyle = '#92adb6'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 27, g - 12); c.lineTo(x - 8, y + 15); c.lineTo(x + 27, g - 12); c.lineTo(x - 27, g - 12); c.moveTo(x - 8, y + 15); c.lineTo(x - 21, y); c.lineTo(x - 32, y); c.stroke();
          box(c, x - 9, y + 15, 33, 15, 5, paint, '#ffe0b1'); box(c, x - 2, y + 7, 27, 7, 2, '#283a4b');
        } else {
          poly(c, [x - 51, y + 29, x - 28, y + 2, x + 22, y + 2, x + 44, y + 27], paint);
          poly(c, [x - 40, y + 25, x - 24, y + 7, x - 4, y + 7, x - 4, y + 25], '#9acee0');
          poly(c, [x + 2, y + 7, x + 19, y + 7, x + 33, y + 25, x + 2, y + 25], '#527a98');
          box(c, x - 60, y + 26, 120, 23, 7, paint, '#a1c9ea'); c.fillStyle = '#99e6dd'; c.fillRect(x - 48, y + 42, 96, 3);
          box(c, x - 62, y + 28, 11, 7, 2, '#fff4c5'); box(c, x + 51, y + 27, 7, 8, 2, '#f69b93');
        }
        for (const side of [-1, 1]) { const wx = x + side * w * .32; c.fillStyle = '#172a38'; c.beginPath(); c.arc(wx, g - 11, 12, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#acb9b3'; c.lineWidth = 3; c.beginPath(); c.arc(wx, g - 11, 6, 0, Math.PI * 2); c.stroke(); }
        c.restore();
      } else if (o.kind === 'lava' || o.kind === 'ice') {
        if (o.kind === 'lava') {
          box(c, x - o.w / 2, y, o.w, o.h, 3, '#e87b50', '#ffe09c');
          c.strokeStyle = '#ffe299'; c.lineWidth = 3; c.beginPath();
          for (let j = 0; j <= 12; j++) { const py = y + 6 + Math.sin(j * 1.8 + this.worldTime * 4 + o.phase) * 3; if (!j) c.moveTo(x - o.w / 2, py); else c.lineTo(x - o.w / 2 + j * o.w / 12, py); } c.stroke();
        } else {
          const count = Math.ceil(o.w / 22), step = o.w / count;
          for (let j = 0; j < count; j++) { const px = x - o.w / 2 + j * step, top = this.ground - o.h + (j % 2) * 10; poly(c, [px, this.ground, px + step * .45, top, px + step, this.ground], '#84c5eb'); poly(c, [px + step * .45, top, px + step * .6, this.ground, px + step, this.ground], '#d3f2fc'); }
        }
      } else if (o.kind === 'spinner') {
        box(c, x - 26, this.ground - 9, 52, 9, 3, '#475667', '#c8ceba');
        c.strokeStyle = '#475667'; c.lineWidth = 7; c.beginPath(); c.moveTo(x, this.ground - 7); c.lineTo(x, this.ground - o.y - o.h / 2); c.stroke();
        c.translate(x, this.ground - o.y - o.h / 2); c.rotate(this.worldTime * o.spinSpeed + o.phase);
        for (let j = 0; j < 4; j++) { c.rotate(Math.PI / 2); box(c, -5, -o.h / 2, 10, o.h / 2 - 5, 3, '#d8b166', '#fff0bb'); }
        c.fillStyle = '#374e59'; c.beginPath(); c.arc(0, 0, 10, 0, Math.PI * 2); c.fill();
      } else if (o.kind === 'beam') {
        c.strokeStyle = '#506b72'; c.lineWidth = 4;
        for (const side of [-1, 1]) { const sx = x + side * (o.w / 2 - 14); c.beginPath(); c.moveTo(sx, y); c.lineTo(sx, 0); c.stroke(); c.strokeStyle = '#c1ccbd'; c.lineWidth = 1; c.beginPath(); c.moveTo(sx + 2, 0); c.lineTo(sx + 2, y); c.stroke(); c.strokeStyle = '#506b72'; c.lineWidth = 4; }
        box(c, x - o.w / 2, y, o.w, o.h, 7, '#29434e', '#a4b4aa');
        box(c, x - o.w / 2 + 9, y + 10, o.w - 18, o.h - 20, 3, '#385b64');
        c.fillStyle = '#e9c57e'; c.fillRect(x - o.w / 2 + 4, y + o.h - 12, o.w - 8, 8);
        for (let sx = x - o.w / 2 + 15; sx < x + o.w / 2 - 8; sx += 25) poly(c, [sx, y + o.h - 12, sx + 9, y + o.h - 12, sx + 2, y + o.h - 4, sx - 7, y + o.h - 4], '#4c4844');
        c.font = 'bold 27px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#d7e9d7'; c.fillText('↓', x, y + 39);
      } else {
        if (o.kind === 'fall' && o.falling && o.y > 0) {
          c.fillStyle = '#ffad6b'; c.globalAlpha = .15 + .15 * Math.sin(this.worldTime * 14); c.fillRect(x - o.w / 2 - 12, 55, o.w + 24, this.ground - 55);
          c.globalAlpha = 1; box(c, x - 16, 116, 32, 32, 8, '#653d3f', '#ffd297'); c.fillStyle = '#fff0c8'; c.font = 'bold 23px sans-serif'; c.textAlign = 'center'; c.fillText('!', x, 140);
          c.strokeStyle = '#ffc189'; c.setLineDash([5, 6]); c.lineWidth = 2; c.beginPath(); c.moveTo(x - 45, this.ground - 3); c.lineTo(x + 45, this.ground - 3); c.stroke(); c.setLineDash([]);
        }
        box(c, x - o.w / 2, y, o.w, o.h, 7, o.kind === 'fall' ? '#bf5761' : '#333e4b', o.kind === 'fall' ? '#f2b39f' : '#b3c1a7');
        box(c, x - o.w / 2 + 7, y + 7, o.w - 14, o.h - 14, 3, '#253b43');
        poly(c, [x, y + 12, x + 12, y + o.h / 2, x, y + o.h - 12, x - 12, y + o.h / 2], o.kind === 'fall' ? '#ffb482' : '#b2d79b');
        for (const side of [-1, 1]) { c.fillStyle = '#d6dbbe'; c.fillRect(x + side * (o.w / 2 - 10) - 2, y + 8, 4, 4); c.fillRect(x + side * (o.w / 2 - 10) - 2, y + o.h - 12, 4, 4); }
        if (o.kind === 'block') { c.fillStyle = '#e9c26a'; c.fillRect(x - o.w / 2, y, o.w, 13); for (let sx = x - o.w / 2 + 8; sx < x + o.w / 2 - 8; sx += 23) poly(c, [sx, y, sx + 10, y, sx + 2, y + 13, sx - 8, y + 13], '#3c4147'); }
      }
      c.restore();
    }
    drawPickup(p) {
      const c = this.ctx, x = this.px + p.x - this.distance, y = this.ground - p.y + Math.sin(this.elapsed * 3 + p.x) * 4;
      if (x < -40 || x > this.width + 40) return;
      const color = '#e5bcf6';
      c.save(); c.translate(x, y); c.fillStyle = '#17394de0'; c.strokeStyle = color; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 23, 0, Math.PI * 2); c.fill(); c.stroke();
      c.globalAlpha = .28; c.beginPath(); c.ellipse(0, 0, 30, 11, this.elapsed * .7, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
      c.strokeStyle = color; c.lineWidth = 7; c.beginPath(); c.arc(0, -2, 10, 0, Math.PI); c.moveTo(-10, -2); c.lineTo(-10, -12); c.moveTo(10, -2); c.lineTo(10, -12); c.stroke(); c.fillStyle = '#f1f6e6'; c.fillRect(-14, -14, 8, 5); c.fillRect(6, -14, 8, 5);
      c.restore();
    }
    drawPlayer() {
      // Cosmetic three-phase skid: lower/lean, feet-first glide, stand back up.
      // The square keeps its proportions instead of snapping into a flat box.
      const c = this.ctx, pose = clamp(this.slidePose, 0, 1), sliding = pose > .05;
      const h = 52 - pose * 22, w = 44 - pose * 8, x = this.px + pose * 10, y = this.ground - this.y;
      c.save(); c.fillStyle = '#0b223b33'; c.beginPath(); c.ellipse(x, this.ground - (this.grounded ? this.y : this.gravityDir === -1 ? CEILING : 0) + 3 * this.gravityDir, 25, 5, 0, 0, Math.PI * 2); c.fill();
      c.translate(0, y); c.scale(1, this.gravityDir); c.translate(0, -y);
      c.save();
      if (this.effect === 'phaseShift') c.globalAlpha = .48; else if (this.invulnerable > 0) c.globalAlpha = .6 + .4 * Math.sin(this.elapsed * 30);
      c.translate(x, y - 10 * (1 - pose));
      const swing = Math.sin(this.stride) * (this.grounded ? 12 : 4) * (1 - pose);
      const leftFoot = (-17 + swing) * (1 - pose) + 18 * pose, rightFoot = (5 - swing) * (1 - pose) + 35 * pose;
      c.strokeStyle = '#466d63'; c.lineWidth = 7; c.lineCap = 'round';
      if (sliding) { c.beginPath(); c.moveTo(-7, -9); c.lineTo(leftFoot + 3, -9); c.moveTo(8, -12); c.lineTo(rightFoot + 3, -5); c.stroke(); }
      box(c, leftFoot, -5, 17, 14 - pose * 7, 4, '#243b45', '#94c6b1'); box(c, rightFoot, -5, 17 + pose * 4, 14 - pose * 7, 4, '#2a444a', '#9fd5b5');
      c.save(); c.translate(-pose * 5, -h / 2); c.rotate(-.25 * pose + (this.y > 0 ? clamp(-this.vy / 7000, -.1, .1) : 0)); c.scale(1 + this.squash * (1 - pose), 1 - this.squash * (1 - pose)); c.translate(0, h / 2);
      // Scarf trails, bevelled cube, expressive face, and the equipped glove palette.
      poly(c, [-18, -h + 13, -51 - Math.sin(this.elapsed * 8) * 5, -h + 2, -43, -h + 15, -53, -h + 20, -18, -h + 23], this.skin.accent);
      box(c, -w / 2, -h, w, h, 8, '#89cda7', '#d8e9bd');
      poly(c, [-w / 2 + 5, -h + 4, w / 2 - 5, -h + 4, w / 2 - 10, -h + 11, -w / 2 + 5, -h + 11], '#b9e2ba');
      c.fillStyle = '#527e6b'; c.fillRect(-w / 2 + 3, -h + 15, 4, h - 21);
      const blink = this.elapsed % 4.7 > 4.55, eyeY = -h + 22 - pose * 12;
      box(c, -3, eyeY, 6, blink ? 2 : 10 - pose * 3, 3, '#163744'); box(c, 10, eyeY, 6, blink ? 2 : 10 - pose * 3, 3, '#163744');
      c.strokeStyle = '#244653'; c.lineWidth = 2; c.beginPath(); c.arc(7, eyeY + 12, 5, .1, Math.PI - .1); c.stroke();
      if (this.api.hatOwned?.()) { box(c, -17, -h - 14 + pose * 5, 31, 17 - pose * 5, 5, '#d8ad64', '#fff0ba'); box(c, -25, -h - 2, 47, 5, 2, '#9d7147'); }
      c.restore();
      // Back hand braces near the surface; front hand tucks by the leading knee.
      box(c, -30 - pose * 2, (-h * .4 + swing * .35) * (1 - pose) - 10 * pose, 14, 14 - pose * 3, 5, this.skin.base, this.skin.accent);
      box(c, 23 - pose * 5, (-h * .45 - swing * .35) * (1 - pose) - 17 * pose, 15, 15 - pose * 3, 5, this.skin.base, this.skin.edge);
      if (sliding) { c.globalAlpha *= pose; c.strokeStyle = '#e1e8c5'; c.lineWidth = 2; for (let j = 0; j < 3; j++) { const dx = (this.worldTime * 170 + j * 17) % 26; c.beginPath(); c.moveTo(-38 - dx, -3 - j * 7); c.lineTo(-72 - dx - j * 8, -3 - j * 7); c.stroke(); } }
      c.restore();
      if (this.padFlash > 0) {
        c.save(); c.strokeStyle = '#a9f4ff'; c.fillStyle = '#b2f4ff15'; c.lineWidth = 2;
        c.globalAlpha = .8;
        c.beginPath(); c.ellipse(x, y - h / 2, sliding ? 40 : 35, sliding ? 24 : 46, 0, 0, Math.PI * 2); c.fill(); c.stroke(); c.restore();
      }
      if (this.magnetTime > 0 || this.effect === 'magnet') { c.strokeStyle = '#deb9ef'; c.lineWidth = 1.5; for (let j = 0; j < 2; j++) { c.globalAlpha = .3; c.beginPath(); c.arc(x, y - 26, 48 + ((this.elapsed * 45 + j * 30) % 60), -.9, .9); c.stroke(); } c.globalAlpha = 1; }
      if (this.effect === 'airDash') { c.strokeStyle = this.skin.accent; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x - 50 - i * 6, y - 10 - i * 12); c.lineTo(x - 125 - i * 14, y - 10 - i * 12); c.stroke(); } }
      c.restore();
    }
    drawVoxels() {
      const c = this.ctx, age = Math.max(0, this.deathClock - HIT_STOP);
      for (const v of this.voxels) if (v.active) {
        const x = this.px + v.x - this.distance + v.vx * age;
        const y = this.ground - v.y - v.vy * age + 800 * v.gravity * age * age;
        c.save(); c.translate(x, y); c.rotate(v.spin * age); c.globalAlpha = clamp((DEATH_BURST - age) / .18, 0, 1);
        box(c, -v.size / 2, -v.size / 2, v.size, v.size, 1, v.color, '#d8edc2');
        c.fillStyle = '#ffffff44'; c.fillRect(-v.size / 2 + 1, -v.size / 2 + 1, v.size - 2, 2); c.restore();
      }
    }
    snapshot() {
      const round = v => Math.round(v * 100) / 100;
      return { mode: 'runner2d', state: this.state, coordinates: '+X forward; +Y up; player.y is feet anchor; body extends gravityDir * height from feet',
        distance: round(this.distance), meters: Math.floor(this.peak / 10), speed: round(this.speed), elapsed: round(this.elapsed), worldTime: round(this.worldTime), score: this.score, coins: this.gold, health: this.health, maxHealth: MAX_HEALTH, best: this.best,
        biome: THEMES[this.biome].type, themeBlend: round(this.themeBlend), cachedThemes: [...this.layers.keys()],
        generation: { seed: this.spawnSeed, phrases: this.spawnIndex, last: this.lastPattern, safetyClamps: this.plannerClamps },
        player: { x: round(this.distance), y: round(this.y), vy: round(this.vy), gravityDir: this.gravityDir, width: BODY_W, height: this.slide > 0 && this.grounded ? 29 : BODY_H, grounded: this.grounded, support: this.support >= 0 ? this.obstacles[this.support]?.kind : this.support === -1 ? 'ground' : this.support === -3 ? 'ceiling' : null, jumping: !this.grounded, sliding: this.slide > 0, slidePose: round(this.slidePose), slideRemaining: round(this.slide), slideRecovery: round(this.slideRecovery), slideHeld: this.slideHeld, jumps: this.jumps, coyoteTime: round(this.coyoteTime), invulnerable: round(this.invulnerable), visible: this.health > 0 },
        camera: { height: round(this.cameraY), shake: round(this.shakeTime) },
        bhop: { combo: this.bhopCombo, window: round(this.bhopWindow), speedBonus: round(Math.min(BHOP_SPEED_CAP, this.bhopCombo * BHOP_SPEED_PER_HOP)), scoreBonus: round(Math.min(BHOP_SCORE_CAP, this.bhopCombo * BHOP_SCORE_PER_HOP)) },
        input: { jumpHeld: this.jumpHeld, gliding: this.isGliding() },
        death: { phase: this.state === 'dying' ? (this.deathClock <= HIT_STOP ? 'hitStop' : 'voxelBurst') : null, remaining: this.state === 'dying' ? round(HIT_STOP + DEATH_BURST - this.deathClock) : 0, voxels: this.health === 0 && this.state === 'dying' ? this.voxels.filter(v => v.active).length : 0 },
        powerups: { magnet: round(this.magnetTime), iceSpeed: round(Math.max(0, this.iceUntil - this.worldTime)), lowGravity: round(Math.max(0, this.bubbleUntil - this.worldTime)) },
        hand: this.skin.id, skill: { type: this.skin.skill, effect: this.effect, remaining: round(this.effectTime), cooldown: round(this.cooldown), reviveUsed: this.reviveUsed },
        obstacles: this.obstacles.filter(o => o.active && o.x > this.distance - 400 && o.x < this.distance + this.width).map(o => ({ kind: o.kind, ahead: round(o.x - this.distance), y: round(o.y), width: o.w, height: o.h, solidTop: o.solidTop, topOnly: o.topOnly, broken: o.broken, crumbleRemaining: Number.isFinite(o.crumbleAt) ? round(Math.max(0, o.crumbleAt - this.worldTime)) : null, erupting: o.erupting, incoming: o.incoming, vx: round(o.vx), speedMod: o.incoming ? round(o.speedMod) : null, warning: round(o.warning), warningDuration: o.kind === 'fall' ? round(o.warningDuration) : null, stagger: o.kind === 'fall' ? round(o.stagger) : null, bounce: o.kind === 'spinner' ? round(o.bounce) : null, spinSpeed: o.kind === 'spinner' ? round(o.spinSpeed) : null, falling: o.falling, hit: o.hit, used: o.used })),
        pickups: this.pickups.filter(p => p.active && !p.collected && p.x > this.distance - 40 && p.x < this.distance + this.width).map(p => ({ kind: p.kind, ahead: round(p.x - this.distance), y: p.y })),
        collectibles: this.coins.filter(o => o.active && !o.collected && o.x > this.distance - 40 && o.x < this.distance + this.width).map(o => ({ ahead: round(o.x - this.distance), y: round(o.y) })),
        pools: { obstacles: this.obstacles.length, coins: this.coins.length, pickups: this.pickups.length, particles: this.particles.length, voxels: this.voxels.length }, settled: this.settled };
    }
  }
  Runner2D.readBest = readBest;
  global.ElementalRunner2D = Runner2D;
})(window);
