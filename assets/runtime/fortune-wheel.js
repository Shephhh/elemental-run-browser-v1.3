(function () {
  'use strict';

  const STORAGE_KEY = 'elemental-run-fortune-v1';
  const COOLDOWN_SECONDS = 5 * 60;
  const FIRST_REWARD_ID = 'speed-5m';
  const UPDATE_INTERVAL_MS = 250;
  const SPEED_REWARD_MULTIPLIER = 1.2;
  const SPIN_DURATION_MS = 7200;

  const COPY = Object.freeze({
    en: {
      title: 'LUCKY WHEEL', spin: 'SPIN THE WHEEL', spinning: 'GOOD LUCK!',
      won: 'YOU WON', continue: 'CONTINUE', ready: 'READY', locked: 'COMPLETE LEVEL 2',
      next: 'NEXT SPIN', speed: '2× SPEED', score: '2× SCORE', gold: 'GOLD'
    },
    tr: {
      title: 'ŞANS ÇARKI', spin: 'ÇARKA TIKLA / ÇEVİR', spinning: 'BOL ŞANS!',
      won: 'KAZANDIN', continue: 'DEVAM ET', ready: 'HAZIR', locked: '2. SEVİYEYİ BİTİR',
      next: 'SONRAKİ ÇARK', speed: '2× HIZ', score: '2× PUAN', gold: 'ALTIN'
    },
    de: { title:'GLÜCKSRAD', spin:'RAD DREHEN', spinning:'VIEL GLÜCK!', won:'GEWONNEN', continue:'WEITER', ready:'BEREIT', locked:'LEVEL 2 ABSCHLIESSEN', next:'NÄCHSTER DREH', speed:'2× TEMPO', score:'2× PUNKTE', gold:'GOLD' },
    fr: { title:'ROUE DE LA CHANCE', spin:'TOURNE LA ROUE', spinning:'BONNE CHANCE !', won:'GAGNÉ', continue:'CONTINUER', ready:'PRÊT', locked:'TERMINE LE NIVEAU 2', next:'PROCHAIN TOUR', speed:'VITESSE ×2', score:'SCORE ×2', gold:'OR' },
    es: { title:'RULETA DE LA SUERTE', spin:'GIRA LA RULETA', spinning:'¡BUENA SUERTE!', won:'HAS GANADO', continue:'CONTINUAR', ready:'LISTO', locked:'COMPLETA EL NIVEL 2', next:'SIGUIENTE GIRO', speed:'VELOCIDAD ×2', score:'PUNTOS ×2', gold:'ORO' },
    pt: { title:'RODA DA SORTE', spin:'GIRAR A RODA', spinning:'BOA SORTE!', won:'VOCÊ GANHOU', continue:'CONTINUAR', ready:'PRONTO', locked:'CONCLUA O NÍVEL 2', next:'PRÓXIMO GIRO', speed:'VELOCIDADE ×2', score:'PONTOS ×2', gold:'OURO' },
    ru: { title:'КОЛЕСО УДАЧИ', spin:'КРУТИТЬ КОЛЕСО', spinning:'УДАЧИ!', won:'НАГРАДА', continue:'ДАЛЕЕ', ready:'ГОТОВО', locked:'ПРОЙДИТЕ УРОВЕНЬ 2', next:'СЛЕДУЮЩИЙ ХОД', speed:'СКОРОСТЬ ×2', score:'ОЧКИ ×2', gold:'ЗОЛОТО' },
    ja: { title:'ラッキールーレット', spin:'ルーレットを回す', spinning:'グッドラック！', won:'獲得', continue:'続ける', ready:'準備完了', locked:'レベル2をクリア', next:'次のスピン', speed:'スピード 2倍', score:'スコア 2倍', gold:'ゴールド' },
    ko: { title:'행운의 룰렛', spin:'룰렛 돌리기', spinning:'행운을 빌어요!', won:'보상 획득', continue:'계속', ready:'준비 완료', locked:'레벨 2 완료', next:'다음 룰렛', speed:'속도 2배', score:'점수 2배', gold:'골드' },
    zh: { title:'幸运转盘', spin:'点击转盘', spinning:'祝你好运！', won:'获得奖励', continue:'继续', ready:'可旋转', locked:'完成第2关', next:'下次转盘', speed:'双倍速度', score:'双倍分数', gold:'金币' }
  });

  const REWARDS = Object.freeze([
    { id:'speed-5m', type:'speed', seconds:300, accent:'#4ff2ff', icon:'speed' },
    { id:'gold-100', type:'gold', amount:100, accent:'#ffd64d', icon:'gold' },
    { id:'score-5m', type:'score', seconds:300, accent:'#ca71ff', icon:'score' },
    { id:'gold-50', type:'gold', amount:50, accent:'#ffb73f', icon:'gold' },
    { id:'speed-2m', type:'speed', seconds:120, accent:'#45d8ff', icon:'speed' },
    { id:'gold-75', type:'gold', amount:75, accent:'#ffe471', icon:'gold' },
    { id:'score-3m', type:'score', seconds:180, accent:'#a981ff', icon:'score' },
    { id:'gold-25', type:'gold', amount:25, accent:'#ffca58', icon:'gold' }
  ]);

  const safeParse = (value, fallback) => {
    try { return JSON.parse(value) || fallback; } catch (error) { return fallback; }
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const now = () => Date.now();
  const formatTimer = (seconds) => {
    const safe = Math.max(0, Math.ceil(Number(seconds) || 0));
    return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
  };
  const iconSvg = (name, className = '') => {
    const common = `class="${className}" viewBox="0 0 48 48" aria-hidden="true" focusable="false"`;
    if (name === 'gold') return `<svg ${common}><path d="M24 3 38 11v26L24 45 10 37V11L24 3Z"/><path d="M24 11 31 15v18l-7 4-7-4V15l7-4Z" class="fortune-icon-cut"/></svg>`;
    if (name === 'score') return `<svg ${common}><path d="M7 36h7V22H7v14Zm13 0h8V12h-8v24Zm14 0h7V5h-7v31Z"/><path d="m6 15 10-7 8 6L41 3" fill="none" stroke="currentColor" stroke-width="4"/></svg>`;
    if (name === 'wheel') return `<svg ${common}><circle cx="24" cy="24" r="19"/><path d="M24 5v38M5 24h38M10.5 10.5l27 27m0-27-27 27" class="fortune-icon-cut"/><circle cx="24" cy="24" r="5" class="fortune-icon-cut"/></svg>`;
    return `<svg ${common}><path d="m27 2-17 25h13l-2 19 17-27H26l1-17Z"/></svg>`;
  };

  class ElementalFortuneWheel {
    constructor() {
      this.api = null;
      this.initialized = false;
      this.overlayOpen = false;
      this.spinning = false;
      this.pendingSource = null;
      this.rotation = 0;
      this.lastSelectedIndex = -1;
      this.lastLandingErrorDegrees = null;
      this.spinTimer = 0;
      this.saveAccumulator = 0;
      this.lastUiTick = 0;
      this.state = this.load();
      this.dom = {};
    }

    load() {
      const saved = safeParse(localStorage.getItem(STORAGE_KEY), {});
      return {
        version: 1,
        firstLevelTwoSpinClaimed: !!saved.firstLevelTwoSpinClaimed,
        cooldownActiveSeconds: clamp(Number(saved.cooldownActiveSeconds) || 0, 0, COOLDOWN_SECONDS),
        speedUntil: Math.max(0, Number(saved.speedUntil) || 0),
        scoreUntil: Math.max(0, Number(saved.scoreUntil) || 0),
        spins: Math.max(0, Math.floor(Number(saved.spins) || 0))
      };
    }

    persist() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch (error) {}
    }

    languageKey() {
      const raw = String(this.api?.getLanguage?.() || document.documentElement.lang || 'en').toLowerCase();
      if (raw.startsWith('tr')) return 'tr';
      if (raw.startsWith('de')) return 'de';
      if (raw.startsWith('fr')) return 'fr';
      if (raw.startsWith('es')) return 'es';
      if (raw.startsWith('pt')) return 'pt';
      if (raw.startsWith('ru')) return 'ru';
      if (raw.startsWith('ja')) return 'ja';
      if (raw.startsWith('ko')) return 'ko';
      if (raw.startsWith('zh')) return 'zh';
      return 'en';
    }

    copy() { return COPY[this.languageKey()] || COPY.en; }

    rewardLabel(reward) {
      const copy = this.copy();
      if (reward.type === 'gold') return `${reward.amount} ${copy.gold}`;
      const duration = formatTimer(reward.seconds);
      return `${reward.type === 'speed' ? copy.speed : copy.score} · ${duration}`;
    }

    wheelRewardLabel(reward) {
      const copy = this.copy();
      if (reward.type === 'gold') return { main: String(reward.amount), sub: copy.gold };
      const source = reward.type === 'speed' ? copy.speed : copy.score;
      const sub = String(source)
        .replace(/2\s*[×x]/gi, '')
        .replace(/[×x]\s*2/gi, '')
        .replace(/双倍|2倍/g, '')
        .trim() || (reward.type === 'speed' ? 'SPEED' : 'SCORE');
      return { main: '2×', sub };
    }

    wheelSliceMarkup(reward, index) {
      const label = this.wheelRewardLabel(reward);
      return `<div class="fortune-slice-label" style="--slice:${index};--accent:${reward.accent}"><span class="fortune-slice-copy"><strong>${label.main}</strong><small>${label.sub}</small></span>${iconSvg(reward.icon)}</div>`;
    }

    initialize(api = {}) {
      this.api = api;
      if (this.initialized) {
        this.refreshUi(true);
        return this;
      }
      this.initialized = true;
      this.createUi();
      this.bindEvents();
      this.refreshUi(true);
      this.lastUiTick = performance.now();
      this.uiTimer = window.setInterval(() => this.refreshUi(false), UPDATE_INTERVAL_MS);
      window.addEventListener('beforeunload', () => this.persist(), { once:true });
      return this;
    }

    createUi() {
      const overlay = document.createElement('div');
      overlay.id = 'fortune-wheel-overlay';
      overlay.className = 'fortune-wheel-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = `
        <section class="fortune-panel" role="dialog" aria-modal="true" aria-labelledby="fortune-title">
          <div class="fortune-ambient" aria-hidden="true"></div>
          <p class="fortune-kicker">LEVEL REWARD</p>
          <h2 id="fortune-title" class="fortune-title"></h2>
          <div class="fortune-stage">
            <div class="fortune-pointer" aria-hidden="true"></div>
            <button class="fortune-wheel-button" type="button" aria-label="Spin the wheel">
              <div class="fortune-wheel-disc">
                ${REWARDS.map((reward, index) => this.wheelSliceMarkup(reward, index)).join('')}
                <div class="fortune-wheel-hub"><span class="fortune-wheel-hub-text"></span></div>
              </div>
            </button>
          </div>
          <p class="fortune-prompt" aria-live="polite"></p>
          <div class="fortune-result" aria-live="assertive" hidden>
            <div class="fortune-result-icon"></div>
            <span class="fortune-result-kicker"></span>
            <strong class="fortune-result-label"></strong>
            <button class="fortune-continue" type="button"></button>
          </div>
        </section>`;
      document.body.appendChild(overlay);

      const hud = document.createElement('aside');
      hud.id = 'fortune-active-boosts';
      hud.className = 'fortune-active-boosts';
      hud.setAttribute('aria-live', 'polite');
      document.body.appendChild(hud);

      const dock = document.getElementById('browser-reward-dock');
      if (dock) {
        const slot = document.createElement('div');
        slot.className = 'fortune-menu-slot';
        slot.innerHTML = `<button class="fortune-menu-button" type="button" aria-label="Lucky Wheel">${iconSvg('wheel')}<span class="fortune-menu-state"></span><i class="fortune-ready-dot" aria-hidden="true"></i></button><span class="fortune-menu-label"></span>`;
        (dock.querySelector('.menu-utility-row') || dock).appendChild(slot);
        this.dom.menuSlot = slot;
        this.dom.menuButton = slot.querySelector('.fortune-menu-button');
        this.dom.menuState = slot.querySelector('.fortune-menu-state');
        this.dom.menuLabel = slot.querySelector('.fortune-menu-label');
      }

      this.dom.overlay = overlay;
      this.dom.panel = overlay.querySelector('.fortune-panel');
      this.dom.title = overlay.querySelector('.fortune-title');
      this.dom.wheelButton = overlay.querySelector('.fortune-wheel-button');
      this.dom.disc = overlay.querySelector('.fortune-wheel-disc');
      this.dom.hubText = overlay.querySelector('.fortune-wheel-hub-text');
      this.dom.prompt = overlay.querySelector('.fortune-prompt');
      this.dom.result = overlay.querySelector('.fortune-result');
      this.dom.resultIcon = overlay.querySelector('.fortune-result-icon');
      this.dom.resultKicker = overlay.querySelector('.fortune-result-kicker');
      this.dom.resultLabel = overlay.querySelector('.fortune-result-label');
      this.dom.continueButton = overlay.querySelector('.fortune-continue');
      this.dom.hud = hud;
    }

    bindEvents() {
      this.dom.wheelButton?.addEventListener('click', () => this.spin());
      this.dom.continueButton?.addEventListener('click', () => this.close());
      this.dom.menuButton?.addEventListener('click', () => {
        if (this.canOpenFromMenu()) this.open('menu');
      });
      this.dom.overlay?.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') event.preventDefault();
        if ((event.key === 'Enter' || event.key === ' ') && !this.spinning && this.dom.result?.hidden) {
          event.preventDefault();
          this.spin();
        }
      });
    }

    canOpenFromMenu() {
      return this.state.firstLevelTwoSpinClaimed && this.state.cooldownActiveSeconds >= COOLDOWN_SECONDS && !this.overlayOpen;
    }

    onLevelCompleted(completion) {
      const number = Number(completion?.level?.number) || 0;
      if (number !== 2 || this.state.firstLevelTwoSpinClaimed || this.overlayOpen) return false;
      window.setTimeout(() => this.open('level2'), 700);
      return true;
    }

    open(source = 'menu') {
      if (this.overlayOpen || this.spinning) return false;
      const isFirst = !this.state.firstLevelTwoSpinClaimed;
      if (source === 'menu' && !this.canOpenFromMenu()) return false;
      if (source === 'level2' && !isFirst) return false;
      this.pendingSource = source;
      this.overlayOpen = true;
      this.dom.result.hidden = true;
      this.dom.panel?.classList.remove('has-result', 'is-spinning');
      this.dom.overlay?.classList.add('is-visible');
      this.dom.overlay?.setAttribute('aria-hidden', 'false');
      document.body.classList.add('fortune-wheel-open');
      this.api?.onOverlayOpen?.(source);
      this.refreshUi(true);
      window.setTimeout(() => this.dom.wheelButton?.focus({ preventScroll:true }), 40);
      return true;
    }

    chooseRewardIndex() {
      if (!this.state.firstLevelTwoSpinClaimed) return REWARDS.findIndex((reward) => reward.id === FIRST_REWARD_ID);
      const values = new Uint32Array(1);
      if (window.crypto?.getRandomValues) window.crypto.getRandomValues(values);
      else values[0] = Math.floor(Math.random() * 0xffffffff);
      return values[0] % REWARDS.length;
    }

    spin() {
      if (!this.overlayOpen || this.spinning || !this.dom.result?.hidden) return false;
      this.spinning = true;
      this.dom.panel?.classList.add('is-spinning');
      this.dom.wheelButton.disabled = true;
      const index = this.chooseRewardIndex();
      const sliceDegrees = 360 / REWARDS.length;
      // The conic gradient starts at -half a slice, therefore slice 0 is
      // already centred under the top pointer. Targeting +half a slice was
      // the old divider-landing bug.
      const desiredModulo = ((-index * sliceDegrees) % 360 + 360) % 360;
      const currentModulo = ((this.rotation % 360) + 360) % 360;
      const correction = (desiredModulo - currentModulo + 360) % 360;
      const extraTurns = 9 + (this.state.spins % 3);
      const target = this.rotation + extraTurns * 360 + correction;
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      const duration = reducedMotion ? 1250 : SPIN_DURATION_MS;
      this.lastSelectedIndex = index;
      this.lastLandingErrorDegrees = Math.abs((((target + index * sliceDegrees) % 360) + 540) % 360 - 180);
      this.rotation = target;
      this.dom.disc.style.setProperty('--fortune-spin-duration', `${duration}ms`);
      this.dom.disc.style.transform = `rotate(${target}deg)`;
      this.refreshUi(true);
      window.clearTimeout(this.spinTimer);
      this.spinTimer = window.setTimeout(() => this.finishSpin(REWARDS[index]), duration + 90);
      return true;
    }

    finishSpin(reward) {
      if (!reward || !this.overlayOpen) return;
      this.spinning = false;
      this.dom.wheelButton.disabled = false;
      this.dom.panel?.classList.remove('is-spinning');
      this.dom.panel?.classList.add('has-result');
      this.applyReward(reward);
      this.state.spins += 1;
      this.state.firstLevelTwoSpinClaimed = true;
      this.state.cooldownActiveSeconds = 0;
      this.persist();
      const copy = this.copy();
      this.dom.result.hidden = false;
      this.dom.resultIcon.innerHTML = iconSvg(reward.icon);
      this.dom.resultKicker.textContent = copy.won;
      this.dom.resultLabel.textContent = this.rewardLabel(reward);
      this.dom.continueButton.textContent = copy.continue;
      this.refreshUi(true);
      window.setTimeout(() => this.dom.continueButton?.focus({ preventScroll:true }), 80);
    }

    applyReward(reward) {
      if (reward.type === 'gold') {
        this.api?.grantGold?.(reward.amount);
        return;
      }
      const key = reward.type === 'speed' ? 'speedUntil' : 'scoreUntil';
      this.state[key] = Math.max(now(), Number(this.state[key]) || 0) + reward.seconds * 1000;
    }

    close() {
      if (!this.overlayOpen || this.spinning || this.dom.result?.hidden) return false;
      this.overlayOpen = false;
      this.pendingSource = null;
      this.dom.overlay?.classList.remove('is-visible');
      this.dom.overlay?.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('fortune-wheel-open');
      this.api?.onOverlayClose?.();
      this.refreshUi(true);
      return true;
    }

    update(delta, activeGameplay) {
      if (!this.initialized) return;
      const safeDelta = Math.max(0, Math.min(0.25, Number(delta) || 0));
      if (activeGameplay && this.state.firstLevelTwoSpinClaimed && this.state.cooldownActiveSeconds < COOLDOWN_SECONDS) {
        this.state.cooldownActiveSeconds = Math.min(COOLDOWN_SECONDS, this.state.cooldownActiveSeconds + safeDelta);
        this.saveAccumulator += safeDelta;
        if (this.saveAccumulator >= 2) {
          this.saveAccumulator = 0;
          this.persist();
        }
      }
    }

    isSpeedActive() { return Number(this.state.speedUntil) > now(); }
    isScoreActive() { return Number(this.state.scoreUntil) > now(); }
    // The reward remains branded as "2× SPEED", but its gameplay tuning is a
    // safer 20% boost so obstacle timing and collision readability stay fair.
    getSpeedMultiplier() { return this.isSpeedActive() ? SPEED_REWARD_MULTIPLIER : 1; }
    getScoreMultiplier() { return this.isScoreActive() ? 2 : 1; }

    activeBoosts() {
      const current = now();
      const boosts = [];
      if (this.state.speedUntil > current) boosts.push({ type:'speed', until:this.state.speedUntil, icon:'speed' });
      if (this.state.scoreUntil > current) boosts.push({ type:'score', until:this.state.scoreUntil, icon:'score' });
      return boosts;
    }

    refreshUi(force) {
      if (!this.initialized) return;
      const copy = this.copy();
      if (this.dom.title) this.dom.title.textContent = copy.title;
      if (this.dom.hubText) this.dom.hubText.textContent = copy.title;
      if (this.dom.prompt) this.dom.prompt.textContent = this.spinning ? copy.spinning : copy.spin;
      if (this.dom.menuLabel) this.dom.menuLabel.textContent = copy.title;

      const boosts = this.activeBoosts();
      if (this.dom.hud) {
        this.dom.hud.innerHTML = boosts.map((boost) => {
          const seconds = (boost.until - now()) / 1000;
          return `<div class="fortune-boost is-${boost.type}">${iconSvg(boost.icon)}<strong>2×</strong><time>${formatTimer(seconds)}</time></div>`;
        }).join('');
        this.dom.hud.classList.toggle('is-visible', boosts.length > 0);
      }

      if (this.dom.menuButton) {
        const ready = this.canOpenFromMenu();
        const locked = !this.state.firstLevelTwoSpinClaimed;
        const remaining = COOLDOWN_SECONDS - this.state.cooldownActiveSeconds;
        this.dom.menuButton.disabled = !ready;
        this.dom.menuButton.classList.toggle('is-ready', ready);
        this.dom.menuButton.classList.toggle('is-locked', locked);
        if (this.dom.menuState) this.dom.menuState.textContent = locked ? copy.locked : (ready ? copy.ready : formatTimer(remaining));
      }
      if (this.dom.continueButton && !this.dom.result?.hidden) this.dom.continueButton.textContent = copy.continue;
      if (force) this.persist();
    }

    snapshot() {
      return {
        initialized: this.initialized,
        open: this.overlayOpen,
        spinning: this.spinning,
        firstSpinClaimed: this.state.firstLevelTwoSpinClaimed,
        cooldownSeconds: Math.round(this.state.cooldownActiveSeconds * 100) / 100,
        cooldownReady: this.state.cooldownActiveSeconds >= COOLDOWN_SECONDS,
        speedRemaining: Math.max(0, Math.ceil((this.state.speedUntil - now()) / 1000)),
        scoreRemaining: Math.max(0, Math.ceil((this.state.scoreUntil - now()) / 1000)),
        spins: this.state.spins,
        speedMultiplier: this.getSpeedMultiplier(),
        selectedIndex: this.lastSelectedIndex,
        landingErrorDegrees: this.lastLandingErrorDegrees
      };
    }
  }

  const instance = new ElementalFortuneWheel();
  Object.defineProperty(window, 'ElementalFortuneWheel', { value:instance, configurable:false, writable:false });
})();
