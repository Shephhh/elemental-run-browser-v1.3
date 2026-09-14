(function () {
  'use strict';

  const state = {
    initialized: false,
    loading: false,
    loadingFinishedRequested: false,
    playing: false,
    reportedPlaying: false,
    adPlaying: false,
    measureQueue: []
  };

  const MAX_MEASURE_QUEUE = 96;

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
      api.measure(category, what, action);
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
    if (!state.initialized || !api || typeof api[method] !== 'function') return;
    try { api[method](...args); } catch (error) { console.warn('[Poki]', method, error); }
  }

  function waitForSdk(timeoutMs = 6000) {
    const existing = sdk();
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve) => {
      const script = document.getElementById('poki-sdk-script');
      let done = false;
      const finish = (api) => {
        if (done) return;
        done = true;
        if (script) script.removeEventListener('load', onLoad);
        clearTimeout(timeoutId);
        resolve(api || null);
      };
      const onLoad = () => finish(sdk());
      if (script) script.addEventListener('load', onLoad, { once: true });
      const timeoutId = setTimeout(() => finish(sdk()), timeoutMs);
    });
  }

  function syncGameplayState() {
    if (!state.initialized || state.adPlaying || state.reportedPlaying === state.playing) return;
    call(state.playing ? 'gameplayStart' : 'gameplayStop');
    state.reportedPlaying = state.playing;
  }

  function syncLoadingState() {
    if (!state.initialized) return;
    if (!state.loading) {
      call('gameLoadingStart');
      state.loading = true;
    }
    if (state.loadingFinishedRequested && state.loading) {
      call('gameLoadingFinished');
      state.loading = false;
    }
  }

  const bootstrap = (async () => {
    await domReady();
    const api = await waitForSdk();
    if (!api || typeof api.init !== 'function') return state;
    try {
      await Promise.race([
        api.init(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Poki SDK initialization timed out.')), 6000))
      ]);
      state.initialized = true;
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
    gameplayStart: () => {
      state.playing = true;
      syncGameplayState();
    },
    gameplayStop: () => {
      state.playing = false;
      syncGameplayState();
    },
    measure: (category, what, action) => {
      const event = {
        category: cleanMeasurePart(category, 'game'),
        what: cleanMeasurePart(what, 'unknown'),
        action: cleanMeasurePart(action, 'event')
      };
      if (sendMeasure(event.category, event.what, event.action)) return true;
      // Loading/tutorial events can happen before the async Poki init settles.
      // Keep a small bounded queue so the useful funnel is not silently lost.
      state.measureQueue.push(event);
      if (state.measureQueue.length > MAX_MEASURE_QUEUE) state.measureQueue.shift();
      return false;
    },
    loadingStop: () => {
      state.loadingFinishedRequested = true;
      syncLoadingState();
    },
    commercialBreak: async (onStart) => {
      await ready;
      const api = sdk();
      if (!state.initialized || !api || typeof api.commercialBreak !== 'function' || state.adPlaying) return false;
      state.adPlaying = true;
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
