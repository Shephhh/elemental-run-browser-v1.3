(function (global) {
  'use strict';
  const REWARDS = Object.freeze([
    Object.freeze({ at: 0, type: 'gold', amount: 50 }),
    Object.freeze({ at: 180, type: 'score', seconds: 300 }),
    Object.freeze({ at: 420, type: 'gold', amount: 500 }),
    Object.freeze({ at: 720, type: 'speed', seconds: 600 }),
    Object.freeze({ at: 1200, type: 'hand', id: 'solar' })
  ]);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clock = seconds => { const n = Math.max(0, Math.ceil(seconds)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };
  const glyph = type => `<svg viewBox="0 0 64 64" aria-hidden="true">${type === 'gold'
    ? '<circle cx="32" cy="32" r="25"/><circle cx="32" cy="32" r="19"/><path d="M39 22H28a6 6 0 0 0 0 12h8a6 6 0 0 1 0 12H24m8-29v34"/>'
    : type === 'score' ? '<path d="m21 8 11 16L43 8M14 8h11m14 0h11"/><circle cx="32" cy="39" r="19"/><path d="m32 28 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z"/>'
    : '<path d="m36 5-22 31h17l-3 23 22-32H34Z"/>'}</svg>`;
  function normalize(saved) {
    return { version: 1, seconds: Math.min(172800, Math.max(0, Number(saved?.seconds) || 0)),
      claimed: REWARDS.map((_, i) => saved?.version === 1 && saved.claimed?.[i] === true) };
  }
  class LobbyRewards {
    constructor(api) {
      this.api = api; this.state = normalize(api.getState()); api.setState(this.state);
      this.dirty = false; this.saveElapsed = 0; this.lastSecond = -1; this.signature = ''; this.modalHtml = '';
      global.addEventListener('pagehide', () => this.flush());
      document.addEventListener('visibilitychange', () => { if (document.hidden) { this.flush(); this.stopRunFeedback(); } });
      // PLAY may still have an asynchronous pointer-lock request in flight
      // when a saved, unclaimed reward opens. Never lock over the claim dialog.
      document.addEventListener('pointerlockchange', () => {
        if (this.hatOpen() && document.pointerLockElement) this.api.releasePointer();
      });
      global.addEventListener('keydown', event => {
        if (this.hatOpen() && event.code === 'Tab') {
          event.preventDefault(); event.stopImmediatePropagation();
          this.hatModal.querySelector('.hub-hat-claim').focus({preventScroll:true});
          return;
        }
        if (this.hatOpen() && ['Escape', 'Space', 'Enter'].includes(event.code)) {
          event.preventDefault(); event.stopImmediatePropagation();
          if (event.repeat) return;
          if (event.code !== 'Escape') this.collectHat(event);
          return;
        }
        if (this.isOpen() && event.code === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); this.close(); }
      }, true);
    }
    isOpen() { return !!this.modal && !this.modal.hidden; }
    hatOpen() { return !!this.hatModal && !this.hatModal.hidden; }
    showHatReward() {
      const hat = this.api.getHat?.();
      if (!this.api.inLobby?.() || !hat?.earned || hat.claimed || this.hatOpen()) return;
      this.close(); this.api.releasePointer();
      if (!this.hatModal) {
        const modal = document.createElement('section'); modal.id = 'hub-hat-reward'; modal.hidden = true;
        modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'hub-hat-title');
        modal.innerHTML = `<div class="hub-hat-card"><div class="hub-hat-confetti" aria-hidden="true">${'<i></i>'.repeat(12)}</div><small></small><h2 id="hub-hat-title"></h2><div class="hub-hat-art" aria-hidden="true"><img src="assets/cosmetics/tutorial-hat-preview.png?v=1.7.29" width="512" height="512" alt=""></div><p></p><button class="hub-hat-claim" type="button"></button></div>`;
        modal.querySelector('.hub-hat-claim').onclick = event => this.collectHat(event);
        document.body.appendChild(modal); this.hatModal = modal;
        modal.querySelectorAll('.hub-hat-confetti i').forEach((piece, i) => piece.style.setProperty('--i', i));
      }
      this.refreshHatCopy();
      this.hatModal.hidden = false; this.hatModal.querySelector('.hub-hat-claim').focus({preventScroll: true});
      this.api.measure?.('tutorial-reward', 'runner-cap', 'visible');
    }
    refreshHatCopy() {
      if (!this.hatModal || this.hatLanguage === this.api.language()) return;
      this.hatLanguage = this.api.language();
      const t = this.api.tr;
      this.hatModal.querySelector('small').textContent = t('hatTutorialComplete');
      this.hatModal.querySelector('h2').textContent = t('hatRewardTitle');
      this.hatModal.querySelector('p').textContent = t('hatRewardCopy');
      this.hatModal.querySelector('.hub-hat-claim').textContent = t('hatClaim');
    }
    collectHat(event) {
      const hat = this.api.getHat?.();
      if (!hat?.earned || hat.claimed || !this.hatOpen()) return;
      this.api.interact?.(event); this.api.claimHat();
      this.api.measure?.('tutorial-reward', 'runner-cap', 'claimed');
      this.closeHatReward();
    }
    closeHatReward() {
      const hat = this.api.getHat?.();
      if (this.hatOpen() && hat?.earned && !hat.claimed) return false;
      if (this.hatModal) this.hatModal.hidden = true;
      this.api.focus?.();
      return true;
    }
    ready(i) { return !this.state.claimed[i] && this.state.seconds >= REWARDS[i].at; }
    hasReward() { return REWARDS.some((_, i) => this.ready(i)); }
    tick(delta, active) {
      if (!active || document.hidden || !document.hasFocus() || this.state.claimed.every(Boolean)) return;
      const dt = Math.max(0, Math.min(.25, Number(delta) || 0));
      this.state.seconds += dt; this.dirty = true; this.saveElapsed += dt;
      if (this.saveElapsed >= 5) this.flush();
      const second = Math.floor(this.state.seconds);
      if (second !== this.lastSecond) { this.lastSecond = second; this.refresh(); }
    }
    flush() { if (this.dirty) { this.dirty = false; this.saveElapsed = 0; this.api.save(); } }
    label(reward) {
      const t = this.api.tr;
      if (reward.type === 'gold') return `${reward.amount} ${t('gold')}`;
      if (reward.type === 'hand') return 'SOLAR FORGE';
      return `2× ${t(reward.type)} · ${clock(reward.seconds)}`;
    }
    claim(i) {
      if (!Number.isInteger(i) || !REWARDS[i] || !this.ready(i)) return false;
      this.state.claimed[i] = true;
      // Reward, claim marker, boosts and ownership belong to one sealed payload.
      this.api.grant(REWARDS[i]); this.dirty = false; this.saveElapsed = 0; this.api.save();
      this.api.onClaim?.(REWARDS[i]); this.api.measure?.('play-reward', String(i + 1), 'claimed');
      this.refresh(true); return true;
    }
    attach(hud) {
      if (!hud || this.hud === hud) return;
      this.hud = hud;
      const tools = hud.querySelector('.hub-tools');
      const icon = (id, path) => {
        const button = document.createElement('button'); button.type = 'button'; button.id = id; button.className = 'hub-notification-button';
        button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg><i class="hub-notification-dot" hidden></i>`;
        tools.insertBefore(button, tools.querySelector('#hub-settings')); return button;
      };
      this.missions = icon('hub-missions-button', '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM8 11l1 1 2-2m2 1h3M8 16l1 1 2-2m2 1h3"/>');
      this.rewards = icon('hub-rewards-button', '<rect x="3" y="9" width="18" height="4" rx="1"/><path d="M5 13v8h14v-8M12 9v12M12 9C2 9 6 1 10 5l2 4Zm0 0c10 0 6-8 2-4l-2 4Z"/>');
      this.missions.onclick = event => { this.api.interact?.(event); this.api.releasePointer(); this.api.openMissions(); };
      this.rewards.onclick = event => { this.api.interact?.(event); this.open(); };
      this.rewardNudge = document.createElement('span'); this.rewardNudge.className = 'hub-free-reward';
      this.rewardNudge.textContent = '+50 ◈'; this.rewardNudge.setAttribute('aria-hidden','true'); this.rewards.appendChild(this.rewardNudge);
      this.glove = document.createElement('button'); this.glove.id = 'hub-first-glove'; this.glove.type = 'button';
      this.glove.onclick = event => { this.api.interact?.(event); this.api.releasePointer(); this.api.openHands(); };
      document.body.appendChild(this.glove);
      this.glove.innerHTML = '<img width="42" height="54" alt=""><span><strong>EMBER GRIP <em aria-hidden="true">⇈</em></strong><span class="hub-glove-count" dir="ltr"></span><span class="hub-glove-track" role="progressbar"><i></i></span><small class="hub-glove-remaining"></small></span><b class="hub-glove-gain" aria-hidden="true"></b>';
      this.fxLayer = document.createElement('div'); this.fxLayer.id = 'hub-glove-gold-fx'; this.fxLayer.hidden = true; this.fxLayer.setAttribute('aria-hidden','true');
      this.fxLayer.innerHTML = '<i></i>'.repeat(8); document.body.appendChild(this.fxLayer);
      this.refresh(true);
    }
    refresh(force = false) {
      this.refreshHatCopy();
      const t = this.api.tr;
      if (this.glove) {
        if (this.rewardNudge) this.rewardNudge.hidden = this.state.claimed[0];
        this.rewards?.classList.toggle('has-free-gold', !this.state.claimed[0]);
        const lobbyVisible = !!this.hud && !this.hud.hidden;
        const skin = this.api.firstGlove(), wallet = this.api.wallet();
        if(this.feedback && wallet !== this.feedback.target) this.stopRunFeedback();
        const displayBalance = this.displayWallet ?? this.pendingGold?.before ?? wallet;
        const shown = Math.min(skin.cost, displayBalance), remaining = Math.max(0, skin.cost - displayBalance);
        const signature = `${this.api.language()}:${remaining}:${this.api.hasGlove()}:${this.hasReward()}:${this.api.hasMission()}`;
        this.glove.hidden = this.api.hasGlove() || (!lobbyVisible && !this.feedback && !this.api.resultVisible());
        this.glove.disabled = !lobbyVisible;
        if (force || signature !== this.signature) {
          this.signature = signature;
          for (const [button, key, ready] of [[this.missions, 'hubMissions', this.api.hasMission()], [this.rewards, 'playRewards', this.hasReward()]]) {
            button.title = t(key); button.setAttribute('aria-label', t(key)); button.querySelector('i').hidden = !ready;
          }
          this.glove.querySelector('img').src = skin.preview;
          this.glove.querySelector('.hub-glove-count').textContent = `${shown} / ${skin.cost}`;
          const track=this.glove.querySelector('.hub-glove-track');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax',String(skin.cost));track.setAttribute('aria-valuenow',String(shown));track.setAttribute('aria-label','EMBER GRIP');
          track.firstElementChild.style.transform = `scaleX(${shown / skin.cost})`;
          this.glove.querySelector('.hub-glove-remaining').textContent = remaining ? t('firstGloveRemaining').replace('{n}', remaining) : t('firstGloveReady');
          this.glove.title = `${t('firstGlove')} · ${t('handSkill_doubleJump')}`;
          this.glove.classList.toggle('is-ready', remaining === 0);
        }
        if(lobbyVisible && this.pendingGold && this.api.canAnimateGold()) { const pending=this.pendingGold;this.pendingGold=null;this.animateRunGold(pending.amount,pending.source,pending.before); }
      }
      if (this.isOpen()) this.renderModal();
    }
    stopRunFeedback() {
      clearTimeout(this.goldArrival); clearTimeout(this.goldEnd);this.feedback=null;this.displayWallet=null;
      if(this.fxLayer) { this.fxLayer.hidden=true;this.fxLayer.classList.remove('is-flying'); }
      if(this.glove) { this.glove.classList.remove('is-gaining');this.glove.querySelector('.hub-glove-gain').textContent=''; }
    }
    cancelRunFeedback() { this.pendingGold=null;this.stopRunFeedback();this.refresh(true); }
    animateRunGold(amount, source, before) {
      amount=Math.max(0,Math.floor(amount));if(!amount||this.api.hasGlove())return;
      if(!this.glove || !this.api.canAnimateGold() || (this.hud.hidden && !this.api.resultVisible())) { this.pendingGold={amount,source,before};return; }
      this.stopRunFeedback();this.feedback={target:this.api.wallet()};this.displayWallet=Math.max(0,Math.floor(before));this.refresh(true);
      const reduced=global.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const rect=source?.getBoundingClientRect?.(), target=this.glove.getBoundingClientRect();
      const x=rect?.width ? rect.left+rect.width/2 : global.innerWidth*.5, y=rect?.height ? rect.top+rect.height/2 : global.innerHeight*.45;
      if(!reduced) {
        this.fxLayer.hidden=false;this.fxLayer.style.setProperty('--gold-x',`${x}px`);this.fxLayer.style.setProperty('--gold-y',`${y}px`);
        this.fxLayer.style.setProperty('--gold-dx',`${target.left+target.width*.48-x}px`);this.fxLayer.style.setProperty('--gold-dy',`${target.top+target.height*.65-y}px`);
        [...this.fxLayer.children].forEach((coin,i)=>{coin.style.setProperty('--gold-delay',`${i*45}ms`);coin.style.setProperty('--gold-spread',`${(i-3.5)*11}px`);});
        void this.fxLayer.offsetWidth;this.fxLayer.classList.add('is-flying');
      }
      this.goldArrival=setTimeout(()=>{this.displayWallet=null;this.refresh(true);this.glove.classList.add('is-gaining');this.glove.querySelector('.hub-glove-gain').textContent=`+${amount}`;},reduced?0:650);
      this.goldEnd=setTimeout(()=>{this.stopRunFeedback();this.refresh(true);},1600);
    }
    open() {
      if (this.hatOpen()) return;
      this.closeHatReward();
      this.api.measure?.('play-reward', 'panel', 'visible');
      this.api.releasePointer();
      if (!this.modal) {
        this.modal = document.createElement('section'); this.modal.id = 'hub-play-rewards'; this.modal.hidden = true;
        this.modal.setAttribute('role', 'dialog'); this.modal.setAttribute('aria-modal', 'true');
        this.modal.innerHTML = '<div class="hub-rewards-card"><header><h2></h2><button type="button" class="hub-rewards-close">×</button></header><p class="hub-rewards-time"></p><div class="hub-rewards-list"></div></div>';
        this.modal.querySelector('.hub-rewards-list').innerHTML = REWARDS.map((reward,i)=>`<article class="hub-play-reward"><div class="hub-reward-art">${reward.type==='hand'?`<img src="${escape(this.api.rewardGlovePreview())}" width="84" height="100" alt="SOLAR FORGE">`:glyph(reward.type)}</div><strong class="hub-reward-value">${reward.type==='gold'?reward.amount:reward.type==='hand'?'SOLAR FORGE':'2×'}</strong><small class="hub-reward-duration"></small><button type="button" data-play-reward="${i}"></button></article>`).join('');
        document.body.appendChild(this.modal);
        this.modal.addEventListener('click', event => {
          if (event.target === this.modal || event.target.closest('.hub-rewards-close')) this.close();
          const button = event.target.closest('[data-play-reward]'); if (button) this.claim(Number(button.dataset.playReward));
        });
      }
      this.modal.hidden = false; this.modalHtml = ''; this.renderModal();
      clearInterval(this.modalClock);this.modalClock=setInterval(()=>{if(!document.hidden)this.renderModal();},1000);
      this.modal.querySelector('.hub-rewards-close').focus({ preventScroll: true });
    }
    close() { clearInterval(this.modalClock);this.modalClock=null;if (this.modal) this.modal.hidden = true; this.flush(); this.api.focus?.(); }
    renderModal() {
      const t = this.api.tr;
      this.modal.querySelector('h2').textContent = t('playRewards');
      this.modal.setAttribute('aria-label', t('playRewards'));
      this.modal.querySelector('.hub-rewards-close').setAttribute('aria-label', t('close'));
      this.modal.querySelector('.hub-rewards-time').textContent = clock(Math.floor(this.state.seconds));
      this.modal.querySelector('.hub-rewards-time').title=t('activePlayTime');
      REWARDS.forEach((reward, i) => {
        const done = this.state.claimed[i], ready = this.ready(i);
        const button=this.modal.querySelector(`[data-play-reward="${i}"]`), card=button.closest('article');
        card.classList.toggle('is-claimed',done);card.classList.toggle('is-ready',ready);button.disabled=!ready;
        button.textContent=done?'✓':ready?t('collectReward'):clock(reward.at-this.state.seconds);
        button.setAttribute('aria-label',`${this.label(reward)} · ${done?t('collectedReward'):ready?t('collectReward'):clock(reward.at-this.state.seconds)}`);
        button.title=button.getAttribute('aria-label');card.querySelector('.hub-reward-art').title=this.label(reward);
        card.querySelector('.hub-reward-duration').textContent=reward.seconds?clock(done?this.api.boostRemaining(reward.type):reward.seconds):reward.type==='gold'?t('gold'):'';
      });
    }
    snapshot() { return { seconds: this.state.seconds, claimed: [...this.state.claimed], available: REWARDS.map((_, i) => this.ready(i)), thresholds: REWARDS.map(r => r.at), hat: { ...this.api.getHat?.(), open: this.hatOpen() } }; }
  }
  global.ElementalLobbyRewards = Object.freeze({ create: api => new LobbyRewards(api), normalize, rewards: REWARDS });
})(window);
