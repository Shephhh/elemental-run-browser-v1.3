(function () {
  'use strict';

  // Presentation + a bounded run ledger. World coordinates/physics stay in the
  // runtime. No second RAF, renderer, timers or reward grants live here.
  class CampaignRun {
    constructor(api) {
      this.api = api;
      this.active = false;
      this.records = [];
      this.elapsed = 0;
      this.rewardGold = 0;
      this.toastRemaining = 0;
      this.toastExitRemaining = 0;
      this.toast = document.createElement('aside');
      this.toast.id = 'campaign-finish-toast';
      this.toast.hidden = true;
      this.toast.setAttribute('role', 'status');
      this.toast.setAttribute('aria-live', 'polite');
      this.toast.innerHTML = '<span class="campaign-check" aria-hidden="true">✓</span><div><strong class="campaign-toast-title"></strong><div class="campaign-toast-meta"><span class="campaign-toast-gold"></span><span class="campaign-toast-time"></span><span class="campaign-toast-medal"></span></div><small class="campaign-toast-next"></small></div>';
      document.body.appendChild(this.toast);
      this.goldNode = this.toast.querySelector('.campaign-toast-gold');
      this.goldNode.setAttribute('aria-live', 'off');
      this.summary = document.createElement('section');
      this.summary.id = 'campaign-death-summary';
      this.summary.hidden = true;
      const gameOver = document.getElementById('game-over');
      gameOver?.insertBefore(this.summary, gameOver.querySelector('.gameover-actions'));
    }

    begin(level) {
      this.active = true;
      this.startLevel = level;
      this.records.length = 0;
      this.elapsed = 0;
      this.rewardGold = 0;
      this.hideToast();
      this.summary.hidden = true;
      document.body.classList.add('campaign-continuous');
    }

    clear() {
      this.active = false;
      this.hideToast();
      this.summary.hidden = true;
      document.body.classList.remove('campaign-continuous');
    }

    complete(result) {
      if (!this.active || this.records.some(record => record.level === result.level.number)) return false;
      const record = { level: result.level.number, medal: result.medal, seconds: result.elapsed,
        coins: Math.max(0, Math.floor(result.coins)), reward: Math.max(0, Math.floor(result.reward)) };
      this.records.push(record);
      this.rewardGold += record.reward;
      const tr = this.api.tr;
      this.toast.querySelector('.campaign-toast-title').textContent = `${tr('level')} ${record.level}`;
      this.goldNode.textContent = '+0 ◈';
      this.toastGold = record.coins + record.reward;
      this.toastGoldLast = 0;
      this.toast.querySelector('.campaign-toast-time').textContent = `${record.seconds.toFixed(1)} s`;
      const medal = this.toast.querySelector('.campaign-toast-medal');
      medal.textContent = this.medalLabel(record.medal);
      medal.className = `campaign-toast-medal is-${record.medal}`;
      this.toast.querySelector('.campaign-toast-next').textContent = record.level < 120
        ? `${tr('level')} ${record.level + 1} →` : tr('hubEndless');
      this.toast.hidden = false;
      this.toast.classList.remove('is-entering','is-leaving');
      void this.toast.offsetWidth;
      this.toast.classList.add('is-entering');
      this.toastRemaining = 3.4;
      this.toastExitRemaining = 0;
      return true;
    }

    medalLabel(medal) {
      return this.api.tr({gold:'gold',silver:'hubSilver',bronze:'hubBronze',none:'campaignFinished'}[medal] || 'campaignFinished');
    }

    tick(delta, playing) {
      this.toast.style.animationPlayState = playing ? 'running' : 'paused';
      if (!this.active || !playing) return;
      const dt = Math.min(.05, Math.max(0, delta));
      this.elapsed += dt;
      if (this.toastRemaining > 0) {
        this.toastRemaining -= dt;
        const age = 3.4 - this.toastRemaining;
        const progress = Math.min(1, age / .65);
        const gold = Math.round(this.toastGold * (1 - (1 - progress) ** 3));
        if (gold !== this.toastGoldLast) {
          this.goldNode.textContent = `+${gold} ◈`;
          this.toastGoldLast = gold;
        }
        if (this.toastRemaining <= 0) {
          this.toast.classList.remove('is-entering');
          this.toast.classList.add('is-leaving');
          this.toastExitRemaining = .38;
        }
      } else if (this.toastExitRemaining > 0) {
        this.toastExitRemaining -= dt;
        if (this.toastExitRemaining <= 0) this.hideToast();
      }
    }

    hideToast() {
      this.toastRemaining = 0; this.toastExitRemaining = 0;
      this.toast.hidden = true; this.toast.classList.remove('is-entering','is-leaving');
    }

    showDeath(currentLevel, coins, container) {
      if (!this.active) { this.summary.hidden = true; return; }
      this.hideToast();
      if (container) container.querySelector('.level-complete-actions')?.before(this.summary);
      const tr = this.api.tr;
      this.summary.replaceChildren();
      const list = document.createElement('div');
      list.className = 'campaign-summary-list';
      // Long runs stay scrollable rather than making the death actions unreachable.
      for (const record of this.records) {
        const row = document.createElement('div');
        row.className = `campaign-summary-tile is-${record.medal}`;
        row.setAttribute('aria-label', `${tr('level')} ${record.level}, ${this.medalLabel(record.medal)}, ${record.seconds.toFixed(1)} s`);
        const label = document.createElement('strong');
        label.textContent = `${tr('level')} ${record.level}`;
        const medal = document.createElement('span');
        medal.className = 'campaign-tile-medal';
        medal.setAttribute('title', this.medalLabel(record.medal));
        medal.innerHTML = record.medal === 'none' ? '<span aria-hidden="true">✓</span>'
          : '<svg viewBox="0 0 32 36" aria-hidden="true"><path d="M7 1h7l3 13-7 4zM25 1h-7l-3 13 7 4z" fill="currentColor" opacity=".65"/><circle cx="16" cy="23" r="11" fill="currentColor"/><circle cx="16" cy="23" r="7.5" fill="none" stroke="#17212a" stroke-width="1.5"/><path d="m16 17 1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#17212a"/></svg>';
        const time = document.createElement('span');
        time.className = 'campaign-tile-time';
        time.textContent = `${record.seconds.toFixed(1)} s`;
        row.append(label, medal, time);
        list.appendChild(row);
      }
      // First failures need one actionable control cue, not a generic finish
      // instruction. Keep the completed-level tiles unchanged on longer runs.
      if (!this.records.length) list.textContent = container?.querySelector('.level-failure-hint')?.textContent || tr('campaignKeepGoing');
      this.summary.append(list);
      this.summary.hidden = false;
    }

    snapshot() {
      return { active: this.active, startLevel: this.startLevel || 0, elapsed: +this.elapsed.toFixed(2),
        rewardGold: this.rewardGold, completed: this.records.map(record => ({...record})), toastVisible: !this.toast.hidden };
    }
  }
  window.ElementalCampaignRun = Object.freeze({create: api => new CampaignRun(api)});
})();
