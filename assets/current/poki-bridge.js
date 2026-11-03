(function () {
  'use strict';

  const state = {
    initialized: false,
    loading: false,
    loadingFinishedRequested: false,
    loadingReported: false,
    loadingFinishedReported: false,
    playing: false,
    reportedPlaying: false,
    interacted: false,
    adPlaying: false,
    measureQueue: []
  };

  const MAX_MEASURE_QUEUE = 96;
  let lastServiceError = null;
  function observeSdkResult(result, method) {
    // Observe returned promise failures without replaying SDK lifecycle calls.
    // Fire-and-forget requests internal to the SDK cannot be caught here.
    if (result && typeof result.then === 'function') Promise.resolve(result).catch(error => {
      lastServiceError = {method, name:String(error?.name || 'Error'), message:String(error?.message || error).slice(0,500)};
      console.warn('[Poki service] ' + JSON.stringify(lastServiceError));
    });
  }
  let gameplayResolver = null, pageHidden = false, pageExitSent = false;
  let reportedAt = performance.now(), reportedActiveSeconds = 0;
  const session = window.ElementalPlaySession.create({ measure: (a, b, c) => {
    measure(a, b, c);
    if (a === 'session-v2' && b === 'active-play') measure('sdk-clock', c, Math.floor(reportedActiveSeconds) + 's');
  } });

  function cleanMeasurePart(value, fallback) {
    const safe = String(value == null ? '' : value)
      .trim()
      .replace(/[\/^]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9_.-]/g, '')
      .slice(0, 64);
    return safe || fallback;
  }

  function sendMeasure(category, what, action) {
    const api = sdk();
    if (!state.initialized || !api || typeof api.measure !== 'function') return false;
    try {
      observeSdkResult(api.measure(category, what, action), 'measure');
      return true;
    } catch (error) {
      console.warn('[Poki] measure', error);
      return false;
    }
  }

  function flushMeasureQueue() {
    if (!state.initialized || !state.measureQueue.length) return;
    const queued = state.measureQueue.splice(0, state.measureQueue.length);
    queued.forEach((event) => sendMeasure(event.category, event.what, event.action));
  }

  function domReady() {
    if (document.body) return Promise.resolve();
    return new Promise((resolve) => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
  }

  function sdk() {
    return window.PokiSDK || null;
  }

  function call(method, ...args) {
    const api = sdk();
    if (!state.initialized || !api || typeof api[method] !== 'function') return false;
    try { observeSdkResult(api[method](...args), method); return true; } catch (error) { console.warn('[Poki]', method, error); return false; }
  }

  function waitForSdk() {
    const existing = sdk();
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve) => {
      const script = document.getElementById('poki-sdk-script');
      if (!script) { resolve(null); return; }
      // The game has its own bounded `ready` gate below. Keep the SDK bootstrap
      // alive after that gate so a slow Poki CDN does not permanently lose the
      // pending loading/gameplay events.
      script.addEventListener('load', () => resolve(sdk()), { once: true });
      script.addEventListener('error', () => resolve(null), { once: true });
    });
  }

  function syncGameplayState() {
    const now = performance.now();
    if (state.reportedPlaying) reportedActiveSeconds += Math.max(0, (now - reportedAt) / 1000);
    reportedAt = now;
    let current = gameplayResolver ? gameplayResolver() : { active: state.playing, mode: 'boot', reason: 'legacy' };
    const visible = !pageHidden && !document.hidden;
    let active = !!current.active, reason = current.reason;
    if (!state.loadingFinishedRequested || !state.interacted) { active = false; reason = 'play-gate'; }
    else if (!visible) { active = false; reason = 'hidden'; }
    else if (state.adPlaying) { active = false; reason = 'ad'; }
    else if (active && document.hasFocus && !document.hasFocus()) { active = false; reason = 'no-focus'; }
    session.sample({ ...current, active, reason, visible, ready: state.loadingFinishedRequested });
    if (!state.initialized || state.reportedPlaying === active) return;
    if (call(active ? 'gameplayStart' : 'gameplayStop')) state.reportedPlaying = active;
  }

  function syncLoadingState() {
    if (!state.initialized) return;
    if (!state.loadingReported) {
      call('gameLoadingStart');
      state.loadingReported = true;
      state.loading = true;
    }
    if (state.loadingFinishedRequested && !state.loadingFinishedReported) {
      call('gameLoadingFinished');
      state.loadingFinishedReported = true;
      state.loading = false;
    }
  }

  function measure(category, what, action) {
    const event = { category: cleanMeasurePart(category, 'game'), what: cleanMeasurePart(what, 'unknown'), action: cleanMeasurePart(action, 'event') };
    let values = 0;
    const digits = ['zero','one','two','three','four','five','six','seven','eight','nine'];
    for (const key of ['category', 'what', 'action']) event[key] = event[key].replace(/\d+(?:\.\d+)?/g, value => ++values <= 2
      ? value : value.split('').map(char => digits[Number(char)] || 'dot').join('_')).slice(0, 64);
    if (sendMeasure(event.category, event.what, event.action)) return true;
    state.measureQueue.push(event);
    if (state.measureQueue.length > MAX_MEASURE_QUEUE) state.measureQueue.shift();
    return false;
  }

  // Independent heartbeat also runs on a low-FPS game; visibility events settle
  // the previous interval immediately so background time cannot leak on resume.
  document.addEventListener('visibilitychange', syncGameplayState);
  window.addEventListener('blur', syncGameplayState);
  window.addEventListener('focus', syncGameplayState);
  window.addEventListener('pagehide', () => {
    const leaving = gameplayResolver?.() || session.snapshot();
    pageHidden = true; syncGameplayState();
    if (!pageExitSent) {
      pageExitSent = true;
      const data = session.snapshot();
      measure('session-exit-v2', leaving.mode, leaving.reason);
      measure('duration-v2', 'active-play', Math.floor(data.activeSeconds) + 's');
      measure('duration-v2', 'ready-visible', Math.floor(data.readyVisibleSeconds) + 's');
    }
  });
  window.addEventListener('pageshow', () => { pageHidden = false; pageExitSent = false; syncGameplayState(); });
  setInterval(syncGameplayState, 250);

  const bootstrap = (async () => {
    await domReady();
    const api = await waitForSdk();
    if (!api || typeof api.init !== 'function') return state;
    try {
      // `ready` below releases game startup after 6.2 seconds. Awaiting a late
      // SDK init here does not block gameplay and still flushes its saved state.
      await api.init();
      state.initialized = true;
      measure('telemetry', 'session-clock', 'version-2');
      syncLoadingState();
      syncGameplayState();
      flushMeasureQueue();
    } catch (error) {
      // A local/offline preview must still be playable; Poki services simply
      // remain unavailable until the build runs in Poki's player.
      console.warn('[Poki] SDK initialization failed; continuing without platform services.', error);
    }
    return state;
  })();
  // Never make the game wait for an external SDK request. `bootstrap` keeps
  // running in the background and synchronizes lifecycle state if it succeeds.
  const ready = Promise.race([
    bootstrap,
    new Promise((resolve) => setTimeout(() => resolve(state), 6200))
  ]);

  window.ElementalPoki = Object.freeze({
    ready,
    isActive: () => state.initialized,
    setGameplayResolver: resolver => { gameplayResolver = resolver; syncGameplayState(); },
    refreshGameplayState: syncGameplayState,
    getActiveSeconds: () => session.activeSeconds(),
    getAttemptSeconds: () => session.attemptSeconds(),
    sessionSnapshot: () => ({ ...session.snapshot(), sdkActiveSeconds: reportedActiveSeconds,
      sdkGapSeconds: Math.max(0, session.activeSeconds() - reportedActiveSeconds),
      initialized: state.initialized, reportedPlaying: state.reportedPlaying, interacted: state.interacted, lastServiceError }),
    confirmPlayInteraction: (event) => {
      // Only an actual ready-screen PLAY click unlocks first gameplay.
      if (!state.loadingFinishedRequested || !event?.isTrusted || event.type !== 'click') return false;
      if (!event.target?.closest?.('#boot-play-btn')) return false;
      state.interacted = true;
      state.playing = false;
      return true;
    },
    gameplayStart: () => {
      state.playing = true;
      syncGameplayState();
    },
    gameplayStop: () => {
      state.playing = false;
      syncGameplayState();
    },
    measure,
    loadingStop: () => {
      state.loadingFinishedRequested = true;
      syncLoadingState();
    },
    commercialBreak: async (onStart) => {
      await ready;
      const api = sdk();
      if (!state.initialized || !api || typeof api.commercialBreak !== 'function' || state.adPlaying) return false;
      state.adPlaying = true;
      syncGameplayState();
      try {
        await api.commercialBreak(() => {
          try { if (typeof onStart === 'function') onStart(); } catch (error) {}
        });
        return true;
      } catch (error) {
        console.warn('[Poki] commercialBreak', error);
        return false;
      } finally {
        state.adPlaying = false;
        syncGameplayState();
      }
    },
    rewardedBreak: async (options) => {
      await ready;
      const api = sdk();
      if (!state.initialized || !api || typeof api.rewardedBreak !== 'function' || state.adPlaying) return false;
      const request = typeof options === 'function' ? { onStart: options } : (options || {});
      state.adPlaying = true;
      syncGameplayState();
      try {
        const onStartCallback = () => {
          try { if (typeof request.onStart === 'function') request.onStart(); } catch (error) {}
        };
        const result = await api.rewardedBreak(onStartCallback);
        return !!result;
      } catch (error) {
        console.warn('[Poki] rewardedBreak', error);
        return false;
      } finally {
        state.adPlaying = false;
        syncGameplayState();
      }
    },
    isAdPlaying: () => state.adPlaying,
    clearContext: () => {},
    setContext: () => {},
    reportCompletion: () => {},
    getSystemInfo: () => null,
    isMuted: () => false
  });
})();
