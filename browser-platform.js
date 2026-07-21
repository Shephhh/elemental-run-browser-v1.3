(function () {
  'use strict';

  Object.defineProperty(window, 'ELEMENTAL_BROWSER_BUILD', {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
  });

  const config = window.ELEMENTAL_BROWSER_CONFIG || {};
  // Capture a custom bridge only during boot. Assigning a fake provider later
  // from DevTools cannot turn an unfinished ad into a completed reward.
  const customProvider = window.ElementalAdProvider && typeof window.ElementalAdProvider.showRewarded === 'function'
    ? window.ElementalAdProvider
    : null;
  let busy = false;

  function completed(provider) {
    return { status: 'completed', provider };
  }

  function unavailable(provider, error) {
    return { status: 'unavailable', provider, error: error ? String(error.message || error) : '' };
  }

  function normalizeCustomResult(value) {
    if (value === true || value === 'completed' || (value && value.completed === true)) return completed('custom');
    if (value && typeof value.status === 'string') return value;
    return { status: 'skipped', provider: 'custom' };
  }

  function runCrazyGamesAd(onStart) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };
      try {
        window.CrazyGames.SDK.ad.requestAd('rewarded', {
          adStarted: () => onStart(),
          adFinished: () => finish(completed('crazygames')),
          adError: (error, errorData) => finish(unavailable('crazygames', errorData || error))
        });
      } catch (error) {
        finish(unavailable('crazygames', error));
      }
    });
  }

  async function runPokiAd(onStart) {
    try {
      const success = await window.PokiSDK.rewardedBreak({
        size: 'medium',
        onStart
      });
      return success ? completed('poki') : { status: 'skipped', provider: 'poki' };
    } catch (error) {
      return unavailable('poki', error);
    }
  }

  function loadGooglePublisherTag() {
    if (window.googletag && window.googletag.cmd) return Promise.resolve(window.googletag);
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-elemental-gpt]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.googletag), { once: true });
        existing.addEventListener('error', () => reject(new Error('Google Publisher Tag failed to load.')), { once: true });
        return;
      }
      window.googletag = window.googletag || { cmd: [] };
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.elementalGpt = '1';
      script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
      script.addEventListener('load', () => resolve(window.googletag), { once: true });
      script.addEventListener('error', () => reject(new Error('Google Publisher Tag failed to load.')), { once: true });
      document.head.appendChild(script);
    });
  }

  async function runGoogleAdManagerAd(onStart) {
    const unitPath = String(config.googleAdManagerRewardedUnitPath || '').trim();
    if (!unitPath) return unavailable('google-ad-manager');
    try {
      const googletag = await loadGooglePublisherTag();
      return await new Promise((resolve) => {
        let settled = false;
        let granted = false;
        let slot = null;
        let timer = null;
        const finish = (result) => {
          if (settled) return;
          settled = true;
          if (timer) clearTimeout(timer);
          try { if (slot) googletag.destroySlots([slot]); } catch (error) {}
          resolve(result);
        };
        timer = setTimeout(() => finish(unavailable('google-ad-manager', 'Rewarded ad timed out.')), 30000);
        googletag.cmd.push(() => {
          try {
            slot = googletag.defineOutOfPageSlot(unitPath, googletag.enums.OutOfPageFormat.REWARDED);
            if (!slot) {
              finish(unavailable('google-ad-manager', 'Rewarded ads are not supported on this device.'));
              return;
            }
            slot.addService(googletag.pubads());
            googletag.pubads().addEventListener('rewardedSlotReady', (event) => {
              if (event.slot !== slot || settled) return;
              onStart();
              event.makeRewardedVisible();
            });
            googletag.pubads().addEventListener('rewardedSlotGranted', (event) => {
              if (event.slot === slot) granted = true;
            });
            googletag.pubads().addEventListener('rewardedSlotClosed', (event) => {
              if (event.slot !== slot) return;
              finish(granted ? completed('google-ad-manager') : { status: 'skipped', provider: 'google-ad-manager' });
            });
            googletag.pubads().addEventListener('slotRenderEnded', (event) => {
              if (event.slot === slot && event.isEmpty) finish(unavailable('google-ad-manager', 'No ad available.'));
            });
            googletag.enableServices();
            googletag.display(slot);
          } catch (error) {
            finish(unavailable('google-ad-manager', error));
          }
        });
      });
    } catch (error) {
      return unavailable('google-ad-manager', error);
    }
  }

  function canUseDemoAds() {
    if (new URLSearchParams(location.search).get('demoAds') === '1') return true;
    if (config.demoAdsOnLocalhost === false) return false;
    return location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  }

  function runDemoAd(labels, onStart) {
    return new Promise((resolve) => {
      onStart();
      const overlay = document.createElement('div');
      overlay.className = 'browser-demo-ad';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.innerHTML = `
        <div class="browser-demo-ad-card">
          <span class="browser-demo-ad-badge">${labels.demoAd || 'DEMO REWARDED AD'}</span>
          <div class="browser-demo-ad-mark" aria-hidden="true">▶</div>
          <strong>${labels.adPlaying || 'Rewarded ad is playing'}</strong>
          <span class="browser-demo-ad-placement">${labels.placement || ''}</span>
          <div class="browser-demo-ad-progress"><i></i></div>
          <small class="browser-demo-ad-countdown">3</small>
        </div>`;
      document.body.appendChild(overlay);

      const duration = new URLSearchParams(location.search).get('demoAdsFast') === '1' ? 1500 : 3000;
      const startedAt = performance.now();
      const progress = overlay.querySelector('.browser-demo-ad-progress i');
      const countdown = overlay.querySelector('.browser-demo-ad-countdown');
      const tick = () => {
        const elapsed = performance.now() - startedAt;
        const ratio = Math.min(1, elapsed / duration);
        if (progress) progress.style.transform = `scaleX(${ratio})`;
        if (countdown) countdown.textContent = String(Math.max(0, Math.ceil((duration - elapsed) / 1000)));
        if (ratio < 1) {
          requestAnimationFrame(tick);
          return;
        }
        overlay.classList.add('is-complete');
        setTimeout(() => {
          overlay.remove();
          resolve(completed('demo'));
        }, 220);
      };
      requestAnimationFrame(tick);
    });
  }

  async function showRewarded(options) {
    if (busy) return { status: 'busy', provider: 'none' };
    busy = true;
    const request = options || {};
    const onStart = typeof request.onStart === 'function' ? request.onStart : function () {};
    const onFinish = typeof request.onFinish === 'function' ? request.onFinish : function () {};
    let result;
    try {
      if (customProvider) {
        onStart();
        result = normalizeCustomResult(await customProvider.showRewarded({ placement: request.placement }));
      } else if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.ad) {
        result = await runCrazyGamesAd(onStart);
      } else if (window.PokiSDK && typeof window.PokiSDK.rewardedBreak === 'function') {
        result = await runPokiAd(onStart);
      } else if (config.googleAdManagerRewardedUnitPath) {
        result = await runGoogleAdManagerAd(onStart);
      } else if (canUseDemoAds()) {
        result = await runDemoAd(request.labels || {}, onStart);
      } else {
        result = unavailable('none');
      }
    } catch (error) {
      result = unavailable('none', error);
    } finally {
      busy = false;
    }
    try { onFinish(result); } catch (error) {}
    return result;
  }

  const publicAds = Object.freeze({
    showRewarded,
    isBusy: () => busy,
    provider: () => {
      if (customProvider) return 'custom';
      if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.ad) return 'crazygames';
      if (window.PokiSDK && typeof window.PokiSDK.rewardedBreak === 'function') return 'poki';
      if (config.googleAdManagerRewardedUnitPath) return 'google-ad-manager';
      return canUseDemoAds() ? 'demo' : 'none';
    }
  });
  Object.defineProperty(window, 'ElementalBrowserAds', {
    value: publicAds,
    writable: false,
    configurable: false,
    enumerable: false
  });
})();
