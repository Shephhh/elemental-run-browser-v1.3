(function () {
  'use strict';
  const KEY = 'elemental-run-lobby-guide-v1';
  const MODES = new Set(['levels','endless','surf','party','troll','runner2d','flappy']);
  // Durable milestones; UI targets and animation frames are never saved.
  class LobbyOnboarding {
    constructor(api) {
      this.api = api; this.nextTick = 0; this.target = null; this.pointer = null; this.raf = 0;
      let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) {}
      let oldVisits = {}; try { oldVisits = JSON.parse(localStorage.getItem('elemental-mode-visits-v1')) || {}; } catch (_) {}
      this.state = { entered: !!saved.entered, score: !!saved.score, wheel: !!saved.wheel, hands: !!saved.hands, reached200: !!saved.reached200, returnToLevel: !!saved.returnToLevel, firstLevelPending: !!saved.firstLevelPending };
      this.state.version = 2;
      this.state.playedAnyMode = saved.version === 2 ? saved.playedAnyMode === true
        : !!(saved.entered || this.api.hasPlayedMode?.() || ['level','endless','surf','obby','runner2d'].some(mode => oldVisits[mode] === true));
      this.state.upgradeGuideSeen = saved.upgradeGuideSeen === true || !!saved.score || !!this.api.hasUpgrade?.();
      this.upgradeGuideActive = false;
      this.stage=null;
      if (saved.version !== 2) this.persist();
    }
    persist() { try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch (_) {} }
    observe() {
      const changed = !this.state.reached200 && this.api.wallet() >= 200;
      if (changed) { this.state.reached200 = true; this.persist(); }
    }
    current() {
      this.observe();
      if (!this.state.playedAnyMode) return 'games';
      // This is a single visit's invitation, not a recurring purchase prompt.
      // Preparing/blocked/inactive scenes must never consume it off-screen.
      const inPlaza = this.api.inPlaza?.() === true;
      const affordable = this.api.canBuyUpgrade?.() === true;
      if (this.upgradeGuideActive && (!inPlaza || !affordable)) this.upgradeGuideActive = false;
      if (!this.state.upgradeGuideSeen && inPlaza && affordable && this.api.canGuide?.()) {
        this.state.upgradeGuideSeen = true; this.upgradeGuideActive = true; this.persist();
      }
      return this.upgradeGuideActive && this.api.canGuide?.() ? 'upgrades' : null;
    }
    modePlayed(mode) {
      if (!MODES.has(mode) || this.state.playedAnyMode) return;
      this.state.playedAnyMode = true; this.state.entered = true; this.state.firstLevelPending = false;
      this.state.returnToLevel = false; this.stage = null;
      this.clearPointer(); this.persist();
    }
    completeUpgradeGuide() {
      this.state.upgradeGuideSeen = true; this.upgradeGuideActive = false;
      this.stage = null; this.clearPointer(); this.persist();
    }
    label(stage = this.current()) {
      return stage ? this.api.tr(stage === 'games' ? 'hubGames' : 'upgrades') : '';
    }
    finishLabel() { return ''; }
    tutorialCompleted() {
      this.state.firstLevelPending = true;
      this.stage = this.state.playedAnyMode ? null : 'games'; this.nextTick = 0;
      this.clearPointer(); this.persist();
    }
    event(name) {
      if ((name === 'upgrade' || name === 'score') && (!this.state.upgradeGuideSeen || this.upgradeGuideActive)) this.completeUpgradeGuide();
      if (name === 'level' && this.state.firstLevelPending) {
        this.state.firstLevelPending = false; this.persist(); this.clearPointer();
      }
      if(name==='level'&&this.state.returnToLevel){this.state.returnToLevel=false;this.persist();}
      const field = { level:'entered', score:'score', wheel:'wheel', hand:'hands' }[name];
      if (!field || this.state[field]) return;
      if(name==='score'&&this.stage==='upgrades'&&this.api.completed()<2)this.state.returnToLevel=true;
      this.state[field] = true; this.persist(); this.clearPointer();
    }
    pointAt(target, label) {
      if (!target?.isConnected) { this.clearPointer(); return; }
      if (this.target === target) return;
      this.clearPointer(); this.target = target;
      target.classList.add('level-tutorial-target');
      const pointer = document.createElement('div'); pointer.className = 'is-visible'; pointer.id = 'hub-guide-pointer';
      pointer.innerHTML = '<span class="level-tutorial-hand">👇</span><span class="level-tutorial-label"></span>';
      pointer.querySelector('.level-tutorial-label').textContent = label;
      document.body.appendChild(pointer); this.pointer = pointer;
      const sync = () => {
        if (!this.target?.isConnected || !this.pointer) return;
        const r = target.getBoundingClientRect(), p = pointer.getBoundingClientRect();
        pointer.style.left = Math.max(8, Math.min(innerWidth-p.width-8, r.left+(r.width-p.width)/2))+'px';
        pointer.style.top = Math.max(8, Math.min(innerHeight-p.height-8, r.top-p.height-12))+'px';
        this.raf = requestAnimationFrame(sync);
      }; sync();
    }
    panelOpened(panel) {
      if (panel === 'upgrades') this.completeUpgradeGuide();
    }
    clearPointer() {
      cancelAnimationFrame(this.raf); this.target?.classList.remove('level-tutorial-target'); this.pointer?.remove(); this.target = this.pointer = null;
    }
    tick(dt) {
      this.nextTick -= Math.min(.25, dt);
      if (this.nextTick > 0) return; this.nextTick = .25;
      this.observe();
      if (this.api.scoreLevel() > 0) this.event('score');
      if (this.api.firstSpinClaimed()) this.event('wheel');
      if (this.api.ownedHands() > 0) this.event('hand');
      this.stage=this.current();
      // No pop-up during live play. The lobby route resumes after returning.
      if (!this.api.inLobby() || !this.api.panelOpen()) this.clearPointer();
      const available = this.api.canBuyAnything();
      document.querySelectorAll('#level-menu-btn,#gameover-menu-btn,#pause-menu-btn').forEach(button => {
        button.classList.toggle('has-affordable-item', available);
      });
    }
    snapshot() { const stage=this.current();return { ...this.state, upgradeGuideActive: this.upgradeGuideActive, stage }; }
  }
  window.ElementalLobbyOnboarding = LobbyOnboarding;
})();
