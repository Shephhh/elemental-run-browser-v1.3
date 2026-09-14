(function () {
  'use strict';

  const TOTAL_LEVELS = 120;
  const SAVE_KEY = 'elemental-run-levels-v2';
  const LEGACY_SAVE_KEYS = Object.freeze(['elemental-run-poki-levels-v1']);
  const THEMES = [
    { id: 'city', phase: 0, color: '#59e7ff', label: 'CITY' },
    { id: 'nature', phase: 1, color: '#73f59b', label: 'NATURE' },
    { id: 'sky', phase: 2, color: '#9ec8ff', label: 'SKY' },
    { id: 'lava', phase: 3, color: '#ff7a47', label: 'LAVA' },
    { id: 'water', phase: 4, color: '#39d8ff', label: 'WATER' },
    { id: 'snow', phase: 5, color: '#e4f5ff', label: 'SNOW' }
  ];
  // Campaign maps are authored independently from the endless-run score
  // thresholds. This literal sequence makes every replay of a level start in
  // exactly the same world.
  const LEVEL_MAP_SEQUENCE = Object.freeze([
    1, 5, 0, 3, 1, 0, 5, 2, 1, 1,
    3, 5, 0, 2, 1, 1, 5, 3, 0, 1,
    4, 0, 5, 2, 1, 4, 3, 5, 0, 1,
    4, 1, 5, 3, 1, 3, 4, 0, 5, 1,
    1, 4, 3, 5, 1, 2, 4, 1, 5, 1,
    0, 3, 4, 0, 1, 2, 1, 4, 3, 1,
    0, 2, 4, 1, 1, 3, 0, 3, 4, 1,
    5, 2, 1, 4, 1, 5, 0, 2, 4, 1,
    5, 3, 0, 3, 1, 0, 5, 2, 1, 1,
    3, 5, 0, 2, 1, 1, 5, 3, 0, 1,
    4, 0, 5, 2, 1, 4, 3, 5, 0, 1,
    4, 1, 5, 3, 1, 3, 4, 0, 5, 1
  ]);
  // Mid-level world changes are deliberately irregular and deterministic. The
  // previous `% 5` rule forced every transition to be Nature -> Sky, which made
  // the campaign feel templated. Only the authored Nature -> Sky entry uses the
  // physical Mega Jump; the other entries use the normal phase transition path.
  const LEVEL_TRANSITION_PLANS = Object.freeze({
    5:   { from: 1, to: 2, at: 0.50, kind: 'mega_jump' },
    11:  { from: 0, to: 3, at: 0.54, kind: 'phase' },
    18:  { from: 1, to: 4, at: 0.48, kind: 'phase' },
    26:  { from: 2, to: 5, at: 0.52, kind: 'phase' },
    35:  { from: 3, to: 4, at: 0.46, kind: 'phase' },
    45:  { from: 0, to: 1, at: 0.56, kind: 'phase' },
    56:  { from: 2, to: 3, at: 0.49, kind: 'phase' },
    68:  { from: 4, to: 5, at: 0.53, kind: 'phase' },
    81:  { from: 0, to: 2, at: 0.47, kind: 'phase' },
    95:  { from: 1, to: 5, at: 0.55, kind: 'phase' },
    110: { from: 3, to: 5, at: 0.50, kind: 'phase' }
  });
  const CORE_CONCEPTS = ['mixed', 'slalom', 'traffic', 'jump', 'slide', 'walls', 'rush'];
  // Reward stages stay special, but they no longer repeat on an obvious
  // every-ten-level cadence that made the whole campaign feel templated.
  const BONUS_LEVELS = new Set([10, 24, 41, 63, 88, 116]);

  const ICON_PATHS = Object.freeze({
    levels: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 17.5h7M17.5 14v7"/>',
    mixed: '<path d="M4 7h5l3 5 3-5h5M4 17h5l3-5 3 5h5"/>',
    slalom: '<path d="M5 20c9-3 2-13 14-16"/><path d="m15 4h4v4"/>',
    traffic: '<path d="M5 16V9l2-4h10l2 4v7"/><path d="M3 12h18M7 16v3M17 16v3"/><circle cx="7" cy="13" r="1"/><circle cx="17" cy="13" r="1"/>',
    jump: '<path d="M5 18h14M7 14l5-7 5 7M12 7v11"/>',
    slide: '<path d="M4 17h16M6 7l6 7 6-7M12 14V4"/>',
    walls: '<path d="M3 5h18v14H3zM3 10h18M3 15h18M8 5v5M16 5v5M6 10v5M14 10v5M9 15v4M17 15v4"/>',
    rush: '<path d="m13 2-8 12h7l-1 8 8-12h-7z"/>',
    bonus: '<circle cx="12" cy="12" r="9"/><path d="M9 8h5a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h5M12 6v12"/>',
    coin: '<path d="m12 2 7.5 4.3v11.4L12 22l-7.5-4.3V6.3z"/><path d="M9.5 8h4.2a2 2 0 0 1 0 4H11a2 2 0 0 0 0 4h4M12 6v12"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    flag: '<path d="M5 21V4M5 5h12l-2 4 2 4H5"/>',
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    upgrade: '<path d="m6 12 6-6 6 6"/><path d="m6 20 6-6 6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
  });

  function icon(name, className = 'level-icon') {
    const path = ICON_PATHS[name] || ICON_PATHS.mixed;
    return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`;
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smoothstep = (value) => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };

  function calculateTargetScore(index) {
    // Authored early pacing avoids both extremes from the previous curve:
    // Level 1 is long enough to teach Nature, while Level 2 is less than half
    // of the old 2500-point spike. Later tiers grow in smooth, readable bands.
    // Player Fit onboarding curve: reward the first completion before the
    // 90-second cliff, then make Levels 2-3 long enough to carry an engaged
    // player naturally beyond the three-minute checkpoint. These are explicit
    // authored values so future global multipliers cannot recreate the old L2
    // spike.
    const playerFitTargets = [650, 1050, 1400];
    if (index <= playerFitTargets.length) return playerFitTargets[index - 1];
    const earlyTargets = [700, 1200, 1550, 1900, 2250, 2600, 2950, 3300, 3650, 4000];
    const shorten = (value) => Math.max(250, Math.round((value * 0.83) / 10) * 10);
    if (index <= earlyTargets.length) return shorten(earlyTargets[index - 1]);
    if (index <= 20) return shorten(4000 + (index - 10) * 280);
    if (index <= 30) return shorten(6800 + (index - 20) * 320);
    const late = index - 30;
    return shorten(10000 + late * 80 + late * late * 0.22);
  }

  function hashLevel(index) {
    let value = (Math.imul(index >>> 0, 0x9e3779b1) ^ Math.imul((index + 17) >>> 0, 0x85ebca6b) ^ 0x45d9f3b) >>> 0;
    value ^= value >>> 16;
    value = Math.imul(value, 0x7feb352d) >>> 0;
    value ^= value >>> 15;
    return value >>> 0;
  }

  function getLevelConcept(index) {
    if (BONUS_LEVELS.has(index)) return 'bonus';
    const seed = hashLevel(index);
    let conceptIndex = seed % CORE_CONCEPTS.length;
    if (index > 1 && !BONUS_LEVELS.has(index - 1)) {
      const previousIndex = hashLevel(index - 1) % CORE_CONCEPTS.length;
      if (conceptIndex === previousIndex) {
        conceptIndex = (conceptIndex + 1 + ((seed >>> 8) % (CORE_CONCEPTS.length - 1))) % CORE_CONCEPTS.length;
      }
    }
    return CORE_CONCEPTS[conceptIndex];
  }

  function createLevel(number) {
    const index = clamp(Math.floor(Number(number) || 1), 1, TOTAL_LEVELS);
    const transitionPlan = LEVEL_TRANSITION_PLANS[index] || null;
    const megaJumpTransition = transitionPlan?.kind === 'mega_jump';
    const startThemePhase = transitionPlan ? transitionPlan.from : LEVEL_MAP_SEQUENCE[index - 1];
    const destinationThemePhase = transitionPlan ? transitionPlan.to : startThemePhase;
    const startTheme = THEMES[startThemePhase];
    const destinationTheme = THEMES[destinationThemePhase];
    const concept = getLevelConcept(index);
    const layoutSeed = hashLevel(index);
    const targetScore = calculateTargetScore(index);
    const difficulty = (index - 1) / (TOTAL_LEVELS - 1);
    const onboardingTrafficScale = index === 1 ? 0.58 : (index === 2 ? 0.66 : (index === 3 ? 0.72 : null));
    const onboardingSpawnScale = index === 1 ? 0.94 : (index === 2 ? 0.89 : (index === 3 ? 0.84 : null));
    const onboardingDensity = index === 1 ? 1.38 : (index === 2 ? 1.56 : (index === 3 ? 1.72 : null));
    const onboardingSafety = index === 1 ? 3.4 : (index === 2 ? 2.8 : (index === 3 ? 2.25 : null));
    // Every playable level, including Level 1 and the bonus stages, shares the
    // same distant curve language. The curve renderer keeps the near collision
    // corridor straight, so enabling it here does not alter gameplay physics.
    const curveEnabled = true;
    return Object.freeze({
      number: index,
      theme: transitionPlan ? `${startTheme.id}-to-${destinationTheme.id}` : startTheme.id,
      themePhase: startTheme.phase,
      transitionThemePhase: transitionPlan ? destinationTheme.phase : null,
      transitionAt: transitionPlan ? transitionPlan.at : null,
      transitionLevel: !!transitionPlan,
      transitionKind: transitionPlan?.kind || null,
      megaJumpTransition,
      themeLabel: transitionPlan ? `${startTheme.label} → ${destinationTheme.label}` : startTheme.label,
      themeColor: destinationTheme.color,
      concept,
      layoutSeed,
      targetScore,
      reward: 60 + index * 6 + (concept === 'bonus' ? 90 : 0),
      coinGoal: concept === 'bonus' ? 28 + Math.floor(index / 8) : 8 + Math.floor(index / 12),
      parSeconds: Math.max(34, targetScore / (18 + difficulty * 38)),
      startSpeedBonus: 0.08 + difficulty * 0.28,
      trafficSpeedScale: onboardingTrafficScale ?? (0.72 + difficulty * 0.58),
      spawnIntervalScale: onboardingSpawnScale ?? (0.78 - difficulty * 0.34),
      obstacleDensity: onboardingDensity ?? (1.8 + difficulty * 2.15),
      patternSpacingScale: 0.74 - difficulty * 0.18,
      curveEnabled,
      curveStrength: 1,
      // The original Curved Road Test always opened with a left bend and then
      // alternated every 1000 score. The renderer owns that section change.
      curveDirection: -1,
      safeOpeningSeconds: onboardingSafety ?? (1.8 - difficulty * 0.8),
      finishLead: 190
    });
  }

  const LEVELS = Object.freeze(Array.from({ length: TOTAL_LEVELS }, (_, index) => createLevel(index + 1)));

  class ElementalLevelSystem {
    constructor() {
      this.api = null;
      this.initialized = false;
      this.selectedLevel = 1;
      this.save = this.loadSave();
      this.run = null;
      this.lastHudProgress = -1;
      this.dom = {};
      this.lastCompletion = null;
      this.finishUpgradeOpen = false;
      this.upgradeTutorial = { active: false, phase: '', target: null, pointer: null, raf: 0 };
    }

    loadSave() {
      const fallback = {
        schema: 1,
        highestUnlocked: 1,
        selectedLevel: 1,
        completed: {},
        totalStars: 0,
        upgradeTutorialSeen: false
      };
      try {
        const raw = localStorage.getItem(SAVE_KEY)
          || LEGACY_SAVE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean)
          || 'null';
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return fallback;
        const completed = parsed.completed && typeof parsed.completed === 'object' ? parsed.completed : {};
        return {
          schema: 1,
          highestUnlocked: clamp(Math.floor(Number(parsed.highestUnlocked) || 1), 1, TOTAL_LEVELS),
          selectedLevel: clamp(Math.floor(Number(parsed.selectedLevel) || 1), 1, TOTAL_LEVELS),
          completed,
          totalStars: Math.max(0, Math.floor(Number(parsed.totalStars) || 0)),
          upgradeTutorialSeen: parsed.upgradeTutorialSeen === true
        };
      } catch (_) {
        return fallback;
      }
    }

    persist() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.save));
      } catch (_) {}
    }

    initialize(api) {
      if (this.initialized) {
        this.api = api || this.api;
        return this;
      }
      this.api = api || {};
      this.selectedLevel = clamp(this.save.selectedLevel, 1, this.save.highestUnlocked);
      this.createUi();
      this.bindUi();
      this.refreshMenu();
      this.initialized = true;
      return this;
    }

    copy() {
      const language = String(this.api?.getLanguage?.() || document.documentElement.lang || 'en').toLowerCase();
      const tr = language.startsWith('tr');
      return tr ? {
        levels: 'SEVİYELER', level: 'SEVİYE', play: 'SEVİYEYİ OYNA', locked: 'KİLİTLİ',
        complete: 'SEVİYE TAMAMLANDI', next: 'SONRAKİ SEVİYE', upgrades: 'YÜKSELTMELER',
        menu: 'ANA MENÜ', reward: 'ÖDÜL', best: 'SÜRE', bonus: 'ALTIN BONUSU',
        endless: 'ENDLESS RUN', choose: 'OYNAMAK İÇİN BİR SEVİYEYE TIKLA', finish: 'BİTİŞ ÇİZGİSİ',
        mixed: 'KARMA KOŞU', slalom: 'SLALOM', traffic: 'TRAFİK', jump: 'ZIPLAMA',
        slide: 'EĞİLME', walls: 'DUVAR LABİRENTİ', rush: 'HIZ KOŞUSU',
        totalEarned: 'TOPLAM KAZANÇ', gold: 'ALTIN', upgradeNow: 'YÜKSELTMELERE TIKLA', upgradeScore: 'PUANI YÜKSELT', closeUpgrade: 'KAPAT',
        tutorial: 'EĞİTİM', tutorialComplete: 'EĞİTİM TAMAMLANDI', nextMap: 'SONRAKİ HARİTA', readyForLevel: 'SEVİYE 1 HAZIR'
      } : {
        levels: 'LEVELS', level: 'LEVEL', play: 'PLAY LEVEL', locked: 'LOCKED',
        complete: 'LEVEL COMPLETE', next: 'NEXT LEVEL', upgrades: 'UPGRADES',
        menu: 'MAIN MENU', reward: 'REWARD', best: 'BEST', bonus: 'GOLD BONUS',
        endless: 'ENDLESS RUN', choose: 'CLICK A LEVEL TO PLAY', finish: 'FINISH LINE',
        mixed: 'MIXED RUN', slalom: 'SLALOM', traffic: 'TRAFFIC', jump: 'JUMP COURSE',
        slide: 'SLIDE COURSE', walls: 'WALL MAZE', rush: 'SPEED RUN',
        totalEarned: 'TOTAL EARNED', gold: 'GOLD', upgradeNow: 'OPEN UPGRADES', upgradeScore: 'UPGRADE SCORE', closeUpgrade: 'CLOSE',
        tutorial: 'TUTORIAL', tutorialComplete: 'TUTORIAL COMPLETE', nextMap: 'NEXT MAP', readyForLevel: 'LEVEL 1 READY'
      };
    }

    conceptLabel(level) {
      const text = this.copy();
      return text[level.concept] || level.concept.toUpperCase();
    }

    createUi() {
      if (document.getElementById('menu-levels-btn')) return;
      const style = document.createElement('style');
      style.id = 'elemental-level-style';
      style.textContent = `
        #menu-levels-btn .menu-button-icon{color:#71ecff}
        .level-dialog{width:min(1040px,calc(100vw - 36px));max-height:min(82vh,760px)}
        .level-dialog-summary{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:14px;margin:0 0 14px;padding:13px 15px;border:1px solid rgba(98,211,255,.32);border-radius:14px;background:linear-gradient(135deg,rgba(17,45,80,.82),rgba(7,15,34,.88))}
        .level-dialog-summary strong{display:block;color:#f4fbff;font:900 19px Orbitron,sans-serif;letter-spacing:.08em}.level-dialog-summary span{display:block;margin-top:5px;color:#92bddc;font:700 12px Rajdhani,sans-serif;letter-spacing:.08em}
        .level-dialog-play{min-width:180px;padding:12px 16px;border:1px solid #75e9ff;border-radius:11px;background:linear-gradient(135deg,#61dcff,#5fefc4);color:#071427;font:900 14px Orbitron,sans-serif;letter-spacing:.06em;box-shadow:0 0 25px rgba(73,218,255,.22)}
        .level-grid{display:grid;grid-template-columns:repeat(8,minmax(80px,1fr));gap:9px;overflow:auto;max-height:min(58vh,520px);padding:3px 4px 10px;scrollbar-width:thin}
        .level-card{position:relative;min-height:88px;padding:10px 8px;border:1px solid rgba(93,186,232,.3);border-radius:12px;background:linear-gradient(155deg,rgba(22,45,75,.92),rgba(7,14,31,.96));color:#dff8ff;text-align:left;transition:transform .14s ease,border-color .14s ease,filter .14s ease}
        .level-card:hover,.level-card:focus-visible{transform:translateY(-2px);border-color:#77eaff}.level-card.is-selected{border-color:#ffe26e;box-shadow:0 0 0 1px rgba(255,226,110,.45),0 0 24px rgba(255,207,80,.16)}
        .level-card.is-locked{filter:saturate(.25) brightness(.56);cursor:not-allowed}.level-card-number{font:900 18px Orbitron,sans-serif}.level-card-theme{margin-top:6px;color:var(--level-color,#75eaff);font:800 9px Orbitron,sans-serif;letter-spacing:.08em}.level-card-stars{position:absolute;right:7px;bottom:7px;color:#ffe574;font-size:11px;letter-spacing:1px}.level-card-lock{position:absolute;right:8px;top:8px;font-size:13px;opacity:.72}
        #level-run-hud{position:fixed;left:50%;top:70px;z-index:90;transform:translateX(-50%);display:none;pointer-events:none;width:min(380px,46vw);padding:8px 12px;border:1px solid rgba(103,222,255,.4);border-radius:12px;background:rgba(4,14,34,.76);box-shadow:0 10px 26px rgba(0,0,0,.24);backdrop-filter:blur(5px)}
        #level-run-hud.is-visible{display:block}.level-hud-line{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#effbff;font:900 11px Orbitron,sans-serif;letter-spacing:.07em}.level-hud-line span:last-child{color:#ffe26d}.level-hud-track{height:5px;margin-top:6px;border-radius:99px;background:#07111f;overflow:hidden}.level-hud-fill{width:0;height:100%;background:linear-gradient(90deg,#5ee7ff,#69f1b0,#ffe06b);box-shadow:0 0 12px rgba(96,232,255,.7);transition:width .12s linear}
        #level-complete-overlay{position:fixed;inset:0;z-index:2500;display:none;place-items:center;padding:18px;background:radial-gradient(circle at 50% 38%,rgba(29,91,126,.36),rgba(1,5,18,.88));backdrop-filter:blur(7px)}#level-complete-overlay.is-visible{display:grid}
        .level-complete-card{width:min(520px,calc(100vw - 30px));padding:24px;border:1px solid rgba(108,232,255,.62);border-radius:22px;background:linear-gradient(145deg,rgba(10,30,60,.98),rgba(5,11,28,.98));box-shadow:0 24px 90px rgba(0,0,0,.65),0 0 38px rgba(75,220,255,.18);text-align:center;color:#effcff}.level-complete-kicker{color:#70eaff;font:900 12px Orbitron,sans-serif;letter-spacing:.22em}.level-complete-title{margin:8px 0 0;font:900 clamp(25px,4vw,38px) Orbitron,sans-serif;letter-spacing:.08em}.level-complete-stars{margin:17px 0 8px;color:#ffe36a;font-size:36px;letter-spacing:8px;text-shadow:0 0 20px rgba(255,210,62,.72)}.level-complete-meta{display:flex;justify-content:center;gap:20px;color:#9ec4df;font:800 13px Rajdhani,sans-serif}.level-complete-meta strong{display:block;color:#fff2a0;font:900 21px Orbitron,sans-serif}.level-complete-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}.level-complete-actions button{padding:13px 10px;border:1px solid rgba(108,218,255,.42);border-radius:11px;background:#102640;color:#eaf9ff;font:900 12px Orbitron,sans-serif}.level-complete-actions .is-primary{grid-column:1/-1;background:linear-gradient(135deg,#5fe1ff,#6df0b8);color:#061329;border-color:#8df3ff}
        body.main-menu-active #level-run-hud,body.game-over-active #level-run-hud,body.tutorial-active #level-run-hud{display:none!important}
        body.level-selector-open{overflow:hidden!important}body.level-selector-open #menu-dialog-layer{position:fixed!important;inset:0!important}
        /* Level surfaces use a restrained expedition-board material language.
           It is intentionally matte and warm rather than another neon HUD. */
        .level-icon{display:block;width:1.35em;height:1.35em;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        #menu-levels-btn .menu-button-icon{display:grid;place-items:center;color:#d8b56e}#menu-levels-btn .menu-button-icon .level-icon{width:24px;height:24px}
        #menu-dialog-layer .level-dialog{position:relative;background:linear-gradient(155deg,#1b1d22,#121419)!important;border:1px solid #42464f!important;outline:0!important;border-radius:18px!important;box-shadow:0 24px 64px rgba(0,0,0,.58)!important;color:#f2efe8}
        #menu-dialog-layer .level-dialog::before{display:none!important}
        #menu-dialog-layer .level-dialog .menu-dialog-head{display:flex;align-items:center;background:#1d2026!important;border-bottom:1px solid #373b43!important}
        #menu-dialog-layer .level-dialog .menu-dialog-title{display:flex;align-items:center;gap:9px;color:#f0e9dc!important;letter-spacing:.14em}
        #menu-dialog-layer .level-dialog .menu-dialog-title .level-icon{color:#d5b269;width:20px;height:20px}
        .level-dialog-stats{display:flex;align-items:center;gap:6px;margin-left:auto;margin-right:12px;padding:6px 10px;border:1px solid #3c4048;border-radius:999px;background:#17191e;color:#d9bd78;font:900 10px Orbitron,sans-serif;letter-spacing:.08em}.level-dialog-stats .level-icon{width:14px;height:14px;fill:currentColor;stroke-width:1.2}
        .level-dialog-summary,.level-dialog-play{display:none!important}
        .level-grid{align-content:start;grid-auto-rows:max-content;max-height:min(66vh,590px);scrollbar-color:#777067 #202228}
        .level-card{overflow:hidden;display:grid;grid-template-rows:auto 1fr auto;min-height:112px;padding:12px 11px;border:1px solid #383c45;border-radius:12px;background:linear-gradient(155deg,#272a31,#181a1f);color:#ece8df;box-shadow:0 5px 14px rgba(0,0,0,.2);transform-origin:50% 70%;transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease;animation:level-card-enter .32s var(--level-delay,0ms) ease both}
        .level-card::before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:var(--level-color,#c5a665);opacity:.8}.level-card::after{content:"";position:absolute;right:-25px;top:-28px;width:76px;height:76px;border-radius:50%;background:var(--level-color,#c5a665);opacity:.045;transition:transform .25s ease,opacity .25s ease}
        .level-card:hover,.level-card:focus-visible{z-index:2;transform:translateY(-4px) scale(1.025);border-color:var(--level-color,#77736d);background:linear-gradient(155deg,#30343c,#1e2025);box-shadow:0 12px 24px rgba(0,0,0,.36)}.level-card:hover::after,.level-card:focus-visible::after{transform:scale(1.35);opacity:.1}
        .level-card.is-selected{border-color:#d2ad65;background:linear-gradient(155deg,#332e24,#201e1b);box-shadow:0 8px 20px rgba(0,0,0,.28),inset 0 0 0 1px rgba(210,173,101,.18)}
        .level-card.is-locked{filter:saturate(.25) brightness(.63);cursor:not-allowed}.level-card.is-locked:hover{transform:none;box-shadow:0 5px 14px rgba(0,0,0,.2)}
        .level-card-top{display:flex;align-items:center;justify-content:space-between;gap:6px}.level-card-number{font:900 21px Orbitron,sans-serif;color:#f5f0e6}.level-card-theme{margin:0;color:var(--level-color,#d2ad65);font:800 8px Orbitron,sans-serif;letter-spacing:.09em}.level-card-main{display:flex;align-items:center;gap:8px;margin-top:8px}.level-card-concept-icon{display:grid;place-items:center;width:28px;height:28px;flex:0 0 28px;border:1px solid #41444a;border-radius:8px;background:#15171b;color:var(--level-color,#d2ad65)}.level-card-concept-icon .level-icon{width:16px;height:16px}.level-card-concept{color:#c8c5be;font:800 9px Rajdhani,sans-serif;letter-spacing:.11em;text-align:left}.level-card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:9px}.level-card-stars{position:static;color:#d7b462;font-size:11px;letter-spacing:1px}.level-card-go{color:#96938c;transition:transform .18s ease,color .18s ease}.level-card-go .level-icon{width:16px;height:16px}.level-card:hover .level-card-go,.level-card:focus-visible .level-card-go{color:var(--level-color,#d2ad65);transform:translateX(3px)}.level-card-lock{position:static;color:#9b978f}.level-card-lock .level-icon{width:15px;height:15px}
        body.level-run-active #progress-wrapper,body.level-run-active #progress-text{display:none!important}
        #level-run-hud{top:18px;width:min(470px,52vw);padding:10px 13px;border:1px solid #555962;border-radius:8px;background:rgba(24,26,31,.9);box-shadow:0 8px 24px rgba(0,0,0,.34);backdrop-filter:blur(7px);animation:level-hud-in .34s ease both}
        .level-hud-line{color:#f1ede5;font-size:11px}.level-hud-line span:last-child{color:#d8bb7b}.level-hud-track{height:6px;margin-top:7px;background:#0e0f12;border:1px solid #34373d}.level-hud-fill{background:linear-gradient(90deg,#9c7b43,#e0c47d);box-shadow:none;transition:width .16s linear}
        #level-run-hud.is-finish-armed{border-color:#d2ad65}.is-finish-armed .level-hud-fill{animation:level-finish-pulse .7s ease-in-out infinite alternate}
        #level-complete-overlay{background:rgba(7,8,10,.82);backdrop-filter:blur(9px)}
        .level-complete-card{position:relative;width:min(560px,calc(100vw - 30px));padding:30px 28px 26px;border:1px solid #b49151;border-radius:16px;background:linear-gradient(160deg,#22242a,#14161a);box-shadow:0 28px 80px rgba(0,0,0,.68);color:#f2eee5;overflow:hidden}
        .level-complete-card::after{content:"";position:absolute;inset:0;border:7px solid rgba(255,255,255,.025);pointer-events:none}
        .level-finish-wallet{position:fixed;top:max(18px,env(safe-area-inset-top));right:max(18px,env(safe-area-inset-right));z-index:2;display:flex;align-items:center;gap:10px;min-width:150px;padding:10px 14px;border:1px solid #b49151;border-radius:12px;background:rgba(18,19,23,.94);box-shadow:0 10px 30px rgba(0,0,0,.46);color:#f4efe5;text-align:left}.level-finish-wallet-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#d4aa4d;color:#251b0d;box-shadow:0 0 0 3px rgba(255,222,124,.18)}.level-finish-wallet-icon .level-icon{width:21px;height:21px}.level-finish-wallet-copy{display:grid;gap:2px}.level-finish-wallet-label{color:#bdb6aa;font:800 9px Orbitron,sans-serif;letter-spacing:.15em}.level-finish-wallet-value{color:#ffe08a;font:900 21px Orbitron,sans-serif;line-height:1}.level-finish-wallet.is-celebrating .level-finish-wallet-icon{animation:level-wallet-coin-pop .72s cubic-bezier(.2,.85,.2,1.25) both}.level-finish-wallet.is-celebrating .level-finish-wallet-value{animation:level-wallet-count-glow .9s ease both}
        #level-complete-overlay.is-entering .level-complete-card{animation:level-card-arrive .52s cubic-bezier(.18,.8,.22,1.15) both}
        .level-complete-medal{display:grid;place-items:center;width:66px;height:66px;margin:0 auto 12px;border:2px solid #d2ad65;border-radius:50%;background:#2a251c;color:#e5c77f;font:900 31px Orbitron,sans-serif;animation:level-medal-arrive .7s .18s cubic-bezier(.18,.8,.22,1.2) both}
        .level-complete-kicker{color:#b9b4aa;font-size:10px;letter-spacing:.2em}.level-complete-title{color:#f4efe5;font-size:clamp(25px,4vw,36px);text-shadow:none}.level-complete-stars{color:#d9b661;text-shadow:none}.level-complete-meta{color:#aeadab}.level-complete-meta strong{color:#e5c982}
        .level-complete-actions button{display:flex;align-items:center;justify-content:center;gap:9px;min-height:48px;border:1px solid #4b4f57;background:#25282e;color:#eeeae1;box-shadow:none;transition:transform .16s ease,background .16s ease,border-color .16s ease,filter .16s ease}.level-complete-actions button span{display:inline-flex;align-items:center;line-height:1}.level-complete-actions button .level-icon{width:18px;height:18px;flex:0 0 18px}.level-complete-actions button:hover,.level-complete-actions button:focus-visible{transform:translateY(-2px);filter:brightness(1.12)}.level-complete-actions .is-primary{border-color:#cda95f;background:#cda95f;color:#171511;box-shadow:0 9px 24px rgba(205,169,95,.2)}.level-complete-actions .is-primary:hover,.level-complete-actions .is-primary:focus-visible{background:#dfc278!important;border-color:#dfc278!important}.level-complete-actions #level-upgrades-btn{border-color:#5e9dff;background:linear-gradient(135deg,#174c9e,#246fce 54%,#394fc2);color:#f3f8ff;box-shadow:0 8px 20px rgba(30,91,196,.24)}.level-complete-actions #level-upgrades-btn:hover,.level-complete-actions #level-upgrades-btn:focus-visible{border-color:#8bcaff!important;background:linear-gradient(135deg,#205db8,#2f83e4 54%,#4a61dc)!important}.level-complete-actions #level-menu-btn:hover,.level-complete-actions #level-menu-btn:focus-visible{border-color:#8c867b!important;background:#30333a!important}
        .level-celebration-confetti{position:absolute;inset:0;overflow:hidden;pointer-events:none}.level-celebration-confetti i{position:absolute;left:var(--x);top:-10%;width:9px;height:17px;border-radius:2px;background:#d8b35f;opacity:.95;animation:level-confetti-fall var(--duration) var(--delay) cubic-bezier(.16,.7,.38,1) forwards}.level-celebration-confetti i:nth-child(3n){background:#ded8ca}.level-celebration-confetti i:nth-child(4n){background:#9aab96}.level-celebration-confetti i:nth-child(5n){background:#a88c74}
        .level-hud-title-wrap{display:flex;align-items:center;gap:7px}.level-hud-title-wrap .level-icon{width:15px;height:15px;color:#d8bb7b}
        #level-complete-overlay.is-tutorial-complete .level-finish-wallet,#level-complete-overlay.is-tutorial-complete .level-complete-total-earned,#level-complete-overlay.is-tutorial-complete #level-upgrades-btn,#level-complete-overlay.is-tutorial-complete .level-complete-medal,#level-complete-overlay.is-tutorial-complete .level-complete-kicker,#level-complete-overlay.is-tutorial-complete .level-complete-stars,#level-complete-overlay.is-tutorial-complete .level-complete-meta{display:none!important}
        #level-complete-overlay.is-tutorial-complete{cursor:default}
        #level-complete-overlay.is-tutorial-complete .level-complete-card{width:min(520px,calc(100vw - 30px));padding:clamp(28px,6vmin,54px);text-align:center}
        #level-complete-overlay.is-tutorial-complete .level-complete-title{margin:0 auto;line-height:1.2;text-align:center}
        #level-complete-overlay.is-tutorial-complete .level-complete-actions{grid-template-columns:1fr 1fr}
        #level-complete-overlay.is-tutorial-complete .level-complete-actions{margin:clamp(22px,4vmin,34px) auto 0;width:100%}
        #level-complete-overlay.is-tutorial-complete .level-complete-actions .is-primary{grid-column:auto}
        body.tutorial-complete-active #level-complete-overlay,body.tutorial-complete-active #level-complete-overlay *{cursor:default}body.tutorial-complete-active #level-complete-overlay button{cursor:pointer}
        @keyframes level-card-enter{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}@keyframes level-hud-in{from{opacity:0;transform:translate(-50%,-9px)}to{opacity:1;transform:translate(-50%,0)}}@keyframes level-finish-pulse{to{filter:brightness(1.35)}}@keyframes level-card-arrive{from{opacity:0;transform:translateY(26px) scale(.94)}to{opacity:1;transform:none}}@keyframes level-medal-arrive{from{opacity:0;transform:scale(.35) rotate(-18deg)}to{opacity:1;transform:none}}@keyframes level-wallet-coin-pop{0%{transform:scale(.25) rotate(-35deg)}55%{transform:scale(1.28) rotate(12deg)}100%{transform:scale(1) rotate(0)}}@keyframes level-wallet-count-glow{0%{opacity:.15;transform:translateY(7px)}45%{opacity:1;text-shadow:0 0 18px #f6c75f}100%{transform:none;text-shadow:none}}@keyframes level-confetti-fall{0%{transform:translate3d(0,-10vh,0) rotate(0)}100%{transform:translate3d(var(--drift),112vh,0) rotate(720deg)}}
        @media(max-width:900px){.level-grid{grid-template-columns:repeat(5,minmax(72px,1fr))}}
        @media(max-width:650px){.level-dialog{width:calc(100vw - 18px);max-height:calc(100vh - 18px)}.level-dialog-stats{padding:5px 8px}.level-grid{grid-template-columns:repeat(4,minmax(66px,1fr));max-height:65vh}.level-card{min-height:86px;padding:8px}.level-card-number{font-size:15px}.level-card-main{gap:5px;margin-top:5px}.level-card-concept-icon{width:22px;height:22px;flex-basis:22px}.level-card-concept-icon .level-icon{width:13px;height:13px}.level-card-concept{font-size:8px}#level-run-hud{top:max(54px,env(safe-area-inset-top));width:min(330px,58vw);padding:6px 9px}.level-finish-wallet{top:8px;right:8px;min-width:118px;padding:7px 9px;gap:7px}.level-finish-wallet-icon{width:27px;height:27px}.level-finish-wallet-value{font-size:16px}.level-complete-card{padding:18px}.level-complete-actions{grid-template-columns:1fr}.level-complete-actions .is-primary{grid-column:auto}}
        @media(max-height:500px) and (orientation:landscape){
          #menu-dialog-layer .level-dialog{box-sizing:border-box;height:calc(100dvh - var(--mobile-safe-top,0px) - var(--mobile-safe-bottom,0px));max-height:none!important;grid-template-rows:auto minmax(0,1fr);overflow:hidden!important;padding:2px 11px 6px}
          #menu-dialog-layer .level-dialog .menu-dialog-head{min-height:34px;margin:-2px -2px 2px;padding:2px 7px}
          .level-grid{min-height:0;max-height:none;grid-template-columns:repeat(6,minmax(72px,1fr));gap:6px;padding:1px 3px 5px}
          .level-card{min-height:68px;padding:6px;border-radius:9px}.level-card-number{font-size:13px}.level-card-theme{margin-top:2px;font-size:7px}.level-card-main{margin-top:3px}.level-card-concept-icon{width:19px;height:19px;flex-basis:19px}.level-card-foot{margin-top:3px}
          #level-complete-overlay{place-items:center;padding:6px;overflow:hidden}
          .level-complete-card{width:min(690px,calc(100vw - 14px));padding:10px 14px;border-radius:15px}
          .level-complete-kicker{font-size:9px}.level-complete-title{margin-top:3px;font-size:20px;line-height:1.12}
          .level-complete-stars{margin:5px 0 2px;font-size:25px;letter-spacing:5px}.level-complete-meta{gap:18px;font-size:10px}.level-complete-meta strong{font-size:15px}
          .level-complete-actions{grid-template-columns:1.3fr 1fr 1fr;gap:7px;margin-top:8px}.level-complete-actions .is-primary{grid-column:auto}.level-complete-actions button{padding:8px 7px;font-size:9px}
        }
        @media(prefers-reduced-motion:reduce){#level-run-hud,#level-complete-overlay.is-entering .level-complete-card,.level-complete-medal,.level-celebration-confetti i,.level-card{animation:none!important}.level-card{transition:none}}
      `;
      document.head.appendChild(style);

      const nav = document.querySelector('#main-menu .menu-button-stack');
      const start = document.getElementById('menu-start-btn');
      if (nav && start) {
        const button = document.createElement('button');
        button.id = 'menu-levels-btn';
        button.className = 'menu-button primary';
        button.type = 'button';
        button.innerHTML = '<span class="menu-button-icon" aria-hidden="true">▦</span><span class="menu-button-text">LEVELS</span>';
        button.innerHTML = `<span class="menu-button-icon" aria-hidden="true">${icon('levels')}</span><span class="menu-button-text">LEVELS</span>`;
        start.classList.remove('primary');
        nav.insertBefore(button, start);
        this.dom.menuButton = button;
      }

      const layer = document.getElementById('menu-dialog-layer');
      if (layer) {
        const dialog = document.createElement('section');
        dialog.id = 'menu-levels-dialog';
        dialog.className = 'menu-dialog level-dialog';
        dialog.setAttribute('aria-hidden', 'true');
        // Level cards start immediately on click, so the redundant selected
        // level / Play Level strip is intentionally absent.
        dialog.innerHTML = `<div class="menu-dialog-head"><div class="menu-dialog-title">${icon('levels')}<span>LEVELS</span></div><div class="level-dialog-stats" aria-label="Level stars">${icon('star')}<span id="level-star-total">0 / ${TOTAL_LEVELS * 3}</span></div><button class="menu-dialog-close level-dialog-close" type="button" aria-label="Close">x</button></div><div id="level-grid" class="level-grid"></div>`;
        layer.appendChild(dialog);
        this.dom.dialog = dialog;
        this.dom.grid = dialog.querySelector('#level-grid');
        this.dom.starTotal = dialog.querySelector('#level-star-total');
        this.dom.close = dialog.querySelector('.level-dialog-close');
      }

      const hud = document.createElement('div');
      hud.id = 'level-run-hud';
      hud.setAttribute('aria-live', 'polite');
      hud.innerHTML = '<div class="level-hud-line"><span id="level-hud-title"></span><span id="level-hud-value"></span></div><div class="level-hud-track"><div id="level-hud-fill" class="level-hud-fill"></div></div>';
      hud.innerHTML = `<div class="level-hud-line"><span class="level-hud-title-wrap">${icon('flag')}<span id="level-hud-title"></span></span><span id="level-hud-value"></span></div><div class="level-hud-track"><div id="level-hud-fill" class="level-hud-fill"></div></div>`;
      document.body.appendChild(hud);
      this.dom.hud = hud;
      this.dom.hudTitle = hud.querySelector('#level-hud-title');
      this.dom.hudValue = hud.querySelector('#level-hud-value');
      this.dom.hudFill = hud.querySelector('#level-hud-fill');

      const complete = document.createElement('div');
      complete.id = 'level-complete-overlay';
      complete.setAttribute('aria-hidden', 'true');
      complete.innerHTML = '<div class="level-celebration-confetti" aria-hidden="true"></div><section class="level-complete-card" role="dialog" aria-modal="true"><div class="level-complete-medal" aria-hidden="true"><span>✓</span></div><div class="level-complete-kicker"></div><h2 class="level-complete-title"></h2><div class="level-complete-stars"></div><div class="level-complete-meta"><span class="level-complete-reward"></span><span class="level-complete-best"></span></div><div class="level-complete-actions"><button id="level-next-btn" class="is-primary" type="button"></button><button id="level-upgrades-btn" type="button"></button><button id="level-menu-btn" type="button"></button></div></section>';
      complete.innerHTML = `<div class="level-celebration-confetti" aria-hidden="true"></div><div class="level-complete-coins" aria-hidden="true"></div><div class="level-finish-wallet" aria-live="polite"><span class="level-finish-wallet-icon" aria-hidden="true">${icon('coin')}</span><span class="level-finish-wallet-copy"><span class="level-finish-wallet-label"></span><strong class="level-finish-wallet-value"></strong></span></div><section class="level-complete-card" role="dialog" aria-modal="true"><div class="level-complete-medal" aria-hidden="true">${icon('flag')}</div><div class="level-complete-kicker"></div><h2 class="level-complete-title"></h2><div class="level-complete-stars"></div><div class="level-complete-total-earned"><span class="level-earned-coin" aria-hidden="true">◆</span><span class="level-earned-label"></span><strong class="level-earned-value"></strong></div><div class="level-complete-meta"><span class="level-complete-reward"></span><span class="level-complete-best"></span></div><div class="level-complete-actions"><button id="level-next-btn" class="is-primary" type="button"></button><button id="level-upgrades-btn" type="button"></button><button id="level-menu-btn" type="button"></button></div></section>`;
      document.body.appendChild(complete);
      this.dom.complete = complete;
      this.dom.next = complete.querySelector('#level-next-btn');
      this.dom.upgrades = complete.querySelector('#level-upgrades-btn');
      this.dom.menu = complete.querySelector('#level-menu-btn');
    }

    bindUi() {
      this.dom.menuButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        this.openSelector();
      });
      this.dom.close?.addEventListener('click', (event) => {
        event.stopPropagation();
        this.closeSelector();
      });
      this.dom.play?.addEventListener('click', (event) => {
        event.stopPropagation();
        this.closeSelector();
        this.api?.startLevel?.(this.selectedLevel, { source: 'level-selector' });
      });
      this.dom.grid?.addEventListener('click', (event) => {
        const card = event.target.closest('[data-level]');
        if (!card) return;
        const number = Number(card.dataset.level);
        if (number > this.save.highestUnlocked) return;
        this.selectLevel(number);
        this.closeSelector();
        this.api?.startLevel?.(number, { source: 'level-selector' });
      });
      this.dom.next?.addEventListener('click', (event) => {
        event.stopPropagation();
        this.api?.measure?.('button', 'next-level', 'interact');
        this.abortUpgradeTutorial();
        if (this.lastCompletion?.tutorial === true) {
          this.hideCompletion();
          this.selectLevel(1);
          this.api?.startLevel?.(1, { source: 'tutorial-next' });
          return;
        }
        if ((this.run?.level?.number || 0) >= TOTAL_LEVELS) {
          this.hideCompletion();
          this.api?.showMenu?.();
          return;
        }
        const next = Math.min(TOTAL_LEVELS, (this.run?.level?.number || this.selectedLevel) + 1);
        this.hideCompletion();
        this.selectLevel(next);
        this.api?.startLevel?.(next, { source: 'next-level' });
      });
      this.dom.upgrades?.addEventListener('click', (event) => {
        event.stopPropagation();
        this.api?.measure?.('button', 'finish-upgrade', 'interact');
        this.openUpgradesFromCompletion();
      });
      this.dom.menu?.addEventListener('click', (event) => {
        event.stopPropagation();
        this.abortUpgradeTutorial();
        this.hideCompletion();
        this.api?.showMenu?.();
      });
    }

    openSelector() {
      const layer = document.getElementById('menu-dialog-layer');
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.body.classList.add('level-selector-open');
      document.querySelectorAll('.menu-dialog').forEach((dialog) => {
        dialog.classList.remove('is-open');
        dialog.setAttribute('aria-hidden', 'true');
      });
      layer?.classList.add('is-open');
      layer?.setAttribute('aria-hidden', 'false');
      this.dom.dialog?.classList.add('is-open');
      this.dom.dialog?.setAttribute('aria-hidden', 'false');
      this.renderSelector();
    }

    closeSelector() {
      const layer = document.getElementById('menu-dialog-layer');
      document.body.classList.remove('level-selector-open');
      this.dom.dialog?.classList.remove('is-open');
      this.dom.dialog?.setAttribute('aria-hidden', 'true');
      layer?.classList.remove('is-open');
      layer?.setAttribute('aria-hidden', 'true');
    }

    renderSelector() {
      if (!this.dom.grid) return;
      const text = this.copy();
      const titleNode = this.dom.dialog.querySelector('.menu-dialog-title span');
      if (titleNode) titleNode.textContent = text.levels;
      if (this.dom.starTotal) this.dom.starTotal.textContent = `${this.save.totalStars} / ${TOTAL_LEVELS * 3}`;
      this.dom.grid.innerHTML = LEVELS.map((level) => {
        const locked = level.number > this.save.highestUnlocked;
        const record = this.save.completed[level.number] || null;
        const stars = record ? clamp(record.stars || 1, 1, 3) : 0;
        const delay = Math.min((level.number - 1) % 24, 12) * 18;
        const starText = stars ? '&#9733;'.repeat(stars) : '&#183; &#183; &#183;';
        const status = locked ? `<span class="level-card-lock">${icon('lock')}</span>` : `<span class="level-card-go">${icon('arrow')}</span>`;
        return `<button class="level-card${locked ? ' is-locked' : ''}${level.number === this.selectedLevel ? ' is-selected' : ''}${record ? ' is-completed' : ''}" type="button" data-level="${level.number}" style="--level-color:${level.themeColor};--level-delay:${delay}ms" ${locked ? 'aria-disabled="true"' : ''} aria-label="${text.level} ${level.number}, ${this.conceptLabel(level)}"><span class="level-card-top"><span class="level-card-number">${String(level.number).padStart(2, '0')}</span><span class="level-card-theme">${level.themeLabel}</span></span><span class="level-card-main"><span class="level-card-concept-icon">${icon(level.concept)}</span><span class="level-card-concept">${this.conceptLabel(level)}</span></span><span class="level-card-foot"><span class="level-card-stars">${starText}</span>${status}</span></button>`;
      }).join('');
      /* legacy selector renderer retained below for rollback reference */
      return;
      const selected = LEVELS[this.selectedLevel - 1];
      this.dom.dialog.querySelector('.menu-dialog-title').textContent = text.levels;
      this.dom.selectedTitle.textContent = `${text.level} ${selected.number} · ${selected.themeLabel}`;
      this.dom.selectedCopy.textContent = `${this.conceptLabel(selected)} · ${selected.targetScore.toLocaleString()} · ${text.reward} ${selected.reward} · ${text.choose}`;
      this.dom.play.textContent = text.play;
      this.dom.grid.innerHTML = LEVELS.map((level) => {
        const locked = level.number > this.save.highestUnlocked;
        const record = this.save.completed[level.number] || null;
        const stars = record ? clamp(record.stars || 1, 1, 3) : 0;
        return `<button class="level-card${locked ? ' is-locked' : ''}${level.number === this.selectedLevel ? ' is-selected' : ''}" type="button" data-level="${level.number}" style="--level-color:${level.themeColor}" ${locked ? 'aria-disabled="true"' : ''}><span class="level-card-top"><span class="level-card-number">${String(level.number).padStart(2, '0')}</span><span class="level-card-theme">${level.themeLabel}</span></span><span class="level-card-concept">${this.conceptLabel(level)}</span>${locked ? '<span class="level-card-lock">◆</span>' : ''}<span class="level-card-stars">${stars ? '★'.repeat(stars) : '· · ·'}</span></button>`;
      }).join('');
    }

    selectLevel(number) {
      const next = clamp(Math.floor(Number(number) || 1), 1, this.save.highestUnlocked);
      this.selectedLevel = next;
      this.save.selectedLevel = next;
      this.persist();
      this.renderSelector();
      this.refreshMenu();
      return next;
    }

    refreshMenu() {
      const text = this.copy();
      if (this.dom.menuButton) {
        const label = this.dom.menuButton.querySelector('.menu-button-text');
        if (label) label.textContent = text.levels;
      }
      const startLabel = document.getElementById('menu-start-label');
      if (startLabel && document.body.classList.contains('main-menu-active')) {
        startLabel.textContent = text.endless;
      }
      this.renderSelector();
    }

    deactivateForEndless() {
      this.run = null;
      this.lastHudProgress = -1;
      this.hideCompletion();
      this.dom.hud?.classList.remove('is-visible', 'is-finish-armed');
      document.body.classList.remove('level-run-active');
    }

    beginRun(options) {
      const requested = clamp(Math.floor(Number(options?.level) || this.selectedLevel), 1, this.save.highestUnlocked);
      this.selectLevel(requested);
      const level = LEVELS[requested - 1];
      this.run = {
        level,
        active: !options?.tutorial,
        tutorialPending: !!options?.tutorial,
        completed: false,
        finishArmed: false,
        themeTransitionDone: false,
        scoreBase: Number(options?.scoreBase) || 0,
        elapsed: 0,
        coinsAtStart: Number(options?.coins) || 0
      };
      this.lastHudProgress = -1;
      this.hideCompletion();
      this.updateHud(0);
      this.dom.hud?.classList.toggle('is-visible', this.run.active);
      document.body.classList.toggle('level-run-active', this.run.active);
      if (this.run.active) this.api?.onLevelStart?.({ level, source: options?.source || 'campaign' });
      return level;
    }

    activateAfterTutorial(score, coins) {
      if (!this.run || !this.run.tutorialPending) this.beginRun({ level: 1, tutorial: false, scoreBase: score, coins });
      this.run.tutorialPending = false;
      this.run.active = true;
      this.run.scoreBase = Number(score) || 0;
      this.run.coinsAtStart = Number(coins) || 0;
      this.run.elapsed = 0;
      this.dom.hud?.classList.add('is-visible');
      document.body.classList.add('level-run-active');
      this.updateHud(0);
      this.api?.onLevelStart?.({ level: this.run.level, source: 'tutorial-complete' });
      return this.run.level;
    }

    setScoreBase(score) {
      if (this.run) this.run.scoreBase = Number(score) || 0;
    }

    update(payload) {
      if (!this.run?.active || this.run.completed) return null;
      this.run.elapsed += Math.max(0, Number(payload?.delta) || 0);
      const progress = Math.max(0, (Number(payload?.score) || 0) - this.run.scoreBase);
      this.updateHud(progress);
      if (
        this.run.level.transitionThemePhase !== null
        && !this.run.themeTransitionDone
        && progress >= this.run.level.targetScore * this.run.level.transitionAt
      ) {
        this.run.themeTransitionDone = true;
        this.api?.onThemeTransition?.({
          level: this.run.level,
          sourcePhase: this.run.level.themePhase,
          targetPhase: this.run.level.transitionThemePhase,
          progress
        });
      }
      if (progress + 0.0001 < this.run.level.targetScore) return null;
      if (!this.run.finishArmed) {
        this.run.finishArmed = true;
        this.dom.hud?.classList.add('is-finish-armed');
        if (this.dom.hudTitle) this.dom.hudTitle.textContent = `${this.copy().finish} · ${this.run.level.number}`;
        this.api?.onFinishArmed?.({ level: this.run.level, progress });
      }
      return null;
    }

    crossFinish(payload = {}) {
      if (!this.run?.active || this.run.completed || !this.run.finishArmed) return null;
      return this.complete({
        progress: Math.max(this.run.level.targetScore, (Number(payload.score) || 0) - this.run.scoreBase),
        score: Number(payload.score) || 0,
        coins: Math.max(0, (Number(payload.coins) || 0) - this.run.coinsAtStart),
        elapsed: this.run.elapsed
      });
    }

    complete(result) {
      if (!this.run || this.run.completed) return null;
      this.run.completed = true;
      this.run.active = false;
      const level = this.run.level;
      const stars = 1 + (result.coins >= level.coinGoal ? 1 : 0) + (result.elapsed <= level.parSeconds ? 1 : 0);
      const old = this.save.completed[level.number] || {};
      this.save.completed[level.number] = {
        stars: Math.max(Number(old.stars) || 0, stars),
        bestTime: old.bestTime ? Math.min(old.bestTime, result.elapsed) : result.elapsed,
        bestCoins: Math.max(Number(old.bestCoins) || 0, result.coins)
      };
      this.save.highestUnlocked = Math.max(this.save.highestUnlocked, Math.min(TOTAL_LEVELS, level.number + 1));
      this.save.totalStars = Object.values(this.save.completed).reduce((sum, entry) => sum + clamp(Number(entry.stars) || 0, 0, 3), 0);
      this.save.selectedLevel = Math.min(TOTAL_LEVELS, level.number + 1);
      this.selectedLevel = this.save.selectedLevel;
      this.persist();
      const completion = { ...result, level, stars, reward: level.reward };
      this.showCompletion(completion);
      this.refreshMenu();
      this.api?.onLevelComplete?.(completion);
      return completion;
    }

    updateHud(progress) {
      if (!this.run) return;
      const rounded = Math.floor(progress);
      if (rounded === this.lastHudProgress) return;
      this.lastHudProgress = rounded;
      const text = this.copy();
      const target = this.run.level.targetScore;
      const pct = clamp(progress / target, 0, 1) * 100;
      if (this.dom.hudTitle) this.dom.hudTitle.textContent = `${text.level} ${this.run.level.number} · ${this.run.level.themeLabel}`;
      if (this.dom.hudValue) this.dom.hudValue.textContent = `${Math.min(rounded, target).toLocaleString()} / ${target.toLocaleString()}`;
      if (this.dom.hudFill) this.dom.hudFill.style.width = `${pct.toFixed(2)}%`;
    }

    showCompletion(result) {
      if (!this.dom.complete) return;
      const text = this.copy();
      this.lastCompletion = result;
      this.finishUpgradeOpen = false;
      this.abortUpgradeTutorial(false);
      document.body.classList.remove('tutorial-complete-active');
      this.dom.complete.classList.remove('is-tutorial-complete');
      this.dom.complete.querySelector('.level-complete-kicker').textContent = `${result.level.themeLabel} · ${this.conceptLabel(result.level)}`;
      this.dom.complete.querySelector('.level-complete-title').textContent = `${text.complete} · ${result.level.number}`;
      this.dom.complete.querySelector('.level-complete-stars').textContent = '★'.repeat(result.stars) + '☆'.repeat(3 - result.stars);
      this.dom.complete.querySelector('.level-complete-reward').innerHTML = `${text.reward}<strong>+${result.reward}</strong>`;
      this.dom.complete.querySelector('.level-complete-best').innerHTML = `${text.best}<strong>${result.elapsed.toFixed(1)}s</strong>`;
      const totalEarned = Math.max(0, Math.floor(Number(result.reward) || 0) + Math.floor(Number(result.coins) || 0));
      this.dom.complete.querySelector('.level-earned-label').textContent = text.totalEarned;
      this.dom.complete.querySelector('.level-earned-value').textContent = `+${totalEarned}`;
      const currentWallet = Math.max(0, Math.floor(Number(this.api?.getWalletGold?.()) || 0));
      const finalWallet = currentWallet + totalEarned;
      const wallet = this.dom.complete.querySelector('.level-finish-wallet');
      this.dom.complete.querySelector('.level-finish-wallet-label').textContent = text.gold;
      this.dom.complete.querySelector('.level-finish-wallet-value').textContent = finalWallet.toLocaleString();
      wallet?.classList.remove('is-celebrating');
      if (wallet) {
        void wallet.offsetWidth;
        wallet.classList.add('is-celebrating');
      }
      this.dom.next.innerHTML = `${icon(result.level.number >= TOTAL_LEVELS ? 'menu' : 'arrow')}<span>${result.level.number >= TOTAL_LEVELS ? text.menu : text.next}</span>`;
      this.dom.upgrades.innerHTML = `${icon('upgrade')}<span>${text.upgrades}</span>`;
      this.dom.menu.innerHTML = `${icon('menu')}<span>${text.menu}</span>`;
      this.dom.complete.classList.add('is-visible');
      this.dom.complete.classList.remove('is-entering');
      void this.dom.complete.offsetWidth;
      this.dom.complete.classList.add('is-entering');
      this.dom.complete.setAttribute('aria-hidden', 'false');
      this.dom.hud?.classList.remove('is-visible');
      this.launchCelebration();
      this.api?.measure?.('button', 'next-level', 'visible');
      this.api?.measure?.('button', 'finish-upgrade', 'visible');
      if (result.level.number === 1 && !this.save.upgradeTutorialSeen) this.beginUpgradeTutorial(result);
    }

    showTutorialCompletion(result = {}) {
      if (!this.dom.complete) return;
      const text = this.copy();
      const tutorialLevel = Object.freeze({
        number: 0,
        themeLabel: 'CITY',
        concept: 'mixed',
        targetScore: Math.max(1, Number(result.score) || 1)
      });
      this.run = {
        level: tutorialLevel,
        active: false,
        tutorialPending: false,
        completed: true,
        finishArmed: false,
        scoreBase: 0,
        elapsed: Number(result.elapsed) || 0,
        coinsAtStart: Number(result.coins) || 0
      };
      this.lastCompletion = { ...result, level: tutorialLevel, tutorial: true };
      this.finishUpgradeOpen = false;
      this.abortUpgradeTutorial(false);
      document.body.classList.add('tutorial-complete-active');
      this.dom.complete.classList.add('is-tutorial-complete');
      this.dom.complete.querySelector('.level-complete-kicker').textContent = `CITY · ${text.tutorial}`;
      this.dom.complete.querySelector('.level-complete-title').textContent = text.tutorialComplete;
      this.dom.next.innerHTML = `${icon('arrow')}<span>${text.next}</span>`;
      this.dom.menu.innerHTML = `${icon('menu')}<span>${text.menu}</span>`;
      this.dom.complete.classList.add('is-visible');
      this.dom.complete.classList.remove('is-entering');
      void this.dom.complete.offsetWidth;
      this.dom.complete.classList.add('is-entering');
      this.dom.complete.setAttribute('aria-hidden', 'false');
      this.dom.hud?.classList.remove('is-visible');
      this.launchCelebration();
      this.api?.measure?.('screen', 'tutorial-complete', 'visible');
      this.api?.measure?.('button', 'next-level', 'visible');
    }

    beginUpgradeTutorial(result) {
      this.save.upgradeTutorialSeen = true;
      this.persist();
      this.dom.complete?.classList.add('is-upgrade-tutorial');
      this.launchCoinCelebration(Math.max(0, (Number(result.reward) || 0) + (Number(result.coins) || 0)));
      this.upgradeTutorial.active = true;
      requestAnimationFrame(() => this.pointUpgradeTutorialAt(this.dom.upgrades, 'finish-upgrade', this.copy().upgradeNow));
    }

    launchCoinCelebration(amount) {
      const layer = this.dom.complete?.querySelector('.level-complete-coins');
      if (!layer) return;
      const count = Math.max(12, Math.min(28, Math.round(12 + amount / 10)));
      layer.innerHTML = Array.from({ length: count }, (_, index) => {
        const x = 16 + ((index * 37) % 68);
        const delay = ((index * 11) % 17) / 20;
        const drift = -90 + ((index * 31) % 180);
        return `<i style="--coin-x:${x}%;--coin-delay:${delay}s;--coin-drift:${drift}px">◆</i>`;
      }).join('');
    }

    ensureUpgradeTutorialPointer() {
      if (this.upgradeTutorial.pointer?.isConnected) return this.upgradeTutorial.pointer;
      const pointer = document.createElement('div');
      pointer.id = 'level-upgrade-tutorial-pointer';
      pointer.setAttribute('aria-hidden', 'true');
      // The pointer sits above the highlighted control whenever there is room,
      // so the hand must point down at the actual target (not back up at the UI).
      pointer.innerHTML = '<span class="level-tutorial-hand">👇</span><span class="level-tutorial-label"></span>';
      document.body.appendChild(pointer);
      this.upgradeTutorial.pointer = pointer;
      return pointer;
    }

    pointUpgradeTutorialAt(target, phase, label) {
      if (!this.upgradeTutorial.active || !target) return;
      this.upgradeTutorial.target?.classList.remove('level-tutorial-target');
      this.upgradeTutorial.target = target;
      this.upgradeTutorial.phase = phase;
      target.classList.add('level-tutorial-target');
      const pointer = this.ensureUpgradeTutorialPointer();
      const hand = pointer.querySelector('.level-tutorial-hand');
      if (hand) hand.textContent = '👇';
      pointer.querySelector('.level-tutorial-label').textContent = label || '';
      pointer.classList.add('is-visible');
      cancelAnimationFrame(this.upgradeTutorial.raf);
      const sync = () => {
        if (!this.upgradeTutorial.active || this.upgradeTutorial.target !== target || !target.isConnected) return;
        const rect = target.getBoundingClientRect();
        const pointerRect = pointer.getBoundingClientRect();
        const left = clamp(rect.left + rect.width * 0.5 - pointerRect.width * 0.5, 8, Math.max(8, innerWidth - pointerRect.width - 8));
        const above = rect.top > pointerRect.height + 22;
        const top = above ? rect.top - pointerRect.height - 14 : rect.bottom + 14;
        pointer.style.left = `${left}px`;
        pointer.style.top = `${clamp(top, 8, Math.max(8, innerHeight - pointerRect.height - 8))}px`;
        pointer.classList.toggle('is-below', !above);
        this.upgradeTutorial.raf = requestAnimationFrame(sync);
      };
      sync();
    }

    openUpgradesFromCompletion() {
      if (!this.dom.complete?.classList.contains('is-visible')) return;
      this.finishUpgradeOpen = true;
      this.dom.complete.classList.add('is-background');
      this.dom.complete.querySelector('.level-complete-card')?.setAttribute('aria-modal', 'false');
      this.api?.openUpgrades?.({ fromLevelFinish: true });
      if (this.upgradeTutorial.active) {
        requestAnimationFrame(() => this.pointUpgradeTutorialAt(document.getElementById('score-upgrade-btn'), 'score-upgrade', this.copy().upgradeScore));
      }
    }

    notifyUpgradePurchased(kind) {
      if (!this.upgradeTutorial.active || !this.finishUpgradeOpen || kind !== 'score') return false;
      const close = document.querySelector('#menu-upgrades-dialog .menu-dialog-close');
      requestAnimationFrame(() => this.pointUpgradeTutorialAt(close, 'close-upgrade', this.copy().closeUpgrade));
      return true;
    }

    handleUpgradeDialogClosed() {
      if (!this.finishUpgradeOpen) return false;
      this.finishUpgradeOpen = false;
      this.dom.complete?.classList.remove('is-background');
      this.dom.complete?.querySelector('.level-complete-card')?.setAttribute('aria-modal', 'true');
      this.abortUpgradeTutorial();
      this.dom.complete?.classList.add('is-visible');
      return true;
    }

    isFinishUpgradeOpen() { return this.finishUpgradeOpen; }

    abortUpgradeTutorial(removeCoinFx = true) {
      cancelAnimationFrame(this.upgradeTutorial.raf);
      this.upgradeTutorial.target?.classList.remove('level-tutorial-target');
      this.upgradeTutorial.pointer?.remove();
      this.upgradeTutorial = { active: false, phase: '', target: null, pointer: null, raf: 0 };
      this.dom.complete?.classList.remove('is-upgrade-tutorial');
      if (removeCoinFx) {
        const coins = this.dom.complete?.querySelector('.level-complete-coins');
        if (coins) coins.innerHTML = '';
      }
    }

    launchCelebration() {
      const layer = this.dom.complete?.querySelector('.level-celebration-confetti');
      if (!layer) return;
      layer.innerHTML = Array.from({ length: 42 }, (_, index) => {
        const left = (index * 37) % 100;
        const delay = ((index * 13) % 18) / 10;
        const duration = 2.4 + ((index * 7) % 12) / 10;
        const drift = -60 + ((index * 29) % 120);
        return `<i style="--x:${left}%;--delay:${delay}s;--duration:${duration}s;--drift:${drift}px"></i>`;
      }).join('');
    }

    hideCompletion() {
      this.abortUpgradeTutorial();
      this.finishUpgradeOpen = false;
      document.body.classList.remove('tutorial-complete-active');
      this.dom.complete?.classList.remove('is-visible');
      this.dom.complete?.classList.remove('is-entering', 'is-background', 'is-tutorial-complete');
      this.dom.complete?.setAttribute('aria-hidden', 'true');
      const layer = this.dom.complete?.querySelector('.level-celebration-confetti');
      if (layer) layer.innerHTML = '';
    }

    getSelectedLevel() { return this.selectedLevel; }
    getLevelDefinition(number) { return LEVELS[clamp(Math.floor(Number(number) || 1), 1, TOTAL_LEVELS) - 1]; }
    getActiveLevel() { return this.run?.level || LEVELS[this.selectedLevel - 1]; }
    isActive() { return !!this.run?.active && !this.run?.completed; }
    allowsAutoRewind() { return this.isActive() && this.run.level.number <= 3; }
    isFinishArmed() { return !!this.run?.finishArmed && this.isActive(); }
    isBonusLevel() { return this.isActive() && this.run.level.concept === 'bonus'; }
    getTuning() { return this.getActiveLevel(); }

    getProgress(score) {
      if (!this.run) return 0;
      return clamp(((Number(score) || 0) - this.run.scoreBase) / this.run.level.targetScore, 0, 1);
    }

    snapshot(score) {
      const level = this.getActiveLevel();
      return {
        enabled: true,
        totalLevels: TOTAL_LEVELS,
        selected: this.selectedLevel,
        highestUnlocked: this.save.highestUnlocked,
        totalStars: this.save.totalStars,
        active: this.isActive(),
        autoRewindEligible: this.allowsAutoRewind(),
        tutorialPending: !!this.run?.tutorialPending,
        completed: !!this.run?.completed,
        finishArmed: !!this.run?.finishArmed,
        themeTransitionDone: !!this.run?.themeTransitionDone,
        number: level.number,
        theme: level.theme,
        concept: level.concept,
        targetScore: level.targetScore,
        progressScore: this.run ? Math.max(0, Math.floor((Number(score) || 0) - this.run.scoreBase)) : 0,
        progress: this.getProgress(score),
        curveEnabled: level.curveEnabled,
        curveStrength: level.curveStrength
      };
    }

    // Local deterministic QA only. These helpers are omitted on portal hosts.
    installQa() {
      const host = location.hostname;
      if (host !== 'localhost' && host !== '127.0.0.1') return;
      window.__ELEMENTAL_LEVEL_QA__ = {
        levels: LEVELS,
        mapSequence: LEVEL_MAP_SEQUENCE,
        transitionPlans: LEVEL_TRANSITION_PLANS,
        targetScore: (number) => createLevel(number).targetScore,
        select: (number) => this.selectLevel(number),
        unlock: (number) => {
          this.save.highestUnlocked = clamp(Math.floor(Number(number) || 1), 1, TOTAL_LEVELS);
          this.persist();
          this.refreshMenu();
          return this.snapshot(0);
        },
        snapshot: (score = 0) => this.snapshot(score),
        showTutorialCompletion: () => this.showTutorialCompletion({ score: 300, elapsed: 42, coins: 12 }),
        smoothstep
      };
    }
  }

  const system = new ElementalLevelSystem();
  system.installQa();
  Object.defineProperty(window, 'ElementalLevelSystem', {
    value: system,
    configurable: false,
    enumerable: false,
    writable: false
  });
})();
