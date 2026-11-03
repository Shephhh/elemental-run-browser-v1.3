(function (global) {
  'use strict';
  // Analytics clock, deliberately independent of simulation dt, time slow and FPS.
  // No identifiers/storage/network: the existing platform measure() owns delivery.
  function create(options = {}) {
    const now = options.now || (() => performance.now());
    const emit = options.measure || (() => {});
    const thresholds = [60, 120, 180, 300, 420, 600];
    let at = now(), activeSeconds = 0, readyVisibleSeconds = 0, attemptSeconds = 0, lastActiveMode = '';
    let state = { active: false, visible: false, ready: false, mode: 'boot', reason: 'loading', attempt: 0 };
    const byMode = Object.create(null), reached = new Set(), transitions = [];
    function settle() {
      const next = now(), seconds = Math.max(0, (next - at) / 1000);
      at = next;
      if (state.ready && state.visible) readyVisibleSeconds += seconds;
      if (state.active) {
        activeSeconds += seconds;
        byMode[state.mode] = (byMode[state.mode] || 0) + seconds;
        if (state.attempt) attemptSeconds += seconds;
      }
    }
    function milestones() {
      const check = (key, seconds, category, what) => {
        for (const threshold of thresholds) {
          const id = key + ':' + threshold;
          if (seconds + 1e-7 >= threshold && !reached.has(id)) {
            reached.add(id); emit(category, what, 'reached-' + threshold + 's');
          }
        }
      };
      check('active', activeSeconds, 'session-v2', 'active-play');
      // Diagnostic only. Menus/preparation are NEVER sent as SDK gameplay.
      check('visible', readyVisibleSeconds, 'session-v2', 'ready-visible');
      for (const mode of Object.keys(byMode)) check(mode, byMode[mode], 'mode-time', mode);
    }
    function sample(next) {
      settle();
      const mode = next.mode || 'boot', reason = next.reason || (next.active ? 'playing' : 'idle');
      const active = !!next.active, attempt = next.attempt || 0;
      const changed = mode !== state.mode || active !== state.active || reason !== state.reason;
      if (changed) {
        if (state.active && (!active || mode !== state.mode)) emit('lifecycle-v2', state.mode, 'stop-' + reason);
        if (active && mode !== lastActiveMode) { emit('mode-v2', mode, 'enter'); lastActiveMode = mode; }
        if (active && (!state.active || mode !== state.mode)) emit('lifecycle-v2', mode, 'start');
        transitions.push({ atMs: Math.round(at), mode, active, reason });
        if (transitions.length > 96) transitions.shift();
      }
      if (attempt !== state.attempt) attemptSeconds = 0;
      state = { active, mode, reason, attempt, visible: !!next.visible, ready: !!next.ready };
      milestones();
      return active;
    }
    return Object.freeze({
      sample,
      activeSeconds: () => activeSeconds,
      attemptSeconds: () => attemptSeconds,
      snapshot: () => ({ schema: 2, ...state, activeSeconds, readyVisibleSeconds, attemptSeconds,
        byMode: { ...byMode }, transitions: transitions.map(entry => ({ ...entry })) })
    });
  }
  global.ElementalPlaySession = Object.freeze({ create });
})(window);
