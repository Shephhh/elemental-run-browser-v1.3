(function () {
  'use strict';

  const STATES = Object.freeze({
    IDLE: 'idle',
    GATE: 'start-gate',
    COUNTDOWN: 'countdown',
    JUMP_APPROACH: 'jump-approach',
    JUMP_PROMPT: 'jump-prompt',
    JUMP_CLEAR: 'jump-clear',
    SLIDE_APPROACH: 'slide-approach',
    SLIDE_PROMPT: 'slide-prompt',
    SLIDE_CLEAR: 'slide-clear',
    LANE_APPROACH: 'lane-approach',
    LANE_PROMPT: 'lane-prompt',
    BUNNY_APPROACH: 'bunny-approach',
    BUNNY_RUN: 'bunny-run',
    PRACTICE_APPROACH: 'practice-approach',
    PRACTICE_PROMPT: 'practice-prompt',
    PRACTICE_CLEAR: 'practice-clear',
    FREE_RUN: 'free-run',
    FINISH_APPROACH: 'finish-approach',
    REWIND: 'rewind',
    EXIT: 'exit',
    COMPLETE: 'complete'
  });
  const TUTORIAL_UI_VERSION = 9;
  // Trigger early enough for a screenshot, a low-FPS device, or a deliberate
  // mobile swipe without making the lesson feel like an instant reaction test.
  const ACTION_PROMPT_DISTANCE = 32;
  const LESSON_ORDER = Object.freeze({ jump: 0, slide: 1, lane: 2, bunny: 3, practice: 4 });

  class ElementalTutorialDirector {
    constructor(hooks) {
      this.hooks = hooks || {};
      this.state = STATES.IDLE;
      this.active = false;
      this.elapsed = 0;
      this.actionElapsed = 0;
      this.hazards = [];
      this.history = [];
      this.rewind = null;
      this.recoveryTimer = 0;
      this.practiceIndex = -1;
      // Platform SDKs can finish asynchronously and may cause the host boot
      // sequence to ask for the entry gate more than once. Once the player has
      // consumed it, never let a late callback cancel an active tutorial and
      // put PRESS ANY BUTTON back over gameplay.
      this.gateConsumed = false;
      this.ensureDom();
    }

    ensureDom() {
      if (document.getElementById('elemental-tutorial-layer')) return;
      const style = document.createElement('style');
      style.id = 'elemental-tutorial-style';
      style.textContent = `
        #elemental-tutorial-layer{position:fixed;inset:0;z-index:2600;pointer-events:none;font-family:Orbitron,system-ui,sans-serif;color:#fff}
        .tutorial-prompt{position:absolute;left:50%;top:20%;transform:translate(-50%,-12px) scale(.96);width:min(360px,calc(100vw - 36px));padding:13px 16px;border:1px solid rgba(117,235,255,.68);border-radius:16px;background:linear-gradient(145deg,rgba(3,13,36,.94),rgba(7,20,50,.76));box-shadow:0 18px 56px rgba(0,0,0,.42),0 0 24px rgba(0,224,255,.2);text-align:center;opacity:0;transition:opacity .16s ease,transform .16s ease}
        .tutorial-prompt.is-visible{opacity:1;transform:translate(-50%,0) scale(1)}
        .tutorial-prompt-kicker,.tutorial-prompt-title,.tutorial-input-label{display:none}.tutorial-prompt-input{display:flex;justify-content:center;align-items:center;color:#ffe671}.tutorial-keyset{display:flex;justify-content:center;align-items:center;gap:9px}.tutorial-key{display:inline-grid;place-items:center;min-width:54px;height:56px;padding:0 11px;border:1px solid rgba(255,255,255,.64);border-bottom-width:5px;border-radius:12px;background:linear-gradient(#45628d,#172944);color:#fff;font-size:18px;font-weight:900;letter-spacing:.06em;box-shadow:0 5px 0 rgba(0,0,0,.3),0 0 18px rgba(90,228,255,.28)}.tutorial-key.is-space{min-width:100px}.tutorial-key.is-arrow{font-size:25px}.tutorial-key-divider{color:rgba(184,244,255,.78);font-size:18px;font-weight:900;text-shadow:0 0 12px rgba(90,228,255,.5)}.tutorial-swipe{font-size:64px;line-height:.9;color:#8df7ff;text-shadow:0 0 24px rgba(0,236,255,.9);animation:tutorial-swipe-pulse .82s ease-in-out infinite alternate}.tutorial-bunny-set{display:flex;flex-direction:column;align-items:center;gap:8px}.tutorial-bunny-rhythm{display:flex;gap:13px;color:#8df7ff;font-size:22px;line-height:1;text-shadow:0 0 17px rgba(54,224,255,.9)}.tutorial-bunny-rhythm span{animation:tutorial-bunny-pulse .78s ease-in-out infinite alternate}.tutorial-bunny-rhythm span:nth-child(2){animation-delay:.14s}.tutorial-bunny-rhythm span:nth-child(3){animation-delay:.28s}
        .tutorial-prompt.is-good-luck{top:13%;width:auto;min-width:230px;padding:10px 18px;border-color:rgba(255,224,99,.78);background:rgba(4,13,32,.72);box-shadow:0 12px 44px rgba(0,0,0,.38),0 0 28px rgba(255,208,82,.26)}.tutorial-good-luck{display:inline-block!important;color:#fff0a2;font-size:clamp(17px,2.1vw,25px);font-weight:900;letter-spacing:.16em;text-shadow:0 0 20px rgba(255,209,80,.92),0 0 38px rgba(69,222,255,.32)}
        .tutorial-gate{pointer-events:auto;position:absolute;inset:0;display:block;opacity:0;visibility:hidden;background:radial-gradient(ellipse at 50% 50%,rgba(6,19,46,.04) 0%,rgba(1,7,22,.42) 58%,rgba(0,2,10,.82) 100%),linear-gradient(180deg,rgba(0,4,16,.55),rgba(0,4,16,.15) 46%,rgba(0,4,16,.7));transition:opacity .24s ease}.tutorial-gate.is-visible{opacity:1;visibility:visible}.tutorial-gate-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:0;background:transparent;text-align:center}.tutorial-gate-title,.tutorial-gate-text{display:none}.tutorial-gate-button{cursor:pointer;min-width:clamp(240px,31vw,360px);min-height:clamp(64px,9vh,82px);padding:17px 42px;border:2px solid rgba(165,247,255,.96);border-radius:15px;background:linear-gradient(180deg,rgba(55,207,242,.98),rgba(15,91,163,.98));color:#fff;font:900 clamp(18px,2.25vw,27px) Orbitron,system-ui,sans-serif;letter-spacing:.16em;text-shadow:0 2px 5px rgba(0,18,45,.7);box-shadow:inset 0 2px 0 rgba(255,255,255,.58),0 9px 0 rgba(3,38,78,.92),0 18px 42px rgba(0,207,255,.38);transition:transform .12s ease,filter .12s ease,box-shadow .12s ease}.tutorial-gate-button:hover{filter:brightness(1.13);transform:translateY(-2px)}.tutorial-gate-button:focus-visible{outline:3px solid #fff5a8;outline-offset:5px}.tutorial-gate-button:active{transform:translateY(5px);box-shadow:inset 0 1px 0 rgba(255,255,255,.42),0 3px 0 rgba(3,38,78,.9),0 8px 20px rgba(0,207,255,.28)}
        .tutorial-skip{display:none;pointer-events:auto;position:absolute;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));padding:8px 13px;border:1px solid rgba(192,225,255,.52);border-radius:9px;color:#e8f7ff;background:rgba(4,12,29,.76);font:800 clamp(9px,1.3vmin,12px) Orbitron,system-ui,sans-serif;letter-spacing:.1em;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.3)}body.crazygames-build.tutorial-start-screen .tutorial-skip,body.crazygames-build.tutorial-active .tutorial-skip{display:block}.tutorial-skip:hover,.tutorial-skip:focus-visible{border-color:#8df7ff;color:#fff;outline:2px solid rgba(141,247,255,.34);outline-offset:2px}
        .tutorial-rewind-flash{position:absolute;inset:0;opacity:0;background:repeating-linear-gradient(0deg,rgba(86,234,255,.18) 0 2px,transparent 2px 8px),radial-gradient(circle at 50% 50%,rgba(71,215,255,.22),rgba(1,7,26,.55) 73%);mix-blend-mode:screen;transition:opacity .08s linear}.tutorial-rewind-flash.is-visible{opacity:1;animation:tutorial-rewind-flicker .12s steps(2,end) infinite}.tutorial-rewind-icon{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.86);font-size:58px;color:#b7f9ff;text-shadow:0 0 28px rgba(61,225,255,.85);opacity:0;transition:opacity .1s ease,transform .12s ease}.tutorial-rewind-icon.is-visible{opacity:1;transform:translate(-50%,-50%) scale(1)}
        @keyframes tutorial-start-blink{50%{opacity:.22}}@keyframes tutorial-swipe-pulse{to{transform:translateY(-7px);filter:brightness(1.4)}}@keyframes tutorial-bunny-pulse{to{transform:translateY(-5px) scale(1.12);filter:brightness(1.45)}}@keyframes tutorial-rewind-flicker{50%{filter:hue-rotate(35deg) brightness(1.45)}}
        body.tutorial-start-screen #ui,body.tutorial-start-screen #progress-wrapper,body.tutorial-start-screen #progress-text,body.tutorial-start-screen #bhop-container,body.tutorial-start-screen #doublejump-cooldown,body.tutorial-start-screen #mobile-controls,body.tutorial-start-screen #mobile-pause-btn,body.tutorial-start-screen #crosshair{display:none!important}
        @media (max-width:650px){.tutorial-prompt{top:max(10%,env(safe-area-inset-top));padding:11px 14px;border-radius:14px}.tutorial-prompt.is-good-luck{top:max(10%,env(safe-area-inset-top));min-width:0}.tutorial-key{min-width:48px;height:51px;font-size:16px}.tutorial-key.is-space{min-width:88px}.tutorial-swipe{font-size:58px}.tutorial-gate-card{top:50%;width:calc(100% - 34px)}.tutorial-gate-button{min-width:min(78vw,300px);min-height:60px;font-size:16px;letter-spacing:.1em}}
      `;
      document.head.appendChild(style);
      style.textContent += `
        body.tutorial-active #progress-wrapper,body.tutorial-active #progress-text{display:none!important}
        .tutorial-lesson-progress{position:absolute;left:50%;top:max(18px,env(safe-area-inset-top));transform:translateX(-50%);display:flex;gap:6px;align-items:center;padding:9px 12px;border:1px solid #c2a46b66;border-radius:18px;background:#10202bc9}
        .tutorial-lesson-progress[hidden]{display:none}.tutorial-lesson-progress i{display:block;width:9px;height:9px;border-radius:50%;background:#5b6c75;transition:background .2s,transform .2s}.tutorial-lesson-progress i.is-done{background:#72f1b8}.tutorial-lesson-progress i.is-current{background:#f4d58d;transform:scale(1.25)}
        @media(max-height:500px){.tutorial-lesson-progress{top:10px;padding:7px 10px;gap:5px}.tutorial-lesson-progress i{width:7px;height:7px}}
        body.tutorial-countdown-active>canvas{filter:blur(2px) brightness(.9)!important}
        .tutorial-countdown{position:absolute;inset:0;display:grid;place-content:center;text-align:center;background:rgba(4,12,21,.28);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);font-weight:900;text-shadow:0 4px 22px #0009}
        .tutorial-countdown[hidden]{display:none}.tutorial-countdown b{font-size:clamp(26px,5vw,58px);color:#f4d58d;letter-spacing:.08em}.tutorial-countdown span{font-size:clamp(68px,13vw,140px);line-height:1.2;color:#fff}
        @media(prefers-reduced-motion:reduce){.tutorial-countdown *{animation:none!important}}
      `;
      const layer = document.createElement('section');
      layer.id = 'elemental-tutorial-layer';
      layer.dataset.tutorialUiVersion = String(TUTORIAL_UI_VERSION);
      layer.setAttribute('aria-live', 'polite');
      layer.innerHTML = '<div class="tutorial-prompt" aria-hidden="true"><div class="tutorial-prompt-kicker"></div><div class="tutorial-prompt-title"></div><div class="tutorial-prompt-input"></div></div><div class="tutorial-gate" aria-hidden="true"><div class="tutorial-gate-card"><div class="tutorial-gate-title"></div><div class="tutorial-gate-text"></div><button class="tutorial-gate-button" type="button"></button></div></div><button class="tutorial-skip" type="button" aria-label="Skip tutorial">SKIP</button><div class="tutorial-rewind-flash" aria-hidden="true"></div><div class="tutorial-rewind-icon" aria-hidden="true">↶</div>';
      document.body.appendChild(layer);
      const progress=document.createElement('div');progress.className='tutorial-lesson-progress';progress.hidden=true;progress.setAttribute('role','progressbar');layer.appendChild(progress);
      const countdown=document.createElement('div');countdown.className='tutorial-countdown';countdown.hidden=true;countdown.innerHTML='<b></b><span></span>';layer.appendChild(countdown);
      layer.querySelector('.tutorial-gate').addEventListener('pointerdown', (event) => {
        if (this.state !== STATES.GATE) return;
        if (!event.target.closest('.tutorial-gate-button')) return;
        event.preventDefault();
        this.start(event);
      });
      layer.querySelector('.tutorial-skip').addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (this.state === STATES.GATE) this.start(event);
        this.skip();
      });
      window.addEventListener('keydown', (event) => {
        if (this.state !== STATES.GATE || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
        // Escape is reserved for releasing pointer lock / browser chrome. It
        // must never consume the entry gate and leave a prepared run paused
        // behind it when the browser rejects capture on that same key.
        if (event.code === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        event.preventDefault();
        this.start(event);
      }, true);
    }

    copy() {
      return typeof this.hooks.copy === 'function' ? this.hooks.copy() : {
        title: 'LEARN THE RUN', start: 'START TUTORIAL', intro: 'Learn the moves, then continue straight into Level 1.',
        jumpTitle: 'JUMP OVER THE TRAFFIC', slideTitle: 'SLIDE UNDER THE BARRIER', laneTitle: 'MOVE TO AN OUTER LANE', bunnyTitle: 'KEEP JUMPING',
        desktopJump: 'SPACE / W / UP ARROW', desktopSlide: 'C / DOWN ARROW / S', desktopLane: 'A / D / LEFT / RIGHT', mobileJump: 'SWIPE UP', mobileSlide: 'SWIPE DOWN', mobileLane: 'SWIPE LEFT OR RIGHT',
        ready: 'READY', go: 'GO!'
      };
    }

    emit() {
      const snapshot = this.snapshot();
      const progress=document.querySelector('.tutorial-lesson-progress');
      if(progress){
        progress.hidden=!this.active||this.state===STATES.COUNTDOWN;
        if(progress.children.length!==snapshot.totalLessons)progress.innerHTML='<i></i>'.repeat(snapshot.totalLessons);
        progress.setAttribute('aria-label',this.copy().tutorialLabel||'TUTORIAL');progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax',String(snapshot.totalLessons));progress.setAttribute('aria-valuenow',String(snapshot.completedLessons));
        Array.from(progress.children).forEach((dot,index)=>{dot.classList.toggle('is-done',index<snapshot.completedLessons);dot.classList.toggle('is-current',index===snapshot.completedLessons);});
      }
      if (typeof this.hooks.onState === 'function') this.hooks.onState(snapshot);
      window.dispatchEvent(new CustomEvent('elemental:tutorial-state', { detail: snapshot }));
    }

    acceptHazards(lesson, hazards) {
      if (!Number.isFinite(LESSON_ORDER[lesson])) return [];
      return (Array.isArray(hazards) ? hazards : [])
        .filter((hazard) => hazard?.userData?.tutorial === true && hazard.userData.tutorialLesson === lesson)
        .sort((a, b) => (Number(a.userData?.tutorialSequence) || 0) - (Number(b.userData?.tutorialSequence) || 0));
    }

    showGate() {
      this.ensureDom();
      if (this.gateConsumed || this.active) return false;
      if (this.state === STATES.GATE) {
        // Idempotent duplicate boot request: keep the existing gate instead of
        // cancelling/rebuilding the tutorial state.
        return true;
      }
      if (this.state !== STATES.IDLE) return false;
      this.cancel(false);
      this.state = STATES.GATE;
      const text = this.copy();
      const layer = document.getElementById('elemental-tutorial-layer');
      const gate = layer.querySelector('.tutorial-gate');
      gate.style.display = 'block';
      gate.querySelector('.tutorial-gate-title').textContent = text.title;
      gate.querySelector('.tutorial-gate-text').textContent = text.intro;
      gate.querySelector('.tutorial-gate-button').textContent = text.clickToStart || 'PLAY';
      const skip = layer.querySelector('.tutorial-skip');
      if (skip) skip.textContent = text.skip || 'SKIP TUTORIAL';
      gate.classList.add('is-visible');
      gate.setAttribute('aria-hidden', 'false');
      document.body.classList.add('tutorial-start-screen');
      this.emit();
      return true;
    }

    start(sourceEvent, options = {}) {
      if (this.state !== STATES.GATE && this.state !== STATES.IDLE) return false;
      if (this.gateConsumed) return false;
      // The host iframe may not give the game document keyboard focus until
      // the first real input. Do this while the trusted event is still live;
      // the run can then capture mouse input immediately on desktop portals.
      if (typeof this.hooks.prepareInput === 'function') this.hooks.prepareInput(sourceEvent);
      this.gateConsumed = true;
      this.active = true;
      document.body.classList.add('tutorial-active');
      this.state = STATES.JUMP_APPROACH;
      if(options.countdown){document.body.classList.add('tutorial-countdown-active');this.state=STATES.COUNTDOWN;this.countdownLeft=3;this.countdownValue=null;document.querySelector('.tutorial-countdown')?.getAnimations?.().forEach(a=>a.cancel());this.updateCountdown(0);}
      this.elapsed = 0;
      this.actionElapsed = 0;
      this.hazards = [];
      this.history = [];
      this.rewind = null;
      this.recoveryTimer = 0;
      this.practiceIndex = -1;
      if (typeof this.hooks.beginRun === 'function') this.hooks.beginRun();
      this.hazards = this.acceptHazards('jump', typeof this.hooks.spawnCars === 'function' ? this.hooks.spawnCars() : []);
      if(options.countdown)this.hooks.countdownStarted?.();
      // Keep the dark gate for one painted frame after the whole tutorial
      // corridor has been staged. This guarantees the first visible gameplay
      // frame already contains every lesson obstacle instead of showing a
      // geometry pop at the horizon.
      const revealRun = () => {
        if (!this.active || !this.gateConsumed) return;
        this.hideGate();
        document.body.classList.remove('tutorial-start-screen');
      };
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(revealRun);
      else revealRun();
      // Some portal iframes briefly throttle requestAnimationFrame while they
      // transfer focus/pointer-lock to the game. A short timer fallback keeps
      // the consumed gate from remaining visually above the jump approach.
      setTimeout(revealRun, 96);
      this.emit();
      return true;
    }

    cancel(emit = true) {
      if (this.hazards.length && typeof this.hooks.clearHazards === 'function') this.hooks.clearHazards(this.hazards);
      if (typeof this.hooks.clearFinish === 'function') this.hooks.clearFinish();
      this.active = false;
      document.body?.classList.remove('tutorial-countdown-active');
      const countdown=document.querySelector('.tutorial-countdown');if(countdown)countdown.hidden=true;
      document.body.classList.remove('tutorial-active');
      document.body.classList.remove('tutorial-start-screen');
      this.hazards = [];
      this.history = [];
      this.rewind = null;
      this.recoveryTimer = 0;
      this.hidePrompt();
      this.hideGate();
      this.setRewindVisual(false);
      const progress=document.querySelector('.tutorial-lesson-progress');if(progress)progress.hidden=true;
      if (this.state !== STATES.COMPLETE) this.state = STATES.IDLE;
      if (emit) this.emit();
    }

    skip() {
      if (!this.active || this.state === STATES.COMPLETE) return false;
      this.clearHazards();
      if (typeof this.hooks.clearFinish === 'function') this.hooks.clearFinish();
      this.active = false;
      this.state = STATES.COMPLETE;
      this.hideGate();
      this.hidePrompt();
      this.setRewindVisual(false);
      document.body.classList.remove('tutorial-start-screen');
      if (typeof this.hooks.complete === 'function') this.hooks.complete({ skipped: true });
      document.body.classList.remove('tutorial-active');
      this.emit();
      return true;
    }

    hideGate() {
      const gate = document.querySelector('#elemental-tutorial-layer .tutorial-gate');
      if (!gate) return;
      gate.classList.remove('is-visible');
      gate.setAttribute('aria-hidden', 'true');
      // Force the portal compositor to drop the consumed layer. Visibility
      // alone can leave one stale iframe surface on screen while focus moves.
      gate.style.display = 'none';
    }

    showPrompt(kind, direction = 0) {
      const layer = document.getElementById('elemental-tutorial-layer');
      const prompt = layer && layer.querySelector('.tutorial-prompt');
      if (!prompt) return;
      const copy = this.copy();
      const mobile = typeof this.hooks.isMobile === 'function' && this.hooks.isMobile();
      const jump = kind === 'jump' || kind === 'bunny';
      const lane = kind === 'lane';
      const bunny = kind === 'bunny';
      prompt.querySelector('.tutorial-prompt-kicker').textContent = copy.ready;
      prompt.querySelector('.tutorial-prompt-title').textContent = lane ? copy.laneTitle : (bunny ? copy.bunnyTitle : (jump ? copy.jumpTitle : copy.slideTitle));
      const input = prompt.querySelector('.tutorial-prompt-input');
      const label = lane
        ? (mobile ? copy.mobileLane : copy.desktopLane)
        : (jump ? (mobile ? copy.mobileJump : copy.desktopJump) : (mobile ? copy.mobileSlide : copy.desktopSlide));
      if (mobile) {
        const stick=lane&&this.hooks.isMobilePortrait?.()===false;
        input.innerHTML = `<span class="tutorial-swipe" aria-hidden="true">${stick?'◉ ':''}${lane ? (direction<0?'←':direction>0?'→':'↔') : (jump ? '↑' : '↓')}</span><span class="tutorial-input-label"></span>`;
        input.querySelector('.tutorial-input-label').textContent = label;
      } else {
        const keys = lane
          ? (direction<0?[['A',''],['←','is-arrow']]:direction>0?[['D',''],['→','is-arrow']]:[['A', ''], ['←', 'is-arrow'], ['D', ''], ['→', 'is-arrow']])
          : (jump ? [['SPACE', 'is-space'], ['W', ''], ['↑', 'is-arrow']] : [['C', ''], ['↓', 'is-arrow'], ['S', '']]);
        const keyset = `<span class="tutorial-keyset" aria-label="${label}">${keys.map(([key, extra], index) => `${index ? '<span class="tutorial-key-divider" aria-hidden="true">/</span>' : ''}<span class="tutorial-key ${extra}">${key}</span>`).join('')}</span>`;
        input.innerHTML = bunny
          ? `<span class="tutorial-bunny-set">${keyset}<span class="tutorial-bunny-rhythm" aria-hidden="true"><span>↑</span><span>↑</span><span>↑</span></span></span>`
          : keyset;
      }
      prompt.classList.remove('is-good-luck');
      prompt.classList.add('is-visible');
      prompt.setAttribute('aria-hidden', 'false');
    }

    hidePrompt() {
      const prompt = document.querySelector('#elemental-tutorial-layer .tutorial-prompt');
      if (!prompt) return;
      prompt.classList.remove('is-visible');
      prompt.setAttribute('aria-hidden', 'true');
    }

    distanceToHazards() {
      if (typeof this.hooks.distanceToHazards !== 'function') return Infinity;
      return this.hooks.distanceToHazards(this.hazards);
    }

    hasPassedHazards() {
      return typeof this.hooks.hasPassedHazards === 'function' && this.hooks.hasPassedHazards(this.hazards);
    }

    isActionActive(action) {
      // Observe the canonical physical state, not raw key presses. An early
      // jump cannot be performed twice in mid-air; the existing jump counts.
      return typeof this.hooks.isActionActive === 'function' && !!this.hooks.isActionActive(action);
    }

    requestLessonAction(action) {
      this.state = action === 'jump' ? STATES.JUMP_PROMPT : STATES.SLIDE_PROMPT;
      this.actionElapsed = 0;
      if (this.isActionActive(action)) this.onAction(action);
      else { this.showPrompt(action); this.emit(); }
    }

    clearHazards() {
      if (typeof this.hooks.clearHazards === 'function') this.hooks.clearHazards(this.hazards);
      this.hazards = [];
    }

    practiceLesson() { return this.hooks.practiceLessons?.[this.practiceIndex] || null; }

    advancePractice() {
      if(this.practiceLesson())this.hooks.practiceComplete?.(this.practiceIndex);
      this.hidePrompt();this.clearHazards();this.history=[];this.actionElapsed=0;
      this.practiceIndex++;
      if (!this.practiceLesson()) { this.beginFinish();return; }
      this.hazards=this.acceptHazards('practice',this.hooks.spawnPractice?.(this.practiceIndex)||[]);
      this.state=STATES.PRACTICE_APPROACH;this.emit();
    }

    beginFinish() {
      // Keep running on the safe tutorial road if a slow device/network still
      // needs time. Never replace the playable scene with a loading overlay.
      if(this.hooks.isNextRunReady && !this.hooks.isNextRunReady()) {
        this.state=STATES.FREE_RUN;this.hidePrompt();this.emit();return;
      }
      this.hooks.spawnFinish?.();this.state=STATES.FINISH_APPROACH;this.actionElapsed=0;this.emit();
    }

    recordHistory(realDelta) {
      if (typeof this.hooks.captureState !== 'function' || this.state === STATES.REWIND) return;
      const state = this.hooks.captureState(this.hazards);
      if (!state) return;
      this.history.push({ age: 0, state });
      for (let i = 0; i < this.history.length; i++) this.history[i].age += realDelta;
      while (this.history.length > 1 && this.history[0].age > 4.2) this.history.shift();
    }

    setRewindVisual(visible) {
      const layer = document.getElementById('elemental-tutorial-layer');
      if (!layer) return;
      layer.querySelector('.tutorial-rewind-flash')?.classList.toggle('is-visible', !!visible);
      layer.querySelector('.tutorial-rewind-icon')?.classList.toggle('is-visible', !!visible);
    }

    beginRewind(hazard) {
      // A tutorial collision is always recoverable, including repeated misses
      // and frames delayed by a low-end device.
      if (!this.active || this.state === STATES.REWIND || !hazard || !hazard.userData?.tutorial) return false;
      const sample = this.history.find((entry) => entry.age >= 3) || this.history[0];
      if (!sample || typeof this.hooks.captureState !== 'function' || typeof this.hooks.restoreState !== 'function') return false;
      const from = this.hooks.captureState(this.hazards);
      if (!from) return false;
      const lesson = hazard.userData.tutorialLesson
        || (hazard.userData.type === 'slide_barrier' ? 'slide' : 'jump');
      const returnState = lesson === 'practice' ? STATES.PRACTICE_APPROACH : lesson === 'slide' ? STATES.SLIDE_APPROACH
        : (lesson === 'lane' ? STATES.LANE_APPROACH
          : (lesson === 'bunny' ? STATES.BUNNY_APPROACH : STATES.JUMP_APPROACH));
      this.rewind = { from, to: sample.state, returnState, lesson, elapsed: 0, duration: 0.72 };
      this.state = STATES.REWIND;
      this.actionElapsed = 0;
      this.hidePrompt();
      this.setRewindVisual(true);
      this.emit();
      return true;
    }

    update(realDelta) {
      if (!this.active) return;
      if(this.state===STATES.COUNTDOWN){this.updateCountdown(realDelta);return;}
      if (this.state === STATES.REWIND) {
        const rewind = this.rewind;
        // A stale animation callback must never leave the game frozen. This is
        // also a guard for tab focus changes during rapid consecutive misses.
        if (!rewind) {
          this.state = STATES.JUMP_APPROACH;
          this.recoveryTimer = 0.65;
          this.setRewindVisual(false);
          this.emit();
          return;
        }
        rewind.elapsed += Math.max(0, Number(realDelta) || 0);
        const t = Math.min(1, rewind.elapsed / rewind.duration);
        const eased = 1 - Math.pow(1 - t, 3);
        this.hooks.restoreState(rewind.from, rewind.to, eased, this.hazards);
        if (t >= 1) {
          this.rewind = null;
          this.state = rewind.returnState || STATES.JUMP_APPROACH;
          this.actionElapsed = 0;
          this.history = [];
          this.recoveryTimer = 0.65;
          this.setRewindVisual(false);
          this.emit();
        }
        return;
      }
      if (this.recoveryTimer > 0) this.recoveryTimer = Math.max(0, this.recoveryTimer - Math.max(0, Number(realDelta) || 0));
      this.recordHistory(Math.max(0, Number(realDelta) || 0));
      this.elapsed += Math.max(0, Number(realDelta) || 0);
      this.actionElapsed += Math.max(0, Number(realDelta) || 0);
      if (this.state === STATES.JUMP_PROMPT && this.isActionActive('jump')) this.onAction('jump');
      if (this.state === STATES.SLIDE_PROMPT && this.isActionActive('slide')) this.onAction('slide');
      if (this.state === STATES.JUMP_APPROACH && this.distanceToHazards() <= ACTION_PROMPT_DISTANCE) {
        this.requestLessonAction('jump');
      } else if (this.state === STATES.JUMP_CLEAR && this.hasPassedHazards()) {
        this.clearHazards();
        this.hazards = this.acceptHazards('slide', typeof this.hooks.spawnSlideBarriers === 'function' ? this.hooks.spawnSlideBarriers() : []);
        // A slide rewind must only restore slide-barrier positions. Keeping
        // prior car snapshots here was the source of the repeated rewind loop.
        this.history = [];
        this.state = STATES.SLIDE_APPROACH;
        this.actionElapsed = 0;
        this.emit();
      } else if (this.state === STATES.SLIDE_APPROACH && this.distanceToHazards() <= ACTION_PROMPT_DISTANCE) {
        this.requestLessonAction('slide');
      } else if (this.state === STATES.SLIDE_CLEAR && this.hasPassedHazards()) {
        this.clearHazards();
        this.hazards = this.acceptHazards('lane', typeof this.hooks.spawnLaneWalls === 'function' ? this.hooks.spawnLaneWalls() : []);
        this.history = [];
        this.state = STATES.LANE_APPROACH;
        this.actionElapsed = 0;
        this.emit();
      } else if (this.state === STATES.LANE_APPROACH && this.distanceToHazards() <= ACTION_PROMPT_DISTANCE + 10) {
        this.state = STATES.LANE_PROMPT;
        this.actionElapsed = 0;
        this.showPrompt('lane');
        this.emit();
      } else if ((this.state === STATES.LANE_APPROACH || this.state === STATES.LANE_PROMPT) && this.hasPassedHazards()) {
        this.hidePrompt();
        this.clearHazards();
        this.hazards = this.acceptHazards('bunny', typeof this.hooks.spawnBunnyHopBarriers === 'function' ? this.hooks.spawnBunnyHopBarriers() : []);
        this.history = [];
        this.state = STATES.BUNNY_APPROACH;
        this.actionElapsed = 0;
        this.emit();
      } else if (this.state === STATES.BUNNY_APPROACH && this.distanceToHazards() <= ACTION_PROMPT_DISTANCE + 6) {
        this.state = STATES.BUNNY_RUN;
        this.actionElapsed = 0;
        this.showPrompt('bunny');
        this.emit();
      } else if (this.state === STATES.BUNNY_RUN && this.hasPassedHazards()) {
        this.hidePrompt();
        this.clearHazards();
        this.advancePractice();
      } else if(this.state===STATES.PRACTICE_APPROACH && this.distanceToHazards()<=(this.practiceLesson()?.action==='lane'?120:ACTION_PROMPT_DISTANCE+8)) {
        const lesson=this.practiceLesson();this.state=STATES.PRACTICE_PROMPT;this.actionElapsed=0;
        if(lesson?.action!=='lane'&&this.isActionActive(lesson?.action))this.onAction(lesson.action);
        else {this.showPrompt(lesson?.action||'jump',lesson?.direction||0);this.emit();}
      } else if(this.state===STATES.PRACTICE_PROMPT && this.practiceLesson()?.action!=='lane' && this.isActionActive(this.practiceLesson()?.action)) {
        this.onAction(this.practiceLesson().action);
      } else if((this.state===STATES.PRACTICE_CLEAR || (this.state===STATES.PRACTICE_PROMPT&&this.practiceLesson()?.action==='lane')) && this.hasPassedHazards()) {
        this.advancePractice();
      } else if(this.state===STATES.FREE_RUN) {
        if(!this.hooks.isNextRunReady || this.hooks.isNextRunReady())this.beginFinish();
      } else if (this.state === STATES.FINISH_APPROACH && typeof this.hooks.hasCrossedFinish === 'function' && this.hooks.hasCrossedFinish()) {
        this.state = STATES.EXIT;
        this.actionElapsed = 0;
        this.emit();
      } else if (this.state === STATES.EXIT) {
        this.active = false;
        this.state = STATES.COMPLETE;
        if (typeof this.hooks.clearFinish === 'function') this.hooks.clearFinish();
        this.hideGate();
        document.body.classList.remove('tutorial-start-screen');
        this.hidePrompt();
        if (typeof this.hooks.complete === 'function') this.hooks.complete({ skipped: false });
        document.body.classList.remove('tutorial-active');
        this.emit();
      }
    }

    showExit() {
      const layer = document.getElementById('elemental-tutorial-layer');
      const prompt = layer && layer.querySelector('.tutorial-prompt');
      if (!prompt) return;
      prompt.querySelector('.tutorial-prompt-kicker').textContent = '';
      prompt.querySelector('.tutorial-prompt-title').textContent = '';
      prompt.querySelector('.tutorial-prompt-input').innerHTML = '<span class="tutorial-good-luck">GOOD LUCK</span>';
      prompt.classList.add('is-good-luck');
      prompt.classList.add('is-visible');
      prompt.setAttribute('aria-hidden', 'false');
    }

    onAction(action) {
      if (!this.active) return false;
      if (action === 'jump' && this.state === STATES.JUMP_PROMPT) {
        this.state = STATES.JUMP_CLEAR;
        this.actionElapsed = 0;
        this.hidePrompt();
        this.emit();
        return true;
      }
      if (action === 'slide' && this.state === STATES.SLIDE_PROMPT) {
        this.state = STATES.SLIDE_CLEAR;
        this.actionElapsed = 0;
        this.hidePrompt();
        this.emit();
        return true;
      }
      if ((action === 'left' || action === 'right') && this.state === STATES.LANE_PROMPT) {
        // Keep the prompt/state active until the two centre walls are truly
        // behind the player. This prevents a single key tap from skipping the
        // spatial lesson before the lane change has completed.
        return true;
      }
      if (action === 'jump' && this.state === STATES.BUNNY_RUN) return true;
      if(this.state===STATES.PRACTICE_PROMPT) {
        const expected=this.practiceLesson()?.action;
        if(expected==='lane')return action==='left'||action==='right';
        if(action===expected){this.state=STATES.PRACTICE_CLEAR;this.actionElapsed=0;this.hidePrompt();this.emit();return true;}
      }
      return false;
    }

    updateCountdown(delta) {
      this.countdownLeft=Math.max(0,this.countdownLeft-Math.max(0,Number(delta)||0));
      const root=document.querySelector('.tutorial-countdown');
      if(this.countdownLeft<=0){document.body?.classList.remove('tutorial-countdown-active');this.state=STATES.JUMP_APPROACH;this.hooks.countdownComplete?.();
        if(root){const fade=root.animate?.([{opacity:1},{opacity:0}],{duration:240,easing:'ease-out'});if(fade)fade.onfinish=()=>{if(this.state!==STATES.COUNTDOWN)root.hidden=true;};else root.hidden=true;}
        this.emit();return;}
      const value=this.countdownLeft>3?'':String(Math.ceil(this.countdownLeft));
      if(root){root.hidden=false;root.querySelector('b').textContent=this.copy().tutorialLabel||'TUTORIAL';
        if(value!==this.countdownValue){const number=root.querySelector('span');number.textContent=value;const frames=[{opacity:0,transform:'translateY(12px) scale(.86)'},{opacity:1,transform:'translateY(0) scale(1)'}];number.animate?.(frames,{duration:260,easing:'ease-out'});if(this.countdownValue===null)root.querySelector('b').animate?.(frames,{duration:420,easing:'ease-out'});this.countdownValue=value;}}
    }

    timeScale() {
      if (this.state === STATES.COUNTDOWN) return 0;
      if (this.state === STATES.REWIND) return 0;
      if (this.state === STATES.JUMP_PROMPT) return this.isActionActive('jump') ? 1 : 0.32;
      if (this.state === STATES.SLIDE_PROMPT) return this.isActionActive('slide') ? 1 : 0.32;
      if(this.state===STATES.PRACTICE_PROMPT && this.practiceLesson()?.action!=='lane')return this.isActionActive(this.practiceLesson()?.action)?1:.45;
      if (this.state === STATES.EXIT) return Math.min(1, 0.55 + this.actionElapsed * 0.42);
      return 1;
    }

    protects(hazard) {
      return this.active && !!hazard && !!hazard.userData && hazard.userData.tutorial === true
        && (this.state === STATES.JUMP_APPROACH || this.state === STATES.JUMP_PROMPT || this.state === STATES.JUMP_CLEAR
          || this.state === STATES.SLIDE_APPROACH || this.state === STATES.SLIDE_PROMPT || this.state === STATES.SLIDE_CLEAR
          || this.state === STATES.LANE_APPROACH || this.state === STATES.LANE_PROMPT
          || this.state === STATES.BUNNY_APPROACH || this.state === STATES.BUNNY_RUN
          || this.state.startsWith('practice-')
          || this.state === STATES.REWIND || this.recoveryTimer > 0);
    }

    isWaitingForAction() {
      return this.state === STATES.JUMP_APPROACH || this.state === STATES.JUMP_PROMPT
        || this.state === STATES.SLIDE_APPROACH || this.state === STATES.SLIDE_PROMPT
        || this.state === STATES.LANE_APPROACH || this.state === STATES.LANE_PROMPT
        || this.state.startsWith('practice-')
        || this.state === STATES.BUNNY_APPROACH || this.state === STATES.BUNNY_RUN;
    }

    blocksJump() {
      return this.active && (this.state === STATES.COUNTDOWN || this.state === STATES.SLIDE_APPROACH || this.state === STATES.SLIDE_PROMPT || this.state === STATES.SLIDE_CLEAR || (this.state.startsWith('practice-')&&this.practiceLesson()?.action==='slide') || this.state === STATES.REWIND);
    }

    blocksSlide() {
      return this.active && (this.state === STATES.COUNTDOWN || this.state === STATES.BUNNY_APPROACH || this.state === STATES.BUNNY_RUN || (this.state.startsWith('practice-')&&this.practiceLesson()?.action==='jump') || this.state === STATES.REWIND);
    }

    snapshot() {
      const totalLessons=4+(this.hooks.practiceLessons?.length||0);
      const lessonState=this.state===STATES.REWIND?(this.rewind?.returnState||STATES.JUMP_APPROACH):this.state;
      const completedLessons=lessonState.startsWith('slide')?1:lessonState.startsWith('lane')?2:lessonState.startsWith('bunny')?3:lessonState.startsWith('practice')?4+Math.max(0,this.practiceIndex):[STATES.FREE_RUN,STATES.FINISH_APPROACH,STATES.EXIT,STATES.COMPLETE].includes(lessonState)?totalLessons:0;
      const action=lessonState.startsWith('practice')?this.practiceLesson()?.action:null;
      return {
        active: this.active,
        state: this.state,
        gateConsumed: this.gateConsumed,
        timeScale: this.timeScale(),
        hazardCount: this.hazards.length,
        rewindSeconds: this.state === STATES.REWIND ? 3 : 0,
        uiVersion: TUTORIAL_UI_VERSION,
        completedLessons,totalLessons,practiceIndex:this.practiceIndex,practiceAction:this.practiceLesson()?.action||null,
        lesson: action || (lessonState.startsWith('slide') ? 'slide' : (lessonState.startsWith('lane') ? 'lane' : (lessonState.startsWith('bunny') ? 'bunny' : (lessonState.startsWith('finish') || lessonState === STATES.EXIT ? 'finish' : 'jump')))),
        desktopKeys: this.state === STATES.SLIDE_PROMPT || action==='slide' ? ['C', 'ARROW_DOWN', 'S']
            : (this.state === STATES.LANE_PROMPT || action==='lane' ? ['A', 'ARROW_LEFT', 'D', 'ARROW_RIGHT'] : ['SPACE', 'W', 'ARROW_UP'])
      };
    }
  }

  Object.defineProperty(window, 'ElementalTutorialDirector', {
    value: ElementalTutorialDirector,
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(window, 'ELEMENTAL_TUTORIAL_STATES', {
    value: STATES,
    writable: false,
    configurable: false,
    enumerable: false
  });
})();
