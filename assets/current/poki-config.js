(function () {
  'use strict';
  // One distribution now serves both the public website and Poki. Poki is
  // enabled only when the game is actually hosted by Poki (or explicitly
  // requested for local SDK QA); a normal website must not download or expose
  // portal-only monetization.
  const params = new URLSearchParams(window.location.search);
  const forcedPlatform = String(params.get('platform') || '').toLowerCase();
  const forceBrowser = forcedPlatform === 'browser' || forcedPlatform === 'web';
  const forcePoki = forcedPlatform === 'poki' || params.get('poki') === '1';

  function isPokiOrigin(value) {
    try {
      const hostname = new URL(String(value || ''), window.location.href).hostname.toLowerCase();
      return hostname === 'poki.com'
        || hostname.endsWith('.poki.com')
        || hostname === 'poki.dev'
        || hostname.endsWith('.poki.dev');
    } catch (error) {
      return false;
    }
  }

  const ancestorOrigins = window.location.ancestorOrigins
    ? Array.from(window.location.ancestorOrigins)
    : [];
  const hostedByPoki = isPokiOrigin(window.location.href)
    || isPokiOrigin(document.referrer)
    || ancestorOrigins.some(isPokiOrigin);
  const pokiBuild = !forceBrowser && (forcePoki || hostedByPoki);

  Object.defineProperty(window, 'ELEMENTAL_POKI_BUILD', {
    value: pokiBuild,
    writable: false,
    configurable: false,
    enumerable: false
  });
  Object.defineProperty(window, 'ELEMENTAL_BROWSER_CONFIG', {
    value: Object.freeze({
      // Portal ads are never advertised on the standalone website.
      pokiRewardedAdsEnabled: pokiBuild,
      rewardedUpgradeOffersPerDayMin: 1,
      rewardedUpgradeOffersPerDayMax: 2,
      rewardBoostMinutes: 15,
      tutorialEnabled: true
    }),
    writable: false,
    configurable: false,
    enumerable: false
  });
})();
